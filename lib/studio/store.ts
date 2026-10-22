import {validateFormFields,withFormPlaceholders} from "./formBuilder";
import type {StudioFormField} from "./types";
import {writeAuditEvent} from "../auditTrail";
import {activeDemoUser} from "../spreadsheetStore";
import {isHrRole} from "../mock";
import type {ApprovalRequest,StudioActor,StudioItem,StudioLog,StudioState,StudioKind,TemplateCategory,StudioComment} from "./types";
const KEY="uc-hr-document-studio-v1";
const EVENT="uc-hr-document-studio-change";
const GRANT_TIME=60*60*1000;
const id=()=>typeof crypto!=="undefined"&&"randomUUID" in crypto?crypto.randomUUID():`${Date.now()}-${Math.random().toString(36).slice(2)}`;
const now=()=>new Date().toISOString();
const starter:StudioState={items:[
 {id:"starter-employment",kind:"docs",title:"Certificate of Employment",category:"Employment",template:true,html:'<h1 style="text-align:center">CERTIFICATE OF EMPLOYMENT</h1><p>This is to certify that <strong>{{employee.name}}</strong> (Employee ID: {{employee.id}}) is employed by <strong>{{company.name}}</strong> as <strong>{{employee.position}}</strong> under the {{employee.department}} department.</p><p>The employee has been with the company since {{employee.hire_date}} and is assigned to {{employee.branch}}.</p><p>This certificate is issued on {{document.date}} for {{custom.purpose}}.</p><p><br></p><p>_______________________________<br>Authorized HR Representative</p>',pageSize:"A4",landscape:false,owner:"system",createdAt:"2026-10-19T00:00:00.000Z",updatedAt:"2026-10-19T00:00:00.000Z",version:1,status:"Approved Template"},
 {id:"starter-memo",kind:"docs",title:"Employee Memorandum",category:"Disciplinary",template:true,html:'<h1>INTERNAL MEMORANDUM</h1><p><strong>Date:</strong> {{document.date}}</p><p><strong>To:</strong> {{employee.name}} — {{employee.position}}</p><p><strong>Branch:</strong> {{employee.branch}}</p><p><strong>Subject:</strong> {{custom.subject}}</p><p>Dear {{employee.name}},</p><p>{{custom.message}}</p><p>Sincerely,</p><p>Human Resources Department</p>',pageSize:"A4",landscape:false,owner:"system",createdAt:"2026-10-19T00:00:00.000Z",updatedAt:"2026-10-19T00:00:00.000Z",version:1,status:"Approved Template"}
 ],approvals:[],revisions:[],logs:[],comments:[]};
export const blankState=():StudioState=>JSON.parse(JSON.stringify(starter)) as StudioState;
export function readStudio():StudioState{if(typeof window==="undefined")return blankState();try{const x=JSON.parse(localStorage.getItem(KEY)||"null");return x&&Array.isArray(x.items)&&Array.isArray(x.approvals)&&Array.isArray(x.revisions)&&Array.isArray(x.logs)?{...x,comments:Array.isArray(x.comments)?x.comments:[]}:blankState()}catch{return blankState()}}
export function studioActor():StudioActor|null{return activeDemoUser()}
export function canRead(a:StudioActor|null){return !!a&&(isHrRole(a.role)||a.role==="Super Admin")}
export function canEdit(s:StudioState,a:StudioActor|null,itemId:string,at=Date.now()):boolean{if(!a||!canRead(a))return false;if(a.role==="Super Admin")return true;return s.approvals.some(r=>r.itemId===itemId&&r.requester===a.username&&r.status==="approved"&&!!r.expiresAt&&Date.parse(r.expiresAt)>at)}
export function currentRequest(s:StudioState,a:StudioActor|null,itemId:string){return [...s.approvals].reverse().find(r=>r.itemId===itemId&&r.requester===a?.username)}
function audit(s:StudioState,a:string,itemId:string,action:string,detail=""){s.logs.unshift({id:id(),itemId,date:now(),actor:a,action,detail:detail.slice(0,300)});s.logs=s.logs.slice(0,750)}
export function changeStudio(a:StudioActor,run:(s:StudioState)=>void):StudioState{const actual=studioActor();if(!actual||actual.username!==a.username||actual.role!==a.role||!canRead(a))throw Error("HRMS session is missing or expired.");const s=readStudio();const priorLog=s.logs[0]?.id;run(s);try{localStorage.setItem(KEY,JSON.stringify(s))}catch{throw Error("Local browser storage is full. Save failed.")}
 const event=s.logs[0];if(event&&event.id!==priorLog)writeAuditEvent({module:"Document Library / Docs / PDF",action:event.action,recordId:event.itemId,actor:a.username,role:a.role,summary:"Change recorded; document contents and reasons withheld"});
 window.dispatchEvent(new Event(EVENT));return s}
