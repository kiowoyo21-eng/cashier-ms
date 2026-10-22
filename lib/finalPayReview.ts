/** Frontend-only final-pay preparation: NOT a legal computation, approval, or payment release. */
import type {HRState} from "./hrState";
import {outstandingCustody} from "./employeeLifecycle";
import type {Role} from "./mock";

export type FinalPayStatus="Draft"|"For HR Review"|"HR Reviewed"|"Returned for Correction"|"Accounting Handoff (Demo)";
export type FinalPayAmounts={unpaidBasic:number;thirteenthAdjustment:number;leaveConversion:number;otherEarnings:number;taxWithholding:number;loanRecovery:number;otherDeductions:number};
export type FinalPayReferences={attendance:string;payroll:string;loans:string;assets:string;statutory:string};
export type FinalPayEvent={at:string;actor:string;action:string;from:string;to:string;reference:string};
export type FinalPayCase={id:string;lifecycleCaseId:string;employeeId:string;branch:string;createdAt:string;createdBy:string;status:FinalPayStatus;lastWorkingDay:string;amounts:FinalPayAmounts;references:FinalPayReferences;notes:string;reviewedBy?:string;reviewedAt?:string;handoffAt?:string;history:FinalPayEvent[]};
export type FinalPayResult={ok:true;record:FinalPayCase}|{ok:false;error:string};
export const finalPayFields:[keyof FinalPayAmounts,string][]=[
 ["unpaidBasic","Unpaid basic wages (verified)"],["thirteenthAdjustment","13th-month adjustment (verified)"],
 ["leaveConversion","Unused leave conversion (if eligible)"],["otherEarnings","Other verified earnings"],
 ["taxWithholding","Withholding / statutory deductions (verified)"],["loanRecovery","Authorized loan recovery (verified)"],
 ["otherDeductions","Other lawful deductions (verified)"]
];
export const finalPayReferenceFields:[keyof FinalPayReferences,string][]=[
 ["attendance","Final attendance and workday reference"],["payroll","Last payroll and payment reconciliation reference"],
 ["loans","Loan/advance SOA and recovery authorization reference"],["assets","Asset and accountabilities clearance reference"],
 ["statutory","Statutory / 13th-month / leave entitlement review reference"]
];
export const validMoney=(v:number)=>Number.isFinite(v)&&v>=0&&Math.abs(v*100-Math.round(v*100))<1e-6;
export const blankFinalPayAmounts=():FinalPayAmounts=>({unpaidBasic:0,thirteenthAdjustment:0,leaveConversion:0,otherEarnings:0,taxWithholding:0,loanRecovery:0,otherDeductions:0});
export const blankFinalPayReferences=():FinalPayReferences=>({attendance:"",payroll:"",loans:"",assets:"",statutory:""});
export const finalPayRole=(role:Role)=>role==="HR"||role==="Super Admin"||role==="Special Final Approver — Ms Kate";
export function finalPaySummary(a:FinalPayAmounts){
 const gross=a.unpaidBasic+a.thirteenthAdjustment+a.leaveConversion+a.otherEarnings;
 const deductions=a.taxWithholding+a.loanRecovery+a.otherDeductions;
 return {gross:Math.round(gross*100)/100,deductions:Math.round(deductions*100)/100,net:Math.round((gross-deductions)*100)/100};
}
export function finalPayBlockers(state:HRState,record:FinalPayCase):string[]{
 const c=(state.lifecycleCases||[]).find(x=>x.id===record.lifecycleCaseId&&x.employeeId===record.employeeId&&x.action==="Offboard");
 const p=state.people.find(x=>x.id===record.employeeId);
 const errors:string[]=[];
 if(!c||c.status!=="Applied (Demo)")errors.push("A completed offboarding lifecycle review is required.");
 if(!p||p.status!=="Clearance Pending"||p.branch!==record.branch)errors.push("Employee must still be Clearance Pending in the original branch.");
 if(p&&outstandingCustody(state,p.id).length)errors.push("Outstanding physical device custody must be cleared in Assets.");
 if((state.payrollConfig?.payslipDrafts||[]).some(d=>d.employeeId===record.employeeId&&d.status!=="Released (Demo)"))errors.push("Unreleased regular-payroll drafts must be reviewed for overlap or duplication.");
 if(!/^\d{4}-\d{2}-\d{2}$/.test(record.lastWorkingDay)||!Number.isFinite(Date.parse(record.lastWorkingDay))||new Date(`${record.lastWorkingDay}T00:00:00Z`).toISOString().slice(0,10)!==record.lastWorkingDay)errors.push("A valid last working day is required.");
 else if(c&&record.lastWorkingDay>c.effectiveDate)errors.push("Last working day must not be later than the offboarding effective date.");
 for(const [key,label] of finalPayReferenceFields)if(record.references[key].trim().length<5)errors.push(`${label} is required (5+ characters).`);
 if(finalPayFields.some(([key])=>!validMoney(record.amounts[key])))errors.push("All itemized amounts must be nonnegative and limited to two decimal places.");
 const totals=finalPaySummary(record.amounts);
 if(totals.net<0)errors.push("Estimated net is negative; resolve the deduction discrepancy before handoff.");
 return errors;
}
const event=(now:string,actor:string,action:string,from:string,to:string,reference:string):FinalPayEvent=>({at:now,actor,action,from,to,reference});
export function createFinalPay(state:HRState,caseId:string,actor:string,role:Role,now:string,id:string):FinalPayResult{
 if(!finalPayRole(role)||!actor.trim())return {ok:false,error:"An authenticated HR user is required."};
 const c=(state.lifecycleCases||[]).find(x=>x.id===caseId&&x.action==="Offboard"&&x.status==="Applied (Demo)");
 if(!c)return {ok:false,error:"First complete the offboarding lifecycle review in Employee 201."};
 const p=state.people.find(x=>x.id===c.employeeId);
 if(!p||p.status!=="Clearance Pending"||p.branch!==c.sourceBranch)return {ok:false,error:"Employee is no longer in eligible clearance status."};
 if((state.finalPayCases||[]).some(x=>x.lifecycleCaseId===caseId))return {ok:false,error:"A final-pay preparation already exists for this offboarding case."};
 if((state.finalPayCases||[]).some(x=>x.id===id))return {ok:false,error:"A duplicate final-pay reference was generated."};
 const record:FinalPayCase={id,lifecycleCaseId:c.id,employeeId:p.id,branch:p.branch,createdAt:now,createdBy:actor,status:"Draft",lastWorkingDay:c.effectiveDate,amounts:blankFinalPayAmounts(),references:blankFinalPayReferences(),notes:"",history:[event(now,actor,"Created draft","None","Draft","Offboarding checklist handoff") ]};
 return {ok:true,record};
}
export function reviseFinalPay(record:FinalPayCase,actor:string,role:Role,now:string,updates:{amounts:FinalPayAmounts;references:FinalPayReferences;lastWorkingDay:string;notes:string}):FinalPayResult{
 if(!finalPayRole(role)||!actor.trim())return {ok:false,error:"HR authorization required."};
 if(!["Draft","Returned for Correction"].includes(record.status))return {ok:false,error:"This review is locked. Return it for correction first."};
 if(finalPayFields.some(([key])=>!validMoney(updates.amounts[key])))return {ok:false,error:"Enter valid nonnegative amounts with at most two decimal places."};
 if(updates.notes.length>1500||finalPayReferenceFields.some(([key])=>updates.references[key].length>300))return {ok:false,error:"Review note/reference exceeds the supported length."};
 return {ok:true,record:{...record,...updates,status:"Draft",reviewedBy:undefined,reviewedAt:undefined,history:[...record.history,event(now,actor,"Revised draft",record.status,"Draft","Review fields edited; values redacted") ]}};
}
export function transitionFinalPay(state:HRState,record:FinalPayCase,action:"Submit"|"Review"|"Return"|"Handoff",actor:string,role:Role,now:string,reason:string):FinalPayResult{
 if(!finalPayRole(role)||!actor.trim())return {ok:false,error:"Only authorized HR staff can manage final-pay preparation."};
 const current=(state.finalPayCases||[]).find(x=>x.id===record.id);
 if(!current||JSON.stringify(current)!==JSON.stringify(record))return {ok:false,error:"Review record changed. Refresh before deciding."};
 const next:Record<typeof action,FinalPayStatus>={Submit:"For HR Review",Review:"HR Reviewed",Return:"Returned for Correction",Handoff:"Accounting Handoff (Demo)"};
 const allowed=(action==="Submit"&&record.status==="Draft")||(action==="Review"&&record.status==="For HR Review")||(action==="Return"&&["For HR Review","HR Reviewed"].includes(record.status))||(action==="Handoff"&&record.status==="HR Reviewed");
 if(!allowed)return {ok:false,error:"Invalid or repeated review transition."};
 if((action==="Review"||action==="Handoff")&&record.createdBy===actor)return {ok:false,error:"Maker-checker restriction: the preparer cannot review or hand off their own record."};
 if((action==="Review"||action==="Return"||action==="Handoff")&&reason.trim().length<8)return {ok:false,error:"Provide a review reason/reference of at least 8 characters."};
 if(action==="Review"||action==="Handoff"){
  const errors=finalPayBlockers(state,record);if(errors.length)return {ok:false,error:errors[0]};
 }
 if(action==="Handoff"&&!record.reviewedAt)return {ok:false,error:"Independent HR review is required before Accounting handoff."};
 const target=next[action];
 return {ok:true,record:{...record,status:target,...(action==="Review"?{reviewedBy:actor,reviewedAt:now}:{}),...(action==="Return"?{reviewedBy:undefined,reviewedAt:undefined}:{}),...(action==="Handoff"?{handoffAt:now}:{}),history:[...record.history,event(now,actor,action,record.status,target,reason.trim()||"Submitted for independent HR review")]}};
}
