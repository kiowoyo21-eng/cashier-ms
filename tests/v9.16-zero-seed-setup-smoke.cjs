const assert=require('node:assert/strict'),path=require('node:path'),os=require('node:os'),fs=require('node:fs'),{spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),dir=fs.mkdtempSync(path.join(os.tmpdir(),'uc-no-seed-'));
try {
 const build=spawnSync('tsc',['--strict','--target','es2020','--module','commonjs','--lib','es2020,dom','--skipLibCheck','lib/data.ts','--outDir',dir],{cwd:root,encoding:'utf8'});
 assert.equal(build.status,0,build.stdout+'\n'+build.stderr);
 const d=require(path.join(dir,'data.js'));
 const fresh=d.createSeed();
 for(const property of ['users','pos','fundEntries','inventory','stockMovements','stockRequests','stockReceipts','stockIssues','terminalEvents','terminalSettlements','counts','incidents','turnovers','requests','audit','deletedPOSDrafts']){
  assert.equal(fresh[property].length,0,property+' must contain zero seed rows');
 }
 for(const branch of d.BRANCHES){assert.equal(fresh.settings.rfBase[branch.id],0);assert.equal(fresh.settings.rfpBase[branch.id],0);}
 assert.throws(()=>d.setupFirstAdmin(fresh,{name:'A',username:'root',password:'a long enough password',branch:'UCM'}),/name/);
 assert.throws(()=>d.setupFirstAdmin(fresh,{name:'Real Admin',username:'x',password:'a long enough password',branch:'UCM'}),/Username/);
 assert.throws(()=>d.setupFirstAdmin(fresh,{name:'Real Admin',username:'root',password:'short',branch:'UCM'}),/at least 10/);
 const configured=d.setupFirstAdmin(fresh,{name:'Real Admin',username:'Admin.Owner',password:'long-enough-pass',branch:'UCQC'});
 assert.equal(configured.users.length,1);assert.equal(configured.users[0].role,'admin');assert.equal(configured.users[0].username,'admin.owner');assert.equal(configured.users[0].branch,'UCQC');
 assert.equal(fresh.users.length,0,'Setup must not mutate original database');
 assert.equal(configured.audit.length,1,'First admin setup must be audited');
 assert.throws(()=>d.setupFirstAdmin(configured,{name:'Another Admin',username:'another',password:'long-enough-pass',branch:'UCM'}),/only available/);
 const oldUsers=[
  {id:'u-admin',username:'admin',password:'admin12345',name:'System Administrator',role:'admin',branch:'UCM',active:true},
  {id:'u-cashier',username:'cashier',password:'cashier12345',name:'Cashier — Mandaluyong',role:'cashier',branch:'UCM',active:true},
  {id:'u-pb',username:'pbacc',password:'pb12345',name:'Parts Buyer — Mandaluyong',role:'pb',branch:'UCM',active:true}
 ];
 const old={...fresh,users:oldUsers,settings:{...fresh.settings,rfBase:{UCQC:50000,UCM:50000,UCLP:50000,MMM:50000},rfpBase:{UCQC:120000,UCM:120000,UCLP:120000,MMM:120000}}};
 const cleared=d.removeEmptyDemoAccounts(old);
 assert.equal(cleared.users.length,0,'Clean old browser must lose default passwords');
 assert.equal(cleared.settings.rfBase.UCM,0,'Seed RF removed');
 assert.equal(cleared.settings.rfpBase.UCM,0,'Seed RFP removed');
 const loggedIn=d.removeEmptyDemoAccounts({...old,users:oldUsers.map(u=>({...u,lastLoginDate:'2026-10-20'})),audit:[{id:'login1',by:'u-admin',at:'2026-10-20',action:'Login',detail:'admin'}]});
 assert.equal(loggedIn.users.length,0,'Legacy login activity alone is not genuine business data');
 assert.equal(loggedIn.audit.length,0);
 assert.equal(d.removeEmptyDemoAccounts(old,true).users.length,3,'Docs/Sheets ownership must not be orphaned');
 const withReal={...old,pos:[{id:'real-order'}]};assert.equal(d.removeEmptyDemoAccounts(withReal).users.length,3,'Preserve users with real transactions');
 const withNewUser={...old,users:[...oldUsers,{...oldUsers[0],id:'new-admin',username:'owner',password:'own-password'}]};assert.equal(d.removeEmptyDemoAccounts(withNewUser).users.length,4);
 const changedCredentials={...old,users:oldUsers.map(u=>u.id==='u-admin'?{...u,password:'changed-by-operator'}:u)};assert.equal(d.removeEmptyDemoAccounts(changedCredentials).users.length,3,'Preserve modified accounts');
 const ui=fs.readFileSync(path.join(root,'app/page.tsx'),'utf8');
 assert(ui.includes('Create the Administrator')&&ui.includes('completeInitialSetup')&&ui.includes('setupFirstAdmin'));
 assert(!ui.includes('Demo accounts — click to fill'),'No prefilled public demo credentials on login');
 console.log('PASS v9.16: zero business and user seeds, admin first-run setup, legacy demo cleanup, preservation of genuine records and office file ownership.');
} finally {fs.rmSync(dir,{recursive:true,force:true});}
