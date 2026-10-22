/** Spreadsheet review workspace. Local-browser DEMO ONLY; never use for real authorization.
 * A server must verify session, grant, version, and write permissions in production.
 */
import {demoAccounts,isHrRole,type Role} from "./mock";
import {writeAuditEvent} from "./auditTrail";
import {isValidInput,validRule,rangeIncludes,type ValidationRule,type ConditionalRule} from "./sheetDataTools";

export type SheetActor={username:string;role:Role};
export type EditRequest={id:string;sheetId:string;sheetTitle:string;requester:string;reason:string;status:"pending"|"approved"|"denied"|"revoked";requestedAt:string;decidedAt?:string;decidedBy?:string;decisionNote?:string;expiresAt?:string};
export type WorkingSheet={cells:Record<string,string>;extraRows:number;extraCols:number;snapshot?:SheetBaseline&{capturedAt:string};formats?:Record<string,CellAppearance>;validations?:Record<string,ValidationRule>;conditionalRules?:ConditionalRule[]};
export type SheetBaseline={columns:string[];rows:string[][]};
export type SheetAudit={id:string;date:string;actor:string;action:string;sheetId:string;detail:string};
export type LocalSheetState={requests:EditRequest[];sheets:Record<string,WorkingSheet>;customSheets:{id:string;title:string}[];audit:SheetAudit[]};
const KEY="uc-hr-ui-spreadsheet-workspace-v1";
const SESSION_KEY="ucmm-hr-demo-login-v1";
const EVENT="uc-hr-spreadsheet-updated";
const APPROVAL_MS=60*60*1000;
export const emptySheetState=():LocalSheetState=>({requests:[],sheets:{},customSheets:[],audit:[]});
const iso=()=>new Date().toISOString();
const id=()=>typeof crypto!=="undefined"&&"randomUUID" in crypto?crypto.randomUUID():`${Date.now()}-${Math.random().toString(36).slice(2)}`;

