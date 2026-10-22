/** Deterministic document-merge preflight. Does not write HRMS or Studio records. */
import type {HRPerson,PremiumProfile} from "../hrState";
import type {PayRateChange} from "../payrollConfig";
import {autoValues,fillHtml,findTokens} from "./variables";

export type MergeContext={rates?:Record<string,PremiumProfile>;rateChanges?:PayRateChange[]};
export type MergePreview={employeeId:string;employeeName:string;html:string;missing:string[]};
export const missingMergeFields=(text:string,values:Record<string,string>)=>findTokens(text).filter(field=>!String(values[field]??"").trim());
export function previewMerge(templateHtml:string,employee:HRPerson,custom:Record<string,string>,context?:MergeContext):MergePreview{
 const values=autoValues(employee,custom,context);
 return {employeeId:employee.id,employeeName:employee.name,html:fillHtml(templateHtml,values),missing:missingMergeFields(templateHtml,values)};
}
export function preflightMergeBatch(templateHtml:string,employees:HRPerson[],custom:Record<string,string>,context?:MergeContext){
 if(!employees.length||employees.length>100)throw Error("Choose 1–100 employees.");
 if(new Set(employees.map(e=>e.id)).size!==employees.length)throw Error("An employee was selected more than once.");
 const previews=employees.map(p=>previewMerge(templateHtml,p,custom,context));
 return {previews,ready:previews.every(p=>!p.missing.length),missing:previews.filter(p=>p.missing.length)};
}
