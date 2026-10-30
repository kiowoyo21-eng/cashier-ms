import type {BranchId, Database, User} from './data';
import {log,uid} from './data';

/** Operational balances maintained by Admin, not bank-verified balances or RFP allocations. */
export type FinancialEntity='UC'|'MM';
export type FinancialAccountKind='Cash'|'Bank'|'Terminal / QR'|'Other';
export interface FinancialAccount {
 id:string;name:string;entity:FinancialEntity;branch?:BranchId;kind:FinancialAccountKind;
 openingBalance:number;openingDate:string;createdAt:string;createdBy:string;updatedAt?:string;
}
export interface AccountLedgerEntry {
 id:string;accountId:string;kind:'Opening Adjustment'|'Inflow'|'Outflow';amount:number;date:string;
 reason:string;by:string;at:string;before?:number;after?:number;reference?:string;
}
const toCents=(n:number)=>Math.round(n*100);
const moneyOk=(n:number)=>Number.isFinite(n)&&n>=0&&Math.abs(n*100-Math.round(n*100))<1e-7;
const dateOk=(s:string)=>/^\d{4}-\d{2}-\d{2}$/.test(s)&&!Number.isNaN(Date.parse(s));
const getAdmin=(db:Database,id:string):User=>{const u=db.users.find(u=>u.id===id&&u.active&&u.role==='admin');if(!u)throw new Error('Only an active Admin may change financial accounts.');return u};
export const financialAccountBalance=(db:Database,id:string):number=>{
 const account=(db.financialAccounts||[]).find(a=>a.id===id);if(!account)return 0;
 return ((db.accountLedger||[]).filter(e=>e.accountId===id&&e.kind!=='Opening Adjustment').reduce((n,e)=>n+(e.kind==='Inflow'?toCents(e.amount):-toCents(e.amount)),toCents(account.openingBalance)))/100;
};
export function createFinancialAccount(db:Database,adminId:string,name:string,entity:FinancialEntity,branch:BranchId|undefined,kind:FinancialAccountKind,opening:number,date:string,reason:string):Database{
 getAdmin(db,adminId);
 const clean=name.trim().replace(/\s+/g,' ');
 if(clean.length<2)throw new Error('Enter an account name.');
 if(!moneyOk(opening)||!dateOk(date)||!reason.trim())throw new Error('Starting amount, date, and reference are required.');
 if(branch&&(branch==='MMM'?'MM':'UC')!==entity)throw new Error('Branch does not belong to the selected company.');
 if((db.financialAccounts||[]).some(a=>a.entity===entity&&a.branch===branch&&a.name.toLowerCase()===clean.toLowerCase()))throw new Error('An account with this name already exists in the selected scope.');
 const at=new Date().toISOString();const id=uid();
 const account:FinancialAccount={id,name:clean,entity,branch,kind,openingBalance:opening,openingDate:date,createdAt:at,createdBy:adminId};
 const entry:AccountLedgerEntry={id:uid(),accountId:id,kind:'Opening Adjustment',amount:opening,date,reason:reason.trim(),by:adminId,at,before:0,after:opening};
 return log({...db,financialAccounts:[...(db.financialAccounts||[]),account],accountLedger:[entry,...(db.accountLedger||[])]},adminId,'Financial account created',`${clean} · ${entity} · ${opening} opening · ${reason.trim()}`);
}
export function changeAccountOpening(db:Database,adminId:string,id:string,amount:number,date:string,reason:string):Database{
 getAdmin(db,adminId);const a=(db.financialAccounts||[]).find(a=>a.id===id);if(!a)throw new Error('Account not found.');
 if(!moneyOk(amount)||!dateOk(date)||!reason.trim())throw new Error('Valid amount, date, and adjustment reason required.');
 // Changing the base does not create a second cash movement. Keep history for audit.
 const at=new Date().toISOString();const entry:AccountLedgerEntry={id:uid(),accountId:id,kind:'Opening Adjustment',amount,date,reason:reason.trim(),by:adminId,at,before:a.openingBalance,after:amount};
 return log({...db,financialAccounts:db.financialAccounts!.map(x=>x.id===id?{...x,openingBalance:amount,openingDate:date,updatedAt:at}:x),accountLedger:[entry,...(db.accountLedger||[])]},adminId,'Financial account opening adjusted',`${a.name} · ${a.openingBalance} → ${amount} · ${reason.trim()}`);
}
export function postAccountMovement(db:Database,adminId:string,id:string,kind:'Inflow'|'Outflow',amount:number,date:string,reference:string,reason:string):Database{
 getAdmin(db,adminId);const a=(db.financialAccounts||[]).find(a=>a.id===id);if(!a)throw new Error('Account not found.');
 if(!moneyOk(amount)||amount<=0||!dateOk(date)||!reason.trim())throw new Error('Positive amount, date, and reason are required.');
 if(!reference.trim())throw new Error('Transaction reference is required to reduce duplicate recording.');
 if((db.accountLedger||[]).some(e=>e.accountId===id&&e.kind!=='Opening Adjustment'&&e.reference?.trim().toLowerCase()===reference.trim().toLowerCase()))throw new Error('This account reference was already recorded.');
 const at=new Date().toISOString();const entry:AccountLedgerEntry={id:uid(),accountId:id,kind,amount,date,reference:reference.trim(),reason:reason.trim(),by:adminId,at};
 return log({...db,accountLedger:[entry,...(db.accountLedger||[])]},adminId,'Financial account movement',`${a.name} · ${kind} ${amount} · ${reference.trim()}`);
}
