"use client";
import {useEffect,useRef,useState} from "react";
import {FileSpreadsheet,Plus,Upload,Search,ExternalLink} from "lucide-react";
import {HrmsDialog,HrmsButton} from "./ui/HrmsPrimitives";
import {addDriveUpload} from "../lib/drive/store";
import Link from "next/link";
import "../app/tools-file-view.css";
import {HRProvider} from "../lib/hrState";
import {activeDemoUser,subscribeSheetChanges,touchDemoSession,readSheetState,createBlankSheet,type SheetActor} from "../lib/spreadsheetStore";
import SpreadsheetWorkspace from "./SpreadsheetWorkspace";
import {WORKBOOKS,isWorkbookId,LEGACY_SHEET_WORKBOOK,workbookById,type WorkbookId} from "../lib/workbookRegistry";
import {branches,type Branch} from "../lib/mock";
export default function SpreadsheetPageClient({initialSheetId,embedded=false}:{initialSheetId?:string;embedded?:boolean}){const [actor,setActor]=useState<SheetActor|null>(null),[ready,setReady]=useState(false);
 const [scope,setScope]=useState<Branch>("All Shops"),[driveImport,setDriveImport]=useState(false),[selectedBatchId,setSelectedBatchId]=useState("");
 const [customSheets,setCustomSheets]=useState(readSheetState().customSheets),[query,setQuery]=useState(""),[creating,setCreating]=useState(false),[newName,setNewName]=useState(""),[message,setMessage]=useState(""),[busy,setBusy]=useState(false);
 const uploadRef=useRef<HTMLInputElement>(null);
 useEffect(()=>{const q=new URLSearchParams(window.location.search);const b=q.get("branch");if(b&&branches.includes(b as Branch))setScope(b as Branch);setDriveImport(Boolean(q.get("driveFile")));const id=q.get("batchId")||"";if(/^[A-Za-z0-9-]{1,120}$/.test(id))setSelectedBatchId(id)},[]);
 useEffect(()=>{const sync=()=>{setActor(activeDemoUser());setCustomSheets(readSheetState().customSheets);setReady(true)};sync();const unsub=subscribeSheetChanges(sync);window.addEventListener("focus",sync);document.addEventListener("visibilitychange",sync);const activity=()=>{touchDemoSession()};window.addEventListener("pointerdown",activity);window.addEventListener("keydown",activity);const t=window.setInterval(sync,15000);return ()=>{unsub();window.removeEventListener("focus",sync);document.removeEventListener("visibilitychange",sync);window.removeEventListener("pointerdown",activity);window.removeEventListener("keydown",activity);window.clearInterval(t)}},[]);
 if(!ready)return <main className="sw-auth"><p>Loading spreadsheet workspace…</p></main>;
 if(!actor)return <main className="sw-auth"><h1>Sign in to HRMS first</h1><p>The spreadsheet requires an active HRMS demo session.</p><Link href="/">Go to HRMS login</Link></main>;
 if(actor.role==="BM")return <main className="sw-auth"><h1>Restricted workspace</h1><p>Employee and payroll spreadsheets are limited to HR and Super Admin.</p><Link href="/">Back to HRMS</Link></main>;
 const legacy:WorkbookId|undefined=initialSheetId?LEGACY_SHEET_WORKBOOK[initialSheetId]:undefined;
 const workbook:WorkbookId|undefined=initialSheetId?(isWorkbookId(initialSheetId)?initialSheetId:legacy):driveImport?"working":undefined;
 if(initialSheetId&&!workbook)return <main className="sw-auth"><h1>Workbook not found</h1><p>Choose a valid workbook from the spreadsheet library.</p><Link href="/spreadsheets">Spreadsheet Home</Link></main>;
 const canCreate=actor.role==="Super Admin";
 const displayed=[...customSheets.map(x=>({id:x.id,title:x.title,description:"Editable working worksheet",path:`/spreadsheets/working?sheet=${encodeURIComponent(x.id)}`,kind:"Working sheet"})),...WORKBOOKS.map(x=>({id:x.id,title:x.name,description:x.description,path:`/spreadsheets/${x.id}`,kind:"Module workbook"}))].filter(x=>`${x.title} ${x.description} ${x.kind}`.toLowerCase().includes(query.toLowerCase()));
 const saveNew=()=>{if(!canCreate)return setMessage("Only Super Admin can create worksheets in this demo.");try{const id=createBlankSheet(actor,newName);setCustomSheets(readSheetState().customSheets);setCreating(false);setNewName("");window.location.assign(`/spreadsheets/working?sheet=${encodeURIComponent(id)}`)}catch(e){setMessage(e instanceof Error?e.message:String(e))}};
 const uploadWorkbook=async(files:FileList|null)=>{const file=files?.[0];if(!file)return;if(!canCreate){setMessage("Only Super Admin can upload worksheets in this demo.");return}setBusy(true);try{if(!/\.xlsx$/i.test(file.name))throw Error("Upload an .xlsx file; CSV imports are available inside the spreadsheet editor.");const item=await addDriveUpload(actor,file,null);window.location.assign(`/spreadsheets/working?driveFile=${encodeURIComponent(item.id)}`)}catch(e){setMessage(e instanceof Error?e.message:String(e))}finally{setBusy(false);if(uploadRef.current)uploadRef.current.value=""}};
 if(!workbook)return <main className={`sw-home sw-file-home ${embedded?"sw-home-embedded":""}`}>
 <header><div><h1>Spreadsheet Files</h1><p>Open a workbook or working sheet. Official HRMS data stays read-only without approval.</p></div>{!embedded&&<Link href="/">Back to HRMS</Link>}</header>
 <div className="hrms-file-toolbar"><label className="hrms-file-search"><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search spreadsheet files" aria-label="Search spreadsheet files"/></label><div className="hrms-file-toolbar-actions"><button type="button" className="hrms-file-action hrms-file-primary" onClick={()=>canCreate?setCreating(true):setMessage("New worksheets require Super Admin access.")}><Plus size={17}/> New sheet</button><button type="button" className="hrms-file-action" disabled={busy} onClick={()=>canCreate?uploadRef.current?.click():setMessage("Uploading spreadsheet files requires Super Admin access.")}><Upload size={17}/> Upload XLSX</button><input hidden ref={uploadRef} type="file" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" onChange={e=>void uploadWorkbook(e.target.files)}/></div></div>
 {message&&<p role="status" className="hrms-file-message">{message}</p>}
 <div className="hrms-file-list" role="list" aria-label="Spreadsheet files">{displayed.map(x=><div className="hrms-file-row" role="listitem" key={x.id}><Link className="hrms-file-main" href={x.path}><span className="hrms-file-type"><FileSpreadsheet size={22}/></span><span className="hrms-file-info"><strong>{x.title}</strong><small>{x.kind} · {x.description}</small></span></Link><Link className="hrms-file-action" href={x.path} aria-label={`Open ${x.title}`}><ExternalLink size={16}/> Open</Link></div>)}{displayed.length===0&&<div className="hrms-file-empty">No spreadsheet files match your search.</div>}</div>
 <footer>Files shown as rows, not catalog cards · Browser-local demo; no cross-device sync.</footer>
 <HrmsDialog open={creating} title="Create spreadsheet" size="sm" onClose={()=>setCreating(false)} footer={<><HrmsButton onClick={()=>setCreating(false)}>Cancel</HrmsButton><HrmsButton variant="primary" onClick={saveNew} disabled={newName.trim().length<3}>Create file</HrmsButton></>}><label className="hrms-file-dialog-label">File name<input autoFocus maxLength={60} value={newName} onChange={e=>setNewName(e.target.value)} placeholder="New worksheet"/></label></HrmsDialog>
 </main>;
 return <HRProvider><SpreadsheetWorkspace key={`${actor.username}-${actor.role}-${workbook}`} actor={actor} branch={scope} workbookId={workbook} initialSheetId={legacy?initialSheetId:undefined} payrollBatchId={selectedBatchId}/></HRProvider>
}
