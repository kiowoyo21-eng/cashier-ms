"use client";
import {createContext,useCallback,useContext,useEffect,useMemo,useRef,useState,type ReactNode} from "react";
import {createPortal} from "react-dom";
import {useFloatingPopover} from "./ui/useFloatingPopover";
import {visibleAlerts,dashboardAlertGroups,mergeAlertSources,type AlertRegistry,type AlertSources,type ModuleAlert} from "../lib/moduleAlertViews";
export type {ModuleAlert} from "../lib/moduleAlertViews";
import {Bell,ChevronRight,X,Users,BriefcaseBusiness,Wallet,CalendarCheck,FileWarning,Laptop,Files,Landmark,ClipboardList,ShieldCheck,FolderOpen} from "lucide-react";
import type {Branch,ModuleId} from "../lib/mock";
type Registry=AlertRegistry;
type ModuleActionHandler=(alert:ModuleAlert)=>void;
type ModuleNoticeAPI={
 registry:Registry;
 publish:(module:ModuleId,entries:ModuleAlert[],source?:string)=>void;
 clear:()=>void;
 registerAction:(module:ModuleId,handler:ModuleActionHandler)=>()=>void;
 openAction:(module:ModuleId,alert:ModuleAlert)=>void;
};
const C=createContext<ModuleNoticeAPI|null>(null);
export function ModuleAlertsProvider({children}:{children:ReactNode}){
 // Different publishers (e.g. payroll cutoff monitor and Payroll workspace) must not overwrite each other.
 const [sources,setSources]=useState<AlertSources>({});
 // Keep old module-level record-navigation callbacks without rendering duplicate bells.
 const actionHandlers=useRef(new Map<ModuleId,ModuleActionHandler>());
 const registerAction=useCallback((module:ModuleId,handler:ModuleActionHandler)=>{
  actionHandlers.current.set(module,handler);
  return ()=>{if(actionHandlers.current.get(module)===handler)actionHandlers.current.delete(module)};
 },[]);
 const openAction=useCallback((module:ModuleId,alert:ModuleAlert)=>{actionHandlers.current.get(module)?.(alert)},[]);
 const publish=useCallback((module:ModuleId,entries:ModuleAlert[],source="workspace")=>setSources(old=>{
  const current:Record<string,ModuleAlert[]>=old[module]||{};
  if(JSON.stringify(current[source]||[])===JSON.stringify(entries))return old;
  return {...old,[module]:{...current,[source]:entries}};
 }),[]);
 const clear=useCallback(()=>setSources({}),[]);
 const registry=useMemo<Registry>(()=>mergeAlertSources(sources),[sources]);
 const value=useMemo<ModuleNoticeAPI>(()=>({registry,publish,clear,registerAction,openAction}),[registry,publish,clear,registerAction,openAction]);
 return <C.Provider value={value}>{children}</C.Provider>;
}
export function useModuleAlerts(){const context=useContext(C);if(!context)throw new Error("ModuleAlertsProvider required");return context}
export function usePublishModuleAlerts(module:ModuleId,alerts:ModuleAlert[],source="workspace"){
 const {publish}=useModuleAlerts();const serialized=JSON.stringify(alerts);
 useEffect(()=>{publish(module,JSON.parse(serialized) as ModuleAlert[],source)},[module,source,serialized,publish]);
}
/**
 * Compatibility action target for module-specific record navigation.
 * The only visible bell is UniversalNotificationCenter in the app top bar.
 * Keeping this action target prevents existing module callbacks from being removed.
 */
