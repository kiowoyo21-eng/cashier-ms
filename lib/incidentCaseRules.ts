/** Frontend incident-case scoping rules. Real confidentiality requires backend access control. */
import type {IncidentCase} from "./incidentRecords";

type BranchPerson={id:string;branch:string};

export function incidentBranchPeople<T extends BranchPerson>(people:readonly T[],caseBranch:string):T[]{
 return people.filter(p=>p.branch===caseBranch);
}

/** Both verified Employee 201 links must exist, be distinct, and belong to the case branch. */
export function incidentLinksVerifiedInBranch(c:Pick<IncidentCase,"branch"|"reporterEmployeeId"|"respondentEmployeeId">,people:readonly BranchPerson[]):boolean{
 if(!c.reporterEmployeeId||!c.respondentEmployeeId||c.reporterEmployeeId===c.respondentEmployeeId)return false;
 const scoped=incidentBranchPeople(people,c.branch);
 return scoped.some(p=>p.id===c.reporterEmployeeId)&&scoped.some(p=>p.id===c.respondentEmployeeId);
}
