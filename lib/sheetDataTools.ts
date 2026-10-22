/** Pure worksheet helpers; no writes to HRMS master records. */
import {decodeCell} from "./sheetFormulas";
export type ValidationRule={kind:"list";options:string[]}|{kind:"number";min?:number;max?:number};
export type ConditionalRule={id:string;range:string;operator:"greater"|"less"|"equals"|"contains";value:string;background:string};
export function isValidInput(value:string,rule:ValidationRule):boolean{
 if(value==="")return true;
 if(value.startsWith("="))return false; // Formulas cannot bypass validation before their result is evaluated.
 if(rule.kind==="list")return rule.options.includes(value);
 const n=Number(value);return Number.isFinite(n)&&(rule.min===undefined||n>=rule.min)&&(rule.max===undefined||n<=rule.max);
}
export function validRule(rule:ValidationRule):boolean{
 if(rule.kind==="list")return rule.options.length>0&&rule.options.length<=50&&rule.options.every(x=>x.length>0&&x.length<=80);
 return (rule.min===undefined||Number.isFinite(rule.min))&&(rule.max===undefined||Number.isFinite(rule.max))&&(rule.min===undefined||rule.max===undefined||rule.min<=rule.max)&&(rule.min!==undefined||rule.max!==undefined);
}
export function rangeIncludes(range:string,cell:string):boolean{
 const parts=range.toUpperCase().split(":");if(parts.length!==2)return false;
 const a=decodeCell(parts[0]),b=decodeCell(parts[1]),point=decodeCell(cell);if(!a||!b||!point)return false;
 return point.row>=Math.min(a.row,b.row)&&point.row<=Math.max(a.row,b.row)&&point.col>=Math.min(a.col,b.col)&&point.col<=Math.max(a.col,b.col);
}
export function matchesConditionalRule(value:string,rule:ConditionalRule):boolean{
 if(rule.operator==="contains")return rule.value.trim().length>0&&value.toLowerCase().includes(rule.value.toLowerCase());
 if(rule.operator==="equals")return value.toLowerCase()===rule.value.toLowerCase();
 if(value.trim()===""||rule.value.trim()==="")return false;
 const a=Number(value),b=Number(rule.value);return Number.isFinite(a)&&Number.isFinite(b)&&(rule.operator==="greater"?a>b:a<b);
}
export function sortCompare(left:string,right:string):number{
 if(left.trim()===""&&right.trim()==="")return 0;
 if(left.trim()==="")return 1;if(right.trim()==="")return -1;
 const a=Number(left),b=Number(right);
 if(Number.isFinite(a)&&Number.isFinite(b))return a-b;
 return left.localeCompare(right,undefined,{numeric:true,sensitivity:"base"});
}