export function ModuleAlertButton({module,onOpen}:{module:ModuleId;branch:Branch;onOpen?:(alert:ModuleAlert)=>void}){
 const {registerAction}=useModuleAlerts();
 const handler=useRef(onOpen);
 useEffect(()=>{handler.current=onOpen},[onOpen]);
 useEffect(()=>registerAction(module,alert=>handler.current?.(alert)),[module,registerAction]);
 return null;
}
export function ModuleAlertSummary({module,branch}:{module:ModuleId;branch:Branch}){const {registry}=useModuleAlerts();const alerts=visibleAlerts(registry,module,branch);if(!alerts.length)return <span>No pending actions in loaded records</span>;return <span>{alerts.length} requiring action · {alerts.filter(a=>a.level==="urgent").length} high priority</span>}
const alertCardIcons={lifecycle:BriefcaseBusiness,employees:Users,payroll:Wallet,leave:CalendarCheck,ir:FileWarning,assets:Laptop,documents:Files,compliance:Landmark,"hr-forms":ClipboardList,"final-approvals":ShieldCheck,submissions:FolderOpen} as const;
const alertCardNames:Partial<Record<ModuleId,string>>={lifecycle:"Recruitment & Hiring",employees:"Employee 201",payroll:"Payroll Management",leave:"Leave Management",ir:"Incident Reports",assets:"Assets & Devices",documents:"Employee Documents",compliance:"Government Compliance","hr-forms":"HR Forms & Requests","final-approvals":"Final Approvals",submissions:"Employee Documents"};
export function DashboardModuleAlerts({branch,onNavigate,allowed}:{branch:Branch;onNavigate:(id:ModuleId)=>void;allowed:ModuleId[]}){
 const {registry}=useModuleAlerts();
 const groups=dashboardAlertGroups(registry,allowed,branch)
  .map(group=>({...group,urgent:group.items.filter(item=>item.level==="urgent").length}))
  .sort((a,b)=>b.urgent-a.urgent||b.items.length-a.items.length||a.id.localeCompare(b.id));
 return <section className="mu-dashboard-alerts" aria-label="Pending Actions by Module">
  <div className="mu-dashboard-heading"><h3>Pending Actions by Module</h3><span>Recorded action alerts only — not total module records</span></div>
  {groups.length===0?<p className="mu-dashboard-empty">No pending action alerts in the loaded records for this branch.</p>:
   <div className="mu-dashboard-grid">{groups.map(group=>{
    const Icon=alertCardIcons[group.id as keyof typeof alertCardIcons]||ClipboardList;
    return <button type="button" key={group.id} onClick={()=>onNavigate(group.id)} aria-label={`Open ${alertCardNames[group.id]||group.id}: ${group.items.length} pending actions${group.urgent?`, ${group.urgent} urgent`:""}`}>
     <span className="mu-card-top"><span className="mu-card-icon"><Icon size={17}/></span>{group.urgent>0&&<span className="mu-card-urgent">{group.urgent} urgent</span>}</span>
     <span className="mu-card-label">{alertCardNames[group.id]||group.id}</span>
     <span className="mu-card-bottom"><strong>{group.items.length}</strong><small>Pending actions <ChevronRight size={14}/></small></span>
    </button>;
   })}</div>}
 </section>;
}

/** A single accessible notification entry point visible on every authorized HRMS page.
 * Pending actions only; no fabricated events, delivery/read state, or push notifications.
 */
