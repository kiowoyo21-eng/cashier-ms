"use client";
import {useMemo,useState} from "react";
import Link from "next/link";
import {FileText,FilePlus2,Search,ExternalLink,HardDrive,Library,ArrowLeft} from "lucide-react";
import {useStudio} from "../../lib/studio/useStudio";
import {addStudioItem} from "../../lib/studio/store";
/** Dedicated Docs home, separate from Document Library (template automation). */
export default function DocsHome(){
 const {actor,state,ready,refresh}=useStudio();const [query,setQuery]=useState(""),[message,setMessage]=useState("");
 const docs=useMemo(()=>state.items.filter(x=>x.kind==="docs"&&x.status!=="Archived"&&`${x.title} ${x.category}`.toLowerCase().includes(query.toLowerCase())).sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt)),[state.items,query]);
 if(!ready)return <main className="docs-home">Loading Docs…</main>;
 if(!actor||actor.role==="BM")return <main className="docs-home"><h1>Docs unavailable</h1><p>Sign in to HRMS as HR or Super Admin.</p><Link href="/">Return to HRMS</Link></main>;
 const create=()=>{const title=window.prompt("Document title", "Untitled document");if(!title)return;try{const item=addStudioItem(actor,"docs",title,"General");refresh();window.location.href=`/docs/${encodeURIComponent(item.id)}`}catch(err){setMessage(err instanceof Error?err.message:"Could not create document.")}};
 return <main className="docs-home"><header className="docs-home-head"><div><p><Link href="/"><ArrowLeft size={15}/> HRMS</Link> · <Link href="/drive"><HardDrive size={15}/> Drive</Link> · <Link href="/document-library"><Library size={15}/> Document Library</Link></p><h1><FileText size={29}/> HRMS Docs</h1><span>Documents and templates stored in this browser. Protected edits need admin approval in the editor.</span></div>{actor.role==="Super Admin"&&<button className="docs-create" onClick={create}><FilePlus2 size={17}/> Blank document</button>}</header><div className="docs-home-search"><Search size={19}/><input aria-label="Search Docs" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search documents"/></div>{message&&<p role="alert">{message}</p>}<section className="docs-home-files"><h2>My documents</h2><div className="docs-home-grid">{docs.map(d=><Link key={d.id} href={`/docs/${encodeURIComponent(d.id)}`} className="docs-home-item"><FileText size={34}/><strong>{d.title}</strong><small>{d.template?"Reusable template":"Generated copy"} · {d.category} · {d.status}</small><small>Updated {new Date(d.updatedAt).toLocaleDateString("en-PH")} · v{d.version}</small><span>Open document <ExternalLink size={13}/></span></Link>)}{!docs.length&&<p>No documents match your search.</p>}</div></section><footer>Frontend-only · No cross-device storage or secure shared collaboration.</footer></main>
}
