import type {Branch,ModuleId} from "./mock";

export type ModuleAlert={id:string;title:string;detail:string;branch?:Branch|string;level?:"urgent"|"normal";action?:string};
export type AlertRegistry=Partial<Record<ModuleId,ModuleAlert[]>>;
/** Keep independent publishers for a module (e.g. payroll cutoff + payroll approval) without overwrites. */
export type AlertSources=Partial<Record<ModuleId,Record<string,ModuleAlert[]>>>;
export function mergeAlertSources(sources:AlertSources):AlertRegistry{
 const combined:AlertRegistry={};
 for(const module of Object.keys(sources) as ModuleId[])combined[module]=Object.values(sources[module]||{}).flat();
 return combined;
}


/** Only alerts visible in the selected branch are counted; legacy loan alerts live under Payroll. */
export function visibleAlerts(registry:AlertRegistry,module:ModuleId,branch:Branch):ModuleAlert[]{
 const entries=module==="payroll"?[...(registry.payroll||[]),...(registry.loans||[])]:registry[module]||[];
 const ids=new Set<string>();
 return entries.filter(alert=>{
  if(alert.branch&&branch!=="All Shops"&&alert.branch!=="All Shops"&&alert.branch!==branch)return false;
  const key=alert.id||`${alert.title}|${alert.detail}|${alert.branch||""}`;
  if(ids.has(key))return false;
  ids.add(key);return true;
 });
}

export function dashboardAlertGroups(registry:AlertRegistry,allowed:readonly ModuleId[],branch:Branch){
 const ids=new Set<ModuleId>();
 return allowed.filter(id=>id!=="loans"&&!ids.has(id)&&(ids.add(id),true))
  .map(id=>({id,items:visibleAlerts(registry,id,branch)}))
  .filter(group=>group.items.length>0);
}

export function dashboardAlertCounts(registry:AlertRegistry,allowed:readonly ModuleId[],branch:Branch){
 return dashboardAlertGroups(registry,allowed,branch).reduce((totals,group)=>({
  total:totals.total+group.items.length,
  urgent:totals.urgent+group.items.filter(item=>item.level==="urgent").length
 }),{total:0,urgent:0});
}
