'use client';
import {useEffect,useState} from 'react';
import {Modal,Button} from './UI';
import {makePdf,PdfKind} from '@/lib/pdf';
import {useStore} from '@/lib/store';
import {Disbursement,POS} from '@/lib/types';
import {Download} from 'lucide-react';
export function PdfPreview({kind,onClose,options={}}:{kind:PdfKind;onClose:()=>void;options?:{from?:string;to?:string;branchId?:string;disbursement?:Disbursement;pos?:POS}}){const {data}=useStore();const [url,setUrl]=useState('');const [error,setError]=useState('');useEffect(()=>{let current='';makePdf(kind,data,options).then(blob=>{current=URL.createObjectURL(blob);setUrl(current)}).catch(e=>setError(String(e)));return()=>{if(current)URL.revokeObjectURL(current)}},[data,kind,options.branchId,options.from,options.to,options.disbursement?.id,options.pos?.id]);return <Modal title={`Preview: ${kind}`} onClose={onClose} wide><div className="preview-toolbar"><span className="muted">Preview before downloading · A4 PDF</span><Button disabled={!url} onClick={()=>{const a=document.createElement('a');a.href=url;a.download=`${kind.toLowerCase().replace(/ /g,'-')}-${options.disbursement?.id||options.pos?.id||'report'}.pdf`;a.click()}}><Download size={16}/> Download PDF</Button></div>{error&&<div className="alert error">{error}</div>}{url?<iframe title="Generated PDF preview" className="pdf-frame" src={url}/>:<p>Generating preview...</p>}</Modal>}
