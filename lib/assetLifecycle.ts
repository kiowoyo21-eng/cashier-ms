/** Asset custody transitions for the browser-only HRMS prototype.
 * These checks support the UI; they are not server-side authorization.
 */
import type {AssetRecord,AssetStatus,HRPerson} from "./hrState";

export type AssetAction="assign"|"request-return"|"retrieve"|"inspect";
export type InspectionOutcome="Free"|"Maintenance"|"Retired";

export function canStartAssetAction(status:AssetStatus,action:AssetAction):boolean{
 switch(action){
  case "assign":return status==="Free"||status==="Pending Turnover";
  case "request-return":return status==="Assigned";
  case "retrieve":return status==="Assigned"||status==="For Return";
  case "inspect":return status==="Inspection"||status==="Maintenance";
 }
}

/** A normal assignment must remain at the asset's registered branch.
 * Interbranch transfers need a separate, approved custody-transfer workflow.
 */
export function canAssignAssetToEmployee(asset:AssetRecord,person:Pick<HRPerson,"id"|"branch">|undefined):boolean{
 return Boolean(person&&person.id&&(!asset.homeBranch||person.branch===asset.homeBranch));
}

export function nextAssetId(assets:readonly Pick<AssetRecord,"id">[]):string{
 const taken=new Set(assets.map(a=>a.id));
 const high=assets.reduce((max,a)=>{const match=/^AST-(\d+)$/.exec(a.id);const n=match?Number(match[1]):0;return Number.isSafeInteger(n)?Math.max(max,n):max},1000);
 let n=high+1;
 while(taken.has(`AST-${n}`))n++;
 return `AST-${n}`;
}

/** Requesting a return does not release the employee from custody. */
export function requestAssetReturn(asset:AssetRecord,reason:string,date:string):AssetRecord|null{
 const trimmed=reason.trim();
 if(!canStartAssetAction(asset.status,"request-return")||trimmed.length<3)return null;
 return {...asset,status:"For Return",notes:[asset.notes,`Return request (${date}): ${trimmed}`].filter(Boolean).join("\n"),history:[`${date}: Return requested; device remains in employee custody until physical receipt`,...asset.history],date};
}

/** A returned device stays linked to its previous custodian until inspection is completed. */
export function receiveAssetReturn(asset:AssetRecord,fields:{condition:string;accessories:string;notes:string},date:string):AssetRecord|null{
 if(!canStartAssetAction(asset.status,"retrieve")||!asset.employeeId)return null;
 return {...asset,status:"Inspection",condition:fields.condition,accessories:fields.accessories,notes:fields.notes,date,history:[`${date}: Physical return recorded; awaiting inspection (previous custodian: ${asset.employeeId})`,...asset.history]};
}

/** Releasing custody happens only when inspection is finalized, regardless of outcome. */
export function closeAssetInspection(asset:AssetRecord,outcome:InspectionOutcome,fields:{condition:string;accessories:string;notes:string},date:string):AssetRecord|null{
 if(!canStartAssetAction(asset.status,"inspect")||!(["Free","Maintenance","Retired"] as string[]).includes(outcome))return null;
 if(outcome==="Free"&&!(["New","Good","Used"] as string[]).includes(fields.condition))return null;
 return {...asset,status:outcome,employeeId:"",signed:false,signatureEvidence:"",signingMethod:undefined,assignedBy:undefined,assignmentDate:undefined,
  condition:fields.condition,accessories:fields.accessories,notes:fields.notes,date,
  history:[`${date}: Inspection completed — ${outcome}${asset.employeeId?` (previous custodian: ${asset.employeeId})`:""}`, ...asset.history]};
}