export function subscribeStudio(callback:()=>void){window.addEventListener(EVENT,callback);const onStorage=(e:StorageEvent)=>{if(e.key===KEY||e.key==="ucmm-hr-demo-login-v1")callback()};window.addEventListener("storage",onStorage);return ()=>{window.removeEventListener(EVENT,callback);window.removeEventListener("storage",onStorage)}}
export function requestDocumentEdit(a:StudioActor,itemId:string,reason:string){if(!isHrRole(a.role))throw Error("Only HR requests editing access.");const text=reason.trim();if(text.length<12)throw Error("Enter at least 12 characters explaining the change.");return changeStudio(a,s=>{const item=s.items.find(x=>x.id===itemId);if(!item)throw Error("Document was not found.");if(canEdit(s,a,itemId))throw Error("Editing is already approved.");if(s.approvals.some(x=>x.itemId===itemId&&x.requester===a.username&&x.status==="pending"))throw Error("There is already a pending request.");s.approvals.push({id:id(),itemId,itemTitle:item.title,requester:a.username,reason:text.slice(0,500),status:"pending",requestedAt:now()});audit(s,a.username,itemId,"Edit permission requested",text)})}
export function decideDocumentEdit(a:StudioActor,requestId:string,action:"approved"|"denied"|"revoked",note=""){if(a.role!=="Super Admin")throw Error("Only Super Admin can decide requests.");return changeStudio(a,s=>{const r=s.approvals.find(x=>x.id===requestId);if(!r)throw Error("Request not found.");if(action==="revoked"){if(r.status!=="approved")throw Error("Approval is no longer active.")}else if(r.status!=="pending")throw Error("Request is no longer pending.");if(r.requester===a.username)throw Error("Self-approval is not permitted.");r.status=action;r.decidedAt=now();r.decidedBy=a.username;r.note=note.slice(0,250);if(action==="approved"){s.approvals.forEach(x=>{if(x!==r&&x.itemId===r.itemId&&x.requester===r.requester&&x.status==="approved")x.status="revoked"});r.expiresAt=new Date(Date.now()+GRANT_TIME).toISOString()}audit(s,a.username,r.itemId,`${action} editing`,`${r.requester} · ${r.itemTitle}`)})}
export function addStudioItem(a:StudioActor,kind:StudioKind,title:string,category:TemplateCategory,opts:Partial<StudioItem>={}){if(a.role!=="Super Admin")throw Error("Only Super Admin can create source templates.");const name=title.trim();if(name.length<3||name.length>120)throw Error("Title must be 3–120 characters.");const item:StudioItem={id:id(),kind,title:name,category,template:true,html:kind==="docs"?"<h1>Untitled document</h1><p></p>":undefined,fields:kind==="pdf"?[]:undefined,pageSize:"A4",landscape:false,owner:a.username,createdAt:now(),updatedAt:now(),version:1,status:"Draft",...opts};changeStudio(a,s=>{s.items.unshift(item);audit(s,a.username,item.id,"Template created",item.title)});return item}
export function saveStudioItem(a:StudioActor,itemId:string,update:Partial<StudioItem>,expectedVersion:number){return changeStudio(a,s=>{if(!canEdit(s,a,itemId))throw Error("Editing locked or approval expired. Request approval before saving.");const item=s.items.find(x=>x.id===itemId);if(!item)throw Error("Document not found.");if(item.version!==expectedVersion)throw Error("Document changed in another tab. Reload to avoid overwriting newer work.");if(update.status!==undefined&&a.role!=="Super Admin")throw Error("Only Super Admin can change template approval status.");const allowed:Partial<StudioItem>={};for(const key of ["title","html","fields","pageSize","landscape","status","category","headerText","footerText","marginMm"] as const){if(update[key]!==undefined)(allowed as Record<string,unknown>)[key]=update[key]}s.revisions.unshift({id:id(),itemId:item.id,version:item.version,date:now(),actor:a.username,snapshot:JSON.parse(JSON.stringify(item))});s.revisions=s.revisions.slice(0,24);if(item.template&&a.role!=="Super Admin"&&item.status==="Approved Template")allowed.status="Draft";
 Object.assign(item,allowed,{updatedAt:now(),version:item.version+1});audit(s,a.username,itemId,"Saved document version",`Version ${item.version}${item.template&&item.status==="Draft"?" · pending template review":""}`)})}
