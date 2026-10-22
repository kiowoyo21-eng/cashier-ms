/** Bounded, read-only search of the currently visible rows in one workbook sheet.
 * Mutations are returned as proposals only; spreadsheetStore enforces edit grants.
 */
import {columnLabel} from "./sheetFormulas";
export type SheetHit={row:number;col:number;ref:string;raw:string};
export type SheetSearchResult={hits:SheetHit[];truncated:boolean};
export function findSheetCells(rows:readonly number[],cols:number,read:(ref:string)=>string,query:string,caseSensitive=false,limit=500):SheetSearchResult{
 const needle=query.trim();if(!needle)return {hits:[],truncated:false};
 if(needle.length>100)throw Error("Search terms must be 100 characters or less.");
 const normalized=caseSensitive?needle:needle.toLocaleLowerCase();
 const hits:SheetHit[]=[];const width=Math.min(52,Math.max(0,Math.trunc(cols)));
 for(const row of rows){if(!Number.isInteger(row)||row<0||row>=4000)continue;
  for(let col=0;col<width;col++){
   const ref=`${columnLabel(col)}${row+1}`,raw=read(ref);
   const value=caseSensitive?raw:raw.toLocaleLowerCase();
   if(!value.includes(normalized))continue;
   if(hits.length>=limit)return {hits,truncated:true};
   hits.push({row,col,ref,raw});
  }
 }
 return {hits,truncated:false};
}
export function replaceSheetHits(hits:readonly SheetHit[],query:string,replacement:string,read:(ref:string)=>string,caseSensitive=false):{updates:{cell:string;value:string}[];skippedFormulas:number}{
 if(!query.trim()||query.length>100)throw Error("Enter a valid search term.");
 if(replacement.length>1500)throw Error("Replacement exceeds the cell character limit.");
 if(hits.length>2000)throw Error("Replace up to 2,000 cells per operation.");
 const escaped=query.trim().replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
 const pattern=new RegExp(escaped,caseSensitive?"g":"gi");
 const updates:{cell:string;value:string}[]=[];let skippedFormulas=0;
 for(const hit of hits){const current=read(hit.ref);
  // Replacing inside a formula can silently change payroll calculations: never do it.
  if(current.startsWith("=")){skippedFormulas++;continue}
  pattern.lastIndex=0;if(!pattern.test(current))continue;
  pattern.lastIndex=0;const value=current.replace(pattern,()=>replacement);
  if(value.startsWith("="))throw Error(`${hit.ref}: Find/Replace cannot create a formula; edit that cell explicitly.`);
  if(value.length>1500)throw Error(`${hit.ref}: replacement exceeds 1,500 characters.`);
  if(value!==current)updates.push({cell:hit.ref,value});
 }
 return {updates,skippedFormulas};
}
