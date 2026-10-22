/** Isolated payroll-run identities. Sample and legacy groups are inferred read-only;
 * they are never presented as newly approved payroll batches. */
import type {HRPerson, PayrollRelease} from "./hrState";
import type {PayrollConfig, PayslipDraft, PayrollBatch} from "./payrollConfig";

const slug=(text:string)=>text.toUpperCase().replace(/[^A-Z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,35)||"UNKNOWN";
export function legacyPayrollBatchId(branch:string,periodStart:string,periodEnd:string,source:"Sample"|"Legacy"="Legacy"){
 return `${source==="Sample"?"SAMPLE":"LEGACY"}-${slug(branch)}-${periodStart}-${periodEnd}`;
}
export const employeeBranch=(people:Pick<HRPerson,"id"|"branch">[],employeeId:string)=>people.find(p=>p.id===employeeId)?.branch||"Unknown branch";
export function batchForDraft(draft:PayslipDraft,people:Pick<HRPerson,"id"|"branch">[]):string{
 return draft.batchId||legacyPayrollBatchId(employeeBranch(people,draft.employeeId),draft.periodStart,draft.periodEnd);
}
export function batchForRelease(release:PayrollRelease,people:Pick<HRPerson,"id"|"branch">[]):string{
 return release.batchId||legacyPayrollBatchId(employeeBranch(people,release.employeeId),release.periodStart,release.periodEnd,release.source==="Sample"?"Sample":"Legacy");
}
export type PayrollBatchOverview=PayrollBatch&{draftCount:number;releaseCount:number;gross:number;deductions:number;net:number;statuses:Record<string,number>;legacy:boolean};
/** Never combine different explicit batch IDs, even when periods and branches coincide. */
export function payrollBatchOverviews(cfg:Pick<PayrollConfig,"payrollBatches"|"payslipDrafts">,releases:PayrollRelease[],people:Pick<HRPerson,"id"|"branch">[]):PayrollBatchOverview[]{
 const batches=new Map<string,PayrollBatch>();
 for(const b of cfg.payrollBatches)batches.set(b.id,b);
 for(const d of cfg.payslipDrafts){const id=batchForDraft(d,people);if(!batches.has(id))batches.set(id,{id,branch:employeeBranch(people,d.employeeId),periodStart:d.periodStart,periodEnd:d.periodEnd,createdAt:d.createdAt||"",label:"Historical draft group",source:"Legacy"});}
 for(const r of releases){const id=batchForRelease(r,people);if(!batches.has(id))batches.set(id,{id,branch:employeeBranch(people,r.employeeId),periodStart:r.periodStart,periodEnd:r.periodEnd,createdAt:r.paidAt||"",label:r.source==="Sample"?"Sample history":"Historical release group",source:r.source==="Sample"?"Sample":"Legacy"});}
 return Array.from(batches.values()).map(b=>{
  const drafts=cfg.payslipDrafts.filter(d=>batchForDraft(d,people)===b.id),items=releases.filter(r=>batchForRelease(r,people)===b.id&&r.status==="Released");
  const statuses:Record<string,number>={};for(const d of drafts)statuses[d.status]=(statuses[d.status]||0)+1;
  return {...b,draftCount:drafts.length,releaseCount:items.length,gross:items.reduce((n,r)=>n+r.gross,0),deductions:items.reduce((n,r)=>n+r.deductions,0),net:items.reduce((n,r)=>n+r.net,0),statuses,legacy:b.source!=="Browser Review"};
 }).sort((a,b)=>b.periodStart.localeCompare(a.periodStart)||b.createdAt.localeCompare(a.createdAt)||b.id.localeCompare(a.id));
}
/** The caller must validate the branch, cutoff and user permissions before creating. */
export function makePayrollBatch(branch:string,periodStart:string,periodEnd:string,label:string,id:string,createdAt:string):PayrollBatch{
 if(!branch.trim()||!/^\d{4}-\d{2}-\d{2}$/.test(periodStart)||!/^\d{4}-\d{2}-\d{2}$/.test(periodEnd)||periodEnd<periodStart||!id)throw Error("Invalid payroll batch details.");
 return {id,branch,periodStart,periodEnd,label:label.trim()||`Payroll ${periodStart} to ${periodEnd}`,createdAt,source:"Browser Review"};
}
/** For drafts created without a preselected batch, reuse a matching new batch only. */
export function ensurePayrollBatch(cfg:PayrollConfig,branch:string,periodStart:string,periodEnd:string,newId:string,createdAt:string,preferredId?:string){
 const matching=cfg.payrollBatches.filter(b=>b.branch===branch&&b.periodStart===periodStart&&b.periodEnd===periodEnd);
 const batch=matching.find(b=>b.id===preferredId)||matching.at(-1);
 if(batch)return {batchId:batch.id,payrollBatches:cfg.payrollBatches};
 const created=makePayrollBatch(branch,periodStart,periodEnd,"",newId,createdAt);
 return {batchId:created.id,payrollBatches:[...cfg.payrollBatches,created]};
}
