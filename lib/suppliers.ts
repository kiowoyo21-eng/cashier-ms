import type {BranchId,Database,FundEntry} from './data';
import {uid,log} from './data';

export type SupplierEntity='UC'|'MM';
/** A catalogue-only supplier has no payable fields in the normal UI. */
export type SupplierMode='ledger'|'opening_payable';
export const supplierModeLabel=(mode:SupplierMode)=>mode==='opening_payable'?'With Opening Payable':'Ledger Only';
/** Preserve older nonzero payable records; missing mode on zero-balance suppliers means Ledger Only. */
export function effectiveSupplierMode(s:SupplierRecord):SupplierMode {
 if(s.mode==='ledger'||s.mode==='opening_payable')return s.mode;
 return (s.openingPayable?.UC||0)>0||(s.openingPayable?.MM||0)>0?'opening_payable':'ledger';
}

export const supplierEntity=(branch:BranchId):SupplierEntity=>branch==='MMM'?'MM':'UC';
export interface SupplierRecord {
 id:string;name:string;contactPerson:string;phone:string;email:string;tin:string;address:string;notes:string;
 branches:BranchId[];mode?:SupplierMode;openingPayable:{UC:number;MM:number};openingDate:{UC:string;MM:string};
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
export function createSupplier(db:Database,name:string,by:string,mode:SupplierMode='ledger'):Database{
 const next=ensureSupplierCollections(db);const clean=name.trim().replace(/\s+/g,' ');
 if(clean.length<2)throw new Error('Supplier name must have at least two characters.');
 if(mode!=='ledger'&&mode!=='opening_payable')throw new Error('Invalid supplier type.');
 if(next.suppliers!.some(s=>supplierKey(s.name)===supplierKey(clean)))throw new Error('Supplier already exists. Open it from the list.');
 const supplier:SupplierRecord={id:uid(),name:clean,contactPerson:'',phone:'',email:'',tin:'',address:'',notes:'',branches:[],mode,openingPayable:{UC:0,MM:0},openingDate:{UC:'',MM:''},createdAt:new Date().toISOString(),createdBy:by};
 return log({...next,suppliers:[...next.suppliers!,supplier]},by,'Supplier created',`${supplier.name} · ${supplier.id}`);
}
export function editSupplier(db:Database,id:string,changes:Partial<Pick<SupplierRecord,'name'|'contactPerson'|'phone'|'email'|'tin'|'address'|'notes'|'branches'>>,by:string):Database{
 const next=ensureSupplierCollections(db),supplier=next.suppliers!.find(s=>s.id===id);if(!supplier)throw new Error('Supplier not found.');
 const name=(changes.name??supplier.name).trim().replace(/\s+/g,' ');if(name.length<2)throw new Error('Supplier name is required.');
 if(next.suppliers!.some(s=>s.id!==id&&supplierKey(s.name)===supplierKey(name)))throw new Error('Supplier name already belongs to another supplier.');
 const updated={...supplier,...changes,name,branches:Array.from(new Set(changes.branches??supplier.branches)),updatedAt:new Date().toISOString(),updatedBy:by};
 return log({...next,suppliers:next.suppliers!.map(s=>s.id===id?updated:s)},by,'Supplier updated',`${supplier.id} · ${name}`);
}
/** Changing type never silently writes off an existing supplier opening payable. */
export function setSupplierMode(db:Database,id:string,mode:SupplierMode,by:string):Database{
 const admin=db.users.find(u=>u.id===by&&u.active&&u.role==='admin');
 if(!admin)throw new Error('Only Admin can change supplier type.');
 if(mode!=='ledger'&&mode!=='opening_payable')throw new Error('Invalid supplier type.');
 const next=ensureSupplierCollections(db),supplier=next.suppliers!.find(s=>s.id===id);
 if(!supplier)throw new Error('Supplier not found.');
 if(mode==='ledger'&&((supplier.openingPayable?.UC||0)>0||(supplier.openingPayable?.MM||0)>0))
  throw new Error('Clear existing opening payable amounts with audited corrections before changing to Ledger Only.');
 const updated={...supplier,mode,updatedAt:new Date().toISOString(),updatedBy:by};
 return log({...next,suppliers:next.suppliers!.map(s=>s.id===id?updated:s)},by,'Supplier type updated',`${supplier.name} · ${supplierModeLabel(mode)}`);
}
export function setSupplierOpening(db:Database,id:string,entity:SupplierEntity,amount:number,asOf:string,reason:string,by:string):Database{
 const admin=db.users.find(u=>u.id===by&&u.active&&u.role==='admin');if(!admin)throw new Error('Only Admin can set supplier opening payable.');
 const next=ensureSupplierCollections(db),s=next.suppliers!.find(x=>x.id===id);if(!s)throw new Error('Supplier not found.');
 if(effectiveSupplierMode(s)!=='opening_payable')throw new Error('Supplier is Ledger Only. Switch to With Opening Payable first.');
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
  const e=entries[i];if(e.kind!=='expense'||e.fund!=='RFP'||e.status==='Rejected'||!e.payee.trim()||!e.description.trim()||(base.supplierChangeRequests||[]).some(r=>r.sourceFundEntryId===e.id))continue;
  let supplier=suppliers.find(s=>s.id===e.supplierId)||suppliers.find(s=>supplierKey(s.name)===supplierKey(e.payee));
  if(!supplier){supplier={id:uid(),name:e.payee.trim().replace(/\s+/g,' '),contactPerson:'',phone:'',email:'',tin:'',address:'',notes:'',branches:[e.branch],mode:'ledger',openingPayable:{UC:0,MM:0},openingDate:{UC:'',MM:''},createdAt:e.createdAt,createdBy:e.createdBy};suppliers.push(supplier);changed=true;}
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

/** Only Admin-approved changes become part of the live supplier catalogue. */
export interface SupplierChangeRequest {
 id:string;kind:'Supplier'|'ProductPrice';supplierId?:string;supplierName:string;
 productName?:string;unit?:string;unitCost?:number;effectiveDate?:string;sourceFundEntryId?:string;supplierMode?:SupplierMode;
 status:'Pending'|'Approved'|'Rejected';requestedBy:string;requestedAt:string;
 decidedBy?:string;decidedAt?:string;decisionNotes?:string;
}
const requester=(db:Database,by:string)=>{const u=db.users.find(u=>u.id===by&&u.active);if(!u||!['admin','pb','cashier'].includes(u.role))throw new Error('Valid active staff account required.');return u};
export function requestSupplierChange(db:Database,by:string,request:Pick<SupplierChangeRequest,'kind'|'supplierId'|'supplierName'|'productName'|'unit'|'unitCost'|'effectiveDate'|'sourceFundEntryId'|'supplierMode'>):Database{
 const actor=requester(db,by),next=ensureSupplierCollections(db);if(actor.role==='admin')throw new Error('Admin should use direct supplier actions.');
 const name=request.supplierName.trim().replace(/\s+/g,' ');
 if(name.length<2)throw new Error('Supplier name is required.');
 const supplier=(next.suppliers||[]).find(s=>s.id===request.supplierId)||next.suppliers!.find(s=>supplierKey(s.name)===supplierKey(name));
 if(request.kind==='Supplier'&&supplier)throw new Error('Supplier already exists. Choose it instead.');
 if(request.kind==='Supplier'&&request.supplierMode&&request.supplierMode!=='ledger'&&request.supplierMode!=='opening_payable')throw new Error('Invalid supplier type.');
 if(request.kind==='ProductPrice'){
  if(!request.productName?.trim()||request.productName.trim().length<2)throw new Error('Product name is required.');
  if(!Number.isFinite(request.unitCost)||!validMoney(request.unitCost||0)||!(request.unitCost&&request.unitCost>0))throw new Error('Enter a valid positive unit price.');
  if(!request.effectiveDate||!/^\d{4}-\d{2}-\d{2}$/.test(request.effectiveDate))throw new Error('Enter an effective date.');
 }
 const pending=(next.supplierChangeRequests||[]).find(r=>r.status==='Pending'&&r.kind===request.kind&&supplierKey(r.supplierName)===supplierKey(name)&&(r.kind==='Supplier'||productKey(r.productName||'')===productKey(request.productName||'')&&(!request.sourceFundEntryId||r.sourceFundEntryId===request.sourceFundEntryId)));
 if(pending)throw new Error('A matching supplier/product request is already pending Admin review.');
 const newRequest:SupplierChangeRequest={...request,id:uid(),supplierId:supplier?.id||request.supplierId,supplierName:name,status:'Pending',requestedBy:by,requestedAt:new Date().toISOString()};
 return log({...next,supplierChangeRequests:[newRequest,...(next.supplierChangeRequests||[])]},by,'Supplier change requested',`${request.kind} · ${name} · pending Admin review`);
}
export function decideSupplierChange(db:Database,adminId:string,id:string,decision:'Approved'|'Rejected',notes:string):Database{
 const admin=requester(db,adminId);if(admin.role!=='admin')throw new Error('Only Admin may approve supplier requests.');
 const item=(db.supplierChangeRequests||[]).find(r=>r.id===id);if(!item||item.status!=='Pending')throw new Error('Pending supplier request not found.');
 if(item.requestedBy===adminId)throw new Error('Requester cannot approve their own request.');
 if(decision==='Rejected'&&!notes.trim())throw new Error('Reason for rejection is required.');
 if(item.sourceFundEntryId&&(!db.fundEntries.some(e=>e.id===item.sourceFundEntryId&&e.status!=='Rejected')))throw new Error('The source purchase is missing or rejected.');
 let next=db;
 if(decision==='Approved'){
  if(item.kind==='Supplier'){
   const found=(db.suppliers||[]).find(s=>supplierKey(s.name)===supplierKey(item.supplierName));
   if(!found)next=createSupplier(db,item.supplierName,adminId,item.supplierMode||'ledger');
  }else{
   const supplier=(db.suppliers||[]).find(s=>s.id===item.supplierId)||db.suppliers?.find(s=>supplierKey(s.name)===supplierKey(item.supplierName));
   if(!supplier)throw new Error('Approve the supplier record first before approving its product.');
   if(item.sourceFundEntryId){next=addApprovedPurchasePrice(db,item.sourceFundEntryId,supplier.id,adminId);}
   else next=addSupplierProductPrice(db,supplier.id,item.productName||'',item.unit||'Piece',item.unitCost||0,adminId,item.effectiveDate||'');
  }
 }
 const at=new Date().toISOString();
 return log({...next,supplierChangeRequests:(next.supplierChangeRequests||[]).map(r=>r.id===id?{...r,status:decision,decidedBy:adminId,decidedAt:at,decisionNotes:notes.trim()}:r)},adminId,`Supplier change ${decision.toLowerCase()}`,`${item.kind} · ${item.supplierName} · ${item.productName||''}`);
}
/** Attach a verified purchase to a product after Admin approval; no new financial transaction. */
function addApprovedPurchasePrice(db:Database,sourceId:string,supplierId:string,by:string):Database{
 const base=ensureSupplierCollections(db),entry=base.fundEntries.find(e=>e.id===sourceId);
 if(!entry||entry.fund!=='RFP'||entry.kind!=='expense'||entry.status==='Rejected')throw new Error('Eligible source purchase not found.');
 if((base.supplierPriceEvents||[]).some(e=>e.sourceFundEntryId===sourceId))return base;
 const supplier=base.suppliers!.find(s=>s.id===supplierId);if(!supplier)throw new Error('Supplier not found.');
 const at=new Date().toISOString(),clean=entry.description.trim().replace(/\s+/g,' ');
 let p=base.supplierProducts!.find(p=>p.supplierId===supplierId&&productKey(p.name)===productKey(clean));
 const products=[...base.supplierProducts!];
 if(!p){p={id:uid(),supplierId,name:clean,unit:'Piece',createdAt:at,createdBy:by};products.push(p);}
 const qty=entry.quantity&&entry.quantity>0?entry.quantity:1;
 const amount=entry.unitCost&&entry.unitCost>0?entry.unitCost:entry.amount/qty;
 const price:SupplierPriceEvent={id:uid(),supplierId,productId:p.id,kind:'Purchase',unitCost:toMoney(amount),quantity:qty,branch:entry.branch,sourceFundEntryId:entry.id,sourceNo:entry.no,date:entry.date,createdAt:at,createdBy:by};
 const suppliers=base.suppliers!.map(s=>s.id===supplierId&&!s.branches.includes(entry.branch)?{...s,branches:[...s.branches,entry.branch]}:s);
 return {...base,suppliers,supplierProducts:products,supplierPriceEvents:[...base.supplierPriceEvents!,price],fundEntries:base.fundEntries.map(e=>e.id===entry.id?{...e,supplierId, supplierProductId:p!.id}:e)};
}
/** New PB purchases require Admin approval for unknown suppliers and new product references.
 * Historical imported purchases remain grandfathered through syncSupplierPurchases on startup. */
export function queueNewSupplierPurchases(db:Database,entries:FundEntry[],by:string):Database{
 let next=ensureSupplierCollections(db);const processed=new Set<string>();
 for(const e of entries){if(e.fund!=='RFP'||e.kind!=='expense'||!e.payee.trim()||!e.description.trim())continue;
  const supplier=next.suppliers!.find(s=>supplierKey(s.name)===supplierKey(e.payee));
  const supplierKeyLocal=supplierKey(e.payee);
  if(!supplier&&!processed.has('s:'+supplierKeyLocal)){
   try{next=requestSupplierChange(next,by,{kind:'Supplier',supplierName:e.payee});}catch(err){if(!/already pending/i.test((err as Error).message))throw err;}
   processed.add('s:'+supplierKeyLocal);
  }
  // Even when the product exists, staff-submitted purchase prices remain pending
  // Admin approval before they become an official supplier price-history event.
  try{next=requestSupplierChange(next,by,{kind:'ProductPrice',supplierId:supplier?.id,supplierName:e.payee,productName:e.description,unit:'Piece',unitCost:e.unitCost||e.amount/(e.quantity||1),effectiveDate:e.date,sourceFundEntryId:e.id});}
  catch(err){if(!/already pending/i.test((err as Error).message))throw err;}
 }
 return next;
}
/** Sample data is deliberately opt-in, has no fund/stock/AP effect, and is clearly labeled. */
export function addSampleSupplierCatalogue(db:Database,by:string):Database{
 const admin=requester(db,by);if(admin.role!=='admin')throw new Error('Only Admin may load sample catalogue data.');
 const name='SAMPLE — Demo Auto Parts Supplier';
 if((db.suppliers||[]).some(s=>supplierKey(s.name)===supplierKey(name)))throw new Error('Sample supplier already exists.');
 let next=createSupplier(db,name,by);
 const supplier=next.suppliers!.find(s=>supplierKey(s.name)===supplierKey(name))!;
 next=editSupplier(next,supplier.id,{notes:'SAMPLE CATALOGUE ONLY — fictitious supplier, illustrative prices, no transactions or stock.',branches:['UCM','UCLP','UCQC','MMM']},by);
 for(const [product,unit,cost] of [['Engine Oil 5W-30','Liter',480],['Oil Filter','Piece',250],['Brake Pad Set','Set',1450],['Air Filter','Piece',420],['Cabin Filter','Piece',380]] as const)next=addSupplierProductPrice(next,supplier.id,product,unit,cost,by,'2026-10-30');
 return {...next,sampleCatalogueInitialized:true};
}
