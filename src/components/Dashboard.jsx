// import React, { useEffect, useState } from "react";
// import { BANKS, toMoney } from "../store";

// // StatCard component
// function StatCard({ title, value, hint, variant = "default" }) {
//   const variants = {
//     blue: {
//       bg: "linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)",
//       hoverBg: "linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)",
//       shadow: "0 10px 25px rgba(59, 130, 246, 0.2)",
//       hoverShadow: "0 20px 40px rgba(59, 130, 246, 0.4)",
//       text: "#fff",
//       hintColor: "rgba(255,255,255,0.8)",
//     },
//     default: {
//       bg: "rgba(255, 255, 255, 0.7)",
//       hoverBg: "rgba(255, 255, 255, 0.9)",
//       shadow: "0 8px 32px rgba(31, 38, 135, 0.07)",
//       hoverShadow: "0 12px 40px rgba(31, 38, 135, 0.15)",
//       border: "1px solid rgba(255, 255, 255, 0.18)",
//       hoverBorder: "1px solid #3b82f6",
//       text: "#1e293b",
//       hintColor: "#64748b",
//     },
//   };

//   const style = variants[variant] || variants.default;

//   return (
//     <div
//       style={{
//         flex: "1 1 220px",
//         background: style.bg,
//         color: style.text,
//         borderRadius: "20px",
//         padding: "24px 28px",
//         boxShadow: style.shadow,
//         border: style.border || "none",
//         backdropFilter: "blur(12px)",
//         WebkitBackdropFilter: "blur(12px)",
//         display: "flex",
//         flexDirection: "column",
//         gap: "8px",
//         transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
//         cursor: "pointer",
//       }}
//     >
//       <div
//         style={{
//           fontSize: "12px",
//           fontWeight: "700",
//           opacity: 0.6,
//           textTransform: "uppercase",
//           letterSpacing: "1px",
//         }}
//       >
//         {title}
//       </div>
//       <div
//         style={{
//           fontSize: "26px",
//           fontWeight: "800",
//           color: variant === "blue" ? "#fff" : "#0f172a",
//         }}
//       >
//         {value}
//       </div>
//       {hint && (
//         <div
//           style={{
//             fontSize: "12px",
//             color: style.hintColor,
//             marginTop: "4px",
//             fontWeight: "500",
//           }}
//         >
//           {hint}
//         </div>
//       )}
//     </div>
//   );
// }

// // Dashboard component
// export default function Dashboard() {
//   const [summary, setSummary] = useState({
//     totalBankBalance: 0,
//     totalReceived: 0,
//     totalPending: 0,
//     totalPaid: 0,
//     bankBalanceByBank: {},
//     receivedByBank: {},
//     pendingByBank: {},
//     paidByBank: {},
//   });

//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   useEffect(() => {
//     async function fetchState() {
//       try {
//         // 1️⃣ Main state (receivings)
//         const resState = await fetch("https://accounts-sps-backend-git-main-secure-path-solutions-projects.vercel.app/api/state");
//         if (!resState.ok) throw new Error("Failed to fetch state");
//         const stateData = await resState.json();

//         // 2️⃣ Payments / Expenses
//         const resPayments = await fetch("https://accounts-sps-backend-git-main-secure-path-solutions-projects.vercel.app/api/payments");
//         if (!resPayments.ok) throw new Error("Failed to fetch payments");
//         const payments = await resPayments.json();

//         // 3️⃣ Salaries
//         const resSalaries = await fetch("https://accounts-sps-backend-git-main-secure-path-solutions-projects.vercel.app/api/salaries");
//         if (!resSalaries.ok) throw new Error("Failed to fetch salaries");
//         const salaries = await resSalaries.json();

//         // 4️⃣ Inventory Requests (Accountant Receipts)
//         const resInventory = await fetch("https://accounts-sps-backend-git-main-secure-path-solutions-projects.vercel.app/api/inventory-requests");
//         if (!resInventory.ok)
//           throw new Error("Failed to fetch inventory requests");
//         const inventoryRequests = await resInventory.json();

