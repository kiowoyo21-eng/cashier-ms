/** Fictional incident records for frontend demonstration only; no confidential complaints. */
import type {Branch} from "./mock";
export const incidentStages=["Submitted","Initial Review","NTE / NOV","Written Explanation","Conference","Final Decision","Resolution","Closed"] as const;
export type IncidentStage=(typeof incidentStages)[number];
export const incidentDocumentCategories=["Initial Report","Written Explanation & Notices","Evidence","Mediation Records","Final Decision","Closure Summary"] as const;
export type IncidentDocumentCategory=(typeof incidentDocumentCategories)[number];
export type IncidentAttachment={id:string;category:IncidentDocumentCategory;name:string;addedAt:string;addedBy:string};
export type IncidentCase={
 id:string;reporter:string;respondent:string;reporterEmployeeId?:string;respondentEmployeeId?:string;respondentIsBM:boolean;
 branch:Branch;summary:string;description:string;handler:"HR"|"BM";stage:IncidentStage;priority:"Normal"|"High"|"Critical";
 target:string;notes:string;history:string[];actionLog?:{at:string;actor:string;action:string;detail:string}[];
 explanation?:string;evidenceNotes?:string;mediation?:string;decision?:string;outcome?:string;closureSummary?:string;
 closedAt?:string;attachments?:IncidentAttachment[];
};
export type IncidentDocument={category:IncidentDocumentCategory;title:string;body:string;status:string};
export function incidentDocuments(c:IncidentCase):IncidentDocument[]{
 const rows:IncidentDocument[]=[{category:"Initial Report",title:`Original Report — ${c.id}`,body:c.description,status:"Recorded"}];
 const append=(category:IncidentDocumentCategory,title:string,body?:string)=>{if(body?.trim())rows.push({category,title,body,status:"Recorded (Demo)"})};
 append("Written Explanation & Notices","Notice / written explanation",c.explanation);
 append("Evidence","Evidence notes",c.evidenceNotes);
 append("Mediation Records","Conference / mediation summary",c.mediation);
 append("Final Decision","HR decision",c.decision);
 append("Closure Summary","Case closure record",c.closureSummary);
 return rows;
}
export const seedIncidents:IncidentCase[]=[
 {id:"IR-2026-001",reporter:"Juan Dela Cruz",reporterEmployeeId:"UC-0001",respondent:"Carlo Mendoza",respondentEmployeeId:"UC-0004",respondentIsBM:false,branch:"UC Mandaluyong",summary:"Sample safety observation",description:"Fictional case used only to demonstrate HR incident review and evidence handling.",handler:"BM",stage:"Submitted",priority:"Normal",target:"2026-10-20",notes:"",history:["2026-10-10 · Sample report received"],actionLog:[{at:"2026-10-10",actor:"System",action:"Sample submitted",detail:"Awaiting branch initial review"}]},
 {id:"IR-2026-002",reporter:"Mika Flores",reporterEmployeeId:"UC-0005",respondent:"Sample Manager",respondentIsBM:true,branch:"UC Las Piñas",summary:"Sample confidential manager report",description:"Fictional HR-routed report to demonstrate branch-manager confidentiality protections.",handler:"HR",stage:"Initial Review",priority:"High",target:"2026-10-21",notes:"",history:["2026-10-11 · HR confidential routing"],actionLog:[{at:"2026-10-11",actor:"System",action:"HR routing",detail:"Branch Manager is reported"}]},
 {id:"IR-2026-003",reporter:"Andrea Cruz",reporterEmployeeId:"MM-0001",respondent:"Angela Bautista",respondentEmployeeId:"MM-0003",respondentIsBM:false,branch:"MM Mandaluyong",summary:"Sample attendance dispute",description:"Fictional report demonstrating employee explanation and supervisory investigation.",handler:"BM",stage:"NTE / NOV",priority:"Normal",target:"2026-10-22",notes:"Sample initial findings",history:["2026-10-12 · NTE stage reached"],actionLog:[{at:"2026-10-12",actor:"BM",action:"Initial review",detail:"Sample stage completed"}]},
 {id:"IR-2026-000",reporter:"Juan Dela Cruz",reporterEmployeeId:"UC-0001",respondent:"Carlo Mendoza",respondentEmployeeId:"UC-0004",respondentIsBM:false,branch:"UC Mandaluyong",summary:"Sample resolved workplace misunderstanding",description:"Fictional completed case demonstrating document history and link to two verified Employee 201 IDs. Reporter involvement is NOT a disciplinary finding.",handler:"HR",stage:"Closed",priority:"Normal",target:"2026-09-30",notes:"Resolved for sample display",history:["2026-09-30 · Closed by HR"],actionLog:[{at:"2026-09-30",actor:"HR",action:"Sample closed",detail:"No disciplinary finding"}],explanation:"Sample documented employee explanation",evidenceNotes:"Sample verified interview notes",mediation:"Sample mediation recorded",decision:"No violation found; coaching completed",outcome:"No violation found",closureSummary:"Final case reviewed and closed (fictional example)",closedAt:"2026-09-30"}
];
