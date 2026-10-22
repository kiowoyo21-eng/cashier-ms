import {roundMoney,type DeductionVersion,type Agency} from "./payrollConfig";

/** Demonstration payroll calculation. Source schedules must be checked by HR before release. */
export type ContributionItem={agency:Agency;employee:number;employer:number;basis:number;note:string;version:string};
export type DeductionPreview={items:ContributionItem[];employeeTotal:number;employerTotal:number;monthlyApplicable:boolean;weeklyTaxable:number;basisEstimated:boolean};
const findVersion=(versions:DeductionVersion[],agency:Agency,end:string)=>versions.filter(v=>v.agency===agency&&v.effective<=end&&v.status==="Reviewed for Demo").sort((a,b)=>b.effective.localeCompare(a.effective))[0];
export const firstWednesdayOfMonth=(isoEnd:string)=>{const d=new Date(`${isoEnd.slice(0,7)}-01T12:00:00`);return 1+(3-d.getDay()+7)%7};
export function estimateMonthlyBasis(rate:number,type:"Daily"|"Monthly",daysPerMonth:number=26){return type==="Daily"?roundMoney(rate*daysPerMonth):rate}
export function computeGovernmentDeductions({monthlyBasis,weeklyGross,periodEnd,versions,basisEstimated=false,applyMonthly,birExempt=false}:{monthlyBasis:number;weeklyGross:number;periodEnd:string;versions:DeductionVersion[];basisEstimated?:boolean;applyMonthly?:boolean;birExempt?:boolean}):DeductionPreview{
 const monthly=applyMonthly??(Number(periodEnd.slice(-2))===firstWednesdayOfMonth(periodEnd));
 const items:ContributionItem[]=[];
 const add=(agency:Agency,employee:number,employer:number,basis:number,note:string)=>{const v=findVersion(versions,agency,periodEnd);items.push({agency,employee:roundMoney(employee),employer:roundMoney(employer),basis:roundMoney(basis),note,version:v?.id||"No current version"})};
 const sss=findVersion(versions,"SSS",periodEnd);
 const sssRow=sss?.rows.find(r=>monthlyBasis>=r.min&&monthlyBasis<=r.max);
 add("SSS",monthly&&sssRow?sssRow.employee:0,monthly&&sssRow?sssRow.employer:0,monthlyBasis,monthly?"Monthly SSS bracket incl. employer EC":"Not deducted this cutoff (monthly cycle)");
 const phil=findVersion(versions,"PhilHealth",periodEnd);
 const philBasis=Math.min(100000,Math.max(10000,monthlyBasis));
 const philRate=phil?.rows[0]?.rate??0;
 const philHalf=roundMoney(philBasis*philRate/200);
 add("PhilHealth",monthly?philHalf:0,monthly?philHalf:0,philBasis,monthly?"5% total premium, shared equally; monthly basic salary":"Not deducted this cutoff (monthly cycle)");
 const pag=findVersion(versions,"Pag-IBIG",periodEnd);
 const pagBase=Math.min(10000,Math.max(0,monthlyBasis));
 const pagEmployee=pagBase*(monthlyBasis<=1500?.01:.02),pagEmployer=pagBase*.02;
 add("Pag-IBIG",monthly&&pag?pagEmployee:0,monthly&&pag?pagEmployer:0,pagBase,monthly?"Monthly mandatory savings, capped at ₱10,000 fund salary":"Not deducted this cutoff (monthly cycle)");
 const contributionSum=items.reduce((s,r)=>s+r.employee,0);
 const taxable=Math.max(0,roundMoney(weeklyGross-contributionSum));
 const bir=findVersion(versions,"BIR",periodEnd);
 const taxRow=bir?.rows.find(r=>taxable>=r.min&&taxable<=r.max);
 const tax=birExempt?0:taxRow?Math.max(0,(taxRow.fixed||0)+(taxable-taxRow.min)*(taxRow.rate||0)/100):0;
 add("BIR",tax,0,taxable,birExempt?"HR-flagged minimum wage income tax exemption; verify eligibility":"Weekly withholding estimate; regular taxable pay less employee contributions deducted this cutoff");
 return {items,employeeTotal:roundMoney(items.reduce((s,x)=>s+x.employee,0)),employerTotal:roundMoney(items.reduce((s,x)=>s+x.employer,0)),monthlyApplicable:monthly,weeklyTaxable:taxable,basisEstimated};
}
