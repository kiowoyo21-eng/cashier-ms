const fs=require('fs'),path=require('path'),assert=require('assert');
const ts=require('typescript');
const src=fs.readFileSync(path.join(__dirname,'../lib/drive/store.ts'),'utf8');
const js=ts.transpileModule(src,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const local=new Map();const calls=[];
const active={username:'admin',role:'Super Admin'};
const storage={getItem:k=>local.get(k)||null,setItem:(k,v)=>local.set(k,v)};
global.window={dispatchEvent(e){calls.push(e.type)},addEventListener(){},removeEventListener(){}};
global.localStorage=storage;global.Event=class{constructor(type){this.type=type}};
const factory=new Function('require','module','exports',js);
const mod={exports:{}};
factory(p=>{if(p==='../auditTrail')return {writeAuditEvent:()=>{}};if(p==='../spreadsheetStore')return {activeDemoUser:()=>active};throw Error('Unexpected import: '+p)},mod,mod.exports);
const drive=mod.exports;
const first=drive.addDriveFolder(active,'Forms',null);assert.equal(drive.readDrive().folders[0].name,'Forms');
const second=drive.addDriveFolder(active,'Signed Forms',first.id);assert.equal(drive.readDrive().folders.length,2);
assert.throws(()=>drive.addDriveFolder(active,'forms',null),/exists/);
assert.throws(()=>drive.moveDriveItem(active,`folder:${first.id}`,second.id),/inside itself/);
drive.renameDriveFolder(active,second.id,'Completed');assert.equal(drive.readDrive().folders[1].name,'Completed');
drive.moveDriveItem(active,`folder:${second.id}`,null);assert.equal(drive.readDrive().folders[1].parentId,null);
drive.setDriveTrash(active,`folder:${second.id}`,true);assert.deepEqual(drive.readDrive().trashed,[`folder:${second.id}`]);
drive.setDriveTrash(active,`folder:${second.id}`,false);assert.deepEqual(drive.readDrive().trashed,[]);
active.role='HR';assert.throws(()=>drive.addDriveFolder(active,'Nope',null),/Super Admin/);
assert.ok(calls.includes('uc-hrms-drive-change'));
const files=[
 ['../components/GroupedWorkspace.tsx','<DriveWorkspace embedded/>','<SpreadsheetPageClient embedded/>','<StudioIndex embedded/>'],
 ['../components/workspace/DriveWorkspace.tsx','addDriveFolder','addDriveUpload','renameDriveFolder','setDriveTrash','<HrmsDialog'],
 ['../components/intake/FormBuilderWorkspace.tsx','hrms-file-row','intake-actions-modal','showShare','showResponses'],
 ['../components/SpreadsheetPageClient.tsx','sw-home-embedded'],
 ['../components/studio/StudioIndex.tsx','studio-hub-embedded']
];
for(const [f,...checks] of files){const contents=fs.readFileSync(path.resolve(__dirname,f),'utf8');for(const c of checks)assert(contents.includes(c),`${f}: ${c}`)}
console.log('PASS Tools 18: admin-only Drive folder/move/rename/trash/restore, cycle/duplicate safeguards, embedded layouts, modal action access');
