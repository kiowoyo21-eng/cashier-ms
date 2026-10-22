/** Future shared-database contract, exercised here with clearly labelled LOCAL DEMO fixtures.
 * HRMS owns only the approver interface/decision. CMS remains owner of CMS requests;
 * Accounting remains owner of first review and release execution. NO ERP dependency.
 */
export type ApprovalSource="CMS"|"HRMS";
export type AccountingStatus="Pending"|"Approved"|"Rejected"|"Returned for Revision";
export type KateDecision="Approved for Release"|"Rejected by Ms Kate"|"Returned for Revision";
export type ApprovalStatus=KateDecision|"Pending Ms Kate Approval"|"Awaiting Accounting Approval"|"Accounting Reapproval Required"|"Awaiting Accounting Correction";
export type ApprovalActor={username:string;role:string};
export const KATE_ROLE="Special Final Approver — Ms Kate" as const;
export const KATE_DEMO_USERNAME="mskate" as const;
export const FINAL_APPROVAL_STORAGE_KEY="uc-hr-final-approval-demo-decisions-v1";
export type SupportingDocument={id:string;name:string;kind:string;description:string;availability:"Demo metadata only"};
export type AccountingReview={status:AccountingStatus;approver:string;approvedAt:string;remarks:string;approvedFingerprint:string|null};
export type ApprovalTimelineEntry={at:string;actor:string;role:string;stage:string;status:string;remarks:string};
export type FinalApprovalRequest={
 id:string;source:ApprovalSource;sourceRevision:string;assignedApprover:string;requestor:string;requestorUsername:string;
 branch:string;category:string;description:string;amount:number;currency:"PHP";
 purpose:string;documents:SupportingDocument[];accounting:AccountingReview;timeline:ApprovalTimelineEntry[];
 demo:true;requiresFinalApproval:true;
};
export type FinalDecisionRecord={id:string;requestId:string;source:ApprovalSource;sourceRevision:string;fingerprint:string;actor:string;role:string;decidedAt:string;decision:KateDecision;remarks:string;beforeStatus:ApprovalStatus;afterStatus:KateDecision};
export type DecisionStore={schema:1;decisions:FinalDecisionRecord[]};

