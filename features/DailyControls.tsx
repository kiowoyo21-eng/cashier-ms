'use client';
import {useState} from 'react';
import {useStore,assertRole} from '@/lib/store';
import {todayPH,phTime,uid,iso,balance,peso,posTotal,branchName,paid} from '@/lib/types';
import {Modal,Panel,Button,Field,SignaturePad,SummaryLine,Badge} from '@/components/UI';
export function CashControl({onClose}:{onClose:()=>void}){
 const {data,user,commit,setWarning}=useStore();const [task,setTask]=useState<'Sales Opening'|'RF Opening'|'RF Closing'|'Sales Turnover'>('Sales Opening');const [actual,setActual]=useState('');const [receivedBy,setReceivedBy]=useState('');const [note,setNote]=useState('');const [signature,setSignature]=useState('');if(!user)return null;
 const branchId=user.branchId||'ucm',date=todayPH(),turnover=data.turnovers.find(t=>t.branchId===branchId&&t.date===date);
 const todaySales=data.pos.filter(p=>p.branchId===branchId&&p.status==='Closed'&&p.closedAt?.slice(0,10)===date);
 const cash=todaySales.flatMap(p=>p.payments).filter(p=>p.method==='Cash').reduce((n,p)=>n+p.amount,0),card=todaySales.flatMap(p=>p.payments).filter(p=>p.method==='Card').reduce((n,p)=>n+p.amount,0),digital=todaySales.flatMap(p=>p.payments).filter(p=>!['Card','Cash'].includes(p.method)).reduce((n,p)=>n+p.amount,0);
 const prev=data.counts.filter(c=>c.branchId===branchId&&c.date<date).sort((a,b)=>b.date.localeCompare(a.date));
 const previousSales=data.turnovers.filter(t=>t.branchId===branchId&&t.date<date).sort((a,b)=>b.date.localeCompare(a.date))[0];
 const openingSales=data.counts.find(c=>c.branchId===branchId&&c.date===date&&c.account==='Sales'&&c.kind==='Opening');
 const expected=task==='Sales Opening'?(previousSales?.actual||0):task==='RF Opening'?balance(data.cash,'RF',branchId):task==='RF Closing'?balance(data.cash,'RF',branchId):(openingSales?.actual||0)+cash;
 const done=(type:typeof task)=>type==='Sales Turnover'?!!turnover:data.counts.some(c=>c.branchId===branchId&&c.date===date&&c.account===(type.startsWith('Sales')?'Sales':'RF')&&c.kind===(type.endsWith('Opening')?'Opening':'Closing'));
 const submit=()=>{
 const value=Number(actual),delta=value-expected;if(!actual||!Number.isFinite(value)||value<0){setWarning('Enter a valid nonnegative counted cash amount.');return}
 if(!signature||!signature.startsWith('data:image/')){setWarning('Please draw your signature.');return}
 if(Math.abs(delta)>0.009&&!note.trim()){setWarning('A discrepancy explanation is required.');return}
 if(task==='Sales Turnover'&&!receivedBy.trim()){setWarning('Enter the name of the person receiving the cash.');return}
 const ok=commit('Cash Count',`${branchId}-${date}`,task,d=>{
 assertRole(user.role,['Cashier','Admin','Super Admin','Branch Manager']);if(done(task))throw Error('This task is already completed today.');
 if(task!=='Sales Opening'&&!done('Sales Opening'))throw Error('Complete Sales Opening Cash Count first.');
 if((task==='RF Closing'||task==='Sales Turnover')&&!done('RF Opening'))throw Error('Complete Revolving Fund Opening Cash Count first.');
 if(task==='Sales Turnover'&&!done('RF Closing'))throw Error('Complete Revolving Fund Closing Cash Count first.');
 if(task==='Sales Turnover')d.turnovers.push({id:uid(),branchId,date,openingCash:openingSales?.actual||0,cash,card,digital,expected,actual:value,receivedBy,signature,notes:note,userId:user.id,at:iso()});
 else d.counts.push({id:uid(),branchId,date,account:task.startsWith('Sales')?'Sales':'RF',kind:task.endsWith('Opening')?'Opening':'Closing',expected,actual:value,signature,reason:note,userId:user.id,at:iso()});
 if(delta!==0||((task.endsWith('Opening'))&&phTime()>'09:30'))d.incidents.push({id:`IR-${Date.now()}`,branchId,date,type:delta!==0?`${task} discrepancy`:`Late ${task}`,note:note||'Submitted after 9:30 AM',signature,status:'Open',userId:user.id,at:iso()});
 },note,branchId);if(ok){setActual('');setSignature('');setNote('');setReceivedBy('');onClose()}
 };
 return <Modal title="Daily Cash Controls" wide onClose={onClose}><div className="detail-alert">Cashier accountability · {branchName(branchId)} · {date} (Asia/Manila)</div><div className="task-tabs">{(['Sales Opening','RF Opening','RF Closing','Sales Turnover'] as const).map(t=><button key={t} className={task===t?'selected':''} onClick={()=>{setTask(t);setActual('');setSignature('')}}><span>{t}</span><Badge value={done(t)?'Done':'Due'}/></button>)}</div><Panel title={task==='Sales Turnover'?'Sales Turnover & Closing Cash Count':`${task.replace('RF','Revolving Fund')} Cash Count`} subtitle={done(task)?'Already submitted today; view-only summary':'Complete and sign to submit'}><div className="form-grid"><Field label="Expected cash"><input readOnly value={peso(expected)}/></Field><Field label="Actual cash counted"><input type="number" min="0" step=".01" value={actual} onChange={e=>setActual(e.target.value)} disabled={done(task)}/></Field>{task==='Sales Turnover'&&<><Field label="Cash sales"><input readOnly value={peso(cash)}/></Field><Field label="Card / digital collections"><input readOnly value={`${peso(card)} / ${peso(digital)}`}/></Field><Field label="Received by (required)"><input value={receivedBy} onChange={e=>setReceivedBy(e.target.value)}/></Field></>}<Field label="Variance"><input readOnly value={actual?peso(Number(actual)-expected):'—'}/></Field><Field label="Discrepancy reason / notes"><input value={note} onChange={e=>setNote(e.target.value)} placeholder="Required if counted amount differs"/></Field></div><Field label="Cashier signature"><SignaturePad value={signature} onChange={setSignature}/></Field><div className="actions-right"><Button variant="secondary" onClick={onClose}>Cancel</Button><Button disabled={done(task)} onClick={submit}>Sign & Submit</Button></div></Panel></Modal>
}