//         // 🔑 Normalize bank keys
//         const normalizeBankKey = (bankName) => {
//           if (!bankName) return "";
//           const b = bankName.trim().toLowerCase();
//           if (b === "bank islami" || b === "islamic bank") return "BANK_ISLAMI";
//           if (b === "hbl") return "HBL";
//           return bankName.toUpperCase().replace(/\s+/g, "_");
//         };

//         // Initial values
//         const openingBalances = stateData.openingBalances || {};
//         let bankBalanceByBank = { ...openingBalances };
//         let receivedByBank = {};
//         let pendingByBank = {};
//         let paidByBank = {};

//         let totalReceived = 0;
//         let totalPending = 0;
//         let totalPaid = 0;

//         // ─── RECEIVINGS ─────────────────────────────
//         (stateData.receivings || []).forEach((r) => {
//           const bank = normalizeBankKey(r.bank);
//           const amount = Number(r.amount) || 0;
//           const status = r.status?.toLowerCase();

//           if (status === "received") {
//             totalReceived += amount;
//             receivedByBank[bank] = (receivedByBank[bank] || 0) + amount;
//             bankBalanceByBank[bank] = (bankBalanceByBank[bank] || 0) + amount;
//           }

//           if (status === "pending") {
//             totalPending += amount;
//             pendingByBank[bank] = (pendingByBank[bank] || 0) + amount;
//           }
//         });

//         // ─── PAYMENTS / EXPENSES ───────────────────
//         (payments || []).forEach((p) => {
//           const bank = normalizeBankKey(p.bank);
//           const amount = Number(p.amount) || 0;
//           const status = p.status?.toLowerCase();

//           if (status === "paid") {
//             totalPaid += amount;
//             paidByBank[bank] = (paidByBank[bank] || 0) + amount;
//             bankBalanceByBank[bank] = (bankBalanceByBank[bank] || 0) - amount;
//           }
//         });

//         // ─── SALARIES ──────────────────────────────
//         (salaries || []).forEach((s) => {
//           const bank = normalizeBankKey(s.bank);
//           const amount = Number(s.amount) || 0;
//           const status = s.status?.toLowerCase();

//           if (status === "paid") {
//             totalPaid += amount;
//             paidByBank[bank] = (paidByBank[bank] || 0) + amount;
//             bankBalanceByBank[bank] = (bankBalanceByBank[bank] || 0) - amount;
//           }
//         });

//         // ─── INVENTORY RECEIPTS (ACCOUNTANT) ───────
//         (inventoryRequests || []).forEach((r) => {
//           if (!r.receipt) return;

//           const bank = normalizeBankKey(r.receipt.bank);
//           const amount = Number(r.receipt.amount) || 0;
//           const status = r.receipt.paymentStatus?.toLowerCase();

//           if (status === "paid") {
//             totalPaid += amount;
//             paidByBank[bank] = (paidByBank[bank] || 0) + amount;
//             bankBalanceByBank[bank] = (bankBalanceByBank[bank] || 0) - amount;
//           }
//         });

//         // ─── TOTAL BANK BALANCE ────────────────────
//         const totalBankBalance = Object.values(bankBalanceByBank).reduce(
//           (a, b) => a + b,
//           0,
//         );

//         // ─── SET STATE ─────────────────────────────
//         setSummary({
//           totalBankBalance,
//           totalReceived,
//           totalPending,
//           totalPaid,
//           bankBalanceByBank,
//           receivedByBank,
//           pendingByBank,
//           paidByBank,
//         });

//         setLoading(false);
//       } catch (err) {
//         console.error(err);
//         setError(err.message || "Dashboard fetch error");
//         setLoading(false);
//       }
//     }

//     fetchState();
//   }, []);

//   if (loading) return <div style={{ padding: "40px" }}>Loading...</div>;
//   if (error)
//     return <div style={{ padding: "40px", color: "red" }}>Error: {error}</div>;

