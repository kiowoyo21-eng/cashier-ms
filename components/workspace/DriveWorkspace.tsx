"use client";
import {useEffect,useMemo,useRef,useState} from "react";
import Link from "next/link";
import {ArrowLeft,ChevronRight,Download,ExternalLink,File,FileSpreadsheet,FileText,FileType2,Folder,HardDrive,LayoutGrid,List,Search,Trash2,FolderPlus,Upload,Ellipsis,RotateCcw,FolderInput,Pencil,Plus,FilePlus2} from "lucide-react";
import {HrmsDialog,HrmsButton} from "../ui/HrmsPrimitives";
import {useStudio,openStudioWindow} from "../../lib/studio/useStudio";
import {addStudioItem} from "../../lib/studio/store";
import {createBlankSheet,readSheetState,subscribeSheetChanges,type SheetActor} from "../../lib/spreadsheetStore";
import {addDriveFolder,addDriveUpload,renameDriveFolder,renameDriveUpload,moveDriveItem,setDriveTrash,downloadDriveUpload,onDriveChange,readDrive,type DriveState} from "../../lib/drive/store";
import {readPdfOutputs,subscribePdfOutputs} from "../../lib/studio/pdfOutputs";
import "../../app/drive/drive.css";

type Entry={key:string;id:string;title:string;kind:"folder"|"docs"|"pdf"|"pdf-output"|"sheet"|"upload";subtitle:string;date:string;url?:string};
type Operation="folder"|"new-doc"|"new-sheet"|"rename"|"move"|"trash"|"restore";
function EntryIcon({entry}:{entry:Entry}){if(entry.kind==="folder")return <Folder size={27}/>;if(entry.kind==="docs"||entry.kind==="upload"&&/\.(docx?|rtf|txt|md)$/i.test(entry.title))return <FileText size={27}/>;if(entry.kind==="pdf"||entry.kind==="pdf-output"||entry.kind==="upload"&&/\.pdf$/i.test(entry.title))return <FileType2 size={27}/>;if(entry.kind==="sheet"||entry.kind==="upload"&&/\.(xlsx?|csv)$/i.test(entry.title))return <FileSpreadsheet size={27}/>;return <File size={27}/>}
const sizeLabel=(bytes:number)=>bytes>=1024*1024?`${(bytes/(1024*1024)).toFixed(1)} MB`:`${(bytes/1024).toFixed(1)} KB`;
export default function DriveWorkspace({embedded=false}:{embedded?:boolean}){
 const studio=useStudio(),actor=studio.actor;const admin=actor?.role==="Super Admin";
 const [drive,setDrive]=useState<DriveState>(readDrive),[sheets,setSheets]=useState(readSheetState),[pdfOutputs,setPdfOutputs]=useState(readPdfOutputs);
 const [folder,setFolder]=useState<string|null>(null),[query,setQuery]=useState(""),[view,setView]=useState<"grid"|"list">("list"),[mode,setMode]=useState<"files"|"trash">("files"),[message,setMessage]=useState("");
 const [action,setAction]=useState<{operation:Operation;entry?:Entry}|null>(null),[formValue,setFormValue]=useState(""),[destination,setDestination]=useState(""),[busy,setBusy]=useState(false);
 const uploadRef=useRef<HTMLInputElement>(null),newMenuRef=useRef<HTMLDetailsElement>(null);
 useEffect(()=>{const sync=()=>{setDrive(readDrive());setSheets(readSheetState());setPdfOutputs(readPdfOutputs())};const unsub=onDriveChange(sync),subSheets=subscribeSheetChanges(sync),subPdfs=subscribePdfOutputs(sync);return()=>{unsub();subSheets();subPdfs()}},[]);
 const entries=useMemo<Entry[]>(()=>[
 ...drive.folders.map(f=>({id:f.id,key:`folder:${f.id}`,title:f.name,kind:"folder" as const,subtitle:"Folder",date:f.createdAt})),
 ...studio.state.items.map(x=>({id:x.id,key:`${x.kind}:${x.id}`,title:x.title,kind:x.kind,subtitle:`${x.template?"Template":"Generated document"} · ${x.status} · v${x.version}`,date:x.updatedAt,url:`/studio/${x.kind}/${encodeURIComponent(x.id)}`})),
 ...pdfOutputs.map(x=>({id:x.id,key:`pdf-output:${x.id}`,title:x.title,kind:"pdf-output" as const,subtitle:`Generated PDF · ${x.employeeName||"Manual"} · ${sizeLabel(x.size)}`,date:x.createdAt,url:`/studio/pdf-output/${encodeURIComponent(x.id)}`})),
 ...sheets.customSheets.map(x=>({id:x.id,key:`sheet:${x.id}`,title:x.title,kind:"sheet" as const,subtitle:"Custom working worksheet",date:"",url:`/spreadsheets/working?sheet=${encodeURIComponent(x.id)}`})),
 ...[{id:"payroll",title:"Payroll & Payslips"},{id:"working",title:"Working Sheets"},{id:"employees",title:"Employee 201"},{id:"assets",title:"Asset Inventory"}].map(x=>({id:x.id,key:`sheet:${x.id}`,title:x.title,kind:"sheet" as const,subtitle:"Module-specific workbook",date:"",url:`/spreadsheets/${x.id}`})),
 ...drive.uploads.map(x=>({id:x.id,key:`upload:${x.id}`,title:x.name,kind:"upload" as const,subtitle:`Uploaded file · ${sizeLabel(x.size)}`,date:x.createdAt}))
 ],[drive.folders,drive.uploads,studio.state.items,sheets.customSheets,pdfOutputs]);
 const folderPath:(typeof drive.folders[number])[]=[];let walk=folder;const seen=new Set<string>();while(walk&&!seen.has(walk)){seen.add(walk);const item=drive.folders.find(x=>x.id===walk);if(!item)break;folderPath.unshift(item);walk=item.parentId}
 const hidden=(entry:Entry)=>{if(drive.trashed.includes(entry.key))return true;let parent=entry.kind==="folder"?entry.id:drive.locations[entry.key];const seen=new Set<string>();while(parent&&!seen.has(parent)){seen.add(parent);if(drive.trashed.includes(`folder:${parent}`))return true;parent=drive.folders.find(x=>x.id===parent)?.parentId||null}return false};
 const shown=entries.filter(x=>mode==="trash"?drive.trashed.includes(x.key):!hidden(x)&&(query.trim()?`${x.title} ${x.subtitle}`.toLowerCase().includes(query.trim().toLowerCase()):x.kind==="folder"?drive.folders.find(f=>f.id===x.id)?.parentId===folder:(drive.locations[x.key]??null)===folder)).sort((a,b)=>(a.kind==="folder"?0:1)-(b.kind==="folder"?0:1)||a.title.localeCompare(b.title));
 const openEntry=(entry:Entry)=>{if(mode==="trash")return;if(entry.kind==="folder"){setFolder(entry.id);setQuery("");return}if(entry.kind==="upload"){if(/\.xlsx$/i.test(entry.title)){openStudioWindow(`/spreadsheets/working?driveFile=${encodeURIComponent(entry.id)}`);return}if(/\.(pdf|docx|png|jpe?g|webp|gif|txt|md|csv|json|log)$/i.test(entry.title)){openStudioWindow(`/drive/view/${encodeURIComponent(entry.id)}`);return}void downloadDriveUpload(entry.id,entry.title).catch(error=>setMessage(String(error)));return}if(entry.url)openStudioWindow(entry.url)};
 const openAction=(operation:Operation,entry?:Entry)=>{setMessage("");setAction({operation,entry});setFormValue(operation==="rename"?entry?.title||"":"");setDestination("")};
 const closeAction=()=>{if(!busy)setAction(null)};
 const chooseNew=(operation:"folder"|"new-doc"|"new-sheet"|"upload")=>{newMenuRef.current?.removeAttribute("open");if(!admin){setMessage("Creating or uploading files currently requires Super Admin in this browser-only demo.");return;}if(operation==="upload")uploadRef.current?.click();else openAction(operation)};
 const runAction=()=>{if(!actor||!action)return;setBusy(true);try{const user=actor as SheetActor;const entry=action.entry;switch(action.operation){
 case "folder":addDriveFolder(user,formValue,folder);break;
 case "new-doc":{const doc=addStudioItem(actor,"docs",formValue,"General");if(folder)moveDriveItem(user,`docs:${doc.id}`,folder);openStudioWindow(`/docs/${encodeURIComponent(doc.id)}`);break;}
 case "new-sheet":{const id=createBlankSheet(user,formValue);if(folder)moveDriveItem(user,`sheet:${id}`,folder);openStudioWindow(`/spreadsheets/working?sheet=${encodeURIComponent(id)}`);break;}
 case "rename":if(!entry)break;if(entry.kind==="folder")renameDriveFolder(user,entry.id,formValue);else if(entry.kind==="upload")renameDriveUpload(user,entry.id,formValue);break;
 case "move":if(entry)moveDriveItem(user,entry.key,destination||null);break;
 case "trash":if(entry)setDriveTrash(user,entry.key,true);break;
 case "restore":if(entry)setDriveTrash(user,entry.key,false);break;
 }setMessage("Saved in this browser. Changes are not synchronized to other devices.");setAction(null)}catch(error){setMessage(error instanceof Error?error.message:String(error))}finally{setBusy(false)}};
 const upload=async(files:FileList|null)=>{if(!files||!actor)return;if(!admin){setMessage("Uploading files requires Super Admin in the current demo.");return;}setBusy(true);const problems:string[]=[];let count=0;for(const file of Array.from(files).slice(0,15)){try{await addDriveUpload(actor as SheetActor,file,folder);count++}catch(error){problems.push(`${file.name}: ${String(error instanceof Error?error.message:error)}`)}}setMessage(`${count} file(s) saved in this browser.${problems.length?` ${problems.join("; ")}`:""}`);setBusy(false);if(uploadRef.current)uploadRef.current.value=""};
 if(!studio.ready)return <div className="drive-auth">Loading Drive…</div>;
 if(!actor||actor.role==="BM")return <main className="drive-auth"><h1>Access restricted</h1><p>Sign in as HR or Super Admin to access HRMS Drive.</p><Link href="/">Return to HRMS</Link></main>;
 return <div className={`drive-shell ${embedded?"drive-embedded":""}`}>
 {!embedded&&<header className="drive-header"><Link href="/" className="drive-home"><ArrowLeft size={17}/> HRMS</Link><div className="drive-brand"><HardDrive size={24}/><b>HRMS Drive</b></div><span>{actor.username} · {actor.role}</span></header>}
 <div className="drive-body"><aside className="drive-side" aria-label="Drive folders and views">
 <button type="button" className={mode==="files"?"selected":""} onClick={()=>{setMode("files");setFolder(null);setQuery("")}}><HardDrive size={17}/> My Drive</button>
 <button type="button" className={mode==="trash"?"selected":""} onClick={()=>{setMode("trash");setQuery("")}}><Trash2 size={17}/> Trash</button>
 {!embedded&&<><hr/><Link href="/studio"><FileText size={17}/> Documents</Link><Link href="/spreadsheets"><FileSpreadsheet size={17}/> Spreadsheets</Link></>}
 </aside>
 <main className="drive-main"><div className="drive-toolbar"><div className="drive-path"><button type="button" onClick={()=>setFolder(null)}>My Drive</button>{folderPath.map(f=><span key={f.id}><ChevronRight size={15}/><button type="button" onClick={()=>setFolder(f.id)}>{f.name}</button></span>)}</div>
 <label className="drive-search"><Search size={17}/><input aria-label="Search Drive files" placeholder="Search files or folders" value={query} onChange={e=>setQuery(e.target.value)}/></label></div>
 <div className="drive-title"><h2>{mode==="trash"?"Trash":folderPath.at(-1)?.name||"My Drive"}</h2><div className="drive-title-actions">
 {mode==="files"&&<details className="drive-new-menu" ref={newMenuRef}><summary aria-label="Create or upload file"><Plus size={16}/> New</summary><div className="drive-new-choices"><button type="button" onClick={()=>chooseNew("folder")}><FolderPlus size={17}/> New folder</button><button type="button" onClick={()=>chooseNew("new-doc")}><FilePlus2 size={17}/> New document</button><button type="button" onClick={()=>chooseNew("new-sheet")}><FileSpreadsheet size={17}/> New spreadsheet</button><button type="button" onClick={()=>chooseNew("upload")}><Upload size={17}/> Upload files</button></div></details>}
 <button type="button" onClick={()=>setView("grid")} aria-label="Grid view" aria-pressed={view==="grid"} title="Grid" className={view==="grid"?"active":""}><LayoutGrid size={17}/></button><button type="button" onClick={()=>setView("list")} aria-label="List view" aria-pressed={view==="list"} title="List" className={view==="list"?"active":""}><List size={17}/></button></div></div>
 <input type="file" ref={uploadRef} hidden multiple onChange={e=>void upload(e.target.files)} aria-label="Upload Drive files"/>
 {message&&<p role="status" className="drive-message">{message}</p>}
 <div className={view==="grid"?"drive-grid":"drive-list"}>{shown.map(entry=><article className="drive-item" key={entry.key}><button type="button" className="drive-file" disabled={mode==="trash"} onClick={()=>openEntry(entry)} title={entry.title}><EntryIcon entry={entry}/><span><strong>{entry.title}</strong><small>{entry.subtitle}</small></span>{entry.url&&<ExternalLink size={14}/>}</button>
 <div className="drive-item-actions">{admin&&<button type="button" className="drive-more" aria-label={`${mode==="trash"?"Restore":"Manage"} ${entry.title}`} title={mode==="trash"?"Restore":"Rename or move"} onClick={()=>openAction(mode==="trash"?"restore":"move",entry)}>{mode==="trash"?<RotateCcw size={17}/>:<Ellipsis size={18}/>}</button>}
 {admin&&mode!=="trash"&&<button type="button" className="drive-more drive-trash-action" aria-label={`Delete ${entry.title} (move to Trash)`} title="Move to Trash" onClick={()=>openAction("trash",entry)}><Trash2 size={16}/></button>}
 {entry.kind==="upload"&&mode!=="trash"&&<button className="drive-more" type="button" title={`Download original ${entry.title}`} aria-label={`Download ${entry.title}`} onClick={()=>void downloadDriveUpload(entry.id,entry.title).catch(error=>setMessage(String(error)))}><Download size={17}/></button>}</div>
 </article>)}{shown.length===0&&<p className="drive-empty">{mode==="trash"?"Trash is empty.":"No files in this location."}</p>}</div>
 <footer>Browser-local demo Drive · {admin?"Super Admin can organize items in this browser.":"Read-only access."} Other devices will not see these changes. Trash is organizational only; source templates and workbooks retain their own original records.</footer>
 </main></div>
 <HrmsDialog open={!!action} onClose={closeAction} size="sm" title={action?.operation==="folder"?"Create folder":action?.operation==="new-doc"?"New document":action?.operation==="new-sheet"?"New spreadsheet":action?.operation==="rename"?"Rename item":action?.operation==="move"?"Manage item":action?.operation==="trash"?"Move to trash":"Restore item"} subtitle={action?.entry?.title} footer={<><HrmsButton size="sm" onClick={closeAction} disabled={busy}>Cancel</HrmsButton><HrmsButton variant="primary" size="sm" onClick={runAction} disabled={busy||((action?.operation==="folder"||action?.operation==="new-doc"||action?.operation==="new-sheet"||action?.operation==="rename")&&!formValue.trim())}>{busy?"Saving…":["folder","new-doc","new-sheet"].includes(action?.operation||"")?"Create":action?.operation==="rename"?"Save":action?.operation==="move"?"Move":action?.operation==="trash"?"Trash":"Restore"}</HrmsButton></>}>
 {(action?.operation==="folder"||action?.operation==="new-doc"||action?.operation==="new-sheet"||action?.operation==="rename")&&<label className="drive-dialog-field">{action.operation==="folder"?"Folder name":action.operation==="new-doc"?"Document name":action.operation==="new-sheet"?"Spreadsheet name":"New name"}<input autoFocus maxLength={action.operation==="folder"?100:action.operation==="new-sheet"?60:120} value={formValue} onChange={e=>setFormValue(e.target.value)}/></label>}
 {action?.operation==="move"&&<div className="drive-manage-options"><div className="drive-dialog-actions">{action.entry&&(action.entry.kind==="folder"||action.entry.kind==="upload")&&<HrmsButton onClick={()=>openAction("rename",action.entry)} size="sm" icon={<Pencil size={15}/>}>Rename</HrmsButton>}<HrmsButton size="sm" variant="danger" onClick={()=>openAction("trash",action.entry)} icon={<Trash2 size={15}/>}>Trash</HrmsButton></div><label className="drive-dialog-field">Move to folder<select value={destination} onChange={e=>setDestination(e.target.value)}><option value="">My Drive (root)</option>{drive.folders.filter(f=>!drive.trashed.includes(`folder:${f.id}`)&&!(action.entry?.kind==="folder"&&f.id===action.entry.id)).map(f=><option key={f.id} value={f.id}>{f.name}</option>)}</select></label><p className="drive-muted">Moving/trashed document references does not remove their source documents. Original files remain in their modules.</p></div>}
 {action?.operation==="trash"&&<p className="drive-muted">Move this item to Trash? You can restore it. The source document or workbook will NOT be permanently deleted.</p>}
 {action?.operation==="restore"&&<p className="drive-muted">Restore this item to My Drive. The original module data is unchanged.</p>}
 </HrmsDialog>
 </div>;
}
