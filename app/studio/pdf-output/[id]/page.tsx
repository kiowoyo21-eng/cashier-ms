"use client";
import Link from "next/link";
import {useParams} from "next/navigation";
import {useEffect,useState} from "react";
import {FileDown,ArrowLeft,FileType2} from "lucide-react";
import StudioGate from "../../../../components/studio/StudioGate";
import {getPdfOutput,readPdfOutputs} from "../../../../lib/studio/pdfOutputs";
import {saveBlob} from "../../../../lib/studio/pdfAssets";

/** Read-only viewer. Browser-local PDF copies do not modify original templates. */
export default function PdfOutputPage(){
 const id=String(useParams<{id:string}>().id);
 return <StudioGate>{()=> <PdfOutputViewer key={id} id={id}/>}</StudioGate>;
}
function PdfOutputViewer({id}:{id:string}){
 const [file,setFile]=useState<ArrayBuffer|null>(null);
 const [url,setUrl]=useState<string|null>(null);
 const [message,setMessage]=useState("Loading browser-local PDF copy…");
 const output=readPdfOutputs().find(row=>row.id===id);
 useEffect(()=>{
  let active=true,objectUrl="";
  void getPdfOutput(id).then(bytes=>{
   if(!active)return;
   if(!bytes)throw Error("This browser no longer has the PDF bytes. They may have been created on another device or cleared from storage.");
   setFile(bytes);
   objectUrl=URL.createObjectURL(new Blob([bytes],{type:"application/pdf"}));
   setUrl(objectUrl);setMessage("");
  }).catch(e=>{if(active)setMessage(e instanceof Error?e.message:"Unable to load PDF copy.")});
  return ()=>{active=false;if(objectUrl)URL.revokeObjectURL(objectUrl)};
 },[id]);
 const download=()=>{if(file)saveBlob(new Blob([file],{type:"application/pdf"}),`${(output?.title||"HRMS PDF").replace(/\.pdf$/i,"")}.pdf`)};
 return <main className="pdf-output-page">
  <header className="pdf-output-header"><div><Link href="/document-library"><ArrowLeft size={16}/> Document Library</Link><h1><FileType2 size={22}/>{output?.title||"Generated PDF copy"}</h1><p>Read-only browser-local copy. This is not the source template or a cryptographic digital signature.</p></div>
   <button type="button" disabled={!file} onClick={download}><FileDown size={17}/> Download PDF</button></header>
  {message&&<div role="status" className="studio-message">{message}</div>}
  {url&&<iframe className="pdf-output-frame" src={url} title={output?.title||"Generated PDF viewer"}/>}
  {!output&&<p className="studio-muted">No matching library metadata in this browser. Only records saved on this device are available.</p>}
 </main>;
}
