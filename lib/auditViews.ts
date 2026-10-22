/** Presentation helpers for the browser-only HRMS audit viewer.
 * Not a substitute for server authorization or tamper-evident storage.
 */
import type {AuditEvent} from "./auditTrail";

export type AuditFilters={query:string;module:string;actor:string;action:string};
const normalize=(value:string)=>value.trim().toLocaleLowerCase("en");

/** Never trust historical browser-local JSON to contain complete, valid events. */
export function validAuditEvents(items:unknown):AuditEvent[]{
 if(!Array.isArray(items))return [];
 const seen=new Set<string>();
 const result:AuditEvent[]=[];
 for(const candidate of items){
  if(!candidate||typeof candidate!=="object")continue;
  const item=candidate as Record<string,unknown>;
  if(typeof item.id!=="string"||!item.id.trim()||typeof item.at!=="string"||!Number.isFinite(Date.parse(item.at))||
     typeof item.module!=="string"||typeof item.action!=="string"||typeof item.actor!=="string"||typeof item.role!=="string")continue;
  if(seen.has(item.id))continue;
  seen.add(item.id);
  result.push({
   id:item.id.slice(0,150),at:item.at,actor:item.actor.slice(0,100),role:item.role.slice(0,100),
   module:item.module.slice(0,100),action:item.action.slice(0,150),
   recordId:typeof item.recordId==="string"?item.recordId.slice(0,150):"",
   summary:typeof item.summary==="string"?item.summary.slice(0,320):"",
   source:"client-demo",
   ...(typeof item.beforeStatus==="string"?{beforeStatus:item.beforeStatus.slice(0,100)}:{}),
   ...(typeof item.afterStatus==="string"?{afterStatus:item.afterStatus.slice(0,100)}:{}),
   ...(typeof item.remarks==="string"?{remarks:item.remarks.slice(0,1000)}:{})
  });
 }
 return result.sort((a,b)=>Date.parse(b.at)-Date.parse(a.at)).slice(0,1500);
}

export function filterAuditEvents(items:AuditEvent[],filters:AuditFilters):AuditEvent[]{
 const needle=normalize(filters.query);
 return items.filter(event=>{
  if(filters.module!=="All"&&event.module!==filters.module)return false;
  if(filters.actor!=="All"&&event.actor!==filters.actor)return false;
  if(filters.action!=="All"&&event.action!==filters.action)return false;
  if(!needle)return true;
  // Search only non-sensitive audit metadata; never index remarks or form content.
  return [event.id,event.at,event.module,event.action,event.recordId,event.actor,event.role,
   event.beforeStatus||"",event.afterStatus||""].some(value=>normalize(value).includes(needle));
 });
}

export function formatAuditPhilippineTime(iso:string):string{
 const date=new Date(iso);
 if(!Number.isFinite(date.getTime()))return "Invalid timestamp";
 return new Intl.DateTimeFormat("en-PH",{timeZone:"Asia/Manila",year:"numeric",month:"short",day:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:true}).format(date)+" PHT";
}

/** CSV is explicitly a local demo export. Never export free-text remarks or summaries. */
export function exportAuditCsv(items:AuditEvent[]):string{
 const header=["Source","Event ID","Philippine Time","Actor","Role","Module","Action","Record ID","Before Status","After Status"];
 const rows=[header,...items.map(event=>["Browser-local demo (not tamper-evident)",event.id,formatAuditPhilippineTime(event.at),event.actor,event.role,event.module,event.action,event.recordId,event.beforeStatus||"",event.afterStatus||""])];
 const cell=(value:string)=>{
  // Prevent spreadsheet formula injection even after leading spaces or control characters.
  const safe=/^[\s\u0000-\u001f]*[=+\-@]/.test(value)?`'${value}`:value;
  return `"${safe.replace(/"/g,'""')}"`;
 };
 return "\uFEFF"+rows.map(row=>row.map(cell).join(",")).join("\r\n");
}
