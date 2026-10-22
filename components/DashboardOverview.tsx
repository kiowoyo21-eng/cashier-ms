"use client";
import {useEffect,useMemo,useState} from "react";
import {ArrowRight,BriefcaseBusiness,ClipboardCheck,FileWarning,ShieldCheck,TrendingDown,TrendingUp,UserRound,Users,Wallet} from "lucide-react";
import {useHR} from "../lib/hrState";
import {php} from "../lib/people";
import {isHrRole,type Branch,type ModuleId,type Role} from "../lib/mock";
import {FORM_STORE_EVENT,FORM_STORE_KEY,readForms,type HRFormRecord} from "../lib/hrForms";
import {seedIncidents,type IncidentCase} from "../lib/incidentRecords";
import {watchAuditEvents} from "../lib/auditTrail";
import {dashboardEmployeeSummary,dashboardRequestSummary,lastCompletedMonth} from "../lib/dashboardAnalytics";
import styles from "./DashboardOverview.module.css";

const INCIDENT_STORAGE_KEY="uc-hr-ui-incident";
function readIncidents():IncidentCase[]{
 try{const raw=localStorage.getItem(INCIDENT_STORAGE_KEY);if(!raw)return seedIncidents;const parsed=JSON.parse(raw) as unknown;return Array.isArray(parsed)?parsed.filter((c):c is IncidentCase=>!!c&&typeof c==="object"&&typeof c.id==="string"&&typeof c.branch==="string"&&typeof c.stage==="string"&&typeof c.handler==="string").slice(0,1200):seedIncidents;}catch{return seedIncidents}
}
type Metric={label:string;value:string|number;icon:typeof Users;hint?:string};
export default function DashboardOverview({branch,role,username,onNavigate}:{branch:Branch;role:Role;username:string;onNavigate:(id:ModuleId)=>void}){
 const {data,ready}=useHR();
 const [forms,setForms]=useState<HRFormRecord[]>([]);
 const [incidents,setIncidents]=useState<IncidentCase[]>([]);
 const [loaded,setLoaded]=useState(false);
 const [month]=useState(()=>lastCompletedMonth());
 useEffect(()=>{
  const sync=()=>{setForms(readForms());setIncidents(readIncidents());setLoaded(true)};
  sync();const unwatch=watchAuditEvents(sync);
  const onStorage=(e:StorageEvent)=>{if(e.key===FORM_STORE_KEY||e.key===INCIDENT_STORAGE_KEY)sync()};
  window.addEventListener(FORM_STORE_EVENT,sync);window.addEventListener("storage",onStorage);window.addEventListener("focus",sync);
  return()=>{unwatch();window.removeEventListener(FORM_STORE_EVENT,sync);window.removeEventListener("storage",onStorage);window.removeEventListener("focus",sync)};
 },[]);
 const employee=useMemo(()=>dashboardEmployeeSummary(data,branch,month),[data,branch,month]);
 const requests=useMemo(()=>dashboardRequestSummary(forms,incidents,branch,role,username),[forms,incidents,branch,role,username]);
 const showHR=isHrRole(role)||role==="Super Admin";
 const metrics:Metric[]=[
  {label:"Total employees",value:ready?employee.total:"—",icon:Users,hint:ready&&employee.unspecified?`${employee.unspecified} gender unspecified`:undefined},
  {label:"Male",value:ready?employee.male:"—",icon:UserRound},
  {label:"Female",value:ready?employee.female:"—",icon:Users},
  {label:"Hired this period",value:ready?employee.hires:"—",icon:TrendingUp},
  {label:"Separated this period",value:ready?employee.exits:"—",icon:TrendingDown,hint:ready&&employee.terminations?`${employee.terminations} terminations`:undefined},
  ...(showHR?[{label:"Gross salary released",value:ready?(employee.salaryCount?php(employee.salaryGross):"No releases"):"—",icon:Wallet,hint:ready?`${employee.salaryCount} reviewed release(s) · ${employee.sampleReleasesExcluded} sample excluded`:undefined}]:[])
 ];
 const requestStats=[{label:"Requests",value:requests.totalRequests},{label:"Incident reports",value:requests.totalReports},{label:"Pending / open",value:requests.pending},{label:"Resolved / closed",value:requests.resolved}];
 const taskStats=[{label:"My pending",value:requests.ownPending},{label:"My resolved",value:requests.ownCompleted},...(showHR?[{label:"For my review",value:requests.toReview},{label:"Reviewed",value:requests.completedReviews}]:[])];
 return <section className={styles.overview} aria-label="Dashboard analytics">
  <header className={styles.header}><div><h2>HR Dashboard</h2><p>Workforce and requests <span aria-hidden="true">·</span> {branch}</p></div><div className={styles.headerRight}><span className={styles.period}>Completed month <b>{month}</b></span>{showHR&&<button type="button" onClick={()=>onNavigate("demographics")}>Demographics <ArrowRight size={15}/></button>}</div></header>
  <div className={styles.sectionHeading}><h3>Workforce at a glance</h3><span>Headcount as recorded · movements in {month}</span></div>
  <div className={styles.cards}>{metrics.map(({label,value,icon:Icon,hint})=><article className={styles.metric} key={label}>
   <div className={styles.metricTitle}><span className={styles.iconBox}><Icon size={17}/></span><span>{label}</span></div>
   <strong className={typeof value==="string"&&value.startsWith("No ")?styles.textValue:undefined}>{value}</strong>
   {hint&&<small>{hint}</small>}
  </article>)}</div>
  <div className={styles.sectionHeading}><h3>People movements & requests</h3></div>
  <div className={styles.panels}>
   {showHR&&<section className={styles.panel}><div className={styles.panelTitle}><span className={styles.panelIcon}><BriefcaseBusiness size={17}/></span><h3>Hiring & separation by position</h3></div>
    {employee.positions.length?<div className={styles.tablewrap}><table><thead><tr><th>Position</th><th>Hired</th><th>Separated</th><th>Terminated</th></tr></thead><tbody>{employee.positions.map(row=><tr key={row.position}><td>{row.position}</td><td>{row.gained}</td><td>{row.lost}</td><td>{row.terminations}</td></tr>)}</tbody></table></div>:<p className={styles.empty}>No recorded hires or applied separations in {month}.</p>}
    <div className={styles.links}><button type="button" onClick={()=>onNavigate("lifecycle")}>Open Hiring <ArrowRight size={14}/></button></div>
   </section>}
   <section className={styles.panel}><div className={styles.panelTitle}><span className={styles.panelIcon}><FileWarning size={17}/></span><h3>Requests & complaints</h3></div>
    <div className={styles.mini}>{requestStats.map(s=><div key={s.label}><span>{s.label}</span><b>{loaded?s.value:"—"}</b></div>)}</div>
    <div className={styles.links}><button type="button" onClick={()=>onNavigate("hr-forms")}>Requests <ArrowRight size={14}/></button><button type="button" onClick={()=>onNavigate("ir")}>Incident reports <ArrowRight size={14}/></button></div>
   </section>
   <section className={styles.panel}><div className={styles.panelTitle}><span className={styles.panelIcon}><ClipboardCheck size={17}/></span><h3>My workload</h3></div>
    <div className={styles.mini}>{taskStats.map(s=><div key={s.label}><span>{s.label}</span><b>{loaded?s.value:"—"}</b></div>)}</div>
    <div className={styles.links}><button type="button" onClick={()=>onNavigate("hr-forms")}>Open My Tasks <ArrowRight size={14}/></button></div>
   </section>
  </div>
  {showHR&&<p className={styles.disclaimer}><ShieldCheck size={14}/> Salary is based only on browser-reviewed gross releases for {month}, not on basic pay estimates or a verified Accounting expense report. Sample releases are excluded.</p>}
 </section>;
}
