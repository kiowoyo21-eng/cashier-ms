const assert=require('node:assert/strict');
const path=require('node:path');const fs=require('node:fs');const os=require('node:os');const {spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),dest=fs.mkdtempSync(path.join(os.tmpdir(),'cms-profit-'));
try {
 const compile=spawnSync('tsc',['--strict','--target','es2022','--module','commonjs','--lib','es2022,dom','--skipLibCheck','lib/profitability.ts','--outDir',dest],{cwd:root,encoding:'utf8'});
 assert.equal(compile.status,0,compile.stdout+'\n'+compile.stderr);
 const d=require(path.join(dest,'data.js'));const m=require(path.join(dest,'profitability.js'));
 const date='2026-10-21',closedAt='2026-10-21T02:00:00.000Z';
 let db=d.createSeed();
 const line=(id,type,name,price,cost)=>({id,type,name,qty:1,price,cost});
 const pos=(id,branch,items,payments=[],status='Closed')=>({id,no:id,branch,date,client:'Client',phone:'',plate:id,vehicle:'Car',concern:'',items,payments,status,createdBy:'admin',createdAt:closedAt,closedAt:status==='Closed'?closedAt:undefined});
 const payment=(amount)=>({id:'payment'+amount,mode:'Cash',amount,date});
 db.pos=[pos('UC-SALE','UCM',[line('L1','Service','Labor',2000,600)],[payment(2000)]),pos('MM-SALE','MMM',[line('L2','Part','Brake Pads',3000,1500)],[{...payment(3000),mode:'Card'}]),pos('OPEN-DEPOSIT','UCM',[line('L3','Part','Part C',900,200)],[payment(300)],'Pending')];
 function fund(id,branch,fund,amount,onlineCharge,status='Approved',kind='expense',linkedPosId=undefined,description='Brake Pads'){
  return {id,no:id,branch,fund,kind,date,amount,onlineCharge,status,createdBy:'admin',createdAt:closedAt,category:'Utilities',payee:'Supplier',description,vat:'Non-VAT',voucher:'',receiptNo:'',tin:'',notes:'',quantity:1,linkedPosId};
 }
 db.fundEntries=[
  fund('RF1','UCM','RF',200,5),fund('RF2','MMM','RF',60,0),
  fund('PB-LINKED','MMM','RFP',1000,20,'Approved','expense','MM-SALE'),
  fund('PB-UNALLOCATED','MMM','RFP',500,0),
  fund('REPLENISH','UCM','RF',10000,0,'Approved','replenishment'),
  fund('REJECTED','UCM','RF',777,0,'Rejected')
 ];
 const q={from:date,to:date,scope:'ALL'};
 const all=m.calculateProfitability(db,q);
 assert.equal(all.total.sales,5000,'Only closed POS is revenue');
 assert.equal(all.total.cogs,1600,'Linked RFP replaces the manual cost, not added to it');
 assert.equal(all.total.cogsManual,600); assert.equal(all.total.cogsRFP,1000); assert.equal(all.total.cogsInventory,0);
 assert.equal(all.total.rfExpenses,265,'RF expense includes its online charge, not replenishments/rejected entries');
 assert.equal(all.total.paymentCharges,20,'Linked RFP online charge is still an operating expense');
 assert.equal(all.total.operatingExpenses,285);
 assert.equal(all.total.estimatedEarnings,3115,'RFP purchase principal is NOT deducted a second time');
 assert.equal(all.total.recordedCollections,5300,'Open POS deposits are separate from closed sales');
 assert.equal(all.total.openDepositCollections,300);
 assert.equal(all.total.unallocatedPartsPurchases,500,'Unallocated part purchases are disclosed but not deducted');
 assert.equal(all.companies.length,2,'UC and MM never silently merged as a legal entity');
 assert.equal(all.companies.find(x=>x.company==='Underchargers').total.estimatedEarnings,1195);
 assert.equal(all.companies.find(x=>x.company==='Mastermind Autoworks').total.estimatedEarnings,1920);
 assert.equal(m.calculateProfitability(db,{...q,scope:'UC'}).total.estimatedEarnings,1195,'UC comprises only its three branches');
 assert.equal(m.calculateProfitability(db,{...q,scope:'MM'}).total.estimatedEarnings,1920);
 assert.equal(m.calculateProfitability(db,{...q,scope:'UCM'}).branches.length,1);
 assert.equal(m.calculateProfitability(db,{scope:'ALL',from:'2026-09-01',to:'2026-09-30'}).total.sales,0);
 db.fundEntries.push(fund('PENDING-EXP','UCM','RF',33,0,'Pending'));
 const pending=m.calculateProfitability(db,q);
 assert.equal(pending.pendingCount,1,'Pending expenses visible as provisional');
 assert.equal(pending.total.estimatedEarnings,3082);
 db.terminalEvents=[{id:'refund',branch:'MMM',mode:'Card',kind:'Refund',provider:'Processor',terminalId:'T1',reference:'RETURN',amount:25,date,notes:'',createdBy:'admin',createdAt:closedAt}];
 assert.equal(m.calculateProfitability(db,q).total.terminalRefunds,25,'Refunds are flagged for reconciliation, never silently treated as settled');
 db.inventory=[{id:'PR',barcode:'LP1',name:'Filter',category:'Automotive Parts & Products',branch:'UCLP',unit:'Piece',unitCost:400,openingQty:1,reorderAt:0,createdAt:closedAt}];
 db.pos.push(pos('STOCK-SALE','UCLP',[line('L4','Part','Filter',900,0)],[payment(900)]));
 db.stockMovements=[{id:'STOCK-OUT',productId:'PR',branch:'UCLP',kind:'StockOut',qty:1,unitCost:400,posId:'STOCK-SALE',by:'admin',at:closedAt}];
 const withStock=m.calculateProfitability(db,q);
 assert.equal(withStock.branches.find(b=>b.branch==='UCLP').cogs,400,'Verified inventory Stock Out flows into COGS');
 assert.equal(withStock.total.cogsInventory,400);
 assert.equal(withStock.branches.find(b=>b.branch==='UCLP').estimatedEarnings,500,'Stock In is not another operating expense');

 assert.equal(m.summarizeExpenses(pending).find(x=>x.label==='Utilities').amount,298);
 const page=fs.readFileSync(path.join(root,'app/page.tsx'),'utf8');const component=fs.readFileSync(path.join(root,'components/ProfitabilityAnalytics.tsx'),'utf8');
 assert(page.includes("profitability:'Profitability Analytics'"),'Dedicated sidebar module');
 assert(page.includes("view==='profitability'&&user.role==='admin'"),'Admin-only rendering');
 assert(page.includes("user?.role!=='admin'"),'Non-admin navigation guard');
 assert(component.includes('Export CSV')&&component.includes('Estimated earnings')&&component.includes('Business / branch')&&component.includes('Six-month earnings trend'));
 let ts;try{ts=require('typescript')}catch{ts=require('/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript')}
 for(const f of ['app/page.tsx','components/ProfitabilityAnalytics.tsx','lib/profitability.ts']){
  const text=fs.readFileSync(path.join(root,f),'utf8');const parsed=ts.createSourceFile(f,text,ts.ScriptTarget.Latest,true,f.endsWith('tsx')?ts.ScriptKind.TSX:ts.ScriptKind.TS);
  assert.equal(parsed.parseDiagnostics.length,0,`${f} JSX/TS syntax`);
 }
 console.log('PASS v9.25 profitability: company separation, sales/collections, linked PB COGS, expense/fee disaggregation, pending flags, branch/date filter, UI guards.');
} finally{fs.rmSync(dest,{recursive:true,force:true})}
