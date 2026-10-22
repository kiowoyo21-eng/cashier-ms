/** Payroll evidence summary for *manual* HR review only. No automatic leave pay,
 * loan deduction, payment authorization, or accounting posting is performed here. */
import type {ImportedAttendanceRow,PayslipDraft} from "./payrollConfig";
import {cutoffRows} from "./attendanceReview";

export type LeaveEvidence={id?:number|string;employee:string;branch:string;type:string;from:string;to:string;status:string};
export type LoanEvidence={id?:number|string;employee:string;branch:string;provider:string;status:string;balance:number;payment?:number;start?:string;frequency?:string};
export type PayrollEmployeeIdentity={id:string;name:string;branch:string};
export type DraftCutoff=Pick<PayslipDraft,"employeeId"|"periodStart"|"periodEnd"|"days"|"otHours">;
const asDate=(v:string)=>{if(typeof v!=="string"||!/^\d{4}-\d{2}-\d{2}$/.test(v))return false;const ms=Date.parse(`${v}T12:00:00`);return Number.isFinite(ms)&&new Date(ms).toISOString().slice(0,10)===v;};
const activeLeave=new Set(["Approved","Pending","For Review"]);
const activeLoan=new Set(["Active","For Review","Pending","Draft — schedule pending"]);

/** Name-based legacy references are displayed as unverified leads, not evidence of authorized deductions. */
export function payrollReconciliation(
 employee:PayrollEmployeeIdentity,draft:DraftCutoff,attendance:readonly ImportedAttendanceRow[],
 leaves:readonly LeaveEvidence[],loans:readonly LoanEvidence[]){
 if(draft.employeeId!==employee.id)return {leaveItems:[],loanItems:[],warnings:["Draft employee does not match the selected Employee 201 record."],requiresExplanation:true};
 const rows=cutoffRows(attendance,employee.branch,draft.periodStart).filter(r=>r.employeeId===employee.id);
 const from=draft.periodStart,to=draft.periodEnd;
 const leaveItems=leaves.filter(x=>x.employee===employee.name&&x.branch===employee.branch&&activeLeave.has(x.status)&&asDate(x.from)&&asDate(x.to)&&x.from<=to&&x.to>=from);
 const loanItems=loans.filter(x=>x.employee===employee.name&&x.branch===employee.branch&&activeLoan.has(x.status)&&Number.isFinite(Number(x.balance))&&Number(x.balance)>0&&(!x.start||asDate(x.start)&&x.start<=to));
 const warnings:string[]=[];
 const csvLeave=rows.filter(x=>x.status==="On Leave");
 if(csvLeave.some(row=>!leaveItems.some(x=>x.status==="Approved"&&x.from<=row.date&&x.to>=row.date)))warnings.push("CSV leave day(s) lack a matching approved Leave Management record. Verify the original leave request and pay classification.");
 if(leaveItems.some(l=>l.status!=="Approved"))warnings.push("A leave request in this cutoff is still pending review. Do not assume paid entitlement.");
 if(leaveItems.some(l=>l.status==="Approved"&&!rows.some(r=>r.status==="On Leave"&&r.date>=l.from&&r.date<=l.to)))warnings.push("Approved leave conflicts with attendance day classifications. Reconcile before approval.");
 if(loanItems.length)warnings.push("Loan/cash-advance records found by legacy name/branch only. Verify employee ID, authorization, deduction schedule and balance against official evidence. No deduction is posted from these records.");
 return {leaveItems,loanItems,warnings,requiresExplanation:warnings.length>0};
}

export function safeLocalEvidence(raw:string|null):unknown[]{
 if(!raw||raw.length>2_000_000)return [];
 try{const parsed:unknown=JSON.parse(raw);return Array.isArray(parsed)?parsed.filter(x=>!!x&&typeof x==="object").slice(0,5000):[]}catch{return []}
}
