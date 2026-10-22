/** Browser-only attendance review guards. CSV punches are untrusted until independently checked. */
import type {Person} from "./people";
import type {AttendanceRecord,ImportedAttendanceRow,PayslipDraft} from "./payrollConfig";
import {addCutoffDays,employeeCoverage} from "./attendanceUpload";

export const cutoffRows=(rows:readonly ImportedAttendanceRow[],branch:string,start:string)=>
 rows.filter(r=>r.branch===branch&&r.date>=start&&r.date<=addCutoffDays(start,6));

export function attendanceReviewSummary(people:readonly Person[],rows:readonly ImportedAttendanceRow[],branch:string,start:string){
 const selected=cutoffRows(rows,branch,start);
 const ids=new Set(selected.map(r=>r.employeeId));
 const employees=people.filter(p=>p.branch===branch&&p.hire<=addCutoffDays(start,6));
 const details=employees.map(p=>({employeeId:p.id,name:p.name,...employeeCoverage(selected,p.id,start,p.hire)}));
 const uploaded=details.filter(x=>ids.has(x.employeeId));
 return {uploadedRows:selected.length,employeesInBranch:employees.length,employeesUploaded:uploaded.length,
  readyEmployees:uploaded.filter(x=>x.ready).length,partialEmployees:uploaded.filter(x=>!x.ready),
  notUploaded:details.filter(x=>!ids.has(x.employeeId)),
  onLeaveRows:selected.filter(x=>x.status==="On Leave").length,
  approvedOtRows:selected.filter(x=>x.approvedOtHours>0).length,
  canVerify:uploaded.length>0&&uploaded.every(x=>x.ready)};
}

/** Must be used for a new approval; metadata-only legacy uploads never count as row verification. */
export function attendanceApprovalCheck(employee:Person,start:string,records:readonly AttendanceRecord[],rows:readonly ImportedAttendanceRow[]){
 const record=records.find(x=>x.branch===employee.branch&&x.periodStart===start&&x.periodEnd===addCutoffDays(start,6));
 if(!record||record.status!=="Verified")return {ready:false,reason:"Attendance CSV must be reviewed and Verified for this branch and cutoff."};
 const scope=cutoffRows(rows,employee.branch,start);
 const coverage=employeeCoverage(scope,employee.id,start,employee.hire);
 if(!coverage.ready)return {ready:false,reason:`Employee attendance is incomplete: ${coverage.missing.length} missing day(s), ${coverage.incomplete.length} incomplete punch(es). Metadata-only uploads do not count.`};
 return {ready:true,reason:"Attendance covered (demo). Pay figures and leave treatment still require independent review."};
}

/** Do not overwrite evidence after a draft was submitted, approved, or released. */
export function attendanceReplacementBlock(branch:string,start:string,drafts:readonly PayslipDraft[],released:boolean,people:readonly Person[]){
 if(released)return "This cutoff has a recorded release; attendance evidence cannot be replaced in the demo.";
 if(drafts.some(d=>d.periodStart===start&&d.status!=="Draft"&&people.some(p=>p.id===d.employeeId&&p.branch===branch)))
  return "A payroll draft is already submitted, approved, or released for this cutoff. Resolve it before replacing attendance.";
 return "";
}

/** Comparison only: company paid-day, leave and OT policies are NOT inferred from CSV. */
export function attendanceDraftComparison(draft:Pick<PayslipDraft,"employeeId"|"periodStart"|"days"|"otHours">,
 employee:Person,rows:readonly ImportedAttendanceRow[]){
 const scope=cutoffRows(rows,employee.branch,draft.periodStart).filter(r=>r.employeeId===draft.employeeId);
 const present=scope.filter(r=>r.status==="Present").length;
 const overtime=Math.round(scope.reduce((sum,r)=>sum+(r.otApproved?r.approvedOtHours:0),0)*100)/100;
 const leave=scope.filter(r=>r.status==="On Leave").length;
 const absent=scope.filter(r=>r.status==="Absent").length;
 const mismatchedDays=Math.abs(Number(draft.days)-present)>0.01;
 const mismatchedOT=Math.abs(Number(draft.otHours)-overtime)>0.01;
 return {present,leave,absent,overtime,mismatchedDays,mismatchedOT,needsReview:mismatchedDays||mismatchedOT||leave>0};
}
