// Legacy regression fixture ONLY: never used by the application.
module.exports=function legacyFixture(d){
 const db=d.createSeed(),date=d.todayPH(),uid=d.uid;
 db.settings.rfBase={UCQC:50000,UCM:50000,UCLP:50000,MMM:50000};
 db.settings.rfpBase={UCQC:120000,UCM:120000,UCLP:120000,MMM:120000};
 const entry=(no,branch,amount,payee,category,by,fund)=>({id:uid(),no,branch,date,amount,payee,category,createdBy:by,fund,kind:'expense',vat:'Non-VAT',voucher:'',receiptNo:'',tin:'',description:`Demo ${category.toLowerCase()} expense`,notes:'Sample transaction for frontend testing',status:'Pending',createdAt:new Date().toISOString()});
 const rf=entry('UCM-Rotating Fund-00000001','UCM',1250,'Shop Supplies Co.','Office Supplies','u-cashier','RF');rf.status='Approved';
 const rf2=entry('UCQC-Rotating Fund-00000001','UCQC',680,'Office Mart','Office Supplies','u-admin','RF');
 const rfp=entry('UCM-RFP-00000001','UCM',3800,'Auto Parts Supplier','Automotive Parts','u-pb','RFP');rfp.plate='ABC1234';rfp.car='Toyota Vios 2020';rfp.quantity=2;rfp.unitCost=1900;
 db.fundEntries=[rf,rf2,rfp];
 db.pos=[{id:uid(),no:'UCM-POS-00000001',branch:'UCM',date,client:'Sample Customer',phone:'',vehicle:'Toyota Vios 2020',plate:'ABC1234',concern:'Routine service',items:[{id:uid(),type:'Service',name:'Oil Change',qty:1,price:1800,cost:450},{id:uid(),type:'Part',name:'Engine Oil',qty:1,price:2200,cost:1250}],payments:[{id:uid(),mode:'Cash',amount:4000,date}],status:'Closed',createdBy:'u-cashier',createdAt:new Date().toISOString(),closedAt:new Date().toISOString()}];
 db.audit=[{id:uid(),at:new Date().toISOString(),by:'system',action:'Demo initialized',detail:'Sample data created; amounts are illustrative only'}];
 return db;
};
