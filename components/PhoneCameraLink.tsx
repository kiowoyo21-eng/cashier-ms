'use client';
import {useState} from 'react';
import CameraProof from './CameraProof';
import * as backend from '../lib/backend';
import {useNotify} from './Notifications';
export default function PhoneCameraLink({purpose,transactionId,onCaptured,onBack}:{purpose:'fund-handover'|'expense-receipt'|'sales-handover';transactionId?:string;onCaptured:(path:string)=>void;onBack?:()=>void}){
 const [open,setOpen]=useState(false),[busy,setBusy]=useState(false);const notify=useNotify();
 async function capture(photo:string){setBusy(true);try{const path=await backend.uploadImage(photo,purpose);onCaptured(path);setOpen(false);notify('Proof saved to this browser.','success')}catch(e:any){notify(e?.message||'Unable to save proof','error')}finally{setBusy(false)}}
 return <div className="phone-link"><p className="small muted">Browser-local mode: photos must be captured on this device. Phone QR transfer requires a shared server and is unavailable offline.</p>{open?<CameraProof onCapture={v=>void capture(v)} onBack={()=>setOpen(false)} submitLabel={busy?'Saving…':'Save Photo Locally'}/>:<button className="btn" onClick={()=>setOpen(true)}>Use This Device Camera</button>}{onBack&&<button className="btn ghost" onClick={onBack}>Back</button>}</div>
}
