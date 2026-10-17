const assert=require('node:assert/strict');
const fs=require('node:fs');const path=require('node:path');const ts=require('/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript');
const root=path.resolve(__dirname,'..');
const src=fs.readFileSync(path.join(root,'lib/data.ts'),'utf8');
const js=ts.transpileModule(src,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const moduleObj={exports:{}};new Function('module','exports','require',js)(moduleObj,moduleObj.exports,require);const d=moduleObj.exports;
let db=d.createSeed();const admin=db.users.find(x=>x.role==='admin'),cashier=db.users.find(x=>x.role==='cashier');
const add=(barcode,name,extra={})=>({branch:'UCM',barcode,name,category:'Automotive Parts & Products',unit:'Bottle',trackingMode:'quantity',reorderAt:2,initialQty:1,...extra});
assert.throws(()=>d.registerPendingInventoryProducts(db,[add('T9001','Oil')],cashier.id),/Only Admin/);
assert.throws(()=>d.registerPendingInventoryProducts(db,[add('T9001','Oil'),add('T9001','Oil duplicate')],admin.id),/Duplicate/);
assert.throws(()=>d.registerPendingInventoryProducts(db,[add('T9001','')],admin.id),/name/);
assert.equal(db.inventory.length,0,'Invalid batch must be atomic');
db=d.registerPendingInventoryProducts(db,[add('T9001','Engine Oil'),add('T9002','Brake Fluid',{initialQty:3}),add('T9003','Shop Cleaner',{category:'Shop Supplies',initialQty:2})],admin.id);
assert.equal(db.inventory.length,3);
const oil=db.inventory.find(p=>p.barcode==='T9001'),brake=db.inventory.find(p=>p.barcode==='T9002'),cleaner=db.inventory.find(p=>p.barcode==='T9003');
for(const p of [oil,brake,cleaner]){
 assert(d.needsPriceConfiguration(p));assert.equal(d.stockAvailable(db,p),0);assert.equal(p.unitCost,0);assert.equal(p.sellPrice,0);
 assert(!db.stockMovements.some(m=>m.productId===p.id));
}
assert.equal(oil.pendingInitialQty,1);assert.equal(brake.pendingInitialQty,3);
assert.throws(()=>d.configurePendingProductPrices(db,[{productId:oil.id,unitCost:250,sellPrice:450}],cashier.id),/Only Admin/);
assert.throws(()=>d.configurePendingProductPrices(db,[{productId:oil.id,unitCost:0,sellPrice:450}],admin.id),/valid/);
assert.throws(()=>d.configurePendingProductPrices(db,[{productId:oil.id,unitCost:250,sellPrice:-1}],admin.id),/valid/);
// There is no way to issue a pending/unpriced product in an open POS.
const draft={id:'draft-price-test',no:'UCM-POS-PRICE01',branch:'UCM',date:d.todayPH(),client:'',phone:'',vehicle:'Toyota Vios 2020',plate:'214UWI',concern:'',items:[],payments:[],status:'Pending',createdBy:cashier.id,createdAt:new Date().toISOString()};
db={...db,pos:[draft,...db.pos]};
assert.throws(()=>d.confirmStockOut(db,oil.id,draft.id,1,cashier.id),/Price Configuration/);
// Verify single price: posts initial quantity (not merely number on UI) to correct branch.
db=d.configurePendingProductPrices(db,[{productId:oil.id,unitCost:250,sellPrice:450}],admin.id);
assert(!d.needsPriceConfiguration(db.inventory.find(p=>p.id===oil.id)));assert.equal(d.stockAvailable(db,db.inventory.find(p=>p.id===oil.id)),1);
assert.equal(db.stockMovements.find(m=>m.productId===oil.id).unitCost,250);
assert.throws(()=>d.configurePendingProductPrices(db,[{productId:oil.id,unitCost:250,sellPrice:450}],admin.id),/not awaiting/);
// Verify Save All including a nonchargeable shop supply.
db=d.configurePendingProductPrices(db,[{productId:brake.id,unitCost:200,sellPrice:350},{productId:cleaner.id,unitCost:75,sellPrice:0}],admin.id);
assert.equal(d.stockAvailable(db,db.inventory.find(p=>p.id===brake.id)),3);
assert.equal(d.stockAvailable(db,db.inventory.find(p=>p.id===cleaner.id)),2);
assert.equal(db.inventory.find(p=>p.id===cleaner.id).sellPrice,0);
db=d.confirmStockOut(db,oil.id,draft.id,1,cashier.id);
assert.equal(d.stockAvailable(db,db.inventory.find(p=>p.id===oil.id)),0);
assert(db.audit.some(a=>a.action==='Price Configuration completed & initial Stock In posted'));
const makeNew=add('T9004','Oil 2',{branch:'UCQC'});
db=d.registerPendingInventoryProducts(db,[makeNew],admin.id);
assert.equal(d.stockAvailable(db,db.inventory.find(p=>p.barcode==='T9004')),0);
assert.equal(d.stockAvailable(db,db.inventory.find(p=>p.barcode==='T9002')),3,'Pricing and stock out in UCM cannot affect unrelated branch products');
// Legacy products without the new status remain priced and usable.
const older=d.registerInventoryProduct(d.createSeed(),{...add('LEG900','Legacy Oil'),unitCost:190,sellPrice:300},admin.id);
assert.equal(d.needsPriceConfiguration(older.inventory[0]),false);
// UI requirements: no pricing inputs in scanner; separate configuration form.
const bulk=fs.readFileSync(path.join(root,'components/BulkScanRegistration.tsx'),'utf8');
const page=fs.readFileSync(path.join(root,'app/page.tsx'),'utf8');
const configure=fs.readFileSync(path.join(root,'components/PriceConfiguration.tsx'),'utf8');
assert(!bulk.includes('Cost / Unit (₱)')&&!bulk.includes('Selling Price (₱)'),'Bulk Scan must not include prices');
assert(bulk.includes('Product Name')&&bulk.includes('Submit All ('));
assert(page.includes('registerPendingInventoryProducts(db,')&&page.includes('showPriceConfiguration&&<PriceConfiguration'));
assert(configure.includes('Save All Prices')&&configure.includes('Save Price'));
console.log('PASS v9.0: Scan → Name → Submit All → Pending Stock → Price Configuration, batch pricing, zero-sale-price shop supplies, branch isolation, permissions, Stock Out lockout, legacy compatibility.');
