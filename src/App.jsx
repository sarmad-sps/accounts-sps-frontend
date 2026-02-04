// import React, { useMemo, useState, useEffect } from "react";
// import { 
//   LayoutDashboard, ArrowDownCircle, ArrowUpCircle, Users, 
//   Wallet, CalendarDays, Settings as SettingsIcon,
//   ClipboardList, LogOut, ChevronRight, Bell, BookOpen
// } from "lucide-react";
// import spLogo from "./assets/splogo.png";
// import securPathLogo from "./assets/securpathsolution.png";
// import { api } from "./api";
// import { useAccountingStore, calcSummary } from "./store";
// import Login from "./components/Login";
// import Dashboard from "./components/Dashboard";
// import Receivings from "./components/Receivings";
// import StoreInventory from "./components/Payments"; 
// import PartyStatement from "./components/PartyStatement";
// import MonthlySummary from "./components/MonthlySummary";
// import Settings from "./components/Settings";
// import Salaries from "./components/Salaries";
// import UserReqForm from "./components/UserReqForm"; 
// import PaymentLedger from "./components/PaymentLedger";

// const TABS = [
//   { key: "dashboard",      label: "Dashboard",       icon: <LayoutDashboard size={20} />, roles: ["admin", "accountant"] },
//   { key: "receivings",     label: "Receivings",      icon: <ArrowDownCircle size={20} />, roles: ["admin", "accountant"] },
//   { key: "payments",       label: "Inventory Store", icon: <ArrowUpCircle size={20} />, roles: ["admin", "accountant", "store"] },
//   { key: "party",          label: "Parties",         icon: <Users size={20} />, roles: ["admin", "accountant"] },
//   { key: "salaries",       label: "Salaries & Payroll", icon: <Wallet size={20} />, roles: ["admin", "accountant"] },
//   { key: "payment_ledger", label: "Payment Ledger",  icon: <BookOpen size={20} />, roles: ["admin", "accountant"] },
//   { key: "monthly",        label: "Summary",         icon: <CalendarDays size={20} />, roles: ["admin", "accountant"] },
//   { key: "user_req",       label: "User Requests",   icon: <ClipboardList size={20} />, roles: ["user", "admin", "store", "accountant"], hasBadge: true },
//   { key: "settings",       label: "Settings",        icon: <SettingsIcon size={20} />, roles: ["admin"] },
// ];

// const TAB_COLORS = {
//   dashboard:      { accent: '#3b82f6', bg: 'rgba(59, 130, 246, 0.12)' },
//   receivings:     { accent: '#10b981', bg: 'rgba(16, 185, 129, 0.12)' },
//   payments:       { accent: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)' },
//   party:          { accent: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.12)' },
//   salaries:       { accent: '#06b6d4', bg: 'rgba(6, 182, 212, 0.12)' },
//   payment_ledger: { accent: '#f43f5e', bg: 'rgba(244, 63, 94, 0.12)' },
//   monthly:        { accent: '#ec4899', bg: 'rgba(236, 72, 153, 0.12)' },
//   user_req:       { accent: '#ef4444', bg: 'rgba(239, 68, 68, 0.12)' },
//   settings:       { accent: '#64748b', bg: 'rgba(100, 116, 139, 0.12)' },
// };

// export default function App() {
//   const [tabId] = useState(() => {
//     let id = sessionStorage.getItem("sps_tab_id") || "tab_" + Math.random().toString(36).substr(2, 9);
//     sessionStorage.setItem("sps_tab_id", id);
//     return id;
//   });

//   const tokenKey = `sps_token_${tabId}`;
//   const roleKey = `sps_role_${tabId}`;
//   const activeTabKey = `sps_active_tab_${tabId}`; // Key for saving tab

//   const [token, setTokenState] = useState(localStorage.getItem(tokenKey) || "");
//   const [role, setRole] = useState(localStorage.getItem(roleKey) || ""); 
//   const [notifyCount, setNotifyCount] = useState(0); 

//   // Initialize tab from localStorage
//   const [tab, setTab] = useState(() => {
//     const savedTab = localStorage.getItem(activeTabKey);
//     if (savedTab) return savedTab;

//     const savedRole = (localStorage.getItem(roleKey) || "").toLowerCase();
//     if (savedRole === "store") return "payments";
//     if (savedRole === "user") return "user_req";
//     return "dashboard";
//   });

