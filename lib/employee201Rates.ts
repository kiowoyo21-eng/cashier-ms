/** Source-linked Employee 201 compensation preview. Browser-only reference, not payroll authorization. */
import {effectiveRate,type HRPerson,type PremiumProfile} from "./hrState";
import {basicRateOnDate,type PayRateChange} from "./payrollConfig";

export type EmployeePaySnapshot={
 basic:number;basicEffective:string;daily:number|null;hourly:number|null;
 ot:number|null;hp:number|null;shp:number|null;rdw:number|null;rdot:number|null;
 premium:PremiumProfile;
};
const rounded=(n:number)=>Math.round((n+Number.EPSILON)*10000)/10000;
const divisor=(v:number|undefined,max:number)=>typeof v==="number"&&Number.isFinite(v)&&v>0&&v<=max?v:null;
/** Do not silently assume 26 working days or 8 hours; unset conversions stay null. */
export function employeePaySnapshot(person:HRPerson,rates:Record<string,PremiumProfile>,changes:PayRateChange[]=[],asOf:string=new Date().toISOString().slice(0,10)):EmployeePaySnapshot{
 const eligible=changes.filter(x=>x.employeeId===person.id&&x.effective<=asOf).sort((a,b)=>b.effective.localeCompare(a.effective));
 const basic=basicRateOnDate(person.id,person.rate,asOf,changes);
 const premium=effectiveRate(person,rates);
 const days=divisor(person.monthlyWorkDays,31),hours=divisor(person.hoursPerDay,24);
 const daily=person.salaryType==="Daily"?rounded(basic):days!==null?rounded(basic/days):null;
 const hourly=daily!==null&&hours!==null?rounded(daily/hours):null;
 const rate=(base:number|null,percent:number)=>base===null?null:rounded(base*percent/100);
 return {basic,basicEffective:eligible[0]?.effective||person.hire||"",daily,hourly,premium,
  ot:rate(hourly,premium.ot),hp:rate(daily,premium.regular),shp:rate(daily,premium.special),
  rdw:rate(daily,premium.rdw),rdot:rate(hourly,premium.rdot)};
}
/** Display/export only: redact identifiers by default, never return whole ID in a worksheet. */
export function maskGovId(raw:string|undefined){const value=(raw||"").trim();if(!value)return "Not recorded";if(value.length<=4)return "••••";return `••••${value.slice(-4)}`}
