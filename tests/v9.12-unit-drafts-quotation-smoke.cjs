const assert=require('node:assert/strict');const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),{spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),out=fs.mkdtempSync(path.join(os.tmpdir(),'uc-v912-'));
try{
 const build=spawnSync('tsc',['--strict','--target','es2020','--module','commonjs','--skipLibCheck','--lib','es2020,dom','lib/pos-draft-control.ts','lib/pos-quotation-grid.ts','--outDir',out],{cwd:root,encoding:'utf8'});
 assert.equal(build.status,0,build.stdout+'\n'+build.stderr);
 const control=require(path.join(out,'pos-draft-control.js')),grid=require(path.join(out,'pos-quotation-grid.js')),data=require(path.join(out,'data.js'));
 const db=require('./user-fixtures.cjs')(data.createSeed()),cashier=db.users.find(u=>u.role==='cashier')||{id:'cashier1',branch:'UCM',role:'cashier',active:true};
 const branch=cashier.branch,other=branch==='UCM'?'UCO':'UCM';
 const line={id:'line1',name:'Labor',type:'Service',qty:2,price:250,lineTotal:500,cost:0,costSource:'No direct cost'};
 const make=(id,no,b=branch,items=[line])=>({id,no,branch:b,date:'2026-10-20',client:'Alex',phone:'',vehicle:'Toyota',plate:'AbC-123',concern:'Oil service',items,payments:[],status:'Pending',createdBy:cashier.id,createdAt:'2026-10-20T04:00:00Z',cogsReviewedAt:'2026-10-20T04:00:00Z'});
 let initial={...db,pos:[]};
 let result=control.saveUnitPOSDraft(initial,make('visit1','UCM-POS-00000001'),cashier.id);assert(result.created);assert.equal(result.db.pos.length,1);assert.equal(result.pos.draftHistory.length,1);
 assert.equal(control.unitVisitDecision(result.db,'abc123',branch).kind,'resume');
 assert.equal(control.unitVisitDecision(result.db,'ABC 123',other).kind,'blocked');
 assert.throws(()=>control.saveUnitPOSDraft(result.db,make('visit2','UCO-POS-00000001',other),cashier.id),/OPEN POS/i);
 let revised=control.saveUnitPOSDraft(result.db,make('random','UCM-POS-999',branch,[{...line,lineTotal:650,price:325}]),cashier.id);
 assert.equal(revised.db.pos.length,1,'Same branch + unit updates, no second draft');assert.equal(revised.pos.id,'visit1');assert.equal(revised.pos.no,'UCM-POS-00000001');assert.equal(revised.pos.draftHistory.length,2);assert.equal(revised.pos.draftHistory[1].before.items[0].lineTotal,500);assert.equal(revised.pos.draftHistory[1].after.items[0].lineTotal,650);
 let unchanged=control.saveUnitPOSDraft(revised.db,make('ignored','ignored',branch,[{...line,lineTotal:650,price:325}]),cashier.id);assert.equal(unchanged.changed,false,'Unchanged save does not create junk revision');
 const paid={...revised.pos,payments:[{id:'pay1',mode:'Cash',amount:100,date:'2026-10-20'}]};assert.equal(control.cannotReviseDraft({...revised.db,pos:[paid]},paid),null,'Partially paid drafts can be revised');
 assert.throws(()=>control.saveUnitPOSDraft({...revised.db,pos:[paid]},make('new','new',branch,[{...line,lineTotal:30,price:30}]),cashier.id),/already received payments/);
 const posted={...revised.db,stockMovements:[{id:'stock1',posId:'visit1',kind:'StockOut',qty:1}]};assert.match(control.cannotReviseDraft(posted,revised.pos),/Posted stock/);
 const closed={...revised.pos,status:'Closed',closedAt:'2026-10-21'};const completed={...revised.db,pos:[closed]};assert.equal(control.unitVisitDecision(completed,'abc123',other).kind,'new');assert.equal(control.saveUnitPOSDraft(completed,make('second','UCO-POS-1',other),cashier.id).db.pos.length,2);
 const conflicting={...revised.db,pos:[...revised.db.pos,make('second','another',other)]};assert.equal(control.unitVisitDecision(conflicting,'abc123',branch).kind,'conflict');
 const otherCashier={...cashier,id:'cashier-other',branch:other,role:'cashier',active:true};
 assert.throws(()=>data.assignConsumedStockToPOS({...db,users:[...db.users,otherCashier],pos:[revised.pos]},other,'abc123',[{productId:'something',qty:1}],otherCashier.id),/open POS|another branch/i,'No cross-branch stock draft even with authorized other-branch cashier');
 const r={id:'row1',name:'Brake pads',type:'Part',qty:'3',sellingTotal:'100.00'};
 assert.equal(grid.quotationIssue([r],[],branch),null);
 const newLine=grid.rowsToPOSLines([r],[])[0];assert.equal(data.posLineTotal(newLine),100,'Line input is total, not total multiplied by quantity');assert.equal(data.posTotal({...revised.pos,items:[newLine]}),100);
 assert.deepEqual(grid.toQuotationRows([newLine]).map(x=>x.sellingTotal),['100']);
 assert.match(grid.quotationIssue([{...r,qty:'0'}],[],branch),/quantity/);
 assert.match(grid.quotationIssue([{...r,sellingTotal:'12.999'}],[],branch),/selling total/);
 assert.match(grid.quotationIssue([{...r,name:'Oil Filter'}],[{name:'Oil Filter',barcode:'a1',branch}],branch),/Stock Release/);
 const retained=grid.rowsToPOSLines([{...r,name:'Service labor',type:'Service'}],[{...newLine,name:'Service labor',type:'Service',costSource:'Direct',cost:15}])[0];assert.equal(retained.costSource,'Direct');
 const changed=grid.rowsToPOSLines([{...r,name:'Service labor',type:'Service',sellingTotal:'120.00'}],[{...retained,costSource:'Direct',cost:15}])[0];assert.equal(changed.costSource,undefined,'Quotation changed -> require COGS re-review');
 const app=fs.readFileSync(path.join(root,'app/page.tsx'),'utf8'),component=fs.readFileSync(path.join(root,'components/POSQuotationGrid.tsx'),'utf8');
 assert(app.includes('saveUnitPOSDraft(db,p,user.id)')&&app.includes('unitVisitDecision(db,pForm.plate,currentBranch)'));
 assert(app.includes('Draft History')&&app.includes('cannotReviseDraft(db,pos)'));
 assert(component.includes('receipt-inline-row')&&component.includes('Add row')&&!component.includes('type="number"'));
 let ts;try{ts=require('typescript')}catch{ts=require('/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript')}
 for(const relative of ['app/page.tsx','components/POSQuotationGrid.tsx']){const source=fs.readFileSync(path.join(root,relative),'utf8');const parsed=ts.createSourceFile(relative,source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);assert.equal(parsed.parseDiagnostics.length,0,`${relative}: ${parsed.parseDiagnostics.map(x=>x.messageText).join(', ')}`)}
 console.log('PASS v9.12: inline receipt rows, exact selling totals, COGS resets, global plate lock, same-branch revision history, closed re-entry, paid/stock locks, TSX syntax');
}finally{fs.rmSync(out,{force:true,recursive:true})}