//   const { state, actions } = useAccountingStore();
//   const summary = useMemo(() => calcSummary(state), [state]);

//   useEffect(() => {
//     const syncNotifications = () => {
//       if (tab === "user_req") { setNotifyCount(0); return; }
//       const saved = localStorage.getItem("sps_inventory_requests");
//       if (saved && role) {
//         const reqs = JSON.parse(saved);
//         const currentRole = role.toLowerCase();
//         let count = 0;
//         if (currentRole === "store") count = reqs.filter(r => r.status === "pending_store" || r.status === "approved").length;
//         else if (currentRole === "admin") count = reqs.filter(r => r.status === "pending_admin").length;
//         setNotifyCount(count);
//       }
//     };
//     syncNotifications();
//     const interval = setInterval(syncNotifications, 5000);
//     return () => clearInterval(interval);
//   }, [role, tab]);

//   const allowedTabs = useMemo(() => {
//     const currentRole = (role || "").toLowerCase();
//     return TABS.filter(t => t.roles.includes(currentRole));
//   }, [role]);

//   // Updated Tab Change Handler
//   const handleTabChange = (newTab) => { 
//     setTab(newTab); 
//     localStorage.setItem(activeTabKey, newTab); // Save to storage
//     if (newTab === "user_req") setNotifyCount(0); 
//   };

//   async function onLogin(pin) {
//     try {
//       const r = await api.login(pin, "store");
//       localStorage.setItem(tokenKey, r.token);
//       localStorage.setItem(roleKey, r.role);
//       setRole(r.role); setTokenState(r.token);
      
//       const userRole = r.role.toLowerCase();
//       const defaultTab = userRole === "store" ? "payments" : userRole === "user" ? "user_req" : "dashboard";
      
//       setTab(defaultTab);
//       localStorage.setItem(activeTabKey, defaultTab); // Save default tab on login
//     } catch (err) { alert(err.message); }
//   }

//   function logout() {
//     localStorage.removeItem(tokenKey); 
//     localStorage.removeItem(roleKey);
//     localStorage.removeItem(activeTabKey); // Clear tab on logout
//     setTokenState(""); setRole(""); 
//     window.location.reload();
//   }

//   const getRoleColor = () => {
//     const r = (role || "").toLowerCase();
//     return r === 'admin' ? '#3b82f6' : r === 'store' ? '#f59e0b' : '#10b981';
//   };

//   if (!token) return <Login onLogin={onLogin} />;

//   return (
//     <div style={{ display: "flex", height: "100vh", backgroundColor: "#f8fafc", fontFamily: "'Plus Jakarta Sans', sans-serif", overflow: "hidden" }}>
      
//       <style>{`
//         @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
//         .nav-item { transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); }
//         .nav-item:hover { background: rgba(255,255,255,0.08) !important; color: #fff !important; }
//         .nav-item:hover .icon-wrapper { transform: scale(1.1) translateX(3px); }
//         .nav-item:active { transform: scale(0.97); }
//         ::-webkit-scrollbar { width: 5px; }
//         ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
//         .sidebar-logo-container:hover { transform: translateY(-2px); }
//       `}</style>

//       {/* SIDEBAR */}
//       <nav style={{ 
//         width: "280px", 
//         backgroundColor: "#0C2C55", 
//         display: "flex", 
//         flexDirection: "column", 
//         boxShadow: "10px 0 40px rgba(0,0,0,0.15)",
//         zIndex: 50,
//         borderRight: '1px solid rgba(255,255,255,0.05)'
//       }}>
        
//         {/* LOGO SECTION */}
//         <div style={{ padding: "10px", display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, transparent 100%)', marginBottom: '10px' }}>
//           <div className="sidebar-logo-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', width: '100%', transition: 'transform 0.3s ease' }}>
//             <img src={spLogo} alt="Logo" style={{ width: '65px', filter: 'brightness(0) invert(1)' }} />
//             <img src={securPathLogo} alt="SecurPath" style={{ width: '100px', filter: 'brightness(0) invert(1)' }} />
//           </div>
//         </div>

//         {/* NAV LINKS */}
//         <div style={{ flex: 1, padding: "10px 16px", overflowY: 'auto' }}>
//           <p style={{ color: 'rgba(148, 163, 184, 0.5)', fontSize: '11px', fontWeight: '800', letterSpacing: '1.2px', textTransform: 'uppercase', margin: '0 0 15px 12px' }}>Navigation</p>

