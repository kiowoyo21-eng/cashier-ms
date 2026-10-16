// Browser IndexedDB persistence. No network or external database involved.
export const BRANCHES=['Underchargers Mandaluyong','Underchargers Quezon City','Underchargers Las Piñas','Mastermind Mandaluyong'].map((name,i)=>({id:`branch-${i+1}`,name,petty_cash_limit:0}));
const DATABASE='cms-underchargers-local-v1';
let openPromise:Promise<IDBDatabase>|undefined;
export function openDb():Promise<IDBDatabase>{
 if(typeof indexedDB==='undefined')return Promise.reject(Error('IndexedDB requires a browser'));
 if(!openPromise)openPromise=new Promise((resolve,reject)=>{
  const req=indexedDB.open(DATABASE,1);
  req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains('tables'))db.createObjectStore('tables');if(!db.objectStoreNames.contains('files'))db.createObjectStore('files')};
  req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);
 });return openPromise;
}
async function access<T>(store:string,key:string,write?:T):Promise<T|undefined>{const db=await openDb();return await new Promise((resolve,reject)=>{const tx=db.transaction(store,write===undefined?'readonly':'readwrite');const request=write===undefined?tx.objectStore(store).get(key):tx.objectStore(store).put(write,key);request.onsuccess=()=>resolve(write===undefined?request.result:write);request.onerror=()=>reject(request.error)})}
export async function rows(table:string):Promise<any[]>{const value=await access<any[]>('tables',table);if(value)return value;if(table==='branches')return BRANCHES;if(table==='profiles')return [{id:'cashier',display_name:'Cashier',role:'Cashier',is_active:true,branch_id:BRANCHES[0].id,must_change_password:false},{id:'admin',display_name:'Admin',role:'Admin',is_active:true,branch_id:null,must_change_password:false},{id:'pbacc',display_name:'PB Account',role:'PB',is_active:true,branch_id:null,must_change_password:false}];if(table==='vehicle_years')return [];if(table==='vehicle_brands')return [];if(table==='vehicle_models')return [];if(table==='expense_categories')return [{account:'Funds',name:'Part',is_active:true},{account:'Petty Cash',name:'Transportation',is_active:true},{account:'Petty Cash',name:'Operating Expense',is_active:true}];return []}
export async function writeRows(table:string,value:any[]){await access('tables',table,value)}
export async function addRow(table:string,row:any){const current=await rows(table);if(current.some(x=>x.id===row.id))throw Error('Duplicate record');await writeRows(table,[row,...current]);return row}
export async function updateRow(table:string,id:string,patch:any){const current=await rows(table);const index=current.findIndex(x=>x.id===id);if(index<0)throw Error('Record not found');current[index]={...current[index],...patch};await writeRows(table,current);return current[index]}
export async function putFile(path:string,file:Blob){await access('files',path,file)}
export async function getFile(path:string):Promise<Blob|undefined>{return await access('files',path)}
export function demoUser(){if(typeof window==='undefined')return null;const id=sessionStorage.getItem('cms-local-user');return ['cashier','admin','pbacc'].includes(id||'')?id:null}
export function audit(action:string,entity_id:string,detail:any={}){return addRow('audit_logs',{id:crypto.randomUUID(),entity_type:'local',entity_id,action,detail,actor_id:demoUser(),created_at:new Date().toISOString()})}
