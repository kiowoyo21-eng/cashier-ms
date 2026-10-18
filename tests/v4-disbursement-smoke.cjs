// v4: Funding and combined print validation without npm installation.
const assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
let ts;try{ts=require('typescript')}catch{ts=require('/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript')}
const root=path.resolve(__dirname,'..');
const load=(f)=>{const src=fs.readFileSync(path.join(root,'lib',f+'.ts'),'utf8');const compiled=ts.transpileModule(src,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText;const mod={exports:{}};new Function('module','exports','require',compiled)(mod,mod.exports,(n)=>n==='./data'?data:require(n));return mod.exports};
const data=load('data'),printer=load('print');
const db=data.createSeed();const seed=db.fundEntries.find(x=>x.fund==='RF'&&x.branch==='UCM');
assert.equal(data.replenishmentDue(db,'UCM','RF'),1250,'initial spent amount');
db.fundEntries.push({...seed,id:'approved-replenishment',no:'UCM-RF-99',kind:'replenishment',amount:1250,status:'Pending',date:'2026-10-16'});
assert.equal(data.replenishmentDue(db,'UCM','RF'),1250,'pending replenishment does not alter actual balance');
db.fundEntries.at(-1).status='Approved';
assert.equal(data.replenishmentDue(db,'UCM','RF'),0,'approved replenishment restores fund target');
db.fundEntries.push({...seed,id:'new-spend',no:'UCM-RF-100',amount:800,status:'Pending',date:'2026-10-16'});
assert.equal(data.replenishmentDue(db,'UCM','RF'),800,'only newly spent cash is due');
db.fundEntries.at(-1).status='Rejected';
assert.equal(data.replenishmentDue(db,'UCM','RF'),0,'rejected cash expense is reversed');
// Simulate a report period that omits carried-forward unreplenished cash.
db.fundEntries.find(x=>x.id==='approved-replenishment').amount=500;
seed.date='2026-10-10';
const summary=data.disbursementSummary(db,'UCM','RF','2026-10-16','2026-10-16');
assert.equal(summary.base,50000);assert.equal(summary.opening,48750);assert.equal(summary.deposits,500);assert.equal(summary.remaining,49250);assert.equal(summary.amountRequested,750);
let printed='';global.window={open:()=>({document:{open(){},write(x){printed=x},close(){}},focus(){}}),alert:msg=>{throw Error(msg)}};
printer.printFundReport(db,'UCM','RF',db.fundEntries,'2026-10-16','2026-10-16');
assert.equal((printed.match(/class="print-page fund-print"/g)||[]).length,1);
assert(printed.includes('DISBURSEMENT &amp; REPLENISHMENT'));
assert(printed.includes('Previous unreplenished cash'));
assert(printed.includes('AUTOMATIC AMOUNT TO REPLENISH'));
console.log('PASS: no manually entered fund request, approved/unapproved replenishment, rejected expenses, carried balance and combined printable report');