//           {allowedTabs.map((t) => {
//             const isActive = tab === t.key;
//             const colors = TAB_COLORS[t.key];
//             return (
//               <button key={t.key} onClick={() => handleTabChange(t.key)} className="nav-item" style={{
//                 width: "100%", padding: "12px 16px", marginBottom: "8px", border: "none", borderRadius: "14px",
//                 backgroundColor: isActive ? "rgba(255,255,255,0.1)" : "transparent",
//                 color: isActive ? "#ffffff" : "#94a3b8", 
//                 cursor: "pointer", display: "flex", alignItems: "center", gap: "14px", 
//                 fontSize: "14px", fontWeight: isActive ? "700" : "500",
//                 position: 'relative',
//                 border: isActive ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent'
//               }}>
//                 {isActive && (
//                   <div style={{ position: 'absolute', left: 0, top: '25%', height: '50%', width: '4px', backgroundColor: colors.accent, borderRadius: '0 4px 4px 0', boxShadow: `0 0 15px ${colors.accent}` }}></div>
//                 )}
//                 <span className="icon-wrapper" style={{ color: isActive ? colors.accent : "inherit", display: 'flex' }}>{t.icon}</span>
//                 <span style={{ flex: 1, textAlign: 'left' }}>{t.label}</span>
//                 {t.hasBadge && notifyCount > 0 && (
//                   <span style={{ background: "#ef4444", color: "white", fontSize: "10px", minWidth: "18px", height: "18px", borderRadius: "50%", display: 'grid', placeItems: 'center', fontWeight: "900", boxShadow: '0 0 12px rgba(239, 68, 68, 0.4)' }}>{notifyCount}</span>
//                 )}
//                 {isActive && <ChevronRight size={14} style={{ opacity: 0.5 }} />}
//               </button>
//             );
//           })}
//         </div>

//         {/* LOGOUT */}
//         <div style={{ padding: "20px 16px", borderTop: '1px solid rgba(255,255,255,0.05)' }}>
//           <button onClick={logout} style={{ width: "100%", padding: "14px", background: "rgba(239, 68, 68, 0.08)", color: "#f87171", border: "1px solid rgba(239, 68, 68, 0.15)", borderRadius: "14px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", fontWeight: "700" }}>
//             <LogOut size={18} /> Logout
//           </button>
//         </div>
//       </nav>

//       {/* MAIN CONTENT */}
//       <main style={{ flex: 1, overflowY: "auto", display: 'flex', flexDirection: 'column', position: 'relative' }}>
//         <header style={{ position: 'sticky', top: 0, zIndex: 40, padding: "16px 40px", backgroundColor: "rgba(255, 255, 255, 0.85)", backdropFilter: "blur(15px)", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: '1px solid #e2e8f0' }}>
//           <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
//             <div style={{ width: '45px', height: '45px', borderRadius: '14px', background: `${TAB_COLORS[tab]?.accent}15`, display: 'grid', placeItems: 'center', color: TAB_COLORS[tab]?.accent }}>
//               {TABS.find(t => t.key === tab)?.icon}
//             </div>
//             <div>
//               <h2 style={{ fontSize: "19px", fontWeight: "800", color: "#0f172a", margin: 0 }}>{TABS.find(t => t.key === tab)?.label}</h2>
//               <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Management Portal</div>
//             </div>
//           </div>

//           <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
//             <div style={{ position: 'relative', color: '#64748b', cursor: 'pointer', padding: '8px' }}>
//               <Bell size={20} />
//               {notifyCount > 0 && <span style={{ position: 'absolute', top: 6, right: 6, width: '10px', height: '10px', background: '#ef4444', borderRadius: '50%', border: '2px solid #fff' }}></span>}
//             </div>
//             <div style={{ width: '1px', height: '30px', background: '#e2e8f0' }}></div>
//             <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#fff', padding: '6px 6px 6px 16px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
//               <div style={{ textAlign: 'right' }}>
//                 <div style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a' }}>{role.toUpperCase()}</div>
//                 <div style={{ fontSize: '10px', color: '#10b981', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
//                   <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }}></div> ONLINE
//                 </div>
//               </div>
//               <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: `${getRoleColor()}15`, color: getRoleColor(), display: 'grid', placeItems: 'center', fontWeight: '900' }}>
//                 {role.charAt(0).toUpperCase()}
//               </div>
//             </div>
//           </div>
//         </header>

