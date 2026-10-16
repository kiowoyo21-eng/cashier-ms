'use client';
import React,{createContext,useContext,useEffect,useState} from 'react';
import {Data,User,Role,BranchId,uid,iso,ACCESS,Screen} from './types';
import {seed} from './seed';
const DATA_KEY='uc_cms_local_v1',SESSION_KEY='uc_cms_session_v1';
type Context = {data:Data;user:User|null;ready:boolean;warning:string;setWarning:(v:string)=>void;login:(u:string,p:string)=>boolean;logout:()=>void;commit:(entity:string,entityId:string,action:string,edit:(d:Data)=>void,reason?:string,branchId?:BranchId)=>boolean;reset:()=>void;importData:(raw:string)=>boolean;exportData:()=>void;can:(screen:Screen)=>boolean;visibleBranch:(id:string)=>boolean;};
const C=createContext<Context|null>(null);
export function validateData(input:unknown):input is Data {if(!input||typeof input!=='object')return false;const a=input as Record<string,unknown>;return a.schemaVersion===1&&['users','pos','cash','counts','turnovers','disbursements','incidents','editRequests','suppliers','vehicles','reconciliations','audit'].every(k=>Array.isArray(a[k]))&&typeof a.sequence==='number';}
export function StoreProvider({children}:{children:React.ReactNode}){
 const [data,setData]=useState<Data>(()=>seed());const[user,setUser]=useState<User|null>(null);const[ready,setReady]=useState(false);const[warning,setWarning]=useState('');
 useEffect(()=>{try{const raw=localStorage.getItem(DATA_KEY);let start:Data;if(raw){const parsed:unknown=JSON.parse(raw);if(!validateData(parsed))throw new Error('Stored demo data has an unsupported schema; the reset/recovery option is available.');start=parsed;}else{start=seed();localStorage.setItem(DATA_KEY,JSON.stringify(start));}setData(start);const id=sessionStorage.getItem(SESSION_KEY);setUser(start.users.find(u=>u.id===id&&u.active)||null);}catch(e){setWarning(`Local data problem: ${e instanceof Error?e.message:'Unable to load'}. Export a backup if possible, or reset the demo.`);}finally{setReady(true)}},[]);
 const persist=(next:Data)=>{try{localStorage.setItem(DATA_KEY,JSON.stringify(next));setData(next);return true}catch(e){setWarning(`Cannot save in this browser (${e instanceof Error?e.message:'storage error'}). Reduce image size or export a backup.`);return false}};
 const login=(name:string,password:string)=>{const u=data.users.find(u=>u.username.toLowerCase()===name.trim().toLowerCase()&&u.password===password&&u.active);if(!u)return false;setUser(u);sessionStorage.setItem(SESSION_KEY,u.id);return true};
 const logout=()=>{setUser(null);sessionStorage.removeItem(SESSION_KEY)};
 const commit:Context['commit']=(entity,entityId,action,edit,reason,branchId)=>{if(!user){setWarning('Please sign in.');return false}try{const before=structuredClone(data);const next=structuredClone(data);edit(next);next.audit.unshift({id:uid(),actor:user.username,role:user.role,branchId,entity,entityId,action,before:entity==='POS'?before.pos.find(x=>x.id===entityId):entity==='Cash'?before.cash.find(x=>x.id===entityId):undefined,after:entity==='POS'?next.pos.find(x=>x.id===entityId):entity==='Cash'?next.cash.find(x=>x.id===entityId):undefined,reason,at:iso()});setWarning('');return persist(next)}catch(e){setWarning(e instanceof Error?e.message:'Operation failed');return false}};
 const reset=()=>{const d=seed();if(persist(d))logout()};
 const importData=(raw:string)=>{try{const v:unknown=JSON.parse(raw);if(!validateData(v))throw Error('Invalid backup (schemaVersion 1 and required collections expected).');if(!persist(v))return false;logout();return true}catch(e){setWarning(e instanceof Error?e.message:'Invalid JSON');return false}};
 const exportData=()=>{const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`underchargers-backup-${new Date().toISOString().slice(0,10)}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1500)};
 const can=(s:Screen)=>!!user&&ACCESS[user.role].includes(s);
 const visibleBranch=(id:string)=>!user?.branchId||user.branchId===id;
 return <C.Provider value={{data,user,ready,warning,setWarning,login,logout,commit,reset,importData,exportData,can,visibleBranch}}>{children}</C.Provider>;
}
export function useStore(){const s=useContext(C);if(!s)throw Error('Missing store');return s}
export function assertRole(role:Role,allowed:Role[]){if(!allowed.includes(role))throw Error('This action is not allowed for your role.')}
