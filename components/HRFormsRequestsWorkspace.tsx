"use client";
import {useEffect,useMemo,useState} from "react";
import type {Branch,Role} from "../lib/mock";
import {branches} from "../lib/mock";
import {useHR} from "../lib/hrState";
import {FORM_STORE_EVENT,FORM_STORE_KEY,formSchemas,validateFields,readForms,persistForms,transitionForm,canReviewForm,canViewForm,formDraftText,type FormKind,type HRFormRecord,type FormStatus} from "../lib/hrForms";
import {writeAuditEvent} from "../lib/auditTrail";
import styles from "./HROperationsExtras.module.css";
const nowISO=()=>new Date().toISOString();
const prettyDate=(value:string)=>{try{return new Date(value).toLocaleString("en-PH",{timeZone:"Asia/Manila",dateStyle:"medium",timeStyle:"short"})}catch{return value}};
const downloadForm=(record:HRFormRecord)=>{const link=document.createElement("a"),url=URL.createObjectURL(new Blob([formDraftText(record)],{type:"text/plain;charset=utf-8"}));link.href=url;link.download=`${record.id.replace(/[^a-zA-Z0-9-]/g,"")}-UNSIGNED-DRAFT.txt`;link.click();window.setTimeout(()=>URL.revokeObjectURL(url),500)};
const newId=()=>typeof crypto!=="undefined"&&"randomUUID" in crypto?`HFORM-${crypto.randomUUID()}`:`HFORM-${Date.now()}-${Math.random().toString(36).slice(2,10)}`;
export default function HRFormsRequestsWorkspace({branch,role,username}:{branch:Branch;role:Role;username:string}){
 const {data}=useHR();
 const [items,setItems]=useState<HRFormRecord[]>([]),[ready,setReady]=useState(false);
 const [tab,setTab]=useState<"requests"|"create">("requests"),[category,setCategory]=useState<FormKind>(formSchemas[0].kind),[employeeId,setEmployeeId]=useState(""),[requestBranch,setRequestBranch]=useState<Exclude<Branch,"All Shops">>("UC Mandaluyong"),[values,setValues]=useState<Record<string,string>>({}),[evidence,setEvidence]=useState(""),[editingId,setEditingId]=useState("");
 const [selectedId,setSelectedId]=useState(""),[filter,setFilter]=useState("All"),[search,setSearch]=useState(""),[remarks,setRemarks]=useState(""),[message,setMessage]=useState(""),[error,setError]=useState("");
 useEffect(()=>{setItems(readForms());setReady(true);const changed=()=>setItems(readForms());const stored=(e:StorageEvent)=>{if(e.key===FORM_STORE_KEY)changed()};window.addEventListener(FORM_STORE_EVENT,changed);window.addEventListener("storage",stored);return()=>{window.removeEventListener(FORM_STORE_EVENT,changed);window.removeEventListener("storage",stored)}},[]);
 useEffect(()=>{setSelectedId("");setMessage("");setError("");setEditingId("");setTab("requests");setRequestBranch(branch==="All Shops"?"UC Mandaluyong":branch)},[branch]);
 const allowedBranches=branches.filter((b):b is Exclude<Branch,"All Shops">=>b!=="All Shops"&&(role!=="BM"||b==="UC Mandaluyong")&&(branch==="All Shops"||b===branch));
 const people=useMemo(()=>data.people.filter(p=>p.branch===requestBranch),[data.people,requestBranch]);
 const visible=useMemo(()=>items.filter(r=>canViewForm(r,username,role,branch)&&(filter==="All"||r.status===filter)&&`${r.id} ${r.kind} ${r.employeeId} ${r.branch}`.toLowerCase().includes(search.trim().toLowerCase())).sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt)),[items,role,username,branch,filter,search]);
 const selected=visible.find(x=>x.id===selectedId);
 const schema=formSchemas.find(x=>x.kind===category)!;
 const chosenBranch=allowedBranches.includes(requestBranch)?requestBranch:allowedBranches[0];
 const employee=people.find(x=>x.id===employeeId);
 const validation=validateFields(category,values);
 const setField=(key:string,value:string)=>setValues(s=>({...s,[key]:value}));
 const commit=(updated:HRFormRecord[],action:string,record:HRFormRecord,before?:FormStatus)=>{
  if(!persistForms(updated)){setError("Browser storage could not save this request. No success was recorded.");return false}
  setItems(updated);writeAuditEvent({module:"HR Forms & Requests",action,recordId:record.id,summary:`${record.kind} · metadata only; form contents redacted`,beforeStatus:before,afterStatus:record.status});setError("");setMessage(`${action}: ${record.id} (browser-local only)`);return true;
 };
 const saveDraft=(submit:boolean)=>{
  setMessage("");setError("");
  if(!ready){setError("Form records are still loading");return}
  if(!chosenBranch||!employee||employee.branch!==chosenBranch){setError("Select an employee in the selected branch");return}
  if(evidence.length>350){setError("Evidence references cannot exceed 350 characters");return}
  if(submit&&validation.length){setError(validation[0]);return}
  const old=editingId?items.find(r=>r.id===editingId):undefined;
  if(editingId&&(!old||old.requestor!==username||!["Draft","Returned for Revision"].includes(old.status)||old.branch!==chosenBranch||old.employeeId!==employeeId)){setError("This request can no longer be edited");return}
  const at=nowISO();const record:HRFormRecord=old?{...old,fields:values,kind:category,evidenceRefs:evidence,updatedAt:at}:{id:newId(),kind:category,branch:chosenBranch,employeeId,requestor:username,status:"Draft",fields:values,evidenceRefs:evidence,remarks:"",createdAt:at,updatedAt:at,history:[{at,actor:username,action:"Created Draft",status:"Draft"}]};
  let next=record;
  try{if(submit)next=transitionForm(record,"Submit",username,role,"",at)}catch(e){setError(e instanceof Error?e.message:"Cannot submit");return}
  if(commit(old?items.map(r=>r.id===old.id?next:r):[...items,next],submit?"Submitted documentation request":old?"Updated draft":"Created draft",next,old?.status)){
   setEditingId("");setValues({});setEvidence("");setEmployeeId("");setSelectedId(next.id);setTab("requests");setFilter("All");setSearch("");
  }
 };
 const review=(action:"Approve"|"Return"|"Reject")=>{
  setError("");setMessage("");if(!selected||!canReviewForm(selected,username,role)){setError("This request is not eligible for your review");return}
  if((action==="Return"||action==="Reject")&&!remarks.trim()){setError("Written reason is required");return}
  if(!window.confirm(`${action} request ${selected.id}? This changes documentation status only, not payroll, leave or permits.`))return;
  try{const next=transitionForm(selected,action,username,role,remarks,nowISO());if(commit(items.map(r=>r.id===selected.id?next:r),action==="Approve"?"Approved documentation":action==="Reject"?"Rejected documentation":"Returned documentation",next,selected.status))setRemarks("")}
  catch(e){setError(e instanceof Error?e.message:"Decision not permitted")}
 };
 const startEdit=(r:HRFormRecord)=>{if(r.requestor!==username||!(r.status==="Draft"||r.status==="Returned for Revision"))return;setEditingId(r.id);setCategory(r.kind);setEmployeeId(r.employeeId);setRequestBranch(r.branch);setValues({...r.fields});setEvidence(r.evidenceRefs);setMessage("");setError("");setTab("create")};
 const changeType=(v:FormKind)=>{setCategory(v);setValues({});setEditingId("")};
 return <div className={`${styles.wrap} ${styles.requestRegister}`}>
  <div className={styles.head}><div><h2>HR Forms & Document Requests</h2><p>Document intake and review register · {branch} · {role}</p></div><div className={styles.actions}><button className={styles.primary} type="button" onClick={()=>{setTab("create");setEditingId("");setValues({});setEvidence("");setEmployeeId("");setMessage("");setError("")}}>New form request</button></div></div>
  <div className={styles.notice}><b>Frontend review only:</b> This module does NOT create official leave approvals, valid work permits, payable overtime, disciplinary judgments, or released documents. Evidence is a text reference, not a signed or secure upload. Keep confidential facts out of browser demo storage. Final legally required wording and signatories require HR/legal review.</div>
  <div className={styles.subtabs} role="tablist"><button type="button" role="tab" aria-selected={tab==="requests"} onClick={()=>setTab("requests")}>Request register ({visible.length})</button><button type="button" role="tab" aria-selected={tab==="create"} onClick={()=>setTab("create")}>{editingId?"Edit request":"Create / submit"}</button></div>
  {error&&<div className={styles.error} role="alert">{error}</div>}{message&&<div className={styles.success} role="status">{message}</div>}
  {tab==="create"?<section className={styles.panel}><h3>{editingId?`Update ${editingId}`:"New HR documentation request"}</h3><div className={styles.formGrid}>
   <label className={styles.field}>Form type<select value={category} disabled={!!editingId} onChange={e=>changeType(e.target.value as FormKind)}>{formSchemas.map(s=><option key={s.kind}>{s.kind}</option>)}</select></label>
   <label className={styles.field}>Branch<select value={chosenBranch||""} disabled={!!editingId||role==="BM"} onChange={e=>{setRequestBranch(e.target.value as Exclude<Branch,"All Shops">);setEmployeeId("")}}>{allowedBranches.map(b=><option key={b}>{b}</option>)}</select></label>
   <label className={`${styles.field} ${styles.wide}`}>Employee (from Employee 201)<select value={employeeId} disabled={!!editingId} onChange={e=>setEmployeeId(e.target.value)}><option value="">Select Employee 201 record</option>{people.map(p=><option key={p.id} value={p.id}>{p.id} — {p.name}</option>)}</select></label>
   <div className={styles.wide}><p className={styles.muted}>{schema.description}</p></div>
   {schema.fields.map(f=><label className={`${styles.field} ${f.type==="textarea"?styles.wide:""}`} key={f.key}>{f.label}{f.required?" *":" (optional)"}{f.type==="textarea"?<textarea maxLength={1500} value={values[f.key]||""} onChange={e=>setField(f.key,e.target.value)}/>:f.type==="select"?<select value={values[f.key]||""} onChange={e=>setField(f.key,e.target.value)}><option value="">Select</option>{f.options?.map(x=><option key={x}>{x}</option>)}</select>:<input type={f.type} maxLength={1500} value={values[f.key]||""} onChange={e=>setField(f.key,e.target.value)}/>}</label>)}
   <label className={`${styles.field} ${styles.wide}`}>Evidence / supporting document references (optional)<textarea maxLength={350} placeholder="Document IDs or internal references only, no personal ID numbers or confidential document content" value={evidence} onChange={e=>setEvidence(e.target.value)}/></label>
   <div className={styles.wide}><div className={styles.actions}><button className={styles.secondary} type="button" disabled={!ready} onClick={()=>saveDraft(false)}>Save draft</button><button className={styles.primary} type="button" disabled={!ready||validation.length>0} onClick={()=>saveDraft(true)}>Submit for review</button><button className={styles.secondary} type="button" onClick={()=>{setTab("requests");setError("")}}>Cancel</button></div>{validation.length>0&&<p className={styles.muted}>{validation.length} required/invalid fields before submission. First: {validation[0]}</p>}</div>
  </div></section>:<div className={styles.panels}>
   <section className={styles.panel}><div className={styles.toolbar}><label className={styles.field}>Status<select value={filter} onChange={e=>{setFilter(e.target.value);setSelectedId("")}}><option>All</option>{["Draft","Submitted","Returned for Revision","Approved (Documentation Only)","Rejected"].map(x=><option key={x}>{x}</option>)}</select></label><label className={styles.field}>Search request<input value={search} onChange={e=>{setSearch(e.target.value);setSelectedId("")}} placeholder="ID, employee, type"/></label></div><p className={styles.muted}>{visible.length} visible requests. Browser-only records · no live workflow integration.</p><div className={styles.list}>{visible.map(r=><button key={r.id} type="button" className={styles.item} aria-pressed={selectedId===r.id} onClick={()=>{setSelectedId(r.id);setRemarks("");setError("")}}><b>{r.kind}</b><small>{r.id} · {r.employeeId} · {r.branch}</small><small>{r.status} · {prettyDate(r.updatedAt)}</small></button>)}{!visible.length&&<div className={styles.empty}>No matching form requests. Create a request to start.</div>}</div></section>
   <section className={styles.panel}>{selected?<div className={styles.details}><h3>Request review</h3><span className={styles.pill}>{selected.status}</span><div className={styles.muted}>ID: {selected.id}</div><button className={styles.secondary} type="button" onClick={()=>downloadForm(selected)}>Download unsigned form draft (.txt)</button><div className={styles.muted}>Submitted by: {selected.requestor}</div><div className={styles.muted}>Employee: {selected.employeeId} · {selected.branch}</div>{formSchemas.find(x=>x.kind===selected.kind)?.fields.map(f=><div className={styles.pair} key={f.key}><span>{f.label}</span><strong style={{whiteSpace:"pre-wrap",textAlign:"right",overflowWrap:"anywhere"}}>{selected.fields[f.key]||"—"}</strong></div>)}<p className={styles.muted}>Evidence references: {selected.evidenceRefs||"None"}</p>{selected.remarks&&<p className={styles.muted}>Last decision remarks: {selected.remarks}</p>}
    {(selected.status==="Draft"||selected.status==="Returned for Revision")&&selected.requestor===username&&<button className={styles.secondary} type="button" onClick={()=>startEdit(selected)}>Edit / resubmit</button>}
    {canReviewForm(selected,username,role)&&<><label className={styles.field}>Reviewer explanation (required for return/reject)<textarea value={remarks} maxLength={1000} onChange={e=>setRemarks(e.target.value)}/></label><div className={styles.actions}><button type="button" className={styles.primary} onClick={()=>review("Approve")}>Approve documentation</button><button type="button" className={styles.secondary} onClick={()=>review("Return")}>Return</button><button type="button" className={styles.secondary} onClick={()=>review("Reject")}>Reject</button></div></>}
    <h3>Decision history</h3><ol className={styles.history}>{selected.history.map((h,i)=><li key={`${h.at}-${i}`}>{prettyDate(h.at)} · {h.actor} · {h.action} → {h.status}</li>)}</ol>
   </div>:<div className={styles.empty}>Select a request to review its documentation and timeline.</div>}</section>
  </div>}
 </div>;
}
