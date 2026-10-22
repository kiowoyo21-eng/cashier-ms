import {type HRPerson,type PremiumProfile} from "../hrState";
import {type PayRateChange} from "../payrollConfig";
import {employeePaySnapshot} from "../employee201Rates";
export const variableGroups={
 "Employee 201": ["employee.id","employee.name","employee.full_name","employee.first_name","employee.last_name","employee.position","employee.department","employee.branch","employee.hire_date","employee.email","employee.phone","employee.status","employee.birth_date","employee.address","employee.civil_status","employee.middle_name","employee.suffix","employee.gender","employee.nationality","employee.place_of_birth","employee.emergency_contact","employee.emergency_relationship","employee.emergency_phone","employee.emergency_address","employee.probation_months","employee.sil_allocation","employee.vil_allocation"],
 "Compensation (confidential)": ["employee.salary_type","employee.rate_effective_date","employee.basic_rate","employee.monthly_work_days","employee.hours_per_day","employee.daily_rate","employee.hourly_rate","employee.ot_rate","employee.hp_rate","employee.shp_rate","employee.rdw_rate","employee.rdot_rate"],
 "Government (restricted)": ["employee.sss_number","employee.philhealth_number","employee.pagibig_number","employee.tin_number"],
 "Company and document": ["company.name","document.date","document.year","document.reference"],
 "Custom fields": ["custom.subject","custom.message","custom.purpose","custom.amount","custom.remarks"]
} as const;
export const tokens=Object.values(variableGroups).flat();
export function autoValues(p:HRPerson|null,custom:Record<string,string>={},context?:{rates?:Record<string,PremiumProfile>;rateChanges?:PayRateChange[]}):Record<string,string>{
 const parts=(p?.name||"").trim().split(/\s+/),date=new Date();
 const snapshot=p?employeePaySnapshot(p,context?.rates||{},context?.rateChanges||[],date.toISOString().slice(0,10)):null;
 const basic=snapshot?.basic??null;
 const daily=snapshot?.daily??null;
 const hourly=snapshot?.hourly??null;
 const pay=(n:number|null)=>n===null?"":n.toFixed(2);
 return {
 "employee.id":p?.id||"","employee.name":p?.name||"","employee.full_name":p?.name||"","employee.first_name":parts[0]||"","employee.last_name":parts.slice(1).join(" "),"employee.middle_name":p?.middleName||"","employee.suffix":p?.suffix||"","employee.gender":p?.gender||"","employee.position":p?.position||"","employee.department":p?.department||"","employee.branch":p?.branch||"","employee.hire_date":p?.hire||"","employee.email":p?.email||"","employee.phone":p?.phone||"","employee.status":p?.status||"","employee.birth_date":p?.birthDate||"","employee.address":p?.address||"","employee.civil_status":p?.civilStatus||"","employee.nationality":p?.nationality||"","employee.place_of_birth":p?.placeOfBirth||"","employee.emergency_contact":p?.emergencyName||"","employee.emergency_relationship":p?.emergencyRelationship||"","employee.emergency_phone":p?.emergencyPhone||"","employee.emergency_address":p?.emergencyAddress||"","employee.probation_months":p?String(p.probation):"","employee.sil_allocation":p?String(p.sil):"","employee.vil_allocation":p?String(p.vil):"",
 "employee.salary_type":p?.salaryType||"","employee.rate_effective_date":snapshot?.basicEffective||"","employee.basic_rate":pay(basic),"employee.monthly_work_days":p?.monthlyWorkDays?.toString()||"","employee.hours_per_day":p?.hoursPerDay?.toString()||"","employee.daily_rate":pay(daily),"employee.hourly_rate":pay(hourly),"employee.ot_rate":pay(snapshot?.ot??null),"employee.hp_rate":pay(snapshot?.hp??null),"employee.shp_rate":pay(snapshot?.shp??null),"employee.rdw_rate":pay(snapshot?.rdw??null),"employee.rdot_rate":pay(snapshot?.rdot??null),
 "employee.sss_number":p?.sssNumber||"","employee.philhealth_number":p?.philhealthNumber||"","employee.pagibig_number":p?.pagibigNumber||"","employee.tin_number":p?.tinNumber||"",
 "company.name":"Underchargers","document.date":date.toLocaleDateString("en-PH",{year:"numeric",month:"long",day:"numeric"}),"document.year":String(date.getFullYear()),"document.reference":custom["document.reference"]||"",...custom};
}
export const findTokens=(html:string)=>[...new Set([...html.matchAll(/\{\{([a-z][\w.]*)\}\}/gi)].map(x=>x[1]))];
export const fillTokens=(text:string,values:Record<string,string>)=>text.replace(/\{\{([a-z][\w.]*)\}\}/gi,(token,key:string)=>Object.prototype.hasOwnProperty.call(values,key)&&values[key]?values[key]:token);
export const escapeHtml=(text:string)=>text.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
export const fillHtml=(html:string,values:Record<string,string>)=>fillTokens(html,Object.fromEntries(Object.entries(values).map(([key,value])=>[key,escapeHtml(value)])));