//         <div style={{ padding: "40px", flex: 1, animation: 'fadeIn 0.5s ease-out' }}>
//           {tab === "dashboard" && <Dashboard summary={summary} />}
//           {tab === "receivings" && <Receivings state={state} actions={actions} />}
//           {tab === "payments" && <StoreInventory state={state} actions={actions} role={role} />}
//           {tab === "payment_ledger" && <PaymentLedger state={state} actions={actions} role={role} />}
//           {tab === "party" && <PartyStatement state={state} />}
//           {tab === "salaries" && <Salaries state={state} actions={actions} />}
//           {tab === "monthly" && <MonthlySummary state={state} />}
//           {tab === "settings" && <Settings state={state} actions={actions} />}
//           {tab === "user_req" && <UserReqForm state={state} actions={actions} role={role} tabId={tabId} />}
//         </div>
//       </main>
//     </div>
//   );
// }

import React, { useMemo, useState, useEffect } from "react";
import { 
  LayoutDashboard, ArrowDownCircle, ArrowUpCircle, Users, 
  Wallet, CalendarDays, Settings as SettingsIcon,
  ClipboardList, LogOut, Menu, BookOpen
} from "lucide-react";
import spLogo from "./assets/splogo.png";
import securPathLogo from "./assets/securpathsolution.png";
import { api } from "./api";
import { useAccountingStore, calcSummary } from "./store";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Receivings from "./components/Receivings";
import StoreInventory from "./components/Payments"; 
import PartyStatement from "./components/PartyStatement";
import MonthlySummary from "./components/MonthlySummary";
import Settings from "./components/Settings";
import Salaries from "./components/Salaries";
import UserReqForm from "./components/UserReqForm"; 
import PaymentLedger from "./components/PaymentLedger";

const TABS = [
  { key: "dashboard",      label: "Dashboard",       icon: <LayoutDashboard size={20} />, roles: ["admin", "accountant"] },
  { key: "receivings",     label: "Receivings",      icon: <ArrowDownCircle size={20} />, roles: ["admin", "accountant"] },
  { key: "payments",       label: "Inventory Store", icon: <ArrowUpCircle size={20} />, roles: ["admin", "accountant", "store"] },
  { key: "party",           label: "Parties",          icon: <Users size={20} />, roles: ["admin", "accountant"] },
  { key: "salaries",       label: "Salaries & Payroll", icon: <Wallet size={20} />, roles: ["admin", "accountant"] },
  { key: "payment_ledger", label: "Payment Ledger",  icon: <BookOpen size={20} />, roles: ["admin", "accountant"] },
  { key: "monthly",         label: "Summary",          icon: <CalendarDays size={20} />, roles: ["admin", "accountant"] },
  { key: "user_req",       label: "User Requests",   icon: <ClipboardList size={20} />, roles: ["user", "admin", "store", "accountant"], hasBadge: true },
  { key: "settings",       label: "Settings",        icon: <SettingsIcon size={20} />, roles: ["admin"] },
];

const TAB_COLORS = {
  dashboard:      { accent: '#3b82f6' },
  receivings:     { accent: '#10b981' },
  payments:       { accent: '#f59e0b' },
  party:          { accent: '#8b5cf6' },
  salaries:       { accent: '#06b6d4' },
  payment_ledger: { accent: '#f43f5e' },
  monthly:        { accent: '#ec4899' },
  user_req:       { accent: '#ef4444' },
  settings:       { accent: '#64748b' },
};

