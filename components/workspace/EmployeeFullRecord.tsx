"use client";
import {ArrowRight, BriefcaseBusiness, ContactRound, PhoneCall, ShieldCheck} from "lucide-react";
import type {HRPerson,PremiumProfile} from "../../lib/hrState";
import {type PayRateChange} from "../../lib/payrollConfig";
import {employeePaySnapshot} from "../../lib/employee201Rates";

export type EmployeeFullDraft=Pick<HRPerson,"name"|"gender"|"email"|"phone"|"birthDate"|"civilStatus"|"address"|"emergencyName"|"emergencyRelationship"|"emergencyPhone"|"sssNumber"|"philhealthNumber"|"pagibigNumber"|"tinNumber"|"monthlyWorkDays"|"hoursPerDay"|"nationality"|"placeOfBirth"|"middleName"|"suffix"|"emergencyAddress">;
const keys:readonly (keyof EmployeeFullDraft)[]=["name","gender","email","phone","birthDate","civilStatus","address","emergencyName","emergencyRelationship","emergencyPhone","sssNumber","philhealthNumber","pagibigNumber","tinNumber","monthlyWorkDays","hoursPerDay","nationality","placeOfBirth","middleName","suffix","emergencyAddress"];
export function toEmployeeFullDraft(person:HRPerson):EmployeeFullDraft{
 return Object.fromEntries(keys.map(key=>[key,person[key]??(key==="monthlyWorkDays"||key==="hoursPerDay"?undefined:"")])) as EmployeeFullDraft;
}
const money=(v:number)=>new Intl.NumberFormat("en-PH",{style:"currency",currency:"PHP",maximumFractionDigits:2}).format(v);
const show=(v:unknown)=>v===undefined||v===null||String(v).trim()===""?"Not recorded":String(v);
const fields:[keyof EmployeeFullDraft,string,string?][]= [
 ["name","Legal full name"],["middleName","Middle name"],["suffix","Suffix"],["gender","Gender"],["birthDate","Date of birth","date"],["placeOfBirth","Place of birth"],["nationality","Nationality"],["civilStatus","Civil status"],["address","Complete residence address"],["email","Email","email"],["phone","Mobile / phone","tel"],
 ["emergencyName","Emergency contact"],["emergencyRelationship","Relationship"],["emergencyPhone","Emergency phone","tel"],["emergencyAddress","Emergency address"],
 ["sssNumber","SSS number"],["philhealthNumber","PhilHealth number"],["pagibigNumber","Pag-IBIG MID number"],["tinNumber","TIN"]
];
export type EmployeeInfoSection="personal"|"emergency"|"employment"|"government";
export const statutoryMask=(value?:string)=>{
 const v=(value||"").trim();
 return v ? `${"•".repeat(Math.min(8,Math.max(4,v.length-4)))}${v.slice(-4)}` : "Not recorded";
};
export default function EmployeeFullRecord({person,draft,onDraft,editing,rateChanges,rates,onOpenPayroll,probation,sil,vil,onOpenSection}:{person:HRPerson;draft:EmployeeFullDraft|null;onDraft:(next:EmployeeFullDraft)=>void;editing:boolean;rateChanges:PayRateChange[];rates:Record<string,PremiumProfile>;onOpenPayroll?:()=>void;probation:number;sil:number;vil:number;onOpenSection:(section:EmployeeInfoSection)=>void}){
 const snapshot=employeePaySnapshot(person,rates,rateChanges);
 const amounts:[string,number|null,number,string][]= [
  ["Ordinary day / daily rate",snapshot.daily,100,"per day"],
  ["Hourly rate",snapshot.hourly,100,"per hour"],
  ["OT · ordinary day",snapshot.ot,snapshot.premium.ot,"per hour"],
  ["HP · regular holiday",snapshot.hp,snapshot.premium.regular,"per day"],
  ["SHP · special non-working holiday",snapshot.shp,snapshot.premium.special,"per day"],
  ["RDW · rest day work",snapshot.rdw,snapshot.premium.rdw,"per day"],
  ["RDOT · rest day overtime",snapshot.rdot,snapshot.premium.rdot,"per hour"]
 ];
 const set=(key:keyof EmployeeFullDraft,value:string)=>{if(!draft)return;onDraft({...draft,[key]:key==="hoursPerDay"||key==="monthlyWorkDays"?(value===""?undefined:Number(value)):value})};
 const info=(label:string,value:unknown)=><div className="employee-full-field" key={label}><small>{label}</small><strong>{show(value)}</strong></div>;
 const render=(from:number,to:number)=>fields.slice(from,to).map(([key,label,type])=><label className="employee-full-field" key={key}><small>{label}</small>{editing&&draft?<input aria-label={label} type={type||"text"} value={String(draft[key]??"")} maxLength={key.endsWith("Number")?24:200} onChange={e=>set(key,e.target.value)}/>:<strong>{from===15?statutoryMask(String(person[key]||"")):show(person[key])}</strong>}</label>);
 const employmentFacts:[string,unknown][]=[["Employee ID",person.id],["Branch",person.branch],["Department",person.department],["Position",person.position],["Employment status",person.status],["Job level",person.jobLevel],["Employment arrangement",person.employmentArrangement],["Hire date",person.hire],["Probation period",`${probation} months`],["SIL leave credits",`${sil} days`],["VIL leave credits",`${vil} days`]];
 const summary=(items:[string,unknown][])=>items.map(([label,value])=><div className="emp201-info-fact" key={label}><small>{label}</small><strong>{show(value)}</strong></div>);
 const cards:[EmployeeInfoSection,string,typeof ContactRound,[string,unknown][],[number,number]?][]= [
  ["personal","Personal Information",ContactRound,[["Full name",person.name],["Gender",person.gender],["Date of birth",person.birthDate],["Email",person.email]],[0,11]],
  ["emergency","Emergency Contact",PhoneCall,[["Contact name",person.emergencyName],["Relationship",person.emergencyRelationship],["Phone",person.emergencyPhone],["Address",person.emergencyAddress]],[11,15]],
  ["employment","Employment & Assignment",BriefcaseBusiness,employmentFacts.slice(0,6)],
  ["government","Government & Statutory",ShieldCheck,[["SSS",statutoryMask(person.sssNumber)],["PhilHealth",statutoryMask(person.philhealthNumber)],["Pag-IBIG",statutoryMask(person.pagibigNumber)],["TIN",statutoryMask(person.tinNumber)]],[15,19]]
 ];
 return <div className="employee-full-record">
  <section className="emp201-information-container" aria-label="Employee information" id="emp201-personal">
   <div className="emp201-information-heading"><h3>Employee Information</h3><span>{editing?"Editing profile fields":"Select a card for full details and recorded history"}</span></div>
   <div className="emp201-information-grid">
    {cards.map(([id,title,Icon,items,range])=><article className="emp201-information-card" key={id} id={id==="employment"?"emp201-employment":undefined} onClick={event=>{if(!editing&&!(event.target as HTMLElement).closest("button"))onOpenSection(id)}}>
     <button type="button" className="emp201-information-trigger" disabled={editing} onClick={()=>onOpenSection(id)} aria-label={`View ${title} details and history`}>
      <span><Icon size={17}/><b>{title}</b></span><span>Details & History <ArrowRight size={14}/></span>
     </button>
     <div className="emp201-information-body">{editing&&draft&&range?render(...range):summary(items)}</div>
     {id==="government"&&<small className="emp201-information-caution">Identifiers masked in read-only views. Demo storage is not secure production storage.</small>}
    </article>)}
   </div>
  </section>
  <section className="employee-full-section" id="emp201-compensation"><div className="employee-full-head"><h3>Compensation & Premium Rates</h3>{onOpenPayroll&&<button type="button" className="secondary" onClick={onOpenPayroll}>Open Payroll Rate Controls ↗</button>}</div><div className="employee-full-grid">
   {info("Basic salary",`${money(snapshot.basic)} / ${person.salaryType==="Daily"?"day":"month"}`)}{info("Pay classification",person.salaryType)}{info("Basic rate effective date",snapshot.basicEffective||"Not recorded")}
   <label className="employee-full-field"><small>Monthly working-day divisor</small>{editing&&draft?<input type="number" min="1" max="31" step="0.5" value={draft.monthlyWorkDays??""} onChange={e=>set("monthlyWorkDays",e.target.value)} placeholder="Required to derive monthly daily rate"/>:<strong>{person.monthlyWorkDays??"Not configured"}</strong>}</label>
   <label className="employee-full-field"><small>Working hours per day</small>{editing&&draft?<input type="number" min="1" max="24" step="0.5" value={draft.hoursPerDay??""} onChange={e=>set("hoursPerDay",e.target.value)} placeholder="Required for hourly rates"/>:<strong>{person.hoursPerDay??"Not configured"}</strong>}</label>
   {amounts.map(([label,amount,multiplier,unit])=><div className="employee-full-field" key={label}><small>{label}{label.includes("·")?` (${multiplier}%)`:""}</small><strong>{amount===null?"Set divisor and hours":`${money(amount)} ${unit}`}</strong></div>)}
   {info("Disbursement method",person.salaryDestination?.channel)}{info("Disbursement verification",person.salaryDestination?.status)}
  </div><p className="employee-full-hint">Premiums shown are calculated using the HRMS reference multipliers, not a legally verified payroll calculation. Basic pay changes are made in Payroll Management; this profile does not bypass that approval process. Monthly-to-daily conversion requires an explicitly configured divisor.</p></section>
 </div>;
}
