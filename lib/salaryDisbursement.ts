/**
 * Salary destination reference for the FRONTEND REVIEW project.
 * Store only the final four digits of a dummy account reference in browser-local state.
 * Real bank/mobile wallet account numbers, KYC evidence and approvals belong in an
 * encrypted, access-controlled backend, not localStorage or payslip CSV exports.
 */
export type SalaryChannel="BDO Payroll"|"Other Bank"|"GCash"|"GoTyme";
export type SalaryDestinationStatus="For Verification"|"Demo Checked"|"Needs Correction";
export type SalaryDestination={
 channel:SalaryChannel;
 bankName:string;
 accountName:string;
 accountLast4:string;
 status:SalaryDestinationStatus;
 updatedAt:string;
 checkedAt?:string;
 checkNote?:string;
};
export const salaryChannels:SalaryChannel[]=["BDO Payroll","Other Bank","GCash","GoTyme"];
export const emptySalaryDestination:SalaryDestination={channel:"BDO Payroll",bankName:"BDO",accountName:"",accountLast4:"",status:"For Verification",updatedAt:""};
export function salaryDestinationLabel(destination?:SalaryDestination){
 if(!destination)return "Not recorded";
 return `${destination.channel}${destination.channel==="Other Bank"&&destination.bankName?` (${destination.bankName})`:""} · ****${destination.accountLast4||"????"}`;
}
export function salaryDestinationReady(destination?:SalaryDestination){return Boolean(destination&&destination.status==="Demo Checked"&&destination.accountLast4.length===4&&destination.accountName.trim())}
