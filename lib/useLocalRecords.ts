"use client";
import {useEffect,useRef,useState,type Dispatch,type SetStateAction} from "react";
import {writeAuditEvent,changedFields} from "./auditTrail";
/** Frontend review persistence only. Never store real personal/confidential records here. */
export function useLocalRecords<T>(key:string,seed:T):[T,Dispatch<SetStateAction<T>>]{
 const [value,setValue]=useState<T>(seed);
 const [ready,setReady]=useState(false);
 const lastStored=useRef<string|null>(null);
 const hasStored=useRef(false);
 useEffect(()=>{try{const raw=localStorage.getItem(`uc-hr-ui-${key}`);if(raw!==null){hasStored.current=true;lastStored.current=raw;setValue(JSON.parse(raw) as T)}else {hasStored.current=false;lastStored.current=JSON.stringify(seed)}}catch{lastStored.current=JSON.stringify(seed)}setReady(true)},[key]);
 useEffect(()=>{if(!ready)return;
  const next=JSON.stringify(value);const old=lastStored.current;
  if(next===old){if(!hasStored.current)try{localStorage.setItem(`uc-hr-ui-${key}`,next);hasStored.current=true}catch{}return;}
  try{localStorage.setItem(`uc-hr-ui-${key}`,next);hasStored.current=true}catch{return}
  lastStored.current=next;
  if(old!==null){
   try{const previous=JSON.parse(old) as unknown;
    const oldItems=Array.isArray(previous)?previous:[],newItems=Array.isArray(value)?value:[];
    const ids=(items:unknown[])=>new Map(items.filter((v):v is Record<string,unknown>=>typeof v==="object"&&v!==null&&"id" in v).map(v=>[String(v.id),v]));
    const previousById=ids(oldItems),nextById=ids(newItems),allIds=[...new Set([...previousById.keys(),...nextById.keys()])];
    const changed=allIds.filter(id=>JSON.stringify(previousById.get(id))!==JSON.stringify(nextById.get(id)));
    const itemId=changed.length===1?changed[0]:"";
    const before=previousById.get(itemId)||{},after=nextById.get(itemId)||{};
    const names=itemId?changedFields(before,after):[];
    writeAuditEvent({module:key,action:"Updated module records",recordId:itemId,summary:itemId?`Record fields: ${names.join(", ")||"added/removed"}`:`${changed.length||1} record(s) changed; details redacted`});
   }catch{writeAuditEvent({module:key,action:"Updated module records",summary:"Local record change; values redacted"})}
  }
 },[key,value,ready]);
 return [value,setValue];
}
