"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.posCOGS = exports.paidTotal = exports.posTotal = exports.STORAGE_KEY = exports.number = exports.money = exports.pesos = exports.uid = exports.BRANCH_NAME = exports.timeMinutesPH = exports.monthRange = exports.vehicleName = exports.CAR_CATALOG = exports.RF_CATEGORIES = exports.BRANCHES = void 0;
exports.pendingRFPDisbursementRows = pendingRFPDisbursementRows;
exports.todayPH = todayPH;
exports.hourPH = hourPH;
exports.datePH = datePH;
exports.createSeed = createSeed;
exports.loadDB = loadDB;
exports.storeDB = storeDB;
exports.balance = balance;
exports.replenishmentDue = replenishmentDue;
exports.branchFundTotals = branchFundTotals;
exports.nextNumber = nextNumber;
exports.log = log;
exports.stockAvailable = stockAvailable;
exports.postedStockOuts = postedStockOuts;
exports.returnableQty = returnableQty;
exports.pendingReturnQty = pendingReturnQty;
exports.recordStockIn = recordStockIn;
exports.confirmStockOut = confirmStockOut;
exports.requestStockReturn = requestStockReturn;
exports.decideStockReturn = decideStockReturn;
exports.posCostBreakdown = posCostBreakdown;
exports.posCostTotals = posCostTotals;
exports.posClosedDate = posClosedDate;
exports.reportDateMatch = reportDateMatch;
exports.amountInWords = amountInWords;
exports.normalizePlate = normalizePlate;
exports.csvEscape = csvEscape;
exports.downloadFile = downloadFile;
exports.categoryTotals = categoryTotals;
exports.matchingPOS = matchingPOS;
exports.plateSuggestions = plateSuggestions;
exports.linkPartsOnSale = linkPartsOnSale;
exports.disbursementSummary = disbursementSummary;
exports.isFridayPH = isFridayPH;
exports.BRANCHES = [
    { id: 'UCQC', name: 'UC Quezon City', short: 'UC Quezon City' },
    { id: 'UCM', name: 'UC Mandaluyong', short: 'UC Mandaluyong' },
    { id: 'UCLP', name: 'UC Las Piñas', short: 'UC Las Piñas' },
    { id: 'MMM', name: 'MM Mandaluyong', short: 'MM Mandaluyong' }
];
exports.RF_CATEGORIES = ['Gasoline / Fuel', 'Transportation', 'Parking / Toll Fees', 'Food / Grocery', 'Office Supplies', 'Cleaning Supplies', 'Repairs & Maintenance', 'Utilities', 'Miscellaneous', 'Staff Welfare', 'Client Expense'];
/** Local reference catalogue for frontend validation. Replace source with Supabase vehicle directory later. */
exports.CAR_CATALOG = [
    'Toyota Vios', 'Toyota Wigo', 'Toyota Innova', 'Toyota Fortuner', 'Toyota Hilux', 'Toyota Corolla Altis', 'Toyota Avanza', 'Toyota Rush', 'Toyota Raize', 'Toyota Yaris', 'Toyota Hiace', 'Toyota Camry', 'Toyota Land Cruiser',
    'Honda City', 'Honda Civic', 'Honda Brio', 'Honda Jazz', 'Honda CR-V', 'Honda HR-V', 'Honda BR-V', 'Honda Accord',
    'Mitsubishi Mirage', 'Mitsubishi Mirage G4', 'Mitsubishi Xpander', 'Mitsubishi Montero Sport', 'Mitsubishi Strada', 'Mitsubishi L300',
    'Nissan Almera', 'Nissan Navara', 'Nissan Terra', 'Nissan Urvan', 'Nissan Kicks',
    'Ford Ranger', 'Ford Everest', 'Ford Territory', 'Ford EcoSport', 'Ford Explorer',
    'Suzuki Swift', 'Suzuki Dzire', 'Suzuki Ertiga', 'Suzuki Celerio', 'Suzuki Jimny', 'Suzuki S-Presso',
    'Hyundai Accent', 'Hyundai Stargazer', 'Hyundai Tucson', 'Hyundai Santa Fe', 'Hyundai Starex', 'Hyundai Creta',
    'Kia Soluto', 'Kia Stonic', 'Kia Seltos', 'Kia Sportage', 'Kia Carnival',
    'Isuzu D-Max', 'Isuzu mu-X', 'Chevrolet Trailblazer', 'Chevrolet Colorado', 'Mazda 2', 'Mazda 3', 'Mazda CX-5', 'Subaru Forester', 'Subaru XV', 'Subaru Impreza',
    'MG 5', 'MG ZS', 'Geely Coolray', 'Geely Okavango', 'BYD Atto 3', 'BYD Seal', 'Chery Tiggo 7 Pro', 'Chery Tiggo 8 Pro', 'GAC GS3', 'GAC GS8'
];
const vehicleName = (brandModel, year) => `${brandModel.trim()} ${String(year).trim()}`.trim();
exports.vehicleName = vehicleName;
const monthRange = (month) => { if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month))
    month = todayPH().slice(0, 7); const [y, m] = month.split('-').map(Number); return [`${month}-01`, `${month}-${String(new Date(Date.UTC(y, m, 0)).getUTCDate()).padStart(2, '0')}`]; };
