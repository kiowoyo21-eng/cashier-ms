/** Shared public/admin hiring-form configuration. UI-review records only, no secure backend. */
export type HiringFormStatus = "Draft" | "Published" | "Paused" | "Closed";
export type HiringForm = {
  id:string;
  position:string;
  status:HiringFormStatus;
  minimumYears:number;
  education:string;
  qualifications:string[];
  questions:string[];
  onboardingDocuments?:string[];
  createdAt:string;
};
export type ApplicantStage = "New Applicant" | "Shortlisted" | "Phone Interview" | "Initial Interview" | "Final Interview" | "Passed" | "Hired" | "Rejected" | "On Hold";
export type ApplicantRequirement = {name:string;status:"Missing"|"Submitted"|"Verified";fileName?:string;required?:boolean;custom?:boolean};
export type HiringInterview = {id:string;round:string;at:string;interviewer:string;result:"Pending"|"Passed"|"Failed"|"Needs Follow-up"|"Did Not Attend";notes:string;scorecard?:Record<string,number>};
export type ApplicantRecord = {
  id:string; name:string;email:string;phone:string;role:string;branch:string;submitted:string;
  stage:ApplicantStage;notes:string;history?:string[];
  interviewAt?:string;interviewOutcome?:string;
  requirements:ApplicantRequirement[];
  relevantYears?:number|null;totalYears?:number|null;education?:string;
  qualifications?:Record<string,"Yes"|"No"|"Not provided">;
  answers?:Record<string,string>;
  resumeName?:string;
  interviews?:HiringInterview[];
  screeningChecklist?:Record<string,boolean>;
  offerStatus?:"Not sent"|"Sent"|"Accepted"|"Declined";
  hireDate?:string;
  signingStatus?:"Pending"|"Completed";
  uploadPortal?:{token:string;createdAt:string;expiresAt:string};
};
export const RECRUITMENT_KEY="recruitment";
export const HIRING_FORMS_KEY="hiring-forms";
export const BRANCHES=["UC Mandaluyong","UC Las Piñas","UC Quezon City","MM Mandaluyong"] as const;
export const DEFAULT_ONBOARDING_DOCUMENTS=["Resume / CV","Medical Clearance","Employment Contract"];
export const canonicalRequirement=(name:string)=>/^resume(\s*\/\s*cv)?$/i.test(name.trim())?"Resume / CV":name.trim();
export function uniqueRequirements(rows:ApplicantRequirement[]):ApplicantRequirement[]{
 const map=new Map<string,ApplicantRequirement>();
 for(const row of rows){const name=canonicalRequirement(row.name);if(!name)continue;const key=name.toLowerCase();const old=map.get(key);
  const candidate={...row,name};if(!old){map.set(key,candidate);continue}
  const score=(v:ApplicantRequirement)=>({Missing:0,Submitted:1,Verified:2})[v.status]+(v.fileName?3:0);
  const winner=score(candidate)>score(old)?candidate:old;
  map.set(key,{...winner,name,required:old.required!==false||candidate.required!==false,fileName:old.fileName||candidate.fileName,custom:old.custom&&candidate.custom});
 }
 return [...map.values()];
}
export function interviewCriteria(position:string):string[]{
 if(/technician|mechanic|automotive/i.test(position))return ["Technical Knowledge","Practical Repair Skills","Problem Solving","Workplace Safety","Communication"];
 if(/service advisor|cashier/i.test(position))return ["Customer Communication","Process Accuracy","Problem Solving","Service Knowledge","Professionalism"];
 return ["Role Knowledge","Communication","Problem Solving","Accuracy & Accountability","Professionalism"];
}

