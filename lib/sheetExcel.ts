/** Browser-side Excel I/O, dynamically loaded only when requested.
 * Import is limited and never writes to HRMS source state. No macros/external links.
 */
import {columnLabel} from "./sheetFormulas";
import {GRID_MAX_ROWS,GRID_MAX_COLS,GRID_BATCH_LIMIT,supportedImportFormula} from "./sheetRange";
import type {CellAppearance} from "./spreadsheetStore";
export type ImportedTab={name:string;cells:{cell:string;value:string}[];formats:Record<string,CellAppearance>;warnings:string[]};
export type SheetExport={name:string;rows:string[][];overlay?:Record<string,string>;formats?:Record<string,CellAppearance>};
function fileName(name:string){return name.replace(/[^\w-]+/g,"-").slice(0,75)||"HRMS-Workbook"}
function asHex(argb?:string){return argb&&/^[0-9A-F]{8}$/i.test(argb)?`#${argb.slice(2)}`:undefined}
function toARGB(value?:string){return value&&/^#[a-f\d]{6}$/i.test(value)?`FF${value.slice(1).toUpperCase()}`:undefined}
function parseValue(v:unknown):string{
 if(v===null||v===undefined)return "";
 if(typeof v==="string")return v;
 if(typeof v==="number"||typeof v==="boolean")return String(v);
 if(v instanceof Date)return v.toISOString().slice(0,10);
 if(typeof v==="object"){
  const obj=v as Record<string,unknown>;
  if(typeof obj.formula==="string")return supportedImportFormula(`=${obj.formula}`)?`=${obj.formula}`:`'=${obj.formula}`;
  if(typeof obj.sharedFormula==="string")return "";
  if(typeof obj.text==="string")return obj.text;
  if(Array.isArray(obj.richText))return obj.richText.map(x=>typeof x==="object"&&x&&"text" in x?String((x as {text:unknown}).text):"").join("");
  if(typeof obj.error==="string")return obj.error;
 }
 return "";
}
/** Reads .xlsx only (no .xls, .xlsm, or macro execution). */
export async function readExcelFile(file:File):Promise<ImportedTab[]>{
 if(!/\.xlsx$/i.test(file.name))throw Error("Choose an .xlsx workbook (not .xls or .xlsm).");
 if(!file.size||file.size>3_000_000)throw Error("Choose an XLSX file between 1 byte and 3 MB.");
 const {Workbook}=await import("exceljs");const workbook=new Workbook();
 await workbook.xlsx.load(await file.arrayBuffer() as never);
 if(workbook.worksheets.length>20)throw Error("Only 20 worksheets may be imported from one workbook.");
 const tabs:ImportedTab[]=[];
 for(const ws of workbook.worksheets){
  if(ws.rowCount>GRID_MAX_ROWS||ws.columnCount>GRID_MAX_COLS)throw Error(`"${ws.name}" exceeds the editor's ${GRID_MAX_ROWS} rows or ${GRID_MAX_COLS} columns.`);
  const cells:ImportedTab["cells"]=[],formats:ImportedTab["formats"]={},warnings:string[]=[];
  ws.eachRow({includeEmpty:false},row=>{
   const rowNumber=row.number; // ExcelJS Row.number is numeric; Cell.row is typed as string.
   row.eachCell({includeEmpty:false},(c,columnNumber)=>{
   if(rowNumber>GRID_MAX_ROWS||columnNumber>GRID_MAX_COLS)return;
   const val=parseValue(c.value);if(val){if(val.length>1500)throw Error(`Cell ${c.address} exceeds 1,500 characters.`);cells.push({cell:`${columnLabel(columnNumber-1)}${rowNumber}`,value:val});}
   const format:CellAppearance={};if(c.font?.bold)format.bold=true;if(c.font?.italic)format.italic=true;if(c.font?.underline)format.underline=true;
   const color=asHex(c.font?.color?.argb);if(color)format.color=color;
   const bg=asHex(c.fill?.type==="pattern"&&c.fill.pattern==="solid"?c.fill.fgColor?.argb:undefined);if(bg)format.background=bg;
   if(c.alignment?.horizontal&&["left","center","right"].includes(c.alignment.horizontal))format.align=c.alignment.horizontal as CellAppearance["align"];
   if(Object.keys(format).length)formats[`${columnLabel(columnNumber-1)}${rowNumber}`]=format;
   });
  });
  if(cells.length>GRID_BATCH_LIMIT)throw Error(`"${ws.name}" has over ${GRID_BATCH_LIMIT.toLocaleString()} populated cells. Split into smaller imports.`);
  const unsupported=cells.filter(c=>c.value.startsWith("'= ")||c.value.startsWith("'=")).length;
  if(unsupported)warnings.push(`${unsupported} unsupported Excel formulas were imported as text to avoid executing external formulas.`);
  if((ws as unknown as {model?:{merges?:string[]}}).model?.merges?.length)warnings.push("Merged-cell layout isn't reproduced in this version.");
  tabs.push({name:ws.name,cells,formats,warnings});
 }
 if(!tabs.length)throw Error("Workbook has no worksheets.");
 return tabs;
}
export async function saveExcelFile(tabs:SheetExport[],name:string){
 if(!tabs.length)throw Error("No worksheets to export.");
 const {Workbook}=await import("exceljs");const book=new Workbook();book.creator="HRMS working-copy spreadsheet";
 const unique=new Set<string>();
 for(const tab of tabs){
  let title=(tab.name.replace(/[\\/*?:\[\]]/g," ").trim()||"Sheet").slice(0,31),i=1;
  while(unique.has(title.toLowerCase()))title=`${tab.name.slice(0,25)}-${++i}`.slice(0,31);unique.add(title.toLowerCase());
  const ws=book.addWorksheet(title);const overlays=tab.overlay||{},formats=tab.formats||{};
  const maxRow=Math.max(tab.rows.length,...Object.keys(overlays).map(a=>Number(a.match(/\d+$/)?.[0]||0)),0);
  if(maxRow>GRID_MAX_ROWS)throw Error("Sheet exceeds row limit.");
  let count=0;
  for(let r=0;r<maxRow;r++){
   const source=tab.rows[r]||[];const maxCol=Math.min(GRID_MAX_COLS,Math.max(source.length,...Object.keys(overlays).filter(a=>Number(a.match(/\d+$/)?.[0])===r+1).map(a=>{const col=a.replace(/\d+$/,'');let x=0;for(const letter of col)x=x*26+letter.charCodeAt(0)-64;return x}),0));
   for(let c=0;c<maxCol;c++){
    const ref=`${columnLabel(c)}${r+1}`,raw=Object.prototype.hasOwnProperty.call(overlays,ref)?overlays[ref]:String(source[c]??"");
    const style=formats[ref];if(!raw&&!style)continue;
    if(++count>35000)throw Error("Export is too large (35,000 populated/styled cells maximum).");
    const target=ws.getCell(ref);
    if(raw.startsWith("=")&&supportedImportFormula(raw))target.value={formula:raw.slice(1)};
    else if(/^-?(?:0|[1-9]\d*)(?:\.\d+)?$/.test(raw)&&raw.length<=14&&Number.isFinite(Number(raw))&&!/(?:\bID\b|number|SSS|philhealth|pag.?ibig|\bTIN\b|contact|phone|account)/i.test(String(tab.rows[0]?.[c]??"")))target.value=Number(raw);
    else target.value=raw;
    if(style){target.font={bold:style.bold,italic:style.italic,underline:style.underline,color:toARGB(style.color)?{argb:toARGB(style.color)!}:undefined};if(toARGB(style.background))target.fill={type:"pattern",pattern:"solid",fgColor:{argb:toARGB(style.background)!}};if(style.align)target.alignment={horizontal:style.align};}
   }
  }
 }
 const bytes=await book.xlsx.writeBuffer();const blob=new Blob([new Uint8Array(bytes)],{type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});
 const url=URL.createObjectURL(blob),link=document.createElement("a");link.href=url;link.download=`${fileName(name)}.xlsx`;link.click();window.setTimeout(()=>URL.revokeObjectURL(url),3000);
}
