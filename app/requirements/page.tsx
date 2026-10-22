"use client";
import {useEffect,useState} from "react";
import {RECRUITMENT_KEY,type ApplicantRecord} from "../../lib/recruitmentCatalog";

/** Read-only browser-local applicant portal preview. No real applicant authentication/storage. */
export default function RequirementsPreview(){
 const [candidate,setCandidate]=useState<ApplicantRecord|null>(null);
 const [phase,setPhase]=useState<"loading"|"notfound"|"expired"|"preview">("loading");
 useEffect(()=>{
  try{
   const params=new URLSearchParams(window.location.search);
   const id=params.get("app"),token=params.get("token");
   const saved=window.localStorage.getItem(`uc-hr-ui-${RECRUITMENT_KEY}`);
   const record=(saved?JSON.parse(saved) as ApplicantRecord[]:[]).find(row=>row.id===id);
   if(!record?.uploadPortal||record.uploadPortal.token!==token){setPhase("notfound");return}
   if(new Date(record.uploadPortal.expiresAt).getTime()<=Date.now()){setPhase("expired");return}
   setCandidate(record);setPhase("preview");
  }catch{setPhase("notfound")}
 },[]);
 return <main className="applicant-demo-page"><section className="applicant-demo-sheet"><div className="applicant-demo-header"><b className="applicant-demo-mark">UC</b><div><strong>UNDERCHARGERS</strong><small>Applicant Document Portal · DEMO</small></div></div>
  {phase==="loading"?<p>Loading preview...</p>:phase==="notfound"?<><h1>Preview unavailable</h1><p>This is a browser-local preview. The applicant data is not available on a different device. Secure applicant links and uploads require backend integration.</p></>:phase==="expired"?<><h1>Link expired</h1><p>This test link expired 1 hour after it was created. Ask HR to regenerate a preview link. Any prior file references in HR records are unchanged.</p></>:candidate&&<><h1>My Pre-Employment Requirements</h1><p><b>{candidate.name}</b> · {candidate.role}</p><div className="applicant-demo-alert">Prototype only. No real file uploads or auto-saved file bytes are available on this site. Do not provide private documents. Production portal will save each upload securely and preserve it after the link expires.</div><div className="applicant-demo-grid">{candidate.requirements.map(req=><div className="applicant-demo-req" key={req.name}><div><b>{req.name}</b><small>{req.required===false?"Not Required":req.status==="Verified"&&req.fileName?"Verified by HR":req.fileName?"File reference on record — HR review pending":"Pending Upload"}</small></div><span className="tag">{req.required===false?"Not Required":req.fileName?req.status:"Pending"}</span></div>)}</div><p className="muted">Your HR contact can review and correct the requirement status. Actual uploads, file previews and phone-based access will be enabled after secure backend deployment.</p></>}
 </section></main>;
}
