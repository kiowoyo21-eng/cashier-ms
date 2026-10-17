const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ts=require('/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript');
const root=path.join(__dirname,'..');
function sourceFile(file){return fs.readFileSync(path.join(root,file),'utf8')}
function getData(){const file='lib/data.ts',source=sourceFile(file);const r=ts.transpileModule(source,{fileName:file,reportDiagnostics:true,compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}});assert.equal(r.diagnostics.filter(x=>x.category===ts.DiagnosticCategory.Error).length,0);const m={exports:{}};new Function('module','exports','require',r.outputText)(m,m.exports,require);return m.exports;}
const d=getData();let db=d.createSeed();
assert.deepEqual([...new Set(db.users.map(u=>u.role))].sort(),['admin','cashier','pb']);
const details={branch:'UCQC',barcode:'TEST001',name:'Test air filter',category:'Automotive Parts & Products',unit:'Piece',unitCost:125,sellPrice:220,reorderAt:5,initialQty:3};
assert.throws(()=>d.registerInventoryProduct(db,details,'u-cashier'),/Only Admin/);
assert.throws(()=>d.registerInventoryProduct(db,details,'u-pb'),/Only Admin/);
assert.throws(()=>d.registerInventoryProduct(db,details,'not-a-user'),/Only Admin/);
assert.equal(db.inventory.some(p=>p.barcode==='TEST001'),false);
let next=d.registerInventoryProduct(db,details,'u-admin');let product=next.inventory.find(p=>p.barcode==='TEST001');
assert(product);assert.equal(product.branch,'UCQC');assert.equal(d.stockAvailable(next,product),3);assert.equal(next.audit[0].action,'Stock In');assert(next.audit.some(a=>a.action==='Inventory product created'));
assert.throws(()=>d.registerInventoryProduct(next,details,'u-admin'),/Barcode already registered/);
next=d.registerInventoryProduct(next,{...details,branch:'UCM',initialQty:0},'u-admin');assert.equal(next.inventory.filter(p=>p.barcode==='TEST001').length,2);
const changed={barcode:'NEW001',name:'Test air filter updated',category:'Automotive Parts & Products',unit:'Box',unitCost:145,sellPrice:300,reorderAt:8};
assert.throws(()=>d.updateInventoryProduct(next,product.id,changed,'u-cashier'),/Only Admin/);
assert.throws(()=>d.updateInventoryProduct(next,product.id,changed,'u-pb'),/Only Admin/);
const historicalMovements=next.stockMovements.map(x=>({...x}));
next=d.updateInventoryProduct(next,product.id,changed,'u-admin');product=next.inventory.find(p=>p.id===product.id);assert.equal(product.barcode,'NEW001');assert.equal(product.branch,'UCQC');assert.equal(product.openingQty,0);assert.equal(d.stockAvailable(next,product),3);assert.deepEqual(next.stockMovements,historicalMovements);
assert(next.audit[0].action==='Inventory product updated');assert(next.audit[0].detail.includes('TEST001 → NEW001'));
// Can reuse a retired barcode in this branch only if no other item owns it.
next=d.updateInventoryProduct(next,product.id,{...changed,barcode:'TEST001'},'u-admin');
assert.equal(next.inventory.find(p=>p.id===product.id).barcode,'TEST001');
// Admin can still view/receive all branch stock; Cashier cannot receive in another branch.
const other=next.inventory.find(p=>p.id===product.id);
assert.throws(()=>d.recordStockIn(next,other.id,1,'u-cashier'),/No Stock In access/);
next=d.recordStockIn(next,other.id,1,'u-admin','Admin receipt');assert.equal(d.stockAvailable(next,other),4);
// Source-level UI regression: only Admin sees register/edit actions and handlers are role guarded.
const page=sourceFile('app/page.tsx');
assert(page.includes("user.role==='admin'&&<button type=\"button\" className=\"button button-primary\" onClick={openNewProduct}"));
assert(page.includes("if(!user||user.role!=='admin'||locked)return;"));
assert(page.includes("dialog==='newProduct'&&user.role==='admin'"));
assert(page.includes("dialog==='editProduct'&&user.role==='admin'"));
assert(!page.includes("user.role==='cashier'||user.role==='admin'&&selectedBranch!=='ALL'"));
assert(page.includes('Register for Branch'));
console.log('PASS v8.3: three roles only; Admin-only product registration/edit; branch-scoped barcode uniqueness, stock history, audit, and retained Cashier Stock In.');