exports.monthRange = monthRange;
const timeMinutesPH = () => { const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Manila', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date()); return Number(parts.find(p => p.type === 'hour')?.value || 0) * 60 + Number(parts.find(p => p.type === 'minute')?.value || 0); };
exports.timeMinutesPH = timeMinutesPH;
/** PB request period starts after previous fully approved replenishment. */
function pendingRFPDisbursementRows(db, branch) {
    const last = db.fundEntries.filter(e => e.branch === branch && e.fund === 'RFP' && e.kind === 'replenishment' && e.status === 'Approved').sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
    return db.fundEntries.filter(e => e.branch === branch && e.fund === 'RFP' && e.kind === 'expense' && e.status !== 'Rejected' && (!last || e.createdAt > last.createdAt)).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}
const BRANCH_NAME = (id) => exports.BRANCHES.find(b => b.id === id)?.name || id;
exports.BRANCH_NAME = BRANCH_NAME;
const uid = () => (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `ID-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`);
exports.uid = uid;
function todayPH() { return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Manila', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()); }
function hourPH() { return Number(new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Manila', hour: '2-digit', hourCycle: 'h23' }).format(new Date())); }
function datePH(date) { return new Date(`${date}T12:00:00+08:00`).toLocaleDateString('en-PH', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Manila' }); }
const pesos = (n) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n || 0);
exports.pesos = pesos;
const money = (n) => new Intl.NumberFormat('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n || 0);
exports.money = money;
const number = (v) => Math.max(0, Number(v) || 0);
exports.number = number;
const base = () => ({ UCQC: 50000, UCM: 50000, UCLP: 50000, MMM: 50000 });
const rfpBase = () => ({ UCQC: 120000, UCM: 120000, UCLP: 120000, MMM: 120000 });
function createSeed() {
    const date = todayPH();
    const users = [
        { id: 'u-admin', username: 'admin', password: 'admin12345', name: 'System Administrator', role: 'admin', branch: 'UCM', active: true },
        { id: 'u-cashier', username: 'cashier', password: 'cashier12345', name: 'Cashier — Mandaluyong', role: 'cashier', branch: 'UCM', active: true },
        { id: 'u-pb', username: 'pbacc', password: 'pb12345', name: 'Parts Buyer — Mandaluyong', role: 'pb', branch: 'UCM', active: true }
    ];
    const entry = (no, branch, amount, payee, category, by, fund) => ({ id: (0, exports.uid)(), no, fund, kind: 'expense', branch, date, amount, category, payee, vat: 'Non-VAT', voucher: '', receiptNo: '', tin: '', description: `Demo ${category.toLowerCase()} expense`, notes: 'Sample transaction for frontend testing', status: 'Pending', createdBy: by, createdAt: new Date().toISOString() });
    const rf = entry('UCM-Rotating Fund-00000001', 'UCM', 1250, 'Shop Supplies Co.', 'Office Supplies', 'u-cashier', 'RF');
    rf.status = 'Approved';
    const rf2 = entry('UCQC-Rotating Fund-00000001', 'UCQC', 680, 'Office Mart', 'Office Supplies', 'u-admin', 'RF');
    const rfp = entry('UCM-RFP-00000001', 'UCM', 3800, 'Auto Parts Supplier', 'Automotive Parts', 'u-pb', 'RFP');
    rfp.plate = 'ABC1234';
    rfp.car = 'Toyota Vios 2020';
    rfp.quantity = 2;
    rfp.unitCost = 1900;
    const pos = [{ id: (0, exports.uid)(), no: 'UCM-POS-00000001', branch: 'UCM', date, client: 'Sample Customer', phone: '', vehicle: 'Toyota Vios 2020', plate: 'ABC1234', concern: 'Routine service', items: [{ id: (0, exports.uid)(), type: 'Service', name: 'Oil Change', qty: 1, price: 1800, cost: 450 }, { id: (0, exports.uid)(), type: 'Part', name: 'Engine Oil', qty: 1, price: 2200, cost: 1250 }], payments: [{ id: (0, exports.uid)(), mode: 'Cash', amount: 4000, date }], status: 'Closed', createdBy: 'u-cashier', createdAt: new Date().toISOString(), closedAt: new Date().toISOString() }];
    const inventory = exports.BRANCHES.flatMap(b => [
        { id: (0, exports.uid)(), barcode: `${b.id}10001`, name: 'Engine Oil 5W-30', category: 'Automotive Parts & Products', branch: b.id, unit: 'Bottle', sellPrice: 780, unitCost: 440, openingQty: 24, reorderAt: 5, createdAt: new Date().toISOString() },
        { id: (0, exports.uid)(), barcode: `${b.id}10002`, name: 'Oil Filter', category: 'Automotive Parts & Products', branch: b.id, unit: 'Piece', sellPrice: 550, unitCost: 310, openingQty: 12, reorderAt: 4, createdAt: new Date().toISOString() },
        { id: (0, exports.uid)(), barcode: `${b.id}10003`, name: 'Cleaning Detergent', category: 'Shop Supplies', branch: b.id, unit: 'Bottle', sellPrice: 0, unitCost: 160, openingQty: 15, reorderAt: 3, createdAt: new Date().toISOString() },
    ]);
    return { users, fundEntries: [rf, rf2, rfp], pos, inventory, stockMovements: [], stockRequests: [], counts: [], incidents: [], turnovers: [], requests: [], audit: [{ id: (0, exports.uid)(), at: new Date().toISOString(), by: 'system', action: 'Demo initialized', detail: 'Sample data created; amounts are illustrative only' }], settings: { rfBase: base(), rfpBase: rfpBase(), categories: [...exports.RF_CATEGORIES], signatories: { checked: '', approved: '' } } };
}
exports.STORAGE_KEY = 'underchargers-fund-management-demo-v1';
function loadDB() { if (typeof window === 'undefined')
    return createSeed(); try {
    const s = localStorage.getItem(exports.STORAGE_KEY);
    if (s) {
        const d = JSON.parse(s);
        if (d?.settings?.rfBase && Array.isArray(d.users) && Array.isArray(d.pos) && Array.isArray(d.fundEntries)) {
            const legacy = ['Shop Supplies', 'Cleaning', 'Maintenance', 'Other'];
            const categories = d.settings.categories || [];
            d.settings.categories = [...exports.RF_CATEGORIES, ...categories.filter(c => !legacy.includes(c) && !exports.RF_CATEGORIES.some(a => a === c))];
            d.settings.signatories = d.settings.signatories || { checked: '', approved: '' };
            d.turnovers = (d.turnovers || []).map(t => ({ ...t, kind: t.kind || 'Sales', actual: t.actual ?? t.amount }));
            d.inventory = d.inventory || [];
            d.stockMovements = d.stockMovements || [];
            d.stockRequests = d.stockRequests || [];
            return d;
        }
    }
}
catch { } return createSeed(); }
function storeDB(db) { try {
    localStorage.setItem(exports.STORAGE_KEY, JSON.stringify(db));
    return true;
}
catch {
    return false;
} }
function balance(db, branch, fund) {
    const initial = (fund === 'RF' ? db.settings.rfBase : db.settings.rfpBase)[branch] || 0;
    return db.fundEntries.filter(e => e.branch === branch && e.fund === fund && e.status !== 'Rejected').reduce((sum, e) => sum + (e.kind === 'replenishment' ? (e.status === 'Approved' ? e.amount : 0) : -e.amount), initial);
}
/** Only replace cash that has already been spent and not yet replenished.
 * Pending replenishments are not included in the cash-on-hand balance; a second
 * request is blocked in the UI until the previous one is decided. */
function replenishmentDue(db, branch, fund) {
    const target = (fund === 'RF' ? db.settings.rfBase : db.settings.rfpBase)[branch] || 0;
    return Math.round(Math.max(0, target - balance(db, branch, fund)) * 100) / 100;
}
/** Per-branch financial summary: no fund movements or balances cross branch boundaries. */
function branchFundTotals(db, fund) {
    const rows = exports.BRANCHES.map(b => {
        const target = (fund === 'RF' ? db.settings.rfBase : db.settings.rfpBase)[b.id] || 0;
        const expenses = db.fundEntries.filter(e => e.branch === b.id && e.fund === fund && e.kind === 'expense' && e.status !== 'Rejected').reduce((n, e) => n + e.amount, 0);
        const received = db.fundEntries.filter(e => e.branch === b.id && e.fund === fund && e.kind === 'replenishment' && e.status === 'Approved').reduce((n, e) => n + e.amount, 0);
        return { branch: b.id, name: b.name, target, expenses, received, remaining: balance(db, b.id, fund), toReplenish: replenishmentDue(db, b.id, fund) };
    });
    return { rows, grand: rows.reduce((s, r) => ({ target: s.target + r.target, expenses: s.expenses + r.expenses, received: s.received + r.received, remaining: s.remaining + r.remaining, toReplenish: s.toReplenish + r.toReplenish }), { target: 0, expenses: 0, received: 0, remaining: 0, toReplenish: 0 }) };
}
function nextNumber(db, branch, type) {
    const prefix = type === 'RF' ? `${branch}-Rotating Fund-` : `${branch}-${type}-`;
    const all = type === 'POS' ? db.pos.map(v => v.no) : db.fundEntries.filter(v => v.fund === type).map(v => v.no);
    const max = Math.max(0, ...all.filter(v => v.startsWith(prefix)).map(v => Number(v.slice(prefix.length)) || 0));
    return `${prefix}${String(max + 1).padStart(8, '0')}`;
}
function log(db, by, action, detail) { return { ...db, audit: [{ id: (0, exports.uid)(), at: new Date().toISOString(), by, action, detail }, ...db.audit].slice(0, 1000) }; }
const posTotal = (p) => p.items.reduce((v, i) => v + i.qty * i.price, 0);
exports.posTotal = posTotal;
const paidTotal = (p) => p.payments.reduce((v, i) => v + i.amount, 0);
exports.paidTotal = paidTotal;
/** Branch-aware stock quantity from initial count and immutable ledger. */
function stockAvailable(db, p) {
    return Math.round((p.openingQty + (db.stockMovements || []).filter(m => m.productId === p.id && m.branch === p.branch).reduce((n, m) => n + (m.kind === 'StockOut' ? -m.qty : m.qty), 0)) * 1000) / 1000;
}
function postedStockOuts(db, posId) {
    return (db.stockMovements || []).filter(m => m.posId === posId && m.kind === 'StockOut');
}
function returnableQty(db, stockOutId) {
    const out = (db.stockMovements || []).find(m => m.id === stockOutId && m.kind === 'StockOut');
    if (!out)
        return 0;
    const returned = (db.stockMovements || []).filter(m => m.kind === 'StockReturn' && m.sourceStockOutId === stockOutId).reduce((n, m) => n + m.qty, 0);
    return Math.max(0, out.qty - returned);
}
function pendingReturnQty(db, stockOutId) {
    return (db.stockRequests || []).filter(r => r.stockOutId === stockOutId && r.status === 'Pending').reduce((n, r) => n + r.qty, 0);
}
/** Pure, checked ledger operations make duplicate scans and unauthorized stock changes testable. */
function recordStockIn(db, productId, qty, by, notes = '') {
    const product = db.inventory.find(p => p.id === productId);
    if (!product || !Number.isInteger(qty) || qty <= 0)
        throw new Error('Invalid product or positive quantity required.');
    const actor = db.users.find(u => u.id === by && u.active);
    if (!actor || (actor.role !== 'admin' && (actor.role !== 'cashier' || actor.branch !== product.branch)))
        throw new Error('No Stock In access to this branch.');
    const movement = { id: (0, exports.uid)(), productId, branch: product.branch, kind: 'StockIn', qty, unitCost: product.unitCost, by, at: new Date().toISOString(), notes };
    return log({ ...db, stockMovements: [movement, ...db.stockMovements] }, by, 'Stock In', `${product.name} · ${product.branch} · +${qty}`);
}
function confirmStockOut(db, productId, posId, qty, by) {
    const product = db.inventory.find(p => p.id === productId), pos = db.pos.find(p => p.id === posId), actor = db.users.find(u => u.id === by && u.active);
    if (!actor || actor.role !== 'cashier' || !product || !pos || actor.branch !== pos.branch || product.branch !== pos.branch || pos.status !== 'Pending')
        throw new Error('Stock Out requires an open POS and authorized Cashier in the same branch.');
    if (!Number.isInteger(qty) || qty <= 0 || stockAvailable(db, product) < qty)
        throw new Error('Insufficient stock or invalid quantity.');
    const movement = { id: (0, exports.uid)(), productId, branch: product.branch, kind: 'StockOut', qty, unitCost: product.unitCost, posId, by, at: new Date().toISOString() };
    return log({ ...db, stockMovements: [movement, ...db.stockMovements] }, by, 'Locked Stock Out', `${product.name} · ${pos.no} · -${qty} · ${(0, exports.pesos)(qty * product.unitCost)}`);
}
function requestStockReturn(db, stockOutId, qty, reason, by) {
    const out = db.stockMovements.find(m => m.id === stockOutId && m.kind === 'StockOut'), actor = db.users.find(u => u.id === by && u.active);
    if (!out || !out.posId || !actor || actor.role !== 'cashier' || actor.branch !== out.branch)
        throw new Error('Unauthorized stock return.');
    const available = returnableQty(db, stockOutId) - pendingReturnQty(db, stockOutId);
    if (!Number.isInteger(qty) || qty <= 0 || qty > available || !reason.trim())
        throw new Error('Invalid return quantity or missing reason.');
    const request = { id: (0, exports.uid)(), stockOutId, branch: out.branch, posId: out.posId, qty, reason: reason.trim(), requestedBy: by, requestedAt: new Date().toISOString(), status: 'Pending' };
    return log({ ...db, stockRequests: [request, ...db.stockRequests] }, by, 'Stock Out return requested', `${out.id} · ${qty} · ${reason}`);
}
function decideStockReturn(db, requestId, approve, by, notes = '') {
    const req = db.stockRequests.find(r => r.id === requestId), actor = db.users.find(u => u.id === by && u.active);
    if (!req || req.status !== 'Pending' || !actor || actor.role !== 'admin')
        throw new Error('Only Admin can decide a pending return.');
    if (approve && req.qty > returnableQty(db, req.stockOutId))
        throw new Error('Return exceeds remaining Stock Out quantity.');
    const original = db.stockMovements.find(m => m.id === req.stockOutId);
    const movement = { id: (0, exports.uid)(), productId: original.productId, branch: original.branch, kind: 'StockReturn', qty: req.qty, unitCost: original.unitCost, sourceStockOutId: original.id, posId: original.posId, by, at: new Date().toISOString(), notes: `Approved request ${req.id}: ${req.reason}` };
    const stockRequests = db.stockRequests.map(r => r.id === requestId ? { ...r, status: approve ? 'Approved' : 'Rejected', decidedBy: by, decidedAt: new Date().toISOString(), decisionNotes: notes } : r);
    return log({ ...db, stockRequests, stockMovements: approve ? [movement, ...db.stockMovements] : db.stockMovements }, by, approve ? 'Stock return approved' : 'Stock return rejected', `${req.stockOutId} · ${req.qty} · ${notes}`);
}
/** Keep cost sources separate: POS/manual, branch inventory used, and PB/RFP purchases.
 * PB and inventory quantities remove matching manual cost so identical parts never double count. */
function posCostBreakdown(p, db) {
    const lines = p.items.map(i => ({ id: i.id, description: i.name, source: 'POS / Manual COGS', amount: i.qty * i.cost }));
    if (!db)
        return lines;
    const key = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
    const remaining = new Map(p.items.filter(i => i.type === 'Part').map(i => [i.id, i.qty]));
    function absorb(description, qty) {
        let left = qty;
        for (const manual of p.items) {
            if (manual.type !== 'Part' || key(manual.name) !== key(description) || left <= 0)
                continue;
            const possible = Math.min(remaining.get(manual.id) || 0, left);
            if (possible) {
                const row = lines.find(x => x.id === manual.id);
                if (row)
                    row.amount = Math.round((row.amount - possible * manual.cost) * 100) / 100;
                remaining.set(manual.id, (remaining.get(manual.id) || 0) - possible);
                left -= possible;
            }
        }
    }
    const linked = db.fundEntries.filter(e => e.fund === 'RFP' && e.kind === 'expense' && e.status !== 'Rejected' && e.linkedPosId === p.id);
    for (const part of linked) {
        absorb(part.description, part.quantity || 1);
        lines.push({ id: part.id, description: part.description, source: `PB / RFP · ${part.no} · ${part.payee}`, amount: part.amount });
    }
    for (const out of postedStockOuts(db, p.id)) {
        const product = db.inventory.find(x => x.id === out.productId);
        if (!product)
            continue;
        const returned = db.stockMovements.filter(m => m.kind === 'StockReturn' && m.sourceStockOutId === out.id).reduce((n, m) => n + m.qty, 0);
        const net = Math.max(0, out.qty - returned);
        if (!net)
            continue;
        absorb(product.name, net);
        lines.push({ id: out.id, description: `${product.name} · ${net} ${product.unit}`, source: `From Inventory · ${out.id.slice(0, 8)}`, amount: Math.round(net * out.unitCost * 100) / 100 });
    }
    return lines.filter(r => r.amount > 0);
}
function posCostTotals(p, db) {
    const rows = posCostBreakdown(p, db);
    return { manual: rows.filter(r => r.source === 'POS / Manual COGS').reduce((n, r) => n + r.amount, 0), inventory: rows.filter(r => r.source.startsWith('From Inventory')).reduce((n, r) => n + r.amount, 0), rfp: rows.filter(r => r.source.startsWith('PB / RFP')).reduce((n, r) => n + r.amount, 0) };
}
const posCOGS = (p, db) => posCostBreakdown(p, db).reduce((v, i) => v + i.amount, 0);
exports.posCOGS = posCOGS;
function posClosedDate(p) { if (!p.closedAt)
    return p.date; const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Manila', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date(p.closedAt)); const val = (type) => parts.find(x => x.type === type)?.value || ''; return `${val('year')}-${val('month')}-${val('day')}`; }
function reportDateMatch(date, from = '', to = '') { return (!from || date >= from) && (!to || date <= to); }
function amountInWords(amount) {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const under1000 = (x) => { const a = []; if (x >= 100) {
        a.push(ones[Math.floor(x / 100)] + ' Hundred');
        x %= 100;
    } if (x >= 20) {
        a.push(tens[Math.floor(x / 10)]);
        x %= 10;
    } if (x > 0)
        a.push(ones[x]); return a.join(' '); };
    const absolute = Math.round(Math.max(0, amount) * 100), pesosPart = Math.floor(absolute / 100), centavos = absolute % 100;
    let remaining = pesosPart;
    const groups = [];
    for (const [value, name] of [[1e9, 'Billion'], [1e6, 'Million'], [1000, 'Thousand'], [1, '']]) {
        const part = Math.floor(remaining / value);
        if (part) {
            groups.push(`${under1000(part)} ${name}`.trim());
            remaining %= value;
        }
    }
    return `${groups.join(' ') || 'Zero'} Pesos and ${String(centavos).padStart(2, '0')}/100 Only`;
}
function normalizePlate(plate) { return plate.toUpperCase().replace(/[^A-Z0-9]/g, ''); }
function csvEscape(value) { let s = String(value ?? ''); if (/^[=+@\t\r]/.test(s) || /^-[^0-9]/.test(s))
    s = "'" + s; return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; }
function downloadFile(name, content, mime = 'text/csv;charset=utf-8') {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
}
function categoryTotals(entries) { return entries.filter(e => e.fund === 'RF' && e.kind === 'expense' && e.status !== 'Rejected').reduce((result, e) => { result[e.category] = (result[e.category] || 0) + e.amount; return result; }, {}); }
function matchingPOS(db, branch, plate) { return db.pos.filter(p => p.branch === branch && normalizePlate(p.plate) === normalizePlate(plate)).sort((a, b) => b.createdAt.localeCompare(a.createdAt)); }
/** Frontend-only plate directory for POS suggestions. Prefer latest POS contact and PB car when no sale yet. */
function plateSuggestions(db, branch, term) {
    const query = normalizePlate(term);
    if (!query)
        return [];
    const plates = new Set([...db.pos.filter(p => p.branch === branch).map(p => normalizePlate(p.plate)), ...db.fundEntries.filter(e => e.branch === branch && e.fund === 'RFP' && e.kind === 'expense').map(e => normalizePlate(e.plate || ''))]);
    return [...plates].filter(p => p && p.includes(query)).sort((a, b) => a.startsWith(query) === b.startsWith(query) ? a.localeCompare(b) : a.startsWith(query) ? -1 : 1).slice(0, 8).map(plate => {
        const visit = matchingPOS(db, branch, plate)[0];
        const purchase = db.fundEntries.filter(e => e.branch === branch && e.fund === 'RFP' && e.kind === 'expense' && e.status !== 'Rejected' && normalizePlate(e.plate || '') === plate).sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
        return { plate, car: (purchase && !purchase.linkedPosId ? purchase.car : undefined) || visit?.vehicle || purchase?.car || '', client: visit?.client || '', phone: visit?.phone || '', concern: visit?.concern || '', unlinkedParts: db.fundEntries.filter(e => e.fund === 'RFP' && e.kind === 'expense' && e.branch === branch && e.status !== 'Rejected' && !e.linkedPosId && normalizePlate(e.plate || '') === plate).length };
    });
}
/** Links only unassigned PB part-lines to a new Cashier POS (not to unrelated previous visits). */
function linkPartsOnSale(db, pos) {
    // Do not silently assign parts to a new visit if another open POS exists for the same plate.
    if (db.pos.some(p => p.id !== pos.id && p.branch === pos.branch && p.status === 'Pending' && normalizePlate(p.plate) === normalizePlate(pos.plate)))
        return db;
    const items = db.fundEntries.filter(e => e.fund === 'RFP' && e.kind === 'expense' && e.status !== 'Rejected' && !e.linkedPosId && e.branch === pos.branch && normalizePlate(e.plate || '') === normalizePlate(pos.plate));
    if (!items.length)
        return db;
    return { ...db, fundEntries: db.fundEntries.map(e => items.some(i => i.id === e.id) ? { ...e, linkedPosId: pos.id } : e) };
}
/** Report accounting: opening is cumulative balance immediately before `from`.
 * Selected-period expenses and approved replenishments reconcile exactly to the reported closing.
 * The fund target is the configured starting/target fund balance. */
function disbursementSummary(db, branch, fund, from = '', to = '') {
    const base = (fund === 'RF' ? db.settings.rfBase : db.settings.rfpBase)[branch] || 0;
    const rows = db.fundEntries.filter(e => e.branch === branch && e.fund === fund && e.status !== 'Rejected');
    const signed = (e) => e.kind === 'expense' ? -e.amount : e.status === 'Approved' ? e.amount : 0;
    const opening = base + rows.filter(e => !!from && e.date < from).reduce((n, e) => n + signed(e), 0);
    const period = rows.filter(e => reportDateMatch(e.date, from, to));
    const expenses = period.filter(e => e.kind === 'expense').reduce((n, e) => n + e.amount, 0);
    const deposits = period.filter(e => e.kind === 'replenishment' && e.status === 'Approved').reduce((n, e) => n + e.amount, 0);
    const remaining = opening + deposits - expenses;
    return { base, opening, expenses, deposits, remaining, amountRequested: Math.max(0, base - remaining), period, checkDeposits: period.filter(e => e.kind === 'replenishment' && e.status === 'Approved') };
}
function isFridayPH(date) { return new Date(`${date}T12:00:00+08:00`).getUTCDay() === 5; }