/** Super Admin owns template schema and its approval state. Schema edits invalidate prior approval. */
export function saveStudioFormFields(a:StudioActor,itemId:string,fields:StudioFormField[],expectedVersion:number){
 if(a.role!=="Super Admin")throw Error("Only Super Admin can configure source form fields.");
 validateFormFields(fields);
 return changeStudio(a,s=>{
  const item=s.items.find(x=>x.id===itemId);
  if(!item||!item.template||item.kind!=="docs"||item.status==="Archived")throw Error("An active Docs source template is required.");
  if(item.version!==expectedVersion)throw Error("Template changed in another tab. Refresh before saving form fields.");
  s.revisions.unshift({id:id(),itemId:item.id,version:item.version,date:now(),actor:a.username,snapshot:JSON.parse(JSON.stringify(item))});
  s.revisions=s.revisions.slice(0,24);
  const obsolete=(item.formFields||[]).filter(old=>!fields.some(f=>f.key===old.key));
  let updatedHtml=item.html||"";
  for(const old of obsolete){
   const placeholder=`{{custom.${old.key}}}`;
   const safeLabel=old.label.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
   updatedHtml=updatedHtml.replaceAll(`<p><strong>${safeLabel}:</strong> ${placeholder}</p>`,"").replaceAll(placeholder,"");
  }
  item.formFields=fields.map(f=>({...f,options:[...f.options]}));
  item.html=withFormPlaceholders(updatedHtml,fields);
  item.status="Draft";item.version++;item.updatedAt=now();
  audit(s,a.username,itemId,"Form schema updated",`Version ${item.version} · ${fields.length} fields · approval reset to Draft`);
 });
}
export function restoreStudioRevision(a:StudioActor,itemId:string,revisionId:string,expectedVersion:number){return changeStudio(a,s=>{if(!canEdit(s,a,itemId))throw Error("Editing locked.");const item=s.items.find(x=>x.id===itemId),r=s.revisions.find(x=>x.id===revisionId&&x.itemId===itemId);if(!item||!r)throw Error("Version not found.");if(item.version!==expectedVersion)throw Error("Newer version exists. Reload first.");if(a.role!=="Super Admin"&&item.template)throw Error("Only Super Admin can restore source template versions.");if(a.role!=="Super Admin"&&r.snapshot.status!==item.status)throw Error("Only Super Admin can restore changes to template approval status.");s.revisions.unshift({id:id(),itemId,version:item.version,date:now(),actor:a.username,snapshot:JSON.parse(JSON.stringify(item))});Object.assign(item,{...r.snapshot,id:item.id,owner:item.owner,version:item.version+1,updatedAt:now()});audit(s,a.username,itemId,"Restored version",`From version ${r.version}`)})}
export function duplicateForEmployee(a:StudioActor,source:StudioItem,title:string,html?:string){if(!canRead(a))throw Error("Not authorized.");if(source.kind!=="docs")throw Error("Use PDF generation for PDF forms.");const item:StudioItem={...source,id:id(),title,html:html??source.html,template:false,parentId:source.id,owner:a.username,status:"Draft",version:1,createdAt:now(),updatedAt:now()};changeStudio(a,s=>{s.items.unshift(item);audit(s,a.username,item.id,"Generated document from template",`Source ${source.title}`)});return item}
export function noteGenerated(a:StudioActor,itemId:string,summary:string){return changeStudio(a,s=>{if(!s.items.some(x=>x.id===itemId))throw Error("Missing source document.");audit(s,a.username,itemId,"Generated output",summary)})}

