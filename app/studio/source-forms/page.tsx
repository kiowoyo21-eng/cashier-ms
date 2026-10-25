"use client";
import {useEffect,useMemo,useRef,useState} from "react";
import Link from "next/link";
import {createPortal} from "react-dom";
import {useRouter} from "next/navigation";
import {ArrowLeft,ClipboardList,ExternalLink,Search,Upload,X,FileText} from "lucide-react";
import "../../tools-file-view.css";
import StudioGate from "../../../components/studio/StudioGate";
import {sourceFormsCatalog,type SourceForm,type SourceFormGroup} from "../../../lib/studio/sourceFormsCatalog";
import {addStudioItem} from "../../../lib/studio/store";
import {deletePdf,putPdf} from "../../../lib/studio/pdfAssets";
import type {StudioActor,StudioItem,StudioState} from "../../../lib/studio/types";

const groups: ("All"|SourceFormGroup)[] = ["All","Hiring & Onboarding","Attendance & Requests","Employee Relations","Assets & Accountability","Policies & Compliance"];
const displayError = (error:unknown)=>error instanceof Error?error.message:String(error);
const slugFile=(name:string)=>name.replace(/\.pdf$/i,"").replace(/\s+/g," ").slice(0,95);

function Sources({actor,state,refresh}:{actor:StudioActor;state:StudioState;refresh:()=>void}) {
 const [group,setGroup]=useState<(typeof groups)[number]>("All");
 const [query,setQuery]=useState("");
 const [selected,setSelected]=useState<SourceForm|null>(null);
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState("");
 const [file,setFile]=useState<File|null>(null);
 const [confirmed,setConfirmed]=useState(false);
 const router=useRouter();
 const dialog=useRef<HTMLElement|null>(null);
 const returningFocus=useRef<HTMLElement|null>(null);
 const related=(id:string)=>state.items.filter(item=>item.template&&item.sourceCatalogId===id&&item.status!=="Archived").sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt));
 const entries=useMemo(()=>sourceFormsCatalog.filter(f=>(group==="All"||f.group===group)&&`${f.title} ${f.group} ${f.originalFiles.join(" ")}`.toLowerCase().includes(query.toLowerCase())),[group,query]);
 function open(form:SourceForm){returningFocus.current=document.activeElement instanceof HTMLElement?document.activeElement:null;setSelected(form);setError("");setFile(null);setConfirmed(false)}
 useEffect(()=>{
  if(!selected)return;
  const old=document.body.style.overflow;document.body.style.overflow="hidden";
  dialog.current?.focus();
  const handleKeys=(event:KeyboardEvent)=>{
   if(event.key==="Escape"&&!busy){event.preventDefault();setSelected(null);return}
   if(event.key!=="Tab"||!dialog.current)return;
   const focusable=Array.from(dialog.current.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])')).filter(node=>node.getClientRects().length>0);
   if(!focusable.length){event.preventDefault();dialog.current.focus();return}
   const first=focusable[0],last=focusable[focusable.length-1];
   if(event.shiftKey&&(document.activeElement===first||document.activeElement===dialog.current)){event.preventDefault();last.focus()}
   else if(!event.shiftKey&&(document.activeElement===last||document.activeElement===dialog.current)){event.preventDefault();first.focus()}
  };
  document.addEventListener("keydown",handleKeys);
  return()=>{document.body.style.overflow=old;document.removeEventListener("keydown",handleKeys);returningFocus.current?.focus()};
 },[selected,busy]);
 async function importSource(){
  if(!selected||!file||!confirmed||busy)return;
  if(actor.role!=="Super Admin"){setError("Only Super Admin can import source PDF templates.");return}
  if(!/\.pdf$/i.test(file.name)||file.size<10||file.size>20_000_000){setError("Choose a PDF (up to 20 MB). Convert DOCX/WPS to PDF first if you need exact PDF overlay positioning.");return}
  setBusy(true);setError("");
  let pdfId:string|null=null;
  try {
   const bytes=await file.arrayBuffer();
   if(String.fromCharCode(...new Uint8Array(bytes.slice(0,5)))!=="%PDF-")throw Error("This file does not contain a valid PDF header.");
   const {PDFDocument}=await import("pdf-lib");
   const parsed=await PDFDocument.load(bytes);
   if(parsed.getPageCount()<1||parsed.getPageCount()>100)throw Error("PDF must contain 1–100 pages.");
   pdfId=typeof crypto!=="undefined"&&"randomUUID" in crypto?crypto.randomUUID():`source-${Date.now()}-${Math.random().toString(36).slice(2)}`;
   await putPdf(pdfId,bytes);
   const item=addStudioItem(actor,"pdf",`${selected.title} — ${slugFile(file.name)}`.slice(0,120),selected.category,{id:pdfId,originalName:file.name,sourceCatalogId:selected.id});
   refresh();setSelected(null);router.push(`/studio/pdf/${item.id}`);
  }catch(err){if(pdfId)try{await deletePdf(pdfId)}catch{}setError(displayError(err))}finally{setBusy(false)}
 }
 const importedCount=sourceFormsCatalog.filter(x=>related(x.id).length>0).length;
 return <main className="studio-sources">
  <header className="studio-sources-head">
   <Link href="/studio"><ArrowLeft size={16}/> Document Studio</Link>
   <div className="studio-sources-headline"><h1><ClipboardList size={22}/> Source Forms Library</h1><span>{importedCount} / {sourceFormsCatalog.length} groups imported</span></div>
   <p>Original Forms archive reference, excluding logos/images and PSA questionnaires. Source files are not published in the app. Upload the corresponding approved blank PDF from your own copy, then place PDF overlay fields in the editor.</p>
  </header>
  <div className="studio-sources-toolbar"><label><span>Form type</span><select value={group} onChange={e=>setGroup(e.target.value as (typeof groups)[number])}>{groups.map(x=><option key={x}>{x}</option>)}</select></label><label><span>Search</span><span className="studio-sources-search"><Search size={15}/><input value={query} placeholder="Form name or original filename" onChange={e=>setQuery(e.target.value)}/></span></label></div>
  <div className="hrms-file-list studio-sources-files" role="list" aria-label="Source forms files">{entries.map(form=>{const existing=related(form.id);return <div key={form.id} className="hrms-file-row" role="listitem"><button type="button" className="hrms-file-main" onClick={()=>open(form)}><span className="hrms-file-type"><FileText size={22}/></span><span className="hrms-file-info"><strong>{form.title}</strong><small>{form.group} · {form.review} · {existing.length?`${existing.length} imported PDF draft(s)`:"PDF not uploaded (reference only)"}</small></span></button><button type="button" className="hrms-file-action" onClick={()=>open(form)}>{existing.length?"Open / Manage":"Import PDF"}</button></div>})}{entries.length===0&&<p className="hrms-file-empty">No source forms match your search.</p>}</div>
  <p className="studio-sources-footnote">Source references are metadata only. Uploads remain in browser storage/IndexedDB, not a secure server. Neither importing a source nor approving a Studio template constitutes Philippine legal approval. Existing leave, request, asset and incident workflows remain the system of record.</p>
  {selected&&typeof document!=="undefined"&&createPortal(<div className="studio-sources-shade" onClick={()=>{if(!busy)setSelected(null)}}><section ref={dialog} tabIndex={-1} className="studio-sources-modal" role="dialog" aria-modal="true" aria-label={`${selected.title} source details`} onClick={event=>event.stopPropagation()}><div className="studio-sources-modal-head"><div><small>{selected.group} · {selected.review}</small><h2>{selected.title}</h2></div><button type="button" onClick={()=>setSelected(null)} disabled={busy} aria-label="Close source details"><X size={20}/></button></div><div className="studio-sources-modal-body"><p>{selected.note}</p><h3>Archive source file(s)</h3><ul>{selected.originalFiles.map(name=><li key={name}>{name}</li>)}</ul><h3>Fields to verify / map</h3><ul>{selected.requiredFields.map(x=><li key={x}>{x}</li>)}</ul>{selected.linkedLifecycleIds.length>0&&<p>Related onboarding/offboarding checklist IDs: {selected.linkedLifecycleIds.join(", ")}</p>}
   <h3>Imported source templates</h3>{related(selected.id).length?<div className="studio-sources-imported">{related(selected.id).map((item:StudioItem)=><div key={item.id}><div><strong>{item.title}</strong><small>{item.status} · {item.originalName} · Version {item.version}</small></div><button type="button" onClick={()=>router.push(`/studio/pdf/${item.id}`)}><ExternalLink size={14}/> Open PDF editor</button></div>)}</div>:<p>No PDF copy has been imported for this source form.</p>}
   {actor.role==="Super Admin"&&<div className="studio-sources-upload"><h3>Import source PDF as a draft</h3><p>The original PDF bytes will be preserved. Add fields like {"{{name}}"} inside the PDF editor afterward. DOCX/WPS sources must first be exported to PDF to retain their exact layout. Do not upload personally completed forms as reusable blanks.</p><input type="file" accept=".pdf,application/pdf" onChange={event=>{setFile(event.currentTarget.files?.[0]||null);setError("");setConfirmed(false)}}/><label><input type="checkbox" checked={confirmed} onChange={event=>setConfirmed(event.target.checked)}/> I checked that this is the appropriate source, contains no employee-specific private data, and still requires review before operational use.</label>{error&&<p role="alert" className="studio-sources-error">{error}</p>}</div>}
  </div><footer><button type="button" onClick={()=>setSelected(null)} disabled={busy}>Close</button>{actor.role==="Super Admin"&&<button className="studio-sources-primary" disabled={!file||!confirmed||busy} type="button" onClick={()=>void importSource()}><Upload size={16}/>{busy?"Importing…":"Import PDF Draft"}</button>}</footer></section></div>,document.body)}
 </main>
}
export default function SourceFormsPage(){return <StudioGate>{s=><Sources actor={s.actor!} state={s.state} refresh={s.refresh}/>}</StudioGate>}
