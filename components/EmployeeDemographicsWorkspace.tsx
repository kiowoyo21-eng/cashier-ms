"use client";
import {useEffect,useMemo,useState} from "react";
import {Users,UserRound,Wallet,CalendarDays,AlertCircle,BriefcaseBusiness,Building2,Clock3,Layers3,ChartColumnIncreasing} from "lucide-react";
import type {Branch,Role} from "../lib/mock";
import {useHR,money} from "../lib/hrState";
import {demographicRows,demographicsCsv,demographicsSummaryCsv,employmentArrangements,groupCounts,jobLevels,sumByGender,getArrangement,getLevel,type DemographicRow,type EmploymentArrangement,type JobLevel} from "../lib/employeeDemographics";
import styles from "./HROperationsExtras.module.css";

const download=(content:string,name:string)=>{const link=document.createElement("a"),url=URL.createObjectURL(new Blob(["\uFEFF",content],{type:"text/csv;charset=utf-8"}));link.href=url;link.download=name;link.click();window.setTimeout(()=>URL.revokeObjectURL(url),500)};
const initial=()=>{const parts=new Intl.DateTimeFormat("en-US",{timeZone:"Asia/Manila",year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(new Date());const get=(type:string)=>parts.find(p=>p.type===type)?.value||"";return `${get("year")}-${get("month")}-${get("day")}`};
export default function EmployeeDemographicsWorkspace({branch,role}:{branch:Branch;role:Role}){
 const {data,update}=useHR();
 const [asOf,setAsOf]=useState(initial);
 const [reference,setReference]=useState("");
 const [level,setLevel]=useState("All"),[arrangement,setArrangement]=useState("All"),[department,setDepartment]=useState("All"),[gender,setGender]=useState("All"),[wageGroup,setWageGroup]=useState("All"),[search,setSearch]=useState("");
 const [selectedId,setSelectedId]=useState(""),[editLevel,setEditLevel]=useState<JobLevel>("Not recorded"),[editArrangement,setEditArrangement]=useState<EmploymentArrangement>("Not recorded"),[message,setMessage]=useState("");
 const canEdit=role==="HR"||role==="Super Admin"||role==="Special Final Approver — Ms Kate";
 const selectedWage=(data.payrollConfig?.minimumWages||[]).find(w=>w.id===reference);
 const scoped=useMemo(()=>data.people.filter(p=>branch==="All Shops"||p.branch===branch),[data.people,branch]);
 const rows=useMemo(()=>demographicRows(scoped,data.payrollConfig?.rateChanges||[],asOf,selectedWage),[scoped,data.payrollConfig?.rateChanges,asOf,selectedWage]);
 const visible=useMemo(()=>rows.filter(r=>(level==="All"||r.level===level)&&(arrangement==="All"||r.arrangement===arrangement)&&(department==="All"||r.department===department)&&(gender==="All"||r.gender===gender)&&(wageGroup==="All"||r.wageClass===wageGroup)&&`${r.id} ${r.name} ${r.branch} ${r.department} ${r.level} ${r.arrangement}`.toLowerCase().includes(search.toLowerCase().trim())),[rows,level,arrangement,department,gender,wageGroup,search]);
 const male=sumByGender(visible,"Male"),female=sumByGender(visible,"Female"),unknown=sumByGender(visible,"Unspecified");
 const selected=useMemo(()=>scoped.find(p=>p.id===selectedId&&visible.some(r=>r.id===p.id)),[scoped,selectedId,visible]);
 useEffect(()=>{setSelectedId("");setMessage("")},[branch]);
 const selectEmployee=(id:string)=>{const person=scoped.find(p=>p.id===id);if(!person)return;setSelectedId(id);setEditLevel(getLevel(person));setEditArrangement(getArrangement(person));setMessage("")};
 const save=()=>{if(!canEdit||!selected)return;update(s=>({...s,people:s.people.map(p=>p.id===selected.id&&p.branch===selected.branch?{...p,jobLevel:editLevel,employmentArrangement:editArrangement}:p)}));setMessage("Classification saved in browser-local Employee 201. Existing rates and employment status were not changed.")};
 const totalKnown=male.monthly+female.monthly+unknown.monthly;
 const dollars=(n:number)=>money(n);
 const breakdowns=[
  {name:"Job level",field:"level" as const,icon:Layers3},
  {name:"Employment arrangement",field:"arrangement" as const,icon:BriefcaseBusiness},
  {name:"Employment status",field:"status" as const,icon:Users},
  {name:"Age bands · recorded DOB",field:"ageBand" as const,icon:CalendarDays},
  {name:"Tenure bands",field:"tenureBand" as const,icon:Clock3},
  {name:"Recorded gender",field:"gender" as const,icon:UserRound},
  {name:"Branch",field:"branch" as const,icon:Building2},
  {name:"Department",field:"department" as const,icon:Layers3},
  {name:"Wage-reference comparison",field:"wageClass" as const,icon:Wallet}
 ];
 const counts=({name,field,icon:Icon}:typeof breakdowns[number])=> <section className={styles.panel} key={name}><h3 className={styles.cardHeading}><span className={styles.iconShell}><Icon size={16}/></span>{name}</h3><div className={styles.pairs}>{groupCounts(visible,field).map(([label,count])=><div className={styles.pair} key={label}><span>{label}</span><b>{count}</b></div>)}</div></section>;
 return <div className={styles.wrap}>
  <div className={styles.head}><div><h2>Employee Demographics & Compensation</h2><p>Employee 201 classifications and effective-dated pay references · {branch}</p></div><div className={styles.actions}><button type="button" className={styles.secondary} onClick={()=>download(demographicsSummaryCsv(visible,asOf),`hrms-demographics-summary-${asOf}.csv`)}>Export aggregate summary</button><button type="button" className={styles.secondary} onClick={()=>download(demographicsCsv(visible),`hrms-demographics-reference-${asOf}.csv`)}>Export employee listing</button></div></div>
  <div className={styles.notice}>Browser-local fictional/demo employee records. Gender/sex data is based only on recorded values; unknown stays unspecified. Annual figures are <b>monthlyized basic rate × 12</b>, not actual payroll or statutory annual compensation. Daily-to-monthly conversion requires recorded working days/month. No individual wage is automatically treated as legally compliant.</div>
  <section className={styles.panel}><div className={styles.toolbar}>
   <label className={styles.field}>As-of date<input type="date" value={asOf} onChange={e=>setAsOf(e.target.value||initial())}/></label>
   <label className={styles.field}>Job level<select value={level} onChange={e=>setLevel(e.target.value)}><option>All</option>{jobLevels.map(x=><option key={x}>{x}</option>)}</select></label>
   <label className={styles.field}>Employment arrangement<select value={arrangement} onChange={e=>setArrangement(e.target.value)}><option>All</option>{employmentArrangements.map(x=><option key={x}>{x}</option>)}</select></label>
   <label className={styles.field}>Department<select value={department} onChange={e=>setDepartment(e.target.value)}><option>All</option>{[...new Set(rows.map(x=>x.department))].sort().map(x=><option key={x}>{x}</option>)}</select></label>
   <label className={styles.field}>Recorded gender<select value={gender} onChange={e=>setGender(e.target.value)}><option>All</option><option>Male</option><option>Female</option><option>Unspecified</option></select></label>
   <label className={styles.field}>Employee search<input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Name, ID, branch"/></label>
   <label className={styles.field}>Reference-wage comparison<select value={wageGroup} onChange={e=>setWageGroup(e.target.value)}><option>All</option><option>At reference minimum</option><option>Above reference minimum</option><option>Below reference minimum</option><option>Not comparable</option></select></label>
   <label className={styles.field}>Minimum-wage reference<select value={reference} onChange={e=>setReference(e.target.value)}><option value="">None — not classified</option>{(data.payrollConfig?.minimumWages||[]).map(w=><option key={w.id} value={w.id}>{w.region} · {w.classification} · {money(w.amount)}/day ({w.effective})</option>)}</select></label>
   <button className={styles.secondary} type="button" onClick={()=>{setLevel("All");setArrangement("All");setDepartment("All");setGender("All");setWageGroup("All");setSearch("");setReference("")}}>Reset</button>
  </div></section>
  <div className={styles.metrics}>{[
   {label:"Matching employees",value:String(visible.length),icon:Users},
   {label:"Male · monthly base",value:dollars(male.monthly),icon:UserRound},
   {label:"Female · monthly base",value:dollars(female.monthly),icon:UserRound},
   {label:"Known monthly base",value:dollars(totalKnown),icon:Wallet},
   {label:"Male · annualized",value:dollars(male.annual),icon:CalendarDays},
   {label:"Female · annualized",value:dollars(female.annual),icon:CalendarDays},
   {label:"Known annualized base",value:dollars(male.annual+female.annual+unknown.annual),icon:ChartColumnIncreasing},
   {label:"Missing conversion",value:String(male.withoutAmount+female.withoutAmount+unknown.withoutAmount),icon:AlertCircle}
  ].map(({label,value,icon:Icon})=><div key={label} className={styles.metric}><span className={styles.metricLabel}><span className={styles.iconShell}><Icon size={16}/></span><small>{label}</small></span><strong>{value}</strong></div>)}</div>
  <p className={styles.muted}>Unspecified gender: {unknown.count} employees · {dollars(unknown.monthly)} known monthly rate total ({unknown.withoutAmount} unconverted). Totals are incomplete when working-day divisors are missing. Gender figures are summaries, not actual salaries paid.</p>
  <div className={styles.panels}><div className={styles.breakdowns}>
   {breakdowns.map(counts)}
  </div><section className={styles.panel}><h3 className={styles.cardHeading}><span className={styles.iconShell}><BriefcaseBusiness size={16}/></span>Employee 201 classification</h3><p className={styles.muted}>Select a listed employee to record job level and employment arrangement. This does not approve a personnel change or alter pay rates.</p><label className={styles.field}>Employee<select value={selectedId} onChange={e=>selectEmployee(e.target.value)}><option value="">Select employee</option>{visible.map(p=><option key={p.id} value={p.id}>{p.id} — {p.name}</option>)}</select></label>{selected&&<div className={styles.details}><div className={styles.muted}>{selected.branch} · {selected.position} · Current status: {selected.status}</div><label className={styles.field}>Job level<select value={editLevel} onChange={e=>setEditLevel(e.target.value as JobLevel)}>{jobLevels.map(x=><option key={x}>{x}</option>)}</select></label><label className={styles.field}>Employment arrangement<select value={editArrangement} onChange={e=>setEditArrangement(e.target.value as EmploymentArrangement)}>{employmentArrangements.map(x=><option key={x}>{x}</option>)}</select></label><button type="button" disabled={!canEdit} className={styles.primary} onClick={save}>Save Employee 201 classification</button>{message&&<p role="status" className={styles.success}>{message}</p>}</div>}</section></div>
  <section className={styles.panel}><div className={styles.sectionTitle}><h3>Employee compensation reference listing</h3><span className={styles.pill}>{visible.length} matching</span></div><div className={styles.tableScroll}><table className={styles.table}><thead><tr><th>Employee</th><th>Branch</th><th>Job level</th><th>Arrangement</th><th>Gender</th><th>Basis</th><th>Basic rate</th><th>Daily equivalent</th><th>Monthly equivalent</th><th>Annualized</th><th>Minimum comparison</th></tr></thead><tbody>{visible.map((r:DemographicRow)=><tr key={r.id}><td>{r.id} · {r.name}</td><td>{r.branch}</td><td>{r.level}</td><td>{r.arrangement}</td><td>{r.gender}</td><td>{r.payBasis}</td><td>{dollars(r.basicRate)}</td><td>{r.dailyEquivalent===null?"Not recorded":dollars(r.dailyEquivalent)}</td><td>{r.monthlyEquivalent===null?"Not computable":dollars(r.monthlyEquivalent)}</td><td>{r.annualEquivalent===null?"Not computable":dollars(r.annualEquivalent)}</td><td>{r.wageClass}</td></tr>)}{!visible.length&&<tr><td colSpan={11} className={styles.empty}>No matching employees.</td></tr>}</tbody></table></div><p className={styles.muted}>Reference wage classifications require an explicitly selected wage order and valid working-day conversion. Payroll rate history is respected as of the chosen date. Verify wage-order coverage, exceptions and effective dates independently before compliance filing.</p></section>
 </div>
}
