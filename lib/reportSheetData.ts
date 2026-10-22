/** Centralized, source-linked (read-only) reporting views for the browser-only HRMS. */
import type {HRState} from "./hrState";
import type {Branch} from "./mock";
import {normalizePayrollConfig} from "./payrollConfig";
import {employeePaySnapshot} from "./employee201Rates";
import {batchForDraft,batchForRelease} from "./payrollBatches";
import type {ReportSheet} from "../components/ReportSpreadsheet";

export function buildHRReportSheets(data:HRState,branch:Branch):ReportSheet[]{
 const people=data.people.filter(p=>branch==="All Shops"||p.branch===branch);
 const byId=new Map(data.people.map(p=>[p.id,p]));
 const inBranch=(employeeId:string)=>branch==="All Shops"||byId.get(employeeId)?.branch===branch;
 const cfg=normalizePayrollConfig(data.payrollConfig);
 const releases=data.payrollReleases.filter(r=>inBranch(r.employeeId));
 const drafts=cfg.payslipDrafts.filter(r=>inBranch(r.employeeId));
 const batches=cfg.attendanceRecords.filter(r=>branch==="All Shops"||r.branch===branch);
 const punches=cfg.attendanceRows.filter(r=>branch==="All Shops"||r.branch===branch);
 const assets=data.assets.filter(r=>branch==="All Shops"||r.homeBranch===branch||(r.employeeId&&inBranch(r.employeeId)));
 return [
  {id:"payroll-releases",title:"Payslip Releases",note:"Amounts reflect stored sample/review payroll releases, not verified bank disbursements.",columns:[{label:"Payroll Batch ID"},{label:"Payslip / Release ID"},{label:"Employee ID"},{label:"Employee"},{label:"Branch"},{label:"Cutoff Start"},{label:"Cutoff End"},{label:"Release Date"},{label:"Kind"},{label:"Gross",kind:"money"},{label:"Deductions",kind:"money"},{label:"Net Pay",kind:"money"},{label:"Status"},{label:"Source"}],rows:releases.map(r=>[batchForRelease(r,data.people),r.id,r.employeeId,byId.get(r.employeeId)?.name||"Unknown",byId.get(r.employeeId)?.branch||"—",r.periodStart,r.periodEnd,r.paidAt,r.kind,r.gross,r.deductions,r.net,r.status,r.source])},
  {id:"payslip-drafts",title:"Payslip Drafts",note:"Draft and approval statuses are view-only. Use Payroll Management to review or approve individual payslips.",columns:[{label:"Payroll Batch ID"},{label:"Draft ID"},{label:"Employee ID"},{label:"Employee"},{label:"Branch"},{label:"Cutoff Start"},{label:"Cutoff End"},{label:"Days",kind:"number"},{label:"OT Hours",kind:"number"},{label:"Allowances",kind:"money"},{label:"Gross",kind:"money"},{label:"Deductions",kind:"money"},{label:"Net Pay",kind:"money"},{label:"Status"},{label:"Attendance Source"}],rows:drafts.map(d=>[batchForDraft(d,data.people),d.id,d.employeeId,byId.get(d.employeeId)?.name||"Unknown",byId.get(d.employeeId)?.branch||"—",d.periodStart,d.periodEnd,d.workedDays??d.days,d.otHours,d.allowances,d.gross,d.deductions,d.net,d.status,d.attendanceSource||"Manual / demo"])},
  {id:"employee-directory",title:"Employee Directory",note:"Basic Rate is the effective reference amount in its original daily/monthly unit, including recorded rate changes. Not an approved payroll computation.",columns:[{label:"Employee ID"},{label:"Employee"},{label:"Branch"},{label:"Department"},{label:"Position"},{label:"Employment Status"},{label:"Hire Date"},{label:"Salary Type"},{label:"Current Basic Rate",kind:"money",sum:false}],rows:people.map(p=>[p.id,p.name,p.branch,p.department,p.position,p.status,p.hire,p.salaryType,employeePaySnapshot(p,data.rates,cfg.rateChanges).basic])},
  {id:"attendance-batches",title:"Attendance Batches",note:"Batch status is only an upload/verification reference; check employee-level attendance coverage before approving payroll.",columns:[{label:"Batch ID"},{label:"Branch"},{label:"Cutoff Start"},{label:"Cutoff End"},{label:"Status"},{label:"File Name"},{label:"Uploaded"},{label:"Verified"}],rows:batches.map(b=>[b.id,b.branch,b.periodStart,b.periodEnd,b.status,b.fileName,b.uploadedAt,b.verifiedAt||""])},
  {id:"attendance-rows",title:"Attendance Rows",note:"Rows exist only where validated imports have actually populated browser attendance records. Not authenticated biometrics.",columns:[{label:"Employee ID"},{label:"Employee"},{label:"Branch"},{label:"Date"},{label:"Time In"},{label:"Time Out"},{label:"Status"},{label:"Worked Hours",kind:"number"},{label:"Late Minutes",kind:"number"},{label:"Approved OT",kind:"number"}],rows:punches.map(r=>[r.employeeId,byId.get(r.employeeId)?.name||"Unknown",r.branch,r.date,r.timeIn,r.timeOut,r.status,r.workedHours,r.lateMinutes,r.approvedOtHours])},
  {id:"assets",title:"Asset Inventory",note:"Asset statuses reflect browser-local inventory records, not independently verified physical stock counts.",columns:[{label:"Asset ID"},{label:"Asset"},{label:"Serial"},{label:"Home Branch"},{label:"Assigned To"},{label:"Status"},{label:"Condition"},{label:"Last Change"}],rows:assets.map(a=>[a.id,a.name,a.serial,a.homeBranch||"",byId.get(a.employeeId)?.name||a.employeeId||"Unassigned",a.status,a.condition,a.date])}
 ];
}
