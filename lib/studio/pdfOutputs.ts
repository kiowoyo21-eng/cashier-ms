import {isHrRole} from "../mock";
import {writeAuditEvent} from "../auditTrail";
/** Browser-local generated PDF copies. They NEVER replace their source PDF templates. */
import {getPdf,putPdf,deletePdf} from "./pdfAssets";
import {canRead,readStudio,studioActor} from "./store";
import type {StudioActor} from "./types";
const KEY="uc-hrms-generated-pdf-v3",EVENT="uc-hrms-generated-pdf-change";
const makeId=()=>typeof crypto!=="undefined"&&"randomUUID" in crypto?crypto.randomUUID():`${Date.now()}-${Math.random().toString(36).slice(2)}`;
export type GeneratedPdf={id:string;title:string;templateId:string;employeeId:string;employeeName:string;owner:string;createdAt:string;size:number};
export function readPdfOutputs():GeneratedPdf[]{if(typeof window==="undefined")return [];try{const raw=JSON.parse(localStorage.getItem(KEY)||"[]");return Array.isArray(raw)?raw.filter(x=>typeof x.id==="string"&&typeof x.templateId==="string"):[]}catch{return []}}
export function subscribePdfOutputs(cb:()=>void){window.addEventListener(EVENT,cb);const s=(e:StorageEvent)=>{if(e.key===KEY)cb()};window.addEventListener("storage",s);return ()=>{window.removeEventListener(EVENT,cb);window.removeEventListener("storage",s)}}
const assertActor=(actor:StudioActor)=>{const current=studioActor();if(!current||current.username!==actor.username||current.role!==actor.role||!canRead(current))throw Error("HRMS demo session expired or unauthorized.")};
export async function storePdfOutput(actor:StudioActor,templateId:string,entry:{title:string;employeeId:string;employeeName:string},bytes:Uint8Array):Promise<GeneratedPdf>{
 assertActor(actor);const source=readStudio().items.find(i=>i.id===templateId&&i.kind==="pdf"&&i.template&&i.status!=="Archived");
 if(!source||(isHrRole(actor.role)&&source.status!=="Approved Template"))throw Error("PDF source template is missing or unapproved.");
 if(!bytes.byteLength||bytes.byteLength>25_000_000)throw Error("Generated PDF exceeds the 25 MB browser storage limit.");
 const before=readPdfOutputs();if(before.length>=200)throw Error("Local PDF output limit reached (200). Remove old copies before generating more.");
 const entryRecord:GeneratedPdf={id:makeId(),title:entry.title.slice(0,160),templateId,employeeId:entry.employeeId,employeeName:entry.employeeName,owner:actor.username,createdAt:new Date().toISOString(),size:bytes.byteLength};
 const copy=new Uint8Array(bytes).slice().buffer;
 await putPdf(`output:${entryRecord.id}`,copy);
 try{assertActor(actor);localStorage.setItem(KEY,JSON.stringify([entryRecord,...readPdfOutputs()]));writeAuditEvent({module:"Document Library / PDF",action:"Generated PDF",recordId:entryRecord.id,actor:actor.username,role:actor.role,summary:`Source template ${templateId}; generated output contents withheld`});window.dispatchEvent(new Event(EVENT));return entryRecord}catch(error){await deletePdf(`output:${entryRecord.id}`);throw error}
}
export function getPdfOutput(id:string){return getPdf(`output:${id}`)}
export async function removePdfOutput(actor:StudioActor,id:string){assertActor(actor);if(actor.role!=="Super Admin")throw Error("Only Super Admin can permanently delete generated PDF copies.");const existing=readPdfOutputs();if(!existing.some(x=>x.id===id))throw Error("Output not found.");localStorage.setItem(KEY,JSON.stringify(existing.filter(x=>x.id!==id)));window.dispatchEvent(new Event(EVENT));await deletePdf(`output:${id}`);writeAuditEvent({module:"Document Library / PDF",action:"Deleted generated PDF",recordId:id,actor:actor.username,role:actor.role,summary:"Deleted output file; contents withheld"})}
