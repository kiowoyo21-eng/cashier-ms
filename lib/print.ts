import {
  BRANCH_NAME,categoryTotals,datePH,disbursementSummary,pesos,posCOGS,posCostBreakdown,
  posTotal,paidTotal,posClosedDate,reportDateMatch,normalizePlate,
  type Audit,type BranchId,type Count,type Database,type Fund,type FundEntry,type POS,type Turnover
} from './data';

const esc=(x:unknown)=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]||c));
const dateTime=(x:string)=>new Date(x).toLocaleString('en-PH',{timeZone:'Asia/Manila',dateStyle:'medium',timeStyle:'short'});
const displayed=(s:unknown)=>`<span class="clip" title="${esc(s)}">${esc(s)}</span>`;
const fmt=(v:number)=>esc(pesos(v));
const printStyles=`
@page{size:A4 landscape;margin:7mm}*{box-sizing:border-box}html,body{margin:0;padding:0;color:#232831;font:9px Arial,Helvetica,sans-serif;background:white}
.print-page{break-after:page;page-break-after:always;min-height:178mm}.print-page:last-child{break-after:auto;page-break-after:auto}
header{height:21mm;display:flex;justify-content:space-between;align-items:start;border-bottom:2px solid #ecc00c;margin-bottom:3.2mm;padding-top:2mm}
header .brand{font-size:13px;font-weight:800;letter-spacing:.55px}.logo-slot{font-size:8px;letter-spacing:0;color:#777;margin-top:4px}
header h1{font-size:15px;margin:0 0 3px;font-weight:800}header small{font-size:9px;color:#535b63}
.meta{display:flex;justify-content:space-between;gap:10px;margin:0 0 3mm;font-size:9px}.meta b{font-weight:700}
table{border-collapse:collapse;width:100%;table-layout:fixed;font-size:8px}th{height:6mm;background:#ffed9e;text-align:left;white-space:nowrap;overflow:hidden}td,th{border:1px solid #b9bec5;padding:1.05mm 1.25mm;vertical-align:middle}
.data-table tbody tr{height:4.7mm;max-height:4.7mm;page-break-inside:avoid}.data-table td{height:4.7mm;max-height:4.7mm;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.data-table .clip{display:block;max-width:100%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.num{text-align:right;white-space:nowrap}.center{text-align:center}.muted{color:#69727c}.mini{font-size:8px}.total{background:#ffed9e;font-weight:700}
.footline{display:flex;justify-content:space-between;margin-top:2mm;color:#626872;font-size:8px}
.metrics{display:grid;grid-template-columns:repeat(4,1fr);gap:3mm;margin:2mm 0}.metric{border:1px solid #c8ccd2;padding:2.1mm}.metric b{display:block;font-size:13px;margin-top:2mm}
.summary-section{margin:2.2mm 0;break-inside:avoid}.summary-section h2{font-size:12px;padding-bottom:2mm;margin:0 0 2mm;border-bottom:1px solid #ddd}.compact-table{max-width:165mm}.compact-table td,.compact-table th{height:5.2mm;font-size:9px}
.signature-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10mm;margin-top:6mm}.signature{border-top:1px solid #2d2e35;text-align:center;padding-top:2mm;min-height:14mm}.signature .name{display:block;font-size:10px;font-weight:700}.signature .role{color:#6f7782;font-size:8px}.signature img{height:10mm;max-width:60mm;object-fit:contain;margin-top:-18mm;display:block;margin-left:auto;margin-right:auto}
.receipt-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:4mm}.receipt{border:1px solid #c3c8d2;padding:3mm;height:65mm;break-inside:avoid;display:flex;flex-direction:column}.receipt img{max-height:49mm;max-width:100%;object-fit:contain;align-self:center}.receipt .name{display:flex;justify-content:space-between;margin-bottom:2mm}.notice{padding:3mm;border:1px solid #e3c953;background:#fff6d5;margin:3mm 0}.cat-pair{display:grid;grid-template-columns:1fr 1fr;gap:5mm}.voucher-series{font-size:7px;max-height:8mm;overflow:hidden}.notes{white-space:pre-line;line-height:1.5}
.actions{position:fixed;bottom:15px;right:15px;z-index:999;padding:9px;border-radius:8px;background:white;border:1px solid #cbd1d8;box-shadow:0 4px 14px #0002}.actions button{background:#facc15;border:none;padding:11px 18px;border-radius:6px;font-weight:700;cursor:pointer}
@media print{.actions{display:none!important}.print-page{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
`;
export const wrapPrint=(title:string,body:string)=>`<!doctype html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>${esc(title)}</title><style>${printStyles}</style></head><body><div class="actions"><button onclick="window.print()">Print / Save as PDF</button></div>${body}</body></html>`;
function openPrint(title:string,body:string,logo?:string){if(logo?.startsWith('data:image/'))body=body.replaceAll('<div class="brand">UNDERCHARGERS CORPORATION</div>',`<div class="brand"><img src="${logo}" alt="Underchargers Logo" style="height:12mm;max-width:75mm;object-fit:contain;display:block"/><span style="font-size:7px">UNDERCHARGERS CORPORATION</span></div>`);const w=window.open('','_blank');if(!w){window.alert('Please allow pop-ups to preview the report.');return;}w.document.open();w.document.write(wrapPrint(title,body));w.document.close();w.focus();}
const header=(title:string,subtitle:string)=>`<header><div><div class="brand">UNDERCHARGERS CORPORATION</div><div class="logo-slot">FUND MANAGEMENT SYSTEM · OFFICIAL REPORT</div></div><div style="text-align:right"><h1>${esc(title)}</h1><small>${esc(subtitle)}</small></div></header>`;
const period=(from:string,to:string)=>`${from?datePH(from):'Beginning of records'} – ${to?datePH(to):'Latest'}`;
const meta=(branch:string,range:string,reference?:string)=>`<div class="meta"><span><b>Branch:</b> ${esc(branch)}</span><span><b>Period:</b> ${esc(range)}</span>${reference?`<span><b>Reference:</b> ${esc(reference)}</span>`:''}</div>`;
const page=(body:string)=>`<section class="print-page">${body}</section>`;
const cell=(value:unknown,num=false)=>`<td class="${num?'num':''}">${num?esc(value):displayed(value)}</td>`;
const listTable=(heads:string[],rows:string[][],widths?:number[])=>`<table class="data-table">${widths?`<colgroup>${widths.map(w=>`<col style="width:${w}%"/>`).join('')}</colgroup>`:''}<thead><tr>${heads.map(h=>`<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.map(cells=>`<tr>${cells.map(v=>`<td>${v}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
const pagination=<T,>(items:T[],size=30):T[][]=>items.length?Array.from({length:Math.ceil(items.length/size)},(_,i)=>items.slice(i*size,(i+1)*size)):[[]];
const reportPages=(title:string,branch:string,range:string,heads:string[],rows:string[][],widths?:number[])=>pagination(rows).map((chunk,i)=>page(header(title,`${range} · Detail page ${i+1} / ${Math.ceil(rows.length/30)||1}`)+meta(branch,range)+listTable(heads,chunk,widths)+`<div class="footline"><span>${chunk.length} transactions on this page · Max 30 / page</span><span>Total detail rows: ${rows.length}</span></div>`)).join('');
const metric=(title:string,amount:number)=>`<div class="metric">${esc(title)}<b>${fmt(amount)}</b></div>`;
const tRow=(name:string,value:unknown)=>`<tr><td>${esc(name)}</td><td class="num">${esc(value)}</td></tr>`;
function signatures(db:Database,preparedById?:string,signature?:string,at?:string){
  const prepared=db.users.find(u=>u.id===preparedById)?.name||'Not assigned';
  const checked=db.settings.signatories?.checked?.trim()||'Not configured';
  const approved=db.settings.signatories?.approved?.trim()||'Not configured';
  return `<div class="signature-grid">${[
    ['Prepared by',prepared,signature],['Checked / Verified by',checked,''],['Approved by',approved,'']
  ].map(([role,name,img])=>`<div class="signature">${img?.startsWith('data:image/')?`<img src="${img}" alt="Recorded signature"/>`:''}<span class="name">${esc(name)}</span><span class="role">${esc(role)}</span>${at?`<div class="mini muted">${esc(at)}</div>`:''}</div>`).join('')}</div>`;
}

export function printFundReport(db:Database,branch:BranchId,fund:Fund,_entries:FundEntry[],from='',to=''){
  const s=disbursementSummary(db,branch,fund,from,to),range=period(from,to),b=BRANCH_NAME(branch),title=fund==='RF'?'REVOLVING FUND CASH DISBURSEMENT':'RFP CASH DISBURSEMENT';
  const rows=s.period.filter(e=>e.kind==='expense').sort((a,b)=>a.date.localeCompare(b.date)||a.no.localeCompare(b.no)).map(e=>[
    displayed(datePH(e.date)),displayed(e.no),displayed(e.payee),displayed(e.description),displayed(e.category),displayed(e.voucher),displayed(e.receiptNo),
    `<span class="num">${fmt(e.vat==='VAT'?e.amount:0)}</span>`,`<span class="num">${fmt(e.vat==='Non-VAT'?e.amount:0)}</span>`,displayed(e.status)
  ]);
  const detail=reportPages(title,b,range,['Date','Reference','Supplier','Description / Part','Category','CV No.','Receipt','VAT','Non-VAT','Status'],rows,[9,17,12,17,12,9,8,7,7,12]);
  const refNos=s.period.filter(e=>e.kind==='expense').map(e=>e.voucher).filter(Boolean);
  const voucherDisplay=(()=>{if(!refNos.length)return 'Not specified';const parts=refNos.map(x=>/^(.*?)(\d+)$/.exec(x));if(parts.every(x=>x&&x[1]===parts[0]?.[1])){const numbers=parts.map(x=>Number(x![2])).sort((a,b)=>a-b);if(numbers.every((x,i)=>i===0||x===numbers[i-1]+1))return `${parts[0]![1]}${numbers[0]} to ${parts[0]![1]}${numbers.at(-1)} (${refNos.length} vouchers)`;}return refNos.length>12?`${refNos.slice(0,12).join(', ')} and ${refNos.length-12} more (see details)`:refNos.join(', ');})();
  const deposits=s.checkDeposits.map(e=>`<tr>${cell(e.date)}${cell(e.no)}${cell(e.bank||'—')}${cell(e.checkNo||'—')}${cell(fmt(e.amount),true)}</tr>`).join('')||`<tr><td colspan="5">No approved check deposits or replenishments in this period.</td></tr>`;
  const categoryRows=Object.entries(categoryTotals(s.period)).sort((a,b)=>b[1]-a[1]);const cat=`<div class="cat-pair"><table class="compact-table">${categoryRows.slice(0,6).map(([k,v])=>tRow(k,fmt(v))).join('')}</table><table class="compact-table">${categoryRows.slice(6).map(([k,v])=>tRow(k,fmt(v))).join('')}</table></div>`;
  const last=s.period.filter(e=>e.kind==='expense').slice(-1)[0];
  const summary=page(header(`${fund} DISBURSEMENT SUMMARY`,range)+meta(b,range,s.period.at(-1)?.no)+
    `<div class="metrics">${metric('Opening / Brought Forward',s.opening)}${metric('Less: Period Expenses',s.expenses)}${metric('Add: Approved Deposits',s.deposits)}${metric('Closing Cash on Hand',s.remaining)}</div>`+
    `<div class="summary-section"><h2>Full Replenishment Request Computation</h2><table class="compact-table">${tRow('Authorized Fund Target',fmt(s.base))}${tRow('Opening Fund / Previous Carryover',fmt(s.opening))}${tRow('Less: Expenses This Period',fmt(-s.expenses))}${tRow('Add: Approved Check Deposits / Replenishments',fmt(s.deposits))}${tRow('Cash on Hand / Remaining',fmt(s.remaining))}<tr class="total"><td>AMOUNT REQUESTED TO RESTORE TARGET</td><td class="num">${fmt(s.amountRequested)}</td></tr></table><p class="voucher-series">Voucher references: ${esc(voucherDisplay)} · Request = target less closing balance.</p></div>`+
    `<div class="summary-section"><h2>Check Deposit / Replenishment Details</h2><table class="compact-table"><thead><tr><th>Date</th><th>Reference</th><th>Bank</th><th>Check No.</th><th>Amount</th></tr></thead><tbody>${deposits}</tbody></table></div>`+
    (fund==='RF'?`<div class="summary-section"><h2>Expense Category Subtotals</h2>${categoryRows.length?cat:"<p>No period expenses</p>"}</div>`:'')+
    signatures(db,last?.createdBy,last?.signature,last?datePH(last.date):undefined));
  openPrint(`${title} · ${b}`,detail+summary,db.settings.reportLogo?.data);
}

export function printRFPParts(db:Database,branch:BranchId,from='',to=''){
 const items=db.fundEntries.filter(e=>e.fund==='RFP'&&e.kind==='expense'&&e.branch===branch&&reportDateMatch(e.date,from,to));
 const range=period(from,to),name=BRANCH_NAME(branch);
 const rows=items.map(e=>[displayed(e.date),displayed(e.no),displayed(e.description),displayed(e.payee),displayed(e.plate),displayed(e.quantity||1),displayed(fmt(e.unitCost||0)),displayed(fmt(e.amount)),displayed(db.pos.find(p=>p.id===e.linkedPosId)?.no||'Unlinked'),displayed(e.proof?.name||'MISSING'),displayed(e.status)]);
 const detail=reportPages('RFP · PARTS EXPENSES',name,range,['Date','RFP Ref','Part','Supplier','Plate','Qty','Unit Cost','Amount','Linked POS','Receipt','Status'],rows,[8,14,13,12,8,4,8,8,11,8,6]);
 const total=items.filter(e=>e.status!=='Rejected').reduce((n,e)=>n+e.amount,0);
 openPrint('RFP Parts Expenses',detail+page(header('RFP PARTS · PERIOD SUMMARY',range)+meta(name,range)+`<div class="metrics">${metric('Included Expenses',total)}${metric('Unlinked Parts',items.filter(e=>!e.linkedPosId).length)}${metric('Missing Receipts',items.filter(e=>!e.proof).length)}${metric('Rejected Amount',items.filter(e=>e.status==='Rejected').reduce((n,e)=>n+e.amount,0))}</div>`+signatures(db,items.at(-1)?.createdBy)),db.settings.reportLogo?.data);
}

export function printSales(db:Database,branch:BranchId,from='',to=''){
 const pos=db.pos.filter(p=>p.branch===branch&&p.status==='Closed'&&reportDateMatch(posClosedDate(p),from,to));
 const name=BRANCH_NAME(branch),range=period(from,to);
 const rows=pos.map(p=>[displayed(posClosedDate(p)),displayed(p.no),displayed(p.client),displayed(p.vehicle),displayed(p.plate),displayed(fmt(posTotal(p))),displayed(fmt(paidTotal(p))),displayed(fmt(posCOGS(p,db))),displayed(fmt(posTotal(p)-posCOGS(p,db)))]);
 const detail=reportPages('CLOSED SALES SUMMARY',name,range,['Closed Date','POS No.','Customer','Vehicle','Plate','Gross Sales','Payments','COGS','Gross Profit'],rows,[10,19,14,11,10,9,9,9,9]);
 const s=pos.reduce((v,p)=>({sales:v.sales+posTotal(p),payments:v.payments+paidTotal(p),cogs:v.cogs+posCOGS(p,db)}),{sales:0,payments:0,cogs:0});
 openPrint('Closed Sales Summary',detail+page(header('CLOSED SALES · SUMMARY',range)+meta(name,range)+`<div class="metrics">${metric('Gross Sales',s.sales)}${metric('Payments',s.payments)}${metric('COGS (POS + RFP Linked)',s.cogs)}${metric('Gross Profit',s.sales-s.cogs)}</div><div class="notice">Only CLOSED POS transactions whose actual closure date falls in this period appear here. RFP-linked parts replace matching manually encoded part costs to avoid double counting.</div>${signatures(db,pos.at(-1)?.createdBy)}`));
}

export function printPOS(db:Database,p:POS){
 const title='POS QUOTATION / TRANSACTION',branch=BRANCH_NAME(p.branch);
 const lines=p.items.map((e,i)=>`<tr>${cell(i+1)}${cell(e.type)}${cell(e.name)}${cell(e.qty)}${cell(fmt(e.price),true)}${cell(fmt(e.qty*e.price),true)}${cell(e.supplier||'—')}${cell(e.receiptNo||'—')}</tr>`).join('');
 const payments=p.payments.map(x=>`<tr>${cell(x.date)}${cell(x.mode)}${cell(fmt(x.amount),true)}</tr>`).join('');
 const costs=posCostBreakdown(p,db).map(x=>`<tr>${cell(x.description)}${cell(x.source)}${cell(fmt(x.amount),true)}</tr>`).join('');
 const linked=db.pos.filter(x=>x.id===p.id||x.parentId===p.id||x.id===p.parentId).map(x=>x.no).join(' · ');
 const body=page(header(title,p.no)+meta(branch,p.date,p.no)+`<p><b>Customer:</b> ${esc(p.client)} &nbsp; <b>Phone:</b> ${esc(p.phone)} &nbsp; <b>Vehicle:</b> ${esc(p.vehicle)} &nbsp; <b>Plate:</b> ${esc(normalizePlate(p.plate))} &nbsp; <b>Status:</b> ${esc(p.status)}</p><p><b>Concern:</b> ${esc(p.concern)} &nbsp; <b>Linked History:</b> ${esc(linked||'—')}</p><div class="summary-section"><h2>Itemized Charges</h2><table class="compact-table" style="max-width:none"><tr><th>#</th><th>Type</th><th>Service / Part</th><th>Qty</th><th>Unit Price</th><th>Total</th><th>Supplier</th><th>Receipt</th></tr>${lines}</table></div><div class="metrics">${metric('Quotation Total',posTotal(p))}${metric('Payments Received',paidTotal(p))}${metric('Balance Due',Math.max(0,posTotal(p)-paidTotal(p)))}${metric('Recorded COGS',posCOGS(p,db))}</div><div class="summary-section"><h2>Payment Records</h2><table class="compact-table"><tr><th>Date</th><th>Mode</th><th>Amount</th></tr>${payments}</table></div><div class="summary-section"><h2>Itemized Cost of Goods Sold · Internal</h2><table class="compact-table"><tr><th>Part / Service</th><th>Cost Source</th><th>Amount</th></tr>${costs}</table></div>${signatures(db,p.createdBy)}`);
 openPrint(`POS ${p.no}`,body,db.settings.reportLogo?.data);
}

export function printCashCounts(db:Database,branch:BranchId,from='',to=''){
 const counts=db.counts.filter(c=>c.branch===branch&&reportDateMatch(c.date,from,to));const range=period(from,to),name=BRANCH_NAME(branch);
 const denoms=['1000','500','200','100','50','20','10','5','1','0.25'];
 const pages=counts.map(c=>page(header(`${c.kind} CASH COUNT SHEET`,c.date)+meta(name,datePH(c.date),c.id)+`<div class="metrics">${metric('Expected',c.expected)}${metric('Actual',c.actual)}${metric('Variance',c.difference)}${metric('Denomination Total',denoms.reduce((sum,d)=>sum+Number(d)*(c.denominations?.[d]||0),0))}</div><div class="summary-section"><h2>Denomination Breakdown · ${esc(c.scope||'Sales Cash')}</h2><table class="compact-table"><tr><th>Denomination</th><th>Quantity</th><th>Amount</th></tr>${denoms.map(d=>`<tr>${cell('₱'+d)}${cell(c.denominations?.[d]??'Not recorded')}${cell(fmt(Number(d)*(c.denominations?.[d]||0)),true)}</tr>`).join('')}</table></div><p class="notes"><b>Cashier Notes:</b> ${esc(c.notes||'—')}</p>${signatures(db,c.userId,c.signature,dateTime(c.createdAt))}`)).join('');
 openPrint('BOD / EOD Cash Count',pages||page(header('CASH COUNT',range)+meta(name,range)+'<p>No cash-count records for the selected period.</p>'),db.settings.reportLogo?.data);
}

export function printTurnovers(db:Database,branch:BranchId,from='',to='',kind:'Sales'|'Funds'='Sales'){
 const rows=db.turnovers.filter(t=>t.branch===branch&&(t.kind||'Sales')===kind&&reportDateMatch(t.date,from,to));const range=period(from,to),name=BRANCH_NAME(branch);
 const detail=reportPages(`FRIDAY ${kind.toUpperCase()} TURNOVER`,name,range,['Date','Reference','Expected Cash','Actual Cash Received','Variance','Submitted By','Remarks'],rows.map(t=>[displayed(t.date),displayed(t.id.slice(0,12)),displayed(fmt(t.expected??t.amount)),displayed(fmt(t.actual??t.amount)),displayed(fmt(t.variance??0)),displayed(db.users.find(u=>u.id===t.createdBy)?.name),displayed(t.notes)]),[12,18,14,16,13,15,12]);
 const total=rows.reduce((v,t)=>({expected:v.expected+(t.expected??t.amount),actual:v.actual+(t.actual??t.amount)}),{expected:0,actual:0});
 openPrint(`${kind} Turnover`,detail+page(header(`FRIDAY ${kind.toUpperCase()} TURNOVER · SUMMARY`,range)+meta(name,range)+`<div class="metrics">${metric('Expected Cash',total.expected)}${metric('Actual Received',total.actual)}${metric('Variance',total.actual-total.expected)}</div>${signatures(db,rows.at(-1)?.createdBy,rows.at(-1)?.signature,rows.at(-1)?dateTime(rows.at(-1)!.createdAt):undefined)}`));
}

export function printReconciliation(db:Database,branch:BranchId,from='',to=''){
 const range=period(from,to),name=BRANCH_NAME(branch);
 const closed=db.pos.filter(p=>p.branch===branch&&p.status==='Closed'&&reportDateMatch(posClosedDate(p),from,to));
 const cashSales=closed.reduce((v,p)=>v+p.payments.filter(x=>x.mode==='Cash').reduce((a,x)=>a+x.amount,0),0);
 const counts=db.counts.filter(c=>c.branch===branch&&reportDateMatch(c.date,from,to));
 const rf=disbursementSummary(db,branch,'RF',from,to);
 const turnovers=db.turnovers.filter(t=>t.branch===branch&&reportDateMatch(t.date,from,to));
 const salesTurnover=turnovers.filter(t=>(t.kind||'Sales')==='Sales').reduce((a,t)=>a+(t.actual??t.amount),0);
 const fundTurnover=turnovers.filter(t=>t.kind==='Funds').reduce((a,t)=>a+(t.actual??t.amount),0);
 const discrepancy=counts.reduce((a,c)=>a+c.difference,0);
 const lines=[['Cash Sales (Closed POS)',cashSales],['Opening Revolving Fund',rf.opening],['RF Expenses',-rf.expenses],['RF Replenishments',rf.deposits],['RF Closing Balance',rf.remaining],['Friday Sales Turnovers',salesTurnover],['Friday Funds Turnovers',fundTurnover],['Recorded Cash Count Variances',discrepancy]];
 const body=page(header('DAILY / PERIOD RECONCILIATION',range)+meta(name,range)+`<div class="metrics">${metric('Cash Sales',cashSales)}${metric('RF Movements',rf.deposits-rf.expenses)}${metric('Sales Turned Over',salesTurnover)}${metric('Cash Count Variance',discrepancy)}</div><div class="summary-section"><h2>Cash Movements & Reconciliation</h2><table class="compact-table">${lines.map(([label,val])=>tRow(String(label),fmt(Number(val)))).join('')}</table></div><div class="notice">Cash Sales, Revolving Fund, and RFP are separate accounts. Variance is the sum of recorded count differences, not an assumed settlement balance. Review cash counts against sales and turnover records.</div>${signatures(db,counts.at(-1)?.userId)}`);
 openPrint('Daily Cashier Reconciliation',body,db.settings.reportLogo?.data);
}

export function printAudit(db:Database,from='',to=''){
 const range=period(from,to),events=db.audit.filter(a=>reportDateMatch(a.at.slice(0,10),from,to));
 const rows=events.map(a=>{const i=a.detail.indexOf(' · OLD '),j=a.detail.indexOf(' → NEW ');
  const subject=i>=0?a.detail.slice(0,i):a.detail,old=i>=0&&j>i?a.detail.slice(i+7,j):'—',next=j>=0?a.detail.slice(j+7):'—';
  return [displayed(dateTime(a.at)),displayed(db.users.find(u=>u.id===a.by)?.name||a.by),displayed(a.action),displayed(subject),displayed(old),displayed(next)];
 });
 const detail=reportPages('AUDIT TRAIL','All authorized branches',range,['Timestamp','User','Action','Details','Original Value','New Value'],rows,[14,14,17,19,18,18]);
 openPrint('Audit Trail',detail,db.settings.reportLogo?.data);
}

/** The independent receipt print view is period-aware and makes missing attachments explicit.
 * Image receipts are embedded. PDF attachments are linked to their original PDF data;
 * automated multi-page PDF rendering / merging is NOT implemented in the frontend preview. */
export function printReceipts(entries:FundEntry[],branch:BranchId,fund:Fund,from='',to='',logo?:string){
 const rows=entries.filter(e=>e.branch===branch&&e.fund===fund&&e.kind==='expense'&&reportDateMatch(e.date,from,to));
 const imageRows=rows.filter(e=>e.proof?.data.startsWith('data:image/'));
 const pdfRows=rows.filter(e=>e.proof&&!e.proof.data.startsWith('data:image/'));
 const missing=rows.filter(e=>!e.proof);
 const range=period(from,to),name=BRANCH_NAME(branch);
 const pages=pagination(imageRows,6).map((chunk,i)=>page(header(`${fund} RECEIPT ATTACHMENTS`,`${range} · Images page ${i+1}`)+meta(name,range)+`<div class="receipt-grid">${chunk.map(e=>`<div class="receipt"><div class="name"><b>${esc(e.no)}</b><span>${fmt(e.amount)} · ${esc(datePH(e.date))}</span></div><img src="${e.proof!.data}" alt="Receipt of ${esc(e.no)}"/><small>${esc(e.proof!.name)}</small></div>`).join('')}</div>`)).join('');
 const references=page(header('RECEIPT ATTACHMENT INDEX',range)+meta(name,range)+`<div class="metrics">${metric('Expense Records',rows.length)}${metric('Image Receipts',imageRows.length)}${metric('Original PDF Receipts',pdfRows.length)}${metric('Missing Attachments',missing.length)}</div><div class="summary-section"><h2>Missing Attachments</h2>${missing.length?`<table class="compact-table">${missing.map(e=>`<tr>${cell(e.no)}${cell(e.payee)}${cell(datePH(e.date))}${cell('MISSING')}</tr>`).join('')}</table>`:'<p>No missing attachments.</p>'}</div><div class="summary-section"><h2>Original PDF Receipts (Separate Original Files)</h2>${pdfRows.length?`<table class="compact-table">${pdfRows.map(e=>`<tr>${cell(e.no)}${cell(e.proof?.name)}<td><a href="${e.proof!.data}" target="_blank" rel="noopener">Open original PDF</a></td></tr>`).join('')}</table>`:'<p>No PDF attachments.</p>'}</div><div class="notice">Uploaded PDF receipts are available as original files, not automatically rasterized or merged into this printable HTML. Save this print preview as PDF for embedded image receipts.</div>`);
 openPrint(`${fund} Receipts`,pages+references,logo);
}