export function readSheetState():LocalSheetState{
 if(typeof window==="undefined")return emptySheetState();
 try{const p=JSON.parse(localStorage.getItem(KEY)||"null");if(!p||!Array.isArray(p.requests)||!p.sheets||!Array.isArray(p.customSheets)||!Array.isArray(p.audit))return emptySheetState();return p as LocalSheetState;}catch{return emptySheetState()}
}
// Matches the demo login's 7-day absolute and 30-minute idle limits.
export function activeDemoUser():SheetActor|null{
 if(typeof window==="undefined")return null;
 try{const s=JSON.parse(localStorage.getItem(SESSION_KEY)||"null");const now=Date.now();if(!s||!Number.isFinite(s.createdAt)||!Number.isFinite(s.lastActive)||now-s.createdAt>7*86400000||now-s.lastActive>30*60000||s.createdAt>now+60000)return null;const account=demoAccounts.find(a=>a.username===s.username&&a.role===s.role);return account?{username:account.username,role:account.role}:null;}catch{return null}
}
/** Keep a user who is active in the standalone tab from timing out as idle. */
export function touchDemoSession(){
 const actor=activeDemoUser();if(!actor)return;
 try{const session=JSON.parse(localStorage.getItem(SESSION_KEY)||"null");if(session?.username===actor.username&&session?.role===actor.role){session.lastActive=Date.now();localStorage.setItem(SESSION_KEY,JSON.stringify(session));}}catch{}
}
export function hasEditGrant(state:LocalSheetState,actor:SheetActor,sheetId:string,now=Date.now()):boolean{
 return isHrRole(actor.role)&&state.requests.some(r=>r.requester===actor.username&&r.sheetId===sheetId&&r.status==="approved"&&!!r.expiresAt&&Date.parse(r.expiresAt)>now);
}
export function latestRequest(state:LocalSheetState,user:string,sheetId:string){return [...state.requests].reverse().find(r=>r.requester===user&&r.sheetId===sheetId)}
function log(state:LocalSheetState,actor:string,action:string,sheetId:string,detail:string){state.audit.unshift({id:id(),date:iso(),actor,action,sheetId,detail:detail.slice(0,320)});state.audit=state.audit.slice(0,450)}
function commit(actor:SheetActor,update:(state:LocalSheetState)=>void):LocalSheetState{
 const session=activeDemoUser();if(!session||session.username!==actor.username||session.role!==actor.role)throw Error("Session changed or expired. Sign in again.");
 const state=readSheetState();const previousLog=state.audit[0]?.id;update(state);
 try{localStorage.setItem(KEY,JSON.stringify(state));}catch{throw Error("Browser storage is full. Changes were not saved.")}
 const recent=state.audit[0];
 if(recent&&recent.id!==previousLog&&recent.actor===actor.username){writeAuditEvent({module:"Spreadsheets",action:recent.action,recordId:recent.sheetId,summary:"Action recorded for worksheet (sensitive values and request reasons withheld)"})}
 window.dispatchEvent(new Event(EVENT));return state;
}
export function subscribeSheetChanges(callback:()=>void){window.addEventListener(EVENT,callback);const onStorage=(e:StorageEvent)=>{if(e.key===KEY||e.key===SESSION_KEY)callback()};window.addEventListener("storage",onStorage);return ()=>{window.removeEventListener(EVENT,callback);window.removeEventListener("storage",onStorage)}}
export function requestSheetEdit(actor:SheetActor,sheetId:string,sheetTitle:string,reason:string){
 if(!isHrRole(actor.role))throw Error("Only HR can request worksheet editing in this prototype.");
 const justification=reason.trim();if(justification.length<12)throw Error("Provide a reason of at least 12 characters.");
 return commit(actor,s=>{if(hasEditGrant(s,actor,sheetId))throw Error("You already have an active approval for this sheet.");if(s.requests.some(r=>r.requester===actor.username&&r.sheetId===sheetId&&r.status==="pending"))throw Error("A request is already pending for this worksheet.");s.requests.push({id:id(),requester:actor.username,sheetId,sheetTitle,reason:justification.slice(0,500),status:"pending",requestedAt:iso()});log(s,actor.username,"Requested edit approval",sheetId,justification)});
}
export function decideSheetRequest(actor:SheetActor,requestId:string,decision:"approved"|"denied",note:string){
 if(actor.role!=="Super Admin")throw Error("Only Super Admin can make approval decisions.");
 return commit(actor,s=>{const r=s.requests.find(x=>x.id===requestId);if(!r||r.status!=="pending")throw Error("Request is no longer pending.");if(r.requester===actor.username)throw Error("Self-approval is not allowed.");r.status=decision;r.decidedBy=actor.username;r.decidedAt=iso();r.decisionNote=note.trim().slice(0,250);if(decision==="approved"){s.requests.forEach(x=>{if(x!==r&&x.status==="approved"&&x.requester===r.requester&&x.sheetId===r.sheetId){x.status="revoked";x.decisionNote="Superseded by another approval"}});r.expiresAt=new Date(Date.now()+APPROVAL_MS).toISOString()}log(s,actor.username,decision==="approved"?"Approved edit access":"Denied edit access",r.sheetId,`${r.requester} · ${r.sheetTitle} · ${r.decisionNote||"No note"}`)});
}
export function revokeSheetGrant(actor:SheetActor,requestId:string){
 if(actor.role!=="Super Admin")throw Error("Only Super Admin can revoke access.");
 return commit(actor,s=>{const r=s.requests.find(x=>x.id===requestId);if(!r||r.status!=="approved")throw Error("Approval is not active.");r.status="revoked";r.decidedBy=actor.username;r.decidedAt=iso();log(s,actor.username,"Revoked edit access",r.sheetId,`${r.requester} · ${r.sheetTitle}`)});
}
const requireGrant=(s:LocalSheetState,actor:SheetActor,sheetId:string)=>{if(!hasEditGrant(s,actor,sheetId))throw Error("Editing is locked. Request approval from Super Admin first.")};
export function writeSheetCells(actor:SheetActor,sheetId:string,updates:{cell:string;value:string}[],baseline?:SheetBaseline){
 if(!updates.length)return readSheetState();
 if(updates.length>2000)throw Error("Paste up to 2,000 cells at a time.");
 return commit(actor,s=>{requireGrant(s,actor,sheetId);const sheet=s.sheets[sheetId]||{cells:{},extraRows:0,extraCols:0};for(const u of updates){if(!/^[A-Z]{1,2}(?:[1-9]\d{0,3})$/.test(u.cell)||u.value.length>1500)throw Error("Invalid cell or value exceeds 1,500 characters.");}
 if(!sheet.snapshot&&baseline)sheet.snapshot={columns:baseline.columns,rows:baseline.rows,capturedAt:iso()};
 for(const u of updates){const rule=sheet.validations?.[u.cell];if(rule&&!isValidInput(u.value,rule))throw Error(`${u.cell}: value does not meet data validation rules.`)}
 for(const u of updates){const before=sheet.cells[u.cell]??"(source/blank)";sheet.cells[u.cell]=u.value;if(updates.length===1)log(s,actor.username,"Edited cell",sheetId,`${u.cell}: working-copy value updated (contents redacted)`)}if(updates.length>1)log(s,actor.username,"Edited range",sheetId,`${updates.length} cells, ${updates[0].cell} through ${updates[updates.length-1].cell}`);s.sheets[sheetId]=sheet;
 });
}
export function growSheet(actor:SheetActor,sheetId:string,kind:"row"|"col",baseline?:SheetBaseline){
 return commit(actor,s=>{requireGrant(s,actor,sheetId);const sheet=s.sheets[sheetId]||{cells:{},extraRows:0,extraCols:0};if(!sheet.snapshot&&baseline)sheet.snapshot={columns:baseline.columns,rows:baseline.rows,capturedAt:iso()};if(kind==="row")sheet.extraRows=Math.min(500,sheet.extraRows+10);else sheet.extraCols=Math.min(15,sheet.extraCols+1);s.sheets[sheetId]=sheet;log(s,actor.username,kind==="row"?"Added 10 rows":"Added column",sheetId,"Working copy only")});
}
export function createBlankSheet(actor:SheetActor,title:string){
 if(actor.role!=="Super Admin")throw Error("Only Super Admin can create worksheets in this prototype.");
 const name=title.trim();if(name.length<3||name.length>60)throw Error("Sheet name must be 3–60 characters.");let added="";
 commit(actor,s=>{if(s.customSheets.length>=20)throw Error("Maximum of 20 custom worksheets.");if(s.customSheets.some(x=>x.title.toLowerCase()===name.toLowerCase()))throw Error("A worksheet with this name exists.");added=`custom-${id()}`;s.customSheets.push({id:added,title:name});log(s,actor.username,"Created blank worksheet",added,name)});return added;
}

