// import React, { useMemo, useState, useEffect } from "react";
// import { 
//   LayoutDashboard, ArrowDownCircle, ArrowUpCircle, Users, 
//   Wallet, CalendarDays, Settings as SettingsIcon,
//   ClipboardList, LogOut, Menu, BookOpen
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
//   { key: "party",           label: "Parties",          icon: <Users size={20} />, roles: ["admin", "accountant"] },
//   { key: "salaries",       label: "Salaries & Payroll", icon: <Wallet size={20} />, roles: ["admin", "accountant"] },
//   { key: "payment_ledger", label: "Payment Ledger",  icon: <BookOpen size={20} />, roles: ["admin", "accountant"] },
//   { key: "monthly",         label: "Summary",          icon: <CalendarDays size={20} />, roles: ["admin", "accountant"] },
//   { key: "user_req",       label: "User Requests",   icon: <ClipboardList size={20} />, roles: ["user", "admin", "store", "accountant"], hasBadge: true },
//   { key: "settings",       label: "Settings",        icon: <SettingsIcon size={20} />, roles: ["admin"] },
// ];

// const TAB_COLORS = {
//   dashboard:      { accent: '#3b82f6' },
//   receivings:     { accent: '#10b981' },
//   payments:       { accent: '#f59e0b' },
//   party:          { accent: '#8b5cf6' },
//   salaries:       { accent: '#06b6d4' },
//   payment_ledger: { accent: '#f43f5e' },
//   monthly:        { accent: '#ec4899' },
//   user_req:       { accent: '#ef4444' },
//   settings:       { accent: '#64748b' },
// };

// export default function App() {
//   const [tabId] = useState(() => {
//     let id = sessionStorage.getItem("sps_tab_id") || "tab_" + Math.random().toString(36).substr(2, 9);
//     sessionStorage.setItem("sps_tab_id", id);
//     return id;
//   });

//   const tokenKey = `sps_token_${tabId}`;
//   const roleKey = `sps_role_${tabId}`;
//   const activeTabKey = `sps_active_tab_${tabId}`;

//   const [token, setTokenState] = useState(localStorage.getItem(tokenKey) || "");
//   const [role, setRole] = useState(localStorage.getItem(roleKey) || ""); 
  
//   const [tab, setTab] = useState(() => {
//     const savedTab = localStorage.getItem(activeTabKey);
//     const currentRole = (localStorage.getItem(roleKey) || "").toLowerCase();
//     const isAllowed = TABS.find(t => t.key === savedTab && t.roles.includes(currentRole));
//     if (savedTab && isAllowed) return savedTab;
//     const firstAllowed = TABS.find(t => t.roles.includes(currentRole));
//     return firstAllowed ? firstAllowed.key : "dashboard";
//   });

//   const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
//     const savedState = localStorage.getItem("sps_sidebar_state");
//     if (window.innerWidth < 1024) return false;
//     return savedState === null ? true : savedState === "true";
//   });

//   const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

//   useEffect(() => {
//     const handleResize = () => {
//       const mobile = window.innerWidth < 1024;
//       setIsMobile(mobile);
//       if (mobile) setIsSidebarOpen(false);
//     };
//     window.addEventListener('resize', handleResize);
//     return () => window.removeEventListener('resize', handleResize);
//   }, []);

//   const toggleSidebar = () => {
//     setIsSidebarOpen(prev => {
//       const newState = !prev;
//       if (!isMobile) localStorage.setItem("sps_sidebar_state", newState);
//       return newState;
//     });
//   };

//   const { state, actions } = useAccountingStore();
//   const summary = useMemo(() => calcSummary(state), [state]);

//   const allowedTabs = useMemo(() => {
//     const currentRole = (role || "").toLowerCase();
//     return TABS.filter(t => t.roles.includes(currentRole));
//   }, [role]);

//   const handleTabChange = (newTab) => { 
//     setTab(newTab); 
//     localStorage.setItem(activeTabKey, newTab);
//     if (isMobile) setIsSidebarOpen(false);
//   };

//   async function onLogin(pin) {
//     try {
//       const r = await api.login(pin, "store");
//       localStorage.setItem(tokenKey, r.token);
//       localStorage.setItem(roleKey, r.role);
//       setRole(r.role); setTokenState(r.token);
//       window.location.reload();
//     } catch (err) { alert(err.message); }
//   }

//   function logout() { localStorage.clear(); window.location.reload(); }

