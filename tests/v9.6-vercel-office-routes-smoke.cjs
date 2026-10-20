const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const exists = file => fs.existsSync(path.join(root,file));
const routes = [
 ['docs','document'],['sheets','sheet']
];
for(const [route,kind] of routes){
 assert.ok(exists(`app/${route}/page.tsx`), `/${route} must be a Next App Router page`);
 assert.ok(exists(`app/${route}/[fileId]/page.tsx`), `/${route}/[fileId] must be a Next route`);
 assert.ok(exists(`app/${route}/layout.tsx`));
 assert.match(read(`app/${route}/page.tsx`),new RegExp(`kind="${kind}"`));
 assert.match(read(`app/${route}/[fileId]/page.tsx`),/fileId=\{fileId\}/);
}
const config=read('next.config.ts');
for(const [oldRoute,newRoute] of [['documents','docs'],['spreadsheets','sheets']]){
 for(const suffix of ['', '/:fileId']){
  assert.ok(config.includes(`source:'/${oldRoute}${suffix}',destination:'/${newRoute}${suffix}'`),`legacy ${oldRoute}${suffix} redirects to ${newRoute}${suffix}`);
 }
}
const code=read('lib/report-studio.ts');
const compiled=ts.transpileModule(code,{fileName:'report-studio.ts',compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText;
const moduleObj={exports:{}};
vm.runInNewContext(`(function(require,module,exports){${compiled}\n})`, {console,Date,Intl})((id)=>id==='./data'?{}:require(id),moduleObj,moduleObj.exports);
const studio=moduleObj.exports;
assert.equal(studio.studioHomeHref('document'),'/docs');
assert.equal(studio.studioHomeHref('sheet'),'/sheets');
assert.equal(studio.studioFileHref({kind:'document',id:'report-203'}),'/docs/report-203');
assert.equal(studio.studioFileHref({kind:'sheet',id:'inv-2026'}),'/sheets/inv-2026');
for(const target of ['/docs','/docs/report-203','/sheets','/sheets/inv-2026'])assert.equal(studio.safeStudioReturnPath(target),target);
for(const [oldTarget,newTarget] of [['/documents','/docs'],['/documents/file','/docs/file'],['/spreadsheets','/sheets'],['/spreadsheets/file','/sheets/file']])assert.equal(studio.safeStudioReturnPath(oldTarget),newTarget);
for(const target of ['//evil.com','https://evil.com/docs','/docs/../settings','/sheets/%2fadmin','/docs/?unsafe=1'])assert.equal(studio.safeStudioReturnPath(target),null);
assert.equal(studio.STUDIO_KEY,'uc_report_studio_v1','file data persists across versions');
const home=read('app/page.tsx');
const route=read('components/StudioRoute.tsx');
const editor=read('components/ReportStudio.tsx');
for(const [name,s] of [['app/page.tsx',home],['components/StudioRoute.tsx',route],['components/ReportStudio.tsx',editor]]){
 assert.doesNotMatch(s,/http:\/\/localhost|https:\/\/localhost|https:\/\/vercel\.app/,'do not hard-code deployment host');
 assert.match(s,/studioHomeHref/);
}
assert.match(home,/href=\{studioFileHref\(f\)\}/,'Cashier links must point to canonical per-file routes');
assert.match(home,/window\.location\.assign\(studioHomeHref/);
assert.match(route,/studioHomeHref\(kind\)/,'login return path is canonical');
assert.match(editor,/router\.push\(studioFileHref\(file\)\)/,'new files use canonical URL');
assert.match(read('public/sw.js'),/uc-fund-shell-v9-[678]/);
for(const file of ['app/page.tsx','components/StudioRoute.tsx','components/ReportStudio.tsx','app/docs/page.tsx','app/docs/[fileId]/page.tsx','app/sheets/page.tsx','app/sheets/[fileId]/page.tsx','next.config.ts']){
 const parsed=ts.transpileModule(read(file),{fileName:file,reportDiagnostics:true,compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.ESNext,jsx:ts.JsxEmit.Preserve}});
 assert.equal((parsed.diagnostics||[]).filter(d=>d.category===ts.DiagnosticCategory.Error).length,0,`TypeScript parse: ${file}`);
}
// Regression: CSV export must bind the row index used by displayCell.
// transpileModule parses TSX but does not perform semantic name-resolution.
assert.match(editor,/rows\.slice\(0,last\+1\)\.map\(\(row,r\)=>row\.map\(\(_,c\)=>escapeStudioCsv\(displayCell\(rows,r,c\)\)\)/, 'CSV export row index r must be declared in the map callback');
console.log('PASS v9.6: Vercel-relative /docs & /sheets, file URLs, secure login return, old links redirect, storage compatibility, syntax.');
