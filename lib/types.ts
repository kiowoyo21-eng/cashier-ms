export const BRANCHES = [
 {id:'mm',name:'Mastermind Mandaluyong',short:'MM Mandaluyong'},
 {id:'ucm',name:'Underchargers Mandaluyong',short:'UC Mandaluyong'},
 {id:'ucl',name:'Underchargers Las Piñas',short:'UC Las Piñas'},
 {id:'ucq',name:'Underchargers Quezon City',short:'UC Quezon City'}
] as const;
export type BranchId = typeof BRANCHES[number]['id'];
export type Role = 'Cashier'|'PB'|'HR'|'Accounting'|'President'|'Admin'|'Branch Manager'|'Super Admin';
export type Screen = 'Dashboard'|'POS'|'Revolving Fund'|'RFP'|'Sales'|'Suppliers'|'Vehicle Master'|'Approvals'|'Reports'|'Discrepancy'|'Audit Logs'|'User Management'|'BM Inbox'|'Settings';
export const ACCESS:Record<Role,Screen[]> = {
 Cashier:['Dashboard','POS','Revolving Fund','Sales'],
 PB:['Dashboard','RFP','Sales'],
 HR:['Dashboard','Reports'],
 Accounting:['Dashboard','Approvals'],
 President:['Dashboard','Approvals'],
 Admin:['Dashboard','POS','Revolving Fund','RFP','Sales','Suppliers','Vehicle Master','Approvals','Reports','Audit Logs','BM Inbox'],
 'Branch Manager':['Dashboard','POS','Revolving Fund','RFP','Sales','Suppliers','Vehicle Master','Approvals','Reports','BM Inbox'],
 'Super Admin':['Dashboard','POS','Revolving Fund','RFP','Sales','Suppliers','Vehicle Master','Approvals','Reports','Discrepancy','Audit Logs','User Management','BM Inbox','Settings']
};
export type User = {id:string;username:string;password:string;name:string;role:Role;branchId?:BranchId;active:boolean};
export type Quote = {id:string;kind:'Service'|'Part';name:string;qty:number;price:number};
export type Payment = {id:string;method:'Cash'|'GCash'|'Maya'|'Bank Transfer'|'Cheque'|'Card'|'Other';amount:number;reference?:string;cardType?:string;fee?:number;at:string};
export type Cogs = {id:string;name:string;supplier:string;qty:number;cost:number};
export type POS = {id:string;branchId:BranchId;client:string;phone:string;tin:string;address:string;bsSi:string;plate:string;year:string;brand:string;model:string;mileage:string;concern:string;platform:string;advisor:string;bookedBy:string;mechanic:string;remarks:string;items:Quote[];payments:Payment[];cogs:Cogs[];onlineExpense:number;rfExpense:number;status:'Pending'|'Closed';createdAt:string;closedAt?:string};
export type CashTx = {id:string;account:'RF'|'RFP';kind:'Replenishment'|'Expense';branchId:BranchId;date:string;amount:number;category:string;description:string;payee:string;quantity?:number;unitCost?:number;plate?:string;vehicle?:string;vat:'VAT'|'Non-VAT';voucher:string;receipt:string;tin:string;notes:string;signature:string;proof:string;status:'Pending for Approval'|'Approved'|'Submit Explanation';explanation?:string;reviewerNote?:string;linkedPosId?:string;disbursementId?:string;createdBy:string;createdAt:string};
export type DailyCount = {id:string;branchId:BranchId;date:string;account:'Sales'|'RF';kind:'Opening'|'Closing';expected:number;actual:number;signature:string;reason:string;userId:string;at:string};
export type Turnover = {id:string;branchId:BranchId;date:string;openingCash:number;cash:number;card:number;digital:number;expected:number;actual:number;receivedBy:string;signature:string;notes:string;userId:string;at:string};
export type Disbursement = {id:string;from:string;to:string;expenseIds:string[];checkDeposit:number;openingBalance:number;notes:string;status:'Pending Verification'|'Verified'|'Approved'|'Released'|'Rejected';preparedBy:string;preparedSignature:string;verifiedBy?:string;verifiedSignature?:string;approvedBy?:string;approvedSignature?:string;releasedBy?:string;at:string};
export type Incident = {id:string;branchId:BranchId;date:string;type:string;note:string;signature:string;status:'Open'|'Resolved';userId:string;at:string;resolution?:string};
export type EditRequest = {id:string;transactionId:string;description:string;proposedAmount:number;reason:string;status:'Pending'|'Approved'|'Rejected';actor:string;at:string;reviewNote?:string};
export type Supplier = {id:string;name:string;contact:string;phone:string;email:string;category:string;leadTime:string;notes:string;preferred:boolean;active:boolean};
export type Vehicle = {id:string;brand:string;model:string;year:string;active:boolean};
export type Reconciliation = {id:string;branchId:BranchId;account:'RF'|'RFP';counted:number;expected:number;reason:string;at:string;userId:string};
export type Audit = {id:string;actor:string;role:Role;branchId?:BranchId;entity:string;entityId:string;action:string;before?:unknown;after?:unknown;reason?:string;at:string};
export type Data = {schemaVersion:1;users:User[];pos:POS[];cash:CashTx[];counts:DailyCount[];turnovers:Turnover[];disbursements:Disbursement[];incidents:Incident[];editRequests:EditRequest[];suppliers:Supplier[];vehicles:Vehicle[];reconciliations:Reconciliation[];audit:Audit[];sequence:number;savedPbSignature:string};
export const todayPH = () => new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Manila',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
export const phTime = () => new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Manila',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date());
export const iso = () => new Date().toISOString();
export const uid = () => typeof crypto!=='undefined'&&'randomUUID'in crypto ? crypto.randomUUID():`${Date.now()}-${Math.random()}`;
export const peso = (n:number) => new Intl.NumberFormat('en-PH',{style:'currency',currency:'PHP',maximumFractionDigits:2}).format(n||0);
export const money = (n:number) => Math.round((n+Number.EPSILON)*100)/100;
export const normPlate = (s:string) => s.toUpperCase().replace(/[^A-Z0-9]/g,'');
export const branchName = (id:string) => BRANCHES.find(b=>b.id===id)?.short||id;
export const posTotal = (p:POS) => money(p.items.reduce((n,i)=>n+i.qty*i.price,0));
export const paid = (p:POS) => money(p.payments.reduce((n,i)=>n+i.amount,0));
export const due = (p:POS) => Math.max(0,money(posTotal(p)-paid(p)));
export const posCost = (p:POS,cash:CashTx[]) => money(p.cogs.reduce((n,i)=>n+i.qty*i.cost,0)+ cash.filter(t=>t.account==='RFP'&&t.linkedPosId===p.id && t.kind==='Expense').reduce((n,t)=>n+t.amount,0)+p.onlineExpense+p.rfExpense+p.payments.reduce((n,x)=>n+(x.fee||0),0));
export const balance = (cash:CashTx[],account:'RF'|'RFP',branchId?:string) => money(cash.filter(t=>t.account===account&&(!branchId||t.branchId===branchId)).reduce((n,t)=>n+(t.kind==='Replenishment'?t.amount:-t.amount),0));
export const isManager = (r:Role)=>['Admin','Super Admin','Branch Manager'].includes(r);
