/** Browser-only demo data adapter. No remote services or authentication. */
import {type Data,type LedgerEntry,type PosEntry,load,save,createId} from './store';
const get=()=>load();
const set=(v:Data)=>save(v);
export async function uploadImage(image:string,_kind:string){return image}
export async function uploadFile(blob:Blob,_kind:string,_filename:string,_contentType:string){return await new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));reader.onerror=()=>reject(reader.error);reader.readAsDataURL(blob)})}
export async function fileUrl(path?:string,_seconds=600){return path}
export async function photoUrl(path?:string){return path}
export async function nextTransactionNumber(prefix:'POS'|'RF-EXP'|'RF-REP'|'RFP-EXP'|'RFP-REP'|'RFP-HO'|'RFP-DR'|'CC'|'OCC'|'CCC'|'SALES-HO'){return createId(prefix)}
export async function fetchAll():Promise<Data>{return get()}
export async function createCash(t:LedgerEntry){const s=get();s.transactions.unshift(t);set(s)}
export async function attachProof(id:string,image:string){const s=get();const t=s.transactions.find(x=>x.id===id);if(!t)throw new Error('Transaction not found');t.proof=image;set(s)}
export async function reviewCash(id:string,action:'approve'|'request'|'explain',note:string){const s=get();const t=s.transactions.find(x=>x.id===id);if(!t)throw new Error('Transaction not found');t.status=action==='approve'?'Approved':action==='request'?'Submit Explanation':'Pending for Approval';if(action==='request')t.reviewerNote=note;if(action==='explain')t.explanation=note;t.events.push({at:new Date().toISOString(),by:'Demo User',action:`${action}: ${note}`});set(s)}
export async function createPos(p:PosEntry){const s=get();s.pos.unshift(p);set(s)}
export async function closePos(id:string){const s=get();const p=s.pos.find(x=>x.id===id);if(!p)throw new Error('POS not found');const amount=p.items.reduce((v,x)=>v+x.price*x.qty,0);const paid=p.payments.reduce((v,x)=>v+x.amount,0);if(Math.abs(amount-paid)>0.005)throw new Error('Account must be fully paid.');p.status='Closed';p.closedAt=new Date().toISOString();set(s)}
export async function addPosPayment(id:string,amount:number,method:string,reference='',cardType='',terminalFee=0){const s=get();const p=s.pos.find(x=>x.id===id);if(!p)throw new Error('POS not found');if(p.status==='Closed')throw new Error('This account is closed.');p.payments.push({amount,method,reference,cardType,terminalFee,at:new Date().toISOString()});set(s)}
export async function addPosAdditional(id:string,items:{type:'Service'|'Part';name:string;qty:number;price:number}[],cogs:{name:string;supplier:string;qty:number;unitCost:number}[]){const s=get();const p=s.pos.find(x=>x.id===id);if(!p)throw new Error('POS not found');if(p.status!=='Pending')throw new Error('Cannot edit a closed POS');p.items.push(...items);p.cogsItems=[...(p.cogsItems||[]),...cogs];p.costs=(p.cogsItems||[]).reduce((n,x)=>n+x.qty*x.unitCost,0);set(s)}
export async function addExpenseCategory(_account:'Petty Cash'|'Funds',name:string){return name}
export async function completeFirstLogin(){return}
