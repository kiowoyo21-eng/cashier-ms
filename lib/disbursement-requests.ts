/** CMS-originated disbursement request contract (v1).
 * Local prototype owns DRAFT/SUBMISSION only. Accounting, HRMS and release
 * are external authority boundaries. Do not infer external decisions from
 * CMS admin actions or old RF/RFP replenishment statuses.
 */
import {BRANCHES,BRANCH_NAME,type BranchId,type Database,type Receipt,type Role,type User,log,uid,todayPH} from './data';

export const DISBURSEMENT_STATUSES = [
 'Draft','Pending Accounting Approval','Returned by Accounting','Rejected by Accounting',
 'Pending Ms Kate Approval','Returned by Ms Kate','Rejected by Ms Kate',
 'Approved for Release','Released / Paid','Reconciled'
] as const;
export type DisbursementStatus = typeof DISBURSEMENT_STATUSES[number];
export type DisbursementRequestorRole = Extract<Role,'cashier'|'pb'>;
export type ExternalStage = 'Accounting'|'Ms Kate';
export interface ExternalDecision {
 state:'Pending'|'Approved'|'Returned'|'Rejected';actorId?:string;actorName?:string;
 decidedAt?:string;reason?:string;origin:'external';
}
export interface DisbursementRelease {
 amount:number;method:string;date:string;reference:string;releasingUserId:string;
 proof:Receipt;recordedAt:string;authorizationId:string;
}
export interface DisbursementReconciliation {reconciledBy:string;reconciledAt:string;reference:string;notes:string;}
export interface DisbursementTimeline {
 id:string;at:string;actorId:string;actorRole:string;branch:BranchId;action:string;
 from?:DisbursementStatus;to:DisbursementStatus;remarks?:string;changes?:Record<string,{before:unknown;after:unknown}>;
 origin:'cms'|'external';
}
export interface DisbursementRequest {
 id:string;requestNo:string;schemaVersion:1;
 requestDate:string;requestorId:string;requestorName:string;employeeId:string;
 requestorRole:DisbursementRequestorRole;branch:BranchId;
 category:string;purpose:string;amount:number;attachments:Receipt[];remarks:string;
 status:DisbursementStatus;revision:number;createdAt:string;updatedAt:string;submittedAt?:string;
 accounting?:ExternalDecision;msKate?:ExternalDecision;
 approvedForReleaseAt?:string;release?:DisbursementRelease;reconciliation?:DisbursementReconciliation;
 timeline:DisbursementTimeline[];
}
export interface DisbursementDraftFields {
 requestDate:string;branch:BranchId;category:string;purpose:string;amount:number;attachments:Receipt[];remarks:string;
}
export const DISBURSEMENT_CATEGORIES = [
 'Parts Purchasing','Petty Cash Replenishment','Operating Expense','Supplier Payment',
 'Staff Reimbursement','Transportation','Emergency Expense','Other'
] as const;
const clock=()=>new Date().toISOString();
const requests=(db:Database):DisbursementRequest[]=>db.disbursementRequests||[];
export function isDisbursementCreator(u?:User):u is User & {role:DisbursementRequestorRole} {return !!u?.active&&(u.role==='cashier'||u.role==='pb');}
function requireOwner(request:DisbursementRequest,u:User){
 if(!isDisbursementCreator(u)||request.requestorId!==u.id||(u.role==='cashier'&&request.branch!==u.branch))throw new Error('Only the assigned active requester may change this request in an authorized branch.');
}
function validateFields(fields:DisbursementDraftFields,u:User){
 if(!isDisbursementCreator(u))throw new Error('Only Cashier or Parts Buyer may create a disbursement request.');
 if(!BRANCHES.some(b=>b.id===fields.branch)||(u.role==='cashier'&&fields.branch!==u.branch))throw new Error('Select your assigned branch (or a valid PB branch).');
 if(!/^\d{4}-\d{2}-\d{2}$/.test(fields.requestDate)||Number.isNaN(Date.parse(fields.requestDate)))throw new Error('Enter a valid request date.');
 if(!fields.category.trim())throw new Error('Select a disbursement category.');
 if(fields.purpose.trim().length<5)throw new Error('Purpose must have at least five characters.');
 if(!Number.isFinite(fields.amount)||fields.amount<=0||Math.abs(Math.round(fields.amount*100)-fields.amount*100)>0.000001)throw new Error('Enter a positive PHP amount with up to two decimal places.');
 if(!Array.isArray(fields.attachments)||fields.attachments.length>5||fields.attachments.some(a=>!a?.name||!a?.data||a.data.length>1_500_000||!/^data:(application\/pdf|image\/(png|jpeg|webp));base64,/i.test(a.data)))throw new Error('Upload up to five attachments, max roughly 1 MB each.');
}
function timeline(r:DisbursementRequest,u:User,action:string,to:DisbursementStatus,remarks='',changes?:DisbursementTimeline['changes']):DisbursementTimeline{
 return {id:uid(),at:clock(),actorId:u.id,actorRole:u.role,branch:r.branch,action,from:r.status,to,remarks:remarks.trim(),changes,origin:'cms'};
}
function audit(db:Database,r:DisbursementRequest,u:User,action:string,description:string){
 return log(db,u.id,`Disbursement: ${action}`,`${r.requestNo} · ${BRANCH_NAME(r.branch)} · ${u.role} · ${description}`);
}
function nextNo(db:Database,branch:BranchId){
 // Stable, globally unique even with deleted drafts and different branches; not a reused sequence.
 let id='';do{id=`DR-${branch}-${todayPH().replace(/-/g,'')}-${uid().replace(/-/g,'').slice(0,12).toUpperCase()}`;}while(requests(db).some(r=>r.requestNo===id));return id;
}
export function createDisbursementDraft(db:Database,u:User,fields:DisbursementDraftFields):Database {
 validateFields(fields,u);const at=clock();const r:DisbursementRequest={
  id:uid(),requestNo:nextNo(db,fields.branch),schemaVersion:1,requestDate:fields.requestDate,
  requestorId:u.id,requestorName:u.name,employeeId:u.id,requestorRole:u.role as DisbursementRequestorRole,
  branch:fields.branch,category:fields.category.trim(),purpose:fields.purpose.trim(),amount:fields.amount,
  attachments:[...fields.attachments],remarks:fields.remarks.trim(),status:'Draft',revision:1,createdAt:at,updatedAt:at,timeline:[]
 };
 r.timeline=[timeline(r,u,'Draft created','Draft','New request')];
 return audit({...db,disbursementRequests:[r,...requests(db)]},r,u,'Draft created',`Amount PHP ${r.amount.toFixed(2)} · ${r.category}`);
}
export function editDisbursementDraft(db:Database,id:string,u:User,fields:DisbursementDraftFields):Database {
 const r=requests(db).find(x=>x.id===id);if(!r)throw new Error('Request not found.');requireOwner(r,u);
 if(!['Draft','Returned by Accounting','Returned by Ms Kate'].includes(r.status))throw new Error('Submitted, approved, rejected or released requests cannot be edited.');
 validateFields(fields,u);
 // Existing request branch is immutable; changing branches requires a new request.
 if(fields.branch!==r.branch)throw new Error('Request branch cannot be changed after creation. Create a new draft for another branch.');
 const changes:NonNullable<DisbursementTimeline['changes']>={};
 for(const key of ['requestDate','category','purpose','amount','remarks'] as const){const before=r[key],after=(typeof fields[key]==='string'?fields[key].trim():fields[key]);if(before!==after)changes[key]={before,after};}
 if(r.attachments.length!==fields.attachments.length||r.attachments.some((a,i)=>a.name!==fields.attachments[i]?.name||a.data!==fields.attachments[i]?.data))changes.attachments={before:r.attachments.map(x=>x.name),after:fields.attachments.map(x=>x.name)};
 if(!Object.keys(changes).length)return db;
 const at=clock();const changed:DisbursementRequest={...r,requestDate:fields.requestDate,category:fields.category.trim(),purpose:fields.purpose.trim(),amount:fields.amount,attachments:[...fields.attachments],remarks:fields.remarks.trim(),revision:r.revision+1,updatedAt:at,
  // Keep the external return reason visible while being edited; reset prior approvals on resubmission.
  timeline:[...r.timeline,timeline(r,u,'Draft revised',r.status,`Revision ${r.revision+1}`,changes)]};
 return audit({...db,disbursementRequests:requests(db).map(x=>x.id===id?changed:x)},r,u,'Draft revised',`rev ${changed.revision}; fields ${Object.keys(changes).join(', ')}; before/after recorded in request timeline`);
}
export function submitDisbursementRequest(db:Database,id:string,u:User):Database {
 const r=requests(db).find(x=>x.id===id);if(!r)throw new Error('Request not found.');requireOwner(r,u);
 if(!['Draft','Returned by Accounting','Returned by Ms Kate'].includes(r.status))throw new Error('Only draft or returned requests may be submitted.');
 validateFields({requestDate:r.requestDate,branch:r.branch,category:r.category,purpose:r.purpose,amount:r.amount,attachments:r.attachments,remarks:r.remarks},u);
 if(r.status.startsWith('Returned')){
  const lastReturn=r.timeline.map((t,i)=>({t,i})).filter(x=>x.t.to===r.status&&x.t.origin==='external').pop();
  const hadCorrections=r.timeline.some((t,i)=>t.action==='Draft revised'&&(!lastReturn||i>lastReturn.i));
  if(!hadCorrections)throw new Error('Edit and save corrections before resubmitting a returned request.');
 }
 const at=clock();const changed:DisbursementRequest={...r,status:'Pending Accounting Approval',updatedAt:at,submittedAt:at,
  accounting:undefined,msKate:undefined,approvedForReleaseAt:undefined,
  timeline:[...r.timeline,timeline(r,u,r.status==='Draft'?'Submitted':'Corrections resubmitted','Pending Accounting Approval','Awaiting real Accounting verification')]};
 return audit({...db,disbursementRequests:requests(db).map(x=>x.id===id?changed:x)},r,u,changed.timeline[changed.timeline.length-1].action,`${r.status} → Pending Accounting Approval · PHP ${r.amount.toFixed(2)}`);
}
/** Read-only external stage predicates for a FUTURE trusted shared-database adapter.
 * CMS has NO external approval, payment or reconciliation mutation control. */
export function releaseEligible(r:DisbursementRequest):boolean{
 return r.status==='Approved for Release'&&r.accounting?.state==='Approved'&&r.accounting.origin==='external'&&r.msKate?.state==='Approved'&&r.msKate.origin==='external'&&!!r.approvedForReleaseAt&&!r.release;
}
export function externallyConsistent(r:DisbursementRequest):boolean{
 if(['Pending Ms Kate Approval','Returned by Ms Kate','Rejected by Ms Kate','Approved for Release','Released / Paid','Reconciled'].includes(r.status)&&r.accounting?.state!=='Approved')return false;
 if(['Approved for Release','Released / Paid','Reconciled'].includes(r.status)&&r.msKate?.state!=='Approved')return false;
 if(['Released / Paid','Reconciled'].includes(r.status)&&(!r.release||!r.approvedForReleaseAt))return false;
 if(r.status==='Reconciled'&&!r.reconciliation)return false;
 return true;
}
export function visibleDisbursements(db:Database,u:User,adminBranch:BranchId|'ALL'='ALL'){
 return requests(db).filter(r=>u.role==='admin'?(adminBranch==='ALL'||r.branch===adminBranch):(r.requestorId===u.id&&(u.role==='pb'||r.branch===u.branch)));
}
