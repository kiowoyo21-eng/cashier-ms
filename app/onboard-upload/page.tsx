"use client";
import {useEffect,useState,type ChangeEvent} from "react";
import {FileUp,FileText,CheckCircle2,Clock3,Info} from "lucide-react";
import {initialApplicants,uniqueRequirements,RECRUITMENT_KEY,type ApplicantRecord} from "../../lib/recruitmentCatalog";
const KEY=`uc-hr-ui-${RECRUITMENT_KEY}`;
/** Same-browser demonstration ONLY: the actual file bytes are intentionally never stored. */
export default function ApplicantUploadPortal(){
 const [candidate,setCandidate]=useState<ApplicantRecord|null>(null);
 const [error,setError]=useState("Loading local demo access...");
 const [now,setNow]=useState(0);
 const [ids,setIds]=useState<{applicant:string;token:string}>({applicant:"",token:""});
 useEffect(()=>{
  const params=new URLSearchParams(window.location.search);const applicant=params.get("app")||params.get("applicant")||"",token=params.get("token")||"";
  setIds({applicant,token});setNow(Date.now());
  try{const records=JSON.parse(localStorage.getItem(KEY)||JSON.stringify(initialApplicants)) as ApplicantRecord[];
   const found=records.find(x=>x.id===applicant&&x.uploadPortal?.token===token&&Boolean(token));
   if(!found){setError("No matching demo invitation is stored in this browser. Ask HR to regenerate the link. This prototype cannot transfer records between different devices.");return}
   setCandidate(found);setError("");
  }catch{setError("Cannot open browser-only applicant records.")}
 },[]);
 useEffect(()=>{const timer=window.setInterval(()=>setNow(Date.now()),15000);return ()=>window.clearInterval(timer)},[]);
 const expired=!candidate?.uploadPortal?.expiresAt||Date.parse(candidate.uploadPortal.expiresAt)<=now;
 const requirements=candidate?uniqueRequirements(candidate.requirements):[];
 function upload(e:ChangeEvent<HTMLInputElement>,name:string){const file=e.target.files?.[0];if(!file||!candidate||expired)return;
  if(!/\.(pdf|png|jpe?g|webp)$/i.test(file.name)||file.size>10*1024*1024){setError("Supported: PDF/JPG/PNG/WEBP, up to 10MB per demo selection.");return}
  const records=JSON.parse(localStorage.getItem(KEY)||"[]") as ApplicantRecord[];
  const source=records.find(x=>x.id===ids.applicant&&x.uploadPortal?.token===ids.token);
  if(!source||Date.parse(source.uploadPortal?.expiresAt||"")<=Date.now()){setError("Access expired or revoked. Request a new link from HR.");setNow(Date.now());return}
  const updated=records.map(x=>x.id!==source.id?x:{...x,requirements:uniqueRequirements(x.requirements).map(req=>req.name===name?{...req,status:"Submitted" as const,fileName:file.name}:req),history:[`${new Date().toLocaleString("en-PH")} · Applicant demo selected ${name}: ${file.name} (filename only)`,...(x.history||[])]});
  try{localStorage.setItem(KEY,JSON.stringify(updated));setCandidate(updated.find(x=>x.id===source.id)||null);setError("")}catch{setError("Browser storage is unavailable. No upload metadata saved.")}
  e.target.value="";
 }
 return <main className="applicant-upload-shell"><section className="applicant-upload-box"><header><h1>Underchargers · Document Requirements</h1><p>Applicant checklist · Browser-only workflow preview</p></header>
 <div className="uc-holiday-rate-reference"><Info size={16}/> <b>Demo only:</b> Documents are NOT uploaded to HR storage. Only their file names and statuses are saved in this same browser. Links cannot work between different devices until secure storage/authentication is connected. Do not submit real IDs or confidential documents.</div>
 {error&&<p role="status" className="pc-alert">{error}</p>}
 {candidate&&<><div><h2>{candidate.name}</h2><p>{candidate.role} · {candidate.id}</p></div><p className="muted"><Clock3 size={15}/> {expired?"Invitation expired or revoked":`Invitation expires ${new Date(candidate.uploadPortal?.expiresAt||"").toLocaleString("en-PH")}`}. HR can issue a new link; earlier filenames remain in the record.</p>
 <div className="applicant-upload-summary"><span>Pending: {requirements.filter(r=>r.required!==false&&r.status==="Missing").length}</span><span>Submitted: {requirements.filter(r=>r.status==="Submitted").length}</span><span>Verified: {requirements.filter(r=>r.status==="Verified").length}</span><span>Not Required: {requirements.filter(r=>r.required===false).length}</span></div>
 {requirements.map(req=><div className="applicant-upload-item" key={req.name}><div><b><FileText size={16}/> {req.name}</b><small>{req.required===false?"Not Required":req.status}{req.fileName?` · ${req.fileName}`:""}</small></div>{req.required!==false&&req.status!=="Verified"&&!expired&&<label className="secondary"><FileUp size={14}/> {req.fileName?"Replace (Demo)":"Choose File (Demo)"}<input type="file" accept=".pdf,.png,.jpg,.jpeg,.webp" style={{display:"none"}} onChange={e=>upload(e,req.name)}/></label>}{req.status==="Verified"&&<CheckCircle2 size={20}/>}</div>)}
 <p className="muted">Every selected file name auto-saves immediately in this browser. This is not successful file submission; real uploaded bytes, HR verification and applicant authentication require the backend.</p></>}
 </section></main>;
}
