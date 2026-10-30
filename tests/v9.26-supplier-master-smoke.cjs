const assert=require('node:assert/strict');const path=require('node:path');const fs=require('node:fs');const os=require('node:os');const {spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),dest=fs.mkdtempSync(path.join(os.tmpdir(),'cms-sup-'));
try{
 const compile=spawnSync('tsc',['--strict','--target','es2022','--module','commonjs','--lib','es2022,dom','--skipLibCheck','lib/suppliers.ts','--outDir',dest],{cwd:root,encoding:'utf8'});
 assert.equal(compile.status,0,'TS compile failed:\n'+compile.stdout+'\n'+compile.stderr);
 const d=require(path.join(dest,'data.js'));const s=require(path.join(dest,'suppliers.js'));
 let db=d.createSeed();assert.equal(db.suppliers.length,0,'New browser starts with empty supplier database');
 db=s.createSupplier(db,'ABC Auto Parts','admin');let supplier=db.suppliers[0];assert.equal(supplier.name,'ABC Auto Parts');
 assert.throws(()=>s.createSupplier(db,'  abc   auto parts ','admin'),/already exists/i,'Duplicate supplier is blocked');
 db.users=[{id:'admin',role:'admin',name:'Admin',username:'admin',password:'x',branch:'UCM',active:true}];
 db=s.setSupplierMode(db,supplier.id,'opening_payable','admin');
 db=s.setSupplierOpening(db,supplier.id,'UC',1950.29,'2026-10-30','Verified statement','admin');
 db=s.setSupplierOpening(db,supplier.id,'MM',245.05,'2026-10-30','Verified statement','admin');
 assert.equal(db.suppliers[0].openingPayable.UC,1950.29);assert.equal(db.suppliers[0].openingPayable.MM,245.05);
 assert.equal(db.supplierOpeningHistory.length,2,'Opening balance edits are audited');
 assert.equal(db.settings.rfpBase.UCM,0,'Opening payable is separate from RFP fund');
 db=s.addSupplierProductPrice(db,supplier.id,'Brake Pads','Set',320.29,'admin','2026-10-30');
 db=s.addSupplierProductPrice(db,supplier.id,' brake   pads ','Set',310.50,'admin','2026-10-31');
 assert.equal(db.supplierProducts.length,1,'Repeated product name updates the same ledger catalogue');
 assert.equal(s.latestSupplierPrice(db,db.supplierProducts[0].id).unitCost,310.50,'Latest price is correct');
 const entry=(id,payee,description,qty,cost,branch='UCM')=>({id,no:'RFP'+id,fund:'RFP',kind:'expense',branch,date:'2026-10-30',amount:qty*cost,category:'Automotive Parts',payee,vat:'Non-VAT',voucher:'',receiptNo:'',tin:'',description,notes:'',status:'Pending',quantity:qty,unitCost:cost,createdBy:'pb',createdAt:'2026-10-30T01:00:00.000Z'});
 db.fundEntries=[entry('A',' ABC  Auto Parts ','Brake Pads',2,270,'UCQC'),entry('B','New Supplier Inc','Oil Filter',3,115,'MMM'),entry('C','New Supplier Inc','Oil Filter',4,110,'MMM')];
 db=s.syncSupplierPurchases(db);assert.equal(db.suppliers.length,2,'Known supplier reused; unknown created once');
 assert.equal(db.supplierProducts.length,2,'Product linked uniquely per supplier');
 assert.equal(db.supplierPriceEvents.length,5,'2 manual + 3 purchase price events');
 assert.equal(db.fundEntries.find(e=>e.id==='A').supplierId,supplier.id,'RFP entry stores permanent supplier ID');
 const vendor=db.suppliers.find(x=>x.name==='New Supplier Inc');assert(vendor&&vendor.branches.includes('MMM'));
 assert.equal(s.supplierPurchases(db,vendor.id).length,2);
 const state=JSON.stringify(db);db=s.syncSupplierPurchases(db);assert.equal(JSON.stringify(db),state,'Backfill is fully idempotent');
 assert.equal(db.fundEntries.length,3,'No duplicate financial expenses posted');
 db.fundEntries[1].status='Rejected';const events=db.supplierPriceEvents.filter(e=>e.sourceFundEntryId==='B');assert.equal(events.length,1,'Source ledger event remains for audit');
 assert.equal(s.latestSupplierPrice(db,db.fundEntries[2].supplierProductId).unitCost,110,'Rejected RFP transaction does not influence current price');
 assert.equal(s.supplierPurchases(db,vendor.id).length,1,'Rejected transactions excluded from purchase totals');
 db=s.editSupplier(db,vendor.id,{phone:'09171234567',branches:['MMM','UCM']},'admin');assert.equal(db.suppliers.find(x=>x.id===vendor.id).phone,'09171234567');
 for (const [p,terms] of [
  ['app/page.tsx',["suppliers:'Suppliers'","view==='suppliers'",'syncSupplierPurchases','SupplierWorkspace']],
  ['components/SupplierWorkspace.tsx',['Products &amp; Price Ledger','Opening Payable','RFP Purchase Transactions','Set Price']],
  ['lib/data.ts',['suppliers?:SupplierRecord[]','supplierPriceEvents?:SupplierPriceEvent[]']],
 ]){const src=fs.readFileSync(path.join(root,p),'utf8');for(const v of terms)assert(src.includes(v),`${p} missing ${v}`);}
 let ts;try{ts=require('typescript')}catch{ts=require('/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript');}
 for(const file of ['app/page.tsx','app/layout.tsx','components/SupplierWorkspace.tsx','lib/suppliers.ts','lib/data.ts']){
  const source=fs.readFileSync(path.join(root,file),'utf8');const parsed=ts.createSourceFile(file,source,ts.ScriptTarget.Latest,true,file.endsWith('tsx')?ts.ScriptKind.TSX:ts.ScriptKind.TS);
  assert.equal(parsed.parseDiagnostics.length,0,`${file} syntax: ${parsed.parseDiagnostics.map(d=>d.messageText).join('; ')}`);
 }
 console.log('PASS v9.26 Supplier Master: dedupe, historical sync, product ledger, separate entity openings, immutable RFP facts, source linkage, new JSX syntax.');
}finally{fs.rmSync(dest,{recursive:true,force:true});}
