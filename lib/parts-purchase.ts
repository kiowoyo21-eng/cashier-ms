import {normalizePlate, type BranchId} from './data';

/** PB vehicle details are optional; the plate and authorized branch drive POS/COGS association. */
export function partsPurchaseHeaderIssue(details:{
 branch:BranchId;assignedBranch:BranchId;plate:string;vehicleYear:string;
},currentYear=new Date().getFullYear()):string|null {
 if(details.branch!==details.assignedBranch)return 'You may record parts purchases only for your assigned branch.';
 if(!normalizePlate(details.plate))return 'Plate number is required to match parts with the correct POS.';
 const year=details.vehicleYear.trim();
 if(year&&(!/^[0-9]{4}$/.test(year)||Number(year)<1950||Number(year)>currentYear+1))return 'Enter a valid year or leave Year blank.';
 return null;
}
