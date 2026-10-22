"use client";
import Link from "next/link";
import type {ReactNode} from "react";
import {useStudio} from "../../lib/studio/useStudio";
export default function StudioGate({children}:{children:(studio:ReturnType<typeof useStudio>)=>ReactNode}){const studio=useStudio();if(!studio.ready)return <main className="studio-gate">Loading Document Studio…</main>;if(!studio.actor)return <main className="studio-gate"><h1>Sign in to HRMS</h1><p>Open Document Studio from an active HRMS demo session.</p><Link href="/">Return to HRMS</Link></main>;if(studio.actor.role==="BM")return <main className="studio-gate"><h1>Restricted workspace</h1><p>Document editing and Employee 201 auto-fill are restricted to HR and Super Admin.</p><Link href="/">Return to HRMS</Link></main>;return <>{children(studio)}</>}
