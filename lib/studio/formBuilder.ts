/** Template-driven browser-only employee form generation. No HRMS mutations. */
import type {HRPerson} from "../hrState";
import type {MergeContext,MergePreview} from "./mergePreview";
import {previewMerge,missingMergeFields} from "./mergePreview";
import {autoValues,tokens} from "./variables";
import type {StudioFormField} from "./types";

const safeKey=/^[a-z][a-z0-9_]{1,39}$/;
const validMappings=new Set<string>(tokens.filter(t=>t.startsWith("employee.")||t.startsWith("document.")||t.startsWith("company.")));
export const tokenForField=(field:Pick<StudioFormField,"key">)=>`custom.${field.key}`;
export function validateFormFields(fields:StudioFormField[]){
 if(!Array.isArray(fields)||fields.length>30)throw Error("Maximum 30 form fields per template.");
 const seen=new Set<string>();
 for(const field of fields){
  if(!field.id||!safeKey.test(field.key)||!field.label.trim()||field.label.length>80)throw Error("Each field needs a valid key (2–40 characters) and label.");
  if(seen.has(field.key))throw Error(`Duplicate form field: ${field.key}`);
  seen.add(field.key);
  if(!["text","number","date","select"].includes(field.inputType))throw Error(`Unsupported field type: ${field.label}`);
  if(field.mapping&&!validMappings.has(field.mapping))throw Error(`Unsupported HRMS mapping for ${field.label}`);
  if(field.inputType==="select"&&(!field.options?.length||field.options.length>20||field.options.some(s=>!s.trim()||s.length>80)||new Set(field.options).size!==field.options.length))throw Error(`Provide 1–20 unique options for ${field.label}`);
  if(field.defaultValue&&field.defaultValue.length>500)throw Error(`Default value too long for ${field.label}`);
 }
}
export function fieldValueError(field:StudioFormField,value:string):string|null{
 const v=value.trim();
 if(!v)return field.required?`${field.label}: required`:null;
 if(field.inputType==="number"&&(!Number.isFinite(Number(v))))return `${field.label}: enter a valid number`;
 if(field.inputType==="date"&&!/^\d{4}-\d{2}-\d{2}$/.test(v))return `${field.label}: use YYYY-MM-DD`;
 if(field.inputType==="date"){const timestamp=Date.parse(`${v}T00:00:00Z`);if(!Number.isFinite(timestamp)||new Date(timestamp).toISOString().slice(0,10)!==v)return `${field.label}: invalid date`;}
 if(field.inputType==="select"&&!field.options?.includes(v))return `${field.label}: choose an allowed option`;
 return null;
}
export function formValues(fields:StudioFormField[],person:HRPerson,manual:Record<string,string>,context?:MergeContext){
 const base=autoValues(person,{},context);
 const values:Record<string,string>={};const problems:string[]=[];
 for(const field of fields){
  const key=tokenForField(field);
  const value=field.mapping?(base[field.mapping]||""):(manual[key]??field.defaultValue??"");
  values[key]=value;
  const problem=fieldValueError(field,value);
  if(problem)problems.push(problem);
 }
 return {values,problems};
}
export function preflightFormBatch(html:string,people:HRPerson[],manual:Record<string,string>,fields:StudioFormField[],context?:MergeContext){
 validateFormFields(fields);
 if(!people.length||people.length>100)throw Error("Choose 1–100 employees.");
 if(new Set(people.map(x=>x.id)).size!==people.length)throw Error("Duplicate employee selection.");
 const previews:MergePreview[]=people.map(person=>{
  const resolved=formValues(fields,person,manual,context);
  // Never allow a manual custom field to overwrite Employee 201 core values.
  const safeManual=Object.fromEntries(Object.entries(manual).filter(([key])=>key.startsWith("custom.")||key==="document.reference"));
  const custom={...safeManual,...resolved.values};
  // Optional empty form placeholders are intentionally blank, not missing errors.
  let outputHtml=html;
  for(const field of fields){const key=tokenForField(field);if(!field.required&&!resolved.values[key]?.trim())outputHtml=outputHtml.replaceAll(`{{${key}}}`,"");}
  const preview=previewMerge(outputHtml,person,custom,context);
  const base=autoValues(person,custom,context);
  return {...preview,missing:[...new Set([...missingMergeFields(outputHtml,base),...resolved.problems])]};
 });
 return {previews,ready:previews.every(x=>!x.missing.length),missing:previews.filter(x=>x.missing.length)};
}
/** Appends only genuinely new placeholders; never duplicates a field in a Docs template. */
export function withFormPlaceholders(html:string,fields:StudioFormField[]){
 let out=html;
 for(const field of fields){
  const marker=`{{${tokenForField(field)}}}`;
  if(!out.includes(marker)){
   const label=field.label.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
   out+=`<p><strong>${label}:</strong> ${marker}</p>`;
  }
 }
 return out;
}
