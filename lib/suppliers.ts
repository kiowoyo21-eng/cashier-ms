import type {BranchId,Database,FundEntry} from './data';
import {uid,log} from './data';

export type SupplierEntity='UC'|'MM';
export const supplierEntity=(branch:BranchId):SupplierEntity=>branch==='MMM'?'MM':'UC';
export interface SupplierRecord {
 id:string;name:string;contactPerson:string;phone:string;email:string;tin:string;address:string;notes:string;
 branches:BranchId[];openingPayable:{UC:number;MM:number};openingDate:{UC:string;MM:string};
 createdAt:string;createdBy:string;updatedAt?:string;updatedBy?:string;inactive?:boolean;
}
export interface SupplierProduct {
 id:string;supplierId:string;name:string;unit:string;createdAt:string;createdBy:string;
}
/** Actual supplier purchase prices and manually recorded reference prices. No inventory or AP posting. */
export interface SupplierPriceEvent {
 id:string;supplierId:string;productId:string;kind:'Purchase'|'Manual Price';unitCost:number;
 date:string;quantity?:number;branch?:BranchId;sourceFundEntryId?:string;sourceNo?:string;
 createdAt:string;createdBy:string;
}
export interface SupplierOpeningHistory {
 id:string;supplierId:string;entity:SupplierEntity;previous:number;next:number;asOf:string;reason:string;by:string;at:string;
}
export const supplierKey=(name:string)=>name.normalize('NFKC').trim().replace(/\s+/g,' ').toLocaleLowerCase('en-US');
const productKey=supplierKey;
const toMoney=(value:number)=>Math.round(value*100)/100;
const validMoney=(value:number)=>Number.isFinite(value)&&value>=0&&Math.abs(Math.round(value*100)-value*100)<1e-7;
export function ensureSupplierCollections(db:Database):Database{
 return {...db,suppliers:db.suppliers||[],supplierProducts:db.supplierProducts||[],supplierPriceEvents:db.supplierPriceEvents||[],supplierOpeningHistory:db.supplierOpeningHistory||[]};
}
export function createSupplier(db:Database,name:string,by:string):Database{
 const next=ensureSupplierCollections(db);const clean=name.trim().replace(/\s+/g,' ');
 if(clean.length<2)throw new Error('Supplier name must have at least two characters.');
 if(next.suppliers!.some(s=>supplierKey(s.name)===supplierKey(clean)))throw new Error('Supplier already exists. Open it from the list.');
 const supplier:SupplierRecord={id:uid(),name:clean,contactPerson:'',phone:'',email:'',tin:'',address:'',notes:'',branches:[],openingPayable:{UC:0,MM:0},openingDate:{UC:'',MM:''},createdAt:new Date().toISOString(),createdBy:by};
 return log({...next,suppliers:[...next.suppliers!,supplier]},by,'Supplier created',`${supplier.name} · ${supplier.id}`);
}
export function editSupplier(db:Database,id:string,changes:Partial<Pick<SupplierRecord,'name'|'contactPerson'|'phone'|'email'|'tin'|'address'|'notes'|'branches'>>,by:string):Database{
 const next=ensureSupplierCollections(db),supplier=next.suppliers!.find(s=>s.id===id);if(!supplier)throw new Error('Supplier not found.');
 const name=(changes.name??supplier.name).trim().replace(/\s+/g,' ');if(name.length<2)throw new Error('Supplier name is required.');
 if(next.suppliers!.some(s=>s.id!==id&&supplierKey(s.name)===supplierKey(name)))throw new Error('Supplier name already belongs to another supplier.');
 const updated={...supplier,...changes,name,branches:Array.from(new Set(changes.branches??supplier.branches)),updatedAt:new Date().toISOString(),updatedBy:by};
 return log({...next,suppliers:next.suppliers!.map(s=>s.id===id?updated:s)},by,'Supplier updated',`${supplier.id} · ${name}`);
}
export function setSupplierOpening(db:Database,id:string,entity:SupplierEntity,amount:number,asOf:string,reason:string,by:string):Database{
 const next=ensureSupplierCollections(db),s=next.suppliers!.find(x=>x.id===id);if(!s)throw new Error('Supplier not found.');
 if(!validMoney(amount))throw new Error('Opening payable must be a valid nonnegative amount with up to two decimals.');
 if(!/^\d{4}-\d{2}-\d{2}$/.test(asOf))throw new Error('Choose an opening balance as-of date.');
 if(!reason.trim())throw new Error('Enter a reason or source for the opening balance.');
 const history:SupplierOpeningHistory={id:uid(),supplierId:id,entity,previous:s.openingPayable?.[entity]||0,next:amount,asOf,reason:reason.trim(),by,at:new Date().toISOString()};
 const updated={...s,openingPayable:{UC:s.openingPayable?.UC||0,MM:s.openingPayable?.MM||0,[entity]:amount},openingDate:{UC:s.openingDate?.UC||'',MM:s.openingDate?.MM||'',[entity]:asOf},updatedAt:history.at,updatedBy:by};
 return log({...next,suppliers:next.suppliers!.map(x=>x.id===id?updated:x),supplierOpeningHistory:[history,...next.supplierOpeningHistory!]},by,'Supplier opening payable set',`${s.name} · ${entity} · ${amount} · ${asOf} · ${reason.trim()}`);
}
export function addSupplierProductPrice(db:Database,supplierId:string,name:string,unit:string,cost:number,by:string,date:string):Database{
 const next=ensureSupplierCollections(db),supplier=next.suppliers!.find(s=>s.id===supplierId);
 if(!supplier)throw new Error('Supplier not found.');if(name.trim().length<2)throw new Error('Enter a product name.');
 if(!validMoney(cost)||cost<=0)throw new Error('Price must be greater than zero, with at most two decimals.');
 if(!/^\d{4}-\d{2}-\d{2}$/.test(date))throw new Error('Choose a valid date.');
 const clean=name.trim().replace(/\s+/g,' ');
 let product=next.supplierProducts!.find(p=>p.supplierId===supplierId&&productKey(p.name)===productKey(clean));
 const products=[...next.supplierProducts!];const at=new Date().toISOString();
 if(!product){product={id:uid(),supplierId,name:clean,unit:unit.trim()||'Piece',createdAt:at,createdBy:by};products.push(product);}
 const event:SupplierPriceEvent={id:uid(),supplierId,productId:product.id,kind:'Manual Price',unitCost:cost,date,createdAt:at,createdBy:by};
 return log({...next,supplierProducts:products,supplierPriceEvents:[...next.supplierPriceEvents!,event]},by,'Supplier product price recorded',`${supplier.name} · ${clean} · ${cost}`);
}
/** Backfill existing PB purchase data, preserving original RFP entries and avoiding duplicate ledger links. */
export function syncSupplierPurchases(db:Database):Database{
 const base=ensureSupplierCollections(db);
 const suppliers=[...base.suppliers!],products=[...base.supplierProducts!],events=[...base.supplierPriceEvents!];
 const entries=[...base.fundEntries];let changed=false;
 for(let i=0;i<entries.length;i++){
  const e=entries[i];if(e.kind!=='expense'||e.fund!=='RFP'||e.status==='Rejected'||!e.payee.trim()||!e.description.trim())continue;
  let supplier=suppliers.find(s=>s.id===e.supplierId)||suppliers.find(s=>supplierKey(s.name)===supplierKey(e.payee));
  if(!supplier){supplier={id:uid(),name:e.payee.trim().replace(/\s+/g,' '),contactPerson:'',phone:'',email:'',tin:'',address:'',notes:'',branches:[e.branch],openingPayable:{UC:0,MM:0},openingDate:{UC:'',MM:''},createdAt:e.createdAt,createdBy:e.createdBy};suppliers.push(supplier);changed=true;}
  if(!supplier.branches.includes(e.branch)&&!events.some(p=>p.sourceFundEntryId===e.id)){const nextS={...supplier,branches:[...supplier.branches,e.branch]};suppliers[suppliers.findIndex(s=>s.id===supplier!.id)]=nextS;supplier=nextS;changed=true;}
  let product=products.find(p=>p.id===e.supplierProductId&&p.supplierId===supplier!.id)||products.find(p=>p.supplierId===supplier!.id&&productKey(p.name)===productKey(e.description));
  if(!product){product={id:uid(),supplierId:supplier.id,name:e.description.trim().replace(/\s+/g,' '),unit:'Piece',createdAt:e.createdAt,createdBy:e.createdBy};products.push(product);changed=true;}
  if(e.supplierId!==supplier.id||e.supplierProductId!==product.id){entries[i]={...e,supplierId:supplier.id,supplierProductId:product.id};changed=true;}
  if(!events.some(p=>p.sourceFundEntryId===e.id)){
   const quantity=e.quantity&&e.quantity>0?e.quantity:1;
   const unitCost=e.unitCost&&e.unitCost>0?e.unitCost:e.amount/quantity;
   if(Number.isFinite(unitCost)&&unitCost>0){events.push({id:uid(),supplierId:supplier.id,productId:product.id,kind:'Purchase',unitCost:toMoney(unitCost),quantity,branch:e.branch,sourceFundEntryId:e.id,sourceNo:e.no,date:e.date,createdAt:e.createdAt,createdBy:e.createdBy});changed=true;}
  }
 }
 return changed?{...base,suppliers,supplierProducts:products,supplierPriceEvents:events,fundEntries:entries}:base;
}
/** A supplier product is a catalogue entry, not a stock quantity. */
export function latestSupplierPrice(db:Database,productId:string):SupplierPriceEvent|undefined{
 return (db.supplierPriceEvents||[]).filter(e=>e.productId===productId&&(!e.sourceFundEntryId||db.fundEntries.some(f=>f.id===e.sourceFundEntryId&&f.status!=='Rejected'))).sort((a,b)=>b.date.localeCompare(a.date)||b.createdAt.localeCompare(a.createdAt))[0];
}
export function supplierPurchases(db:Database,supplierId:string):FundEntry[]{
 return db.fundEntries.filter(e=>e.fund==='RFP'&&e.kind==='expense'&&e.status!=='Rejected'&&(e.supplierId===supplierId||(!e.supplierId&&supplierKey(e.payee)===supplierKey((db.suppliers||[]).find(s=>s.id===supplierId)?.name||'')))).sort((a,b)=>b.date.localeCompare(a.date));
}
