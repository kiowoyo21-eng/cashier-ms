import type {PdfField} from "./types";

/** Coordinate and required-field checks for a browser-only PDF form designer. */
export const bound=(value:number,min=0,max=1)=>Number.isFinite(value)?Math.max(min,Math.min(max,value)):min;
export function placeField(field:PdfField,x:number,y:number):PdfField{
 const width=bound(field.width,0.02,1),height=bound(field.height,0.015,1);
 return {...field,width,height,x:bound(x,0,1-width),y:bound(y,0,1-height)};
}
export type PdfAnnotationRect={fieldName?:string;fieldType?:string;rect?:number[]};
export type PdfViewport={width:number;height:number;convertToViewportRectangle:(rect:number[])=>number[]};
/** PDF.js handles page crop, rotation and bottom-left -> top-left conversion. */
export function annotationPlacement(annotation:PdfAnnotationRect,viewport:PdfViewport){
 if(!annotation.rect||annotation.rect.length!==4||!viewport.width||!viewport.height)return null;
 const coordinates=viewport.convertToViewportRectangle(annotation.rect);
 if(coordinates.length!==4||coordinates.some(n=>!Number.isFinite(n)))return null;
 const [x1,y1,x2,y2]=coordinates;
 const width=bound(Math.abs(x2-x1)/viewport.width,0.02,1);
 const height=bound(Math.abs(y2-y1)/viewport.height,0.015,1);
 return {x:bound(Math.min(x1,x2)/viewport.width,0,1-width),y:bound(Math.min(y1,y2)/viewport.height,0,1-height),width,height};
}
export function pdfValue(field:PdfField,values:Record<string,string>,manual:Record<string,string>){
 return field.mapping ? (values[field.mapping]||field.defaultValue||"") : (manual[field.id]??field.defaultValue??"");
}
export const checkedValue=(value:string)=>!!value.trim()&&!new Set(["no","false","0","off","unchecked"]).has(value.trim().toLowerCase());
export function preflightPdfFields(fields:PdfField[],pages:number,values:Record<string,string>,manual:Record<string,string>){
 const errors:string[]=[];
 const ids=new Set<string>(),sources=new Set<string>();
 for(const f of fields){
  if(ids.has(f.id))errors.push(`Duplicate field ID: ${f.label}`);ids.add(f.id);
  if(f.sourceName){if(sources.has(f.sourceName))errors.push(`Duplicate PDF source mapping: ${f.sourceName}`);sources.add(f.sourceName)}
  if(!Number.isInteger(f.page)||f.page<1||f.page>pages)errors.push(`${f.label}: invalid PDF page`);
  if(!Number.isFinite(f.x)||!Number.isFinite(f.y)||!Number.isFinite(f.width)||!Number.isFinite(f.height)||f.x<0||f.y<0||f.width<=0||f.height<=0||f.x+f.width>1.001||f.y+f.height>1.001)errors.push(`${f.label}: field extends beyond page`);
  const value=pdfValue(f,values,manual);
  if(f.required&&!value.trim())errors.push(`${f.label}: required value missing`);
  if(value&&/[^\u0020-\u007e\u00a0-\u00ff]/.test(value))errors.push(`${f.label}: contains characters unsupported by the standard PDF font`);
 }
 return errors;
}
