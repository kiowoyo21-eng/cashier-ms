'use client';
import React,{useEffect,useMemo,useRef,useState} from 'react';
import {CheckCircle2,ChevronLeft,ClipboardCheck,Download,FilePlus2,FileSpreadsheet,FileText,Lock,Plus,Printer,RotateCcw,Save,Send,Trash2,X} from 'lucide-react';
import {canEditStudio,canReviewStudio,cloneSourceRows,colName,DEFAULT_SHEET_COLS,displayCell,escapeStudioCsv,newGrid,parseStudioFiles,SHEET_MAX_COLS,SHEET_MAX_ROWS,sourceToHtmlTable,STUDIO_KEY,type StudioFile,type StudioKind,type StudioSource} from '@/lib/report-studio';
import {downloadFile,uid} from '@/lib/data';
import type {Role} from '@/lib/data';

interface Props {userId:string;userName:string;role:Role;branch:string;sources:StudioSource[];fromDate:string;toDate:string;setFromDate:(date:string)=>void;setToDate:(date:string)=>void;}
const now=()=>new Date().toISOString();
const safeName=(s:string)=>s.replace(/[\\/:*?"<>|\r\n]/g,'-').trim().slice(0,70)||'Untitled';
const EMPTY_DOC='<h1>Report title</h1><p>Date: </p><p>Branch: </p><h2>Summary</h2><p>Write your report here...</p><h2>Findings</h2><p></p><h2>Recommendations</h2><p></p>';
function sanitizeHtml(input:string):string {
 if(typeof DOMParser==='undefined')return '';
 const dom=new DOMParser().parseFromString(input,'text/html');
 const allowed=new Set(['H1','H2','H3','H4','P','DIV','BR','B','STRONG','I','EM','U','S','UL','OL','LI','BLOCKQUOTE','TABLE','THEAD','TBODY','TR','TH','TD','A','SPAN']);
 const clean=(node:Node):void=>{
  for(const child of Array.from(node.childNodes)){
   if(child.nodeType===8){child.parentNode?.removeChild(child);continue;}
   if(child.nodeType!==1)continue;
   const el=child as HTMLElement;
   if(!allowed.has(el.tagName)){
    if(['SCRIPT','STYLE','IFRAME','OBJECT','EMBED','IMG','SVG','FORM','INPUT','BUTTON','LINK','META','VIDEO'].includes(el.tagName)){el.remove();continue;}
    clean(el);while(el.firstChild)el.parentNode?.insertBefore(el.firstChild,el);el.remove();continue;
   }
   for(const attr of Array.from(el.attributes))el.removeAttribute(attr.name);
   clean(el);
  }
 };
 clean(dom.body);
 return dom.body.innerHTML;
}
function DocumentCanvas({id,html,readOnly,onChange}:{id:string;html:string;readOnly:boolean;onChange:(html:string)=>void}){
 const ref=useRef<HTMLDivElement>(null);
 // The editing DOM is not rerendered on every keystroke (which would reset caret position).
 useEffect(()=>{if(ref.current)ref.current.innerHTML=sanitizeHtml(html);},[id]); // eslint-disable-line react-hooks/exhaustive-deps
 return <div ref={ref} role="textbox" aria-label="Document editor" aria-multiline="true" className={`studio-document-page ${readOnly?'studio-document-locked':''}`} contentEditable={!readOnly} suppressContentEditableWarning spellCheck onInput={e=>onChange(sanitizeHtml(e.currentTarget.innerHTML))}/>;
}
function printStudio(html:string,title:string){
 const w=window.open('','_blank');if(!w){window.alert('Allow pop-ups to print this report.');return;}
 // Only code-authored styles and sanitized document HTML enter the preview.
 w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${safeName(title)}</title><style>body{font:12pt Arial,sans-serif;color:#162236;margin:28px auto;max-width:960px}h1{font-size:23pt}h2{font-size:17pt;margin-top:24px}table{border-collapse:collapse;width:100%;font-size:10pt}td,th{padding:8px;border:1px solid #cbd5e1;text-align:left}th{background:#e9eef5}p{line-height:1.6}.foot{border-top:1px solid #ddd;margin-top:30px;padding-top:8px;font-size:9pt;color:#64748b}@page{size:A4;margin:17mm}</style></head><body>${html}<p class="foot">Report Studio export · Custom report copy. Verify against original transactions.</p></body></html>`);
 w.document.close();w.focus();w.print();
}
function gridToTable(rows:string[][],formulaValues=true){
 const esc=(s:string)=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
 const last=Math.max(0,...rows.map((r,i)=>r.some(v=>v.trim())?i:0));
 return `<table><tbody>${rows.slice(0,last+1).map((row,r)=>`<tr>${row.map((value,c)=>r===0?`<th>${esc(formulaValues?displayCell(rows,r,c):value)}</th>`:`<td>${esc(formulaValues?displayCell(rows,r,c):value)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
}
export default function ReportStudio({userId,userName,role,branch,sources,fromDate,toDate,setFromDate,setToDate}:Props){
 const [files,setFiles]=useState<StudioFile[]>([]),[loaded,setLoaded]=useState(false);
 const [activeId,setActiveId]=useState(''),[newSource,setNewSource]=useState('blank');
 const [selected,setSelected]=useState<[number,number]>([0,0]),[formula,setFormula]=useState(''),[search,setSearch]=useState('');
 const [message,setMessage]=useState(''),[storageError,setStorageError]=useState('');
 const active=files.find(f=>f.id===activeId);
 const allowedFiles=files.filter(f=>f.ownerId===userId||role==='admin');
 const visibleFiles=allowedFiles.filter(f=>(!search||f.title.toLowerCase().includes(search.toLowerCase())));
 const editable=!!active&&canEditStudio(active,userId,role);
 const reviewing=!!active&&canReviewStudio(active,userId,role);
 const allSources=useMemo(()=>[{id:'blank',label:'Blank template',headers:[],rows:[] as (string|number)[][]},...sources],[sources]);
 useEffect(()=>{try{setFiles(parseStudioFiles(localStorage.getItem(STUDIO_KEY)));}catch{setStorageError('Browser storage is not available. Saving is disabled.');}setLoaded(true);},[]);
 useEffect(()=>{if(!loaded)return;try{localStorage.setItem(STUDIO_KEY,JSON.stringify(files));setStorageError('');}catch{setStorageError('Could not save Report Studio. Browser storage may be full. Export a backup of important drafts.');}},[files,loaded]);
 useEffect(()=>{if(active?.kind==='sheet')setFormula(active.rows[selected[0]]?.[selected[1]]??'');},[activeId,selected[0],selected[1]]); // eslint-disable-line react-hooks/exhaustive-deps
 const notify=(msg:string)=>{setMessage(msg);};
 const persist=(fn:(f:StudioFile)=>StudioFile)=>setFiles(prev=>prev.map(f=>f.id===activeId&&canEditStudio(f,userId,role)?{...fn(f),updatedAt:now()}:f));
 const create=(nextKind:StudioKind)=>{
  const source=allSources.find(s=>s.id===newSource);
  if(newSource!=='blank'&&!source){notify('Selected source is not available.');return;}
  const title=source?.id!=='blank'&&source?`${source.label} - ${new Date().toLocaleDateString('en-PH')}`:nextKind==='sheet'?'Untitled Spreadsheet':'Untitled Document';
  const file:StudioFile={id:uid(),title,kind:nextKind,status:'Draft',ownerId:userId,ownerName:userName,branch,createdAt:now(),updatedAt:now(),sourceName:source?.id==='blank'?'Manual report':source?.label||'Manual report',sourceDate:now(),sourceCount:source?.rows.length||0,rows:nextKind==='sheet'&&source?.id!=='blank'&&source?cloneSourceRows(source):newGrid(),html:nextKind==='document'&&source?.id!=='blank'&&source?sourceToHtmlTable(source):EMPTY_DOC};
  setFiles(prev=>[file,...prev]);setActiveId(file.id);setSelected([0,0]);setFormula('');notify('Draft created. Changes save automatically in this browser.');
  if(source&&source.rows.length>=SHEET_MAX_ROWS)notify(`Imported first ${SHEET_MAX_ROWS-1} source rows. Export original CSV to preserve the full dataset.`);
 };
 const chooseFile=(f:StudioFile)=>{setActiveId(f.id);setSelected([0,0]);setFormula(f.rows[0]?.[0]??'');notify('');};
 const setCell=(r:number,c:number,value:string)=>{if(!editable)return;persist(f=>({ ...f,rows:f.rows.map((row,ri)=>ri===r?row.map((v,ci)=>ci===c?value:v):row)}));setFormula(value);};
 const addRow=()=>{if(!active||active.rows.length>=SHEET_MAX_ROWS){notify(`Maximum ${SHEET_MAX_ROWS} rows per sheet.`);return;}persist(f=>({...f,rows:[...f.rows,Array.from({length:f.rows[0]?.length||DEFAULT_SHEET_COLS},()=>'')]}));};
 const addColumn=()=>{if(!active||active.rows[0]?.length>=SHEET_MAX_COLS){notify(`Maximum ${SHEET_MAX_COLS} columns per sheet.`);return;}persist(f=>({...f,rows:f.rows.map(row=>[...row,''])}));};
 const duplicate=()=>{if(!active)return;const clone:StudioFile={...active,id:uid(),ownerId:userId,ownerName:userName,branch,createdAt:now(),updatedAt:now(),reviewNote:undefined,reviewedAt:undefined,reviewedBy:undefined,title:`${active.title} (Copy)`,status:'Draft',rows:active.rows.map(r=>[...r])};setFiles(prev=>[clone,...prev]);setActiveId(clone.id);notify('Editable copy created.');};
 const turnSheetIntoDoc=()=>{
  if(!active||active.kind!=='sheet')return;
  const converted:StudioFile={...active,id:uid(),kind:'document',title:`${active.title} - Document`,status:'Draft',ownerId:userId,ownerName:userName,branch,createdAt:now(),updatedAt:now(),sourceName:`Spreadsheet: ${active.title}`,reviewNote:undefined,reviewedAt:undefined,reviewedBy:undefined,rows:newGrid(),html:`<h1>${safeName(active.title)}</h1><p>Custom report prepared from the spreadsheet snapshot.</p>${gridToTable(active.rows)}<h2>Findings</h2><p></p><h2>Recommendations</h2><p></p>`};
  setFiles(prev=>[converted,...prev]);setActiveId(converted.id);notify('Editable document created from spreadsheet results.');
 };
 const submit=()=>{if(!active||!editable)return;if(!window.confirm('Submit this report for Admin review? Editing will be locked until it is returned.'))return;setFiles(prev=>prev.map(f=>f.id===active.id?{...f,status:'Submitted',updatedAt:now(),reviewNote:undefined}:f));notify('Submitted for Admin review (local demo only).');};
 const review=(approve:boolean)=>{if(!active||!reviewing)return;const note=window.prompt(approve?'Optional review note:':'Reason / required changes:');if(note===null)return;if(!approve&&!note.trim()){notify('A reason is required when returning a report.');return;}setFiles(prev=>prev.map(f=>f.id===active.id?{...f,status:approve?'Approved':'Changes Requested',reviewedBy:userName,reviewedAt:now(),reviewNote:note.trim(),updatedAt:now()}:f));notify(approve?'Report approved and locked.':'Report returned for changes.');};
 const remove=()=>{if(!active||active.ownerId!==userId||active.status!=='Draft')return;if(!window.confirm('Delete this draft? It cannot be restored.'))return;setFiles(prev=>prev.filter(f=>f.id!==active.id));setActiveId('');notify('Draft deleted.');};
 const documentHtml=active?.kind==='document'?sanitizeHtml(active.html):active?`<h1>${safeName(active.title)}</h1>${gridToTable(active.rows)}`:'';
 const exportFile=()=>{
  if(!active)return;
  if(active.kind==='sheet'){
   const rows=active.rows.map((row,r)=>row.map((_,c)=>displayCell(active.rows,r,c)));
   const last=Math.max(0,...active.rows.map((r,i)=>r.some(v=>v.trim())?i:0));
   downloadFile(`${safeName(active.title)}.csv`,'\uFEFF'+rows.slice(0,last+1).map(r=>r.map(escapeStudioCsv).join(',')).join('\r\n'),'text/csv;charset=utf-8');
  }else{
   const doc=`<html><head><meta charset="utf-8"><title>${safeName(active.title)}</title></head><body>${sanitizeHtml(active.html)}<hr><p><small>Custom report copy; verify against original system records.</small></p></body></html>`;
   downloadFile(`${safeName(active.title)}.doc`,doc,'application/msword');
  }
  notify(active.kind==='sheet'?'CSV exported (formula results).':'Word-compatible .doc exported.');
 };
 const issueSummary=active?.status==='Approved'?'Approved copy — locked after review.':active?.status==='Submitted'?'Awaiting Admin review — editing locked.':active?.status==='Changes Requested'?'Changes requested — owner may edit and resubmit.':'Draft · Unofficial and editable by owner.';
 if(!loaded)return <section className="panel studio-app">Loading Report Studio...</section>;
 return <section className="studio-app">
  <div className="studio-intro"><div><span className="studio-eyebrow">UNDERCHARGERS · REPORT WORKSPACE</span><h2>Report Studio</h2><p>Create spreadsheets and formatted documents from approved-access report data. Imports are editable copies, never changes to actual POS, stocks, or financial records.</p></div><span className="studio-local-chip"><Lock size={14}/> Local browser demo</span></div><div className="studio-period"><strong>Source data filters</strong><span>Branch: {branch}</span><label>From <input type="date" value={fromDate} onChange={e=>setFromDate(e.target.value)}/></label><label>To <input type="date" value={toDate} onChange={e=>setToDate(e.target.value)}/></label><button className="button button-secondary button-small" onClick={()=>{setFromDate('');setToDate('')}}>All Dates</button><small>Filters apply when creating new imported files; existing files remain snapshots.</small></div>
  <div className="studio-layout">
   <aside className="studio-sidebar"><h3>My Report Files</h3><input aria-label="Search report files" placeholder="Search saved reports..." value={search} onChange={e=>setSearch(e.target.value)}/><div className="studio-sidebar-section"><label htmlFor="studio-source">Start with data</label><select id="studio-source" value={newSource} onChange={e=>setNewSource(e.target.value)}>{allSources.map(source=><option key={source.id} value={source.id}>{source.label}{source.id==='blank'?'':` (${source.rows.length})`}</option>)}</select><button className="button button-primary" onClick={()=>create('sheet')}><FileSpreadsheet size={16}/> New Spreadsheet</button><button className="button button-secondary" onClick={()=>create('document')}><FileText size={16}/> New Document</button><small>Selected source becomes a fixed snapshot. Choose Blank for your own template.</small></div>
    <div className="studio-file-list">{visibleFiles.map(f=><button key={f.id} className={`studio-file ${activeId===f.id?'active':''}`} onClick={()=>chooseFile(f)}><span>{f.kind==='sheet'?<FileSpreadsheet size={18}/>:<FileText size={18}/>}</span><span className="studio-file-desc"><strong>{f.title}</strong><small>{f.status} · {f.ownerId===userId?'Mine':f.ownerName} · {new Date(f.updatedAt).toLocaleDateString('en-PH')}</small></span></button>)}{visibleFiles.length===0&&<p className="muted small">No report files yet. Create your first spreadsheet or document.</p>}</div>
   </aside>
   <div className="studio-main">
    {!active?<div className="studio-empty"><FilePlus2 size={42}/><h3>Build a customizable report</h3><p>Choose a source, then create a spreadsheet or document. You can also start from a blank file.</p><div className="studio-feature-pair"><span><FileSpreadsheet size={17}/> Spreadsheet — rows, columns, simple formulas</span><span><FileText size={17}/> Docs — headings, text, lists and tables</span></div></div>:<>
     <div className="studio-editor-head"><div className="studio-editor-title"><button title="Back to files" className="studio-back" onClick={()=>setActiveId('')}><ChevronLeft size={17}/></button><input aria-label="Report file title" disabled={!editable} value={active.title} maxLength={100} onChange={e=>persist(f=>({...f,title:e.target.value}))}/><div className="studio-file-meta">{active.kind==='sheet'?'Spreadsheet':'Document'} · {active.sourceName} ({active.sourceCount} source records) · {active.status}</div></div><div className="studio-header-buttons"><button className="button button-secondary" onClick={duplicate}><FilePlus2 size={15}/> Duplicate</button>{active.kind==='sheet'&&<button className="button button-secondary" onClick={turnSheetIntoDoc}><FileText size={15}/> Turn Into Doc</button>}<button className="button button-secondary" onClick={exportFile}><Download size={15}/> Export {active.kind==='sheet'?'CSV':'Word .doc'}</button><button className="button button-secondary" onClick={()=>printStudio(documentHtml,active.title)}><Printer size={15}/> Print / PDF</button></div></div>
     <div className={`studio-status studio-status-${active.status.toLowerCase().replace(/\s+/g,'-')}`}><ClipboardCheck size={17}/><div><strong>{issueSummary}</strong><small>Creator: {active.ownerName} · Branch: {active.branch} · Updated: {new Date(active.updatedAt).toLocaleString('en-PH')}</small>{active.reviewNote&&<small>Review note: {active.reviewNote}</small>}</div></div>
     {active.kind==='sheet'?<>
       <div className="studio-sheet-tools"><div className="studio-cell-ref">{colName(selected[1])}{selected[0]+1}</div><input aria-label="Formula bar" disabled={!editable} placeholder="Type a value or =SUM(A2:A10)" value={formula} onChange={e=>{setFormula(e.target.value);setCell(selected[0],selected[1],e.target.value)}}/><span className="studio-calc-preview">{active.rows[selected[0]]?.[selected[1]]?.startsWith('=')?displayCell(active.rows,selected[0],selected[1]):''}</span><button className="button button-secondary button-small" disabled={!editable||active.rows.length>=SHEET_MAX_ROWS} onClick={addRow}><Plus size={13}/> Row</button><button className="button button-secondary button-small" disabled={!editable||active.rows[0]?.length>=SHEET_MAX_COLS} onClick={addColumn}><Plus size={13}/> Column</button></div>
       <div className="studio-sheet-scroller"><table className="studio-grid"><thead><tr><th className="studio-corner">#</th>{active.rows[0]?.map((_,c)=><th key={c}>{colName(c)}</th>)}</tr></thead><tbody>{active.rows.map((row,r)=><tr key={r}><th>{r+1}</th>{row.map((value,c)=><td key={`${r}:${c}`} className={`${r===0?'studio-grid-header':''} ${selected[0]===r&&selected[1]===c?'studio-grid-selected':''}`}><input aria-label={`Cell ${colName(c)}${r+1}`} disabled={!editable} value={selected[0]===r&&selected[1]===c?value:displayCell(active.rows,r,c)} onFocus={()=>{setSelected([r,c]);setFormula(value)}} onChange={e=>setCell(r,c,e.target.value)}/></td>)}</tr>)}</tbody></table></div>
       <div className="studio-sheet-foot"><span><FileSpreadsheet size={15}/> Sheet 1</span><small>Formulas: =A2+B2, =SUM(C2:C9), =AVERAGE(...), =MIN(...), =MAX(...), =COUNT(...). Export calculates values.</small></div>
      </>:<><div className="studio-doc-tools"><span className="studio-doc-label">Document formatting</span>{[{cmd:'bold',label:'B',title:'Bold'},{cmd:'italic',label:'I',title:'Italic'},{cmd:'underline',label:'U',title:'Underline'},{cmd:'insertUnorderedList',label:'• List',title:'Bullet list'},{cmd:'insertOrderedList',label:'1. List',title:'Numbered list'},{cmd:'formatBlock',value:'H1',label:'H1',title:'Heading 1'},{cmd:'formatBlock',value:'H2',label:'H2',title:'Heading 2'},{cmd:'formatBlock',value:'P',label:'¶',title:'Normal text'}].map(tool=><button key={`${tool.cmd}-${tool.label}`} className="studio-format-btn" title={tool.title} disabled={!editable} onMouseDown={e=>e.preventDefault()} onClick={()=>{document.execCommand(tool.cmd,false,tool.value);const el=document.querySelector('.studio-document-page');if(el)persist(f=>({...f,html:sanitizeHtml(el.innerHTML)}));}}>{tool.label}</button>)}<small>Type and format directly on the page.</small></div><div className="studio-doc-canvas"><DocumentCanvas key={active.id} id={active.id} html={active.html} readOnly={!editable} onChange={html=>persist(f=>({...f,html}))}/></div></>}
     <div className="studio-actions"><span><Save size={15}/> Auto-saved in this browser</span><div>{editable&&<button className="button button-primary" onClick={submit}><Send size={15}/> Submit for Admin Review</button>}{reviewing&&<><button className="button button-secondary" onClick={()=>review(false)}><RotateCcw size={15}/> Request Changes</button><button className="button button-primary" onClick={()=>review(true)}><CheckCircle2 size={15}/> Approve & Lock</button></>}{active.ownerId===userId&&active.status==='Draft'&&<button className="button button-danger" onClick={remove}><Trash2 size={15}/> Delete Draft</button>}</div></div>
    </>}
   </div>
  </div>
  {(message||storageError)&&<div className={`studio-message ${storageError?'studio-error':''}`}>{storageError||message}<button aria-label="Dismiss message" onClick={()=>{setMessage('');setStorageError('')}}><X size={14}/></button></div>}
  <p className="studio-warning"><Lock size={14}/> Frontend prototype: localStorage permissions and approvals can be bypassed by someone with browser access. These are editable reporting copies, not trusted accounting evidence. Use backend roles, immutable snapshots, and audited approvals for production.</p>
 </section>;
}
