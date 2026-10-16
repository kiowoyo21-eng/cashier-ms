export type Role = 'admin'|'cashier'|'pb';
export type Status = 'Pending'|'Approved'|'Rejected'|'Report Required'|'Report Submitted';
export type Fund = 'RF'|'RFP';
export type BranchId = 'UCQC'|'UCM'|'UCLP'|'MMM';
export const BRANCHES: {id:BranchId;name:string;short:string}[] = [
  {id:'UCQC',name:'UC Quezon City',short:'UC Quezon City'},
  {id:'UCM',name:'UC Mandaluyong',short:'UC Mandaluyong'},
  {id:'UCLP',name:'UC Las Piñas',short:'UC Las Piñas'},
  {id:'MMM',name:'MM Mandaluyong',short:'MM Mandaluyong'}
];
export const RF_CATEGORIES = ['Gasoline / Fuel','Transportation','Parking / Toll Fees','Food / Grocery','Office Supplies','Cleaning Supplies','Repairs & Maintenance','Utilities','Miscellaneous','Staff Welfare','Client Expense'] as const;
export const BRANCH_NAME = (id:BranchId) => BRANCHES.find(b=>b.id===id)?.name || id;
export interface User {id:string;username:string;password:string;name:string;role:Role;branch:BranchId;active:boolean;lastLoginDate?:string;}
export interface Receipt {name:string;data:string}
export interface FundEntry {
  id:string;no:string;fund:Fund;kind:'expense'|'replenishment';branch:BranchId;date:string;amount:number;category:string;payee:string;vat:'VAT'|'Non-VAT';voucher:string;receiptNo:string;tin:string;description:string;notes:string;proof?:Receipt;signature?:string;
  status:Status;createdBy:string;createdAt:string;decisionBy?:string;decisionAt?:string;decisionNote?:string;
  plate?:string;quantity?:number;unitCost?:number;linkedPosId?:string;
}
export interface POSLine {id:string;type:'Service'|'Part';name:string;qty:number;price:number;cost:number;}
export interface POSPayment {id:string;mode:'Cash'|'GCash'|'Bank Transfer'|'Card';amount:number;date:string;}
export interface POS {id:string;no:string;branch:BranchId;date:string;client:string;phone:string;vehicle:string;plate:string;concern:string;items:POSLine[];payments:POSPayment[];status:'Pending'|'Closed';parentId?:string;createdBy:string;createdAt:string;closedAt?:string;}
export interface Count {id:string;branch:BranchId;userId:string;date:string;kind:'BOD'|'EOD';actual:number;expected:number;difference:number;notes:string;createdAt:string;}
export interface Incident {id:string;branch:BranchId;userId:string;date:string;type:'Missed Opening'|'Missed Closing'|'Cash Discrepancy'|'Expense Explanation';detail:string;status:'Required'|'Submitted'|'Reviewed';explanation:string;createdAt:string;submittedAt?:string;entryId?:string;reviewedAt?:string;}
export interface Turnover {id:string;branch:BranchId;date:string;amount:number;notes:string;signature?:string;createdBy:string;createdAt:string;}
export interface ChangeRequest {id:string;type:'Edit RFP'|'Change Branch';entryId:string;branch:BranchId;requestedBy:string;changes:Partial<FundEntry>;original?:Partial<FundEntry>;reason:string;status:'Pending'|'Approved'|'Rejected';createdAt:string;decidedBy?:string;}
export interface Audit {id:string;at:string;by:string;action:string;detail:string;}
export interface Database {
  users:User[];fundEntries:FundEntry[];pos:POS[];counts:Count[];incidents:Incident[];turnovers:Turnover[];requests:ChangeRequest[];audit:Audit[];
  settings:{rfBase:Record<BranchId,number>;rfpBase:Record<BranchId,number>;categories:string[]};
}
export const uid = () => (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `ID-${Date.now()}-${Math.random().toString(36).slice(2,7)}`);
export function todayPH():string {return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Manila',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());}
export function hourPH():number {return Number(new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Manila',hour:'2-digit',hourCycle:'h23'}).format(new Date()));}
export function datePH(date:string){return new Date(`${date}T12:00:00+08:00`).toLocaleDateString('en-PH',{day:'2-digit',month:'short',year:'numeric',timeZone:'Asia/Manila'});}
export const pesos = (n:number) => new Intl.NumberFormat('en-PH',{style:'currency',currency:'PHP',minimumFractionDigits:2,maximumFractionDigits:2}).format(n||0);
export const money = (n:number) => new Intl.NumberFormat('en-PH',{minimumFractionDigits:2,maximumFractionDigits:2}).format(n||0);
export const number = (v:unknown) => Math.max(0,Number(v)||0);
const base = ():Record<BranchId,number>=>({UCQC:50000,UCM:50000,UCLP:50000,MMM:50000});
const rfpBase = ():Record<BranchId,number>=>({UCQC:120000,UCM:120000,UCLP:120000,MMM:120000});
export function createSeed():Database {
  const date=todayPH();
  const users:User[]=[
    {id:'u-admin',username:'admin',password:'admin12345',name:'System Administrator',role:'admin',branch:'UCM',active:true},
    {id:'u-cashier',username:'cashier',password:'cashier12345',name:'Cashier — Mandaluyong',role:'cashier',branch:'UCM',active:true},
    {id:'u-pb',username:'pbacc',password:'pb12345',name:'Parts Buyer — Mandaluyong',role:'pb',branch:'UCM',active:true}
  ];
  const entry = (no:string,branch:BranchId,amount:number,payee:string,category:string,by:string,fund:Fund):FundEntry => ({id:uid(),no,fund,kind:'expense',branch,date,amount,category,payee,vat:'Non-VAT',voucher:'',receiptNo:'',tin:'',description:`Demo ${category.toLowerCase()} expense`,notes:'Sample transaction for frontend testing',status:'Pending',createdBy:by,createdAt:new Date().toISOString()});
  const rf = entry('UCM-Rotating Fund-00000001','UCM',1250,'Shop Supplies Co.','Office Supplies','u-cashier','RF'); rf.status='Approved';
  const rf2 = entry('UCQC-Rotating Fund-00000001','UCQC',680,'Office Mart','Office Supplies','u-admin','RF');
  const rfp = entry('UCM-RFP-00000001','UCM',3800,'Auto Parts Supplier','Automotive Parts','u-pb','RFP');rfp.plate='ABC1234';rfp.quantity=2;rfp.unitCost=1900;
  const pos:POS[]=[{id:uid(),no:'UCM-POS-00000001',branch:'UCM',date,client:'Sample Customer',phone:'',vehicle:'Toyota Vios',plate:'ABC1234',concern:'Routine service',items:[{id:uid(),type:'Service',name:'Oil Change',qty:1,price:1800,cost:450},{id:uid(),type:'Part',name:'Engine Oil',qty:1,price:2200,cost:1250}],payments:[{id:uid(),mode:'Cash',amount:4000,date}],status:'Closed',createdBy:'u-cashier',createdAt:new Date().toISOString(),closedAt:new Date().toISOString()}];
  return {users,fundEntries:[rf,rf2,rfp],pos,counts:[],incidents:[],turnovers:[],requests:[],audit:[{id:uid(),at:new Date().toISOString(),by:'system',action:'Demo initialized',detail:'Sample data created; amounts are illustrative only'}],settings:{rfBase:base(),rfpBase:rfpBase(),categories:[...RF_CATEGORIES]}};
}
export const STORAGE_KEY = 'underchargers-fund-management-demo-v1';
export function loadDB():Database {if(typeof window==='undefined')return createSeed();try{const s=localStorage.getItem(STORAGE_KEY);if(s){const d=JSON.parse(s) as Database;if(d?.settings?.rfBase && Array.isArray(d.users) && Array.isArray(d.pos) && Array.isArray(d.fundEntries)){const legacy=['Shop Supplies','Cleaning','Maintenance','Other'];const categories=d.settings.categories||[];d.settings.categories=[...RF_CATEGORIES,...categories.filter(c=>!legacy.includes(c)&&!RF_CATEGORIES.some(a=>a===c))];return d;}}}catch{}return createSeed();}
export function storeDB(db:Database):boolean {try{localStorage.setItem(STORAGE_KEY,JSON.stringify(db));return true;}catch{return false;}}
export function balance(db:Database,branch:BranchId,fund:Fund):number {
 const initial=(fund==='RF'?db.settings.rfBase:db.settings.rfpBase)[branch]||0;
 return db.fundEntries.filter(e=>e.branch===branch&&e.fund===fund&&e.status!=='Rejected').reduce((sum,e)=>sum+(e.kind==='replenishment'?(e.status==='Approved'?e.amount:0):-e.amount),initial);
}
export function nextNumber(db:Database,branch:BranchId,type:'RF'|'RFP'|'POS'):string {
  const prefix=type==='RF'?`${branch}-Rotating Fund-`:`${branch}-${type}-`;const all=type==='POS'?db.pos.map(v=>v.no):db.fundEntries.filter(v=>v.fund===type).map(v=>v.no);
  const max=Math.max(0,...all.filter(v=>v.startsWith(prefix)).map(v=>Number(v.slice(prefix.length))||0));
  return `${prefix}${String(max+1).padStart(8,'0')}`;
}
export function log(db:Database,by:string,action:string,detail:string):Database {return {...db,audit:[{id:uid(),at:new Date().toISOString(),by,action,detail},...db.audit].slice(0,1000)};}
export const posTotal=(p:POS)=>p.items.reduce((v,i)=>v+i.qty*i.price,0);
export const paidTotal=(p:POS)=>p.payments.reduce((v,i)=>v+i.amount,0);
export const posCOGS=(p:POS)=>p.items.reduce((v,i)=>v+i.qty*i.cost,0);
export function normalizePlate(plate:string){return plate.toUpperCase().replace(/[^A-Z0-9]/g,'');}
export function csvEscape(value:unknown):string {let s=String(value??'');if(/^[=+@\t\r]/.test(s) || /^-[^0-9]/.test(s))s="'"+s;return /[",\n]/.test(s)?`"${s.replace(/"/g,'""')}"`:s;}
export function downloadFile(name:string,content:string,mime='text/csv;charset=utf-8'){
  const blob=new Blob([content],{type:mime});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),2000);
}

export function categoryTotals(entries:FundEntry[]) {return entries.filter(e=>e.fund==='RF'&&e.kind==='expense'&&e.status!=='Rejected').reduce<Record<string,number>>((result,e)=>{result[e.category]=(result[e.category]||0)+e.amount;return result;},{});}
export function matchingPOS(db:Database,branch:BranchId,plate:string) {return db.pos.filter(p=>p.branch===branch&&normalizePlate(p.plate)===normalizePlate(plate)).sort((a,b)=>b.createdAt.localeCompare(a.createdAt));}
export function disbursementSummary(db:Database,branch:BranchId,fund:Fund){const base=(fund==='RF'?db.settings.rfBase:db.settings.rfpBase)[branch];const rows=db.fundEntries.filter(e=>e.branch===branch&&e.fund===fund&&e.status!=='Rejected');const expenses=rows.filter(e=>e.kind==='expense').reduce((n,e)=>n+e.amount,0);const deposits=rows.filter(e=>e.kind==='replenishment'&&e.status==='Approved').reduce((n,e)=>n+e.amount,0);const remaining=base+deposits-expenses;return {base,expenses,deposits,remaining,amountRequested:Math.max(0,expenses-deposits)};}
export function isFridayPH(date:string){return new Date(`${date}T12:00:00+08:00`).getUTCDay()===5;}