//   return (
//     <div
//       style={{
//         minHeight: "100vh",
//         padding: "40px 24px",
//         backgroundColor: "#f8fafc",
//         fontFamily: "'Plus Jakarta Sans', sans-serif",
//       }}
//     >
//       <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
//         {/* Header */}
//         <div
//           style={{
//             marginBottom: "40px",
//             display: "flex",
//             justifyContent: "space-between",
//             alignItems: "center",
//           }}
//         >
//           <div>
//             <h1
//               style={{
//                 fontSize: "32px",
//                 fontWeight: "800",
//                 color: "#0f172a",
//                 margin: 0,
//               }}
//             >
//               Finance <span style={{ color: "#3b82f6" }}>Dashboard</span>
//             </h1>
//             <p
//               style={{
//                 color: "#64748b",
//                 margin: "4px 0 0",
//                 fontSize: "16px",
//                 fontWeight: "500",
//               }}
//             >
//               Monitoring real-time cashflow and bank assets
//             </p>
//           </div>
//           <div
//             style={{
//               padding: "8px 16px",
//               background: "#fff",
//               borderRadius: "12px",
//               boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
//               fontSize: "14px",
//               fontWeight: "600",
//               color:"black",
//             }}
//           >
//             Today: {new Date().toLocaleDateString()}
//           </div>
//         </div>

//         {/* Stats Row */}
//         <div
//           style={{
//             display: "grid",
//             gridTemplateColumns: "repeat(2, 1fr)",
//             gap: "24px",
//             marginBottom: "48px",
//           }}
//         >
//           <StatCard
//             title="Total Bank Balance"
//             value={toMoney(summary.totalBankBalance)}
//             variant="blue"
//             hint="Sum of all bank assets"
//           />
//           <StatCard
//             title="Total Received"
//             value={toMoney(summary.totalReceived)}
//             hint="Status: received"
//           />
//           <StatCard
//             title="Total Paid"
//             value={toMoney(summary.totalPaid)}
//             hint="Operational expenses"
//           />
//           <StatCard
//             title="Pending"
//             value={toMoney(summary.totalPending)}
//             hint="Status: pending"
//           />
//         </div>

//         {/* Bank Breakdown */}
//         <div
//           style={{
//             background: "#fff",
//             borderRadius: "24px",
//             padding: "32px",
//             boxShadow: "0 20px 50px rgba(0,0,0,0.04)",
//             border: "1px solid #f1f5f9",
//           }}
//         >
//           <div
//             style={{
//               display: "flex",
//               alignItems: "center",
//               gap: "12px",
//               marginBottom: "32px",
//             }}
//           >
//             <div
//               style={{
//                 width: "4px",
//                 height: "24px",
//                 background: "#3b82f6",
//                 borderRadius: "10px",
//               }}
//             ></div>
//             <h2
//               style={{
//                 fontSize: "22px",
//                 fontWeight: "800",
//                 color: "#0f172a",
//                 margin: 0,
//               }}
//             >
//               Bank Account Breakdown
//             </h2>
//           </div>

//           <div
//             style={{
//               display: "grid",
//               gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
//               gap: "24px",
//             }}
//           >
//             {BANKS.map((b) => (
//               <div
//                 key={b.key}
//                 style={{
//                   padding: "24px",
//                   borderRadius: "20px",
//                   background: "#f8fafc",
//                   border: "1px solid #e2e8f0",
//                   display: "flex",
//                   flexDirection: "column",
//                   gap: "20px",
//                 }}
//               >
//                 <div
//                   style={{
//                     display: "flex",
//                     justifyContent: "space-between",
//                     alignItems: "center",
//                   }}
//                 >
//                   <span
//                     style={{
//                       fontWeight: "700",
//                       fontSize: "16px",
//                       color: "#334155",
//                     }}
//                   >
//                     {b.label}
//                   </span>
//                   <span
//                     style={{
//                       fontSize: "22px",
//                       fontWeight: "800",
//                       color: "#2563eb",
//                     }}
//                   >
//                     {toMoney(summary.bankBalanceByBank[b.key] || 0)}
//                   </span>
//                 </div>

