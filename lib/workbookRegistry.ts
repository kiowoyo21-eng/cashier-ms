/** Dedicated report workbooks; authoritative HRMS records stay read-only. Browser-local prototype. */
import type {HRState} from "./hrState";
import {effectiveRate} from "./hrState";
import type {Branch} from "./mock";
import {buildHRReportSheets} from "./reportSheetData";
import type {ReportSheet,ReportColumn,ReportCell} from "../components/ReportSpreadsheet";
import {demoLoans} from "./loanLedger";
import {seedIncidents} from "./incidentRecords";
import {RECRUITMENT_KEY,initialApplicants} from "./recruitmentCatalog";

export const WORKBOOKS=[
 {id:"employees",name:"Employee 201",description:"Employee master register, compensation rates, government IDs",module:"employees"},
 {id:"attendance",name:"Attendance",description:"Verified upload batches and recorded time entries",module:"payroll"},
 {id:"payroll",name:"Payroll & Payslips",description:"Drafts and releases; batch isolation remains a separate revision",module:"payroll"},
 {id:"assets",name:"Assets & Accountability",description:"Inventory and assignment/return information",module:"assets"},
 {id:"leave",name:"Leave Management",description:"Requests, leave-credit adjustments and current balances",module:"leave"},
 {id:"loans",name:"Loans & Advances",description:"Outstanding balances and authorized installment references",module:"payroll"},
 {id:"recruitment",name:"Recruitment",description:"Applicant tracking and interview overview",module:"lifecycle"},
 {id:"compliance",name:"Compliance",description:"Regulatory task tracking and evidence status",module:"compliance"},
 {id:"incidents",name:"Incident Cases",description:"Restricted case tracking, without confidential narratives",module:"ir"},
 {id:"working",name:"My Working Sheets",description:"Independent spreadsheets and approved imports",module:"spreadsheets"}
] as const;
export type WorkbookId=typeof WORKBOOKS[number]["id"];
export const isWorkbookId=(id:string):id is WorkbookId=>WORKBOOKS.some(w=>w.id===id);
export const workbookById=(id:string)=>WORKBOOKS.find(w=>w.id===id);
const col=(...names:string[]):ReportColumn[]=>names.map(label=>({label}));
const onlyBranch=(value:unknown,branch:Branch)=>branch==="All Shops"||value===branch;
const localRows=<T,>(key:string):T[]=>{
 if(typeof window==="undefined")return [];
 try{const rows=JSON.parse(window.localStorage.getItem(`uc-hr-ui-${key}`)||"null");return Array.isArray(rows)?rows as T[]:[]}catch{return []}
};
function extra(id:string,title:string,labels:string[],rows:ReportCell[][],note:string):ReportSheet{return {id,title,columns:col(...labels),rows,note}}
/** Never silently fabricate source rows: unopened/local-empty module stores report zero rows. */
export function buildWorkbookSheets(data:HRState,branch:Branch,workbook:WorkbookId):ReportSheet[]{
 const base=buildHRReportSheets(data,branch);
 const pick=(...ids:string[])=>base.filter(s=>ids.includes(s.id));
 const people=data.people.filter(p=>onlyBranch(p.branch,branch));
 if(workbook==="employees")return [
  ...pick("employee-directory"),
  extra("employee-rates","Compensation & Premiums",["Employee ID","Employee","Rate Type","Basic Rate (PHP)","Monthly Work Days","Hours / Day","Derived Daily Rate","Derived Hourly Rate","OT %","RDW %","RDOT %","HP %","SHP %","Rate Effective"],people.map(p=>{
   const r=effectiveRate(p,data.rates),workdays=p.monthlyWorkDays||0,hours=p.hoursPerDay||8;
   const daily=p.salaryType==="Daily"?p.rate:workdays>0?p.rate/workdays:"";
   return [p.id,p.name,p.salaryType,p.rate,workdays||"Not configured",hours,daily,typeof daily==="number"?Number((daily/hours).toFixed(4)):"",r.ot,r.rdw,r.rdot,r.regular,r.special,r.effective];
  }),"Derived rates are illustrative unless monthly work days and rate settings are configured; confirm payroll policy before use."),
  extra("employee-government","Government & Contact Details",["Employee ID","Employee","Branch","SSS","PhilHealth","Pag-IBIG","TIN","Email","Phone","Hire Date","Civil Status"],people.map(p=>[p.id,p.name,p.branch,p.sssNumber||"Not recorded",p.philhealthNumber||"Not recorded",p.pagibigNumber||"Not recorded",p.tinNumber||"Not recorded",p.email,p.phone,p.hire,p.civilStatus||""]),"Confidential reference: browser-local only. Avoid exporting actual IDs without appropriate authorization.")
 ];
 if(workbook==="attendance")return pick("attendance-batches","attendance-rows");
 if(workbook==="payroll")return pick("payslip-drafts","payroll-releases");
 if(workbook==="assets")return [
  ...pick("assets"),
  extra("asset-assignments","Assignments & Returns",["Asset ID","Asset","Employee ID","Employee","Branch","Status","Assigned Date","Condition","Signed","Last Update"],data.assets.filter(a=>onlyBranch(a.homeBranch||data.people.find(p=>p.id===a.employeeId)?.branch,branch)).map(a=>[a.id,a.name,a.employeeId||"",data.people.find(p=>p.id===a.employeeId)?.name||"",a.homeBranch||"",a.status,a.assignmentDate||"",a.condition,a.signed?"Yes":"No",a.date]),"Browser asset records only; not physical-asset verification.")
 ];
 if(workbook==="leave"){
  type Leave={id:number;employee:string;branch:string;type:string;from:string;to:string;days:number;status:string;notes?:string};
  type Credit={id:string;employeeId:string;type:string;days:number;effectiveDate:string;status:string;remarks:string};
  const requests=localRows<Leave>("leave").filter(l=>onlyBranch(l.branch,branch));
  const credits=localRows<Credit>("leave-credit-requests").filter(c=>people.some(p=>p.id===c.employeeId));
  return [
   extra("leave-requests","Leave Requests",["Request ID","Employee","Branch","Leave Type","From","To","Days","Status"],requests.map(r=>[r.id,r.employee,r.branch,r.type,r.from,r.to,r.days,r.status]),"Browser leave register. Older records use employee names; ambiguous matches are not silently linked to employee IDs."),
   extra("leave-credits","Leave Credit Requests",["Credit ID","Employee ID","Employee","Type","Days","Effective Date","Status"],credits.map(c=>[c.id,c.employeeId,people.find(p=>p.id===c.employeeId)?.name||"Unknown",c.type,c.days,c.effectiveDate,c.status]),"Only stored credit requests; no invented credits."),
   extra("leave-balances","Employee Leave Allocation",["Employee ID","Employee","Branch","SIL Allocated","VIL Allocated"],people.map(p=>[p.id,p.name,p.branch,p.sil,p.vil]),"Allocations only; not authoritative remaining balances while legacy leave records lack stable employee IDs.")
  ];
 }
 if(workbook==="loans"){
  const saved=localRows<typeof demoLoans[number]>("loans");const loans=saved.length?saved:demoLoans;
  return [extra("loan-register","Loans & Cash Advances",["Loan ID","Employee ID","Employee","Branch","Provider","Principal","Installment","Frequency","Start","Balance","Status","Authorized"],loans.filter(l=>onlyBranch(l.branch,branch)).map(l=>[l.id,l.employeeId||"Unlinked",l.employee,l.branch,l.provider,l.amount,l.payment,l.frequency,l.start,l.balance,l.status,l.authorized?"Yes":"No"]),"Stored browser ledger; verify loan authorization and payroll posting separately.")];
 }
 if(workbook==="recruitment"){
  type Applicant={id:string;name:string;branch:string;role:string;stage:string;email?:string;submitted?:string;interviewAt?:string;interviews?:{round:string;at:string;result:string}[]};
  const stored=localRows<Applicant>(RECRUITMENT_KEY);const applicants=(stored.length?stored:initialApplicants).filter(r=>onlyBranch(r.branch,branch));
  return [extra("applicant-register","Applicant Tracking",["Applicant ID","Name","Branch","Position","Stage","Applied"],applicants.map(a=>[a.id,a.name,a.branch,a.role,a.stage,a.submitted||""]),"Recruitment browser records only."),extra("interview-register","Interviews",["Applicant ID","Applicant","Round","Scheduled","Result"],applicants.flatMap(a=>(a.interviews||[]).map(i=>[a.id,a.name,i.round,i.at,i.result])),"Only explicitly recorded interviews.")];
 }
 if(workbook==="compliance"){
  type Compliance={id:number;agency:string;title:string;branch:string;due:string;frequency:string;owner:string;status:string;proof:string};
  return [extra("compliance-register","Compliance Tracker",["Record ID","Agency","Requirement","Branch","Due","Frequency","Owner","Status","Proof Reference"],localRows<Compliance>("compliance").filter(x=>onlyBranch(x.branch,branch)||x.branch==="All Shops").map(x=>[x.id,x.agency,x.title,x.branch,x.due,x.frequency,x.owner,x.status,x.proof||""]),"Dates and requirements must be verified against current agency rules.")];
 }
 if(workbook==="incidents"){
  type Incident={id:string;branch:string;stage:string;handler:string;priority:string;target:string;closedAt?:string};
  return [extra("incident-tracker","Restricted Incident Tracker",["Case ID","Branch","Stage","Handler","Priority","Target","Closed"],(localRows<Incident>("incident").length?localRows<Incident>("incident"):seedIncidents).filter(x=>onlyBranch(x.branch,branch)).map(x=>[x.id,x.branch,x.stage,x.handler,x.priority,x.target,x.closedAt||""]),"Case metadata only. Confidential descriptions, complainants, evidence and findings are not included.")];
 }
 return [{id:"working-sheet",title:"Working Sheet",note:"Independent working copy. Never writes into official HRMS records.",columns:[],rows:[]}];
}
/** Redirect legacy links to the correct single-module workbook. */
export const LEGACY_SHEET_WORKBOOK:Record<string,WorkbookId>={"employee-directory":"employees","payslip-drafts":"payroll","payroll-releases":"payroll","attendance-batches":"attendance","attendance-rows":"attendance","assets":"assets","working-sheet":"working"};
