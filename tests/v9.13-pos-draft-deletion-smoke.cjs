const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os'),{spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),out=fs.mkdtempSync(path.join(os.tmpdir(),'uc-v913-'));
try{
 const built=spawnSync('tsc',['--strict','--target','es2020','--module','commonjs','--skipLibCheck','--lib','es2020,dom','lib/pos-draft-control.ts','--outDir',out],{cwd:root,encoding:'utf8'});
 assert.equal(built.status,0,built.stdout+'\n'+built.stderr);
 const controls=require(path.join(out,'pos-draft-control.js')),data=require(path.join(out,'data.js'));
 const db=data.createSeed(),cashier=db.users.find(u=>u.role==='cashier'),admin=db.users.find(u=>u.role==='admin');
 const draft={id:'pos-delete-1',no:'UCM-POS-00000007',branch:cashier.branch,date:'2026-10-20',client:'Test Client',phone:'',vehicle:'Honda Civic 2020',plate:'ABC1234',concern:'Quote',items:[{id:'line-1',name:'Labor',qty:1,type:'Service',price:250,lineTotal:250,cost:0,costSource:'No direct cost'}],payments:[],status:'Pending',createdBy:cashier.id,createdAt:'2026-10-20T01:00:00.000Z',draftHistory:[{revision:1,at:'2026-10-20T01:00:00.000Z',by:cashier.id,action:'Initial draft',after:{client:'Test Client',phone:'',vehicle:'Honda Civic 2020',plate:'ABC1234',concern:'Quote',date:'2026-10-20',items:[]}}]};
 let original={...db,pos:[draft]};
 assert.equal(controls.draftDeletionIssue(original,draft),null);
 assert.equal(controls.unitVisitDecision(original,draft.plate,cashier.branch).kind,'resume');
 assert.throws(()=>controls.deletePOSDraft(original,draft.id,admin.id,'Duplicate quotation'),/Only an active Cashier/);
 assert.throws(()=>controls.deletePOSDraft(original,draft.id,cashier.id,'    '),/reason/);
 assert.throws(()=>controls.deletePOSDraft(original,draft.id,cashier.id,'no'),/at least 5/);
 const another={...cashier,id:'other-branch-cashier',branch:'UCQC',username:'branch2'};
 assert.throws(()=>controls.deletePOSDraft({...original,users:[...db.users,another]},draft.id,another.id,'Duplicate quotation'),/assigned to this branch/);
 const deleted=controls.deletePOSDraft(original,draft.id,cashier.id,'Incorrect quotation');
 assert.equal(deleted.pos.length,0);assert.equal(original.pos.length,1,'Do not mutate input database');
 assert.equal(controls.unitVisitDecision(deleted,draft.plate,'UCQC').kind,'new','Deleting safe draft releases cross-branch lock');
 assert.equal(deleted.deletedPOSDrafts.length,1);assert.equal(deleted.deletedPOSDrafts[0].no,draft.no);
 assert.deepEqual(deleted.deletedPOSDrafts[0].original.draftHistory,draft.draftHistory,'Keep original draft history');
 assert.equal(deleted.deletedPOSDrafts[0].deletedBy,cashier.id);assert.equal(deleted.deletedPOSDrafts[0].reason,'Incorrect quotation');
 assert(deleted.audit.some(a=>a.action==='POS draft deleted (archived)'&&a.detail.includes(draft.no)));
 assert.equal(data.nextNumber(deleted,cashier.branch,'POS'),'UCM-POS-00000008','Never reuse deleted POS numbers');
 assert.throws(()=>controls.deletePOSDraft(deleted,draft.id,cashier.id,'Other attempt'),/no longer exists/);
 const lockedFixtures=[
  ['Closed', {...draft,status:'Closed'}],
  ['payments',{...draft,payments:[{id:'pay-1',mode:'Cash',amount:50,date:'2026-10-20'}]}],
 ];
 for(const [label,p] of lockedFixtures){assert(controls.draftDeletionIssue({...original,pos:[p]},p),`Blocked ${label}`);assert.throws(()=>controls.deletePOSDraft({...original,pos:[p]},p.id,cashier.id,'Something wrong'));}
 for(const [label,patch] of [
  ['stock movements',{stockMovements:[{id:'stock1',posId:draft.id}]}],
  ['stock issues',{stockIssues:[{id:'issue1',posId:draft.id,status:'Rejected'}]}],
  ['stock requests',{stockRequests:[{id:'req1',posId:draft.id}]}],
  ['terminal events',{terminalEvents:[{id:'terminal1',posId:draft.id}]}],
  ['fund purchases',{fundEntries:[{id:'part1',linkedPosId:draft.id}]}],
  ['child POS',{pos:[draft,{...draft,id:'child-id',no:'UCM-POS-00000008',parentId:draft.id}]}]
 ]){
  const testDB={...original,...patch};assert(controls.draftDeletionIssue(testDB,draft),`Block deletion when ${label} exist`);
  assert.throws(()=>controls.deletePOSDraft(testDB,draft.id,cashier.id,'Duplicate draft'));
 }
 const app=fs.readFileSync(path.join(root,'app/page.tsx'),'utf8');
 assert(app.includes('requestDeletePOSDraft')&&app.includes('Confirm Delete Draft')&&app.includes('Deleted POS Draft Archive'));
 assert(app.includes('storeDB(next)')&&app.includes('deletePOSDraft(db,target.id,user.id,deleteDraftReason)'));
 assert(app.includes('Delete Draft')&&app.includes('setPosTab(\'drafts\')'));
 let ts;try{ts=require('typescript')}catch{ts=require('/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript')}
 const parsed=ts.createSourceFile('app/page.tsx',app,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
 assert.equal(parsed.parseDiagnostics.length,0,parsed.parseDiagnostics.map(x=>x.messageText).join('\n'));
 console.log('PASS v9.13: guarded draft deletion, role+branch permissions, paid/stock/PB/terminal locks, retained revision audit, unique POS numbers, unit unlock, frontend deletion UI + TSX syntax');
}finally{fs.rmSync(out,{recursive:true,force:true});}