/** Per-cell appearance lives in the approved working copy, not HR payroll source. */
export type CellAppearance={bold?:boolean;italic?:boolean;underline?:boolean;align?:"left"|"center"|"right";background?:string;color?:string};
export function setCellAppearance(actor:SheetActor,sheetId:string,cell:string,appearance:CellAppearance,baseline?:SheetBaseline){
 if(!/^[A-Z]{1,2}[1-9]\d{0,3}$/.test(cell))throw Error("Invalid cell address.");
 return commit(actor,s=>{requireGrant(s,actor,sheetId);const sheet=s.sheets[sheetId]||{cells:{},extraRows:0,extraCols:0};if(!sheet.snapshot&&baseline)sheet.snapshot={columns:baseline.columns,rows:baseline.rows,capturedAt:iso()};sheet.formats={...(sheet.formats||{}),[cell]:{...(sheet.formats?.[cell]||{}),...appearance}};s.sheets[sheetId]=sheet;log(s,actor.username,"Formatted cell",sheetId,`${cell}: ${Object.keys(appearance).join(", ")}`)});
}

/** Atomic formatting for a selected range, subject to active sheet approval. */
export function setRangeAppearance(actor:SheetActor,sheetId:string,cells:string[],appearance:CellAppearance,baseline?:SheetBaseline){
 if(cells.length===0||cells.length>2000||cells.some(c=>!/^[A-Z]{1,2}[1-9]\d{0,3}$/.test(c)))throw Error("Select 1–2,000 valid cells.");
 return commit(actor,s=>{requireGrant(s,actor,sheetId);const sheet=s.sheets[sheetId]||{cells:{},extraRows:0,extraCols:0};if(!sheet.snapshot&&baseline)sheet.snapshot={columns:baseline.columns,rows:baseline.rows,capturedAt:iso()};sheet.formats={...(sheet.formats||{})};for(const c of cells)sheet.formats[c]={...(sheet.formats[c]||{}),...appearance};s.sheets[sheetId]=sheet;log(s,actor.username,"Formatted range",sheetId,`${cells.length} cells: ${Object.keys(appearance).join(", ")}`)});
}
/** Validation rule changes never touch report/HRMS source cells. */
export function setSheetValidation(actor:SheetActor,sheetId:string,cells:string[],rule:ValidationRule|null,baseline?:SheetBaseline){
 if(cells.length===0||cells.length>2000||cells.some(c=>!/^[A-Z]{1,2}[1-9]\d{0,3}$/.test(c)))throw Error("Select 1–2,000 valid cells.");
 if(rule&&!validRule(rule))throw Error("Invalid validation rule.");
 return commit(actor,s=>{requireGrant(s,actor,sheetId);const sheet=s.sheets[sheetId]||{cells:{},extraRows:0,extraCols:0};if(!sheet.snapshot&&baseline)sheet.snapshot={columns:baseline.columns,rows:baseline.rows,capturedAt:iso()};sheet.validations={...(sheet.validations||{})};for(const c of cells){if(rule)sheet.validations[c]=rule;else delete sheet.validations[c]}s.sheets[sheetId]=sheet;log(s,actor.username,rule?"Set data validation":"Removed data validation",sheetId,`${cells.length} cells`)});
}
export function addConditionalRule(actor:SheetActor,sheetId:string,rule:ConditionalRule,baseline?:SheetBaseline){
 if(!/^[A-Z]{1,2}[1-9]\d{0,3}:[A-Z]{1,2}[1-9]\d{0,3}$/.test(rule.range)||!rangeIncludes(rule.range,rule.range.split(":")[0])||!/^(#[0-9a-fA-F]{6})$/.test(rule.background)||rule.value.length>100||!(["greater","less","equals","contains"] as string[]).includes(rule.operator))throw Error("Invalid conditional formatting rule.");
 return commit(actor,s=>{requireGrant(s,actor,sheetId);const sheet=s.sheets[sheetId]||{cells:{},extraRows:0,extraCols:0};if(!sheet.snapshot&&baseline)sheet.snapshot={columns:baseline.columns,rows:baseline.rows,capturedAt:iso()};if((sheet.conditionalRules?.length||0)>=30)throw Error("Maximum 30 conditional rules per sheet.");sheet.conditionalRules=[...(sheet.conditionalRules||[]),rule];s.sheets[sheetId]=sheet;log(s,actor.username,"Added conditional format",sheetId,`${rule.range} · ${rule.operator}`)});
}
export function deleteConditionalRule(actor:SheetActor,sheetId:string,ruleId:string){
 return commit(actor,s=>{requireGrant(s,actor,sheetId);const sheet=s.sheets[sheetId];if(!sheet?.conditionalRules?.some(r=>r.id===ruleId))throw Error("Rule not found.");sheet.conditionalRules=sheet.conditionalRules.filter(r=>r.id!==ruleId);log(s,actor.username,"Removed conditional format",sheetId,"Rule removed")});
}

export function renameCustomSheet(actor:SheetActor,sheetId:string,newName:string){if(actor.role!=="Super Admin")throw Error("Only Super Admin can rename worksheets.");const name=newName.trim();if(name.length<3||name.length>60)throw Error("Name must be 3–60 characters.");commit(actor,s=>{const sheet=s.customSheets.find(x=>x.id===sheetId);if(!sheet)throw Error("Only custom sheets may be renamed.");if(s.customSheets.some(x=>x!==sheet&&x.title.toLowerCase()===name.toLowerCase()))throw Error("Worksheet name exists.");sheet.title=name;log(s,actor.username,"Renamed worksheet",sheetId,name)})}
export function deleteCustomSheet(actor:SheetActor,sheetId:string){if(actor.role!=="Super Admin")throw Error("Only Super Admin can delete custom worksheets.");commit(actor,s=>{const sheet=s.customSheets.find(x=>x.id===sheetId);if(!sheet)throw Error("Only custom sheets can be deleted.");s.customSheets=s.customSheets.filter(x=>x.id!==sheetId);delete s.sheets[sheetId];s.requests=s.requests.map(r=>r.sheetId===sheetId&&r.status==="approved"?{...r,status:"revoked" as const}:r);log(s,actor.username,"Deleted worksheet",sheetId,sheet.title)})}

/** One approved, atomic operation for importing a single Excel worksheet into an independent blank working copy. */
export function importWorkingSheet(actor:SheetActor,sheetId:string,tabName:string,updates:{cell:string;value:string}[],formats:Record<string,CellAppearance>){
 if(sheetId!=="working-sheet"&&!sheetId.startsWith("custom-"))throw Error("Import into a blank or custom working sheet, never an official HRMS report sheet.");
 if(updates.length>2000||Object.keys(formats).length>2000)throw Error("Import supports at most 2,000 populated/styled cells.");
 return commit(actor,s=>{
  requireGrant(s,actor,sheetId);
  if(sheetId!=="working-sheet"&&!s.customSheets.some(x=>x.id===sheetId))throw Error("Worksheet not found.");
  const cells:Record<string,string>={};let maxRow=0,maxCol=0;
  for(const {cell,value} of updates){const m=/^([A-Z]{1,2})([1-9]\d{0,3})$/.exec(cell);if(!m||value.length>1500)throw Error("Invalid imported cell.");let col=0;for(const c of m[1])col=col*26+c.charCodeAt(0)-64;const row=Number(m[2]);if(col>52||row>4000)throw Error("Imported cell exceeds current grid limits.");cells[cell]=value;maxRow=Math.max(maxRow,row);maxCol=Math.max(maxCol,col)}
  const sanitized:Record<string,CellAppearance>={};for(const [cell,format] of Object.entries(formats)){const m=/^([A-Z]{1,2})([1-9]\d{0,3})$/.exec(cell);if(!m)continue;let col=0;for(const c of m[1])col=col*26+c.charCodeAt(0)-64;if(col>52||Number(m[2])>4000)continue;sanitized[cell]={bold:!!format.bold,italic:!!format.italic,underline:!!format.underline,align:format.align,background:/^#[0-9A-F]{6}$/i.test(format.background||"")?format.background:undefined,color:/^#[0-9A-F]{6}$/i.test(format.color||"")?format.color:undefined};maxRow=Math.max(maxRow,Number(m[2]));maxCol=Math.max(maxCol,col)}
  s.sheets[sheetId]={cells,formats:sanitized,extraRows:Math.max(0,maxRow-1200),extraCols:Math.max(0,maxCol-26),snapshot:{columns:[],rows:[],capturedAt:iso()}};
  log(s,actor.username,"Imported Excel worksheet",sheetId,`${tabName.slice(0,70)} · ${updates.length} populated cells · replaced old working copy`);
 });
}