export default function App() {
  const [tabId] = useState(() => {
    let id = sessionStorage.getItem("sps_tab_id") || "tab_" + Math.random().toString(36).substr(2, 9);
    sessionStorage.setItem("sps_tab_id", id);
    return id;
  });

  const tokenKey = `sps_token_${tabId}`;
  const roleKey = `sps_role_${tabId}`;
  const activeTabKey = `sps_active_tab_${tabId}`;

  const [token, setTokenState] = useState(localStorage.getItem(tokenKey) || "");
  const [role, setRole] = useState(localStorage.getItem(roleKey) || ""); 
  
  // Logic: Initial tab based on role permissions
  const [tab, setTab] = useState(() => {
    const savedTab = localStorage.getItem(activeTabKey);
    const currentRole = (localStorage.getItem(roleKey) || "").toLowerCase();
    const isAllowed = TABS.find(t => t.key === savedTab && t.roles.includes(currentRole));
    
    if (savedTab && isAllowed) return savedTab;
    
    // Default to the first allowed tab for the role
    const firstAllowed = TABS.find(t => t.roles.includes(currentRole));
    return firstAllowed ? firstAllowed.key : "dashboard";
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    const savedState = localStorage.getItem("sps_sidebar_state");
    if (window.innerWidth < 1024) return false;
    return savedState === null ? true : savedState === "true";
  });

  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) setIsSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => {
      const newState = !prev;
      if (!isMobile) localStorage.setItem("sps_sidebar_state", newState);
      return newState;
    });
  };

  const { state, actions } = useAccountingStore();
  const summary = useMemo(() => calcSummary(state), [state]);

  const allowedTabs = useMemo(() => {
    const currentRole = (role || "").toLowerCase();
    return TABS.filter(t => t.roles.includes(currentRole));
  }, [role]);

  const handleTabChange = (newTab) => { 
    setTab(newTab); 
    localStorage.setItem(activeTabKey, newTab);
    if (isMobile) setIsSidebarOpen(false);
  };

  async function onLogin(pin) {
    try {
      const r = await api.login(pin, "store");
      const userRole = r.role.toLowerCase();
      
      localStorage.setItem(tokenKey, r.token);
      localStorage.setItem(roleKey, r.role);
      
      // Auto-select first allowed tab for this role
      const firstTab = TABS.find(t => t.roles.includes(userRole));
      const initialTab = firstTab ? firstTab.key : "dashboard";

      setRole(r.role); 
      setTokenState(r.token);
      setTab(initialTab);
      localStorage.setItem(activeTabKey, initialTab);
    } catch (err) { alert(err.message); }
  }

  function logout() {
    localStorage.clear();
    window.location.reload();
  }

  const getRoleColor = () => {
    const r = (role || "").toLowerCase();
    if (r === 'admin') return '#3b82f6';
    if (r === 'store') return '#f59e0b';
    return '#10b981';
  };

  if (!token) return <Login onLogin={onLogin} />;

  return (
    <div style={{ display: "flex", height: "100vh", backgroundColor: "#f8fafc", fontFamily: "'Plus Jakarta Sans', sans-serif", overflow: "hidden" }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .nav-item { transition: all 0.2s ease; border: 1px solid transparent !important; position: relative; }
        .nav-item:hover { background: rgba(255,255,255,0.08) !important; }
        .sps-tooltip { position: absolute; left: 70px; top: 50%; transform: translateY(-50%); background: #1e293b; color: white; padding: 8px 14px; border-radius: 8px; font-size: 13px; font-weight: 500; white-space: nowrap; opacity: 0; visibility: hidden; transition: all 0.2s ease; box-shadow: 10px 0 25px rgba(0,0,0,0.3); z-index: 9999; pointer-events: none; border: 1px solid rgba(255,255,255,0.1); }
        .nav-item:hover .sps-tooltip { opacity: 1; visibility: visible; transform: translateY(-50%) translateX(10px); }
        @media (max-width: 1024px) { 
          .sidebar-fixed { position: fixed !important; left: ${isSidebarOpen ? '0' : '-100%'} !important; z-index: 2000 !important; width: 280px !important; }
          .sps-tooltip { display: none; }
        }
        .header-glass { background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(12px); border-bottom: 1px solid #e2e8f0; position: sticky; top: 0; z-index: 100; }
      `}</style>

      {isMobile && isSidebarOpen && (
        <div onClick={() => setIsSidebarOpen(false)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', zIndex: 1999 }} />
      )}

      <nav className="sidebar-fixed" style={{ 
        width: isSidebarOpen ? "280px" : "85px", 
        backgroundColor: "#0C2C55", display: "flex", flexDirection: "column", 
        transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)", flexShrink: 0, height: "100vh",
        zIndex: 2000, overflow: "hidden"
      }}>
        <div style={{ padding: "20px 15px", display: 'flex', alignItems: 'center', justifyContent: isSidebarOpen ? 'flex-start' : 'center', minHeight: '120px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src={spLogo} alt="Logo" style={{ width: '55px', filter: 'brightness(0) invert(1)' }} />
            {isSidebarOpen && <img src={securPathLogo} alt="SecurPath" style={{ width: '110px', filter: 'brightness(0) invert(1)' }} />}
          </div>
        </div>

        <div style={{ flex: 1, padding: "10px 14px", overflowY: 'auto', overflowX: 'hidden' }}>
          {allowedTabs.map((t) => {
            const isActive = tab === t.key;
            return (
              <button key={t.key} onClick={() => handleTabChange(t.key)} className="nav-item" style={{
                width: "100%", padding: "14px", marginBottom: "6px", border: "none", borderRadius: "12px",
                backgroundColor: isActive ? "rgba(255,255,255,0.12)" : "transparent",
                color: isActive ? "#ffffff" : "#94a3b8", cursor: "pointer", display: "flex", alignItems: "center", 
                justifyContent: isSidebarOpen ? 'flex-start' : 'center', gap: "14px",
              }}>
                <span style={{ color: isActive ? TAB_COLORS[t.key].accent : "inherit", display: 'flex', flexShrink: 0 }}>{t.icon}</span>
                {isSidebarOpen ? (
                   <span style={{ fontSize: '14px', fontWeight: isActive ? '600' : '500', whiteSpace: 'nowrap' }}>{t.label}</span>
                ) : (
                   <div className="sps-tooltip">{t.label}</div>
                )}
              </button>
            );
          })}
        </div>

        <div style={{ padding: "20px", borderTop: "1px solid rgba(255,255,255,0.05)", flexShrink: 0 }}>
          <button onClick={logout} className="nav-item" style={{ width: "100%", padding: "12px", background: "rgba(239, 68, 68, 0.1)", color: "#f87171", border: "none", borderRadius: "12px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: isSidebarOpen ? "flex-start" : "center", gap: "14px" }}>
            <LogOut size={18} style={{ flexShrink: 0 }} />
            {isSidebarOpen ? <span style={{ fontWeight: '600' }}>Logout</span> : <div className="sps-tooltip">Logout</div>}
          </button>
        </div>
      </nav>

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', minWidth: 0 }}>
        <header className="header-glass" style={{ padding: isMobile ? "10px 15px" : "15px 30px", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '10px' : '20px' }}>
            <button onClick={toggleSidebar} style={{ padding: '10px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', cursor: 'pointer', color: '#0C2C55', display: 'flex' }}>
              <Menu size={20} />
            </button>
            <h2 style={{ fontSize: isMobile ? "18px" : "22px", fontWeight: "800", color: "#0f172a", margin: 0 }}>{TABS.find(t => t.key === tab)?.label}</h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '5px 5px 5px 12px', background: isMobile ? 'transparent' : '#fff', borderRadius: '15px', border: isMobile ? 'none' : '1px solid #e2e8f0' }}>
              {!isMobile && <span style={{ fontSize: '13px', fontWeight: '700' }}>{role.toUpperCase()}</span>}
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: getRoleColor(), color: '#fff', display: 'grid', placeItems: 'center', fontWeight: '800' }}>{role.charAt(0).toUpperCase()}</div>
            </div>
          </div>
        </header>

        <div style={{ flex: 1, overflowY: "auto", padding: isMobile ? "15px" : "30px", animation: 'fadeIn 0.5s ease' }}>
          <div style={{ maxWidth: '1600px', margin: '0 auto', width: '100%' }}>
              {tab === "dashboard" && <Dashboard summary={summary} />}
              {tab === "receivings" && <Receivings state={state} actions={actions} />}
              {tab === "payments" && <StoreInventory state={state} actions={actions} role={role} />}
              {tab === "payment_ledger" && <PaymentLedger state={state} actions={actions} role={role} />}
              {tab === "party" && <PartyStatement state={state} />}
              {tab === "salaries" && <Salaries state={state} actions={actions} />}
              {tab === "monthly" && <MonthlySummary state={state} />}
              {tab === "settings" && <Settings state={state} actions={actions} />}
              {tab === "user_req" && <UserReqForm state={state} actions={actions} role={role} tabId={tabId} />}
          </div>
        </div>
      </main>
    </div>
  );
}