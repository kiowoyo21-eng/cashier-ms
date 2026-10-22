/** Browser-only Employee 201 movement / separation review queue.
 * Requests never change the employee master or payroll until a separately authorized
 * reviewer explicitly applies an eligible, fully verified case.
 */
import type {HRPerson,HRState} from "./hrState";
import {basicRateOnDate,type PayRateChange} from "./payrollConfig";
import {shopNames,type Shop} from "./people";

export type LifecycleAction="Onboard"|"Evaluate"|"Regularize"|"Promote"|"Transfer"|"Offboard";
export type LifecycleStatus="Pending Review"|"Deferred"|"Declined"|"Applied (Demo)";
export type LifecycleCheck={id:string;label:string;verifiedAt?:string;reference?:string};
export type EmployeeLifecycleCase={
 id:string;employeeId:string;sourceBranch:Shop;action:LifecycleAction;status:LifecycleStatus;
 requestedAt:string;effectiveDate:string;reason:string;submittedBy:string;
 snapshot:{branch:Shop;department:string;position:string;status:string;rate:number};
 destinationBranch?:Shop;department?:string;position?:string;salaryRate?:number;
 separationType?:string;memoReference?:string;checks:LifecycleCheck[];
 decisionBy?:string;decisionAt?:string;decisionReason?:string;
};
export type LifecycleDraft={action:LifecycleAction;effectiveDate:string;reason:string;destinationBranch?:string;department?:string;position?:string;salaryRate?:number;separationType?:string;memoReference?:string};
export type LifecycleResult={ok:true;state:HRState}|{ok:false;error:string};
const definitions:Record<LifecycleAction,{id:string;label:string}[]>={
 Onboard:[{id:"records",label:"Employee documents verified"},{id:"terms",label:"Employment terms and hire date reviewed"},{id:"orientation",label:"Orientation / onboarding acknowledged"}],
 Evaluate:[{id:"assessment",label:"Evaluation evidence and manager recommendation reviewed"}],
 Regularize:[{id:"assessment",label:"Probationary assessment reviewed"},{id:"documents",label:"Required employee documents verified"},{id:"decision",label:"Authorized employment decision reference checked"}],
 Promote:[{id:"manager",label:"Management promotion approval verified"},{id:"compensation",label:"Compensation impact reviewed with Payroll"},{id:"memo",label:"Promotion memo / supporting record checked"}],
 Transfer:[{id:"release",label:"Releasing manager approval verified"},{id:"receive",label:"Receiving manager approval verified"},{id:"assets",label:"Device custody / transfer clearance checked"},{id:"payroll",label:"Branch payroll and attendance handoff reviewed"}],
 Offboard:[{id:"notice",label:"Resignation / separation supporting record verified"},{id:"assets",label:"All issued devices returned and inspected"},{id:"loans",label:"Outstanding loans and advances reviewed"},{id:"handover",label:"Branch and document handover completed"},{id:"finalpay",label:"Final-pay preparation referred to Payroll (not paid)"}]
};
export const dateInPH=(iso:string)=>new Date(new Date(iso).getTime()+8*60*60*1000).toISOString().slice(0,10);
export const lifecycleCheckLabels=(action:LifecycleAction)=>definitions[action];
export const isValidISODate=(value:string)=>/^\d{4}-\d{2}-\d{2}$/.test(value)&&!Number.isNaN(Date.parse(`${value}T00:00:00Z`))&&new Date(`${value}T00:00:00Z`).toISOString().slice(0,10)===value;
export function outstandingCustody(state:Pick<HRState,"assets">,employeeId:string){return state.assets.filter(a=>a.employeeId===employeeId&&["Assigned","For Return","Inspection","Pending Turnover","Maintenance"].includes(a.status));}
export function lifecycleDueReview(person:HRPerson){
 if(person.status!=="Probationary"||!isValidISODate(person.hire)||!(person.probation>0))return null;
 const d=new Date(`${person.hire}T00:00:00Z`);
 const day=d.getUTCDate();
 const target=new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth()+person.probation,1));
 const end=new Date(Date.UTC(target.getUTCFullYear(),target.getUTCMonth()+1,0)).getUTCDate();
 target.setUTCDate(Math.min(day,end));
 return target.toISOString().slice(0,10); // Scheduling aid only; never an automatic legal determination.
}
export function createLifecycleCase(state:HRState,person:HRPerson,draft:LifecycleDraft,role:string,now:string,id:string):EmployeeLifecycleCase|{error:string}{
 if(!["HR","Super Admin","Special Final Approver — Ms Kate"].includes(role))return {error:"Only authorized HR users and Super Admin can submit employee lifecycle requests."};
 if(!state.people.some(p=>p.id===person.id))return {error:"Employee record not found."};
 if(!isValidISODate(draft.effectiveDate)||draft.effectiveDate<person.hire)return {error:"Enter a valid effective date on or after the hire date."};
 if(draft.reason.trim().length<8)return {error:"Enter a supporting reason or reference (at least 8 characters)."};
 if(state.lifecycleCases?.some(c=>c.employeeId===person.id&&c.action===draft.action&&c.status==="Pending Review"))return {error:"An open request of this type already exists for this employee."};
 if(person.status==="Clearance Pending")return {error:"Resolve the employee's existing clearance status before another movement."};
 if(draft.action==="Regularize"&&person.status!=="Probationary")return {error:"Only probationary employees can have a regularization review."};
 if(draft.action==="Onboard"&&person.status==="Clearance Pending")return {error:"Clearance-pending employees cannot be onboarded."};
 if(draft.action==="Promote"&&(!draft.position?.trim()||!Number.isFinite(draft.salaryRate)||!(draft.salaryRate!>0)||!draft.department?.trim()))return {error:"A promotion requires a position, department, and positive proposed basic rate."};
 if(draft.action==="Transfer"&&(!draft.destinationBranch||!shopNames.includes(draft.destinationBranch as Shop)||!draft.department?.trim()||!draft.position?.trim()))return {error:"Select a valid receiving branch, department, and position."};
 if(draft.action==="Transfer"&&draft.destinationBranch===person.branch&&draft.department===person.department&&draft.position?.trim()===person.position)return {error:"The requested assignment matches the current employee record."};
 if(draft.action==="Offboard"&&!draft.separationType?.trim())return {error:"Choose a separation category."};
 if(draft.action==="Promote"&&draft.department===person.department&&draft.position?.trim()===person.position&&draft.salaryRate===basicRateOnDate(person.id,person.rate,dateInPH(now),state.payrollConfig?.rateChanges||[]))return {error:"The proposed promotion has no changed details."};
 return {id,employeeId:person.id,sourceBranch:person.branch,action:draft.action,status:"Pending Review",requestedAt:now,effectiveDate:draft.effectiveDate,reason:draft.reason.trim(),submittedBy:role,
  snapshot:{branch:person.branch,department:person.department,position:person.position,status:person.status,rate:basicRateOnDate(person.id,person.rate,dateInPH(now),state.payrollConfig?.rateChanges||[])},
  ...(draft.destinationBranch?{destinationBranch:draft.destinationBranch as Shop}:{}),...(draft.department?{department:draft.department.trim()}:{}),...(draft.position?{position:draft.position.trim()}:{}),
  ...(draft.salaryRate!==undefined?{salaryRate:draft.salaryRate}:{}),...(draft.separationType?{separationType:draft.separationType}:{}),...(draft.memoReference?{memoReference:draft.memoReference.trim()}:{}),
  checks:definitions[draft.action].map(x=>({...x}))};
}
export function verifyLifecycleCheck(state:HRState,caseId:string,checkId:string,reference:string,role:string,now:string):LifecycleResult{
 if(!["HR","Super Admin","Special Final Approver — Ms Kate"].includes(role))return {ok:false,error:"HR authorization is required."};
 if(reference.trim().length<5)return {ok:false,error:"Enter supporting evidence/reference (at least 5 characters)."};
 const c=(state.lifecycleCases||[]).find(x=>x.id===caseId);
 if(!c||c.status!=="Pending Review")return {ok:false,error:"The lifecycle request is no longer open."};
 if(!c.checks.some(x=>x.id===checkId))return {ok:false,error:"Unknown review checkpoint."};
 return {ok:true,state:{...state,lifecycleCases:(state.lifecycleCases||[]).map(x=>x.id===caseId?{...x,checks:x.checks.map(check=>check.id===checkId?{...check,verifiedAt:now,reference:reference.trim()}:check)}:x)}};
}
export function finalizeLifecycleCase(state:HRState,caseId:string,role:string,now:string,decision:"Approve"|"Defer"|"Decline",reason:string):LifecycleResult{
 if(role!=="Super Admin")return {ok:false,error:"Only Super Admin can make the final demo decision."};
 if(reason.trim().length<8)return {ok:false,error:"Provide a decision reference of at least 8 characters."};
 const c=(state.lifecycleCases||[]).find(x=>x.id===caseId);
 if(!c||c.status!=="Pending Review")return {ok:false,error:"Request not found or already decided."};
 const employee=state.people.find(p=>p.id===c.employeeId);
 if(!employee)return {ok:false,error:"Employee record no longer exists."};
 const status:LifecycleStatus=decision==="Defer"?"Deferred":decision==="Decline"?"Declined":"Applied (Demo)";
 if(decision==="Approve"){
  const waiting=c.checks.filter(x=>!x.verifiedAt);
  if(waiting.length)return {ok:false,error:`Complete required checklist: ${waiting.map(x=>x.label).join(", ")}.`};
  if(c.effectiveDate>dateInPH(now))return {ok:false,error:"Future-dated change: return on or after the effective date to apply it."};
  if(employee.branch!==c.snapshot.branch||employee.department!==c.snapshot.department||employee.position!==c.snapshot.position||employee.status!==c.snapshot.status)return {ok:false,error:"Employee assignment/status changed since submission. Create a new request."};
  if(["Regularize","Onboard"].includes(c.action)&&employee.documents.some(d=>d.status!=="Verified"))return {ok:false,error:"Verify all required Employee 201 documents before regularization review is applied."};
  if(["Offboard","Transfer"].includes(c.action)&&outstandingCustody(state,employee.id).length)return {ok:false,error:"Outstanding assets remain. Complete physical return and inspection in Assets before applying this action."};
  if(c.action==="Promote"&&basicRateOnDate(employee.id,employee.rate,dateInPH(now),state.payrollConfig?.rateChanges||[])!==c.snapshot.rate)return {ok:false,error:"Basic rate changed since request. Review a new compensation request."};
 }
 const decided={...c,status,decisionBy:role,decisionAt:now,decisionReason:reason.trim()};
 const lifecycleCases=(state.lifecycleCases||[]).map(x=>x.id===caseId?decided:x);
 if(decision!=="Approve")return {ok:true,state:{...state,lifecycleCases}};
 const line=`${dateInPH(now)} · ${c.action} demo sign-off (${c.id}); effective ${c.effectiveDate}`;
 const people=state.people.map(p=>{
  if(p.id!==c.employeeId)return p;
  const move=c.action==="Transfer"||c.action==="Promote";
  const assignment=move?{id:`assignment-${c.id}`,effectiveDate:c.effectiveDate,kind:c.action==="Promote"?"Promotion" as const:c.destinationBranch===p.branch?"Reassignment" as const:"Transfer" as const,branch:c.action==="Transfer"?c.destinationBranch!:p.branch,department:c.department!,position:c.position!,...(c.memoReference?{memoId:c.memoReference,memoType:c.action==="Promote"?"Memo of Promotion":"Memo of Transfer"}:{})}:null;
  const fields:Partial<HRPerson>=c.action==="Regularize"?{status:"Regular",probation:0}:c.action==="Transfer"?{branch:c.destinationBranch!,department:c.department!,position:c.position!}:c.action==="Promote"?{department:c.department!,position:c.position!}:c.action==="Offboard"?{status:"Clearance Pending"}:{};
  // An offboard handoff does not mark an employee separated or finalize statutory pay.
  return {...p,...fields,timeline:[line,...p.timeline],assignmentHistory:assignment?[...(p.assignmentHistory||[]),assignment]:p.assignmentHistory};
 });
 const payrollConfig=c.action==="Promote"?{...state.payrollConfig!,rateChanges:[...(state.payrollConfig?.rateChanges||[]),{id:`LIFE-RATE-${c.id}`,employeeId:c.employeeId,salaryType:employee.salaryType,amount:c.salaryRate!,effective:c.effectiveDate,reason:`Promotion lifecycle ${c.id}; ${c.reason}`,status:"Applied (Demo)" as const,recordedAt:now} satisfies PayRateChange]}:state.payrollConfig;
 return {ok:true,state:{...state,lifecycleCases,people,payrollConfig}};
}
