/** Spreadsheet rectangular operations. No access to payroll source data. */
import {columnLabel,decodeCell} from "./sheetFormulas";
export type GridPoint={row:number;col:number};
export type GridRange={top:number;left:number;bottom:number;right:number};
export const GRID_MAX_ROWS=4000,GRID_MAX_COLS=52,GRID_BATCH_LIMIT=2000;
export function normalizeRange(a:GridPoint,b:GridPoint):GridRange{return {top:Math.min(a.row,b.row),left:Math.min(a.col,b.col),bottom:Math.max(a.row,b.row),right:Math.max(a.col,b.col)}}
export function rangeSize(r:GridRange){return (r.bottom-r.top+1)*(r.right-r.left+1)}
export function rangeAddress(r:GridRange){const start=`${columnLabel(r.left)}${r.top+1}`,end=`${columnLabel(r.right)}${r.bottom+1}`;return start===end?start:`${start}:${end}`}
export function rangeUpdates(r:GridRange,values:(row:number,col:number)=>string){if(rangeSize(r)>GRID_BATCH_LIMIT)throw Error(`Maximum ${GRID_BATCH_LIMIT.toLocaleString()} cells per operation.`);const result:{cell:string;value:string}[]=[];for(let row=r.top;row<=r.bottom;row++)for(let col=r.left;col<=r.right;col++)result.push({cell:`${columnLabel(col)}${row+1}`,value:values(row,col)});return result}
/** Apply ordinary relative and $absolute references when copying a cell. */
export function shiftFormulaReferences(value:string,rowDelta:number,colDelta:number){if(!value.startsWith("="))return value;
 return value.replace(/(^|[^A-Z0-9_."'])((\$?)([A-Z]{1,2})(\$?)([1-9]\d{0,3}))(?=$|[^A-Z0-9_."'])/gi,(full,prefix,ref,absoluteCol,colLetters,absoluteRow,rowDigits)=>{
  const pos=decodeCell(`${colLetters}${rowDigits}`);if(!pos)return full;
  const row=pos.row+(absoluteRow?0:rowDelta),col=pos.col+(absoluteCol?0:colDelta);
  if(row<0||col<0||row>=GRID_MAX_ROWS||col>=GRID_MAX_COLS)return `${prefix}#REF!`;
  return `${prefix}${absoluteCol?'$':''}${columnLabel(col)}${absoluteRow?'$':''}${row+1}`;
 });
}
export function parseTabularPaste(text:string):string[][]{const lines=text.replace(/\r/g,"").replace(/\n$/,"").split("\n");return lines.map(line=>line.split("\t"))}
/** Accept supported formulas only; cross-sheet references must stay inside this workbook.
 * Excel external links ([OtherFile]Sheet!A1), unsafe operators and unknown functions remain text.
 */
export function supportedImportFormula(value:string){
 if(!value.startsWith("=")||value.length>1500||/[\[\]{};\\]/.test(value))return false;
 const body=value.slice(1).replace(/"(?:[^"]|"")*"/g,'""');
 const localOnly=body.replace(/'(?:[^']|'')+'!|[A-Z_][A-Z_0-9]*!/gi,(prefix,at,source:string)=>{
  return /^\$?[A-Z]{1,2}\$?[1-9]\d{0,3}/i.test(source.slice(at+prefix.length))?"":"INVALID";
 });
 if(/[!']/g.test(localOnly)||!/^[\sA-Z0-9_.(),:%+\-*/^&$<>=" ]+$/i.test(localOnly))return false;
 const noRefs=localOnly.replace(/\$?[A-Z]{1,2}\$?[1-9]\d{0,3}/gi,"").replace(/(?:\d+(?:\.\d*)?|\.\d+)/g,"");
 const names=noRefs.match(/\b[A-Z_][A-Z_0-9]*\b/gi)||[];
 const allowed=new Set(["TRUE","FALSE","SUM","AVERAGE","MIN","MAX","COUNT","COUNTA","COUNTBLANK","IF","IFS","IFERROR","AND","OR","NOT","ROUND","ROUNDUP","ROUNDDOWN","ABS","MOD","POWER","SQRT","LEN","UPPER","LOWER","TRIM","CONCAT","CONCATENATE","LEFT","RIGHT","MID","COUNTIF","SUMIF","MATCH","INDEX","VLOOKUP","XLOOKUP"]);
 return names.every(name=>allowed.has(name.toUpperCase()));
}
