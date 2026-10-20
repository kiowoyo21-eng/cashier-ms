const assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
let ts;try{ts=require('typescript')}catch{ts=require('/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript')}
const root=path.resolve(__dirname,'..');
function load(srcFile,deps={}){const src=fs.readFileSync(path.join(root,srcFile),'utf8');const result=ts.transpileModule(src,{fileName:srcFile,reportDiagnostics:true,compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}});assert.equal(result.diagnostics.filter(d=>d.category===ts.DiagnosticCategory.Error).length,0,srcFile+' has syntax errors');const m={exports:{}};new Function('module','exports','require',result.outputText)(m,m.exports,n=>deps[n]||require(n));return m.exports;}
const d=load('lib/data.ts'),p=load('lib/print.ts',{'./data':d});
assert(d.CAR_CATALOG.includes('Toyota Vios'));
assert(d.CAR_CATALOG.filter(x=>x.toLowerCase().includes('vios')).includes('Toyota Vios'));
assert.equal(d.vehicleName('Toyota Vios','2020'),'Toyota Vios 2020');
assert.deepEqual(d.monthRange('2026-02'),['2026-02-01','2026-02-28']);
assert.deepEqual(d.monthRange('2028-02'),['2028-02-01','2028-02-29']);
const db=d.createSeed();db.fundEntries=[];
function expense(id,at,date='2026-10-17'){return {id,no:`UCM-RFP-${id}`,fund:'RFP',kind:'expense',branch:'UCM',date,amount:150,category:'Automotive Parts',payee:'Supplier',vat:'Non-VAT',voucher:'',receiptNo:'',tin:'',description:'Oil Filter',notes:'',status:'Approved',createdBy:'u-pb',createdAt:at,plate:'ABC1234',quantity:1,unitCost:150}}
const old=expense('before','2026-10-11T01:00:00Z');
const approved={...old,id:'disbursement',no:'UCM-RFP-D001',kind:'replenishment',amount:150,createdAt:'2026-10-12T01:00:00Z',decisionAt:'2026-10-15T01:00:00Z',status:'Approved'};
const pending=expense('while-approval','2026-10-13T01:00:00Z');
const next=expense('after','2026-10-16T01:00:00Z');
const reject={...expense('rejected','2026-10-17T01:00:00Z'),status:'Rejected'};
db.fundEntries.push(old,approved,pending,next,reject);
assert.deepEqual(d.pendingRFPDisbursementRows(db,'UCM').map(x=>x.id),['while-approval','after'],'post-submission purchases must not be lost while approval pending');
let html='';global.window={open:()=>({document:{open(){},write(s){html=s},close(){}},focus(){}}),alert:msg=>{throw Error(msg)}};
p.printPBDisbursement(db,'UCM');assert(html.includes('Oil Filter'));assert(!html.includes('UCM-RFP-before'));assert(html.includes('UCM-RFP-while-approval'));assert(html.includes('UCM-RFP-after'));assert(html.includes('AMOUNT TO REPLENISH'));assert(html.includes('₱300.00')||html.includes('300.00'));
html='';p.printRFPParts(db,'UCM','2026-10-01','2026-10-31');assert(html.includes('<th>Car</th>')&&html.includes('<th>Branch</th>'));assert(html.indexOf('<th>Plate</th>')<html.indexOf('<th>Car</th>')&&html.indexOf('<th>Car</th>')<html.indexOf('<th>Branch</th>'));
const page=fs.readFileSync(path.join(root,'app/page.tsx'),'utf8');
const parsed=ts.transpileModule(page,{fileName:'app/page.tsx',reportDiagnostics:true,compilerOptions:{target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,module:ts.ModuleKind.CommonJS}});
assert.equal(parsed.diagnostics.filter(x=>x.category===ts.DiagnosticCategory.Error).length,0,'TSX JSX syntax');
assert(page.includes('timeMinutesPH()>=8*60+30'));
assert(!page.includes('setCountActual(')&&!page.includes('EXPECTED CASH BALANCE'));
assert(!page.includes('Friday Funds Turnover')&&!page.includes('turnoverFunds'));
assert(page.includes('Brand &amp; Model')&&page.includes('label="Year"')&&page.includes('vehicle-suggestion-list')); 
console.log('PASS v5: monthly date filters, car autocomplete, sales-only turnover, 8:30 BOD, cash-count-only, post-disbursement RFP cutoff, Car+Branch print columns.');
