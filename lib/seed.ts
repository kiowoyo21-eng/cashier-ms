import {BRANCHES,Data,User,POS,CashTx,Supplier,Vehicle,iso,todayPH,BranchId,money} from './types';
const demoUsers:User[] = [
 ['cashier','cashier12345','Cashier','ucm'],['admin','admin12345','Admin',undefined],['pbacc','pb12345','PB',undefined],['bm','bm12345','Branch Manager','ucm'],['accounting','accounting12345','Accounting',undefined],['president','president12345','President',undefined],['hr','hr12345','HR',undefined],['superadmin','superadmin12345','Super Admin',undefined]
].map(([username,password,role,branchId],i)=>({id:`u${i+1}`,username:username!,password:password!,name:role==='PB'?'Parts Buyer':role!,role:role as User['role'],branchId:branchId as BranchId|undefined,active:true}));
const people=['Maria Santos','Jose Reyes','Francis Cruz','Angela Rivera','Marco Garcia','Ella Mendoza','Peter Ramos','Stephanie Lopez','Kenneth Aquino','Lea Torres'];
const parts=['Oil Filter','Brake Pads','Alternator','Engine Oil','Spark Plugs','Belt Tensioner','Air Filter','Battery','Radiator Hose','Wheel Bearing'];
const makes=['Toyota','Honda','Mitsubishi','Ford','Nissan','Hyundai'];
const models=['Vios','Civic','Montero','Ranger','Navara','Accent'];
const offset=(n:number)=>{const d=new Date(`${todayPH()}T12:00:00+08:00`);d.setUTCDate(d.getUTCDate()-n);return d.toISOString().slice(0,10)};
export function seed():Data {
 const pos:POS[]=Array.from({length:38},(_,i)=>{
   const branch=BRANCHES[i%4].id;const done=i%5!==0;const cost=650+i*85; const amount=money(1850+(i%7)*650);const client=people[i%people.length];
   return {id:`POS-${String(i+1).padStart(5,'0')}`,branchId:branch,client,phone:`09${String(170000000+i*761).padStart(9,'0')}`,tin:'',address:'Metro Manila',bsSi:`BS-${1000+i}`,plate:`ABC-${String(2000+i).padStart(4,'0')}`,year:String(2017+i%9),brand:makes[i%6],model:models[i%6],mileage:`${24000+i*1150}`,concern:i%2?'Preventive maintenance':'Brake and engine inspection',platform:'Walk-in',advisor:'Service Advisor',bookedBy:'Front Desk',mechanic:'Lead Mechanic',remarks:'Seed transaction',items:[{id:`q${i}`,kind:'Service',name:'Inspection and labor',qty:1,price:amount-cost},{id:`p${i}`,kind:'Part',name:parts[i%10],qty:1,price:cost}],payments:done?[{id:`pay${i}`,method:i%3===0?'Cash':i%3===1?'GCash':'Card',amount,reference:i%3===0?'':`REF${11000+i}`,cardType:i%3===2?'Visa':undefined,fee:i%3===2?35:0,at:iso()}]:[{id:`pay${i}`,method:'Cash',amount:600,at:iso()}],cogs:[{id:`co${i}`,name:parts[i%10],supplier:'Auto Parts Depot',qty:1,cost:money(cost*0.65)}],onlineExpense:0,rfExpense:0,status:done?'Closed':'Pending',createdAt:`${offset(i%18)}T05:30:00.000Z`,closedAt:done?`${offset(i%18)}T07:00:00.000Z`:undefined};
 });
 const cash:CashTx[]=[];
 BRANCHES.forEach((b,j)=>{
  cash.push({id:`RF-REPL-${j+1}`,account:'RF',kind:'Replenishment',branchId:b.id,date:offset(16),amount:30000,category:'Replenishment',description:'Opening revolving fund',payee:'Cashier',vat:'Non-VAT',voucher:`RFV-${j+1}`,receipt:`RR-${j+1}`,tin:'',notes:'Demo fund',signature:'seed-demo',proof:'',status:'Approved',createdBy:'u2',createdAt:iso()});
  cash.push({id:`RFP-REPL-${j+1}`,account:'RFP',kind:'Replenishment',branchId:b.id,date:offset(16),amount:75000,category:'Parts Fund Seed',description:'Demo opening parts balance',payee:'Management',vat:'Non-VAT',voucher:`RFP-OPEN-${j+1}`,receipt:`INIT-${j+1}`,tin:'',notes:'Seed-only opening balance',signature:'seed-demo',proof:'',status:'Approved',createdBy:'u2',createdAt:iso()});
 });
 for(let i=0;i<36;i++) {
  const rfp=i%2===0,branch=BRANCHES[i%4].id,qty=1+(i%3),unit=rfp?1300+i*37:75+i*17;
  cash.push({id:`${rfp?'RFP':'RF'}-EXP-${String(i+1).padStart(4,'0')}`,account:rfp?'RFP':'RF',kind:'Expense',branchId:branch,date:offset(i%12),amount:money(qty*unit),category:rfp?'Part':['Shop Supplies','Office Supplies','Cleaning','Utilities'][i%4],description:rfp?parts[i%10]:['Consumables','Paper and ink','Cleaning materials','Shop utilities'][i%4],payee:rfp?'Auto Parts Depot':'Shop Vendor',quantity:rfp?qty:undefined,unitCost:rfp?unit:undefined,plate:rfp?pos[i%pos.length].plate:undefined,vehicle:rfp?`${makes[i%6]} ${models[i%6]}`:undefined,vat:'VAT',voucher:`CV-${1000+i}`,receipt:`OR-${3000+i}`,tin:'',notes:'Sample transaction',signature:'seed-demo',proof:'',status:i%7===0?'Pending for Approval':'Approved',createdBy:rfp?'u3':'u1',createdAt:iso()});
 }
 const suppliers:Supplier[]=Array.from({length:9},(_,i)=>({id:`sup${i}`,name:['Auto Parts Depot','Prime Lubricants','Motorcare Supply','Metro Parts Trading','Caliper Auto','Racing Components','Golden Torque','Ace Distributors','Brake House'][i],contact:people[i],phone:`0917123000${i}`,email:`parts${i}@example.test`,category:'Auto Parts',leadTime:`${1+i%4} days`,notes:'Demo supplier',preferred:i%3===0,active:true}));
 const vehicles:Vehicle[]=Array.from({length:18},(_,i)=>({id:`v${i}`,brand:makes[i%6],model:models[i%6],year:String(2015+i%11),active:true}));
 return {schemaVersion:1,users:demoUsers,pos,cash,counts:[],turnovers:[],disbursements:[],incidents:[],editRequests:[],suppliers,vehicles,reconciliations:[],audit:[],sequence:10000,savedPbSignature:''};
}
