"use client";
import {useEffect,useState,type Dispatch,type SetStateAction} from "react";
import {demoLoans,type LoanRecord} from "./loanLedger";
import {writeAuditEvent} from "./auditTrail";
const KEY="uc-hr-ui-loans";
const EVENT="ucmm-demo-loans-changed";
/** Shared, browser-local preview only. Do not enter confidential loans or use as an accounting ledger. */
export function useLoanLedger():[LoanRecord[],Dispatch<SetStateAction<LoanRecord[]>>]{
 const [loans,setLoans]=useState<LoanRecord[]>(demoLoans);
 const [ready,setReady]=useState(false);
 useEffect(()=>{
  const read=()=>{
   try{const raw=window.localStorage.getItem(KEY);if(raw){const parsed=JSON.parse(raw);if(Array.isArray(parsed))setLoans(previous=>JSON.stringify(previous)===raw?previous:parsed)}}catch{}
  };
  read();setReady(true);
  window.addEventListener(EVENT,read);window.addEventListener("storage",read);
  return()=>{window.removeEventListener(EVENT,read);window.removeEventListener("storage",read)};
 },[]);
 useEffect(()=>{
  if(!ready)return;
  try{
   const next=JSON.stringify(loans);
   if(window.localStorage.getItem(KEY)!==next){const previous=window.localStorage.getItem(KEY);window.localStorage.setItem(KEY,next);if(previous!==null)writeAuditEvent({module:"Loans & Advances",action:"Updated loan ledger",summary:"Loan record(s) updated; amounts and details withheld"});window.dispatchEvent(new Event(EVENT))}
  }catch{}
 },[loans,ready]);
 return [loans,setLoans];
}
