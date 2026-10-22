"use client";
import {useEffect,useMemo,useState} from "react";
import {LayoutDashboard,FolderOpen,Workflow,Wallet,CalendarCheck,HandCoins,FileWarning,Laptop,Landmark,ListTodo,Files,SlidersHorizontal,ScrollText,Settings,ClipboardList,Menu,X,LogOut,Bell,ChevronRight,Users,CheckCircle2,Clock3,ShieldCheck,LockKeyhole,Building2,Eye,EyeOff,Info,ClipboardCheck,FileUp,HardDrive,FileSpreadsheet,FilePenLine} from "lucide-react";
import EmployeeWorkspace from "../components/EmployeeWorkspace";
import {FORM_STORE_KEY,FORM_STORE_EVENT,readForms,canViewForm} from "../lib/hrForms";
import MsKateApprovalWorkspace from "../components/MsKateApprovalWorkspace";
import {KATE_ROLE,DEMO_APPROVAL_REQUESTS,getApprovalStatus,readDecisionStore} from "../lib/finalApproval";
import {readAuditEvents,watchAuditEvents,type AuditEvent} from "../lib/auditTrail";
import AuditLogWorkspace from "../components/AuditLogWorkspace";
import {HRProvider,useHR} from "../lib/hrState";
import AssetWorkspace from "../components/AssetWorkspace";
import PayrollOperationsHub from "../components/PayrollOperationsHub";
import PayrollCutoffAlertPublisher from "../components/PayrollCutoffAlertPublisher";
import DocumentOperationsHub from "../components/DocumentOperationsHub";
import DocumentIntake from "../components/DocumentIntake";
import DashboardExtras from "../components/DashboardExtras";
import DashboardOverview from "../components/DashboardOverview";
import HelpButton from "../components/HelpButton";
import RecruitmentWorkspace from "../components/RecruitmentWorkspace";
import LeaveManagementWorkspace from "../components/LeaveManagementWorkspace";
import ComplianceWorkspace from "../components/ComplianceWorkspace";
import {activity,branches,demoAccounts,modules,permissions,HIDDEN_SIDEBAR_MODULES,isAuditAdmin,type Branch,type ModuleId,type Role} from "../lib/mock";
import {RequestReportsWorkspace,UnifiedReportsWorkspace,ToolsWorkspace} from "../components/GroupedWorkspace";
import {ModuleAlertsProvider,ModuleAlertButton,ModuleAlertSummary,DashboardModuleAlerts,UniversalNotificationCenter,useModuleAlerts} from "../components/ModuleAlerts";
import {visibleAlerts,dashboardAlertCounts} from "../lib/moduleAlertViews";
const icons={LayoutDashboard,ShieldCheck,FolderOpen,Workflow,Wallet,CalendarCheck,HandCoins,FileWarning,Laptop,Landmark,ListTodo,Files,SlidersHorizontal,ScrollText,Settings,ClipboardList,ClipboardCheck,FileUp,HardDrive,FileSpreadsheet,FilePenLine};
type User={username:string;role:Role};
const DEMO_SESSION_KEY="ucmm-hr-demo-login-v1";
const DEMO_SESSION_MAX_MS=7*24*60*60*1000;
const DEMO_IDLE_MS=30*60*1000;
// Browser-only UX convenience; NOT an authentication or access-control mechanism.
function getDemoSession():User|null{
 try{const raw=window.localStorage.getItem(DEMO_SESSION_KEY);if(!raw)return null;
 const item=JSON.parse(raw) as {username:string;role:Role;createdAt:number;lastActive:number};
 const account=demoAccounts.find(a=>a.username===item.username&&a.role===item.role);
 if(!account||!Number.isFinite(item.createdAt)||!Number.isFinite(item.lastActive)||Date.now()-item.createdAt>DEMO_SESSION_MAX_MS||Date.now()-item.lastActive>DEMO_IDLE_MS||item.createdAt>Date.now()+60000){window.localStorage.removeItem(DEMO_SESSION_KEY);return null;}
 return {username:account.username,role:account.role};
 }catch{return null;}
}
function persistDemoSession(user:User){try{const existing=window.localStorage.getItem(DEMO_SESSION_KEY);let createdAt=Date.now();if(existing){const parsed=JSON.parse(existing);if(parsed.username===user.username&&Number.isFinite(parsed.createdAt))createdAt=parsed.createdAt;}window.localStorage.setItem(DEMO_SESSION_KEY,JSON.stringify({...user,createdAt,lastActive:Date.now()}));}catch{}}

