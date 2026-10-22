/** Browser-local HR demographics and COMPENSATION REFERENCE reporting.
 * Not a statutory compliance determination or actual wages-paid report. */
import type {HRPerson} from "./hrState";
import type {PayRateChange,MinimumWage} from "./payrollConfig";
import {basicRateOnDate} from "./payrollConfig";

export const jobLevels=["Rank-and-File","Supervisory","Managerial","Not recorded"] as const;
export type JobLevel=typeof jobLevels[number];
export const employmentArrangements=["Regular","Probationary","Contractual","Project-Based","Seasonal","Casual","Fixed-Term","Other","Not recorded"] as const;
export type EmploymentArrangement=typeof employmentArrangements[number];
export type PayClass="At reference minimum"|"Above reference minimum"|"Below reference minimum"|"Not comparable";
export type DemographicRow={id:string;name:string;branch:string;department:string;level:JobLevel;arrangement:EmploymentArrangement;status:string;gender:"Male"|"Female"|"Unspecified";ageBand:string;tenureBand:string;payBasis:"Daily"|"Monthly";basicRate:number;dailyEquivalent:number|null;monthlyEquivalent:number|null;annualEquivalent:number|null;wageClass:PayClass};
export type MoneyTotals={count:number;withAmount:number;withoutAmount:number;monthly:number;annual:number};
const enumOf=<T extends string>(value:unknown,options:readonly T[],fallback:T):T=>typeof value==="string"&&options.includes(value as T)?value as T:fallback;
export const getLevel=(p:HRPerson):JobLevel=>enumOf(p.jobLevel,jobLevels,"Not recorded");
/** Legacy 'Regular' status is explicit, but probationary status isn't a contract arrangement. */
export const getArrangement=(p:HRPerson):EmploymentArrangement=>enumOf(p.employmentArrangement|| (["Regular","Contractual","Project-Based","Seasonal","Casual","Fixed-Term"].includes(p.status)?p.status:undefined),employmentArrangements,"Not recorded");
export const getGender=(p:HRPerson):"Male"|"Female"|"Unspecified"=>p.gender==="Male"?"Male":p.gender==="Female"?"Female":"Unspecified";
const validDivisor=(n:unknown)=>typeof n==="number"&&Number.isFinite(n)&&n>0&&n<=31;
const round=(n:number)=>Math.round((n+Number.EPSILON)*100)/100;
export function ageBand(birth:string|undefined,asOf:string){
 if(!birth||!/^\d{4}-\d{2}-\d{2}$/.test(birth))return "Not recorded";
 const d=new Date(`${birth}T00:00:00Z`),now=new Date(`${asOf}T00:00:00Z`);
 if(Number.isNaN(d.getTime())||Number.isNaN(now.getTime())||d.toISOString().slice(0,10)!==birth||d>now)return "Not recorded";
 let n=now.getUTCFullYear()-d.getUTCFullYear();if(now.getUTCMonth()<d.getUTCMonth()||(now.getUTCMonth()===d.getUTCMonth()&&now.getUTCDate()<d.getUTCDate()))n--;
 return n<18?"Under 18":n<25?"18–24":n<35?"25–34":n<45?"35–44":n<55?"45–54":n<65?"55–64":"65+";
}
export function tenureBand(hire:string,asOf:string){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(hire)||hire>asOf)return "Not recorded";
 const start=new Date(`${hire}T00:00:00Z`),now=new Date(`${asOf}T00:00:00Z`);
 if(Number.isNaN(start.getTime())||start.toISOString().slice(0,10)!==hire||Number.isNaN(now.getTime()))return "Not recorded";
 const years=(now.getTime()-start.getTime())/(365.2425*86400000);
 return years<1?"<1 year":years<3?"1–2 years":years<5?"3–4 years":"5+ years";
}
/** Wage reference is user-selected and informational; classification requires a valid daily equivalent. */
export function demographicRows(people:HRPerson[],changes:PayRateChange[],asOf:string,benchmark?:MinimumWage):DemographicRow[]{
 return people.map(p=>{
  const basic=basicRateOnDate(p.id,p.rate,asOf,changes);
  const valid=Number.isFinite(basic)&&basic>=0;
  const dailyEquivalent=valid?(p.salaryType==="Daily"?round(basic):validDivisor(p.monthlyWorkDays)?round(basic/p.monthlyWorkDays!):null):null;
  const monthlyEquivalent=valid?(p.salaryType==="Monthly"?round(basic):validDivisor(p.monthlyWorkDays)?round(basic*p.monthlyWorkDays!):null):null;
  const annualEquivalent=monthlyEquivalent===null?null:round(monthlyEquivalent*12);
  const eligible=benchmark&&Number.isFinite(benchmark.amount)&&benchmark.amount>0&&benchmark.effective<=asOf&&dailyEquivalent!==null;
  const wageClass:PayClass=!eligible?"Not comparable":Math.abs(dailyEquivalent!-benchmark!.amount)<0.01?"At reference minimum":dailyEquivalent!>benchmark!.amount?"Above reference minimum":"Below reference minimum";
  return {id:p.id,name:p.name,branch:p.branch,department:p.department,level:getLevel(p),arrangement:getArrangement(p),status:p.status,gender:getGender(p),ageBand:ageBand(p.birthDate,asOf),tenureBand:tenureBand(p.hire,asOf),payBasis:p.salaryType,basicRate:basic,dailyEquivalent,monthlyEquivalent,annualEquivalent,wageClass};
 });
}
export function sumByGender(rows:DemographicRow[],gender:"Male"|"Female"|"Unspecified"):MoneyTotals{
 const group=rows.filter(r=>r.gender===gender);
 const recorded=group.filter(r=>r.monthlyEquivalent!==null);
 return {count:group.length,withAmount:recorded.length,withoutAmount:group.length-recorded.length,monthly:round(recorded.reduce((n,r)=>n+r.monthlyEquivalent!,0)),annual:round(recorded.reduce((n,r)=>n+r.annualEquivalent!,0))};
}
export function groupCounts(rows:DemographicRow[],field:keyof Pick<DemographicRow,"branch"|"department"|"level"|"arrangement"|"status"|"gender"|"ageBand"|"tenureBand"|"wageClass">){
 const counts=new Map<string,number>();for(const row of rows)counts.set(String(row[field]),(counts.get(String(row[field]))||0)+1);
 return [...counts].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]));
}
export function csvCell(value:unknown){const text=String(value??"");const safe=/^[=+@\-\t\r]/.test(text)?`'${text}`:text;return `"${safe.replace(/"/g,'""')}"`;}
export function demographicsCsv(rows:DemographicRow[]){
 const fields:(keyof DemographicRow)[]=["id","branch","department","level","arrangement","status","gender","ageBand","tenureBand","payBasis","basicRate","dailyEquivalent","monthlyEquivalent","annualEquivalent","wageClass"];
 return [fields.map(csvCell).join(","),...rows.map(r=>fields.map(f=>csvCell(r[f]??"")).join(","))].join("\r\n");
}
/** Aggregated compliance preparation worksheet; no employee names or government IDs. */
export function demographicsSummaryCsv(rows:DemographicRow[],asOf:string){
 const head=["Section","Category","Headcount","Known monthly basic PHP","Annualized basic PHP","Missing conversion"];
 const lines:(string|number)[][]=[];
 for(const gender of ["Male","Female","Unspecified"] as const){const sums=sumByGender(rows,gender);lines.push(["Recorded gender",gender,sums.count,sums.monthly,sums.annual,sums.withoutAmount]);}
 for(const field of ["level","arrangement","status","branch","department","ageBand","tenureBand","wageClass"] as const){for(const [label,count] of groupCounts(rows,field))lines.push([field,label,count,"","",""]);}
 lines.unshift(["Report date",asOf,"","","",""]);
 return [head.map(csvCell).join(","),...lines.map(l=>l.map(csvCell).join(","))].join("\r\n");
}
