const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const root = path.resolve(__dirname,'..');
const app = fs.readFileSync(path.join(root,'app/page.tsx'),'utf8');
const component = fs.readFileSync(path.join(root,'components/ReportStudio.tsx'),'utf8');
const style = fs.readFileSync(path.join(root,'app/globals.css'),'utf8');
const data = fs.readFileSync(path.join(root,'lib/report-studio.ts'),'utf8');
const pkg = require('../package.json');
const navRole = /(?:cashier|pb|admin):\[([^\n]+)\]/g;
let roles = 0;
for (const match of app.matchAll(navRole)) {
  if(!match[1].includes("key:'reports'"))continue;
  roles++;
  assert.match(match[1], /key:'spreadsheets',label:'Spreadsheets'/);
  assert.match(match[1], /key:'documents',label:'Documents'/);
  assert.doesNotMatch(match[1], /key:'studio'/);
}
assert.equal(roles,3, 'All user roles must have independent spreadsheet and document main navigation');
assert.match(app, /view==='spreadsheets'\|\|view==='documents'/);
assert.match(app, /mode=\{view==='spreadsheets'\?'sheet':'document'\}/);
assert.match(app, /onNavigateKind=\{kind=>goto\(kind==='sheet'\?'spreadsheets':'documents'\)\}/);
assert.match(component,/visibleFiles=allowedFiles\.filter\(f=>f\.kind===mode/,'Lists must only show files in the current workspace');
assert.match(component,/const nextKind=mode/,'New files must match selected workspace');
assert.match(component,/onNavigateKind\('document'\)/,'Convert to document should navigate to its own page');
assert.match(component,/className="studio-file-delete"/,'File deletion must be available from file list');
assert.match(component,/onClick=\{\(\)=>remove\(active\)\}/,'File deletion must be available from editor');
assert.match(component,/window\.confirm\(`/,'Deletion should request confirmation');
assert.match(style,/\.studio-file-row \.studio-file-delete/,'Delete button needs visible styling');
assert.match(pkg.version,/^9\.4\./);
const compiled = ts.transpileModule(data, {fileName:'report-studio.ts',compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText;
const moduleObj = {exports:{}};
vm.runInNewContext(`(function(require,module,exports){${compiled}\n})`, {console,Intl,Date}, {filename:'report-studio.js'})((id)=>id==='./data'?{}:require(id),moduleObj,moduleObj.exports);
const s=moduleObj.exports;
const template={id:'x',title:'Test',kind:'sheet',status:'Draft',ownerId:'user-a',ownerName:'User A',branch:'UCM',createdAt:'',updatedAt:'',sourceName:'',sourceDate:'',sourceCount:0,rows:s.newGrid(),html:''};
assert.equal(s.canDeleteStudio(template,'user-a'),true,'Own drafts can be deleted');
assert.equal(s.canDeleteStudio(template,'user-b'),false,'Other user files cannot be deleted');
for(const status of ['Changes Requested','Submitted','Approved']) {
  template.status=status;
  assert.equal(s.canDeleteStudio(template,'user-a'),status==='Changes Requested',`${status} files deletion policy`);
  assert.equal(s.canDeleteStudio(template,'user-b'),false,'Others cannot delete files at any status');
}
assert.equal(s.STUDIO_KEY,'uc_report_studio_v1','Retain existing browser drafts after upgrade');
console.log('v9.4 tests passed: main tabs, filtering, conversions, delete controls, review safeguards, storage compatibility.');