//   const getRoleColor = () => {
//     const r = (role || "").toLowerCase();
//     if (r === 'admin') return '#3b82f6';
//     if (r === 'store') return '#f59e0b';
//     return '#10b981';
//   };

//   if (!token) return <Login onLogin={onLogin} />;

//   return (
//     <div style={{ display: "flex", height: "100vh", backgroundColor: "#f8fafc", fontFamily: "'Plus Jakarta Sans', sans-serif", overflow: "hidden" }}>
//       <style>{`
//         @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
//         ::-webkit-scrollbar { width: 5px; height: 5px; }
//         ::-webkit-scrollbar-track { background: transparent; }
//         ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        
//         .nav-item { position: relative; transition: all 0.2s ease; border: 1px solid transparent !important; }
//         .nav-item:hover { background: rgba(255,255,255,0.08) !important; }
        
//         /* TOOLTIP WITH DELAY AND FIXED POSITION */
//         .sps-tooltip {
//           position: fixed;
//           left: 80px; 
//           background: #1e293b;
//           color: white;
//           padding: 7px 14px;
//           border-radius: 8px;
//           font-size: 13px;
//           font-weight: 600;
//           white-space: nowrap;
//           opacity: 0;
//           visibility: hidden;
//           z-index: 10000;
//           box-shadow: 10px 0 30px rgba(0,0,0,0.3);
//           pointer-events: none;
          
//           /* Smooth Animation with Delay */
//           transform: translateX(0px) scale(0.95);
//           transition: 
//             opacity 0.2s ease 0.15s, 
//             visibility 0.2s ease 0.15s, 
//             transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.15s;
//         }

//         .sps-tooltip::after {
//           content: "";
//           position: absolute;
//           left: -4px;
//           top: 50%;
//           transform: translateY(-50%) rotate(45deg);
//           width: 8px;
//           height: 8px;
//           background: #1e293b;
//         }

//         .nav-item:hover .sps-tooltip {
//           opacity: 1;
//           visibility: visible;
//           transform: translateX(12px) scale(1);
//         }

//         @media (max-width: 1024px) { 
//           .sidebar-fixed { position: fixed !important; left: ${isSidebarOpen ? '0' : '-100%'} !important; z-index: 2000 !important; width: 280px !important; }
//           .sps-tooltip { display: none !important; }
//         }
//         .header-glass { background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(12px); border-bottom: 1px solid #e2e8f0; position: sticky; top: 0; z-index: 100; }
//       `}</style>

//       {isMobile && isSidebarOpen && (
//         <div onClick={() => setIsSidebarOpen(false)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', zIndex: 1999 }} />
//       )}

//       {/* SIDEBAR */}
//       <nav className="sidebar-fixed" style={{ 
//         width: isSidebarOpen ? "280px" : "85px", 
//         backgroundColor: "#0C2C55", display: "flex", flexDirection: "column", 
//         transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)", flexShrink: 0, height: "100vh",
//         zIndex: 2000, 
//         overflow: "visible" 
//       }}>
//         <div style={{ padding: "20px 15px", display: 'flex', alignItems: 'center', justifyContent: isSidebarOpen ? 'flex-start' : 'center', minHeight: '120px', flexShrink: 0 }}>
//           <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
//             <img src={spLogo} alt="Logo" style={{ width: '55px', filter: 'brightness(0) invert(1)' }} />
//             {isSidebarOpen && <img src={securPathLogo} alt="SecurPath" style={{ width: '110px', filter: 'brightness(0) invert(1)' }} />}
//           </div>
//         </div>

//         <div style={{ flex: 1, padding: "10px 14px", overflowY: 'auto', overflowX: 'visible' }}>
//           {allowedTabs.map((t) => {
//             const isActive = tab === t.key;
//             return (
//               <button key={t.key} onClick={() => handleTabChange(t.key)} className="nav-item" style={{
//                 width: "100%", padding: "14px", marginBottom: "6px", border: "none", borderRadius: "12px",
//                 backgroundColor: isActive ? "rgba(255,255,255,0.12)" : "transparent",
//                 color: isActive ? "#ffffff" : "#94a3b8", cursor: "pointer", display: "flex", alignItems: "center", 
//                 justifyContent: isSidebarOpen ? 'flex-start' : 'center', gap: "14px",
//               }}>
//                 <span style={{ color: isActive ? TAB_COLORS[t.key].accent : "inherit", display: 'flex', flexShrink: 0 }}>{t.icon}</span>
//                 {!isSidebarOpen && <div className="sps-tooltip">{t.label}</div>}
//                 {isSidebarOpen && <span style={{ fontSize: '14px', fontWeight: isActive ? '600' : '500', whiteSpace: 'nowrap' }}>{t.label}</span>}
//               </button>
//             );
//           })}
//         </div>

