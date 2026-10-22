"use client";
import type {ReactNode} from "react";
import "../app/studio/studio.css";
import "../app/spreadsheets/spreadsheet.css";
import {ClipboardList,FileWarning,ChartNoAxesCombined,Users,HardDrive,FileSpreadsheet,Files} from "lucide-react";
import HRFormsRequestsWorkspace from "./HRFormsRequestsWorkspace";
import IncidentWorkspace from "./IncidentWorkspace";
import ReportsLanding from "./ReportsLanding";
import EmployeeDemographicsWorkspace from "./EmployeeDemographicsWorkspace";
import DriveWorkspace from "./workspace/DriveWorkspace";
import SpreadsheetPageClient from "./SpreadsheetPageClient";
import StudioIndex from "../app/studio/page";
import type {Branch,Role} from "../lib/mock";

type RequestTab="forms"|"incidents";
type ReportTab="reports"|"demographics";
type ToolTab="drive"|"spreadsheets"|"library";
function Tabs<T extends string>({label,options,value,onChange}:{label:string;options:{id:T;title:string;icon:ReactNode}[];value:T;onChange:(value:T)=>void}){
 return <div className="hrms-unified-tabs" role="group" aria-label={label}>
  {options.map(option=><button type="button" key={option.id} aria-pressed={value===option.id} className={value===option.id?"is-active":""} onClick={()=>onChange(option.id)}>{option.icon}<span>{option.title}</span></button>)}
 </div>;
}
export function RequestReportsWorkspace({branch,role,username,tab,setTab}:{branch:Branch;role:Role;username:string;tab:RequestTab;setTab:(value:RequestTab)=>void}){
 return <div className="hrms-unified-workspace"><Tabs label="Request and Reports" value={tab} onChange={setTab} options={[{id:"forms",title:"HR Forms & Requests",icon:<ClipboardList size={17}/>},{id:"incidents",title:"Incident Reports",icon:<FileWarning size={17}/>}]} />
  {tab==="forms"?<HRFormsRequestsWorkspace branch={branch} role={role} username={username}/>:<IncidentWorkspace branch={branch} role={role}/>}
 </div>;
}
export function UnifiedReportsWorkspace({branch,role,tab,setTab}:{branch:Branch;role:Role;tab:ReportTab;setTab:(value:ReportTab)=>void}){
 return <div className="hrms-unified-workspace"><Tabs label="Reports & Analytics" value={tab} onChange={setTab} options={[{id:"reports",title:"Reports & Analytics",icon:<ChartNoAxesCombined size={17}/>},{id:"demographics",title:"Demographics",icon:<Users size={17}/>}]} />
  {tab==="reports"?<ReportsLanding branch={branch} role={role}/>:<EmployeeDemographicsWorkspace branch={branch} role={role}/>}
 </div>;
}
export function ToolsWorkspace({tab,setTab}:{tab:ToolTab;setTab:(value:ToolTab)=>void}){
 return <div className="hrms-unified-workspace hrms-tools"><Tabs label="Tools" value={tab} onChange={setTab} options={[{id:"drive",title:"Drive",icon:<HardDrive size={17}/>},{id:"spreadsheets",title:"Spreadsheet",icon:<FileSpreadsheet size={17}/>},{id:"library",title:"Documents Library",icon:<Files size={17}/>}]} />
  {tab==="drive"?<DriveWorkspace/>:tab==="spreadsheets"?<SpreadsheetPageClient/>:<div className="studio-scope"><StudioIndex/></div>}
 </div>;
}
