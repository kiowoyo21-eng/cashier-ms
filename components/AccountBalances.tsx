'use client';
import React,{useState} from 'react';
import {Plus,WalletCards,History} from 'lucide-react';
import type {BranchId,Database,User} from '@/lib/data';
import {BRANCHES,datePH,pesos,todayPH} from '@/lib/data';
import {createFinancialAccount,changeAccountOpening,postAccountMovement,financialAccountBalance,type FinancialEntity,type FinancialAccountKind} from '@/lib/financial-accounts';

type Props={db:Database;user:User;onUpdate:(next:Database)=>void;notify:(msg:string)=>void};
export default function AccountBalances({db,user,onUpdate,notify}:Props){
 const [name,setName]=useState(''),[entity,setEntity]=useState<FinancialEntity>('UC'),[branch,setBranch]=useState(''),[kind,setKind]=useState<FinancialAccountKind>('Bank');
 const [opening,setOpening]=useState(''),[date,setDate]=useState(todayPH()),[reason,setReason]=useState('');
 const [selectedId,setSelectedId]=useState(''),[mode,setMode]=useState<'Opening Adjustment'|'Inflow'|'Outflow'>('Inflow'),[amount,setAmount]=useState(''),[ref,setRef]=useState('');
 const [showAdd,setShowAdd]=useState(false);
 const accounts=db.financialAccounts||[];const selected=accounts.find(a=>a.id===selectedId);
 const history=(db.accountLedger||[]).filter(e=>e.accountId===selectedId).sort((a,b)=>b.at.localeCompare(a.at));
 const submit=(action:()=>Database,message:string)=>{try{const next=action();onUpdate(next);notify(message);}catch(err){notify((err as Error).message);}};
 if(user.role!=='admin')return null;
 return <section className="panel account-workspace">
  <div className="panel-head panel-action-head"><div><h3><WalletCards size={18}/> Account Balances</h3><span>Admin-only opening balances and operational account ledger · not bank-verified</span></div><button className="button button-primary" onClick={()=>setShowAdd(v=>!v)}><Plus size={16}/> New Account</button></div>
  <div className="account-body">
   {showAdd&&<form className="account-form" onSubmit={e=>{e.preventDefault();submit(()=>createFinancialAccount(db,user.id,name,entity,branch as BranchId||undefined,kind,Number(opening),date,reason),'Account starting balance saved.');setName('');setOpening('');setReason('');setShowAdd(false);}}>
    <label>Account Name<input required value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. BDO Checking 001"/></label>
    <label>Company<select value={entity} onChange={e=>{setEntity(e.target.value as FinancialEntity);setBranch('');}}><option value="UC">Underchargers (combined)</option><option value="MM">Mastermind Autoworks</option></select></label>
    <label>Account Type<select value={kind} onChange={e=>setKind(e.target.value as FinancialAccountKind)}>{(['Cash','Bank','Terminal / QR','Other'] as const).map(k=><option key={k}>{k}</option>)}</select></label>
    <label>Branch allocation (optional)<select value={branch} onChange={e=>setBranch(e.target.value)}><option value="">Company-wide</option>{BRANCHES.filter(b=>(b.id==='MMM'?'MM':'UC')===entity).map(b=><option value={b.id} key={b.id}>{b.name}</option>)}</select></label>
    <label>Starting Balance (₱)<input required type="number" step="0.01" min="0" value={opening} onChange={e=>setOpening(e.target.value)} placeholder="0.00"/></label>
    <label>As-of Date<input type="date" required value={date} onChange={e=>setDate(e.target.value)}/></label>
    <label className="account-wide">Source / Reason<input required value={reason} onChange={e=>setReason(e.target.value)} placeholder="Opening bank statement / verified cash count"/></label>
    <div className="account-wide account-buttons"><button type="button" className="button button-secondary" onClick={()=>setShowAdd(false)}>Cancel</button><button className="button button-primary">Save Account &amp; Opening Balance</button></div>
   </form>}
   <div className="account-list">{accounts.map(a=><button key={a.id} className={`account-item ${selectedId===a.id?'selected':''}`} onClick={()=>{setSelectedId(a.id);setDate(todayPH());setAmount('');setReason('');setRef('');setMode('Inflow');}}><span><strong>{a.name}</strong><small>{a.entity} · {a.branch||'Company-wide'} · {a.kind}</small></span><strong>{pesos(financialAccountBalance(db,a.id))}</strong></button>)}{!accounts.length&&<p className="supplier-empty">No financial accounts yet. Admin can set starting balances without modifying RF/RFP funds.</p>}</div>
   {selected&&<div className="account-detail"><h4>{selected.name}</h4><div className="account-summary"><div><small>Opening Balance</small><strong>{pesos(selected.openingBalance)}</strong><small>{datePH(selected.openingDate)}</small></div><div><small>Current Book Balance</small><strong>{pesos(financialAccountBalance(db,selected.id))}</strong><small>From this account's manual ledger only</small></div></div>
    <form className="account-form" onSubmit={e=>{e.preventDefault();if(mode==='Opening Adjustment')submit(()=>changeAccountOpening(db,user.id,selected.id,Number(amount),date,reason),'Opening balance adjustment saved.');else submit(()=>postAccountMovement(db,user.id,selected.id,mode,Number(amount),date,ref,reason),'Account entry recorded.');setAmount('');setRef('');setReason('');}}>
     <label>Action<select value={mode} onChange={e=>setMode(e.target.value as typeof mode)}><option>Inflow</option><option>Outflow</option><option>Opening Adjustment</option></select></label>
     <label>Amount (₱)<input required type="number" min={mode==='Opening Adjustment'?'0':'0.01'} step="0.01" value={amount} onChange={e=>setAmount(e.target.value)}/></label>
     <label>Date<input required type="date" value={date} onChange={e=>setDate(e.target.value)}/></label>
     {mode!=='Opening Adjustment'&&<label>Unique Reference<input required value={ref} onChange={e=>setRef(e.target.value)} placeholder="Receipt / bank reference"/></label>}
     <label className="account-wide">Reason / Supporting Source<input required value={reason} onChange={e=>setReason(e.target.value)}/></label>
     <div className="account-wide account-buttons"><button type="submit" className="button button-primary">Record {mode}</button></div>
    </form>
    <div className="account-history"><strong><History size={15}/> Account Ledger</strong>{history.slice(0,30).map(e=><div key={e.id} className="supplier-event"><span>{datePH(e.date)} · {e.kind} · {e.reference||e.reason} · {db.users.find(u=>u.id===e.by)?.name||e.by}</span><strong>{e.kind==='Opening Adjustment'?`${pesos(e.before||0)} → ${pesos(e.after||0)}`:`${e.kind==='Inflow'?'+':'−'}${pesos(e.amount)}`}</strong></div>)}</div>
   </div>}
   <p className="supplier-disclaimer">Operational book balances only. Not synchronized with banks, POS, RF/RFP, or Accounting. Entering a manual movement also recorded elsewhere can double-count; use source references and reconcile before relying on the total.</p>
  </div>
 </section>;
}
