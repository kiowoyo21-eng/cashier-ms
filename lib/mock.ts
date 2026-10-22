export type Role = "Super Admin" | "HR" | "BM" | "Special Final Approver — Ms Kate";
export const isHrRole=(role:Role):boolean=>role==="HR"||role==="Special Final Approver — Ms Kate";
export type Branch = "All Shops" | "UC Mandaluyong" | "UC Las Piñas" | "UC Quezon City" | "MM Mandaluyong";
export const branches: Branch[] = ["All Shops","UC Mandaluyong","UC Las Piñas","UC Quezon City","MM Mandaluyong"];
export const modules = [
 {id:"dashboard",name:"Dashboard",icon:"LayoutDashboard",count:0},
 {id:"final-approvals",name:"Ms Kate Approvals",icon:"ShieldCheck",count:0},
 {id:"lifecycle",name:"Recruitment & Hiring",icon:"Workflow",count:5},
 {id:"employees",name:"Employee 201 Files",icon:"FolderOpen",count:8},
 {id:"demographics",name:"Employee Demographics",icon:"SlidersHorizontal",count:0},
 {id:"hr-forms",name:"HR Forms & Requests",icon:"ClipboardList",count:0},
 {id:"submissions",name:"Submit Employee Documents",icon:"FileUp",count:0},
 {id:"payroll",name:"Payroll Management",icon:"Wallet",count:3},
 {id:"leave",name:"Leave Management",icon:"CalendarCheck",count:2},
 {id:"requests-reports",name:"Request and Reports",icon:"ClipboardList",count:0},
 {id:"ir",name:"Incident Reports",icon:"FileWarning",count:4},
 {id:"assets",name:"Assets & Devices",icon:"Laptop",count:2},
 {id:"compliance",name:"Government Compliance",icon:"Landmark",count:7},
 {id:"reports-analytics",name:"Reports & Analytics",icon:"SlidersHorizontal",count:0},
 {id:"documents",name:"Employee Documents",icon:"Files",count:0},
 {id:"tools",name:"Tools",icon:"FolderOpen",count:0},
 {id:"filters",name:"Reports & Analytics",icon:"SlidersHorizontal",count:0},
 {id:"drive",name:"HRMS Drive",icon:"HardDrive",count:0},
 {id:"spreadsheets",name:"Spreadsheets",icon:"FileSpreadsheet",count:0},
 {id:"studio",name:"Document Library",icon:"FilePenLine",count:0},
 {id:"audit",name:"Audit Logs",icon:"ScrollText",count:2},
 {id:"settings",name:"Settings",icon:"Settings",count:0}
] as const;
export type ModuleId = typeof modules[number]["id"] | "loans"; // internal legacy alert key; loans workspace now belongs under payroll
const HR_MODULES:ModuleId[]=["dashboard","lifecycle","employees","demographics","hr-forms","requests-reports","reports-analytics","tools","payroll","leave","ir","assets","compliance","documents","filters","drive","spreadsheets","studio","settings"];
/** Legacy module IDs remain routable for notification actions and existing workflows. */
export const HIDDEN_SIDEBAR_MODULES:readonly ModuleId[]=["demographics","hr-forms","ir","filters","drive","spreadsheets","studio"];
export const isAuditAdmin=(role:Role):boolean=>role==="Super Admin";
export const permissions: Record<Role, ModuleId[]> = {
 "Super Admin":modules.map(m=>m.id),
 "HR":HR_MODULES,
 "BM": ["dashboard","submissions","hr-forms","requests-reports","lifecycle","leave","ir","settings"],
 "Special Final Approver — Ms Kate": [...HR_MODULES,"final-approvals"]
};
export const demoAccounts = [{username:"admin",password:"admin12345",role:"Super Admin" as Role},{username:"hraccount",password:"hraccount12345",role:"HR" as Role},{username:"bmaccount",password:"bm12345",role:"BM" as Role},{username:"mskate",password:"mskate-demo12345",role:"Special Final Approver — Ms Kate" as Role}];
export const activity=[
 {module:"Payroll",text:"Payroll calculation preview requested",user:"HR Sample",date:"Oct 11, 2026"},
 {module:"Employee 201",text:"Onboarding requirement flagged",user:"HR Sample",date:"Oct 10, 2026"},
 {module:"Incident Reports",text:"Case assigned to Branch Manager",user:"System Example",date:"Oct 09, 2026"}
];
