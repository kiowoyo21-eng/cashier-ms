/** Browser-review selectors for consistent branch-scoped HRMS views.
 * UI scoping is NOT a backend authorization boundary.
 */
export type BranchPerson={id:string;branch:string};
export type BranchAsset={id:string;homeBranch?:string;employeeId:string;status:string};
export type BranchDraft={employeeId:string;status:string};
export type BranchRelease={id:string;employeeId:string};
export type BranchSignature={releaseId:string;status:string};

export function inBranch(recordBranch:string|undefined,selectedBranch:string):boolean{
 return selectedBranch==="All Shops"||recordBranch===selectedBranch;
}
export function assetBranch(asset:BranchAsset,people:readonly BranchPerson[]):string|undefined{
 return asset.homeBranch||people.find(p=>p.id===asset.employeeId)?.branch;
}
export function assetVisible(asset:BranchAsset,people:readonly BranchPerson[],selectedBranch:string):boolean{
 return inBranch(assetBranch(asset,people),selectedBranch);
}
export function pendingPayrollDraftCount(drafts:readonly BranchDraft[],people:readonly BranchPerson[],branch:string):number{
 const branches=new Map(people.map(p=>[p.id,p.branch]));
 return drafts.filter(d=>d.status==="For Review"&&inBranch(branches.get(d.employeeId),branch)).length;
}
export function pendingPayrollSignatureCount(signatures:readonly BranchSignature[],releases:readonly BranchRelease[],people:readonly BranchPerson[],branch:string):number{
 const branches=new Map(people.map(p=>[p.id,p.branch]));
 const employeeByRelease=new Map(releases.map(r=>[r.id,r.employeeId]));
 return signatures.filter(s=>s.status!=="Acknowledged (Demo Only)"&&s.status!=="Revoked"&&
  employeeByRelease.has(s.releaseId)&&inBranch(branches.get(employeeByRelease.get(s.releaseId)!),branch)).length;
}
