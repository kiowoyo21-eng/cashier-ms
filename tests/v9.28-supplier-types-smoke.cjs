const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),out=fs.mkdtempSync(path.join(os.tmpdir(),'cms-v928-'));
try{
 const comp=spawnSync('tsc',['--strict','--target','es2022','--module','commonjs','--lib','es2022,dom','--skipLibCheck','lib/suppliers.ts','--outDir',out],{cwd:root,encoding:'utf8'});
 assert.equal(comp.status,0,comp.stdout+'\n'+comp.stderr);
 const d=require(path.join(out,'data.js')),s=require(path.join(out,'suppliers.js'));
 let db=d.createSeed();db.users=[{id:'admin',role:'admin',name:'Admin',username:'admin',password:'x',branch:'UCM',active:true},{id:'pb',role:'pb',name:'PB',username:'pb',password:'x',branch:'UCM',active:true},{id:'cashier',role:'cashier',name:'Cashier',username:'cashier',password:'x',branch:'UCLP',active:true}];
 db=s.createSupplier(db,'Basic Ledger Vendor','admin');let sup=db.suppliers[0];
 assert.equal(s.effectiveSupplierMode(sup),'ledger','Default is Ledger Only');
 assert.throws(()=>s.setSupplierOpening(db,sup.id,'UC',100,'2026-10-30','Opening statement','admin'),/Ledger Only/);
 assert.throws(()=>s.setSupplierMode(db,sup.id,'opening_payable','pb'),/Admin/);
 db=s.setSupplierMode(db,sup.id,'opening_payable','admin');assert.equal(s.effectiveSupplierMode(db.suppliers[0]),'opening_payable');
 assert.throws(()=>s.setSupplierOpening(db,sup.id,'UC',50,'2026-10-30','Opening','cashier'),/Admin/);
 db=s.setSupplierOpening(db,sup.id,'UC',1499.50,'2026-10-30','Verified prior statement','admin');
 assert.throws(()=>s.setSupplierMode(db,sup.id,'ledger','admin'),/Clear existing opening/);
 const payableSnapshot=db.suppliers[0].openingPayable.UC, auditCount=db.supplierOpeningHistory.length;
 db=s.addSupplierProductPrice(db,sup.id,'Brake Pads','Set',450,'admin','2026-10-30');
 assert.equal(db.suppliers[0].openingPayable.UC,payableSnapshot,'Adding catalogue price never creates payable');
 assert.equal(db.supplierOpeningHistory.length,auditCount,'Adding price never posts liability');
 db=s.setSupplierOpening(db,sup.id,'UC',0,'2026-10-30','Settled opening correction','admin');db=s.setSupplierMode(db,sup.id,'ledger','admin');
 assert.equal(db.suppliers[0].openingPayable.UC,0);assert.equal(s.effectiveSupplierMode(db.suppliers[0]),'ledger');assert.equal(db.supplierOpeningHistory.length,2,'Audit preserved');
 const legacy={...sup,id:'old',mode:undefined,openingPayable:{UC:199,MM:0}};assert.equal(s.effectiveSupplierMode(legacy),'opening_payable','Legacy nonzero payable preserved');
 assert.equal(s.effectiveSupplierMode({...legacy,openingPayable:{UC:0,MM:0}}),'ledger','Legacy zero payable treated as Ledger Only');
 db=s.requestSupplierChange(db,'pb',{kind:'Supplier',supplierName:'Credit Vendor',supplierMode:'opening_payable'});
 const pending=db.supplierChangeRequests.find(r=>r.status==='Pending');assert.equal(pending.supplierMode,'opening_payable');
 assert(!db.suppliers.some(x=>x.name==='Credit Vendor'));
 db=s.decideSupplierChange(db,'admin',pending.id,'Approved','Verified request');
 assert.equal(s.effectiveSupplierMode(db.suppliers.find(x=>x.name==='Credit Vendor')),'opening_payable');
 db=s.requestSupplierChange(db,'cashier',{kind:'Supplier',supplierName:'Ledger Vendor'});
 const req=db.supplierChangeRequests.find(r=>r.status==='Pending');db=s.decideSupplierChange(db,'admin',req.id,'Approved','Verified');
 assert.equal(s.effectiveSupplierMode(db.suppliers.find(x=>x.name==='Ledger Vendor')),'ledger');
 assert.equal(db.fundEntries.length,0,'No financial transactions inserted');
 let ts;try{ts=require('typescript')}catch{ts=require('/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript')}
 for(const file of ['components/SupplierWorkspace.tsx','lib/suppliers.ts','app/page.tsx']){const text=fs.readFileSync(path.join(root,file),'utf8');const sf=ts.createSourceFile(file,text,ts.ScriptTarget.Latest,true,file.endsWith('tsx')?ts.ScriptKind.TSX:ts.ScriptKind.TS);assert.equal(sf.parseDiagnostics.length,0,`${file}: ${sf.parseDiagnostics.map(x=>x.messageText).join('; ')}`)}
 const ui=fs.readFileSync(path.join(root,'components/SupplierWorkspace.tsx'),'utf8');assert(ui.includes('selectedMode===\'opening_payable\'')&&ui.includes('supplier-opening-form')&&ui.includes('Supplier Type'));
 console.log('PASS v9.28 supplier type workflow: Ledger default, optional Admin opening, no hidden debt, historic compatibility, pending staff requests, JSX parse.');
}finally{fs.rmSync(out,{recursive:true,force:true})}
