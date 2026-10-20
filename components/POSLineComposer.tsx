'use client';
import React,{useId} from 'react';
import {AlertTriangle,Minus,Package,Plus,ShieldCheck,Wrench} from 'lucide-react';
import {FileInput,Input} from '@/components/Ui';
import type {InventoryProduct} from '@/lib/data';
import {type POSLineDraft,MAX_POS_LINE_QTY,posLineAmount,posLineError} from '@/lib/pos-line-entry';

const displayMoney=(value:number)=>new Intl.NumberFormat('en-PH',{style:'currency',currency:'PHP'}).format(value);
type Props={
 value:POSLineDraft;onChange:(next:POSLineDraft)=>void;onAdd:()=>void;
 inventory:InventoryProduct[];branch:string;
 isEditing?:boolean;onCancelEdit?:()=>void;compact?:boolean;
};
/** A single composer shared by both the creation wizard and open POS drafts. */
export default function POSLineComposer({value,onChange,onAdd,inventory,branch,isEditing=false,onCancelEdit,compact=false}:Props){
 const nameId=useId(),qtyId=useId(),priceId=useId();
 const set=<K extends keyof POSLineDraft>(key:K,next:POSLineDraft[K])=>onChange({...value,[key]:next});
 const enteredName=value.name.trim().toLowerCase();
 const catalogMatch=value.type==='Part'&&enteredName?inventory.find(p=>!p.archivedAt&&p.branch===branch&&(p.name.trim().toLowerCase()===enteredName||p.barcode.trim().toLowerCase()===enteredName)):undefined;
 const problem=posLineError(value);
 const amount=posLineAmount(value.qty,value.price);
 const allowed=!problem&&!catalogMatch;
 const adjustQty=(delta:number)=>{
  const current=Number(value.qty);
  set('qty',String(Math.min(MAX_POS_LINE_QTY,Math.max(1,(Number.isInteger(current)?current:1)+delta))));
 };
 return <div className={`pos-line-composer${compact?' pos-line-composer-compact':''}`} onKeyDown={e=>{
  if(e.key==='Enter'&&(e.target instanceof HTMLInputElement)){e.preventDefault();if(allowed)onAdd();}
 }}>
  <div className="pos-line-composer-head"><div><strong>{isEditing?'Edit selected item':'Add to sale'}</strong><span>Enter the quantity and customer selling price per unit.</span></div><div className="pos-line-type" role="group" aria-label="Item type">
   <button type="button" className={value.type==='Service'?'selected':''} aria-pressed={value.type==='Service'} onClick={()=>set('type','Service')}><Wrench size={15}/> Service</button>
   <button type="button" className={value.type==='Part'?'selected':''} aria-pressed={value.type==='Part'} onClick={()=>set('type','Part')}><Package size={15}/> Part</button>
  </div></div>
  <div className="pos-line-fields">
   <label className="field pos-line-name" htmlFor={nameId}><span>{value.type==='Part'?'Part description':'Service description'} *</span><input id={nameId} autoComplete="off" placeholder={value.type==='Part'?'e.g. Brake pad set':'e.g. Brake servicing'} value={value.name} onChange={e=>set('name',e.target.value)} maxLength={140}/></label>
   <div className="field pos-line-quantity"><label htmlFor={qtyId}>Quantity *</label><div className="pos-qty-stepper"><button type="button" aria-label="Decrease quantity" onClick={()=>adjustQty(-1)} disabled={Number(value.qty)<=1}><Minus size={16}/></button><input id={qtyId} aria-label="Quantity" type="number" inputMode="numeric" min="1" max={MAX_POS_LINE_QTY} step="1" value={value.qty} onChange={e=>set('qty',e.target.value)}/><button type="button" aria-label="Increase quantity" disabled={Number(value.qty)>=MAX_POS_LINE_QTY} onClick={()=>adjustQty(1)}><Plus size={16}/></button></div></div>
   <div className="field pos-line-price"><label htmlFor={priceId}>Selling price / unit *</label><div className="pos-money-field"><span aria-hidden="true">₱</span><input id={priceId} aria-label="Selling price per unit in pesos" type="number" inputMode="decimal" min="0.01" step="0.01" placeholder="0.00" value={value.price} onChange={e=>set('price',e.target.value)}/></div></div>
  </div>
  {catalogMatch&&<div className="pos-line-warning" role="alert"><AlertTriangle size={17}/><span><b>{catalogMatch.name}</b> is registered in branch inventory. Save the POS draft first, then use <b>Request Stock Release</b> for Admin approval. Manual entry cannot bypass inventory controls.</span></div>}
  {value.type==='Part'&&!catalogMatch&&<p className="pos-line-help"><ShieldCheck size={14}/> This is a manually billed part. Registered inventory must use Stock Release; Parts Buyer purchase costs are linked separately to COGS.</p>}
  <details className="pos-advanced pos-line-cost"><summary>Internal costing & supplier (optional; not customer selling price)</summary><div className="pos-line-cost-grid"><Input label="Cost / unit (₱)" type="number" min="0" step="0.01" value={value.cost} onChange={v=>set('cost',v)}/><Input label="Supplier" value={value.supplier} onChange={v=>set('supplier',v)}/><Input label="Receipt number" value={value.receiptNo} onChange={v=>set('receiptNo',v)}/><FileInput label="Supporting receipt" value={value.proof} onChange={v=>set('proof',v)}/></div></details>
  <div className="pos-line-footer"><div className="pos-line-subtotal"><span>Line total <small>Qty × selling price</small></span><strong aria-live="polite">{displayMoney(amount)}</strong></div><div className="pos-line-actions">{isEditing&&onCancelEdit&&<button type="button" className="button button-secondary" onClick={onCancelEdit}>Cancel edit</button>}<button type="button" className="button button-primary" disabled={!allowed} onClick={onAdd}><Plus size={15}/>{isEditing?'Save changes':'Add item'}</button></div></div>
  {!catalogMatch&&problem&&((value.name.trim()||value.price||value.qty!=='1')?true:false)&&<p className="pos-line-validation" role="status">{problem}</p>}
 </div>;
}