/** Example options for HR configuration, not legal certification requirements. */
export function positionDocumentSuggestions(position:string):string[]{
  if(/automotive|technician|mechanic/i.test(position))return ["Automotive NC II / relevant certification","Technical training certificates","Certificate of Employment / related experience","Driver's license (if role requires driving)"];
  if(/advisor/i.test(position))return ["Customer service training certificate","Certificate of Employment / relevant experience"];
  return ["Relevant training certificates","Certificate of Employment / related experience"];
}
export const DEFAULT_HIRING_FORMS:HiringForm[]=[
  {id:"automotive-technician",position:"Automotive Technician",status:"Published",minimumYears:2,education:"Technical/vocational training preferred",qualifications:["Automotive diagnostics","Preventive maintenance","Engine or transmission repair"],questions:["Which vehicle systems have you worked on?","Do you have any automotive certificates?"],onboardingDocuments:[...DEFAULT_ONBOARDING_DOCUMENTS,"Automotive NC II / relevant certification","Technical training certificates"],createdAt:"2026-10-01"},
  {id:"service-advisor",position:"Service Advisor",status:"Published",minimumYears:1,education:"High school, vocational or college graduate",qualifications:["Customer service","Vehicle service knowledge","Job orders and estimates"],questions:["Describe your experience explaining repairs to customers."],onboardingDocuments:[...DEFAULT_ONBOARDING_DOCUMENTS],createdAt:"2026-10-01"},
  {id:"hr-assistant",position:"HR Assistant",status:"Published",minimumYears:0,education:"Relevant HR/business education preferred",qualifications:["Records management","Scheduling","Office software"],questions:["Which HR tools or systems have you used?"],onboardingDocuments:[...DEFAULT_ONBOARDING_DOCUMENTS],createdAt:"2026-10-01"},
  {id:"branch-supervisor",position:"Branch Supervisor",status:"Published",minimumYears:3,education:"Relevant management or operational experience",qualifications:["Team supervision","Branch operations","Customer issue resolution"],questions:["How would you handle a customer complaint?"],onboardingDocuments:[...DEFAULT_ONBOARDING_DOCUMENTS],createdAt:"2026-10-01"},
];
export const makeFormId=(position:string)=>position.toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
export const candidateRequirements=(form?:HiringForm):ApplicantRequirement[]=>
  uniqueRequirements((form?.onboardingDocuments?.length?form.onboardingDocuments:DEFAULT_ONBOARDING_DOCUMENTS).map(name=>({name:canonicalRequirement(name),status:"Missing" as const,required:true})));
export const initialApplicants:ApplicantRecord[]=[
 {id:"APP-1001",name:"Rafael Mendoza",email:"rafael@example.com",phone:"09•• ••• 1001",role:"Automotive Technician",branch:"UC Mandaluyong",submitted:"2026-10-08",stage:"New Applicant",notes:"Sample application for layout review",relevantYears:5,totalYears:6,education:"Automotive servicing NC II",qualifications:{"Automotive diagnostics":"Yes","Preventive maintenance":"Yes","Engine or transmission repair":"Yes"},resumeName:"rafael_resume.pdf",requirements:[{name:"Resume / CV",status:"Submitted"},{name:"Medical Clearance",status:"Missing"},{name:"Employment Contract",status:"Missing"}]},
 {id:"APP-1002",name:"Kyla Ramos",email:"kyla@example.com",phone:"09•• ••• 1002",role:"Service Advisor",branch:"MM Mandaluyong",submitted:"2026-10-09",stage:"Shortlisted",notes:"Sample candidate awaiting interview schedule",relevantYears:2,totalYears:4,education:"College undergraduate",qualifications:{"Customer service":"Yes","Vehicle service knowledge":"Yes","Job orders and estimates":"No"},resumeName:"kyla_cv.pdf",requirements:[{name:"Resume / CV",status:"Verified"},{name:"Medical Clearance",status:"Missing"},{name:"Employment Contract",status:"Missing"}]},
 {id:"APP-1003",name:"Marco Bautista",email:"marco@example.com",phone:"09•• ••• 1003",role:"HR Assistant",branch:"UC Las Piñas",submitted:"2026-10-07",stage:"Initial Interview",interviewAt:"2026-10-14T10:00",notes:"Sample scheduled interview",relevantYears:1,totalYears:3,education:"BS Business Administration",resumeName:"marco_cv.pdf",qualifications:{"Records management":"Yes","Scheduling":"Yes","Office software":"Yes"},requirements:[{name:"Resume / CV",status:"Verified"},{name:"Medical Clearance",status:"Submitted"},{name:"Employment Contract",status:"Missing"}]},
 {id:"APP-1004",name:"Aira Castillo",email:"aira@example.com",phone:"09•• ••• 1004",role:"Branch Supervisor",branch:"UC Quezon City",submitted:"2026-10-06",stage:"Passed",notes:"Sample candidate selected for onboarding",relevantYears:4,totalYears:6,education:"BS Management",resumeName:"aira_resume.pdf",qualifications:{"Team supervision":"Yes","Branch operations":"Yes","Customer issue resolution":"Yes"},offerStatus:"Accepted",requirements:[{name:"Resume / CV",status:"Verified"},{name:"Medical Clearance",status:"Verified"},{name:"Employment Contract",status:"Submitted"}]}
];