export function UniversalNotificationCenter({current,branch,allowed,onNavigate}:{current:ModuleId;branch:Branch;allowed:ModuleId[];onNavigate:(module:ModuleId)=>void}){
 const {registry,openAction}=useModuleAlerts();
 const [open,setOpen]=useState(false);
 const [scope,setScope]=useState<"module"|"all">("all");
 const anchor=useRef<HTMLButtonElement>(null);
 const floating=useFloatingPopover(open,anchor,410);
 const groups=dashboardAlertGroups(registry,allowed,branch);
 const allCount=groups.reduce((sum,group)=>sum+group.items.length,0);
 const relatedIds:ModuleId[]=current==="requests-reports"?["hr-forms","ir"]:current==="reports-analytics"?["filters","demographics"]:current==="tools"?["drive","spreadsheets","studio"]:[current];
 const currentCount=groups.filter(group=>relatedIds.includes(group.id)).reduce((sum,group)=>sum+group.items.length,0);
 const displayed=scope==="all"?groups:groups.filter(group=>relatedIds.includes(group.id));
 const nameOf=(id:ModuleId)=>({loans:"Payroll Management",ir:"Incident Reports",lifecycle:"Recruitment & Hiring",employees:"Employee 201"} as Partial<Record<ModuleId,string>>)[id]||({dashboard:"Dashboard",demographics:"Employee Demographics", "hr-forms":"HR Forms & Requests",submissions:"Submit Employee Documents",assets:"Assets & Devices",compliance:"Government Compliance",documents:"Employee Documents",payroll:"Payroll Management",leave:"Leave Management",filters:"Reports & Analytics",drive:"HRMS Drive",spreadsheets:"Spreadsheets",studio:"Document Library",audit:"Audit Logs",settings:"Settings"} as Partial<Record<ModuleId,string>>)[id]||id;
 useEffect(()=>{setOpen(false);setScope(current==="dashboard"?"all":"module")},[current,branch]);
 useEffect(()=>{if(!open)return;
  const onKey=(e:KeyboardEvent)=>{if(e.key==="Escape"){setOpen(false);anchor.current?.focus()}};
  const onOutside=(e:PointerEvent)=>{const node=e.target as Node;if(!anchor.current?.contains(node)&&!floating.panel.current?.contains(node))setOpen(false)};
  document.addEventListener("keydown",onKey);document.addEventListener("pointerdown",onOutside);
  return()=>{document.removeEventListener("keydown",onKey);document.removeEventListener("pointerdown",onOutside)};
 },[open,floating.panel]);
 return <div className="mu-global-wrap">
  <button type="button" className="mu-global-trigger" ref={anchor} onClick={()=>setOpen(value=>!value)}
   aria-label={`Open HRMS notifications, ${allCount} pending actions across accessible modules`} aria-haspopup="dialog" aria-expanded={open} title="Notifications across authorized modules">
   <Bell size={18}/>{allCount>0&&<span className="mu-global-count">{allCount>99?"99+":allCount}</span>}
  </button>
  {open&&createPortal(<section ref={floating.panel} style={floating.style} role="dialog" aria-label="HRMS module notifications" className="mu-global-panel">
   <header className="mu-global-head"><div><strong>Notifications</strong><small>Pending actions in loaded HRMS records</small></div><button className="mu-global-close" aria-label="Close notifications" onClick={()=>setOpen(false)} type="button"><X size={17}/></button></header>
   <div className="mu-global-tabs" role="group" aria-label="Notification scope">
    <button type="button" aria-pressed={scope==="module"} className={scope==="module"?"selected":""} onClick={()=>setScope("module")}>This module ({currentCount})</button>
    <button type="button" aria-pressed={scope==="all"} className={scope==="all"?"selected":""} onClick={()=>setScope("all")}>All modules ({allCount})</button>
   </div>
   <div className="mu-global-list">
    {displayed.length===0?<p className="mu-global-empty">No pending actions recorded {scope==="module"?`for ${nameOf(current)}`:"for the accessible modules"}. Modules without recorded action alerts will appear empty.</p>:displayed.map(group=><div key={group.id} className="mu-global-group">
     <div className="mu-global-group-heading"><strong>{nameOf(group.id)}</strong><span>{group.items.length}</span></div>
     {group.items.slice(0,10).map(alert=><button className="mu-global-item" type="button" key={`${group.id}:${alert.id}`} onClick={()=>{setOpen(false);if(current===group.id){if(group.id==="payroll"&&typeof window!=="undefined"){const area=alert.id.startsWith("loan-")?"loans":alert.action?.startsWith("payroll:")?alert.action.slice(8):"";if(area)window.dispatchEvent(new CustomEvent("ucmm-payroll-open",{detail:{area}}))}else openAction(group.id,alert)}onNavigate(group.id)}} aria-label={`Open ${nameOf(group.id)}: ${alert.title}`}>
      <span className={alert.level==="urgent"?"mu-global-dot urgent":"mu-global-dot"}/><span className="mu-global-detail"><strong>{alert.title}</strong><small>{alert.detail}</small></span><ChevronRight size={15}/>
     </button>)}
     {group.items.length>10&&<button className="mu-global-more" type="button" onClick={()=>{setOpen(false);onNavigate(group.id)}}>Open {nameOf(group.id)} to review {group.items.length-10} more pending actions <ChevronRight size={14}/></button>}
    </div>)}
   </div>
   <footer className="mu-global-foot">Opens the owning module for review. This is a browser-only pending-action list, not an email or push-notification service.</footer>
  </section>,document.body)}
 </div>;
}