export default function Home(){return <HRProvider><ModuleAlertsProvider><PayrollCutoffAlertPublisher/><HRApp/></ModuleAlertsProvider></HRProvider>}
function HRApp(){
 const [user,setUser]=useState<User|null>(null),[sessionReady,setSessionReady]=useState(false),[username,setUsername]=useState(""),[password,setPassword]=useState(""),[showPassword,setShowPassword]=useState(false),[loginError,setLoginError]=useState("");
 const [auditRecords,setAuditRecords]=useState<AuditEvent[]>([]);
 const [requestTab,setRequestTab]=useState<"forms"|"incidents">("forms");
 const [reportsTab,setReportsTab]=useState<"reports"|"demographics">("reports");
 const [toolsTab,setToolsTab]=useState<"drive"|"spreadsheets"|"library">("drive");
 const [assetPrefill,setAssetPrefill]=useState(""),[payrollPrefill,setPayrollPrefill]=useState(""),[page,setPage]=useState<ModuleId>("dashboard"),[branch,setBranch]=useState<Branch>("All Shops"),[menu,setMenu]=useState(false),[signatureName,setSignatureName]=useState(""),[toast,setToast]=useState("");
 const {data,reset}=useHR();
 const {registry,clear:clearAlerts,publish:publishAlerts}=useModuleAlerts();
 useEffect(()=>{const saved=getDemoSession();if(saved){setUser(saved);if(saved.role==="BM")setBranch("UC Mandaluyong");if(saved.role===KATE_ROLE)setPage("final-approvals");}setSessionReady(true);},[]);
 useEffect(()=>{if(!user)return;const touch=()=>{const saved=getDemoSession();if(!saved){setUser(null);clearAlerts();return;}persistDemoSession(saved);};const onVisibility=()=>{if(document.visibilityState==="visible")touch();};const interval=window.setInterval(()=>{if(!getDemoSession()){setUser(null);clearAlerts();}},60000);window.addEventListener("pointerdown",touch);window.addEventListener("keydown",touch);document.addEventListener("visibilitychange",onVisibility);return ()=>{window.clearInterval(interval);window.removeEventListener("pointerdown",touch);window.removeEventListener("keydown",touch);document.removeEventListener("visibilitychange",onVisibility);};},[user,clearAlerts]);
 useEffect(()=>{setAuditRecords(readAuditEvents());return watchAuditEvents(()=>setAuditRecords(readAuditEvents()))},[]);
 useEffect(()=>{
  const updateKateAlerts=()=>{
   const rows=user?.role===KATE_ROLE?DEMO_APPROVAL_REQUESTS.filter(req=>getApprovalStatus(req,readDecisionStore())==="Pending Ms Kate Approval").map(req=>({id:`kate-${req.id}`,title:`Final approval required: ${req.id}`,detail:`${req.category} · ${req.source} demo`,branch:req.branch,level:"urgent" as const})):[];
   publishAlerts("final-approvals",rows,"ms-kate-demo");
  };
  updateKateAlerts();window.addEventListener("uc-hr-final-approval-changed",updateKateAlerts);
  const onStorage=(event:StorageEvent)=>{if(event.key==="uc-hr-final-approval-demo-decisions-v1")updateKateAlerts()};
  window.addEventListener("storage",onStorage);
  return()=>{window.removeEventListener("uc-hr-final-approval-changed",updateKateAlerts);window.removeEventListener("storage",onStorage)};
 },[user?.role,publishAlerts]);
 useEffect(()=>{publishAlerts("employees",(!user||!permissions[user.role].includes("employees"))?[]:data.people.flatMap(p=>p.documents.filter(d=>d.status==="Submitted").map(d=>({id:`docs-${p.id}-${d.name}`,title:`Verify document: ${p.name}`,detail:`${d.name} · ${p.id}`,branch:p.branch,level:"normal" as const}))));publishAlerts("assets",(!user||!permissions[user.role].includes("assets"))?[]:data.assets.filter(a=>["Pending Turnover","Inspection","For Return"].includes(a.status)).map(a=>({id:`asset-${a.id}`,title:`${a.name} · ${a.status}`,detail:a.id,branch:a.homeBranch||data.people.find(p=>p.id===a.employeeId)?.branch||"Unassigned",level:a.status==="Pending Turnover"?"urgent":"normal"})));publishAlerts("documents",(!user||!permissions[user.role].includes("documents"))?[]:data.submissions.filter(x=>x.status==="Pending HR Review").map(x=>({id:`doc-${x.id}`,title:`Document awaiting verification`,detail:`${x.type} · ${x.employeeId}`,branch:data.people.find(p=>p.id===x.employeeId)?.branch||"Unassigned",level:"normal"})));},[data,publishAlerts,user?.role]);
 useEffect(()=>{
  const syncFormAlerts=()=>{
   const entries=user?readForms().filter(r=>canViewForm(r,user.username,user.role,branch)).filter(r=>r.status==="Submitted"&&(user.role==="HR"||user.role==="Super Admin"||user.role==="Special Final Approver — Ms Kate")&&r.requestor!==user.username||r.status==="Returned for Revision"&&r.requestor===user.username).map(r=>({id:`hrform-${r.id}`,title:r.status==="Submitted"?`Review form: ${r.kind}`:`Revise form: ${r.kind}`,detail:`${r.id} · ${r.employeeId}`,branch:r.branch,level:"normal" as const})):[];
   publishAlerts("hr-forms",entries,"hr-forms-queue");
  };
  syncFormAlerts();window.addEventListener(FORM_STORE_EVENT,syncFormAlerts);
  const onStored=(e:StorageEvent)=>{if(e.key===FORM_STORE_KEY)syncFormAlerts()};window.addEventListener("storage",onStored);
  return()=>{window.removeEventListener(FORM_STORE_EVENT,syncFormAlerts);window.removeEventListener("storage",onStored)};
 },[user?.username,user?.role,branch,publishAlerts]);
 const available=useMemo(()=>modules.filter(m=>user&&permissions[user.role].includes(m.id)),[user]);
 const visibleNavigation=useMemo(()=>available.filter(m=>!HIDDEN_SIDEBAR_MODULES.includes(m.id)),[available]);
 const dashboardCounts=dashboardAlertCounts(registry,available.map(m=>m.id),branch);
 const countFor=(id:ModuleId)=>id==="requests-reports"?visibleAlerts(registry,"hr-forms",branch).length+visibleAlerts(registry,"ir",branch).length:visibleAlerts(registry,id,branch).length;
 const parentFor=(id:ModuleId):ModuleId=>id==="hr-forms"||id==="ir"?"requests-reports":id==="filters"||id==="demographics"?"reports-analytics":id==="drive"||id==="spreadsheets"||id==="studio"?"tools":id;
 const flash=(s:string)=>{setToast(s);setTimeout(()=>setToast(""),3500)};
 const navigate=(id:ModuleId)=>{if(!user||!permissions[user.role].includes(id)){flash("You do not have permission to open this module.");return;}
  if(id==="hr-forms"||id==="ir")setRequestTab(id==="ir"?"incidents":"forms");
  if(id==="filters"||id==="demographics")setReportsTab(id==="demographics"?"demographics":"reports");
  if(id==="drive"||id==="spreadsheets"||id==="studio")setToolsTab(id==="spreadsheets"?"spreadsheets":id==="studio"?"library":"drive");
  setPage(parentFor(id));setMenu(false)};
 function login(e:React.FormEvent){e.preventDefault();const found=demoAccounts.find(a=>a.username===username.trim()&&a.password===password);if(!found){setLoginError("Invalid username or password.");return}setUser({username:found.username,role:found.role});persistDemoSession({username:found.username,role:found.role});setLoginError("");setPassword("");setPage(found.role===KATE_ROLE?"final-approvals":"dashboard");setBranch(found.role==="BM"?"UC Mandaluyong":"All Shops")} const fillDemoAccount=(account:(typeof demoAccounts)[number])=>{setUsername(account.username);setPassword(account.password);setLoginError("");setShowPassword(false)}
 if(!sessionReady)return <main className="login-page" aria-label="Restoring review session"><div className="session-loading">Restoring review workspace…</div></main>;
 if(!user)return <main className="login-page"><div className="login-grid"><div className="login-brand"><div className="brand-mark large">UC</div><span className="eyebrow">HUMAN RESOURCES • PWA</span><h1>Human Resources Management</h1><p>Internal staff portal for all authorized branches.</p><div className="brand-tags"><span>UC Mandaluyong</span><span>UC Las Piñas</span><span>UC Quezon City</span><span>MM Mandaluyong</span></div></div><section className="login-card"><div className="mobile-brand"><div className="brand-mark">UC</div><b>Underchargers HR</b></div><div className="login-heading"><span className="eyebrow">UNDERCHARGERS • HR MANAGEMENT</span><h2>Welcome back</h2><p>Sign in to explore the role-based HR workspace.</p></div><form onSubmit={login} className="form"><label htmlFor="username">Username</label><input id="username" autoComplete="username" value={username} onChange={e=>setUsername(e.target.value)} placeholder="Enter username" required/><label htmlFor="password">Password</label><div className="password"><input id="password" type={showPassword?"text":"password"} autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Enter password" required/><button type="button" aria-label="Toggle password visibility" onClick={()=>setShowPassword(!showPassword)}>{showPassword?<EyeOff size={18}/>:<Eye size={18}/>}</button></div>{loginError&&<div className="error" role="alert">{loginError}</div>}<button className="primary full" type="submit">Sign in <ChevronRight size={17}/></button></form><a className="public-login-cta" href="/report" style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginTop:18,padding:"12px 16px",border:"1px solid #e7d18c",borderRadius:9,background:"#fff9e9",textDecoration:"none",color:"#624e16",fontSize:12,fontWeight:700}}><FileWarning size={16}/> Workplace concern / incident report · No login required <ChevronRight size={15}/></a><a className="public-login-cta" href="/apply" style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginTop:9,padding:"12px 16px",border:"1px solid #e4e9f1",borderRadius:9,background:"#f8fafc",textDecoration:"none",color:"#334155",fontSize:12,fontWeight:700}}><Users size={16}/> Apply for a job · No login required <ChevronRight size={15}/></a><div className="demo-box"><b><Info size={15}/> Demo accounts — click to fill</b><div className="demo-account-grid">{demoAccounts.map(account=><button key={account.username} type="button" className="demo-account-button" onClick={()=>fillDemoAccount(account)}><span className="demo-account-role">{account.role}</span><span className="demo-account-meta">{account.username}</span></button>)}</div><small>Click a role to auto-fill the demo username and password. This is not secure authentication. No live data is stored or processed, and these demo credentials must never be used in production.</small></div></section></div></main>;
 const active=modules.find(m=>m.id===parentFor(page))!;
 const safePage=permissions[user.role].includes(page)?page:"dashboard";
 return <div className="app-shell"><a href="#main-content" className="skip-link">Skip to main content</a><aside className={`sidebar ${menu?"mobile-open":""}`}><div className="side-brand"><div className="brand-mark">UC</div><div><strong>UNDERCHARGERS</strong><small>HR MANAGEMENT PWA</small></div><button className="close-side" aria-label="Close navigation" onClick={()=>setMenu(false)}><X size={19}/></button></div><div className="side-section-label">WORKSPACE</div><nav aria-label="Main navigation">{visibleNavigation.map(m=>{const Icon=icons[m.icon];const count=countFor(m.id);return <button key={m.id} onClick={()=>navigate(m.id)} aria-current={parentFor(safePage)===m.id?"page":undefined} className={`nav-link ${parentFor(safePage)===m.id?"selected":""}`}><Icon size={18}/><span>{m.name}</span>{count>0&&<span className="nav-count uc-action-badge">{count}</span>}</button>})}</nav><div className="sidebar-bottom"><div className="demo-state"><span className="status-dot"/> Review workspace · Local-only records</div><div className="sidebar-account"><div className="avatar">{user.username.slice(0,2).toUpperCase()}</div><div className="who"><b>{user.username}</b><span>{user.role}</span></div><button aria-label="Sign out" title="Sign out" onClick={()=>{window.localStorage.removeItem(DEMO_SESSION_KEY);setUser(null);setMenu(false);setUsername("");clearAlerts()}}><LogOut size={18}/></button></div></div></aside>{menu&&<button className="scrim" aria-label="Close menu" onClick={()=>setMenu(false)}/>}<div className="workspace"><header className="topbar"><button className="menu-toggle" aria-label="Open navigation" onClick={()=>setMenu(true)}><Menu size={22}/></button><div className="crumb">Workspace <ChevronRight size={14}/> <b>{active.name}</b></div><div className="top-actions"><UniversalNotificationCenter current={page} branch={branch} allowed={available.map(m=>m.id)} onNavigate={navigate}/><label className="branch-picker"><Building2 size={16}/><select aria-label="Select shop or branch" value={branch} onChange={e=>setBranch(e.target.value as Branch)}>{branches.filter(b=>user.role!=="BM"||b==="UC Mandaluyong").map(b=><option key={b}>{b}</option>)}</select></label></div></header><main id="main-content" className="content">
 {page==="dashboard"&&<><DashboardOverview branch={branch} role={user.role} username={user.username} onNavigate={navigate}/><DashboardExtras role={user.role} branch={branch} onNavigate={navigate}/><DashboardModuleAlerts branch={branch} onNavigate={navigate} allowed={available.map(m=>m.id)}/><section className="panel"><div className="panel-head"><div><h3>Sample Activity (Demo)</h3><p>Illustrative entries only · not a live audit feed</p></div></div>{activity.map(a=><div className="activity-row" key={`${a.module}|${a.text}|${a.date}|${a.user}`}><div className="activity-dot"/><div><b>{a.text}</b><small>{a.module} · {a.user} · {a.date}</small></div></div>)}{isAuditAdmin(user.role)&&<button className="secondary" onClick={()=>navigate("audit")}>Open Audit History</button>}</section></>}
 {page==="final-approvals"&&<MsKateApprovalWorkspace role={user.role} username={user.username} branch={branch}/>}
 {page==="employees"&&<EmployeeWorkspace branch={branch} role={user.role} onAssignDevice={id=>{setAssetPrefill(id);navigate("assets")}} onOpenPayroll={id=>{setPayrollPrefill(id);navigate("payroll")}}/>}
 {safePage==="reports-analytics"&&<UnifiedReportsWorkspace branch={branch} role={user.role} tab={reportsTab} setTab={setReportsTab}/>}
 {safePage==="requests-reports"&&<RequestReportsWorkspace branch={branch} role={user.role} username={user.username} tab={requestTab} setTab={setRequestTab}/>}
 {page==="lifecycle"&&<RecruitmentWorkspace branch={branch} role={user.role}/>}
 {page==="documents"&&<DocumentOperationsHub branch={branch} role={user.role}/>}
 {page==="submissions"&&<DocumentIntake branch={branch} role={user.role}/>}
 {page==="payroll"&&<PayrollOperationsHub branch={branch} role={user.role} initialEmployeeId={payrollPrefill}/>}
 {safePage==="tools"&&<ToolsWorkspace tab={toolsTab} setTab={setToolsTab}/>}
 
 {page==="compliance"&&<ComplianceWorkspace branch={branch} role={user.role}/>}
 {page==="leave"&&<LeaveManagementWorkspace branch={branch} role={user.role}/>}
 {page==="assets"&&<AssetWorkspace branch={branch} role={user.role} prefillEmployeeId={assetPrefill}/> }
 {safePage==="audit"&&isAuditAdmin(user.role)&&<AuditLogWorkspace events={auditRecords} viewerRole={user.role}/>}
 {page==="settings"&&<><div className="rev-title"><h3>Account & Security</h3><HelpButton topic="administration" label="Account access guide"/></div><div className="settings-grid"><section className="panel"><h3>My Account</h3><div className="profile-row"><div className="avatar big">{user.username.slice(0,2).toUpperCase()}</div><div><b>{user.username}</b><p>{user.role} · {branch}</p></div></div><div className="setting-line"><span>Authentication</span><b>Review-only</b></div><div className="setting-line"><span>Multi-factor authentication</span><b>Future phase</b></div><div className="setting-line"><span>Account status</span><b>Preview</b></div></section><section className="panel"><h3>Local Review Records</h3><p className="muted">Frontend review records are stored locally on this browser, not in a secure database. Do not enter real confidential employee information.</p><p className="muted"><b>35 employees · 50 devices · 20 hiring applicants · 15 leave requests · September–October attendance.</b> If old records remain after deployment, load the coordinated demo scenario below. This overwrites browser-only sample records, not any remote database.</p><button className="secondary" type="button" onClick={()=>{if(window.confirm("Replace all browser-only demo records with the 35 employee / 50 device scenario, plus leave and hiring samples? Any local review edits will be lost.")){["recruitment","hiring-forms","leave","leave-credit-requests","loans","incident","compliance"].forEach(k=>window.localStorage.removeItem(`uc-hr-ui-${k}`));["uc-hr-demo-leaves-oct13-v2-seeded","uc-hr-demo-leaves-35-v1"].forEach(k=>window.localStorage.removeItem(k));window.localStorage.removeItem(FORM_STORE_KEY);clearAlerts();reset();window.location.reload()}}}>Load 35 Employees + 50 Devices Demo Scenario</button><button className="secondary" onClick={()=>{if(window.confirm("Reset all local review records on this browser, including interviews, leave, incidents and compliance?")){reset();["recruitment","hiring-forms","leave","leave-credit-requests","loans","incident","compliance"].forEach(k=>window.localStorage.removeItem(`uc-hr-ui-${k}`));window.localStorage.removeItem(FORM_STORE_KEY);clearAlerts();window.location.reload()}}}>Reset Sample Records</button></section><section className="panel"><h3>Signature Preview Settings</h3><p className="muted">Saved HR signatures require authenticated ownership, approval and private storage in a later phase.</p><label className="field-label">Display name for signature preview</label><input value={signatureName} placeholder="Enter authorized name" onChange={e=>setSignatureName(e.target.value)}/><div className="signature-preview">{signatureName||"Signature preview"}</div><button className="primary" onClick={()=>flash("Signature preview only; nothing was saved.")}>Preview signature <ChevronRight size={16}/></button></section></div></>}
 </main></div>{toast&&<div className="toast" role="status">{toast}</div>}</div>
}
