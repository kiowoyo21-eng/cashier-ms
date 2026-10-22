"use client";
import {useEffect,useMemo,useRef,useState} from "react";
import {createPortal} from "react-dom";
import {AlertTriangle,ArrowRight,CheckCircle2,ChevronRight,ClipboardCheck,Clock3,FileText,History,Info,RotateCcw,Search,ShieldCheck,X,XCircle} from "lucide-react";
import type {Branch,Role} from "../lib/mock";
import {writeAuditEvent} from "../lib/auditTrail";
import {DEMO_APPROVAL_REQUESTS,KATE_DEMO_USERNAME,KATE_ROLE,approvalFingerprint,checkFinalDecision,formatPhilippinesTime,getApprovalStatus,readDecisionStore,saveDemoDecision,type ApprovalStatus,type DecisionStore,type FinalApprovalRequest,type KateDecision,type SupportingDocument} from "../lib/finalApproval";
import styles from "./MsKateApprovalWorkspace.module.css";

type Tab="pending"|"approved"|"rejected"|"returned"|"accounting"|"history";
const tabs:{id:Tab;label:string}[]=[
 {id:"pending",label:"Pending My Approval"},{id:"approved",label:"Approved"},{id:"rejected",label:"Rejected"},
 {id:"returned",label:"Returned"},{id:"accounting",label:"Waiting on Accounting"},{id:"history",label:"Approval History"}
];
const actionLabels:Record<KateDecision,string>={"Approved for Release":"Approve for Release","Rejected by Ms Kate":"Reject Request","Returned for Revision":"Return for Revision"};
const amountPH=(value:number)=>new Intl.NumberFormat("en-PH",{style:"currency",currency:"PHP"}).format(value);
const statusType=(status:ApprovalStatus)=>status==="Approved for Release"?styles.approved:status==="Rejected by Ms Kate"?styles.rejected:status==="Returned for Revision"?styles.returned:status==="Pending Ms Kate Approval"?styles.pending:styles.waiting;
function matchesTab(status:ApprovalStatus,tab:Tab){
 if(tab==="history")return true;
 if(tab==="pending")return status==="Pending Ms Kate Approval";
 if(tab==="approved")return status==="Approved for Release";
 if(tab==="rejected")return status==="Rejected by Ms Kate";
 if(tab==="returned")return status==="Returned for Revision";
 return status==="Awaiting Accounting Approval"||status==="Accounting Reapproval Required"||status==="Awaiting Accounting Correction";
}
export default function MsKateApprovalWorkspace({role,username,branch}:{role:Role;username:string;branch:Branch}){
 const [store,setStore]=useState<DecisionStore>({schema:1,decisions:[]});
 const [loaded,setLoaded]=useState(false);
 const [tab,setTab]=useState<Tab>("pending");
 const [search,setSearch]=useState("");const [source,setSource]=useState("All");
 const [selectedId,setSelectedId]=useState<string>("CMS-DEMO-DR-001");
 const [confirm,setConfirm]=useState<KateDecision|null>(null);
 const [remark,setRemark]=useState("");const [formError,setFormError]=useState("");
 const [message,setMessage]=useState("");const [busy,setBusy]=useState(false);
 const [openDoc,setOpenDoc]=useState<SupportingDocument|null>(null);
 const lastViewed=useRef<string>("");
 const allowedView=role===KATE_ROLE&&username===KATE_DEMO_USERNAME||role==="Super Admin";
 const isKate=role===KATE_ROLE&&username===KATE_DEMO_USERNAME;
 useEffect(()=>{const refresh=()=>setStore(readDecisionStore());refresh();setLoaded(true);
  const onStorage=(event:StorageEvent)=>{if(event.key==="uc-hr-final-approval-demo-decisions-v1")refresh()};
  window.addEventListener("storage",onStorage);window.addEventListener("uc-hr-final-approval-changed",refresh);
  return ()=>{window.removeEventListener("storage",onStorage);window.removeEventListener("uc-hr-final-approval-changed",refresh)};
 },[]);
 useEffect(()=>{if(!confirm&&!openDoc)return;
  const onKey=(e:KeyboardEvent)=>{if(e.key==="Escape"){setConfirm(null);setOpenDoc(null)}};
  document.addEventListener("keydown",onKey);return ()=>document.removeEventListener("keydown",onKey);
 },[confirm,openDoc]);
 const eligible=useMemo(()=>DEMO_APPROVAL_REQUESTS.filter(x=>(branch==="All Shops"||x.branch===branch)&&x.assignedApprover===KATE_DEMO_USERNAME),[branch]);
 const counts=useMemo(()=>Object.fromEntries(tabs.map(t=>[t.id,eligible.filter(r=>t.id==="history"?store.decisions.some(d=>d.requestId===r.id):matchesTab(getApprovalStatus(r,store),t.id)).length])) as Record<Tab,number>,[eligible,store]);
 const filtered=useMemo(()=>eligible.filter(r=>(tab==="history"?store.decisions.some(d=>d.requestId===r.id):matchesTab(getApprovalStatus(r,store),tab))&&(source==="All"||r.source===source)&&`${r.id} ${r.requestor} ${r.branch} ${r.category} ${r.description}`.toLowerCase().includes(search.toLowerCase())),[eligible,store,tab,source,search]);
 const selected=eligible.find(x=>x.id===selectedId&&filtered.some(y=>y.id===x.id))||filtered[0];
 const status=selected?getApprovalStatus(selected,store):null;
 const currentDecision=selected?[...store.decisions].reverse().find(d=>d.requestId===selected.id&&d.fingerprint===approvalFingerprint(selected)):undefined;
 useEffect(()=>{if(!loaded||!selected||lastViewed.current===selected.id)return;lastViewed.current=selected.id;writeAuditEvent({module:"Ms Kate Final Approvals",action:"Viewed request for approval",recordId:selected.id,summary:`${selected.source} demo; ${selected.sourceRevision}; review metadata only`,actor:username,role});},[loaded,selected?.id,role,username]);
 function view(req:FinalApprovalRequest){setSelectedId(req.id);setMessage("");}
 function choose(decision:KateDecision){if(!selected)return;setConfirm(decision);setRemark("");setFormError("");setMessage("")}
 function submit(){if(!selected||!confirm||busy)return;
  const error=checkFinalDecision(selected,readDecisionStore(),{role,username},confirm,remark);
  if(error){setFormError(error);return}
  setBusy(true);
  try{
   const saved=saveDemoDecision(selected,{role,username},confirm,remark);
   writeAuditEvent({module:"Ms Kate Final Approvals",action:saved.decision,recordId:saved.requestId,summary:`${saved.source} demo; ${saved.sourceRevision}; ${saved.beforeStatus} → ${saved.afterStatus}. Remarks recorded in final-approval history.`,actor:username,role,beforeStatus:saved.beforeStatus,afterStatus:saved.afterStatus,remarks:saved.remarks});
   setStore(readDecisionStore());setConfirm(null);setRemark("");setMessage(`${selected.id}: ${saved.afterStatus}. This is a DEMO decision only; no fund release was executed.`);
   setTab(saved.decision==="Approved for Release"?"approved":saved.decision==="Rejected by Ms Kate"?"rejected":"returned");
  }catch(e){setFormError(e instanceof Error?e.message:"Could not save the demo decision. Check browser storage.")}
  finally{setBusy(false)}
 }
 if(!allowedView)return <section className="panel"><h3>Not authorized</h3><p>Only the assigned final approver and authorized Super Admin overview can open this dashboard.</p></section>;
 return <div className={styles.root}>
  <section className={styles.hero}>
   <div><span className={styles.eyebrow}><ShieldCheck size={15}/> SPECIAL FINAL APPROVER • DEMO ONLY</span><h2>Ms Kate — Final Approval Dashboard</h2>
    <p>Second-level approval after Accounting. CMS requests below are static read-only fixtures, <b>not connected to CMS or Accounting</b>. An approved decision authorizes a future release step; it does not release funds.</p></div>
   <div className={styles.heroTag}><b>{isKate?"Assigned final approver":"Super Admin overview"}</b><small>{username} · {branch}</small></div>
  </section>
  <div className={styles.stats}>
   <div><Clock3 size={19}/><span>Pending my approval</span><b>{counts.pending}</b></div>
   <div><CheckCircle2 size={19}/><span>Approved for release</span><b>{counts.approved}</b></div>
   <div><XCircle size={19}/><span>Rejected</span><b>{counts.rejected}</b></div>
   <div><RotateCcw size={19}/><span>Returned</span><b>{counts.returned}</b></div>
  </div>
  <div className={styles.tabs} role="group" aria-label="Approval status views">{tabs.map(t=><button type="button" key={t.id} aria-pressed={tab===t.id} className={tab===t.id?styles.active:""} onClick={()=>{setTab(t.id);setMessage("")}}>{t.label}<span>{counts[t.id]}</span></button>)}</div>
  {message&&<div className={styles.success} role="status"><CheckCircle2 size={16}/>{message}</div>}
  <div className={styles.layout}>
   <section className={styles.queue} aria-label="Assigned requests">
    <div className={styles.filters}><label><Search size={16}/><input aria-label="Search final approval requests" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search requests..."/></label><select aria-label="Filter by request source" value={source} onChange={e=>setSource(e.target.value)}><option>All</option><option>CMS</option><option>HRMS</option></select></div>
    <div className={styles.queueHeader}>{filtered.length} {tab==="history"?"requests (including decisions)":"matching requests"} · {branch}</div>
    {filtered.map(req=>{const current=getApprovalStatus(req,store);return <button type="button" key={req.id} onClick={()=>view(req)} className={`${styles.requestRow} ${selected?.id===req.id?styles.selected:""}`}>
     <div className={styles.requestHeading}><strong>{req.id}</strong><span>{req.source} · Demo</span></div>
     <div className={styles.requestDesc}>{req.description}</div><div className={styles.requestMeta}>{req.branch} · {amountPH(req.amount)}</div><span className={`${styles.status} ${statusType(current)}`}>{current}</span><ChevronRight className={styles.rowChevron} size={16}/>
    </button>})}
    {filtered.length===0&&<div className={styles.empty}>{loaded?"No matching demo requests in this view.":"Loading demo approval state…"}</div>}
   </section>
   <section className={styles.detail} aria-label="Request details">
    {!selected?<div className={styles.empty}>Choose a request from another tab to review its details.</div>:<>
     <div className={styles.detailHeader}><div><small>Assigned final approval · {selected.source} DEMO</small><h3>{selected.id}</h3><span className={`${styles.status} ${status?statusType(status):""}`}>{status}</span></div><div className={styles.amount}>{amountPH(selected.amount)}<small>Requested amount · {selected.currency}</small></div></div>
     <h4>{selected.description}</h4><p className={styles.description}>{selected.purpose}</p>
     <div className={styles.fields}><div><small>Requestor</small><b>{selected.requestor}</b></div><div><small>Originating system</small><b>{selected.source} · Demo</b></div><div><small>Branch</small><b>{selected.branch}</b></div><div><small>Category</small><b>{selected.category}</b></div><div><small>Source revision</small><b>{selected.sourceRevision}</b></div><div><small>Assigned approver</small><b>Ms Kate</b></div></div>
     <div className={styles.sectionHead}><h4>Accounting first-level review</h4><span className={`${styles.status} ${selected.accounting.status==="Approved"?styles.approved:styles.waiting}`}>{selected.accounting.status}</span></div>
     <div className={styles.review}><div><small>Accounting approver</small><b>{selected.accounting.approver||"Not yet assigned"}</b></div><div><small>Timestamp</small><b>{formatPhilippinesTime(selected.accounting.approvedAt)}</b></div><p>{selected.accounting.remarks||"No remarks provided."}</p>
      {status==="Accounting Reapproval Required"&&<p className={styles.caution}><AlertTriangle size={16}/> Existing Accounting approval does not match this material request revision. Reapproval required.</p>}
     </div>
     <div className={styles.sectionHead}><h4>Supporting documents</h4><small>{selected.documents.length} demo references</small></div>
     <div className={styles.documents}>{selected.documents.map(doc=><button type="button" key={doc.id} onClick={()=>setOpenDoc(doc)}><FileText size={17}/><span><b>{doc.name}</b><small>{doc.kind} · Demo metadata only</small></span><ArrowRight size={15}/></button>)}</div>
     <div className={styles.sectionHead}><h4>Complete approval timeline</h4><History size={17}/></div>
     <ol className={styles.timeline}>{[...selected.timeline,...store.decisions.filter(d=>d.requestId===selected.id).map(d=>({at:d.decidedAt,actor:d.actor,role:d.role,stage:"Ms Kate",status:d.decision,remarks:d.remarks}))].sort((a,b)=>a.at.localeCompare(b.at)).map((item,i)=><li key={`${item.stage}-${item.at}-${i}`}><small>{formatPhilippinesTime(item.at)} · {item.role}</small><b>{item.stage}: {item.status}</b><p>{item.actor} · {item.remarks}</p></li>)}</ol>
     {currentDecision&&<p className={styles.previous}>Current demo decision by {currentDecision.actor} · {formatPhilippinesTime(currentDecision.decidedAt)}</p>}
     {isKate&&status==="Pending Ms Kate Approval"&&<div className={styles.actions}>
      <button type="button" className={styles.primary} onClick={()=>choose("Approved for Release")}><CheckCircle2 size={17}/> Approve for Release</button>
      <button type="button" onClick={()=>choose("Returned for Revision")}><RotateCcw size={17}/> Return</button>
      <button type="button" className={styles.danger} onClick={()=>choose("Rejected by Ms Kate")}><XCircle size={17}/> Reject</button>
     </div>}
     {status!=="Pending Ms Kate Approval"&&<p className={styles.locked}><Info size={15}/> No final-approval action available at this stage. Return/rejection must be corrected and reapproved by Accounting before a new revision can return here.</p>}
     {!isKate&&<p className={styles.locked}><ShieldCheck size={15}/> Overview only. Super Admin is not automatically delegated Ms Kate approval authority.</p>}
    </>}
   </section>
  </div>
  <p className={styles.disclaimer}>Frontend demonstration only. Browser data can be edited or cleared and is not secure evidence, bank authorization, or a live cross-system integration. Release execution belongs to authorized Accounting/disbursement workflows in the future shared database.</p>
  {confirm&&selected&&createPortal(<div className={styles.modalBack} onMouseDown={e=>{if(e.target===e.currentTarget&&!busy)setConfirm(null)}} role="presentation"><section role="dialog" aria-modal="true" aria-labelledby="kate-modal-title" className={styles.modal}>
    <div className={styles.modalHead}><div><small>Confirm second-level approval · DEMO</small><h3 id="kate-modal-title">{actionLabels[confirm]}</h3></div><button type="button" aria-label="Close confirmation" disabled={busy} onClick={()=>setConfirm(null)}><X size={20}/></button></div>
    <p>Request <b>{selected.id}</b> · {amountPH(selected.amount)} · {selected.branch}</p>
    <p className={styles.caution}><AlertTriangle size={16}/> This records a browser-only final decision. It will NOT transfer money, release funds, or modify CMS/Accounting records.</p>
    <label className={styles.remarkLabel}>Remarks {confirm==="Approved for Release"?"(optional)":"(required, minimum 5 characters)"}<textarea rows={4} maxLength={1000} autoFocus value={remark} onChange={e=>{setRemark(e.target.value);setFormError("")}} placeholder={confirm==="Approved for Release"?"Approval remarks (optional)":"Explain the rejection or corrections required"}/></label>
    {formError&&<p className={styles.error} role="alert">{formError}</p>}
    <div className={styles.modalButtons}><button type="button" disabled={busy} onClick={()=>setConfirm(null)}>Cancel</button><button type="button" disabled={busy} className={confirm==="Rejected by Ms Kate"?styles.danger:styles.primary} onClick={submit}>{busy?"Recording…":`Confirm: ${actionLabels[confirm]}`}</button></div>
   </section></div>,document.body)}
  {openDoc&&createPortal(<div className={styles.modalBack} onMouseDown={e=>{if(e.target===e.currentTarget)setOpenDoc(null)}} role="presentation"><section role="dialog" aria-modal="true" aria-label="Demo document information" className={styles.modal}><div className={styles.modalHead}><h3>{openDoc.name}</h3><button aria-label="Close document details" type="button" onClick={()=>setOpenDoc(null)}><X size={19}/></button></div><p>{openDoc.description}</p><p className={styles.caution}>No file is attached to this demo reference. Production document access must be authorized by the owning system.</p><div className={styles.modalButtons}><button type="button" onClick={()=>setOpenDoc(null)}>Close</button></div></section></div>,document.body)}
 </div>;
}
