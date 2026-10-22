/** Deterministic spreadsheet evaluator. Never executes JavaScript or external references. */
export const columnLabel=(index:number)=>{let out="";for(let n=index+1;n>0;n=Math.floor((n-1)/26))out=String.fromCharCode(65+(n-1)%26)+out;return out};
export function decodeCell(ref:string):{row:number;col:number}|null{const m=/^(\$?[A-Z]{1,2})(\$?[1-9]\d{0,3})$/.exec(ref.toUpperCase());if(!m)return null;let col=0;for(const c of m[1].replace(/\$/g,""))col=col*26+c.charCodeAt(0)-64;return {row:Number(m[2].replace(/\$/g,""))-1,col:col-1}}
export type CellResult=string|number;
type Scalar=string|number|boolean;
type Value=Scalar|Value[];
type Node={kind:"literal";value:Value}|{kind:"ref";ref:string;sheet?:string}|{kind:"range";from:string;to:string;sheet?:string}|{kind:"unary";op:string;right:Node}|{kind:"binary";op:string;left:Node;right:Node}|{kind:"call";name:string;args:Node[]};
const err=(v:Value):boolean=>typeof v==="string"&&/^#(?:REF!|VALUE!|DIV\/0!|N\/A|CYCLE!|ERROR!|NUM!)/.test(v);
const flatten=(v:Value):Value[]=>Array.isArray(v)?v.flatMap(flatten):[v];
const scalar=(v:Value):Scalar=>Array.isArray(v)?scalar(v[0]??""):v;
const text=(v:Value):string=>{const x=scalar(v);return typeof x==="boolean"?(x?"TRUE":"FALSE"):String(x)};
const number=(v:Value):number|string=>{const x=scalar(v);if(err(x))return x as string;if(typeof x==="boolean")return x?1:0;if(x==="")return 0;const n=Number(x);return Number.isFinite(n)?n:"#VALUE!"};
const truth=(v:Value):boolean=>{const x=scalar(v);return typeof x==="boolean"?x:typeof x==="number"?x!==0:/^(TRUE|YES|1)$/i.test(String(x))};
const comparison=(a:Value,b:Value):number=>{const x=scalar(a),y=scalar(b),nx=Number(x),ny=Number(y);if(x!==""&&y!==""&&Number.isFinite(nx)&&Number.isFinite(ny))return Math.sign(nx-ny);return text(x).localeCompare(text(y),undefined,{sensitivity:"base"})};
const round=(n:number,d:number)=>{const digits=Math.max(-12,Math.min(12,Math.trunc(d)));const factor=10**digits;return Math.round((n+Number.EPSILON)*factor)/factor};

