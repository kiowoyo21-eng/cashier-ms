/** Source-aware, branch-scoped frontend dashboard summaries. No inferred pay or invented exits. */
import type {HRState} from "./hrState";
import type {HRFormRecord} from "./hrForms";
import type {IncidentCase} from "./incidentRecords";
import type {Branch,Role} from "./mock";

export function lastCompletedMonth(now=new Date()){
 const local=new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Manila",year:"numeric",month:"2-digit"}).formatToParts(now);
 const year=Number(local.find(p=>p.type==="year")?.value),month=Number(local.find(p=>p.type==="month")?.value);
 const d=new Date(Date.UTC(year,month-2,1));
 return `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,"0")}`;
}
const inBranch=(record:{branch:string},branch:Branch)=>branch==="All Shops"||record.branch===branch;
const validMoney=(n:number)=>Number.isFinite(n)&&n>=0;
export function dashboardEmployeeSummary(state:HRState,branch:Branch,period:string){
 const people=state.people.filter(p=>inBranch(p,branch));
 const hires=people.filter(p=>p.hire?.startsWith(period));
 const byPosition=new Map<string,{position:string;gained:number;lost:number;terminations:number}>();
 const add=(position:string,key:"gained"|"lost",terminated=false)=>{const safe=position.trim()||"Not recorded";const row=byPosition.get(safe)||{position:safe,gained:0,lost:0,terminations:0};row[key]++;if(terminated)row.terminations++;byPosition.set(safe,row)};
 hires.forEach(p=>add(p.position,"gained"));
 // Only explicitly applied offboarding cases are separation events; inactive statuses are not assumed to be terminations.
 const exits=(state.lifecycleCases||[]).filter(c=>c.action==="Offboard"&&c.status==="Applied (Demo)"&&c.effectiveDate?.startsWith(period)&& (branch==="All Shops"||c.sourceBranch===branch));
 exits.forEach(c=>add(c.snapshot.position,"lost",c.separationType==="Termination"));
 const salaryReleases=state.payrollReleases.filter(r=>r.status==="Released"&&r.source==="Browser Review"&&r.kind==="Salary"&&r.paidAt.startsWith(period)&&people.some(p=>p.id===r.employeeId)&&validMoney(r.gross));
 const sampleReleasesExcluded=state.payrollReleases.filter(r=>r.status==="Released"&&r.source==="Sample"&&r.kind==="Salary"&&r.paidAt.startsWith(period)&&people.some(p=>p.id===r.employeeId)).length;
 return {total:people.length,male:people.filter(p=>p.gender==="Male").length,female:people.filter(p=>p.gender==="Female").length,unspecified:people.filter(p=>p.gender!=="Male"&&p.gender!=="Female").length,hires:hires.length,exits:exits.length,terminations:exits.filter(c=>c.separationType==="Termination").length,positions:[...byPosition.values()].sort((a,b)=>b.gained+b.lost-(a.gained+a.lost)||a.position.localeCompare(b.position)),salaryGross:salaryReleases.reduce((v,r)=>v+r.gross,0),salaryCount:salaryReleases.length,sampleReleasesExcluded};
}
export function dashboardRequestSummary(forms:readonly HRFormRecord[],incidents:readonly IncidentCase[],branch:Branch,role:Role,username:string){
 const visibleForms=forms.filter(f=>inBranch(f,branch)&&(role!=="BM"||(f.branch==="UC Mandaluyong"&&f.requestor===username)));
 const visibleIncidents=incidents.filter(c=>inBranch(c,branch)&&(role!=="BM"||(c.handler==="BM"&&!c.respondentIsBM)));
 const pendingForms=visibleForms.filter(f=>f.status==="Submitted"||f.status==="Returned for Revision");
 const resolvedForms=visibleForms.filter(f=>f.status==="Approved (Documentation Only)"||f.status==="Rejected");
 const pendingIncidents=visibleIncidents.filter(c=>c.stage!=="Closed");
 const resolvedIncidents=visibleIncidents.filter(c=>c.stage==="Closed");
 const mine=visibleForms.filter(f=>f.requestor===username);
 const reviewer=role!=="BM";
 const toReview=reviewer?visibleForms.filter(f=>f.status==="Submitted"&&f.requestor!==username).length:0;
 const completedReviews=reviewer?visibleForms.filter(f=>f.reviewedBy===username&&(f.status==="Approved (Documentation Only)"||f.status==="Rejected"||f.status==="Returned for Revision")).length:0;
 return {totalRequests:visibleForms.length,totalReports:visibleIncidents.length,pending:pendingForms.length+pendingIncidents.length,resolved:resolvedForms.length+resolvedIncidents.length,drafts:visibleForms.filter(f=>f.status==="Draft").length,ownPending:mine.filter(f=>f.status==="Submitted"||f.status==="Returned for Revision").length,ownCompleted:mine.filter(f=>f.status==="Approved (Documentation Only)"||f.status==="Rejected").length,toReview,completedReviews};
}
