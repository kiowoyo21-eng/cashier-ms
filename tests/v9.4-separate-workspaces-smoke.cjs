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
assert.match(app, /href=\{studioHomeHref\(item\.key===/, 'Nav links must navigate to canonical standalone pages');
assert.doesNotMatch(app, /<ReportStudio/, 'Editors must not be embedded inside the cashier dashboard');
assert.match(app,/window\.location\.assign\(studioHomeHref\(/,'Reports shortcuts must navigate to canonical pages');
assert.match(component,/studioFileHref\(f\)/,'File listing links to individual file pages');
assert.match(component,/canDeleteStudio\(f,userId\)/,'Delete available on owned drafts');
assert.match(component,/window\.confirm\(`/,'Delete requires confirmation');
assert.match(style,/\.office-global-head/, 'Standalone layout needs its own header');
assert.match(pkg.version,/^9\.[5678]\./);
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
console.log('v9.5-compatible workspaces: standalone navigation, own file listing, delete controls, review safeguards, storage compatibility.');
