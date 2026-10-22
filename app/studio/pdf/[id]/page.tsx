"use client";
import {isHrRole} from "../../../../lib/mock";
import Link from "next/link";
import {useParams} from "next/navigation";
import {useEffect,useRef,useState} from "react";
import {PDFDocument,StandardFonts,rgb,PDFTextField,PDFCheckBox,PDFDropdown} from "pdf-lib";
import {HRProvider,useHR} from "../../../../lib/hrState";
import {getPdf,saveBlob} from "../../../../lib/studio/pdfAssets";
import {storePdfOutput} from "../../../../lib/studio/pdfOutputs";
import {annotationPlacement,placeField,pdfValue,checkedValue,preflightPdfFields} from "../../../../lib/studio/pdfFormTools";
import {requestDocumentEdit,canEdit,currentRequest,saveStudioItem} from "../../../../lib/studio/store";
import {autoValues,tokens} from "../../../../lib/studio/variables";
import type {StudioItem,PdfField,StudioState,StudioActor} from "../../../../lib/studio/types";
import StudioGate from "../../../../components/studio/StudioGate";
import {FileType2, ChevronLeft,ChevronRight,Save,FileDown,ZoomIn,ZoomOut,Plus,Trash2,Lock,LockOpen,MousePointer2,Check,ShieldCheck,Printer,FileCheck2,Copy} from "lucide-react";
const uid=()=>typeof crypto!=="undefined"&&"randomUUID" in crypto?crypto.randomUUID():String(Date.now()+Math.random());
export default function PdfEditorPage(){const id=String(useParams<{id:string}>().id);return <HRProvider><StudioGate>{s=><PdfEditor key={id} id={id} actor={s.actor!} state={s.state} refresh={s.refresh}/>}</StudioGate></HRProvider>}
function PdfEditor({id,actor,state,refresh}:{id:string;actor:StudioActor;state:StudioState;refresh:()=>void}){
 const {data}=useHR();const item=state.items.find(i=>i.id===id&&i.kind==="pdf");const [buffer,setBuffer]=useState<ArrayBuffer|null>(null),[templateStatus,setTemplateStatus]=useState(item?.status||"Draft"),[error,setError]=useState(""),[page,setPage]=useState(1),[pages,setPages]=useState(1),[scale,setScale]=useState(1.1),[fields,setFields]=useState<PdfField[]>(item?.fields||[]),[selected,setSelected]=useState<string|null>(null),[adding,setAdding]=useState(false),[dirty,setDirty]=useState(false),[employeeId,setEmployeeId]=useState(""),[custom,setCustom]=useState<Record<string,string>>({}),[manualInputs,setManualInputs]=useState<Record<string,string>>({}),[requesting,setRequesting]=useState(false),[reason,setReason]=useState(""),[clock,setClock]=useState(Date.now()),[missing,setMissing]=useState(false),[flatten,setFlatten]=useState(true),[title,setTitle]=useState(item?.title||"PDF form");
 const pdfCanvas=useRef<HTMLCanvasElement>(null),container=useRef<HTMLDivElement>(null),pageView=useRef<{width:number;height:number}>({width:0,height:0}),revisionRef=useRef(item?.version||1),busy=useRef(false);
 const granted=!!item&&canEdit(state,actor,id,clock);const req=currentRequest(state,actor,id);
 const person=data.people.find(p=>p.id===employeeId)||null;const values=autoValues(person,custom,{rates:data.rates,rateChanges:data.payrollConfig?.rateChanges});const current=fields.find(f=>f.id===selected);const customTokens=[...new Set(fields.map(f=>f.mapping).filter(token=>token.startsWith("custom.")||token==="document.reference"))];
 useEffect(()=>{const t=setInterval(()=>setClock(Date.now()),5000);return()=>clearInterval(t)},[]);
 useEffect(()=>{let live=true;getPdf(id).then(async b=>{if(!live)return;if(!b)throw Error("Original PDF file was not found in this browser. Re-import the PDF.");setBuffer(b);const doc=await PDFDocument.load(b,{ignoreEncryption:false});if(!live)return;setPages(doc.getPageCount());const originals=doc.getForm().getFields();if(!fields.length&&originals.length){setError(`Detected ${originals.length} existing PDF form fields. Click ‘Import existing fields’ to map them.`)}}).catch(e=>{if(live)setError(String(e))});return()=>{live=false}},[id]);
 useEffect(()=>{if(!buffer)return;let disposed=false;let task:{cancel:()=>void;promise:Promise<unknown>}|undefined;async function draw(){try{const pdfjs=await import("pdfjs-dist");pdfjs.GlobalWorkerOptions.workerSrc=new URL("pdfjs-dist/build/pdf.worker.min.mjs",import.meta.url).toString();const pdf=await pdfjs.getDocument({data:new Uint8Array(buffer!.slice(0))}).promise;const p=await pdf.getPage(page);const v=p.getViewport({scale});pageView.current={width:v.width,height:v.height};const canvas=pdfCanvas.current;if(!canvas||disposed)return;const ctx=canvas.getContext("2d");if(!ctx)return;const ratio=Math.min(window.devicePixelRatio||1,2);canvas.width=Math.round(v.width*ratio);canvas.height=Math.round(v.height*ratio);canvas.style.width=v.width+"px";canvas.style.height=v.height+"px";ctx.setTransform(ratio,0,0,ratio,0,0);const activeTask=p.render({canvasContext:ctx,viewport:v});task=activeTask;await activeTask.promise;if(!disposed)setError("")}catch(e){if(!disposed&&!(e instanceof Error&&e.name==="RenderingCancelledException"))setError(`PDF preview error: ${String(e)}`)}}void draw();return()=>{disposed=true;task?.cancel()}},[buffer,page,scale]);
 useEffect(()=>{if(item&&item.version!==revisionRef.current&&!dirty){revisionRef.current=item.version;setFields(item.fields||[]);setTitle(item.title);setTemplateStatus(item.status)}},[item?.version,dirty]);
 const status=(s:string)=>setError(s);
 function editFields(newFields:PdfField[]){if(!granted){status("Editing locked. Request approval first.");return}setFields(newFields);setDirty(true)}
 function patchField(id:string,patch:Partial<PdfField>){editFields(fields.map(f=>f.id===id?placeField({...f,...patch},f.x,f.y):f))}
 function newField(x:number,y:number){if(!granted)return;const f:PdfField=placeField({id:uid(),page,label:"New field",mapping:"",type:"text",x:0,y:0,width:.26,height:.037,fontSize:11,required:false,defaultValue:""},x,y);editFields([...fields,f]);setSelected(f.id);setAdding(false)}
 function clickCanvas(e:React.MouseEvent<HTMLDivElement>){if(!adding||!granted||!container.current)return;const r=container.current.getBoundingClientRect();newField((e.clientX-r.left)/r.width,(e.clientY-r.top)/r.height)}
 function dragField(e:React.PointerEvent<HTMLButtonElement>,f:PdfField){if(!granted||!container.current)return;e.preventDefault();e.stopPropagation();setSelected(f.id);const rect=container.current.getBoundingClientRect();const start={x:e.clientX,y:e.clientY,oldX:f.x,oldY:f.y};const move=(ev:PointerEvent)=>{setFields(prev=>prev.map(x=>x.id===f.id?placeField(x,start.oldX+(ev.clientX-start.x)/rect.width,start.oldY+(ev.clientY-start.y)/rect.height):x));setDirty(true)};const end=()=>{window.removeEventListener("pointermove",move);window.removeEventListener("pointerup",end)};window.addEventListener("pointermove",move);window.addEventListener("pointerup",end)}
 async function importExisting(){
  if(!buffer||!granted)return;
  try{
   const doc=await PDFDocument.load(buffer),originals=doc.getForm().getFields();
   const pdfjs=await import("pdfjs-dist");
   pdfjs.GlobalWorkerOptions.workerSrc=new URL("pdfjs-dist/build/pdf.worker.min.mjs",import.meta.url).toString();
   const rendered=await pdfjs.getDocument({data:new Uint8Array(buffer.slice(0))}).promise;
   const locations=new Map<string,{page:number;x:number;y:number;width:number;height:number}>();
   for(let n=1;n<=rendered.numPages;n++){
    const pdfPage=await rendered.getPage(n),viewport=pdfPage.getViewport({scale:1});
    const annotations=await pdfPage.getAnnotations({intent:"display"}) as unknown as Array<{fieldName?:string;rect?:number[]}>;
    for(const a of annotations){if(!a.fieldName||locations.has(a.fieldName))continue;
     const position=annotationPlacement(a,viewport);if(position)locations.set(a.fieldName,{page:n,...position});
    }
   }
   const added:PdfField[]=[];
   for(const original of originals){
    if(fields.some(f=>f.sourceName===original.getName())||added.some(f=>f.sourceName===original.getName()))continue;
    if(!(original instanceof PDFTextField||original instanceof PDFCheckBox||original instanceof PDFDropdown))continue;
    const location=locations.get(original.getName());
    added.push({id:uid(),page:location?.page??1,label:original.getName(),mapping:"",type:original instanceof PDFCheckBox?"checkbox":"text",x:location?.x??.1,y:location?.y??.12,width:location?.width??.3,height:location?.height??.035,fontSize:11,required:false,defaultValue:"",sourceName:original.getName()});
   }
   editFields([...fields,...added]);
   status(`Imported ${added.length} supported field mapping(s). ${added.filter(f=>!locations.has(f.sourceName||"")).length} lacked position metadata; review them before saving. Unsupported radio/signature widgets are not imported.`);
  }catch(e){status(e instanceof Error?e.message:String(e))}
 }
 function save(){
  if(!item)return;
  if(!granted)return status("Approval expired. You cannot save changes.");
  const materialChange=JSON.stringify(fields)!==JSON.stringify(item.fields||[])||title.trim()!==item.title;
  const nextStatus=item.status==="Approved Template"&&materialChange?"Draft":templateStatus;
  try{
   const errors=preflightPdfFields(fields,pages,values,manualInputs).filter(e=>!e.includes("required value missing"));
   if(errors.length)throw Error(errors.join("; "));
   saveStudioItem(actor,id,{title,fields,status:actor.role==="Super Admin"?nextStatus:undefined},revisionRef.current);
   revisionRef.current++;setDirty(false);setTemplateStatus(nextStatus);refresh();
   status(nextStatus==="Draft"&&item.status==="Approved Template"?"PDF map saved. Material changes reset template approval to Draft; Super Admin must reapprove.":`Saved PDF field map v${revisionRef.current}.`);
  }catch(e){status(e instanceof Error?e.message:String(e))}
 }
 function getValue(f:PdfField){return pdfValue(f,values,manualInputs)}
 async function exportPdf(){
  if(!buffer||!item||busy.current)return;
  if(dirty)return status("Save PDF field map changes before generating an output.");
  if(isHrRole(actor.role)&&item.status!=="Approved Template")return status("This PDF template has not been approved for HR generation.");
  const validation=preflightPdfFields(fields,pages,values,manualInputs);
  if(validation.length){setMissing(true);return status(`PDF preflight: ${validation.slice(0,6).join("; ")}`)}
  busy.current=true;
  try{
   const pdf=await PDFDocument.load(buffer),font=await pdf.embedFont(StandardFonts.Helvetica),form=pdf.getForm();
   const originals=new Map(form.getFields().map(field=>[field.getName(),field]));
   for(const field of fields){
    const text=getValue(field),original=field.sourceName?originals.get(field.sourceName):undefined;
    if(field.sourceName&&!original)throw Error(`Original PDF field not found: ${field.sourceName}`);
    if(original){
     if(original instanceof PDFTextField)original.setText(text);
     else if(original instanceof PDFCheckBox)checkedValue(text)?original.check():original.uncheck();
     else if(original instanceof PDFDropdown){if(text)original.select(text);else original.clear()}
     else throw Error(`Unsupported original PDF form field: ${field.sourceName}`);
     continue;
    }
    const pdfPage=pdf.getPages()[field.page-1];
    if(!pdfPage)throw Error(`Missing page for field: ${field.label}`);
    const {width,height}=pdfPage.getSize();
    const x=field.x*width,y=height-(field.y+field.height)*height;
    const w=field.width*width,h=field.height*height;
    if(!flatten){
     const name=`hrms.${field.id.replace(/[^a-zA-Z0-9_-]/g,"_")}`;
     if(field.type==="checkbox"){
      const checkbox=form.createCheckBox(name);checkbox.addToPage(pdfPage,{x,y,width:w,height:h});if(checkedValue(text))checkbox.check();
     }else{
      const textField=form.createTextField(name);textField.addToPage(pdfPage,{x,y,width:w,height:h,font});textField.setFontSize(Math.min(28,Math.max(6,field.fontSize)));textField.setText(text);
     }
    }else if(field.type==="checkbox"){
     if(checkedValue(text))pdfPage.drawText("X",{x,y,size:Math.max(8,field.fontSize),font,color:rgb(0,0,0)});
    }else if(text){
     pdfPage.drawText(text,{x,y,size:Math.min(field.fontSize,28),font,color:rgb(0,0,0),maxWidth:Math.max(15,w),lineHeight:Math.min(field.fontSize,28)+2});
    }
   }
   if(flatten&&form.getFields().length)form.flatten();
   const bytes=new Uint8Array(await pdf.save());
   const filename=`${item.title.replace(/[^\w\- ]+/g,"_")}${person?`-${person.id}`:""}.pdf`;
   const saved=await storePdfOutput(actor,id,{title:filename,employeeId:person?.id||"",employeeName:person?.name||"Manual form"},bytes);
   saveBlob(new Blob([bytes],{type:"application/pdf"}),filename);
   status(`PDF saved to Document Library (copy ${saved.id}) and downloaded. Verify layout before use.`);
  }catch(e){status(e instanceof Error?e.message:"PDF export failed.")}
  finally{busy.current=false}
 }
 if(!item)return <main className="studio-gate"><h1>PDF not found</h1><Link href="/studio">Return to Studio</Link></main>;
 return <div className="pdf-app"><header className="pdf-top"><div className="pdf-top-brand"><Link href="/studio" title="Return to library"><ChevronLeft size={22}/></Link><FileType2 size={23}/><input aria-label="PDF title" disabled={!granted} value={title} onChange={e=>{setTitle(e.target.value);setDirty(true)}}/></div><div className="pdf-top-actions"><span className={granted?"doc-grant":"doc-locked"}>{granted?<LockOpen size={15}/>:<Lock size={15}/>} {granted?"Editing approved":"View only"}</span><button disabled={!granted||!dirty} onClick={save}><Save size={17}/> Save field map</button><button className="studio-primary" disabled={!buffer} onClick={()=>void exportPdf()}><FileDown size={17}/> Generate PDF</button></div></header>
 <div className="pdf-tools"><button disabled={!granted} onClick={()=>setAdding(x=>!x)} className={adding?"active":""}><Plus size={17}/> {adding?"Click page to place field":"Add fillable field"}</button><button disabled={!granted||!buffer} onClick={()=>void importExisting()}><FileCheck2 size={17}/> Import existing fields</button><div className="pdf-tool-spacer"/><button onClick={()=>setScale(v=>Math.max(.5,+(v-.15).toFixed(2)))}><ZoomOut size={17}/></button><span>{Math.round(scale*100)}%</span><button onClick={()=>setScale(v=>Math.min(2.5,+(v+.15).toFixed(2)))}><ZoomIn size={17}/></button><button disabled={page<=1} onClick={()=>setPage(x=>x-1)}><ChevronLeft size={17}/></button><span>Page {page} / {pages}</span><button disabled={page>=pages} onClick={()=>setPage(x=>x+1)}><ChevronRight size={17}/></button></div>
 <main className="pdf-content"><aside className="pdf-left"><h3>Pages & fields</h3>{Array.from({length:pages},(_,i)=><button key={i} onClick={()=>setPage(i+1)} className={page===i+1?"current":""}><FileType2 size={17}/> Page {i+1}<small>{fields.filter(f=>f.page===i+1).length} fields</small></button>)}<div className="pdf-field-list"><b>Fields on page {page}</b>{fields.filter(f=>f.page===page).map(f=><button key={f.id} className={selected===f.id?"current":""} onClick={()=>setSelected(f.id)}>{f.label}<small>{f.mapping||"Manual value"}</small></button>)}</div></aside>
 <section className="pdf-canvas-area">{error&&<div role="status" className="studio-message">{error}</div>}{!buffer?<div className="studio-gate">Loading PDF…</div>:<div className={`pdf-page-wrap ${adding?"placing":""}`} ref={container} onClick={clickCanvas}><canvas ref={pdfCanvas}/>{fields.filter(f=>f.page===page).map(f=><button type="button" key={f.id} onPointerDown={e=>dragField(e,f)} onClick={e=>{e.stopPropagation();setSelected(f.id)}} className={`pdf-field-overlay ${selected===f.id?"selected":""} ${!granted?"locked":""}`} style={{left:`${f.x*100}%`,top:`${f.y*100}%`,width:`${f.width*100}%`,height:`${f.height*100}%`}}><span>{getValue(f)||f.label}</span></button>)}</div>}<p className="studio-muted">PDF form designer • fields are positioned over the original PDF. Browser-only mapping; official source PDF remains unchanged.</p></section>
 <aside className="pdf-right">{actor.role==="Super Admin"&&<label className="studio-field">Template status<select disabled={!granted} value={templateStatus} onChange={e=>{setTemplateStatus(e.target.value as StudioItem["status"]);setDirty(true)}}><option>Draft</option><option>Approved Template</option><option>Archived</option></select></label>}<h3>Auto-fill data</h3><label className="studio-field">Employee 201<select value={employeeId} onChange={e=>setEmployeeId(e.target.value)}><option value="">Choose employee…</option>{data.people.map(p=><option key={p.id} value={p.id}>{p.id} · {p.name}</option>)}</select></label><p className="studio-muted">Source employee records are read-only. HRMS data is merged only into generated PDF output.</p><h3>Fill this copy</h3><p className="studio-muted">Enter manual values for this output. Employee 201 mapped values remain read-only and the source template is unchanged.</p><div className="pdf-generation-inputs">{customTokens.map(token=><label key={token}>{token}<input value={custom[token]??""} onChange={e=>setCustom(v=>({...v,[token]:e.target.value}))}/></label>)}{fields.filter(f=>!f.mapping).map(f=><label key={f.id}>{f.label}{f.required?" *":""} (page {f.page})<input value={manualInputs[f.id]??f.defaultValue} onChange={e=>setManualInputs(x=>({...x,[f.id]:e.target.value}))}/></label>)}{!fields.some(f=>!f.mapping)&&!customTokens.length&&<p className="studio-muted">All fields use Employee 201 mappings.</p>}</div><h3>Selected field</h3>{current?<div className="pdf-properties"><label>Label<input disabled={!granted} value={current.label} onChange={e=>patchField(current.id,{label:e.target.value})}/></label><label>Type<select disabled={!granted} value={current.type} onChange={e=>patchField(current.id,{type:e.target.value as PdfField["type"]})}><option value="text">Text</option><option value="date">Date</option><option value="checkbox">Checkbox</option><option value="signature">Signature / printed name</option></select></label><label>HRMS data mapping<select disabled={!granted} value={current.mapping} onChange={e=>patchField(current.id,{mapping:e.target.value})}><option value="">Manual / default value</option>{tokens.map(v=><option key={v} value={v}>{v}</option>)}</select></label><label>Output value (this PDF only)<input value={current.mapping?getValue(current):manualInputs[current.id]??current.defaultValue} disabled={!!current.mapping} onChange={e=>setManualInputs(x=>({...x,[current.id]:e.target.value}))}/></label><label>Default value in template<input disabled={!granted||!!current.mapping} value={current.defaultValue} onChange={e=>patchField(current.id,{defaultValue:e.target.value})}/></label><label>Font size<input type="number" min={6} max={28} disabled={!granted} value={current.fontSize} onChange={e=>patchField(current.id,{fontSize:Number(e.target.value)||11})}/></label><label>Width (%)<input type="number" min={4} max={100} disabled={!granted} value={Math.round(current.width*100)} onChange={e=>patchField(current.id,{width:Number(e.target.value)/100})}/></label><label>Height (%)<input type="number" min={2} max={100} disabled={!granted} value={Math.round(current.height*100)} onChange={e=>patchField(current.id,{height:Number(e.target.value)/100})}/></label><label className="pdf-check"><input type="checkbox" disabled={!granted} checked={current.required} onChange={e=>patchField(current.id,{required:e.target.checked})}/> Required before PDF generation</label>{current.sourceName&&<small>Source field: {current.sourceName}</small>}<button disabled={!granted} onClick={()=>{editFields(fields.filter(f=>f.id!==current.id));setSelected(null)}}><Trash2 size={16}/> Delete field mapping</button></div>:<p className="studio-muted">Select a field, or click Add fillable field and place it anywhere on the page.</p>}
 <hr/><label className="pdf-check"><input type="checkbox" checked={flatten} onChange={e=>setFlatten(e.target.checked)}/> Flatten filled original form fields on export</label><p className="studio-muted">Printed-name signatures are not cryptographic digital signatures. Text overlays do not erase underlying PDF content.</p>
 {!granted&&isHrRole(actor.role)&&<div className="pdf-access"><Lock size={17}/><b>Editing locked</b><p>{req?.status==="pending"?"Awaiting Super Admin approval.":"Approval is required to change this PDF template."}</p><button disabled={req?.status==="pending"} onClick={()=>setRequesting(v=>!v)}>Request edit access</button>{requesting&&<><textarea value={reason} onChange={e=>setReason(e.target.value)} placeholder="Reason (min 12 characters)"/><button onClick={()=>{try{requestDocumentEdit(actor,id,reason);setRequesting(false);setReason("");refresh()}catch(e){status(String(e))}}}>Submit request</button></>}</div>}
 </aside></main></div>
}