//         <div style={{ padding: "20px", borderTop: "1px solid rgba(255,255,255,0.05)", flexShrink: 0 }}>
//           <button onClick={logout} className="nav-item" style={{ width: "100%", padding: "12px", background: "rgba(239, 68, 68, 0.1)", color: "#f87171", border: "none", borderRadius: "12px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: isSidebarOpen ? "flex-start" : "center", gap: "14px" }}>
//             <LogOut size={18} style={{ flexShrink: 0 }} />
//             {!isSidebarOpen && <div className="sps-tooltip">Logout</div>}
//             {isSidebarOpen && <span style={{ fontWeight: '600' }}>Logout</span>}
//           </button>
//         </div>
//       </nav>

//       <main style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', minWidth: 0 }}>
//         {/* ... Header and Content as before ... */}
//         <header className="header-glass" style={{ padding: isMobile ? "10px 15px" : "15px 30px", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
//           <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '10px' : '20px' }}>
//             <button onClick={toggleSidebar} style={{ padding: '10px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', cursor: 'pointer', color: '#0C2C55', display: 'flex' }}>
//               <Menu size={20} />
//             </button>
//             <h2 style={{ fontSize: isMobile ? "18px" : "22px", fontWeight: "800", color: "#0f172a", margin: 0 }}>{TABS.find(t => t.key === tab)?.label}</h2>
//           </div>

//           <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
//             <div style={{ 
//               display: 'flex', alignItems: 'center', gap: '10px', padding: '5px 5px 5px 12px', 
//               background: isMobile ? 'transparent' : '#fff', borderRadius: '15px', border: isMobile ? 'none' : '1px solid #e2e8f0' 
//             }}>
//               {!isMobile && <span style={{ fontSize: '13px', fontWeight: '700', color: '#000' }}>{(role || "").toUpperCase()}</span>}
//               <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: getRoleColor(), color: '#fff', display: 'grid', placeItems: 'center', fontWeight: '800' }}>
//                 {(role || "U").charAt(0).toUpperCase()}
//               </div>
//             </div>
//           </div>
//         </header>

//         <div style={{ flex: 1, overflowY: "auto", padding: isMobile ? "15px" : "30px", animation: 'fadeIn 0.5s ease' }}>
//           <div style={{ maxWidth: '1600px', margin: '0 auto', width: '100%' }}>
//               {tab === "dashboard" && <Dashboard summary={summary} />}
//               {tab === "receivings" && <Receivings state={state} actions={actions} />}
//               {tab === "payments" && <StoreInventory state={state} actions={actions} role={role} />}
//               {tab === "payment_ledger" && <PaymentLedger state={state} actions={actions} role={role} />}
//               {tab === "party" && <PartyStatement state={state} />}
//               {tab === "salaries" && <Salaries state={state} actions={actions} />}
//               {tab === "monthly" && <MonthlySummary state={state} />}
//               {tab === "settings" && <Settings state={state} actions={actions} />}
//               {tab === "user_req" && <UserReqForm state={state} actions={actions} role={role} tabId={tabId} />}
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// }


import React, { useMemo, useState, useEffect } from "react";
import {
  LayoutDashboard,
  ArrowDownCircle,
  ArrowUpCircle,
  Users,
  Wallet,
  CalendarDays,
  Settings as SettingsIcon,
  ClipboardList,
  LogOut,
  Menu,
  BookOpen,
  Library,
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
import DailyBook from "./components/DailyBook";

const TABS = [
  { key: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} />, roles: ["admin", "accountant"] },
  { key: "receivings", label: "Receivings", icon: <ArrowDownCircle size={20} />, roles: ["admin", "accountant"] },
  { key: "payments", label: "Inventory Store", icon: <ArrowUpCircle size={20} />, roles: ["admin", "accountant", "store"] },
  { key: "party", label: "Parties", icon: <Users size={20} />, roles: ["admin", "accountant"] },
  { key: "salaries", label: "Salaries & Payroll", icon: <Wallet size={20} />, roles: ["admin", "accountant"] },
  { key: "payment_ledger", label: "Payment Ledger", icon: <BookOpen size={20} />, roles: ["admin", "accountant"] },
  { key: "daily_book", label: "Daily Book", icon: <Library size={20} />, roles: ["admin", "accountant"] },
  { key: "monthly", label: "Summary", icon: <CalendarDays size={20} />, roles: ["admin", "accountant"] },
  { key: "user_req", label: "User Requests", icon: <ClipboardList size={20} />, roles: ["user", "admin", "store", "accountant"], hasBadge: true },
  { key: "settings", label: "Settings", icon: <SettingsIcon size={20} />, roles: ["admin"] },
];

