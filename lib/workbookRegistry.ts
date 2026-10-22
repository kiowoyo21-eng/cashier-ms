/** Dedicated report workbooks; authoritative HRMS records stay read-only. Browser-local prototype. */
import type {HRState} from "./hrState";
import {employeePaySnapshot,maskGovId} from "./employee201Rates";
import type {Branch} from "./mock";
import {buildHRReportSheets} from "./reportSheetData";
import {batchForDraft} from "./payrollBatches";
import type {ReportSheet,ReportColumn,ReportCell} from "../components/ReportSpreadsheet";
import {demoLoans} from "./loanLedger";
import {seedIncidents} from "./incidentRecords";
import {RECRUITMENT_KEY,initialApplicants} from "./recruitmentCatalog";

export const WORKBOOKS=[
 {id:"employees",name:"Employee 201",description:"Employee master register, compensation rates, government IDs",module:"employees"},
 {id:"attendance",name:"Attendance",description:"Verified upload batches and recorded time entries",module:"payroll"},
 {id:"payroll",name:"Payroll & Payslips",description:"Separate payroll batches, with draft and release sheets for each run",module:"payroll"},
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
export function buildWorkbookSheets(data:HRState,branch:Branch,workbook:WorkbookId,selectedBatchId?:string):ReportSheet[]{
 const base=buildHRReportSheets(data,branch);
 const pick=(...ids:string[])=>base.filter(s=>ids.includes(s.id));
 const people=data.people.filter(p=>onlyBranch(p.branch,branch));
 if(workbook==="employees"){
  const changes=data.payrollConfig?.rateChanges||[];
  const snapshot=(p:typeof people[number])=>employeePaySnapshot(p,data.rates,changes);
  const missing=(v:string|number|undefined)=>v===undefined||v===null||v===""?"Not recorded":v;
  return [
   ...pick("employee-directory"),
   extra("employee-personal","Personal & Emergency Details",[
    "Employee ID","Full Name","Middle Name","Suffix","Gender","Birth Date","Birth Place","Nationality","Civil Status","Residence Address","Email","Phone","Emergency Contact","Relationship","Emergency Phone","Emergency Address"
   ],people.map(p=>[p.id,p.name,missing(p.middleName),missing(p.suffix),p.gender,missing(p.birthDate),missing(p.placeOfBirth),missing(p.nationality),missing(p.civilStatus),missing(p.address),missing(p.email),missing(p.phone),missing(p.emergencyName),missing(p.emergencyRelationship),missing(p.emergencyPhone),missing(p.emergencyAddress)]),"Employee 201 source values only. Unrecorded fields stay explicitly missing; confidentiality applies to exported copies."),
   extra("employee-employment","Employment & Assignments",[
    "Employee ID","Full Name","Branch","Department","Position","Status","Original Hire Date","Probation (Months)","SIL Allocation","VIL Allocation","Assignment History Entries"
   ],people.map(p=>[p.id,p.name,p.branch,p.department,p.position,p.status,p.hire,p.probation,p.sil,p.vil,p.assignmentHistory?.length||0]),"Current assignment and allocated credits only, not verified leave balances."),
   extra("employee-rates","Compensation & Premiums",[
    "Employee ID","Employee","Salary Type","Current Basic Rate (PHP)","Effective Date","Monthly Work Days","Hours / Day","Daily Rate","Hourly Rate","OT %","OT / Hour","HP %","HP / Day","SHP %","SHP / Day","RDW %","RDW / Day","RDOT %","RDOT / Hour"
   ],people.map(p=>{const r=snapshot(p);return [p.id,p.name,p.salaryType,r.basic,r.basicEffective||"Not recorded",p.monthlyWorkDays??"Not configured",p.hoursPerDay??"Not configured",r.daily??"Not configured",r.hourly??"Not configured",r.premium.ot,r.ot??"Not configured",r.premium.regular,r.hp??"Not configured",r.premium.special,r.shp??"Not configured",r.premium.rdw,r.rdw??"Not configured",r.premium.rdot,r.rdot??"Not configured"]}),"Calculated reference rates, not verified payroll or payment instructions. Never assume a monthly divisor or daily hours when unconfigured."),
   extra("employee-rate-history","Recorded Rate Changes",[
    "Record ID","Employee ID","Employee","Salary Type","Amount (PHP)","Effective Date","Status","Reason","Recorded At"
   ],changes.filter(c=>people.some(p=>p.id===c.employeeId)).sort((a,b)=>b.effective.localeCompare(a.effective)).map(c=>[c.id,c.employeeId,people.find(p=>p.id===c.employeeId)?.name||"Unknown",c.salaryType,c.amount,c.effective,c.status,c.reason,c.recordedAt]),"Only explicitly saved payroll rate-change records. Initial compensation is in Compensation & Premiums; no fictional history."),
   extra("employee-government","Government & Contact Details",[
    "Employee ID","Employee","Branch","SSS (masked)","PhilHealth (masked)","Pag-IBIG (masked)","TIN (masked)","Email","Phone","Hire Date","Civil Status"
   ],people.map(p=>[p.id,p.name,p.branch,maskGovId(p.sssNumber),maskGovId(p.philhealthNumber),maskGovId(p.pagibigNumber),maskGovId(p.tinNumber),missing(p.email),missing(p.phone),p.hire,missing(p.civilStatus)]),"Government IDs masked on spreadsheet exports. Full identifiers remain in the restricted Employee 201 record and require real backend authorization before production."),
   extra("employee-documents","Employee Document Checklist",[
    "Employee ID","Employee","Branch","Document","Verification Status","File Reference"
   ],people.flatMap(p=>p.documents.map(doc=>[p.id,p.name,p.branch,doc.name,doc.status,doc.fileName||"No file reference"])) ,"Document filenames/status only. No bytes attached to worksheet; verification is not proof of legal validity."),
   extra("employee-assignments","Assignment History",[
    "Employee ID","Employee","Effective Date","Action","Branch","Department","Position","Memo ID","Memo Type"
   ],people.flatMap(p=>(p.assignmentHistory||[]).map(a=>[p.id,p.name,a.effectiveDate,a.kind,a.branch,a.department,a.position,a.memoId||"",a.memoType||""])) ,"Records only explicitly saved assignments. Missing historical records are not inferred.")
  ];
 }
 if(workbook==="attendance")return pick("attendance-batches","attendance-rows");
 if(workbook==="payroll"){
  const byEmployee=new Map(data.people.map(p=>[p.id,p]));
  const handoff=extra("disbursement-handoff","Disbursement Handoff",["Payroll Batch ID","Employee ID","Employee","Branch","Cutoff End","Net Pay","Payment Channel","Bank","Account Last 4 (masked)","Destination Review","Draft Status"],
    (data.payrollConfig?.payslipDrafts||[]).filter(d=>onlyBranch(byEmployee.get(d.employeeId)?.branch,branch)).map(d=>{
      const employee=byEmployee.get(d.employeeId),destination=employee?.salaryDestination;
      return [batchForDraft(d,data.people),d.employeeId,employee?.name||"Unknown",employee?.branch||"Unknown",d.periodEnd,d.net,destination?.channel||"Not configured",destination?.bankName||"",destination?.accountLast4||"",destination?.status||"Not configured",d.status];
    }),"Masked accounting handoff only. This is NOT a payment instruction or actual disbursement confirmation.");
  return [...pick("payslip-drafts","payroll-releases"),handoff].map(sheet=>({
  ...sheet,
  id:`${selectedBatchId||"unselected"}--${sheet.id}`,
  title:sheet.title,
  rows:selectedBatchId?sheet.rows.filter(row=>String(row[0])===selectedBatchId):[],
  note:selectedBatchId?`Batch ${selectedBatchId}. All rows belong to this payroll run. View only—export does not authorize disbursement.`:"Select a payroll batch above to load records. Different batches are never combined."
 }));
 }
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
