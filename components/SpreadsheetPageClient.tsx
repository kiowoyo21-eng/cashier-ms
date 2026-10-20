"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
import {HRProvider} from "../lib/hrState";
import {activeDemoUser,subscribeSheetChanges,touchDemoSession,type SheetActor} from "../lib/spreadsheetStore";
import SpreadsheetWorkspace from "./SpreadsheetWorkspace";
import {WORKBOOKS,isWorkbookId,LEGACY_SHEET_WORKBOOK,workbookById,type WorkbookId} from "../lib/workbookRegistry";
import {branches,type Branch} from "../lib/mock";
export default function SpreadsheetPageClient({initialSheetId}:{initialSheetId?:string}){const [actor,setActor]=useState<SheetActor|null>(null),[ready,setReady]=useState(false);
 const [scope,setScope]=useState<Branch>("All Shops"),[driveImport,setDriveImport]=useState(false);
 useEffect(()=>{const q=new URLSearchParams(window.location.search);const b=q.get("branch");if(b&&branches.includes(b as Branch))setScope(b as Branch);setDriveImport(Boolean(q.get("driveFile")))},[]);
 useEffect(()=>{const sync=()=>{setActor(activeDemoUser());setReady(true)};sync();const unsub=subscribeSheetChanges(sync);window.addEventListener("focus",sync);document.addEventListener("visibilitychange",sync);const activity=()=>{touchDemoSession()};window.addEventListener("pointerdown",activity);window.addEventListener("keydown",activity);const t=window.setInterval(sync,15000);return ()=>{unsub();window.removeEventListener("focus",sync);document.removeEventListener("visibilitychange",sync);window.removeEventListener("pointerdown",activity);window.removeEventListener("keydown",activity);window.clearInterval(t)}},[]);
 if(!ready)return <main className="sw-auth"><p>Loading spreadsheet workspace…</p></main>;
 if(!actor)return <main className="sw-auth"><h1>Sign in to HRMS first</h1><p>The spreadsheet requires an active HRMS demo session.</p><Link href="/">Go to HRMS login</Link></main>;
 if(actor.role==="BM")return <main className="sw-auth"><h1>Restricted workspace</h1><p>Employee and payroll spreadsheets are limited to HR and Super Admin.</p><Link href="/">Back to HRMS</Link></main>;
 const legacy=initialSheetId&&LEGACY_SHEET_WORKBOOK[initialSheetId];
 const workbook:WorkbookId|undefined=initialSheetId?(isWorkbookId(initialSheetId)?initialSheetId:legacy):driveImport?"working":undefined;
 if(initialSheetId&&!workbook)return <main className="sw-auth"><h1>Workbook not found</h1><p>Choose a valid workbook from the spreadsheet library.</p><Link href="/spreadsheets">Spreadsheet Home</Link></main>;
 if(!workbook)return <main className="sw-home"><header><h1>HRMS Spreadsheets</h1><p>Choose a dedicated workbook. HRMS records are loaded only after opening the file; editing working copies requires admin approval.</p><Link href="/">← Back to HRMS</Link></header><div className="sw-home-grid">{WORKBOOKS.map(w=><Link key={w.id} href={`/spreadsheets/${w.id}`} className="sw-home-card"><strong>{w.name}</strong><span>{w.description}</span><small>Open workbook ↗</small></Link>)}</div><footer>Local demo records only · Each workbook contains related worksheets, not every HRMS module.</footer></main>;
 return <HRProvider><SpreadsheetWorkspace key={`${actor.username}-${actor.role}-${workbook}`} actor={actor} branch={scope} workbookId={workbook} initialSheetId={legacy?initialSheetId:undefined}/></HRProvider>
}
