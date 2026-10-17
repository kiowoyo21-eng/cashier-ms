'use client';
import React,{useEffect,useRef,useState} from 'react';
import {Camera,Check,Plus,ScanBarcode,Trash2,X} from 'lucide-react';
import BarcodeCamera from './BarcodeCamera';
import {BRANCHES,type BranchId,type Database,type InventoryCategory,type NewInventoryProduct} from '@/lib/data';

type Row={key:number;barcode:string;name:string;category:InventoryCategory;unit:string;unitCost:string;sellPrice:string;initialQty:string;reorderAt:string};
const clean=(v:string)=>v.toUpperCase().replace(/[^A-Z0-9]/g,'');
const blank=(barcode:string,key:number):Row=>({key,barcode,name:'',category:'Automotive Parts & Products',unit:'Piece',unitCost:'',sellPrice:'',initialQty:'0',reorderAt:'5'});

/** Scanner queue: one row per distinct barcode, no implicit quantity increment.
 * Bulk Save requires Admin and every product's complete details; nothing is
 * posted until that explicit action succeeds. */
export default function BulkScanRegistration({db,initialBranch,onSave,onClose}:{db:Database;initialBranch:BranchId;onSave:(items:NewInventoryProduct[])=>boolean;onClose:()=>void}){
 const [branch,setBranch]=useState<BranchId>(initialBranch);
 const [barcodeInput,setBarcodeInput]=useState('');
 const [rows,setRows]=useState<Row[]>([]);
 const [camera,setCamera]=useState(false);
 const [message,setMessage]=useState('Scan product barcodes continuously. Each distinct barcode is added once.');
 const scanner=useRef<HTMLInputElement>(null);
 const serial=useRef(0);
 const seen=useRef(new Set<string>());
 useEffect(()=>{scanner.current?.focus()},[]);
 const add=(raw:string)=>{
  const code=clean(raw.trim());
  setBarcodeInput('');
  if(!code){setMessage('Enter or scan a barcode first.');scanner.current?.focus();return;}
  if(seen.current.has(code)){setMessage(`${code} is already in the list. Duplicate scan ignored; quantity was not increased.`);scanner.current?.focus();return;}
  if(db.inventory.some(p=>p.branch===branch&&p.barcode===code)){
   setMessage(`${code} is already registered in this branch. Use Stock In for quantity updates.`);scanner.current?.focus();return;
  }
  seen.current.add(code);
  serial.current+=1;
  setRows(previous=>[...previous,blank(code,serial.current)]);
  setMessage(`${code} added. Keep scanning; ${seen.current.size} distinct product barcode(s) collected.`);
  scanner.current?.focus();
 };
 const remove=(key:number,code:string)=>{seen.current.delete(code);setRows(prev=>prev.filter(row=>row.key!==key));scanner.current?.focus()};
 const change=<K extends keyof Row>(key:number,field:K,value:Row[K])=>setRows(prev=>prev.map(row=>row.key===key?{...row,[field]:value}:row));
 const changeBranch=(next:BranchId)=>{
  if(next===branch)return;
  setBranch(next);setRows([]);seen.current.clear();setBarcodeInput('');
  setMessage('Branch changed. Bulk Scan list reset to avoid assigning products to the wrong branch.');scanner.current?.focus();
 };
 const submit=(ev:React.FormEvent)=>{
  ev.preventDefault();
  if(!rows.length){setMessage('No new barcodes have been scanned yet.');return;}
  if(rows.some(r=>!r.name.trim()||!r.unit.trim()||!r.unitCost||Number(r.unitCost)<=0||Number(r.sellPrice)<0||Number(r.initialQty)<0||!Number.isInteger(Number(r.initialQty))||Number(r.reorderAt)<0||!Number.isInteger(Number(r.reorderAt)))){
   setMessage('Complete each product name, unit, valid unit cost, price, and stock quantity before saving.');return;
  }
  const payload:NewInventoryProduct[]=rows.map(r=>({branch,barcode:r.barcode,name:r.name.trim(),category:r.category,unit:r.unit.trim(),unitCost:Number(r.unitCost),sellPrice:Number(r.sellPrice||0),initialQty:Number(r.initialQty),reorderAt:Number(r.reorderAt)}));
  if(onSave(payload)){
   setMessage(`Successfully registered ${payload.length} new products.`);setRows([]);seen.current.clear();setBarcodeInput('');setCamera(false);
  }
 };
 return <section className="bulk-scan-panel" aria-label="Bulk Scan product registration">
  <div className="bulk-scan-header"><div><h3><ScanBarcode size={19}/> Bulk Scan</h3><p>Admin only · Collect unique barcode scans, enter details, then save the whole batch once.</p></div><button type="button" className="icon-button" onClick={onClose} aria-label="Close Bulk Scan"><X size={18}/></button></div>
  <form onSubmit={submit}>
   <div className="bulk-scan-controls"><label className="field"><span>Receiving Branch</span><select value={branch} onChange={e=>changeBranch(e.target.value as BranchId)}>{BRANCHES.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}</select></label>
    <label className="field"><span>Scan / Enter Barcode</span><input ref={scanner} value={barcodeInput} onChange={e=>setBarcodeInput(clean(e.target.value))} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();add(barcodeInput)}}} placeholder="Scan then press Enter" aria-label="Bulk scan barcode" autoComplete="off"/></label>
    <button type="button" className="button button-secondary" onClick={()=>add(barcodeInput)}><Plus size={16}/> Add Scan</button>
    <button type="button" className="button button-secondary" aria-expanded={camera} onClick={()=>setCamera(v=>!v)}><Camera size={16}/>{camera?'Close Camera':'Camera Bulk Scan'}</button>
   </div>
   {camera&&<div className="bulk-scan-camera"><BarcodeCamera continuous onScan={add} onClose={()=>setCamera(false)}/></div>}
   <p className="bulk-scan-message" aria-live="polite">{message}</p>
   <div className="bulk-scan-meta"><strong>{rows.length} unique product{rows.length===1?'':'s'}</strong><span>Repeated scans do not create extra rows or increase stock quantity.</span></div>
   {rows.length>0?<div className="bulk-scan-rows">{rows.map((r,i)=><div className="bulk-scan-row" key={r.key}>
     <div className="bulk-scan-row-title"><strong>{i+1}. {r.barcode}</strong><button type="button" className="text-button" onClick={()=>remove(r.key,r.barcode)}><Trash2 size={14}/> Remove</button></div>
     <div className="bulk-scan-fields">
      <label className="field"><span>Product Name</span><input value={r.name} onChange={e=>change(r.key,'name',e.target.value)} placeholder="Enter product name" required/></label>
      <label className="field"><span>Category</span><select value={r.category} onChange={e=>change(r.key,'category',e.target.value as InventoryCategory)}><option>Automotive Parts & Products</option><option>Shop Supplies</option></select></label>
      <label className="field"><span>Unit</span><input value={r.unit} onChange={e=>change(r.key,'unit',e.target.value)} required/></label>
      <label className="field"><span>Cost / Unit (₱)</span><input value={r.unitCost} type="number" step="0.01" min="0.01" onChange={e=>change(r.key,'unitCost',e.target.value)} required/></label>
      <label className="field"><span>Selling Price (₱)</span><input value={r.sellPrice} type="number" step="0.01" min="0" onChange={e=>change(r.key,'sellPrice',e.target.value)}/></label>
      <label className="field"><span>Initial Qty</span><input value={r.initialQty} type="number" step="1" min="0" onChange={e=>change(r.key,'initialQty',e.target.value)} required/></label>
      <label className="field"><span>Low Stock Alert</span><input value={r.reorderAt} type="number" step="1" min="0" onChange={e=>change(r.key,'reorderAt',e.target.value)} required/></label>
     </div></div>)}</div>:<p className="bulk-scan-empty">No barcodes yet. Scan products using a USB/Bluetooth reader, type a barcode and press Enter, or open Camera Bulk Scan on a supported device.</p>}
   <div className="bulk-scan-actions"><button type="button" className="button button-secondary" onClick={onClose}>Close</button><button className="button button-primary" type="submit" disabled={!rows.length}><Check size={16}/> Register All ({rows.length})</button></div>
  </form>
 </section>;
}