/** Explicit material-field snapshot. Never treat version alone as proof of an unchanged request. */
export function approvalFingerprint(request:Pick<FinalApprovalRequest,"id"|"source"|"sourceRevision"|"requestor"|"requestorUsername"|"branch"|"category"|"description"|"amount"|"currency"|"purpose"|"documents">):string{
 return JSON.stringify([request.id,request.source,request.sourceRevision,request.requestor,request.requestorUsername,request.branch,request.category,request.description,request.amount,request.currency,request.purpose,request.documents.map(d=>[d.id,d.name,d.kind,d.description])]);
}
function fixture(base:Omit<FinalApprovalRequest,"accounting"|"timeline">,status:AccountingStatus,accountant:string,approvedAt:string,remarks:string,approvedForCurrentRevision=true):FinalApprovalRequest{
 const fingerprint=approvalFingerprint(base);
 const accounting:AccountingReview={status,approver:accountant,approvedAt,remarks,approvedFingerprint:status==="Approved"&&approvedForCurrentRevision?fingerprint:null};
 return {...base,accounting,timeline:[
  {at:"2026-10-18T03:30:00.000Z",actor:base.requestor,role:base.source==="CMS"?"Cashier / PB (CMS demo)":"HR (HRMS demo)",stage:"Request",status:"Submitted to Accounting",remarks:"Demo submission; not synced from a real application."},
  ...(status==="Pending"?[]:[{at:approvedAt,actor:accountant,role:"Accounting (demo)",stage:"Accounting",status,remarks}])
 ]};
}
/** Static demo READ MODELS; this is not a CMS request database, sync or integration. */
export const DEMO_APPROVAL_REQUESTS:readonly FinalApprovalRequest[]=[
 fixture({id:"CMS-DEMO-DR-001",source:"CMS",sourceRevision:"v1",assignedApprover:KATE_DEMO_USERNAME,requestor:"PB Demo · UC Mandaluyong",requestorUsername:"pb-demo-01",branch:"UC Mandaluyong",category:"Parts Purchase / Disbursement",description:"Demo request to reimburse a verified parts purchase",purpose:"Example supplier payment after Accounting review; no actual disbursement.",amount:12500,currency:"PHP",documents:[{id:"support-1",name:"Supplier quotation (demo)",kind:"Quotation",description:"Metadata preview only. No actual file is connected.",availability:"Demo metadata only"},{id:"support-2",name:"Receiving checklist (demo)",kind:"Receiving",description:"Example supporting reference, not an uploaded attachment.",availability:"Demo metadata only"}],demo:true,requiresFinalApproval:true},"Approved","accounting-reviewer-demo","2026-10-19T08:10:00.000Z","Verified for final approval (sample only)."),
 fixture({id:"CMS-DEMO-DR-002",source:"CMS",sourceRevision:"v1",assignedApprover:KATE_DEMO_USERNAME,requestor:"Cashier Demo · UC Quezon City",requestorUsername:"cashier-demo-01",branch:"UC Quezon City",category:"Operating Expense",description:"Demo operating-expense disbursement still awaiting Accounting",purpose:"Used to verify the Accounting-first rule.",amount:3800,currency:"PHP",documents:[{id:"support-3",name:"Expense breakdown (demo)",kind:"Expense Detail",description:"Placeholder metadata only, no real file.",availability:"Demo metadata only"}],demo:true,requiresFinalApproval:true},"Pending","","","Awaiting Accounting review."),
 fixture({id:"HRMS-DEMO-REQ-001",source:"HRMS",sourceRevision:"v1",assignedApprover:KATE_DEMO_USERNAME,requestor:"HR Demo · UC Las Piñas",requestorUsername:"hr-demo-maker",branch:"UC Las Piñas",category:"HR Reimbursement",description:"Demo employee-related reimbursement requiring configured final approval",purpose:"Example of an HRMS-originated request explicitly configured for Ms Kate review.",amount:1750,currency:"PHP",documents:[{id:"support-4",name:"HR supporting note (demo)",kind:"HR Document",description:"This is a demo reference, not a downloadable HR document.",availability:"Demo metadata only"}],demo:true,requiresFinalApproval:true},"Approved","accounting-reviewer-demo","2026-10-19T10:05:00.000Z","Reviewed sample reimbursement."),
 fixture({id:"CMS-DEMO-DR-004",source:"CMS",sourceRevision:"v1",assignedApprover:KATE_DEMO_USERNAME,requestor:"Cashier Demo · UC Las Piñas",requestorUsername:"cashier-demo-02",branch:"UC Las Piñas",category:"Supplier Reimbursement",description:"Demo verified supplier reimbursement for final review",purpose:"Additional independent approved sample to test reject, return and approve actions.",amount:4200,currency:"PHP",documents:[{id:"support-6",name:"Sample liquidation summary",kind:"Liquidation",description:"Demo supporting summary reference; no actual attachment.",availability:"Demo metadata only"}],demo:true,requiresFinalApproval:true},"Approved","accounting-reviewer-demo","2026-10-19T12:20:00.000Z","First-level checked (demo)."),
 fixture({id:"CMS-DEMO-DR-003",source:"CMS",sourceRevision:"v2",assignedApprover:KATE_DEMO_USERNAME,requestor:"PB Demo · MM Mandaluyong",requestorUsername:"pb-demo-02",branch:"MM Mandaluyong",category:"Parts Purchase / Disbursement",description:"Demo amended purchase, Accounting has not reapproved revision v2",purpose:"Verifies material revisions invalidate earlier approval.",amount:9100,currency:"PHP",documents:[{id:"support-5",name:"Revised quote (demo)",kind:"Quotation",description:"Revised mock supporting-document metadata.",availability:"Demo metadata only"}],demo:true,requiresFinalApproval:true},"Approved","accounting-reviewer-demo","2026-10-17T08:30:00.000Z","Approval belongs to an earlier material version (demo).",false)
];
export const EMPTY_DECISION_STORE:DecisionStore={schema:1,decisions:[]};
export function normalizeDecisionStore(raw:unknown):DecisionStore{
 if(!raw||typeof raw!=="object")return {schema:1,decisions:[]};
 const o=raw as Partial<DecisionStore>;
 if(o.schema!==1||!Array.isArray(o.decisions))return {schema:1,decisions:[]};
 return {schema:1,decisions:o.decisions.filter((d):d is FinalDecisionRecord=>!!d&&typeof d==="object"&&typeof d.requestId==="string"&&typeof d.fingerprint==="string"&&["Approved for Release","Rejected by Ms Kate","Returned for Revision"].includes(d.decision)&&typeof d.decidedAt==="string"&&typeof d.actor==="string"&&typeof d.remarks==="string").slice(-500)};
}
export function readDecisionStore():DecisionStore{
 if(typeof window==="undefined")return {schema:1,decisions:[]};
 try{return normalizeDecisionStore(JSON.parse(window.localStorage.getItem(FINAL_APPROVAL_STORAGE_KEY)||"null"))}catch{return {schema:1,decisions:[]}}
}
export function latestCurrentDecision(req:FinalApprovalRequest,store:DecisionStore):FinalDecisionRecord|undefined{
 const fingerprint=approvalFingerprint(req);
 return [...store.decisions].reverse().find(d=>d.requestId===req.id&&d.source===req.source&&d.sourceRevision===req.sourceRevision&&d.fingerprint===fingerprint);
}
export function hasCurrentAccountingApproval(req:FinalApprovalRequest):boolean{
 return req.accounting.status==="Approved"&&!!req.accounting.approver.trim()&&Number.isFinite(Date.parse(req.accounting.approvedAt))&&req.accounting.approvedFingerprint===approvalFingerprint(req);
}
export function getApprovalStatus(req:FinalApprovalRequest,store:DecisionStore):ApprovalStatus{
 if(req.accounting.status!=="Approved")return req.accounting.status==="Pending"?"Awaiting Accounting Approval":"Awaiting Accounting Correction";
 if(!hasCurrentAccountingApproval(req))return "Accounting Reapproval Required";
 return latestCurrentDecision(req,store)?.decision||"Pending Ms Kate Approval";
}
export function checkFinalDecision(req:FinalApprovalRequest,store:DecisionStore,actor:ApprovalActor,decision:KateDecision,remarks:string):string|null{
 if(actor.role!==KATE_ROLE||actor.username!==KATE_DEMO_USERNAME)return "Only the assigned Ms Kate final approver may decide this request.";
 if(req.assignedApprover!==actor.username)return "Request is not assigned to this approver.";
 if(req.requestorUsername.toLowerCase()===actor.username.toLowerCase())return "Maker-checker rule: you cannot approve your own request.";
 if(!req.requiresFinalApproval)return "This request is not configured for Ms Kate final approval.";
 if(!Number.isFinite(req.amount)||req.amount<0)return "Request amount is invalid.";
 if(req.accounting.status!=="Approved")return "Accounting must approve the request first.";
 if(!hasCurrentAccountingApproval(req))return "Material changes or incomplete Accounting evidence require fresh Accounting approval.";
 if(latestCurrentDecision(req,store))return "A final decision was already recorded for this request revision.";
 if(!["Approved for Release","Rejected by Ms Kate","Returned for Revision"].includes(decision))return "Invalid final decision.";
 if(decision!=="Approved for Release"&&remarks.trim().length<5)return "A reason of at least five characters is required for rejection or return.";
 if(remarks.length>1000)return "Remarks must be 1,000 characters or fewer.";
 return null;
}
export function createDecision(req:FinalApprovalRequest,store:DecisionStore,actor:ApprovalActor,decision:KateDecision,remarks:string,now=new Date()):FinalDecisionRecord{
 const error=checkFinalDecision(req,store,actor,decision,remarks);
 if(error)throw new Error(error);
 return {id:`FA-${req.id}-${now.getTime()}`,requestId:req.id,source:req.source,sourceRevision:req.sourceRevision,fingerprint:approvalFingerprint(req),actor:actor.username,role:actor.role,decidedAt:now.toISOString(),decision,remarks:remarks.trim(),beforeStatus:"Pending Ms Kate Approval",afterStatus:decision};
}
/** Demo-only local decision journal. Never writes CMS-owned request fields or releases money. */
export function saveDemoDecision(req:FinalApprovalRequest,actor:ApprovalActor,decision:KateDecision,remarks:string):FinalDecisionRecord{
 if(typeof window==="undefined")throw new Error("Browser review mode only.");
 const store=readDecisionStore();const record=createDecision(req,store,actor,decision,remarks);
 const next:DecisionStore={schema:1,decisions:[...store.decisions,record].slice(-500)};
 window.localStorage.setItem(FINAL_APPROVAL_STORAGE_KEY,JSON.stringify(next));
 window.dispatchEvent(new CustomEvent("uc-hr-final-approval-changed",{detail:{requestId:req.id}}));
 return record;
}
/** Future release-authorization gate; does not trigger, schedule, or execute disbursement. */
export function canAuthorizeDisbursementRelease(req:FinalApprovalRequest,store:DecisionStore):boolean{
 return req.requiresFinalApproval&&hasCurrentAccountingApproval(req)&&getApprovalStatus(req,store)==="Approved for Release";
}
export function formatPhilippinesTime(iso:string):string{
 if(!iso)return "Not yet recorded";
 const d=new Date(iso);if(!Number.isFinite(d.getTime()))return "Unknown date";
 return new Intl.DateTimeFormat("en-PH",{timeZone:"Asia/Manila",dateStyle:"medium",timeStyle:"short"}).format(d)+" PHT";
}
