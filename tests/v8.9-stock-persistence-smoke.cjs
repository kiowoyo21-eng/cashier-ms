const assert=require('node:assert/strict');
const fs=require('node:fs');const path=require('node:path');const vm=require('node:vm');const ts=require('/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript');
const root=path.resolve(__dirname,'..');
const keys=new Map();
const localStorage={getItem:k=>keys.get(k)||null,setItem:(k,v)=>keys.set(k,v)};
const file=fs.readFileSync(path.join(root,'lib/data.ts'),'utf8');
const js=ts.transpileModule(file,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
const m={exports:{}};vm.runInNewContext(js,{module:m,exports:m.exports,crypto:require('node:crypto').webcrypto,Intl,Date,console,localStorage,window:{}});
const d=m.exports;
let db=d.createSeed();const admin=db.users.find(u=>u.role==='admin'),cashier=db.users.find(u=>u.role==='cashier');
const make=(code,qty)=>({branch:'UCM',barcode:code,name:'Test Oil '+code,category:'Automotive Parts & Products',unit:'Bottle',unitCost:100,sellPrice:200,reorderAt:2,trackingMode:'quantity',initialQty:qty});
// New Admin product: 1 verified Stock In; survives a full save/reload.
db=d.registerInventoryProduct(db,make('T89001',1),admin.id);
let p=db.inventory.find(x=>x.barcode==='T89001');assert.equal(d.stockAvailable(db,p),1);
assert(d.storeDB(db));db=d.loadDB();p=db.inventory.find(x=>x.barcode==='T89001');assert.equal(d.stockAvailable(db,p),1);
// Legacy zero stock isn't guessed; Admin physically receives exactly 1 and ledger survives reload.
db=d.registerInventoryProduct(db,make('T89002',0),admin.id);
let legacy=db.inventory.find(x=>x.barcode==='T89002');assert.equal(d.stockAvailable(db,legacy),0);
const proof={name:'delivery.jpg',data:'data:image/jpeg;base64,VEVTVA=='};
db=d.submitStockReceipt(db,[{productId:legacy.id,qty:1}],'DR-89002','Admin physically verified',admin.id,proof);
assert.equal(d.stockAvailable(db,legacy),1);
assert.equal(db.stockReceipts[0].status,'Approved');assert(d.storeDB(db));db=d.loadDB();legacy=db.inventory.find(x=>x.barcode==='T89002');assert.equal(d.stockAvailable(db,legacy),1);
// Pending cashier receipt appears only as pending until independent verification.
db=d.submitStockReceipt(db,[{productId:legacy.id,qty:2}],'DR-89003','Cashier received',cashier.id,proof);
assert.equal(d.stockAvailable(db,legacy),1);
assert(d.storeDB(db));db=d.loadDB();assert.equal(d.stockAvailable(db,db.inventory.find(x=>x.id===legacy.id)),1);
assert.equal(db.stockReceipts[0].status,'Pending');
// User-facing UI: existing product Add Stock opens preselected quantity 1; storage failure cannot show success.
const app=fs.readFileSync(path.join(root,'app/page.tsx'),'utf8');
const panel=fs.readFileSync(path.join(root,'components/StockScanPanel.tsx'),'utf8');
assert(app.includes('receiveExistingProduct(p)'));assert(app.includes('preselectedProductId={stockPrefillProductId||undefined}'));
assert(panel.includes('preselectedProductId?[{key:preselectedProductId,productId:preselectedProductId,qty:1'));
assert(app.includes('if(!storeDB(next))throw new Error'));
assert(app.includes('Pending In'));
console.log('PASS v8.9: verified 1-stock registration persists, existing 0 gets real verified Stock In, pending stays excluded, prefilled Add Stock and durable save safeguards present.');
