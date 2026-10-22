/** Pure frontend-review guards. Browser storage is not a security boundary. */
export type RecruitingCandidate = {id:string;branch:string;email:string;role:string;stage:string;interviews?:{result:string}[]};
export function branchCanView(selectedBranch:string,recordBranch:string){return selectedBranch==="All Shops"||selectedBranch===recordBranch;}
export function isDuplicateApplication(records:readonly RecruitingCandidate[],email:string,position:string,ignoreId?:string){
 const normalizedEmail=email.trim().toLocaleLowerCase();const normalizedPosition=position.trim().toLocaleLowerCase();
 return records.some(x=>x.id!==ignoreId&&x.email.trim().toLocaleLowerCase()===normalizedEmail&&x.role.trim().toLocaleLowerCase()===normalizedPosition);
}
export function mayScheduleInterview(candidate:RecruitingCandidate,when:string,interviewer:string,now=new Date()):string|null{
 if(!["Shortlisted","Phone Interview","Initial Interview","Final Interview"].includes(candidate.stage))return "Applicant must be shortlisted or in the interview cycle before scheduling.";
 if(candidate.interviews?.some(x=>x.result==="Pending"))return "Resolve the pending interview before scheduling another round.";
 if(!interviewer.trim())return "Enter the interviewer name.";
 if(!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(when))return "Choose a valid interview date and time.";
 const planned=new Date(when);
 const [year,month,day,hour,minute]=when.split(/[-T:]/).map(Number);
 if(!Number.isFinite(planned.getTime())||planned.getFullYear()!==year||planned.getMonth()+1!==month||planned.getDate()!==day||planned.getHours()!==hour||planned.getMinutes()!==minute)return "Choose a valid interview date and time.";
 if(planned.getTime()<now.getTime()-60000)return "Interview schedule must be in the future.";
 return null;
}
export function mayConfirmHire(candidate:RecruitingCandidate){return candidate.stage==="Passed";}