//                 <div
//                   style={{
//                     display: "flex",
//                     gap: "12px",
//                     background: "#fff",
//                     padding: "16px",
//                     borderRadius: "16px",
//                     border: "1px solid #f1f5f9",
//                   }}
//                 >
//                   <div style={{ flex: 1 }}>
//                     <div
//                       style={{
//                         color: "#94a3b8",
//                         fontSize: "11px",
//                         fontWeight: "700",
//                         textTransform: "uppercase",
//                         marginBottom: "4px",
//                       }}
//                     >
//                       Received
//                     </div>
//                     <div
//                       style={{
//                         fontWeight: "800",
//                         color: "#10b981",
//                         fontSize: "15px",
//                       }}
//                     >
//                       {toMoney(summary.receivedByBank[b.key] || 0)}
//                     </div>
//                   </div>
//                   <div style={{ width: "1px", background: "#f1f5f9" }} />
//                   <div style={{ flex: 1 }}>
//                     <div
//                       style={{
//                         color: "#94a3b8",
//                         fontSize: "11px",
//                         fontWeight: "700",
//                         textTransform: "uppercase",
//                         marginBottom: "4px",
//                       }}
//                     >
//                       Paid
//                     </div>
//                     <div
//                       style={{
//                         fontWeight: "800",
//                         color: "#ef4444",
//                         fontSize: "15px",
//                       }}
//                     >
//                       {toMoney(summary.paidByBank[b.key] || 0)}
//                     </div>
//                   </div>
//                   <div style={{ width: "1px", background: "#f1f5f9" }} />
//                   <div style={{ flex: 1 }}>
//                     <div
//                       style={{
//                         color: "#94a3b8",
//                         fontSize: "11px",
//                         fontWeight: "700",
//                         textTransform: "uppercase",
//                         marginBottom: "4px",
//                       }}
//                     >
//                       Pending
//                     </div>
//                     <div
//                       style={{
//                         fontWeight: "800",
//                         color: "#f59e0b",
//                         fontSize: "15px",
//                       }}
//                     >
//                       {toMoney(summary.pendingByBank[b.key] || 0)}
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }






import React, { useEffect, useState } from "react";
import { BANKS, toMoney } from "../store";

// StatCard component (original design kept)
function StatCard({ title, value, hint, variant = "default" }) {
  const variants = {
    blue: {
      bg: "linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)",
      hoverBg: "linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)",
      shadow: "0 10px 25px rgba(59, 130, 246, 0.2)",
      hoverShadow: "0 20px 40px rgba(59, 130, 246, 0.4)",
      text: "#fff",
      hintColor: "rgba(255,255,255,0.8)",
    },
    default: {
      bg: "rgba(255, 255, 255, 0.7)",
      hoverBg: "rgba(255, 255, 255, 0.9)",
      shadow: "0 8px 32px rgba(31, 38, 135, 0.07)",
      hoverShadow: "0 12px 40px rgba(31, 38, 135, 0.15)",
      border: "1px solid rgba(255, 255, 255, 0.18)",
      hoverBorder: "1px solid #3b82f6",
      text: "#1e293b",
      hintColor: "#64748b",
    },
  };

  const style = variants[variant] || variants.default;

  return (
    <div
      style={{
        background: style.bg,
        color: style.text,
        borderRadius: "20px",
        padding: "24px 28px",
        boxShadow: style.shadow,
        border: style.border || "none",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        width: "100%",
        boxSizing: "border-box",
        minWidth: "0",
      }}
    >
      <div
        style={{
          fontSize: "12px",
          fontWeight: "700",
          opacity: 0.6,
          textTransform: "uppercase",
          letterSpacing: "1px",
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontSize: "clamp(22px, 6vw, 26px)",
          fontWeight: "800",
        }}
      >
        {value}
      </div>
      {hint && (
        <div
          style={{
            fontSize: "12px",
            color: style.hintColor,
            marginTop: "4px",
            fontWeight: "500",
          }}
        >
          {hint}
        </div>
      )}
    </div>
  );
}

