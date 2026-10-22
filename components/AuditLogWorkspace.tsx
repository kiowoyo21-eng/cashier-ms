"use client";
import {useMemo,useState} from "react";
import {Download,Search,RotateCcw,ShieldAlert} from "lucide-react";
import {isAuditAdmin,type Role} from "../lib/mock";
import type {AuditEvent} from "../lib/auditTrail";
import {exportAuditCsv,filterAuditEvents,formatAuditPhilippineTime,validAuditEvents} from "../lib/auditViews";
import styles from "./AuditLogWorkspace.module.css";

type Props={events:AuditEvent[];viewerRole:Role};
const ALL="All";
export default function AuditLogWorkspace({events,viewerRole}:Props){
 const [query,setQuery]=useState("");
 const [module,setModule]=useState(ALL);
 const [actor,setActor]=useState(ALL);
 const [action,setAction]=useState(ALL);
 const [limit,setLimit]=useState(50);
 const authorized=isAuditAdmin(viewerRole);
 const records=useMemo(()=>validAuditEvents(events),[events]);
 const options=useMemo(()=>({
  modules:[ALL,...new Set(records.map(event=>event.module))].sort((a,b)=>a===ALL?-1:b===ALL?1:a.localeCompare(b)),
  actors:[ALL,...new Set(records.map(event=>event.actor))].sort((a,b)=>a===ALL?-1:b===ALL?1:a.localeCompare(b)),
  actions:[ALL,...new Set(records.map(event=>event.action))].sort((a,b)=>a===ALL?-1:b===ALL?1:a.localeCompare(b))
 }),[records]);
 const filtered=useMemo(()=>filterAuditEvents(records,{query,module,actor,action}),[records,query,module,actor,action]);
 const visible=filtered.slice(0,limit);
 const clear=()=>{setQuery("");setModule(ALL);setActor(ALL);setAction(ALL);setLimit(50)};
 const download=()=>{
  // Local prototype export; never pretend to provide production audit evidence.
  const content=exportAuditCsv(filtered);
  const url=URL.createObjectURL(new Blob([content],{type:"text/csv;charset=utf-8"}));
  const link=document.createElement("a");link.href=url;link.download="hrms-browser-local-audit-demo.csv";link.click();
  window.setTimeout(()=>URL.revokeObjectURL(url),1000);
 };
 if(!authorized)return <section className="panel" role="alert">You do not have permission to view the audit workspace.</section>;
 return <section className={`panel ${styles.root}`} aria-label="Recorded browser audit events">
  <div className="panel-head"><div><h3>Browser Audit History</h3><p>Recorded local actions only · filtered results and CSV use the same event set</p></div><span className="count-label">{filtered.length} of {records.length}</span></div>
  <div className={styles.warning}><ShieldAlert size={19}/><span><strong>Development-only evidence.</strong> These records are stored in this browser and can be changed or deleted. No server-side verification, immutable audit, or cross-device history. Some older actions may not have been recorded. Branch scoping is unavailable for older events that have no branch metadata.</span></div>
  <div className={styles.filters}>
   <label className={styles.search}><span>Search event metadata</span><div className={styles.searchInput}><Search size={16}/><input aria-label="Search recorded events" type="search" value={query} onChange={e=>{setQuery(e.target.value);setLimit(50)}} placeholder="ID, status, action, actor..."/></div></label>
   <label><span>Module</span><select value={module} onChange={e=>{setModule(e.target.value);setLimit(50)}}>{options.modules.map(value=><option key={value}>{value}</option>)}</select></label>
   <label><span>Actor</span><select value={actor} onChange={e=>{setActor(e.target.value);setLimit(50)}}>{options.actors.map(value=><option key={value}>{value}</option>)}</select></label>
   <label><span>Action</span><select value={action} onChange={e=>{setAction(e.target.value);setLimit(50)}}>{options.actions.map(value=><option key={value}>{value}</option>)}</select></label>
  </div>
  <div className={styles.actions}>
   <button type="button" className="secondary" onClick={clear}><RotateCcw size={15}/> Clear filters</button>
   <button type="button" className="secondary" onClick={download} disabled={!filtered.length}><Download size={15}/> Export {filtered.length} filtered demo events</button>
  </div>
  {visible.length? <div className={styles.list}>
   {visible.map(event=><article className={styles.item} key={event.id}>
    <div className={styles.primary}><strong>{event.module} · {event.action}</strong><span className={styles.source}>Local demo</span></div>
    <div className={styles.meta}><span>By {event.actor} ({event.role})</span><time dateTime={event.at}>{formatAuditPhilippineTime(event.at)}</time></div>
    {event.recordId&&<p>Record ID: <code>{event.recordId}</code></p>}
    {(event.beforeStatus||event.afterStatus)&&<p>Status: {event.beforeStatus||"—"} → {event.afterStatus||"—"}</p>}
    {viewerRole==="Super Admin"&&event.summary&&<p className={styles.summary}>{event.summary}</p>}
    {viewerRole==="Super Admin"&&event.remarks&&<details><summary>View recorded approval remarks</summary><p className={styles.remarks}>{event.remarks}</p></details>}
   </article>)}
  </div>:<div className={styles.empty}>{records.length?"No recorded actions match these filters.":"No browser-local audit events have been recorded yet."}</div>}
  {visible.length<filtered.length&&<div className={styles.more}><button type="button" className="secondary" onClick={()=>setLimit(n=>Math.min(n+50,1500))}>Show more ({filtered.length-visible.length} remaining)</button></div>}
  <p className={styles.footnote}>Export excludes free-text summaries and remarks to reduce accidental disclosure. The Dashboard's illustrated sample activity is not mixed with these records.</p>
 </section>;
}
