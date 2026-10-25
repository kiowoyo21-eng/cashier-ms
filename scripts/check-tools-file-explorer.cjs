/* Patch 22 regression: Tools are presented as file rows; no catalog or inline record expansion. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
const root=path.resolve(__dirname,'..'),src=p=>fs.readFileSync(path.join(root,p),'utf8');
const modules=[
 'components/SpreadsheetPageClient.tsx',
 'components/studio/StudioIndex.tsx',
 'components/intake/FormBuilderWorkspace.tsx',
 'components/workspace/DriveWorkspace.tsx',
 'app/studio/source-forms/page.tsx',
 'components/GroupedWorkspace.tsx'
];
for(const file of modules){const parsed=ts.createSourceFile(file,src(file),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);assert.equal(parsed.parseDiagnostics.length,0,`${file}: ${parsed.parseDiagnostics.map(e=>e.messageText)}`)}
const sheets=src(modules[0]),studio=src(modules[1]),forms=src(modules[2]),drive=src(modules[3]),source=src(modules[4]),group=src(modules[5]);
assert(!sheets.includes('sw-home-card')&&!sheets.includes('sw-home-grid'),'Sheet catalog still in JSX');
assert(sheets.includes('hrms-file-list')&&sheets.includes('New sheet')&&sheets.includes('Upload XLSX')&&sheets.includes('createBlankSheet(')&&sheets.includes('addDriveUpload('));
assert(studio.includes('studio-file-grid hrms-file-list')&&studio.includes('New document')&&studio.includes('Upload DOCX')&&studio.includes('Upload PDF'));
assert(forms.includes('intake-file-list')&&forms.includes('hrms-file-row')&&forms.includes('setManageFor(f.id)')&&forms.includes('Share / QR'));
assert(drive.includes('useState<"grid"|"list">("list")')&&drive.includes('New folder')&&drive.includes('Upload files'));
assert(source.includes('studio-sources-files')&&source.includes('hrms-file-list')&&!source.includes('studio-sources-table-wrap'));
assert(group.includes('tools-file-view.css'),'Shared file styles are not imported');
const css=src('app/tools-file-view.css');assert(css.includes('hrms-file-row')&&css.includes('@media(max-width:850px)'));
console.log('PASS Tools file explorer: files, forms, PDFs, source forms, working sheets, action buttons, role-aware create/import');
