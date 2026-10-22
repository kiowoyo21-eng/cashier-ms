"use client";
import {useEffect,useRef,useState} from "react";
import {Plus,Save,Trash2,X,ExternalLink} from "lucide-react";
import type {StudioActor,StudioFormField,StudioItem} from "../../lib/studio/types";
import {saveStudioFormFields} from "../../lib/studio/store";
import {validateFormFields,tokenForField} from "../../lib/studio/formBuilder";
import {variableGroups} from "../../lib/studio/variables";

const mappingGroups=Object.entries(variableGroups).filter(([group])=>group!=="Custom fields");
function newField(fields:StudioFormField[]):StudioFormField{
 let n=1;while(fields.some(f=>f.key===`field_${n}`))n++;
 return {id:`form-${Date.now()}-${n}`,key:`field_${n}`,label:`Field ${n}`,mapping:"",inputType:"text",required:true,options:[],defaultValue:""};
}
export default function FormBuilder({actor,item,onSaved,onClose}:{actor:StudioActor;item:StudioItem;onSaved:()=>void;onClose:()=>void}){
 const sectionRef=useRef<HTMLElement>(null);
 useEffect(()=>{sectionRef.current?.scrollIntoView({behavior:"smooth",block:"start"})},[item.id]);
 const [rows,setRows]=useState<StudioFormField[]>(()=>item.formFields?.map(x=>({...x,options:[...x.options]}))||[]);
 const [error,setError]=useState("");
 const [busy,setBusy]=useState(false);
 function update(id:string,patch:Partial<StudioFormField>){setRows(prev=>prev.map(x=>x.id===id?{...x,...patch}:x))}
 function save(){if(busy)return;setBusy(true);try{
  const clean=rows.map(row=>({...row,key:row.key.trim().toLowerCase(),label:row.label.trim(),mapping:row.mapping.trim(),options:row.inputType==="select"?row.options:[],defaultValue:row.defaultValue.trim()}));
  validateFormFields(clean);
  saveStudioFormFields(actor,item.id,clean,item.version);
  onSaved();
 }catch(e){setError(e instanceof Error?e.message:String(e))}finally{setBusy(false)}}
 return <section ref={sectionRef} className="studio-form-builder" aria-label="Custom form builder"><div className="studio-form-head"><div><h2>Custom Form Builder — {item.title}</h2><p>Define fields once; Employee 201 mappings auto-fill while manual fields appear during generation. Only Super Admin can save a source template schema.</p></div><button type="button" className="studio-secondary" onClick={onClose}><X size={16}/> Close</button></div>
 <p className="studio-form-alert"><strong>Approval protection:</strong> Saving fields creates a new version and returns this template to <b>Draft</b>. Review in Docs and approve again before HR uses it.</p>
 {rows.map((field,i)=><div className="studio-form-row" key={field.id}><div className="studio-form-row-head"><b>Field {i+1}</b><code>{`{{${tokenForField(field)}}}`}</code><button type="button" className="studio-secondary" onClick={()=>setRows(prev=>prev.filter(x=>x.id!==field.id))} aria-label={`Remove ${field.label}`}><Trash2 size={15}/> Remove</button></div>
 <div className="studio-form-columns"><label>Field label<input value={field.label} maxLength={80} onChange={e=>update(field.id,{label:e.target.value})}/></label><label>Field key<input value={field.key} maxLength={40} pattern="[a-z][a-z0-9_]*" onChange={e=>update(field.id,{key:e.target.value.toLowerCase().replace(/[^a-z0-9_]/g,"")})}/></label><label>Input type<select value={field.inputType} onChange={e=>update(field.id,{inputType:e.target.value as StudioFormField["inputType"]})}><option value="text">Text</option><option value="number">Number</option><option value="date">Date (YYYY-MM-DD)</option><option value="select">Dropdown</option></select></label><label>Employee 201 / HRMS mapping<select value={field.mapping} onChange={e=>update(field.id,{mapping:e.target.value})}><option value="">Manual input</option>{mappingGroups.map(([group,values])=><optgroup label={group} key={group}>{values.map(key=><option key={key} value={key}>{key}</option>)}</optgroup>)}</select></label></div>
 <div className="studio-form-columns"><label>Default manual value<input value={field.defaultValue} disabled={!!field.mapping} onChange={e=>update(field.id,{defaultValue:e.target.value})} maxLength={500}/></label>{field.inputType==="select"&&<label>Allowed dropdown values (comma separated)<input value={field.options.join(", ")} onChange={e=>update(field.id,{options:e.target.value.split(",").map(s=>s.trim()).filter(Boolean)})}/></label>}<label className="studio-form-required"><input type="checkbox" checked={field.required} onChange={e=>update(field.id,{required:e.target.checked})}/> Required for generation</label></div>
 </div>)}
 {!rows.length&&<p className="studio-muted">No configured form fields. You can still use the existing Docs placeholders. Add a field to build an auto-fill form.</p>}
 {error&&<p role="alert" className="studio-message">{error}</p>}
 <div className="studio-form-actions"><button className="studio-secondary" type="button" disabled={rows.length>=30} onClick={()=>setRows(x=>[...x,newField(x)])}><Plus size={16}/> Add field</button><a href={`/docs/${item.id}`} target="_blank" rel="noopener noreferrer" className="studio-secondary"><ExternalLink size={15}/> Open Docs editor</a><button className="studio-primary" type="button" disabled={busy} onClick={save}><Save size={16}/> Save field mapping</button></div>
 <small>New placeholder fields are appended to the template if not already present. Removing fields also clears their placeholders; review the resulting document layout in Docs.</small>
 </section>;
}
