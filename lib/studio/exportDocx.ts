import {Document,Paragraph,TextRun,Table,TableRow,TableCell,Packer,HeadingLevel,AlignmentType,WidthType,UnderlineType,Header,Footer} from "docx";
import {saveBlob} from "./pdfAssets";

export type DocxExportOptions={pageSize?:"A4"|"Letter"|"Legal";landscape?:boolean;marginMm?:number;headerText?:string;footerText?:string};
const PAGE_TWIPS={A4:[11906,16838],Letter:[12240,15840],Legal:[12240,20160]} as const;

const textRuns=(root:Element):TextRun[]=>{const runs:TextRun[]=[];
 const walk=(node:Node,formats:{bold?:boolean;italics?:boolean;underline?:boolean;strike?:boolean}={})=>{
  if(node.nodeType===Node.TEXT_NODE){if(node.textContent)runs.push(new TextRun({text:node.textContent,bold:formats.bold,italics:formats.italics,underline:formats.underline?{type:UnderlineType.SINGLE}:undefined,strike:formats.strike}));return}
  if(node.nodeType!==Node.ELEMENT_NODE)return;
  const el=node as HTMLElement,tag=el.tagName.toLowerCase();
  const next={...formats,bold:formats.bold||["strong","b"].includes(tag),italics:formats.italics||["em","i"].includes(tag),underline:formats.underline||tag==="u",strike:formats.strike||["s","strike"].includes(tag)};
  if(tag==="br")runs.push(new TextRun({break:1}));else Array.from(el.childNodes).forEach(n=>walk(n,next));
 };
 Array.from(root.childNodes).forEach(n=>walk(n));return runs.length?runs:[new TextRun("")];
};

/** Download a DOCX copy; never mutate the saved template or employee records. */
export async function exportDocx(html:string,name:string,options:DocxExportOptions={}){
 const dom=new DOMParser().parseFromString(html,"text/html"),children:(Paragraph|Table)[]=[];
 const walk=(node:Element,listType?:"bullet"|"number",listIndex=0)=>{
  const tag=node.tagName.toLowerCase();
  if(tag==="table"){
   const trs=Array.from(node.querySelectorAll(":scope > tbody > tr, :scope > tr, :scope > thead > tr"));
   const rows=trs.map(tr=>new TableRow({children:Array.from(tr.children).map(cell=>new TableCell({children:[new Paragraph({children:textRuns(cell)})]}))}));
   if(rows.length)children.push(new Table({rows,width:{size:100,type:WidthType.PERCENTAGE}}));return;
  }
  if(node.hasAttribute("data-page-break")){
   children.push(new Paragraph({pageBreakBefore:true,children:[new TextRun("")]}));return;
  }
  if(["p","h1","h2","h3","h4","h5","h6","li","blockquote"].includes(tag)){
   const h=/^h[1-6]$/.test(tag)?Number(tag.substring(1)):0;
   const headings=[undefined,HeadingLevel.HEADING_1,HeadingLevel.HEADING_2,HeadingLevel.HEADING_3,HeadingLevel.HEADING_4,HeadingLevel.HEADING_5,HeadingLevel.HEADING_6] as const;
   const align=(node as HTMLElement).style.textAlign;
   const opts={children:textRuns(node),heading:h?headings[h] as typeof HeadingLevel.HEADING_1:undefined,
    alignment:align==="center"?AlignmentType.CENTER:align==="right"?AlignmentType.RIGHT:align==="justify"?AlignmentType.JUSTIFIED:undefined,
    bullet:tag==="li"&&listType==="bullet"?{level:0}:undefined,
    numbering:tag==="li"&&listType==="number"?{reference:"hr-numbered",level:0}:undefined};
   children.push(new Paragraph(opts));return;
  }
  if(tag==="ol"||tag==="ul"){
   Array.from(node.children).forEach((child,i)=>walk(child,tag==="ol"?"number":"bullet",i));return;
  }
  if(["div","body","section","article"].includes(tag))Array.from(node.children).forEach(child=>walk(child,listType,listIndex));
 };
 Array.from(dom.body.children).forEach(n=>walk(n));
 const paper=PAGE_TWIPS[options.pageSize||"A4"],dimensions=options.landscape?[paper[1],paper[0]]:[paper[0],paper[1]];
 const margin=Math.round(Math.min(40,Math.max(10,options.marginMm??20))*56.6929);
 const doc=new Document({
  numbering:{config:[{reference:"hr-numbered",levels:[{level:0,format:"decimal",text:"%1.",alignment:AlignmentType.LEFT}]}]},
  sections:[{properties:{page:{size:{width:dimensions[0],height:dimensions[1]},margin:{top:margin,right:margin,bottom:margin,left:margin}}},
   ...(options.headerText?{headers:{default:new Header({children:[new Paragraph(options.headerText)]})}}:{}),
   ...(options.footerText?{footers:{default:new Footer({children:[new Paragraph(options.footerText)]})}}:{}),
   children:children.length?children:[new Paragraph("")]}]
 });
 saveBlob(await Packer.toBlob(doc),`${name.replace(/[^\w\- ]+/g,"_")||"Document"}.docx`);
}
