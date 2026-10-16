// Local-mode Supabase-compatible interface. All data stays in the browser's IndexedDB.
import {rows,writeRows,addRow,updateRow,putFile,getFile,demoUser,audit} from './localDb';
import * as backend from './backend';
export const configured=true;
const now=()=>new Date().toISOString();
const uid=()=>demoUser();
class Query {
 table:string; op:string='select';filters:((row:any)=>boolean)[]=[];changes:any=null;sorting:{key:string;asc:boolean}|null=null;max=Infinity;offset=0;
 constructor(table:string){this.table=table}
 select(_columns='*'){return this}
 eq(field:string,value:any){this.filters.push(x=>x[field]===value);return this}
 neq(field:string,value:any){this.filters.push(x=>x[field]!==value);return this}
 is(field:string,value:any){this.filters.push(x=>x[field]===value);return this}
 in(field:string,values:any[]){this.filters.push(x=>values.includes(x[field]));return this}
 gte(field:string,value:any){this.filters.push(x=>x[field]>=value);return this}
 lte(field:string,value:any){this.filters.push(x=>x[field]<=value);return this}
 gt(field:string,value:any){this.filters.push(x=>x[field]>value);return this}
 lt(field:string,value:any){this.filters.push(x=>x[field]<value);return this}
 like(field:string,value:string){this.filters.push(x=>String(x[field]||'').includes(value.replaceAll('%','')));return this}
 ilike(field:string,value:string){this.filters.push(x=>String(x[field]||'').toLowerCase().includes(value.replaceAll('%','').toLowerCase()));return this}
 contains(field:string,value:any){this.filters.push(x=>Array.isArray(x[field])&&value.every((v:any)=>x[field].includes(v)));return this}
 or(expr:string){const tests=expr.split(',').map(part=>{const m=part.match(/^([\w]+)\.(eq|neq|ilike|is)\.(.*)$/);if(!m)return (_:any)=>false;const [,key,op,val]=m;return (r:any)=>op==='eq'?String(r[key])===val:op==='neq'?String(r[key])!==val:op==='is'?((val==='null'&&r[key]==null)||(val==='true'&&r[key]===true)):String(r[key]??'').toLowerCase().includes(val.replaceAll('%','').toLowerCase())});this.filters.push(row=>tests.some(test=>test(row)));return this}
 order(key:string,options:any={}){this.sorting={key,asc:options.ascending!==false};return this}
 limit(n:number){this.max=n;return this}
 range(a:number,b:number){this.offset=a;this.max=b-a+1;return this}
 insert(value:any){this.op='insert';this.changes=value;return this}
 upsert(value:any){this.op='upsert';this.changes=value;return this}
 update(value:any){this.op='update';this.changes=value;return this}
 delete(){this.op='delete';return this}
 async run(single=false,maybe=false){try{const all=await rows(this.table);let found=all.filter(x=>this.filters.every(f=>f(x)));if(this.sorting){const {key,asc}=this.sorting;found.sort((a,b)=>String(a[key]??'').localeCompare(String(b[key]??''))*(asc?1:-1))}found=found.slice(this.offset,this.offset+this.max);
 if(this.op==='select'){if(single||maybe)return {data:found[0]||null,error:!found.length&&!maybe?{message:'No rows returned'}:null};return {data:found,error:null,count:found.length}}
 if(this.op==='insert'||this.op==='upsert'){const source=Array.isArray(this.changes)?this.changes:[this.changes];let next=[...all];for(const item of source){const r={...item,id:item.id||crypto.randomUUID(),created_at:item.created_at||now()};const idx=next.findIndex(x=>x.id===r.id);if(idx>=0&&this.op==='upsert')next[idx]={...next[idx],...r};else if(idx<0)next.unshift(r);else throw Error('Duplicate ID')}await writeRows(this.table,next);return {data:source,error:null}}
 const ids=new Set(found.map(x=>x.id));const next=this.op==='delete'?all.filter(x=>!ids.has(x.id)):all.map(x=>ids.has(x.id)?{...x,...this.changes}:x);await writeRows(this.table,next);return {data:found,error:null}
 }catch(e:any){return {data:null,error:{message:String(e?.message||e)}}}}
 single(){return this.run(true)}
 maybeSingle(){return this.run(false,true)}
 then(resolve:any,reject?:any){return this.run().then(resolve,reject)}
}
const identities:{[key:string]:{pass:string;role:string}}={cashier:{pass:'cashier12345',role:'Cashier'},admin:{pass:'admin12345',role:'Admin'},pbacc:{pass:'pb12345',role:'PB'}};
const localAuth={
 async getUser(){const id=uid();return {data:{user:id?{id,email:id}:null},error:null}},
 async getSession(){const id=uid();return {data:{session:id?{user:{id,email:id}}:null},error:null}},
 async signInWithPassword({email,password}:{email:string;password:string}){const acc=identities[email.trim().toLowerCase()];if(!acc||acc.pass!==password)return {data:{user:null},error:{message:'Invalid demo username or password'}};sessionStorage.setItem('cms-local-user',email.trim().toLowerCase());window.dispatchEvent(new Event('cms-local-login'));return {data:{user:{id:email.trim().toLowerCase(),email}},error:null}},
 async signOut(){sessionStorage.removeItem('cms-local-user');window.dispatchEvent(new Event('cms-local-logout'));return {error:null}},
 onAuthStateChange(fn:(event:string,session:any)=>void){const on=()=>{const id=uid();fn(id?'SIGNED_IN':'SIGNED_OUT',id?{user:{id,email:id}}:null)};window.addEventListener('cms-local-login',on);window.addEventListener('cms-local-logout',on);return {data:{subscription:{unsubscribe(){window.removeEventListener('cms-local-login',on);window.removeEventListener('cms-local-logout',on)}}}}},
 async updateUser(){return {data:null,error:{message:'Demo account passwords are fixed in local mode'}}}
};
async function localRpc(name:string,p:any={}){try{
 const id=p.p_id||crypto.randomUUID(),current=uid();if(!current)throw Error('Please sign in');
 switch(name){
 case 'next_transaction_number':return {data:await backend.nextTransactionNumber(p.p_prefix),error:null};
 case 'complete_first_login':return {data:true,error:null};
 case 'add_expense_category':return {data:await backend.addExpenseCategory(p.p_account,p.p_name),error:null};
 case 'attach_cash_proof':await backend.attachProof(p.p_id,p.p_path);break;
 case 'create_cash_transaction_v3':await backend.createCash({id,account:p.p_account,kind:p.p_kind,amount:p.p_amount,category:p.p_category,description:p.p_description,signature:p.p_signature,proof:p.p_proof,transactionDate:p.p_transaction_date,payee:p.p_payee,vatType:p.p_vat_type,cashVoucherNo:p.p_cash_voucher_no,receiptNo:p.p_receipt_no,tinNo:p.p_tin_no,notes:p.p_notes,vehicleUnit:p.p_vehicle_unit,plateNumber:p.p_plate_number,quantity:p.p_quantity,unitCost:p.p_unit_cost,branchId:p.p_branch_id,status:'Pending for Approval',createdAt:now(),actor:current,events:[]} as any);break;
 case 'create_pos_v3':await backend.createPos({id,client:p.p_client,phone:p.p_phone,vehicle:p.p_vehicle,vehicleYear:p.p_vehicle_year,vehicleBrand:p.p_vehicle_brand,vehicleModel:p.p_vehicle_model,plate:p.p_plate,concern:p.p_concern,items:p.p_items,payments:p.p_payments,costs:p.p_costs,status:'Pending',createdAt:now()} as any);break;
 case 'close_pos':await backend.closePos(id);break;
 case 'add_pos_payment_v3':await backend.addPosPayment(id,p.p_amount,p.p_method,p.p_reference,p.p_card_type,p.p_terminal_fee);break;
 case 'add_pos_additional':await backend.addPosAdditional(id,p.p_items,p.p_cogs);break;
 case 'set_pos_cogs_items':{const list=p.p_items||[];await updateRow('pos_accounts',id,{cogs_items:list,costs:list.reduce((v:number,x:any)=>v+Number(x.qty||0)*Number(x.unitCost||0),0)});break}
 case 'review_cash':await backend.reviewCash(id,p.p_action,p.p_note);break;
 case 'explain_cash':await backend.reviewCash(id,'explain',p.p_note);break;
 case 'save_my_signature':await updateRow('profiles',current,{saved_signature_path:p.p_path});break;
 case 'upsert_supplier':{const list=await rows('suppliers');const key=p.p_id||crypto.randomUUID();const r={id:key,name:p.p_name||p.p_supplier_name,contact_person:p.p_contact_person||'',phone:p.p_phone||'',email:p.p_email||'',address:p.p_address||'',notes:p.p_notes||'',is_active:true};const i=list.findIndex(x=>x.id===key);if(i>=0)list[i]={...list[i],...r};else list.push(r);await writeRows('suppliers',list);await audit('SUPPLIER SAVE',key);break}
 case 'set_supplier_active':await updateRow('suppliers',p.p_id,{is_active:p.p_active});break;
 case 'add_vehicle_brand':case 'add_vehicle_model':case 'add_vehicle_year':{
  const table=name.replace('add_','')+'s';await addRow(table,{id:crypto.randomUUID(),name:p.p_name,...p,created_at:now()});break}
 case 'update_vehicle_brand':case 'update_vehicle_model':case 'update_vehicle_year':{
  const table=name.replace('update_','')+'s';await updateRow(table,p.p_id,{name:p.p_name,...p});break}
 case 'submit_daily_count':{
  const user=(await rows('profiles')).find(x=>x.id===current);const day=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Manila',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  const account=p.p_account;const other=(await rows('cash_transactions')).filter(x=>x.account===account&&x.branch_id===user?.branch_id);const expected=other.reduce((n,x)=>n+(x.kind==='Additional Funds'?Number(x.amount):-Number(x.amount)),0);if((await rows('daily_cash_counts')).some(x=>x.cash_account===account&&x.count_type===p.p_type&&x.business_date===day&&x.branch_id===user?.branch_id))throw Error('Daily count already submitted');
  await addRow('daily_cash_counts',{id:crypto.randomUUID(),cash_account:account,count_type:p.p_type,actual:p.p_actual,expected,difference:Number(p.p_actual)-expected,signature_path:p.p_signature,explanation:p.p_explanation,branch_id:user?.branch_id,business_date:day,created_at:now(),actor_id:current});await audit('DAILY COUNT',account,{type:p.p_type});break}
 case 'submit_fund_turnover':case 'submit_sales_turnover':{
  const table=name==='submit_fund_turnover'?'fund_turnovers':'daily_sales_handovers';const user=(await rows('profiles')).find(x=>x.id===current);await addRow(table,{id:p.p_id||crypto.randomUUID(),branch_id:user?.branch_id,cashier_id:current,created_at:now(),business_date:now().slice(0,10),actual_cash:p.p_actual??p.p_actual_cash,received_by:p.p_received_by,remarks:p.p_remarks,signature_path:p.p_signature,proof_path:p.p_proof,status:'Pending for Approval'});await audit(name,id);break}
 case 'submit_cash_incident':{
  const user=(await rows('profiles')).find(x=>x.id===current);await addRow('cash_incident_reports',{id:crypto.randomUUID(),branch_id:user?.branch_id,cash_account:p.p_account,incident_type:p.p_type,business_date:p.p_date,reason:p.p_reason,signature_path:p.p_signature,status:'Pending',created_at:now(),actor_id:current});break}
 case 'review_cash_incident':case 'review_branch_discrepancy':{
  if(current!=='admin')throw Error('Only Admin can review this request in the local demo');await updateRow(name==='review_cash_incident'?'cash_incident_reports':'branch_discrepancies',id,{status:p.p_action,review_note:p.p_note,reviewed_by:current,reviewed_at:now()});break}
 case 'create_cash_reconciliation':{
  if(current!=='admin')throw Error('Admin only');await addRow('cash_reconciliations',{id:crypto.randomUUID(),account:p.p_account,actual:p.p_actual,note:p.p_note,created_at:now(),actor_id:current});break}
 case 'request_correction':{
  await addRow('correction_requests',{id:crypto.randomUUID(),entity_type:p.p_type,entity_id:id,reason:p.p_reason,changes:p.p_changes,status:'Pending',requested_by:current,requested_at:now()});break}
 case 'review_correction':{
  if(current!=='admin')throw Error('Only Admin can approve corrections in the local demo');await updateRow('correction_requests',p.p_request,{status:p.p_approve?'Approved':'Rejected',review_note:p.p_note,reviewed_by:current});break}
 case 'apply_correction':{
  const req=(await rows('correction_requests')).find(x=>x.id===p.p_request);if(!req||req.status!=='Approved')throw Error('Approved correction required');await updateRow('correction_requests',req.id,{status:'Applied',signature_path:p.p_signature,applied_at:now()});await audit('APPLY CORRECTION',req.entity_id);break}
 case 'request_rfp_edit':{
  if(current!=='pbacc')throw Error('Only PB can request RFP edits');const source=(await rows('cash_transactions')).find(x=>x.id===p.p_cash_id);if(!source||source.account!=='Funds'||source.kind!=='Expense')throw Error('RFP parts record required');if(!p.p_reason||p.p_reason.trim().length<10)throw Error('Reason requires at least 10 characters');if((await rows('rfp_edit_requests')).some(x=>x.cash_id===p.p_cash_id&&x.status==='Pending'))throw Error('Existing pending request');await addRow('rfp_edit_requests',{id:crypto.randomUUID(),cash_id:p.p_cash_id,requested_by:current,reason:p.p_reason,proposed:p.p_proposed,original:source,status:'Pending',created_at:now()});break}
 case 'review_rfp_edit':{
  if(current!=='admin')throw Error('Only Admin can approve in three-account local demo');const req=(await rows('rfp_edit_requests')).find(x=>x.id===p.p_request_id);if(!req||req.status!=='Pending')throw Error('Pending request required');if(p.p_action==='approve'){
   const original=(await rows('cash_transactions')).find(x=>x.id===req.cash_id);if(!original)throw Error('Original record missing');const changed={...req.proposed};const links=(await rows('rfp_parts_pos_links')).filter(x=>x.cash_transaction_id===req.cash_id);if(links.length&&(changed.plate_number!==original.plate_number||changed.branch_id!==original.branch_id))throw Error('Unlink/reconcile attached POS before changing branch or plate');changed.amount=Number(changed.quantity)*Number(changed.unit_cost);await updateRow('cash_transactions',req.cash_id,changed);
  }await updateRow('rfp_edit_requests',req.id,{status:p.p_action==='approve'?'Approved':'Rejected',review_note:p.p_note,reviewed_at:now(),reviewed_by:current});await audit('RFP EDIT REVIEW',req.cash_id,{action:p.p_action});break}
 case 'submit_rfp_disbursement_request_v3':{
  if(current!=='pbacc')throw Error('Only PB can submit RFP disbursement');const expenses=(await rows('cash_transactions')).filter(x=>(p.p_expense_ids||[]).includes(x.id));if(expenses.length!==(p.p_expense_ids||[]).length)throw Error('Invalid RFP expenses');await addRow('rfp_disbursement_requests',{id:p.p_id,branch_id:expenses[0]?.branch_id||null,requested_by:current,request_date:now().slice(0,10),period_start:expenses.reduce((v,x)=>v<x.transaction_date?v:x.transaction_date,now().slice(0,10)),period_end:now().slice(0,10),amount_requested:expenses.reduce((n,x)=>n+Number(x.amount),0),total_expenses:expenses.reduce((n,x)=>n+Number(x.amount),0),expense_count:expenses.length,signature_path:p.p_signature_path,pdf_path:p.p_report_pdf_path,receipts_pdf_path:p.p_receipts_pdf_path,check_deposit:p.p_check_deposit,notes:p.p_notes,status:'Pending Verification',created_at:now()});break}
 case 'review_rfp_disbursement_request_v2':{
  if(current!=='admin')throw Error('Only Admin can review in local three-account demo');const map:any={verify:'Verified',approve:'Approved',release:'Released',reject:'Rejected'};if(!map[p.p_action])throw Error('Invalid review action');await updateRow('rfp_disbursement_requests',id,{status:map[p.p_action],review_note:p.p_note,reviewed_by:current,reviewed_at:now()});break}
 case 'request_sales_edit':case 'review_sales_edit':case 'request_sales_branch_change':case 'review_sales_branch_change':case 'explain_sales_edit':throw Error('Sales are read-only. PB corrections are requested in RFP.');
 case 'reset_test_financial_data':{
  if(current!=='admin')throw Error('Admin only');for(const table of ['cash_transactions','pos_accounts','daily_cash_counts','fund_turnovers','daily_sales_handovers','rfp_edit_requests','rfp_disbursement_requests'])await writeRows(table,[]);break}
 
 default:throw Error(`Local workflow not implemented: ${name}`);
 }
 return {data:true,error:null};
 }catch(e:any){return {data:null,error:{message:String(e?.message||e)}}}}
const storage={from(_bucket:string){return {async upload(path:string,blob:Blob){await putFile(path,blob);return {data:{path},error:null}},async createSignedUrl(path:string){const blob=await getFile(path);return {data:blob?{signedUrl:URL.createObjectURL(blob)}:null,error:blob?null:{message:'File missing'}}},async download(path:string){const blob=await getFile(path);return {data:blob||null,error:blob?null:{message:'File missing'}}}}}};
export const supabase:any={auth:localAuth,from:(table:string)=>new Query(table),rpc:localRpc,storage};
