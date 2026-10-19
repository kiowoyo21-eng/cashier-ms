'use client';
import React,{useEffect,useMemo,useRef,useState} from 'react';
import {useRouter} from 'next/navigation';
import {ArrowLeft,Check,CheckCircle2,Copy,Download,FileSpreadsheet,FileText,FolderOpen,Link2,Italic,Lock,Plus,Printer,RotateCcw,Save,Search,Send,Table2,Trash2,Underline as UnderlineIcon,X} from 'lucide-react';
import {canDeleteStudio,canEditStudio,canReviewStudio,cloneSourceRows,colName,DEFAULT_SHEET_COLS,displayCell,escapeStudioCsv,newGrid,parseStudioFiles,SHEET_MAX_COLS,SHEET_MAX_ROWS,sourceToHtmlTable,STUDIO_KEY,studioHomeHref,studioFileHref,type StudioFile,type StudioKind,type StudioSource} from '@/lib/report-studio';
import {downloadFile,uid} from '@/lib/data';
import type {Role} from '@/lib/data';

interface Props {mode:StudioKind;fileId?:string;userId:string;userName:string;role:Role;branch:string;sources:StudioSource[];fromDate:string;toDate:string;setFromDate:(date:string)=>void;setToDate:(date:string)=>void;}
const now=()=>new Date().toISOString();
const safeName=(s:string)=>s.replace(/[\\/:*?"<>|\r\n]/g,'-').trim().slice(0,70)||'Untitled';
const escapeHtml=(s:string)=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const EMPTY_DOC='<h1>Report title</h1><p>Date: </p><p>Branch: </p><h2>Summary</h2><p>Write your report here...</p><h2>Findings</h2><p></p><h2>Recommendations</h2><p></p>';

/** Restrict HTML accepted from contentEditable and restored browser files. */
function sanitizeHtml(input:string):string {
 if(typeof DOMParser==='undefined')return '';
 const dom=new DOMParser().parseFromString(input,'text/html');
 const allowed=new Set(['H1','H2','H3','H4','P','DIV','BR','B','STRONG','I','EM','U','S','UL','OL','LI','BLOCKQUOTE','TABLE','THEAD','TBODY','TR','TH','TD','SPAN']);
 const clean=(node:Node):void=>{
  for(const child of Array.from(node.childNodes)){
   if(child.nodeType===8){child.parentNode?.removeChild(child);continue;}
   if(child.nodeType!==1)continue;
   const el=child as HTMLElement;
   if(!allowed.has(el.tagName)){
    if(['SCRIPT','STYLE','IFRAME','OBJECT','EMBED','IMG','SVG','FORM','INPUT','BUTTON','LINK','META','VIDEO','MATH'].includes(el.tagName)){el.remove();continue;}
    clean(el);while(el.firstChild)el.parentNode?.insertBefore(el.firstChild,el);el.remove();continue;
   }
   for(const attr of Array.from(el.attributes))el.removeAttribute(attr.name);
   clean(el);
  }
 };
 clean(dom.body);return dom.body.innerHTML;
}
function DocumentCanvas({id,html,readOnly,onChange}:{id:string;html:string;readOnly:boolean;onChange:(html:string)=>void}){
 const ref=useRef<HTMLDivElement>(null);
 // Don't replace contentEditable on each keystroke, as doing so moves the cursor.
 useEffect(()=>{if(ref.current)ref.current.innerHTML=sanitizeHtml(html);},[id]); // eslint-disable-line react-hooks/exhaustive-deps
 return <div ref={ref} role="textbox" aria-label="Document editor" aria-multiline="true" className={`office-doc-paper ${readOnly?'office-doc-readonly':''}`} contentEditable={!readOnly} suppressContentEditableWarning spellCheck onInput={e=>onChange(sanitizeHtml(e.currentTarget.innerHTML))}/>;
}
function gridToTable(rows:string[][]){
 const last=Math.max(0,...rows.map((r,i)=>r.some(v=>v.trim())?i:0));
 return `<table><tbody>${rows.slice(0,last+1).map((row,r)=>`<tr>${row.map((_,c)=>r===0?`<th>${escapeHtml(displayCell(rows,r,c))}</th>`:`<td>${escapeHtml(displayCell(rows,r,c))}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
}
function printStudio(html:string,title:string){
 const w=window.open('','_blank');if(!w){window.alert('Allow pop-ups to print your file.');return;}
 w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(title)}</title><style>body{font:12pt Arial,sans-serif;color:#162236;margin:28px auto;max-width:960px}h1{font-size:23pt}h2{font-size:17pt;margin-top:24px}table{border-collapse:collapse;width:100%;font-size:10pt}td,th{padding:8px;border:1px solid #cbd5e1;text-align:left}th{background:#e9eef5}p{line-height:1.6}@page{size:A4;margin:17mm}</style></head><body>${html}</body></html>`);
 w.document.close();w.focus();w.print();
}
function DateLabel({date}:{date:string}){return <>{new Date(date).toLocaleDateString('en-PH',{month:'short',day:'numeric',year:'numeric'})}</>}
export default function ReportStudio({mode,fileId,userId,userName,role,branch,sources,fromDate,toDate,setFromDate,setToDate}:Props){
 const router=useRouter();const [files,setFiles]=useState<StudioFile[]>([]),filesRef=useRef<StudioFile[]>([]);
 const [loaded,setLoaded]=useState(false),[sourceId,setSourceId]=useState('blank'),[search,setSearch]=useState(''),[message,setMessage]=useState(''),[storageError,setStorageError]=useState('');
 const [selected,setSelected]=useState<[number,number]>([0,0]);
 const [formula,setFormula]=useState('');
 const home=studioHomeHref(mode);const label=mode==='sheet'?'Spreadsheets':'Documents';
 const active=files.find(f=>f.id===fileId&&f.kind===mode&&(f.ownerId===userId||role==='admin'));
 const visible=files.filter(f=>f.kind===mode&&(f.ownerId===userId||role==='admin')&&f.title.toLowerCase().includes(search.toLowerCase())).sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt));
 const editable=!!active&&canEditStudio(active,userId,role);
 const reviewing=!!active&&canReviewStudio(active,userId,role);
 const sourcesWithBlank=useMemo(()=>[{id:'blank',label:'Blank file',headers:[],rows:[] as (string|number)[][]},...sources],[sources]);
 const statusText=active?.status==='Approved'?'Approved and locked':active?.status==='Submitted'?'Awaiting Admin review':active?.status==='Changes Requested'?'Changes requested — editing enabled':'Draft · Editable';
 useEffect(()=>{
  const refresh=()=>{try{const latest=parseStudioFiles(localStorage.getItem(STUDIO_KEY));filesRef.current=latest;setFiles(latest);}catch{setStorageError('Browser storage unavailable. Save is disabled.');}};
  refresh();setLoaded(true);
  const onStorage=(ev:StorageEvent)=>{if(ev.key===STUDIO_KEY)refresh();};window.addEventListener('storage',onStorage);
  return()=>window.removeEventListener('storage',onStorage);
 },[]);
 const commit=(next:StudioFile[]):boolean=>{
  try {localStorage.setItem(STUDIO_KEY,JSON.stringify(next));filesRef.current=next;setFiles(next);setStorageError('');return true;}
  catch {setStorageError('Could not save. Browser storage may be full. Export an important file before making more changes.');return false;}
 };
 const update=(transform:(before:StudioFile[])=>StudioFile[]):boolean=>commit(transform(filesRef.current));
 const patch=(fn:(file:StudioFile)=>StudioFile)=>{
  if(!active||!canEditStudio(active,userId,role))return;
  update(old=>old.map(f=>f.id===active.id&&canEditStudio(f,userId,role)?{...fn(f),updatedAt:now()}:f));
 };
 useEffect(()=>{if(active?.kind==='sheet')setFormula(active.rows[selected[0]]?.[selected[1]]??'');},[fileId,selected[0],selected[1],loaded]); // eslint-disable-line react-hooks/exhaustive-deps
 const create=()=>{
  const source=sourcesWithBlank.find(s=>s.id===sourceId);
  if(!source){setMessage('Selected source is not available.');return;}
  const imported=source.id!=='blank';const file:StudioFile={id:uid(),title:imported?`${source.label} - ${new Date().toLocaleDateString('en-PH')}`:mode==='sheet'?'Untitled spreadsheet':'Untitled document',kind:mode,status:'Draft',ownerId:userId,ownerName:userName,branch,createdAt:now(),updatedAt:now(),sourceName:imported?source.label:'Manual file',sourceDate:now(),sourceCount:imported?source.rows.length:0,rows:mode==='sheet'&&imported?cloneSourceRows(source):newGrid(),html:mode==='document'&&imported?sourceToHtmlTable(source):EMPTY_DOC};
  if(update(old=>[file,...old]))router.push(studioFileHref(file));
 };
 const remove=(file:StudioFile)=>{
  if(!canDeleteStudio(file,userId))return;
  if(!window.confirm(`Delete "${file.title}" permanently?\n\nThis report file cannot be restored. Original cashier transactions will not be changed.`))return;
  if(update(old=>old.filter(f=>f.id!==file.id))){if(fileId===file.id)router.push(home);else setMessage('File deleted.');}
 };
 const duplicate=()=>{
  if(!active)return;
  const clone:StudioFile={...active,id:uid(),title:`${active.title} (Copy)`,ownerId:userId,ownerName:userName,branch,createdAt:now(),updatedAt:now(),status:'Draft',reviewedAt:undefined,reviewedBy:undefined,reviewNote:undefined,rows:active.rows.map(r=>[...r])};
  if(update(old=>[clone,...old]))router.push(studioFileHref(clone));
 };
 const toDocument=()=>{
  if(!active||mode!=='sheet')return;
  const doc:StudioFile={...active,id:uid(),kind:'document',title:`${active.title} - Document`,ownerId:userId,ownerName:userName,branch,createdAt:now(),updatedAt:now(),status:'Draft',reviewedAt:undefined,reviewedBy:undefined,reviewNote:undefined,sourceName:`Spreadsheet: ${active.title}`,rows:newGrid(),html:`<h1>${escapeHtml(active.title)}</h1><p>Document prepared from spreadsheet snapshot.</p>${gridToTable(active.rows)}<h2>Findings</h2><p></p>`};
  if(update(old=>[doc,...old]))router.push(studioFileHref(doc));
 };
 const submit=()=>{
  if(!active||!editable||!window.confirm('Submit for Admin review? Editing will be locked until Admin returns it.'))return;
  update(old=>old.map(f=>f.id===active.id?{...f,status:'Submitted',updatedAt:now(),reviewNote:undefined}:f));
 };
 const review=(approve:boolean)=>{
  if(!active||!reviewing)return;
  const note=window.prompt(approve?'Optional approval note:':'Reason for requesting changes:');
  if(note===null)return;
  if(!approve&&!note.trim()){setMessage('A reason is required to return a file.');return;}
  update(old=>old.map(f=>f.id===active.id?{...f,status:approve?'Approved':'Changes Requested',reviewedAt:now(),reviewedBy:userName,reviewNote:note.trim(),updatedAt:now()}:f));
 };
 const exportFile=()=>{
  if(!active)return;
  if(mode==='sheet'){
   const last=Math.max(0,...active.rows.map((r,i)=>r.some(v=>v.trim())?i:0));
   const csv='\uFEFF'+active.rows.slice(0,last+1).map(row=>row.map((_,c)=>escapeStudioCsv(displayCell(active.rows,r,c))).join(',')).join('\r\n');
   downloadFile(`${safeName(active.title)}.csv`,csv,'text/csv;charset=utf-8');
  }else downloadFile(`${safeName(active.title)}.doc`,`<html><head><meta charset="utf-8"></head><body>${sanitizeHtml(active.html)}</body></html>`,'application/msword');
 };
 const print=()=>{if(active)printStudio(mode==='sheet'?`<h1>${escapeHtml(active.title)}</h1>${gridToTable(active.rows)}`:sanitizeHtml(active.html),active.title);};
 const setCell=(r:number,c:number,value:string)=>{patch(f=>({...f,rows:f.rows.map((row,ri)=>ri===r?row.map((v,ci)=>ci===c?value:v):row)}));setFormula(value);};
 const selectCell=(r:number,c:number)=>{setSelected([r,c]);setFormula(active?.rows[r]?.[c]??'');};
 const pasteGrid=(e:React.ClipboardEvent<HTMLInputElement>,r:number,c:number)=>{
  if(!editable)return;
  const text=e.clipboardData.getData('text/plain');if(!text.includes('\t')&&!text.includes('\n'))return;
  e.preventDefault();const pasteRows=text.replace(/\r/g,'').replace(/\n$/,'').split('\n').map(line=>line.split('\t'));
  patch(f=>{
   const rows=f.rows.map(line=>[...line]);const maxCol=rows[0]?.length||0;
   for(let ri=0;ri<pasteRows.length&&r+ri<rows.length;ri++)for(let ci=0;ci<pasteRows[ri].length&&c+ci<maxCol;ci++)rows[r+ri][c+ci]=pasteRows[ri][ci];
   return {...f,rows};
  });setFormula(pasteRows[0]?.[0]||'');
 };
 const format=(cmd:string,value?:string)=>{
  if(!editable)return;document.execCommand(cmd,false,value);
  const node=document.querySelector('.office-doc-paper');if(node)patch(f=>({...f,html:sanitizeHtml(node.innerHTML)}));
 };
 const openStatus=active?.reviewNote?` · Review note: ${active.reviewNote}`:'';
 if(!loaded)return <div className="office-wait">Loading {label}...</div>;
 return <section className={`office-workspace ${fileId?'office-editing':'office-library'}`}>
  {!fileId?<>
   <div className="office-library-heading"><div><span className="office-eyebrow">YOUR WORKSPACE · UNDERCHARGERS</span><h1>{label}</h1><p>Standalone {mode==='sheet'?'spreadsheet':'document'} workspace. Create custom reports or import data from your cashier system.</p></div><span className="office-local-indicator"><Lock size={14}/> Browser-local files</span></div>
   <div className="office-library-create"><div className={`office-new-icon ${mode==='sheet'?'office-sheet-icon':'office-doc-icon'}`}>{mode==='sheet'?<FileSpreadsheet size={30}/>:<FileText size={30}/>}</div><div className="office-new-info"><strong>Create a {mode==='sheet'?'spreadsheet':'document'}</strong><span>Blank file or imported snapshot — the official data stays unchanged.</span></div><select aria-label="Choose import source" value={sourceId} onChange={e=>setSourceId(e.target.value)}>{sourcesWithBlank.map(s=><option value={s.id} key={s.id}>{s.label}{s.id==='blank'?'':` (${s.rows.length} records)`}</option>)}</select><button className="office-primary" onClick={create}><Plus size={17}/> Create</button></div>
   <div className="office-source-filters"><span>Import filters</span><strong>{branch}</strong><label>From <input type="date" value={fromDate} onChange={e=>setFromDate(e.target.value)}/></label><label>To <input type="date" value={toDate} onChange={e=>setToDate(e.target.value)}/></label><button className="office-text-btn" onClick={()=>{setFromDate('');setToDate('');}}>Clear dates</button></div>
   <div className="office-files-heading"><h2>Files <span>{visible.length}</span></h2><div className="office-search"><Search size={17}/><input aria-label={`Search ${label.toLowerCase()}`} placeholder={`Search ${label.toLowerCase()}...`} value={search} onChange={e=>setSearch(e.target.value)}/></div></div>
   <div className="office-library-table"><div className="office-table-head"><span>Name</span><span>Owner</span><span>Status</span><span>Last modified</span><span>Actions</span></div>{visible.map(f=><div className="office-file-line" key={f.id}><a className="office-file-title" href={studioFileHref(f)}><span className={`office-file-icon ${mode==='sheet'?'office-sheet-icon':'office-doc-icon'}`}>{mode==='sheet'?<FileSpreadsheet size={19}/>:<FileText size={19}/>}</span><span><strong>{f.title}</strong><small>{f.sourceName}</small></span></a><span className="office-cell-muted">{f.ownerId===userId?'Me':f.ownerName}</span><span><em className={`office-status office-status-${f.status.toLowerCase().replace(/\s/g,'-')}`}>{f.status}</em></span><span className="office-cell-muted"><DateLabel date={f.updatedAt}/></span><div className="office-list-actions"><a href={studioFileHref(f)} title="Open file" aria-label={`Open ${f.title}`}><FolderOpen size={18}/></a>{canDeleteStudio(f,userId)&&<button title={`Delete ${f.title}`} aria-label={`Delete ${f.title}`} onClick={()=>remove(f)}><Trash2 size={18}/></button>}</div></div>)}{visible.length===0&&<div className="office-no-files"><FolderOpen size={38}/><h3>No {label.toLowerCase()} found</h3><p>Create a new file above, or clear your search.</p></div>}</div>
  </>:!active?<div className="office-notfound"><FileText size={44}/><h2>File not available</h2><p>This file doesn't exist, belongs to a different workspace, or you don't have access.</p><a className="office-primary" href={home}><ArrowLeft size={17}/> Back to {label}</a></div>:<>
   <div className="office-editor-header"><a className="office-back-link" href={home} title={`Back to ${label}`}><ArrowLeft size={21}/></a><span className={`office-file-icon ${mode==='sheet'?'office-sheet-icon':'office-doc-icon'}`}>{mode==='sheet'?<FileSpreadsheet size={24}/>:<FileText size={24}/>}</span><div className="office-editor-identity"><input aria-label="File name" value={active.title} disabled={!editable} maxLength={100} onChange={e=>patch(f=>({...f,title:e.target.value}))}/><div className="office-file-undername"><span>{label}</span><span>·</span><span>{active.sourceName}</span><span>·</span><span><Save size={13}/> Saved locally</span></div></div><div className="office-editor-commands"><button title="Copy this file URL" onClick={()=>{navigator.clipboard.writeText(window.location.href).then(()=>setMessage('File URL copied. Files are currently saved only in this browser; cloud sharing will require a backend.')).catch(()=>setMessage('Could not copy link. Copy the address from your browser instead.'));}}><Link2 size={16}/><span>Copy file URL</span></button><button title="Duplicate file" onClick={duplicate}><Copy size={16}/><span>Make a copy</span></button>{mode==='sheet'&&<button title="Create document from spreadsheet" onClick={toDocument}><FileText size={16}/><span>To Doc</span></button>}<button onClick={exportFile} title="Download file"><Download size={16}/><span>{mode==='sheet'?'CSV':'.doc'}</span></button><button onClick={print} title="Print or save PDF"><Printer size={16}/><span>Print</span></button></div></div>
   {mode==='document'&&<div className="office-doc-toolbar"><div className="office-toolbar-section"><button title="Bold" disabled={!editable} onMouseDown={e=>e.preventDefault()} onClick={()=>format('bold')}><b>B</b></button><button title="Italic" disabled={!editable} onMouseDown={e=>e.preventDefault()} onClick={()=>format('italic')}><Italic size={16}/></button><button title="Underline" disabled={!editable} onMouseDown={e=>e.preventDefault()} onClick={()=>format('underline')}><UnderlineIcon size={16}/></button><button title="Strikethrough" disabled={!editable} onMouseDown={e=>e.preventDefault()} onClick={()=>format('strikeThrough')}><span style={{textDecoration:'line-through'}}>S</span></button></div><div className="office-toolbar-section"><button disabled={!editable} onMouseDown={e=>e.preventDefault()} onClick={()=>format('formatBlock','H1')}>Heading 1</button><button disabled={!editable} onMouseDown={e=>e.preventDefault()} onClick={()=>format('formatBlock','H2')}>Heading 2</button><button disabled={!editable} onMouseDown={e=>e.preventDefault()} onClick={()=>format('formatBlock','P')}>Normal</button></div><div className="office-toolbar-section"><button disabled={!editable} onMouseDown={e=>e.preventDefault()} onClick={()=>format('insertUnorderedList')}>• List</button><button disabled={!editable} onMouseDown={e=>e.preventDefault()} onClick={()=>format('insertOrderedList')}>1. List</button></div></div>}
   {mode==='sheet'&&<div className="office-sheet-formula"><div className="office-cell-id">{colName(selected[1])}{selected[0]+1}</div><span className="office-fx">ƒx</span><input aria-label="Formula bar" disabled={!editable} value={formula} placeholder="Enter value or formula (=SUM(A2:A10))" onChange={e=>setCell(selected[0],selected[1],e.target.value)}/><button disabled={!editable||active.rows.length>=SHEET_MAX_ROWS} onClick={()=>patch(f=>({...f,rows:[...f.rows,Array.from({length:f.rows[0]?.length||DEFAULT_SHEET_COLS},()=>'')]}))}><Plus size={14}/> Row</button><button disabled={!editable||active.rows[0]?.length>=SHEET_MAX_COLS} onClick={()=>patch(f=>({...f,rows:f.rows.map(row=>[...row,''])}))}><Plus size={14}/> Column</button></div>}
   <div className={`office-editor-body ${mode==='sheet'?'office-sheet-body':'office-doc-body'}`}>{mode==='document'?<DocumentCanvas key={active.id} id={active.id} html={active.html} readOnly={!editable} onChange={html=>patch(f=>({...f,html}))}/>:<div className="office-sheet-scroll"><table className="office-grid"><thead><tr><th className="office-grid-corner">#</th>{active.rows[0]?.map((_,c)=><th key={c}>{colName(c)}</th>)}</tr></thead><tbody>{active.rows.map((row,r)=><tr key={r}><th>{r+1}</th>{row.map((value,c)=><td key={`${r}-${c}`} className={selected[0]===r&&selected[1]===c?'office-cell-active':''}><input data-cell={`${r}-${c}`} aria-label={`Cell ${colName(c)}${r+1}`} disabled={!editable} value={selected[0]===r&&selected[1]===c?value:displayCell(active.rows,r,c)} onFocus={()=>selectCell(r,c)} onChange={e=>setCell(r,c,e.target.value)} onPaste={e=>pasteGrid(e,r,c)} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();const next=document.querySelector<HTMLInputElement>(`[data-cell="${Math.min(r+1,active.rows.length-1)}-${c}"]`);next?.focus();next?.select();}}}/></td>)}</tr>)}</tbody></table></div>}</div>
   <div className="office-editor-bottom"><div className="office-save-state"><Check size={15}/><span>{statusText}</span>{openStatus&&<small>{openStatus}</small>}</div><div className="office-review-buttons">{editable&&<button className="office-primary" onClick={submit}><Send size={15}/> Submit for Admin Review</button>}{reviewing&&<><button onClick={()=>review(false)}><RotateCcw size={15}/> Request changes</button><button className="office-primary" onClick={()=>review(true)}><CheckCircle2 size={15}/> Approve</button></>}{canDeleteStudio(active,userId)&&<button className="office-danger" onClick={()=>remove(active)}><Trash2 size={15}/> Delete</button>}</div></div>
   {mode==='sheet'&&<div className="office-sheet-tabs"><span><Table2 size={14}/> Sheet 1</span><small>Supports arithmetic, SUM, AVERAGE, COUNT, MIN, MAX · Paste rows from Excel/Sheets</small></div>}
  </>}
  {(message||storageError)&&<div className={`office-notice ${storageError?'office-notice-error':''}`} role="status">{storageError||message}<button title="Dismiss" onClick={()=>{setMessage('');setStorageError('');}}><X size={14}/></button></div>}
  {!fileId&&<p className="office-disclaimer"><Lock size={13}/> Files are stored in this browser and linked to your cashier workspace. Imported records are copies, not editable official ledger data. Approval controls are only a frontend demo until a backend is connected.</p>}
 </section>;
}
