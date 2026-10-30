const assert=require('node:assert/strict'), fs=require('node:fs'),os=require('node:os'),path=require('node:path');const {spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),dest=fs.mkdtempSync(path.join(os.tmpdir(),'cms927-'));
try {
 const compile=spawnSync('tsc',['--strict','--target','es2022','--module','commonjs','--lib','es2022,dom','--skipLibCheck','lib/suppliers.ts','lib/financial-accounts.ts','--outDir',dest],{cwd:root,encoding:'utf8'});
 assert.equal(compile.status,0,'Strict TypeScript failed: '+compile.stdout+'\n'+compile.stderr);
 const d=require(path.join(dest,'data.js')),s=require(path.join(dest,'suppliers.js')),a=require(path.join(dest,'financial-accounts.js'));
 let db=d.createSeed();db.users=[{id:'admin',role:'admin',name:'Admin User',username:'admin',password:'x',branch:'UCM',active:true},{id:'pb',role:'pb',name:'Parts Buyer',username:'pb',password:'x',branch:'UCM',active:true},{id:'cashier',role:'cashier',name:'Cashier User',username:'cashier',password:'x',branch:'UCLP',active:true}];
 assert.throws(()=>a.createFinancialAccount(db,'pb','BDO Account','UC',undefined,'Bank',1000,'2026-10-30','Bank statement'),/Admin/);
 db=a.createFinancialAccount(db,'admin','BDO Account','UC',undefined,'Bank',1000,'2026-10-30','Bank statement');const id=db.financialAccounts[0].id;
 assert.equal(a.financialAccountBalance(db,id),1000);assert.equal(db.settings.rfpBase.UCM,0,'Financial accounts do not alter RFP fund balance');
 db=a.postAccountMovement(db,'admin',id,'Inflow',450,'2026-10-30','DEP-001','Deposit');db=a.postAccountMovement(db,'admin',id,'Outflow',100,'2026-10-30','CHK-001','Check');assert.equal(a.financialAccountBalance(db,id),1350);
 assert.throws(()=>a.postAccountMovement(db,'admin',id,'Outflow',100,'2026-10-30','CHK-001','Repeated'),/already recorded/);
 db=a.changeAccountOpening(db,'admin',id,900,'2026-10-30','Corrected prior statement');assert.equal(a.financialAccountBalance(db,id),1250,'Opening adjusted without duplicate inflow');
 assert.throws(()=>a.createFinancialAccount(db,'admin','Wrong Branch','MM','UCM','Cash',0,'2026-10-30','Test'),/Branch/);
 db=s.requestSupplierChange(db,'cashier',{kind:'Supplier',supplierName:'New Demo Vendor'});assert.equal(db.suppliers.length,0,'Cashier request does not publish supplier');assert.equal(db.supplierChangeRequests[0].status,'Pending');
 assert.throws(()=>s.decideSupplierChange(db,'pb',db.supplierChangeRequests[0].id,'Approved',''),/Admin/);
 db=s.decideSupplierChange(db,'admin',db.supplierChangeRequests[0].id,'Approved','Verified supplier');assert.equal(db.suppliers.length,1);
 const supplier=db.suppliers[0];db=s.requestSupplierChange(db,'pb',{kind:'ProductPrice',supplierName:supplier.name,supplierId:supplier.id,productName:'Air Filter',unit:'Piece',unitCost:320,effectiveDate:'2026-10-30'});
 assert.equal(db.supplierProducts.length,0,'Staff price is pending');const pr=db.supplierChangeRequests.find(r=>r.status==='Pending');db=s.decideSupplierChange(db,'admin',pr.id,'Approved','Checked pricing');assert.equal(db.supplierProducts.length,1);assert.equal(s.latestSupplierPrice(db,db.supplierProducts[0].id).unitCost,320);
 db=s.requestSupplierChange(db,'pb',{kind:'Supplier',supplierName:'Rejected Supplier'});const reject=db.supplierChangeRequests.find(r=>r.status==='Pending');assert.throws(()=>s.decideSupplierChange(db,'admin',reject.id,'Rejected',''),/Reason/);db=s.decideSupplierChange(db,'admin',reject.id,'Rejected','Unknown seller');assert(!db.suppliers.some(x=>x.name==='Rejected Supplier'));
 const entry={id:'transaction-1',no:'RFP-001',fund:'RFP',kind:'expense',branch:'UCM',date:'2026-10-30',amount:450,category:'Automotive Parts',payee:'New From Purchase',vat:'Non-VAT',voucher:'',receiptNo:'',tin:'',description:'Brake Pads',notes:'',status:'Pending',createdBy:'pb',createdAt:new Date().toISOString(),unitCost:450,quantity:1};
 db.fundEntries=[entry,...db.fundEntries];db=s.queueNewSupplierPurchases(db,[entry],'pb');
 assert(!db.suppliers.some(x=>x.name==='New From Purchase'),'PB-originated new supplier must be pending');
 assert.equal(db.supplierChangeRequests.filter(r=>r.sourceFundEntryId===entry.id).length,1,'Product linked to source purchase');
 db=s.syncSupplierPurchases(db);assert(!db.suppliers.some(x=>x.name==='New From Purchase'),'Reload migration must NOT auto-approve PB request');
 let pending=db.supplierChangeRequests.find(r=>r.status==='Pending'&&r.kind==='Supplier');db=s.decideSupplierChange(db,'admin',pending.id,'Approved','Checked source');pending=db.supplierChangeRequests.find(r=>r.status==='Pending'&&r.sourceFundEntryId===entry.id);db=s.decideSupplierChange(db,'admin',pending.id,'Approved','Receipt checked');
 assert(db.fundEntries.find(e=>e.id===entry.id).supplierId,'Source expense linked on approval');assert.equal(db.fundEntries.length,1,'No duplicate purchase posted');assert.equal(db.supplierPriceEvents.filter(p=>p.sourceFundEntryId===entry.id).length,1);
 assert.throws(()=>s.addSampleSupplierCatalogue(db,'pb'),/Admin/);const beforeFunds=db.fundEntries.length;db=s.addSampleSupplierCatalogue(db,'admin');assert.equal(db.fundEntries.length,beforeFunds);assert(db.suppliers.some(x=>x.name.includes('SAMPLE')));assert(db.supplierProducts.length>=6);assert.equal(db.inventory.length,0,'Sample prices create no stock');
 // JSX syntax check, not a Next production build.
 let ts;try{ts=require('typescript')}catch{ts=require('/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript')};
 for(const file of ['app/page.tsx','components/SupplierWorkspace.tsx','components/AccountBalances.tsx','lib/data.ts','lib/suppliers.ts','lib/financial-accounts.ts']){
  const source=fs.readFileSync(path.join(root,file),'utf8');const sf=ts.createSourceFile(file,source,ts.ScriptTarget.Latest,true,file.endsWith('tsx')?ts.ScriptKind.TSX:ts.ScriptKind.TS);assert.equal(sf.parseDiagnostics.length,0,`${file}: ${sf.parseDiagnostics.map(x=>x.messageText)}`);
 }
 console.log('PASS v9.27: Admin-only account baselines, duplicate reference checks, supplier pending approvals, staff transaction suggestions, legacy reload isolation, sample catalogue, TS & JSX syntax.');
}finally{fs.rmSync(dest,{recursive:true,force:true})}