// Dashboard component
export default function Dashboard() {
  const [summary, setSummary] = useState({
    totalBankBalance: 0,
    totalReceived: 0,
    totalPending: 0,
    totalPaid: 0,
    bankBalanceByBank: {},
    totalCashInHand: 0,
    receivedByBank: {},
    pendingByBank: {},
    paidByBank: {},
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // useEffect(() => {
  //   async function fetchState() {
  //     try {
  //       // Main state (receivings)
  //       const resState = await fetch("https://accounts-sps-backend-git-main-secure-path-solutions-projects.vercel.app/api/state");
  //       if (!resState.ok) throw new Error("Failed to fetch state");
  //       const stateData = await resState.json();

  //       //  Payments / Expenses
  //       const resPayments = await fetch("https://accounts-sps-backend-git-main-secure-path-solutions-projects.vercel.app/api/payments");
  //       if (!resPayments.ok) throw new Error("Failed to fetch payments");
  //       const payments = await resPayments.json();

  //       //  Salaries
  //       const resSalaries = await fetch("https://accounts-sps-backend-git-main-secure-path-solutions-projects.vercel.app/api/salaries");
  //       if (!resSalaries.ok) throw new Error("Failed to fetch salaries");
  //       const salaries = await resSalaries.json();

  //       //  Inventory Requests (Accountant Receipts)
  //       const resInventory = await fetch("https://accounts-sps-backend-git-main-secure-path-solutions-projects.vercel.app/api/inventory-requests");
  //       if (!resInventory.ok) throw new Error("Failed to fetch inventory requests");
  //       const inventoryRequests = await resInventory.json();

  //       //  Normalize bank keys
  //       const normalizeBankKey = (bankName) => {
  //         if (!bankName) return "";
  //         const b = bankName.trim().toLowerCase();
  //         if (b === "bank islami" || b === "islamic bank") return "BANK_ISLAMI";
  //         if (b === "hbl") return "HBL";
  //         return bankName.toUpperCase().replace(/\s+/g, "_");
  //       };

  //       // Initial values
  //       const openingBalances = stateData.openingBalances || {};
  //       let bankBalanceByBank = { ...openingBalances };
  //       let receivedByBank = {};
  //       let pendingByBank = {};
  //       let paidByBank = {};

  //       let totalReceived = 0;
  //       let totalPending = 0;
  //       let totalPaid = 0;

  //       // ─── RECEIVINGS ─────────────────────────────
  //       (stateData.receivings || []).forEach((r) => {
  //         const bank = normalizeBankKey(r.bank);
  //         const amount = Number(r.amount) || 0;
  //         const status = r.status?.toLowerCase();

  //         if (status === "received") {
  //           totalReceived += amount;
  //           receivedByBank[bank] = (receivedByBank[bank] || 0) + amount;
  //           bankBalanceByBank[bank] = (bankBalanceByBank[bank] || 0) + amount;
  //         }

  //         if (status === "pending") {
  //           totalPending += amount;
  //           pendingByBank[bank] = (pendingByBank[bank] || 0) + amount;
  //         }
          
  //       });

  //       // ─── PAYMENTS / EXPENSES ───────────────────
  //       (payments || []).forEach((p) => {
  //         const bank = normalizeBankKey(p.bank);
  //         const amount = Number(p.amount) || 0;
  //         const status = p.status?.toLowerCase();

  //         if (status === "paid") {
  //           totalPaid += amount;
  //           paidByBank[bank] = (paidByBank[bank] || 0) + amount;
  //           bankBalanceByBank[bank] = (bankBalanceByBank[bank] || 0) - amount;
  //         }
  //       });

  //       // ─── SALARIES ──────────────────────────────
  //       (salaries || []).forEach((s) => {
  //         const bank = normalizeBankKey(s.bank);
  //         const amount = Number(s.amount) || 0;
  //         const status = s.status?.toLowerCase();

  //         if (status === "paid") {
  //           totalPaid += amount;
  //           paidByBank[bank] = (paidByBank[bank] || 0) + amount;
  //           bankBalanceByBank[bank] = (bankBalanceByBank[bank] || 0) - amount;
  //         }
  //       });

  //       // ─── INVENTORY RECEIPTS (ACCOUNTANT) ───────
  //       (inventoryRequests || []).forEach((r) => {
  //         if (!r.receipt) return;

  //         const bank = normalizeBankKey(r.receipt.bank);
  //         const amount = Number(r.receipt.amount) || 0;
  //         const status = r.receipt.paymentStatus?.toLowerCase();

  //         if (status === "paid") {
  //           totalPaid += amount;
  //           paidByBank[bank] = (paidByBank[bank] || 0) + amount;
  //           bankBalanceByBank[bank] = (bankBalanceByBank[bank] || 0) - amount;
  //         }
  //       });

  //       // ─── TOTAL BANK BALANCE ────────────────────
  //       const totalBankBalance = Object.values(bankBalanceByBank).reduce(
  //         (a, b) => a + b,
  //         0,
  //       );

  //       // ─── SET STATE ─────────────────────────────
  //       setSummary({
  //         totalBankBalance,
  //         totalReceived,
  //         totalPending,
  //         totalPaid,
  //         bankBalanceByBank,
  //         receivedByBank,
  //         pendingByBank,
         
  //         paidByBank,
  //       });

  //       setLoading(false);
  //     } catch (err) {
  //       console.error(err);
  //       setError(err.message || "Dashboard fetch error");
  //       setLoading(false);
  //     }
  //   }

  //   fetchState();
  // }, []);
    useEffect(() => {
    async function fetchState() {
      try {
        // 1️⃣ Main state (receivings)
        const resState = await fetch("https://accounts-sps-backend-git-main-secure-path-solutions-projects.vercel.app/api/state");
        if (!resState.ok) throw new Error("Failed to fetch state");
        const stateData = await resState.json();

        // 2️⃣ Payments / Expenses
        const resPayments = await fetch("https://accounts-sps-backend-git-main-secure-path-solutions-projects.vercel.app/api/payments");
        if (!resPayments.ok) throw new Error("Failed to fetch payments");
        const payments = await resPayments.json();

        // 3️⃣ Salaries
        const resSalaries = await fetch("https://accounts-sps-backend-git-main-secure-path-solutions-projects.vercel.app/api/salaries");
        if (!resSalaries.ok) throw new Error("Failed to fetch salaries");
        const salaries = await resSalaries.json();

        // 4️⃣ Inventory Requests (Accountant Receipts)
        const resInventory = await fetch("https://accounts-sps-backend-git-main-secure-path-solutions-projects.vercel.app/api/inventory-requests");
        if (!resInventory.ok)
          throw new Error("Failed to fetch inventory requests");
        const inventoryRequests = await resInventory.json();

        // 🔑 Normalize bank keys
        const normalizeBankKey = (bankName) => {
          if (!bankName) return "";
          const b = bankName.trim().toLowerCase();
          if (b === "bank islami" || b === "islamic bank") return "BANK_ISLAMI";
          if (b === "hbl") return "HBL";
          return bankName.toUpperCase().replace(/\s+/g, "_");
        };

        // Initial values
        const openingBalances = stateData.openingBalances || {};
        let bankBalanceByBank = { ...openingBalances };
        let receivedByBank = {};
        let pendingByBank = {};
        let paidByBank = {};

        let totalReceived = 0;
        let totalPending = 0;
        let totalPaid = 0;

        // ─── RECEIVINGS ─────────────────────────────
        (stateData.receivings || []).forEach((r) => {
          const bank = normalizeBankKey(r.bank);
          const amount = Number(r.amount) || 0;
          const status = r.status?.toLowerCase();

          if (status === "received") {
            totalReceived += amount;
            receivedByBank[bank] = (receivedByBank[bank] || 0) + amount;
            bankBalanceByBank[bank] = (bankBalanceByBank[bank] || 0) + amount;
          }

          if (status === "pending") {
            totalPending += amount;
            pendingByBank[bank] = (pendingByBank[bank] || 0) + amount;
          }
        });

        // ─── PAYMENTS / EXPENSES ───────────────────
        (payments || []).forEach((p) => {
          const bank = normalizeBankKey(p.bank);
          const amount = Number(p.amount) || 0;
          const status = p.status?.toLowerCase();

          if (status === "paid") {
            totalPaid += amount;
            paidByBank[bank] = (paidByBank[bank] || 0) + amount;
            bankBalanceByBank[bank] = (bankBalanceByBank[bank] || 0) - amount;
          }
        });

        // ─── SALARIES ──────────────────────────────
        (salaries || []).forEach((s) => {
          const bank = normalizeBankKey(s.bank);
          const amount = Number(s.amount) || 0;
          const status = s.status?.toLowerCase();

          if (status === "paid") {
            totalPaid += amount;
            paidByBank[bank] = (paidByBank[bank] || 0) + amount;
            bankBalanceByBank[bank] = (bankBalanceByBank[bank] || 0) - amount;
          }
        });

        // ─── INVENTORY RECEIPTS (ACCOUNTANT) ───────
        (inventoryRequests || []).forEach((r) => {
          if (!r.receipt) return;

          const bank = normalizeBankKey(r.receipt.bank);
          const amount = Number(r.receipt.amount) || 0;
          const status = r.receipt.paymentStatus?.toLowerCase();

          if (status === "paid") {
            totalPaid += amount;
            paidByBank[bank] = (paidByBank[bank] || 0) + amount;
            bankBalanceByBank[bank] = (bankBalanceByBank[bank] || 0) - amount;
          }
        });

        // ─── TOTAL BANK BALANCE ────────────────────
        const totalBankBalance = Object.values(bankBalanceByBank).reduce(
          (a, b) => a + b,
          0,
        );

        // ─── SET STATE ─────────────────────────────
        setSummary({
          totalBankBalance,
          totalReceived,
          totalPending,
          totalPaid,
          bankBalanceByBank,
          receivedByBank,
          pendingByBank,
          paidByBank,
        });

        setLoading(false);
      } catch (err) {
        console.error(err);
        setError(err.message || "Dashboard fetch error");
        setLoading(false);
      }
    }

    fetchState();
  }, []);
  if (loading) return <div style={{ padding: "40px", textAlign: "center" }}>Loading...</div>;
  if (error) return <div style={{ padding: "40px", color: "red", textAlign: "center" }}>Error: {error}</div>;

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "clamp(24px, 5vw, 40px) clamp(16px, 4vw, 24px)",
        backgroundColor: "#f8fafc",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
        {/* Header */}
        <div
          style={{
            marginBottom: "40px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            alignItems: "flex-start",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "clamp(28px, 7vw, 32px)",
                fontWeight: "800",
                color: "#0f172a",
                margin: 0,
              }}
            >
              Finance <span style={{ color: "#3b82f6" }}>Dashboard</span>
            </h1>
            <p
              style={{
                color: "#64748b",
                margin: "4px 0 0",
                fontSize: "clamp(14px, 4vw, 16px)",
                fontWeight: "500",
              }}
            >
              Monitoring real-time cashflow and bank assets
            </p>
          </div>
          <div
            style={{
              padding: "8px 16px",
              background: "#fff",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
              fontSize: "14px",
              fontWeight: "600",
              color: "black",
            }}
          >
            Today: {new Date().toLocaleDateString()}
          </div>
        </div>

        {/* Stats Row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "24px",
            marginBottom: "48px",
          }}
        >
          <StatCard
            title="Total Bank Balance"
            value={toMoney(summary.totalBankBalance)}
            variant="blue"
            hint="Sum of all bank assets"
          />
          <StatCard
            title="Total Received"
            value={toMoney(summary.totalReceived)}
            hint="Status: received"
          />
          <StatCard
            title="Total Paid"
            value={toMoney(summary.totalPaid)}
            hint="Operational expenses"
          />
          <StatCard
            title="Pending"
            value={toMoney(summary.totalPending)}
            hint="Status: pending"
          />
           <StatCard
            title="Cash in Hand"
            value={toMoney(summary.totalCashInHand || 0)}
            hint="Status: Cash in hand"
          />
        </div>

        {/* Bank Breakdown - FIXED for mobile */}
        <div
          style={{
            background: "#fff",
            borderRadius: "24px",
            padding: "clamp(20px, 5vw, 32px)",
            boxShadow: "0 20px 50px rgba(0,0,0,0.04)",
            border: "1px solid #f1f5f9",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "32px",
            }}
          >
            <div
              style={{
                width: "4px",
                height: "24px",
                background: "#3b82f6",
                borderRadius: "10px",
              }}
            ></div>
            <h2
              style={{
                fontSize: "clamp(20px, 5.5vw, 22px)",
                fontWeight: "800",
                color: "#0f172a",
                margin: 0,
              }}
            >
              Bank Account Breakdown
            </h2>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "clamp(16px, 4vw, 24px)",
            }}
          >
            {BANKS.map((b) => (
              <div
                key={b.key}
                style={{
                  width: "100%",
                  padding: "24px",
                  borderRadius: "20px",
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  boxSizing: "border-box",
                  display: "flex",
                  flexDirection: "column",
                  gap: "20px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "12px",
                  }}
                >
                  <span
                    style={{
                      fontWeight: "700",
                      fontSize: "clamp(15px, 4.2vw, 16px)",
                      color: "#334155",
                    }}
                  >
                    {b.label}
                  </span>
                  <span
                    style={{
                      fontSize: "clamp(20px, 5.8vw, 24px)",
                      fontWeight: "800",
                      color: "#2563eb",
                    }}
                  >
                    {toMoney(summary.bankBalanceByBank[b.key] || 0)}
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "clamp(12px, 3.5vw, 16px)",
                    background: "#fff",
                    padding: "16px",
                    borderRadius: "16px",
                    border: "1px solid #f1f5f9",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div
                      style={{
                        color: "#94a3b8",
                        fontSize: "clamp(10px, 3vw, 11px)",
                        fontWeight: "700",
                        textTransform: "uppercase",
                      }}
                    >
                      Received
                    </div>
                    <div
                      style={{
                        fontWeight: "800",
                        color: "#10b981",
                        fontSize: "clamp(14px, 4vw, 16px)",
                      }}
                    >
                      {toMoney(summary.receivedByBank[b.key] || 0)}
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div
                      style={{
                        color: "#94a3b8",
                        fontSize: "clamp(10px, 3vw, 11px)",
                        fontWeight: "700",
                        textTransform: "uppercase",
                      }}
                    >
                      Paid
                    </div>
                    <div
                      style={{
                        fontWeight: "800",
                        color: "#ef4444",
                        fontSize: "clamp(14px, 4vw, 16px)",
                      }}
                    >
                      {toMoney(summary.paidByBank[b.key] || 0)}
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div
                      style={{
                        color: "#94a3b8",
                        fontSize: "clamp(10px, 3vw, 11px)",
                        fontWeight: "700",
                        textTransform: "uppercase",
                      }}
                    >
                      Pending
                    </div>
                    <div
                      style={{
                        fontWeight: "800",
                        color: "#f59e0b",
                        fontSize: "clamp(14px, 4vw, 16px)",
                      }}
                    >
                      {toMoney(summary.pendingByBank[b.key] || 0)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}