/** Browser-local change history for prototype review, NOT secure immutable audit evidence. */
export type AuditEvent={id:string;at:string;actor:string;role:string;module:string;action:string;recordId:string;summary:string;source:"client-demo"};
const KEY="uc-hr-ui-audit-trail-v2";
const CHANGE="uc-hr-audit-changed";
export const readAuditEvents=():AuditEvent[]=>{
 if(typeof window==="undefined")return [];
 try{const parsed=JSON.parse(localStorage.getItem(KEY)||"[]");return Array.isArray(parsed)?parsed.filter(x=>x&&typeof x.action==="string"&&typeof x.at==="string").slice(0,1500):[]}catch{return []}
};
/** Never log government identifiers, payroll amounts, document contents or raw form values. */
export function writeAuditEvent({module,action,recordId="",summary="",actor,role}:{module:string;action:string;recordId?:string;summary?:string;actor?:string;role?:string}):void{
 if(typeof window==="undefined")return;
 try{
  const session=JSON.parse(localStorage.getItem("ucmm-hr-demo-login-v1")||"null");
  const event:AuditEvent={id:typeof crypto!=="undefined"&&"randomUUID" in crypto?crypto.randomUUID():`${Date.now()}-${Math.random()}`,at:new Date().toISOString(),actor:actor||session?.username||"Unknown demo user",role:role||session?.role||"Unknown",module:module.slice(0,70),action:action.slice(0,110),recordId:recordId.slice(0,100),summary:summary.slice(0,320),source:"client-demo"};
  const next=[event,...readAuditEvents()].slice(0,1500);
  localStorage.setItem(KEY,JSON.stringify(next));window.dispatchEvent(new Event(CHANGE));
 }catch{/* Browser storage may be full; do not misrepresent prototype audit as durable evidence. */}
}
export function watchAuditEvents(fn:()=>void){if(typeof window==="undefined")return ()=>{};
 const onStorage=(e:StorageEvent)=>{if(e.key===KEY)fn()};window.addEventListener(CHANGE,fn);window.addEventListener("storage",onStorage);
 return()=>{window.removeEventListener(CHANGE,fn);window.removeEventListener("storage",onStorage)};
}
/** Field names only: never put sensitive field contents into the audit record. */
export function changedFields(before:Record<string,unknown>,after:Record<string,unknown>){return [...new Set([...Object.keys(before),...Object.keys(after)])].filter(k=>JSON.stringify(before[k])!==JSON.stringify(after[k])).slice(0,16)}
