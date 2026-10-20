const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os'),{spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),out=fs.mkdtempSync(path.join(os.tmpdir(),'uc-dp-v915-'));
try{
 const built=spawnSync('tsc',['--strict','--target','es2020','--module','commonjs','--skipLibCheck','--lib','es2020,dom','lib/pos-downpayment.ts','lib/terminal.ts','lib/pos-draft-control.ts','--outDir',out],{cwd:root,encoding:'utf8'});
 assert.equal(built.status,0,built.stdout+'\n'+built.stderr);
 const D=require(path.join(out,'data.js')),P=require(path.join(out,'pos-downpayment.js')),C=require(path.join(out,'pos-draft-control.js')),T=require(path.join(out,'terminal.js'));
 const db=D.createSeed(),cashier=db.users.find(u=>u.role==='cashier');assert(cashier);
 const original={id:'dp-test-1',no:'DP-00001',branch:cashier.branch,date:D.todayPH(),client:'Car Owner',phone:'',vehicle:'Toyota Vios 2024',plate:'DP 1234',concern:'Service',items:[{id:'oil',type:'Service',name:'Labor',qty:1,price:2500,lineTotal:2500,cost:0}],payments:[],status:'Pending',createdBy:cashier.id,createdAt:new Date().toISOString()};
 let state={...db,pos:[]};
 assert.throws(()=>P.recordInitialDownpayment(state,original,cashier.id,'Cash',2500),/LESS/);
 assert.throws(()=>P.recordInitialDownpayment(state,original,cashier.id,'Cash',0),/Downpayment/);
 let first=P.recordInitialDownpayment(state,original,cashier.id,'Cash',700);
 state=first.db;
 assert.equal(state.pos.length,1);assert.equal(first.pos.no,'DP-00001');assert.equal(D.paidTotal(first.pos),700);assert.equal(first.pos.quotationPhase,'Initial');assert.equal(first.pos.cogsReviewedAt,undefined);
 assert.equal(first.pos.firstQuotation.saleTotal,2500);assert.equal(first.pos.firstQuotation.items[0].name,'Labor');assert.equal(P.awaitingFinalQuotation(first.pos),true);assert.equal(P.mayPayRemaining(first.pos),false);
 assert.equal(first.pos.draftHistory.length,1);
 assert.equal(C.unitVisitDecision(state,'dp1234',cashier.branch).kind,'resume');
 assert.throws(()=>C.deletePOSDraft(state,first.pos.id,cashier.id,'Draft correction'),/already has a payment/);
 assert.throws(()=>T.recordPOSPayment(state,first.pos.id,'Cash',100,cashier.id),/Final Quotation and COGS Review/);
 assert.throws(()=>D.requestStockIssue(state,first.pos.id,[],'Urgent labor and parts required',cashier.id),/Final Quotation and COGS Review/);
 const raised={...first.pos,items:[{...first.pos.items[0],id:'labor-final',lineTotal:3200,price:3200,costSource:'No direct cost'}],quotationPhase:'Final',cogsReviewedAt:new Date().toISOString(),cogsReviewedBy:cashier.id};
 const saved=C.saveUnitPOSDraft(state,raised,cashier.id);state=saved.db;
 assert.equal(state.pos.length,1);assert.equal(saved.pos.id,original.id);assert.equal(saved.pos.no,original.no);
 assert.equal(D.paidTotal(saved.pos),700);assert.equal(D.posTotal(saved.pos),3200);assert.equal(saved.pos.quotationPhase,'Final');
 assert.equal(saved.pos.firstQuotation.saleTotal,2500,'Original quotation preserved forever');assert.equal(saved.pos.firstQuotation.items[0].lineTotal,2500);
 assert(saved.pos.draftHistory.length>=2,'Admin-only revision history has first + final quote');assert.equal(P.mayPayRemaining(saved.pos),true);
 state=T.recordPOSPayment(state,original.id,'Cash',2500,cashier.id);
 assert.equal(D.paidTotal(state.pos[0]),3200);
 assert.equal(C.cannotReviseDraft(state,state.pos[0]).includes('Fully paid'),true);
 // A brand-new final quotation version may retain all rows unchanged and still be a recorded final approval.
 const noChange=C.saveUnitPOSDraft(first.db,{...first.pos,quotationPhase:'Final',cogsReviewedAt:new Date().toISOString(),items:[{...first.pos.items[0],costSource:'No direct cost'}]},cashier.id);
 assert.equal(noChange.pos.quotationPhase,'Final');assert(noChange.pos.draftHistory.length>=2);
 const underpaid={...first.pos,items:[{...first.pos.items[0],price:300,lineTotal:300}],quotationPhase:'Final',cogsReviewedAt:new Date().toISOString()};
 assert.throws(()=>C.saveUnitPOSDraft(first.db,underpaid,cashier.id),/already received payments/);
 // Card downpayment: unique receipt linked to same POS; no phantom POS payments for separate ledger entries.
 const digital={...original,id:'dp-test-2',no:'DP-00002',plate:'DP 5678'};
 const details={provider:'Maya',terminalId:'T-101',reference:'RRN-12345',date:D.todayPH()};
 const linked=P.recordInitialDownpayment(state,digital,cashier.id,'Card',500,details);
 assert.equal(linked.db.terminalEvents.length,1);assert.equal(linked.db.terminalEvents[0].posId,digital.id);
 assert.throws(()=>P.recordInitialDownpayment(linked.db,{...digital,id:'dp-test-3',no:'DP-00003',plate:'DP 9876'},cashier.id,'Card',500,details),/Duplicate/i);
 const app=fs.readFileSync(path.join(root,'app/page.tsx'),'utf8');
 for(const phrase of ['Continue First Draft','Create New Final Quotation','Record Downpayment & Save Draft','Remaining Payment','posFlow===\'final\'','recordInitialDownpayment','awaitingFinalQuotation'])assert(app.includes(phrase),`Missing UI feature: ${phrase}`);
 const ts=require('/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript'),parsed=ts.createSourceFile('page.tsx',app,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
 assert.equal(parsed.parseDiagnostics.length,0,parsed.parseDiagnostics.map(d=>d.messageText).join(', '));
 console.log('PASS v9.15: skipped initial COGS for one downpayment only; payment/terminal tracking; preserved initial quotation + id, final phase, version history, no overpay or premature close, final-payment gate, TSX');
}finally{fs.rmSync(out,{recursive:true,force:true});}