export function evaluateSheetFormula(input:string,get:(ref:string,sheetName?:string)=>CellResult):CellResult{
 if(!input.startsWith("="))return input;
 try{
  const body=input.slice(1);if(body.length>4000)return "#ERROR!";
  const pattern=/\s*("(?:[^"]|"")*"|'(?:[^']|'')*'!|[A-Z_][A-Z_0-9]*!|\$?[A-Z]{1,2}\$?[1-9]\d{0,3}|[A-Z_][A-Z_0-9]*|(?:\d+(?:\.\d*)?|\.\d+)|<>|<=|>=|[=<>+\-*/^&(),:%])/iy;
  const tokens:string[]=[];let index=0;
  while(index<body.length){pattern.lastIndex=index;const m=pattern.exec(body);if(!m||m.index!==index)throw Error("syntax");tokens.push(m[1]);index=pattern.lastIndex;if(tokens.length>1500)throw Error("complex")}
  let pos=0;const peek=()=>tokens[pos],consume=(s:string)=>{if(peek()!==s)throw Error("syntax");pos++};let depth=0;
  const primary=():Node=>{
   if(++depth>70)throw Error("complex");try{
    const t=peek();if(!t)throw Error("syntax");
    if(t==="("){pos++;const x=parseComparison();consume(")");return x}
    if(t.startsWith('"')){pos++;return {kind:"literal",value:t.slice(1,-1).replace(/""/g,'"')}}
    if(/^(?:\d|\.)/.test(t)){pos++;return {kind:"literal",value:Number(t)}}
    // A sheet prefix is scoped to the current workbook. Quoted names may contain spaces
    // and escaped apostrophes: ='Compensation & Premiums'!B2.
    let sheetName:string|undefined;
    if(t.endsWith("!")){
     sheetName=t.startsWith("'")?t.slice(1,-2).replace(/''/g,"'"):t.slice(0,-1);
     if(!sheetName||sheetName.length>100)throw Error("ref");pos++;
    }
    const cell=peek();
    if(cell&&/^\$?[A-Z]{1,2}\$?[1-9]\d{0,3}$/i.test(cell)){
     pos++;if(!decodeCell(cell))throw Error("ref");
     if(peek()===":"){pos++;const to=peek();if(!to||!decodeCell(to))throw Error("ref");pos++;return {kind:"range",from:cell,to,sheet:sheetName}}
     return {kind:"ref",ref:cell,sheet:sheetName}
    }
    if(sheetName)throw Error("ref");
    if(/^[A-Z_][A-Z_0-9]*$/i.test(t)){pos++;const name=t.toUpperCase();if(name==="TRUE"||name==="FALSE")return {kind:"literal",value:name==="TRUE"};consume("(");const args:Node[]=[];if(peek()!==")"){while(true){args.push(parseComparison());if(peek()!==",")break;pos++;if(args.length>100)throw Error("complex")}}consume(")");return {kind:"call",name,args}}
    throw Error("syntax")
   }finally{depth--}
  };
  const unary=():Node=>{if(peek()==="+"||peek()==="-"){const op=tokens[pos++];return {kind:"unary",op,right:unary()}}let x=primary();while(peek()==="%") {pos++;x={kind:"unary",op:"%",right:x}}return x};
  const power=():Node=>{const left=unary();return peek()==="^"?(pos++,{kind:"binary",op:"^",left,right:power()}):left};
  const multiply=():Node=>{let x=power();while(peek()==="*"||peek()==="/"){const op=tokens[pos++];x={kind:"binary",op,left:x,right:power()}}return x};
  const add=():Node=>{let x=multiply();while(peek()==="+"||peek()==="-"){const op=tokens[pos++];x={kind:"binary",op,left:x,right:multiply()}}return x};
  const concatenate=():Node=>{let x=add();while(peek()==="&"){pos++;x={kind:"binary",op:"&",left:x,right:add()}}return x};
  function parseComparison():Node{let x=concatenate();while(["=","<>",">","<",">=","<="].includes(peek())){const op=tokens[pos++];x={kind:"binary",op,left:x,right:concatenate()}}return x}
  const ast=parseComparison();if(pos!==tokens.length)throw Error("syntax");let budget=10000;
  const evalNode=(node:Node):Value=>{
   if(--budget<0)return "#ERROR!";
   if(node.kind==="literal")return node.value;
   if(node.kind==="ref"){const ref=node.ref.replace(/\$/g,"").toUpperCase();const v=get(ref,node.sheet);return err(v)?v:v}
   if(node.kind==="range"){const a=decodeCell(node.from),b=decodeCell(node.to);if(!a||!b)return "#REF!";const startRow=Math.min(a.row,b.row),endRow=Math.max(a.row,b.row),startCol=Math.min(a.col,b.col),endCol=Math.max(a.col,b.col);const size=(endRow-startRow+1)*(endCol-startCol+1);if(size>2000)return "#REF!";const vals:Value[]=[];for(let row=startRow;row<=endRow;row++)for(let col=startCol;col<=endCol;col++)vals.push(get(`${columnLabel(col)}${row+1}`,node.sheet));return vals}
   if(node.kind==="unary"){const v=number(evalNode(node.right));if(typeof v==="string")return v;return node.op==="-"?-v:node.op==="%"?v/100:v}
   if(node.kind==="binary"){
    const a=evalNode(node.left),b=evalNode(node.right);if(err(scalar(a)))return scalar(a);if(err(scalar(b)))return scalar(b);
    if(node.op==="&")return text(a)+text(b);
    if(["=","<>","<",">","<=",">="].includes(node.op)){const c=comparison(a,b);return node.op==="="?c===0:node.op==="<>"?c!==0:node.op==="<"?c<0:node.op===">"?c>0:node.op==="<="?c<=0:c>=0}
    const x=number(a),y=number(b);if(typeof x==="string")return x;if(typeof y==="string")return y;
    if(node.op==="/")return y===0?"#DIV/0!":x/y;
    if(node.op==="*")return x*y;if(node.op==="^")return x**y;if(node.op==="+")return x+y;return x-y
   }
   const {name,args}=node;
   // Lazy branches: an unused IF/IFERROR/IFS branch is never evaluated.
   if(name==="IF")return truth(evalNode(args[0]??{kind:"literal",value:false}))?evalNode(args[1]??{kind:"literal",value:true}):evalNode(args[2]??{kind:"literal",value:false});
   if(name==="IFERROR"){const value=args[0]?evalNode(args[0]):"#N/A";return err(scalar(value))?(args[1]?evalNode(args[1]):""):value}
   if(name==="IFS"){for(let i=0;i<args.length;i+=2)if(truth(evalNode(args[i])))return args[i+1]?evalNode(args[i+1]):"#N/A";return "#N/A"}
   if(name==="AND") {for(const arg of args)if(!truth(evalNode(arg)))return false;return true}
   if(name==="OR"){for(const arg of args)if(truth(evalNode(arg)))return true;return false}
   if(name==="NOT")return !truth(evalNode(args[0]??{kind:"literal",value:false}));
   const values=args.map(evalNode);const flat=values.flatMap(flatten);
   if(flat.some(err))return flat.find(err) as string;
   const nums=flat.filter(x=>x!==""&&typeof x!=="boolean"&&Number.isFinite(Number(x))).map(Number);
   const first=()=>values[0]??"",second=()=>values[1]??"",third=()=>values[2]??"";
   const num=(v:Value):number|string=>number(v);
   if(name==="SUM")return nums.reduce((a,b)=>a+b,0);
   if(name==="AVERAGE")return nums.length?nums.reduce((a,b)=>a+b,0)/nums.length:"#DIV/0!";
   if(name==="MIN")return nums.length?Math.min(...nums):0;
   if(name==="MAX")return nums.length?Math.max(...nums):0;
   if(name==="COUNT")return nums.length;
   if(name==="COUNTA")return flat.filter(x=>x!=="").length;
   if(name==="COUNTBLANK")return flat.filter(x=>x==="").length;
   if(name==="MOD"||name==="POWER"||name==="SQRT"){const n=num(first()),other=num(second());if(typeof n==="string")return n;if(typeof other==="string")return other;if(name==="SQRT")return n<0?"#NUM!":Math.sqrt(n);return name==="MOD"?(other===0?"#DIV/0!":((n%other)+other)%other):n**other}
   if(name==="ABS"||name==="ROUND"||name==="ROUNDUP"||name==="ROUNDDOWN"){
    const n=num(first()),digits=num(second());if(typeof n==="string")return n;if(typeof digits==="string")return digits;
    if(name==="ABS")return Math.abs(n);if(name==="ROUND")return round(n,digits);
    const factor=10**Math.max(-12,Math.min(12,Math.trunc(digits)));return (name==="ROUNDUP"?Math.sign(n)*Math.ceil(Math.abs(n)*factor):Math.sign(n)*Math.floor(Math.abs(n)*factor))/factor
   }
   if(name==="LEN")return text(first()).length;if(name==="UPPER")return text(first()).toUpperCase();if(name==="LOWER")return text(first()).toLowerCase();if(name==="TRIM")return text(first()).trim().replace(/\s+/g," ");
   if(name==="CONCAT"||name==="CONCATENATE")return flat.map(text).join("");
   if(name==="LEFT"||name==="RIGHT"){const n=num(args.length>1?second():1);if(typeof n==="string")return n;return name==="LEFT"?text(first()).slice(0,Math.max(0,Math.trunc(n))):Math.trunc(n)<=0?"":text(first()).slice(-Math.trunc(n))}
   if(name==="MID"){const start=num(second()),len=num(third());if(typeof start==="string")return start;if(typeof len==="string")return len;return text(first()).slice(Math.max(0,Math.trunc(start)-1),Math.max(0,Math.trunc(start)-1)+Math.max(0,Math.trunc(len)))}
   if(name==="COUNTIF"||name==="SUMIF"){
    const search=flatten(first()),criterion=text(second());const match=(v:Value)=>{const s=text(v),op=/^(<=|>=|<>|=|<|>)(.*)$/.exec(criterion);if(!op)return comparison(s,criterion)===0;const comp=comparison(s,op[2]);return op[1]==="="?comp===0:op[1]==="<>"?comp!==0:op[1]==="<"?comp<0:op[1]===">"?comp>0:op[1]==="<="?comp<=0:comp>=0};
    if(name==="COUNTIF")return search.filter(match).length;
    const sum=values.length>2?flatten(third()):search;if(sum.length!==search.length)return "#VALUE!";return search.reduce<number>((acc,v,i)=>{const n=num(sum[i]);return match(v)&&typeof n==="number"?acc+n:acc},0)
   }
   if(name==="MATCH"){const list=flatten(second());const mode=values.length>=3?num(third()):0;if(mode!==0)return "#N/A";const i=list.findIndex(v=>comparison(v,first())===0);return i<0?"#N/A":i+1}
   if(name==="INDEX"){const list=flatten(first()),i=num(second());if(typeof i==="string")return i;return list[Math.trunc(i)-1]??"#REF!"}
   if(name==="VLOOKUP"){if(args.length<3||args[1].kind!=="range")return "#N/A";const a=decodeCell(args[1].from),b=decodeCell(args[1].to),col=num(third());if(!a||!b||typeof col==="string"||col<1)return "#REF!";if(values.length>3&&truth(values[3]))return "#N/A";const fromCol=Math.min(a.col,b.col),toCol=Math.max(a.col,b.col);if(fromCol+col-1>toCol)return "#REF!";for(let row=Math.min(a.row,b.row);row<=Math.max(a.row,b.row);row++){if(comparison(get(`${columnLabel(fromCol)}${row+1}`,args[1].sheet),first())===0)return get(`${columnLabel(fromCol+col-1)}${row+1}`,args[1].sheet)}return "#N/A"}
   if(name==="XLOOKUP"){const search=flatten(second()),results=flatten(third());if(search.length!==results.length)return "#VALUE!";const i=search.findIndex(v=>comparison(v,first())===0);return i<0?(args[3]?values[3]:"#N/A"):results[i]}
   return "#ERROR!"
  };
  const result=scalar(evalNode(ast));if(err(result))return result as string;if(typeof result==="number")return Number.isFinite(result)?Number(result.toFixed(8)):"#NUM!";return typeof result==="boolean"?(result?"TRUE":"FALSE"):result;
 }catch{return "#ERROR!"}
}
