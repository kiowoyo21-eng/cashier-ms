/** Local-only documentation workflow. Approval of a documentation request does not
 * create a leave entitlement, permit, payroll entry, legal filing or disbursement. */
import type {Branch,Role} from "./mock";
export type FormKind="Overtime Authorization"|"Work Permit / Work Authorization"|"Leave Documentation"|"Workplace Dispute / Grievance"|"Employee Document Request"|"Attendance Correction"|"Schedule Change"|"Incident Statement"|"Asset Clearance"|"Employment Certificate Request"|"Policy Acknowledgment"|"Notice to Explain / Employee Response"|"Return-to-Work Clearance"|"Official Business / Field Assignment"|"Separation & Clearance Request";
export type FormStatus="Draft"|"Submitted"|"Returned for Revision"|"Approved (Documentation Only)"|"Rejected";
export type FormField={key:string;label:string;type:"text"|"date"|"time"|"textarea"|"select";required:boolean;options?:string[]};
export type FormSchema={kind:FormKind;description:string;fields:FormField[]};
const field=(key:string,label:string,type:FormField["type"]="text",required=true,options?:string[]):FormField=>({key,label,type,required,options});
export const formSchemas:FormSchema[]=[
 {kind:"Overtime Authorization",description:"Prior authorization / actual work evidence. Does not post overtime pay.",fields:[field("workDate","Overtime date","date"),field("start","Start time","time"),field("end","End time","time"),field("reason","Business reason","textarea"),field("supervisor","Requested supervisor"),field("evidence","Attendance or approval reference","text",false)]},
 {kind:"Work Permit / Work Authorization",description:"Internal workplace authorization only; not a government-issued work permit.",fields:[field("workDate","Work date","date"),field("location","Work location"),field("activity","Scope / activity","textarea"),field("safety","Safety / risk controls","textarea"),field("reference","Safety briefing reference","text",false)]},
 {kind:"Leave Documentation",description:"Supporting request only. Official leave approval stays in Leave Management.",fields:[field("from","First leave date","date"),field("to","Last leave date","date"),field("leaveType","Leave type","select",true,["Vacation","Sick","Emergency","Other"]),field("reason","Reason / notes","textarea"),field("leaveId","Leave Management reference","text",false)]},
 {kind:"Workplace Dispute / Grievance",description:"Confidential intake and routing reference; no legal adjudication.",fields:[field("occurred","Date of concern","date"),field("subject","Subject"),field("facts","Statement of facts","textarea"),field("resolution","Requested action","textarea"),field("privacy","Confidential handling reference","text",false)]},
 {kind:"Employee Document Request",description:"Request HR documents without automatically issuing a certificate.",fields:[field("document","Document type","select",true,["COE","Payslip copy","Service record","Employment verification","Other"]),field("purpose","Purpose","textarea"),field("needed","Needed by","date",false),field("delivery","Delivery method","select",true,["Pick up","HR review","Secure delivery (future)"])]},
 {kind:"Attendance Correction",description:"Supporting evidence for attendance verification, not an automatic timesheet change.",fields:[field("workDate","Attendance date","date"),field("issue","Correction requested","textarea"),field("evidence","Evidence / punch record reference")]},
 {kind:"Schedule Change",description:"Schedule adjustment request. Existing roster stays unchanged until processed separately.",fields:[field("workDate","Affected date","date"),field("previous","Old schedule"),field("proposed","Proposed schedule"),field("reason","Reason","textarea")]},
 {kind:"Incident Statement",description:"Employee incident narrative for case intake, not a signed investigation finding.",fields:[field("occurred","Incident date","date"),field("location","Location"),field("narrative","Statement","textarea"),field("caseId","Incident case reference","text",false)]},
 {kind:"Asset Clearance",description:"Asset return checklist reference; does not release asset custody in the Assets module.",fields:[field("assetId","Asset ID"),field("returnDate","Proposed return date","date"),field("condition","Condition report","textarea")]},
 {kind:"Employment Certificate Request",description:"COE preparation intake; final document issuance needs HR authorization.",fields:[field("purpose","Purpose","textarea"),field("addressTo","Addressee","text",false),field("needed","Requested date","date",false)]},
 {kind:"Policy Acknowledgment",description:"Acknowledgment intake only, not a verified electronic signature.",fields:[field("policy","Policy name"),field("version","Policy version"),field("acknowledged","Acknowledgment date","date"),field("reference","Acknowledgment reference","text",false)]},
 {kind:"Notice to Explain / Employee Response",description:"Internal due-process paperwork reference; content and legal service require HR/legal review.",fields:[field("noticeId","Notice reference"),field("received","Date received","date"),field("response","Employee response","textarea"),field("evidence","Supporting reference","text",false)]},
 {kind:"Return-to-Work Clearance",description:"Request follow-up for return to duty, not a medical fitness determination.",fields:[field("returnDate","Proposed return date","date"),field("absence","Absence reference"),field("clearance","Medical/HR clearance document reference"),field("notes","HR follow-up notes","textarea",false)]},
 {kind:"Official Business / Field Assignment",description:"Field assignment reference; does not authorize payroll reimbursement or travel expense release.",fields:[field("from","Start date","date"),field("to","End date","date"),field("location","Destination"),field("purpose","Official business purpose","textarea"),field("supervisor","Supervisor") ]},
 {kind:"Separation & Clearance Request",description:"Clearance-document request only, not final pay release or actual employment termination.",fields:[field("lastDay","Proposed last working day","date"),field("reason","Separation reference","textarea"),field("assets","Asset return checklist reference"),field("caseId","Employee Lifecycle case reference","text",false)]}
];
export const formKinds=formSchemas.map(x=>x.kind);
export type HRFormRecord={id:string;kind:FormKind;branch:Exclude<Branch,"All Shops">;employeeId:string;requestor:string;createdAt:string;updatedAt:string;status:FormStatus;fields:Record<string,string>;evidenceRefs:string;remarks:string;reviewedBy?:string;reviewedAt?:string;history:{at:string;actor:string;action:string;status:FormStatus}[]};
export const FORM_STORE_KEY="uc-hr-forms-documentation-v1";
export const FORM_STORE_EVENT="uc-hr-forms-changed";
export function validateFields(kind:FormKind,values:Record<string,string>):string[]{
 const schema=formSchemas.find(x=>x.kind===kind);if(!schema)return ["Unknown request type"];
 const errors:string[]=[];
 for(const f of schema.fields){const value=(values[f.key]||"").trim();if(f.required&&!value)errors.push(`${f.label} is required`);
  if(value.length>1500)errors.push(`${f.label} is too long`);
  if(value&&f.type==="select"&&f.options&&!f.options.includes(value))errors.push(`${f.label} has an invalid option`);
  if(value&&f.type==="date"&&(!/^\d{4}-\d{2}-\d{2}$/.test(value)||Number.isNaN(new Date(`${value}T00:00:00Z`).getTime())||new Date(`${value}T00:00:00Z`).toISOString().slice(0,10)!==value))errors.push(`${f.label} is not a valid date`);
  if(value&&f.type==="time"&&!/^([01]\d|2[0-3]):[0-5]\d$/.test(value))errors.push(`${f.label} is not a valid time`);
 }
 if((kind==="Leave Documentation"||kind==="Official Business / Field Assignment")&&values.from&&values.to&&values.to<values.from)errors.push("End date must not precede start");
 if(kind==="Overtime Authorization"&&values.start&&values.end&&values.start===values.end)errors.push("Start and end cannot be the same");
 return errors;
}
export function canViewForm(record:HRFormRecord,actor:string,role:Role,branch:Branch){
 if(role==="BM")return record.branch==="UC Mandaluyong"&&record.requestor===actor;
 return branch==="All Shops"||record.branch===branch;
}
export function canReviewForm(record:HRFormRecord,actor:string,role:Role){
 return (role==="HR"||role==="Special Final Approver — Ms Kate"||role==="Super Admin")&&record.requestor!==actor&&record.status==="Submitted";
}
export function transitionForm(record:HRFormRecord,action:"Submit"|"Approve"|"Reject"|"Return",actor:string,role:Role,remarks:string,now:string):HRFormRecord{
 if(!actor.trim())throw Error("Sign in is required");
 if(action==="Submit"){
  if(record.requestor!==actor||!(["Draft","Returned for Revision"] as FormStatus[]).includes(record.status))throw Error("Cannot submit this request");
  const errors=validateFields(record.kind,record.fields);if(errors.length)throw Error(errors[0]);
 }else{
  if(!canReviewForm(record,actor,role))throw Error("Only a separate authorized reviewer may decide a submitted request");
  if((action==="Reject"||action==="Return")&&!remarks.trim())throw Error("Reason is required");
 }
 const status:FormStatus=action==="Submit"?"Submitted":action==="Approve"?"Approved (Documentation Only)":action==="Reject"?"Rejected":"Returned for Revision";
 return {...record,status,updatedAt:now,remarks:remarks.trim().slice(0,1000),...(action==="Submit"?{reviewedBy:undefined,reviewedAt:undefined}:{reviewedBy:actor,reviewedAt:now}),history:[...record.history,{at:now,actor,action,status}]};
}
export function readForms():HRFormRecord[]{if(typeof window==="undefined")return [];try{const v=JSON.parse(localStorage.getItem(FORM_STORE_KEY)||"[]");return Array.isArray(v)?v.filter(x=>x&&typeof x.id==="string"&&typeof x.requestor==="string"&&typeof x.kind==="string"&&typeof x.branch==="string"&&Array.isArray(x.history)&&x.fields&&typeof x.fields==="object").slice(-800):[]}catch{return []}}
export function persistForms(records:HRFormRecord[]):boolean{if(typeof window==="undefined")return false;try{localStorage.setItem(FORM_STORE_KEY,JSON.stringify(records.slice(-800)));window.dispatchEvent(new Event(FORM_STORE_EVENT));return true}catch{return false}}
/** Unsigned internal draft for records review. Never a filing, permit or signature. */
export function formDraftText(record:HRFormRecord){
 const schema=formSchemas.find(s=>s.kind===record.kind);
 return ["HRMS INTERNAL DOCUMENTATION DRAFT", "NOT AN OFFICIAL GOVERNMENT FILING, SIGNATURE, WORK PERMIT, OR PAYROLL APPROVAL", "",`Request ID: ${record.id}`,`Type: ${record.kind}`,`Branch: ${record.branch}`,`Employee 201 ID: ${record.employeeId}`,`Requestor: ${record.requestor}`,`Status: ${record.status}`,`Created UTC: ${record.createdAt}`,"",...(schema?.fields||[]).map(f=>`${f.label}: ${record.fields[f.key]||"Not entered"}`),"",`Evidence references: ${record.evidenceRefs||"None"}`,`Last review remarks: ${record.remarks||"None"}`,"", "HISTORY",...record.history.map(h=>`${h.at} | ${h.actor} | ${h.action} | ${h.status}`),"", "Actual legal sufficiency, supporting documents, signatories, retention and approvals require authorized HR/legal review."].join("\n");
}