const TAB_COLORS = {
  dashboard: { accent: "#3b82f6" },
  receivings: { accent: "#10b981" },
  payments: { accent: "#f59e0b" },
  party: { accent: "#8b5cf6" },
  salaries: { accent: "#06b6d4" },
  payment_ledger: { accent: "#f43f5e" },
  daily_book: { accent: "#10b981" },
  monthly: { accent: "#ec4899" },
  user_req: { accent: "#ef4444" },
  settings: { accent: "#64748b" },
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
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  const [tab, setTab] = useState(() => {
    const savedTab = localStorage.getItem(activeTabKey);
    const currentRole = (localStorage.getItem(roleKey) || "").toLowerCase();
    const isAllowed = TABS.find((t) => t.key === savedTab && t.roles.includes(currentRole));
    if (savedTab && isAllowed) return savedTab;
    const firstAllowed = TABS.find((t) => t.roles.includes(currentRole));
    return firstAllowed ? firstAllowed.key : "dashboard";
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (window.innerWidth < 1024) return false;
    const savedState = localStorage.getItem("sps_sidebar_state");
    return savedState === null ? true : savedState === "true";
  });

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) setIsSidebarOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => {
      const newState = !prev;
      if (!isMobile) localStorage.setItem("sps_sidebar_state", newState.toString());
      return newState;
    });
  };

  const handleTabChange = (newTab) => {
    setTab(newTab);
    localStorage.setItem(activeTabKey, newTab);
    // Mobile par click karte hi sidebar auto-close ho jaye
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  const { state, actions } = useAccountingStore();
  const summary = useMemo(() => calcSummary(state), [state]);

  const allowedTabs = useMemo(() => {
    const currentRole = (role || "").toLowerCase();
    return TABS.filter((t) => t.roles.includes(currentRole));
  }, [role]);

  async function onLogin(pin) {
    try {
      const r = await api.login(pin, "store");
      localStorage.setItem(tokenKey, r.token);
      localStorage.setItem(roleKey, r.role);
      setRole(r.role);
      setTokenState(r.token);
      window.location.reload();
    } catch (err) {
      alert(err.message);
    }
  }

  function logout() {
    localStorage.clear();
    window.location.reload();
  }

  const getRoleColor = () => {
    const r = (role || "").toLowerCase();
    if (r === "admin") return "#3b82f6";
    if (r === "store") return "#f59e0b";
    return "#10b981";
  };

  if (!token) return <Login onLogin={onLogin} />;

  return (
    <div style={{ display: "flex", height: "100vh", backgroundColor: "#f8fafc", fontFamily: "'Plus Jakarta Sans', sans-serif", overflow: "hidden" }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .nav-item { position: relative; transition: all 0.2s ease; border: 1px solid transparent !important; }
        .nav-item:hover { background: rgba(255,255,255,0.08) !important; }
        .sps-tooltip {
          position: fixed; left: 80px; background: #1e293b; color: white; padding: 7px 14px;
          border-radius: 8px; font-size: 13px; font-weight: 600; white-space: nowrap;
          opacity: 0; visibility: hidden; z-index: 10000; box-shadow: 10px 0 30px rgba(0,0,0,0.3);
          pointer-events: none; transform: translateX(0px) scale(0.95);
          transition: opacity 0.2s ease 0.15s, visibility 0.2s ease 0.15s, transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.15s;
        }
        .nav-item:hover .sps-tooltip { opacity: 1; visibility: visible; transform: translateX(12px) scale(1); }
        @media (max-width: 1024px) { 
          .sidebar-fixed { position: fixed !important; left: ${isSidebarOpen ? "0" : "-100%"} !important; z-index: 2000 !important; width: 280px !important; }
          .sps-tooltip { display: none !important; }
        }
        .header-glass { background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(12px); border-bottom: 1px solid #e2e8f0; position: sticky; top: 0; z-index: 100; }
      `}</style>

      {/* Backdrop for Mobile */}
      {isMobile && isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          style={{ position: "fixed", inset: 0, backgroundColor: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(4px)", zIndex: 1999 }}
        />
      )}

      {/* SIDEBAR */}
      <nav
        className="sidebar-fixed"
        style={{
          width: isSidebarOpen ? "280px" : "85px",
          backgroundColor: "#0C2C55",
          display: "flex",
          flexDirection: "column",
          transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1), left 0.3s ease",
          flexShrink: 0,
          height: "100vh",
          zIndex: 2000,
        }}
      >
        <div style={{ padding: "20px 15px", display: "flex", alignItems: "center", justifyContent: isSidebarOpen ? "flex-start" : "center", minHeight: "120px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <img src={spLogo} alt="Logo" style={{ width: "55px", filter: "brightness(0) invert(1)" }} />
            {isSidebarOpen && <img src={securPathLogo} alt="SecurPath" style={{ width: "110px", filter: "brightness(0) invert(1)" }} />}
          </div>
        </div>

        <div style={{ flex: 1, padding: "10px 14px", overflowY: "auto" }}>
          {allowedTabs.map((t) => {
            const isActive = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => handleTabChange(t.key)}
                className="nav-item"
                style={{
                  width: "100%", padding: "14px", marginBottom: "6px", border: "none", borderRadius: "12px",
                  backgroundColor: isActive ? "rgba(255,255,255,0.12)" : "transparent",
                  color: isActive ? "#ffffff" : "#94a3b8", cursor: "pointer", display: "flex",
                  alignItems: "center", justifyContent: isSidebarOpen ? "flex-start" : "center", gap: "14px",
                }}
              >
                <span style={{ color: isActive ? TAB_COLORS[t.key]?.accent : "inherit", display: "flex" }}>{t.icon}</span>
                {!isSidebarOpen && <div className="sps-tooltip">{t.label}</div>}
                {isSidebarOpen && <span style={{ fontSize: "14px", fontWeight: isActive ? "600" : "500", whiteSpace: "nowrap" }}>{t.label}</span>}
              </button>
            );
          })}
        </div>

        <div style={{ padding: "20px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <button
            onClick={logout}
            className="nav-item"
            style={{
              width: "100%", padding: "12px", background: "rgba(239, 68, 68, 0.1)", color: "#f87171",
              border: "none", borderRadius: "12px", cursor: "pointer", display: "flex",
              alignItems: "center", justifyContent: isSidebarOpen ? "flex-start" : "center", gap: "14px",
            }}
          >
            <LogOut size={18} />
            {!isSidebarOpen && <div className="sps-tooltip">Logout</div>}
            {isSidebarOpen && <span style={{ fontWeight: "600" }}>Logout</span>}
          </button>
        </div>
      </nav>

      <main style={{ flex: 1, display: "flex", flexDirection: "column", height: "100vh", minWidth: 0 }}>
        <header className="header-glass" style={{ padding: isMobile ? "10px 15px" : "15px 30px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: isMobile ? "10px" : "20px" }}>
            <button onClick={toggleSidebar} style={{ padding: "10px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", cursor: "pointer", color: "#0C2C55", display: "flex" }}>
              <Menu size={20} />
            </button>
            <h2 style={{ fontSize: isMobile ? "18px" : "22px", fontWeight: "800", color: "#0f172a", margin: 0 }}>
              {TABS.find((t) => t.key === tab)?.label}
            </h2>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "5px 5px 5px 12px", background: isMobile ? "transparent" : "#fff", borderRadius: "15px", border: isMobile ? "none" : "1px solid #e2e8f0" }}>
              {!isMobile && <span style={{ fontSize: "13px", fontWeight: "700", color: "#000" }}>{(role || "").toUpperCase()}</span>}
              <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: getRoleColor(), color: "#fff", display: "grid", placeItems: "center", fontWeight: "800" }}>
                {(role || "U").charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        <div style={{ flex: 1, overflowY: "auto", padding: isMobile ? "15px" : "30px", animation: "fadeIn 0.5s ease" }}>
          <div style={{ maxWidth: "1600px", margin: "0 auto", width: "100%" }}>
            {tab === "dashboard" && <Dashboard summary={summary} />}
            {tab === "receivings" && <Receivings state={state} actions={actions} />}
            {tab === "payments" && <StoreInventory state={state} actions={actions} role={role} />}
            {tab === "payment_ledger" && <PaymentLedger state={state} actions={actions} role={role} />}
            {tab === "daily_book" && <DailyBook state={state} actions={actions} role={role} />}
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