'use client';
import React,{useEffect,useState} from 'react';
import {Check,Tag} from 'lucide-react';
import {BRANCH_NAME,needsPriceConfiguration,type BranchId,type Database,type ProductPriceUpdate} from '@/lib/data';

type Entry={unitCost:string;sellPrice:string};
export default function PriceConfiguration({db,branch,onSave}:{db:Database;branch:BranchId|'ALL';onSave:(updates:ProductPriceUpdate[])=>boolean}){
 const pending=db.inventory.filter(p=>!p.archivedAt&&needsPriceConfiguration(p)&&(branch==='ALL'||p.branch===branch));
 const [prices,setPrices]=useState<Record<string,Entry>>({});
 const [message,setMessage]=useState('Configure products after Submit All. A zero selling price is allowed for internal shop supplies.');
 useEffect(()=>{setPrices(old=>Object.fromEntries(pending.map(p=>[p.id,old[p.id]||{unitCost:'',sellPrice:''}])));},[db.inventory,branch]);
 const update=(id:string,key:keyof Entry,value:string)=>setPrices(old=>({...old,[id]:{unitCost:old[id]?.unitCost||'',sellPrice:old[id]?.sellPrice||'',[key]:value}}));
 const valid=(id:string)=>{
  const v=prices[id];return v&&v.unitCost.trim()!==''&&v.sellPrice.trim()!==''&&Number.isFinite(Number(v.unitCost))&&Number(v.unitCost)>0&&Number.isFinite(Number(v.sellPrice))&&Number(v.sellPrice)>=0;
 };
 const save=(ids:string[])=>{
  if(!ids.length)return;
  if(ids.some(id=>!valid(id))){setMessage('Enter a valid positive Unit Cost and explicit Selling Price for every selected item.');return;}
  const products=pending.filter(p=>ids.includes(p.id));
  if(!window.confirm(`Save prices and release the physically verified initial stock for ${products.length} product(s)?\n\nThis posts the pending Stock In to the correct branch and creates an audit record.`))return;
  const success=onSave(products.map(p=>({productId:p.id,unitCost:Number(prices[p.id].unitCost),sellPrice:Number(prices[p.id].sellPrice)})));
  setMessage(success?'Prices saved. Items are now ready for inventory use.':'Could not save Price Configuration. Check the error notification.');
 };
 return <section className="price-configuration" aria-label="Admin Price Configuration">
  <div className="panel-head"><div><h3><Tag size={17}/> Price Configuration</h3><span>Only Admin · Configure Pending Stock after submitting scans; products stay unavailable until saved</span></div><strong>{pending.length} need pricing</strong></div>
  <div className="price-configuration-body">
   <p className="form-note" aria-live="polite">{message}</p>
   {!pending.length?<div className="inventory-empty-state"><strong>No products need pricing.</strong><p>Scan products, enter their names, and click Submit All to create Pending Stock.</p></div>:<>
    {pending.map(p=><div className="price-product-row" key={p.id}>
     <div className="price-product-name"><strong>{p.name}</strong><small>{p.barcode} · {BRANCH_NAME(p.branch)} · {p.pendingInitialQty||0} pending units · {p.category}</small></div>
     <label className="field"><span>Unit Cost (₱)</span><input type="number" min="0.01" step="0.01" placeholder="0.00" value={prices[p.id]?.unitCost||''} onChange={e=>update(p.id,'unitCost',e.target.value)}/></label>
     <label className="field"><span>Selling Price (₱)</span><input type="number" min="0" step="0.01" placeholder="0.00" value={prices[p.id]?.sellPrice||''} onChange={e=>update(p.id,'sellPrice',e.target.value)}/></label>
     <button type="button" className="button button-secondary" disabled={!valid(p.id)} onClick={()=>save([p.id])}><Check size={15}/> Save Price</button>
    </div>)}
    <div className="price-actions"><button type="button" className="button button-primary" disabled={!pending.every(p=>valid(p.id))} onClick={()=>save(pending.map(p=>p.id))}><Check size={16}/> Save All Prices ({pending.length})</button></div>
   </>}
  </div>
 </section>;
}
