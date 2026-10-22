/** Internal branch review helpers; NOT government filing/official verification. */
export type ComplianceSnapshot<B extends string=string>={
 agency:string;title:string;due:string;branch:string;scope?:"all"|"selected";
 selectedBranches?:B[];status:string;proof:string;
 branchStatuses?:Partial<Record<B,string>>;branchProofs?:Partial<Record<B,string>>;
};
export function taskBranches<B extends string>(item:ComplianceSnapshot<B>,shops:readonly B[]):B[]{
 if(item.scope==="all"||(!item.scope&&item.branch==="All Shops"))return [...shops];
 if(item.scope==="selected")return shops.filter(b=>item.selectedBranches?.includes(b));
 return shops.filter(b=>b===item.branch);
}
export function branchVerified<B extends string>(item:ComplianceSnapshot<B>,b:B,shops:readonly B[]):boolean{
 const list=taskBranches(item,shops);if(!list.includes(b))return false;
 // Legacy one-branch records retain their original status and evidence reference.
 // Shared/multi-branch records require an explicit per-branch status and reference.
 const multi=list.length>1;
 const state=item.branchStatuses?.[b]??(multi?"Draft":item.status);
 const ref=item.branchProofs?.[b]??(multi?"":item.proof);
 return state==="Verified"&&Boolean(ref?.trim());
}
export function countVerified<B extends string>(item:ComplianceSnapshot<B>,shops:readonly B[]){return taskBranches(item,shops).filter(b=>branchVerified(item,b,shops)).length;}
export function isValidCalendarDate(value:string):boolean{
 if(!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;
 const date=new Date(value+"T12:00:00Z");
 return Number.isFinite(date.getTime())&&date.toISOString().slice(0,10)===value;
}
export function complianceTransitionAllowed(from:string,to:string):boolean{
 if(from===to)return true;
 const changes:Record<string,readonly string[]>={Draft:["For Approval"],"For Approval":["Draft","Approved"],Approved:["For Approval","In Progress"],"In Progress":["Approved","Submitted"],Submitted:["In Progress","Verified"],Verified:["In Progress"]};
 return Boolean(changes[from]?.includes(to));
}
export function overlapsExistingTask<B extends string>(list:readonly ComplianceSnapshot<B>[],candidate:ComplianceSnapshot<B>,shops:readonly B[]){
 const branches=taskBranches(candidate,shops);
 return list.some(x=>x.agency===candidate.agency&&x.due===candidate.due&&x.title.trim().toLocaleLowerCase()===candidate.title.trim().toLocaleLowerCase()&&taskBranches(x,shops).some(b=>branches.includes(b)));
}
