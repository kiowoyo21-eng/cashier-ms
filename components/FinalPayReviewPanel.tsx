"use client";
import {useEffect,useMemo,useState} from "react";
import {ClipboardCheck,Info,ShieldAlert,CheckCircle2,ArrowRight} from "lucide-react";
import type {Branch,Role} from "../lib/mock";
import {useHR,money} from "../lib/hrState";
import {activeDemoUser} from "../lib/spreadsheetStore";
import {writeAuditEvent} from "../lib/auditTrail";
import {blankFinalPayAmounts,blankFinalPayReferences,createFinalPay,finalPayBlockers,finalPayFields,finalPayReferenceFields,finalPayRole,finalPaySummary,reviseFinalPay,transitionFinalPay,type FinalPayAmounts,type FinalPayCase,type FinalPayReferences} from "../lib/finalPayReview";
import styles from "./FinalPayReviewPanel.module.css";

export default function FinalPayReviewPanel({branch,role}:{branch:Branch;role:Role}){
 const {data,update}=useHR();
 const [selectedId,setSelectedId]=useState("");
 const [message,setMessage]=useState("");
 const [reason,setReason]=useState("");
 const [amounts,setAmounts]=useState<FinalPayAmounts>(blankFinalPayAmounts);
 const [references,setReferences]=useState<FinalPayReferences>(blankFinalPayReferences);
 const [lastWorkingDay,setLastWorkingDay]=useState("");
 const [notes,setNotes]=useState("");
 const cases=useMemo(()=>[...(data.finalPayCases||[])].filter(x=>branch==="All Shops"||x.branch===branch).sort((a,b)=>b.createdAt.localeCompare(a.createdAt)),[data.finalPayCases,branch]);
 const eligible=useMemo(()=>[...(data.lifecycleCases||[])].filter(x=>x.action==="Offboard"&&x.status==="Applied (Demo)"&&(branch==="All Shops"||x.sourceBranch===branch)&&data.people.some(p=>p.id===x.employeeId&&p.status==="Clearance Pending"&&p.branch===x.sourceBranch)&&!(data.finalPayCases||[]).some(f=>f.lifecycleCaseId===x.id)),[data.lifecycleCases,data.people,data.finalPayCases,branch]);
 const record=cases.find(x=>x.id===selectedId);
 useEffect(()=>{if(!record){setAmounts(blankFinalPayAmounts());setReferences(blankFinalPayReferences());setLastWorkingDay("");setNotes("");return;}setAmounts({...record.amounts});setReferences({...record.references});setLastWorkingDay(record.lastWorkingDay);setNotes(record.notes);setReason("");},[selectedId,record?.status]);
 useEffect(()=>{if(selectedId&&!cases.some(x=>x.id===selectedId)){setSelectedId("");setMessage("");}},[branch,cases,selectedId]);
 const actor=()=>{const active=activeDemoUser();return active&&active.role===role&&finalPayRole(active.role)?active:null;};
 const canEdit=!!record&&["Draft","Returned for Correction"].includes(record.status)&&finalPayRole(role);
 const persist=(next:FinalPayCase,action:string,beforeStatus:string)=>{
  update(state=>({...state,finalPayCases:(state.finalPayCases||[]).map(x=>x.id===next.id?next:x)}));
  writeAuditEvent({module:"Final Pay Review",action,recordId:next.id,beforeStatus,afterStatus:next.status,summary:"Demo review action; amounts and reference contents redacted"});
 };
 const create=(caseId:string)=>{
  const user=actor();if(!user){setMessage("An active HR session is required.");return;}
  const id=`FP-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8).toUpperCase()}`;
  const outcome=createFinalPay(data,caseId,user.username,user.role,new Date().toISOString(),id);
  if(!outcome.ok){setMessage(outcome.error);return;}
  update(state=>{const r=createFinalPay(state,caseId,user.username,user.role,new Date().toISOString(),id);return r.ok?{...state,finalPayCases:[...(state.finalPayCases||[]),r.record]}:state;});
  writeAuditEvent({module:"Final Pay Review",action:"Created draft",recordId:id,beforeStatus:"None",afterStatus:"Draft",summary:"Offboarding final-pay preparation; amounts not verified"});
  setSelectedId(id);setMessage("Final-pay draft created. No payment or final approval has occurred.");
 };
 const save=()=>{
  const user=actor();if(!user||!record){setMessage("HR session or record no longer available.");return;}
  const next=reviseFinalPay(record,user.username,user.role,new Date().toISOString(),{amounts,references,lastWorkingDay,notes});
  if(!next.ok){setMessage(next.error);return;}
  persist(next.record,"Updated draft",record.status);setMessage("Browser-only preparation saved. Verify the supporting figures before requesting review.");
 };
 const decide=(action:"Submit"|"Review"|"Return"|"Handoff")=>{
  const user=actor();if(!user||!record){setMessage("HR session or record no longer available.");return;}
  const outcome=transitionFinalPay(data,record,action,user.username,user.role,new Date().toISOString(),reason);
  if(!outcome.ok){setMessage(outcome.error);return;}
  if(action==="Handoff"&&!window.confirm("Record demo Accounting handoff? This does not send data, approve payment, or authorize release."))return;
  persist(outcome.record,action,record.status);setReason("");setMessage(action==="Handoff"?"Accounting handoff recorded LOCALLY only. Actual submission and payment approvals are NOT connected.":`Updated to ${outcome.record.status}.`);
 };
 const computed=finalPaySummary(amounts);
 const blockers=record?finalPayBlockers(data,{...record,amounts,references,lastWorkingDay}):[];
 return <div className={styles.root}>
  <div className={styles.notice}><Info size={18}/><div><strong>Final-pay preparation — frontend demonstration only</strong><p>HR verifies the source records and itemizes preliminary amounts. Accounting must independently confirm all liabilities and payment details. This module does not compute legal entitlements, transmit a request to Accounting, obtain Ms Kate's disbursement approval, or release funds.</p></div></div>
  {message&&<div role="status" className={styles.message}>{message}<button type="button" className="secondary" onClick={()=>setMessage("")}>Dismiss</button></div>}
  <div className={styles.twoCols}>
   <section className="panel"><h3>Eligible Offboarding Handoffs</h3><p className="muted">Only completed Employee 201 offboarding cases in the active branch appear here.</p>
    {eligible.length?eligible.map(c=>{const person=data.people.find(p=>p.id===c.employeeId);return <div key={c.id} className={styles.listRow}><div><b>{person?.name||c.employeeId}</b><small>{c.sourceBranch} · Case {c.id} · Effective {c.effectiveDate}</small></div><button type="button" className="secondary" disabled={!finalPayRole(role)} onClick={()=>create(c.id)}>Prepare</button></div>}):<p className="muted">No eligible offboarding handoffs awaiting final-pay preparation.</p>}
   </section>
   <section className="panel"><h3>Final-Pay Review Register</h3><p className="muted">Scoped to {branch}. Records remain separate from regular payslip batches.</p>
    {cases.length?cases.map(c=>{const person=data.people.find(p=>p.id===c.employeeId);return <button type="button" key={c.id} className={`${styles.recordChoice} ${selectedId===c.id?styles.active:""}`} onClick={()=>{setSelectedId(c.id);setMessage("")}}><span><b>{person?.name||c.employeeId}</b><small>{c.id} · {c.branch}</small></span><span className={styles.status}>{c.status}</span></button>}):<p className="muted">No final-pay preparation records in this branch.</p>}
   </section>
  </div>
  {record&&<section className="panel" key={record.id}>
   <header className={styles.sectionHead}><div><h3><ClipboardCheck size={19}/> {record.id} — Review Details</h3><p className="muted">Lifecycle: {record.lifecycleCaseId} · Prepared by {record.createdBy} · {record.status}</p></div><button type="button" className="secondary" onClick={()=>setSelectedId("")}>Close</button></header>
   <div className={styles.twoCols}>
    <div><label className={styles.label}>Last working day<input type="date" disabled={!canEdit} value={lastWorkingDay} onChange={e=>setLastWorkingDay(e.target.value)}/></label><h4>Verified earnings and deductions</h4><p className="muted">Enter documented amounts only; zero means not entered or not applicable and requires independent review.</p>
     <div className={styles.inputs}>{finalPayFields.map(([key,title])=><label key={key} className={styles.label}>{title}<input type="number" min="0" step="0.01" disabled={!canEdit} value={amounts[key]} onChange={e=>setAmounts(v=>({...v,[key]:Number(e.target.value)}))}/></label>)}</div>
     <div className={styles.totals}><span>Provisional gross: <b>{money(computed.gross)}</b></span><span>Deductions: <b>{money(computed.deductions)}</b></span><span>Provisional net: <b>{money(computed.net)}</b></span></div>
    </div>
    <div><h4>Verification references</h4><p className="muted">Reference IDs/notes only. Do not enter bank details or government identification numbers.</p>
     <div className={styles.inputs}>{finalPayReferenceFields.map(([key,title])=><label key={key} className={styles.label}>{title}<input disabled={!canEdit} maxLength={300} value={references[key]} placeholder="Source record / reviewer reference" onChange={e=>setReferences(v=>({...v,[key]:e.target.value}))}/></label>)}</div>
     <label className={styles.label}>Preparation notes<textarea rows={3} maxLength={1500} disabled={!canEdit} value={notes} onChange={e=>setNotes(e.target.value)}/></label>
     {blockers.length>0&&<div className={styles.blockers}><strong><ShieldAlert size={16}/> Review requirements</strong>{blockers.map((b,i)=><p key={i}>{b}</p>)}</div>}
    </div>
   </div>
   <div className={styles.actions}>{canEdit&&<button type="button" className="secondary" onClick={save}>Save preparation</button>}{record.status==="Draft"&&<button type="button" className="primary" onClick={()=>decide("Submit")}>Submit saved draft for HR review <ArrowRight size={15}/></button>}
   {record.status==="For HR Review"&&<button type="button" className="primary" onClick={()=>decide("Review")}>Confirm independent HR review</button>}
   {record.status==="HR Reviewed"&&<button type="button" className="primary" onClick={()=>decide("Handoff")}>Record Accounting handoff (Demo)</button>}
   {["For HR Review","HR Reviewed"].includes(record.status)&&<button type="button" className="secondary" onClick={()=>decide("Return")}>Return for correction</button>}
   </div>
   {["For HR Review","HR Reviewed"].includes(record.status)&&<label className={styles.label}>Review decision reference (required, 8+ characters)<input maxLength={300} placeholder="Review evidence / correction reason" value={reason} onChange={e=>setReason(e.target.value)}/></label>}
   {record.status==="Accounting Handoff (Demo)"&&<p className={styles.notice}><CheckCircle2 size={18}/> Local preparation handoff recorded. Accounting has NOT received this and no disbursement is authorized.</p>}
   <h4>Review Timeline</h4><div className={styles.timeline}>{[...record.history].reverse().map((e,i)=><div key={`${e.at}-${i}`}><b>{e.from} → {e.to}</b><small>{e.at} · {e.actor} · {e.action}</small><p>{e.reference}</p></div>)}</div>
  </section>}
 </div>;
}