/** Permission checks are repeated inside the storage transaction, not only in the UI. */
function requireCommentAccess(s:StudioState,a:StudioActor,itemId:string){
 const item=s.items.find(x=>x.id===itemId&&x.kind==="docs");
 if(!item)throw Error("Docs file not found.");
 if(!canEdit(s,a,itemId))throw Error("Document editing approval is required to change review comments.");
}
function commentBody(body:string){const content=body.trim();if(content.length<2||content.length>1200)throw Error("Review comments must be 2–1,200 characters.");return content}
export function addStudioComment(a:StudioActor,itemId:string,body:string,quote=""){
 const content=commentBody(body);
 const selection=quote.trim().slice(0,240);
 return changeStudio(a,s=>{
  requireCommentAccess(s,a,itemId);
  const comments=s.comments??(s.comments=[]);
  if(comments.length>=500)throw Error("Review comment limit reached. Archive older documents or move to server storage.");
  const thread:StudioComment={id:id(),itemId,actor:a.username,date:now(),quote:selection,text:content,resolved:false,replies:[]};
  comments.push(thread);
  audit(s,a.username,itemId,"Review comment added",`Review thread ${thread.id}; comment text not logged`);
 });
}
export function replyStudioComment(a:StudioActor,itemId:string,commentId:string,body:string){
 const content=commentBody(body);
 return changeStudio(a,s=>{
  requireCommentAccess(s,a,itemId);
  const thread=s.comments?.find(c=>c.id===commentId&&c.itemId===itemId);
  if(!thread)throw Error("Review thread not found for this document.");
  if(thread.resolved)throw Error("Reopen the thread before replying.");
  if(thread.replies.length>=50)throw Error("This review thread has reached the reply limit.");
  thread.replies.push({id:id(),actor:a.username,date:now(),text:content});
  audit(s,a.username,itemId,"Review comment replied",`Review thread ${thread.id}; reply text not logged`);
 });
}
export function setStudioCommentResolved(a:StudioActor,itemId:string,commentId:string,resolved:boolean){
 return changeStudio(a,s=>{
  requireCommentAccess(s,a,itemId);
  const thread=s.comments?.find(c=>c.id===commentId&&c.itemId===itemId);
  if(!thread)throw Error("Review thread not found for this document.");
  if(thread.resolved===resolved)throw Error(resolved?"Already resolved.":"Already open.");
  thread.resolved=resolved;
  thread.resolvedBy=resolved?a.username:undefined;
  thread.resolvedAt=resolved?now():undefined;
  audit(s,a.username,itemId,resolved?"Review comment resolved":"Review comment reopened",`Review thread ${thread.id}`);
 });
}

export function archiveStudioItem(a:StudioActor,itemId:string){if(a.role!=="Super Admin")throw Error("Only Super Admin can archive templates.");return changeStudio(a,s=>{const item=s.items.find(x=>x.id===itemId);if(!item)throw Error("Document not found.");s.revisions.unshift({id:id(),itemId:item.id,version:item.version,date:now(),actor:a.username,snapshot:JSON.parse(JSON.stringify(item))});s.revisions=s.revisions.slice(0,24);item.status=item.status==="Archived"?"Draft":"Archived";item.version++;item.updatedAt=now();audit(s,a.username,itemId,item.status==="Archived"?"Archived document":"Restored archived document",item.title)})}
export function duplicateStudioTemplate(a:StudioActor,itemId:string){if(a.role!=="Super Admin")throw Error("Only Super Admin can duplicate source templates.");const s=readStudio(),item=s.items.find(x=>x.id===itemId);if(!item||item.kind!=="docs")throw Error("Only Docs templates can be duplicated here.");return addStudioItem(a,"docs",`Copy of ${item.title}`.slice(0,120),item.category,{html:item.html,pageSize:item.pageSize,landscape:item.landscape,headerText:item.headerText,footerText:item.footerText,marginMm:item.marginMm})}
export function generateDocumentsBatch(a:StudioActor,sourceId:string,entries:{title:string;html:string}[]):StudioItem[]{
 if(!canRead(a))throw Error("Not authorized.");if(entries.length<1||entries.length>100)throw Error("Choose 1–100 employees.");
 const generated:StudioItem[]=[];
 changeStudio(a,s=>{const source=s.items.find(x=>x.id===sourceId);if(!source||source.kind!=="docs"||!source.template||source.status==="Archived")throw Error("Source template is not available.");if(isHrRole(a.role)&&source.status!=="Approved Template")throw Error("Admin approval of the source template is required.");
  for(const e of entries){const item:StudioItem={...source,id:id(),title:e.title.slice(0,120),html:e.html,template:false,parentId:source.id,owner:a.username,status:"Draft",version:1,createdAt:now(),updatedAt:now()};generated.push(item);s.items.unshift(item)}audit(s,a.username,sourceId,"Bulk generated documents",`${generated.length} files from ${source.title}`)});
 return generated;
}
