const assert=require('node:assert/strict');
const fs=require('node:fs');const path=require('node:path');const os=require('node:os');const {spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');const dest=fs.mkdtempSync(path.join(os.tmpdir(),'cms-disb-v919-'));
try{
 const result=spawnSync('tsc',['--strict','--target','es2022','--module','commonjs','--lib','es2022,dom','--skipLibCheck','lib/disbursement-requests.ts','--outDir',dest],{cwd:root,encoding:'utf8'});
 assert.equal(result.status,0,`${result.stdout}\n${result.stderr}`);
 const model=require(path.join(dest,'disbursement-requests.js'));const data=require(path.join(dest,'data.js'));
 const {createDisbursementDraft,editDisbursementDraft,submitDisbursementRequest,visibleDisbursements,releaseEligible,externallyConsistent,DISBURSEMENT_STATUSES}=model;
 assert.equal(DISBURSEMENT_STATUSES.length,10,'All 10 states are present');
 const pb={id:'staff-pb',username:'pb1',password:'test',role:'pb',name:'Parts Buyer',branch:'UCM',active:true};
 const cashier={id:'staff-cash',username:'cash1',password:'test',role:'cashier',name:'Cashier One',branch:'UCQC',active:true};
 const admin={id:'admin',username:'adm',password:'test',role:'admin',name:'Administrator',branch:'UCM',active:true};
 let db={...data.createSeed(),users:[pb,cashier,admin]};
 const fields={requestDate:'2026-10-21',branch:'UCM',category:'Parts Purchasing',purpose:'Urgent brake pads',amount:2500.5,attachments:[{name:'proof.png',data:'data:image/png;base64,abc'}],remarks:'Required this week'};
 db=createDisbursementDraft(db,pb,fields);const pbRequest=db.disbursementRequests[0];
 assert.match(pbRequest.requestNo,/^DR-UCM-\d{8}-[0-9A-F]+$/);assert.equal(pbRequest.status,'Draft');assert.equal(pbRequest.requestorRole,'pb');assert.equal(pbRequest.employeeId,pb.id);
 assert.equal(db.fundEntries.length,0,'Request is not a fund expense / payment');
 assert.throws(()=>createDisbursementDraft(db,admin,fields),/Only Cashier or Parts Buyer/);
 assert.throws(()=>createDisbursementDraft(db,cashier,fields),/assigned branch/);
 assert.throws(()=>createDisbursementDraft(db,pb,{...fields,amount:-1}),/positive PHP/);
 assert.throws(()=>createDisbursementDraft(db,pb,{...fields,amount:1.005}),/positive PHP/);
 assert.doesNotThrow(()=>createDisbursementDraft(db,pb,{...fields,amount:0.29}), 'Valid PHP centavo amounts must not fail due to floating-point representation');
 assert.throws(()=>editDisbursementDraft(db,pbRequest.id,cashier,fields),/assigned active requester/);
 db=editDisbursementDraft(db,pbRequest.id,pb,{...fields,amount:2600,remarks:'Needs approval'});
 const updated=db.disbursementRequests[0];assert.equal(updated.revision,2);assert.equal(updated.timeline.length,2);
 assert.equal(updated.timeline.at(-1).changes.amount.before,2500.5);assert.equal(updated.timeline.at(-1).changes.amount.after,2600);
 db=submitDisbursementRequest(db,pbRequest.id,pb);const submitted=db.disbursementRequests[0];
 assert.equal(submitted.status,'Pending Accounting Approval');assert.equal(submitted.accounting,undefined);assert.equal(submitted.msKate,undefined);assert.equal(submitted.release,undefined);
 assert.equal(db.fundEntries.length,0);assert(db.audit.some(a=>a.action.includes('Submitted')));
 assert.throws(()=>submitDisbursementRequest(db,pbRequest.id,pb),/Only draft or returned/);
 assert.throws(()=>editDisbursementDraft(db,pbRequest.id,pb,fields),/cannot be edited/);
 assert.equal(visibleDisbursements(db,pb).length,1);assert.equal(visibleDisbursements(db,cashier).length,0);assert.equal(visibleDisbursements(db,admin,'UCQC').length,0);
 db=createDisbursementDraft(db,cashier,{...fields,branch:'UCQC'});const cashierReq=db.disbursementRequests[0];db=submitDisbursementRequest(db,cashierReq.id,cashier);
 assert.notEqual(pbRequest.id,cashierReq.id);assert.notEqual(pbRequest.requestNo,cashierReq.requestNo);
 assert.equal(visibleDisbursements(db,cashier).length,1);assert.equal(visibleDisbursements(db,admin,'ALL').length,2);
 // Simulate imported external return data purely as a test fixture; never a CMS-user action.
 const returned={...submitted,status:'Returned by Ms Kate',accounting:{state:'Approved',origin:'external',actorId:'accountant-real',decidedAt:'2026-10-21T05:00:00.000Z'},msKate:{state:'Returned',origin:'external',reason:'Supply updated estimate',decidedAt:'2026-10-21T05:10:00.000Z'},timeline:[...submitted.timeline,{id:'external-event-test',at:'2026-10-21T05:10:00.000Z',actorId:'kate-authenticated',actorRole:'Ms Kate',branch:'UCM',action:'Returned for revision',to:'Returned by Ms Kate',from:'Pending Ms Kate Approval',remarks:'Supply updated estimate',origin:'external'}]};
 let returnedDB={...db,disbursementRequests:db.disbursementRequests.map(r=>r.id===pbRequest.id?returned:r)};
 assert.throws(()=>submitDisbursementRequest(returnedDB,pbRequest.id,pb),/Edit and save corrections/);
 returnedDB=editDisbursementDraft(returnedDB,pbRequest.id,pb,{...fields,amount:2800,remarks:'Updated estimate'});
 assert.equal(returnedDB.disbursementRequests.find(r=>r.id===pbRequest.id).msKate.reason,'Supply updated estimate','Return reason stays visible until resubmission');
 returnedDB=submitDisbursementRequest(returnedDB,pbRequest.id,pb);
 const resubmitted=returnedDB.disbursementRequests.find(r=>r.id===pbRequest.id);
 assert.equal(resubmitted.status,'Pending Accounting Approval');assert.equal(resubmitted.accounting,undefined,'Reapproval is needed after changes');assert.equal(resubmitted.msKate,undefined);assert.equal(resubmitted.id,pbRequest.id);
 assert(resubmitted.timeline.some(t=>t.action==='Corrections resubmitted'));

 assert.equal(releaseEligible(submitted),false);assert.equal(releaseEligible({...submitted,status:'Approved for Release'}),false,'Status alone cannot authorize release');
 assert.equal(releaseEligible({...submitted,status:'Approved for Release',approvedForReleaseAt:'2026-10-21',accounting:{state:'Approved',origin:'external'},msKate:{state:'Approved',origin:'external'}}),true);
 assert.equal(externallyConsistent({...submitted,status:'Released / Paid'}),false,'Cannot claim paid with no external approvals and payment reference');
 const restored=JSON.parse(JSON.stringify(db));assert.equal(restored.disbursementRequests.length,2,'Retained in local Database JSON');
 let browserSaved=JSON.stringify(db);global.window={};global.localStorage={getItem:k=>k===data.STORAGE_KEY?browserSaved:null,setItem:(k,v)=>{if(k===data.STORAGE_KEY)browserSaved=v;}};
 assert.equal(data.loadDB().disbursementRequests.length,2,'loadDB migrates and retains existing requests');
 assert.equal(data.loadDB().users.length,3,'Preserves existing accounts');
 assert.equal(data.loadDB().fundEntries.length,0,'No change to existing fund ledger');
 const ui=fs.readFileSync(path.join(root,'app/page.tsx'),'utf8');const component=fs.readFileSync(path.join(root,'components/DisbursementWorkspace.tsx'),'utf8');
 assert(ui.includes("view==='disbursements'")&&ui.includes("Prepare / Track Disbursement"));
 assert(!/Simulate Accounting|Simulate Ms Kate|Approve External/.test(component),'No external impersonation controls');
 assert(component.includes('Pending Accounting')&&component.includes('Approval Routing'));
 let ts;try{ts=require('typescript')}catch{ts=require('/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript')}
 for(const file of ['app/page.tsx','components/DisbursementWorkspace.tsx']){
  const source=fs.readFileSync(path.join(root,file),'utf8');const parsed=ts.createSourceFile(file,source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
  assert.equal(parsed.parseDiagnostics.length,0,`${file}: ${parsed.parseDiagnostics.map(x=>x.messageText).join('; ')}`);
 }
 console.log('PASS v9.19: PB + cashier create/draft/submit; role and branch separation; edit/revisions/audit; pending Accounting; 10 statuses; no approvals or paid without external authority; persistence; navigation TSX.');
}finally {delete global.window;delete global.localStorage;fs.rmSync(dest,{recursive:true,force:true})}
