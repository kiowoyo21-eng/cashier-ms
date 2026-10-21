const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {spawnSync}=require('node:child_process');const root=path.resolve(__dirname,'..'),out=fs.mkdtempSync(path.join(os.tmpdir(),'cms-auto-disb-v921-'));
try{
 const result=spawnSync('tsc',['--strict','--target','es2022','--module','commonjs','--lib','es2022,dom','--skipLibCheck','lib/disbursement-requests.ts','--outDir',out],{cwd:root,encoding:'utf8'});
 assert.equal(result.status,0,result.stdout+'\n'+result.stderr);
 const m=require(path.join(out,'disbursement-requests.js')),d=require(path.join(out,'data.js'));
 const pb={id:'PB1',username:'pb',password:'x',name:'PB Tester',role:'pb',branch:'UCM',active:true};
 const cash={id:'C1',username:'c',password:'x',name:'Cashier',role:'cashier',branch:'UCQC',active:true};
 const other={...cash,id:'C2',branch:'UCM'},admin={...cash,id:'A',role:'admin'};
 let db={...d.createSeed(),users:[pb,cash,other,admin],settings:{...d.createSeed().settings,rfBase:{UCQC:10000,UCM:10000,UCLP:10000,MMM:10000},rfpBase:{UCQC:50000,UCM:50000,UCLP:50000,MMM:50000}}};
 const pdf={name:'receipt.pdf',data:'data:application/pdf;base64,JVBERi0xLjQK'},now=new Date().toISOString();
 function item(id,fund,branch,amount,charge=0,proof=pdf){return {id,no:id,fund,branch,kind:'expense',date:'2026-10-21',amount,onlineCharge:charge,category:'Automotive Parts',payee:'Supplier',vat:'Non-VAT',voucher:'',receiptNo:'',tin:'',description:'Part for test unit',notes:'',plate:'ABC1234',proof,status:'Pending',createdBy:fund==='RFP'?pb.id:cash.id,createdAt:now};}
 db.fundEntries=[item('e1','RFP','UCM',3800,10),item('e2','RFP','UCQC',2500,0),item('e3','RFP','UCLP',1200,20),item('e4','RFP','MMM',100,0),item('rf1','RF','UCQC',420,5),item('rf2','RF','UCM',500,0)];
 assert.equal(d.balance(db,'UCM','RFP'),46190,'Charges are included in cash movement');
 assert.equal(d.disbursementSummary(db,'UCM','RFP').expenses,3810,'Fund summary includes online charge');
 assert.equal(d.categoryTotals(db.fundEntries.filter(x=>x.fund==='RF'))['Automotive Parts'],925,'Category expenses include fees');
 assert.equal(m.eligibleFundExpenses(db,pb,'RFP').length,4);assert.equal(m.eligibleFundExpenses(db,cash,'RF').length,1);
 assert.equal(m.eligibleFundExpenses(db,pb,'RF').length,0,'PB not RF requester');
 assert.throws(()=>m.createGeneratedDisbursement(db,cash,'RF',['rf2']),/outside your branch|unavailable|reserved/);
 assert.throws(()=>m.createGeneratedDisbursement(db,pb,'RFP',['e1','e1']),/distinct/);
 assert.throws(()=>m.createGeneratedDisbursement(db,admin,'RFP',['e1']),/Only active/);
 db=m.createGeneratedDisbursement(db,pb,'RFP',['e1','e2','e3','e4']);let r=db.disbursementRequests[0];
 assert.equal(r.amount,7630,'Sum base amounts 7600 plus charge 30');assert.equal(r.sourceLines.length,4);assert.equal(r.sourceLines[0].onlineCharge,10);assert.equal(r.attachments.length,0,'Receipt bytes are not duplicated in browser storage');assert.equal(m.resolvedRequestReceipts(db,r).length,1,'Same source receipt is linked and deduped');
 assert.deepEqual(r.sourceBranches,['UCQC','UCM','UCLP','MMM']);assert.equal(r.sourceBalances.UCM.expenses,3810);
 assert.equal(db.fundEntries.length,6,'Ledger never duplicated');assert.equal(db.fundEntries[0].amount,3800,'Source value stays original');
 assert.equal(m.visibleDisbursements(db,admin,'MMM').length,1,'Consolidated RFP request visible on each contributing branch');
 assert.throws(()=>m.createGeneratedDisbursement(db,pb,'RFP',['e1']),/unavailable|reserved/,'An expense cannot join two active requests');
 db=m.submitDisbursementRequest(db,r.id,pb);r=db.disbursementRequests[0];assert.equal(r.status,'Pending Accounting Approval');assert.equal(r.accounting,undefined);assert.equal(r.msKate,undefined);assert.equal(r.release,undefined);
 assert.equal(db.fundEntries.length,6);
 assert.throws(()=>m.reviseGeneratedDisbursement(db,r.id,pb,['e1'],'try'),/locked/);
 // Submitted data cannot silently change, and no second request can claim its expenses.
 db=m.createGeneratedDisbursement(db,cash,'RF',['rf1']);let c=db.disbursementRequests[0];
 assert.equal(c.amount,425);assert.deepEqual(c.sourceBranches,['UCQC']);assert.equal(m.resolvedRequestReceipts(db,c).length,1);
 db=m.reviseGeneratedDisbursement(db,c.id,cash,['rf1'],'Urgent');c=db.disbursementRequests[0];assert.equal(c.revision,2);
 db=m.submitDisbursementRequest(db,c.id,cash);c=db.disbursementRequests[0];assert.equal(c.status,'Pending Accounting Approval');
 const sourceSnapshot=JSON.parse(JSON.stringify(db));assert.equal(sourceSnapshot.disbursementRequests.length,2);
 assert.equal(sourceSnapshot.disbursementRequests[0].sourceLines[0].total,425);
 const ui=fs.readFileSync(path.join(root,'components/DisbursementWorkspace.tsx'),'utf8'),paper=fs.readFileSync(path.join(root,'lib/disbursement-paper.ts'),'utf8'),home=fs.readFileSync(path.join(root,'app/page.tsx'),'utf8');
 assert(ui.includes('createAutomaticDisbursement')&&ui.includes('makeGeneratedSnapshot')&&!ui.includes('Requested Amount (PHP)<input'),'No manual amount entry');
 assert(ui.includes('Total per Branch')&&ui.includes('Automatic coverage'));assert(ui.includes('Download Paper + Receipts PDF'));
 assert(paper.includes('size:A4 portrait')&&paper.includes('doc.copyPages')&&paper.includes('embedPng'));
 assert(paper.includes('ONLINE CHARGE')&&paper.includes('TOTAL EXPENSES')&&paper.includes('FUND SUMMARY - TOTAL PER BRANCH'),'Downloaded PDF preserves all five approval-paper columns and per-branch summary');
 assert(ui.includes("active.sourceMode==='generated'&&creator"),'Only generated drafts may be revised');
 assert(home.includes('Other Reports &amp; Bulk Exports')&&home.includes('selectedReportFund'));
 assert(home.includes("entry.fund!=='RF'"));
 assert(home.includes("value={eForm.onlineCharge}")&&home.includes("value={partForm.onlineCharge}"));
 assert(!ui.includes('Simulate Accounting')&&!ui.includes('Simulate Ms Kate'),'No unauthorized approval controls');
 let ts;try{ts=require('typescript')}catch{ts=require('/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript')}
 for(const file of ['app/page.tsx','components/DisbursementWorkspace.tsx','lib/disbursement-paper.ts']){let parsed=ts.createSourceFile(file,fs.readFileSync(path.join(root,file),'utf8'),ts.ScriptTarget.Latest,true,file.endsWith('.tsx')?ts.ScriptKind.TSX:ts.ScriptKind.TS);assert.equal(parsed.parseDiagnostics.length,0,`${file}: ${parsed.parseDiagnostics.map(d=>d.messageText)}`);}
 console.log('PASS v9.21: PB four-branch / Cashier one-branch, auto totals+charges, receipt dedup, duplicate reservation, no payments, immutable approval stages, history, A4/PDF source, contextual Reports.');
}finally{fs.rmSync(out,{recursive:true,force:true})}
