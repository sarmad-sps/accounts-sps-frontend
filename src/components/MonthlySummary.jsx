// import React, { useState, useEffect, useMemo } from "react";
// import jsPDF from "jspdf";
// import autoTable from "jspdf-autotable";
// import splogo from "../assets/sps-logo.png";

// const FinanceStatementApp = () => {
//   const [allTransactions, setAllTransactions] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [base64Logo, setBase64Logo] = useState("");

//   const [viewType, setViewType] = useState("monthly"); 
//   const [month, setMonth] = useState(new Date().toLocaleString("default", { month: "long" }));
//   const [year, setYear] = useState(String(new Date().getFullYear()));
//   const [startDate, setStartDate] = useState("");
//   const [endDate, setEndDate] = useState("");

  
//   useEffect(() => {
//     const convertLogoToBase64 = async () => {
//       try {
//         const response = await fetch(splogo);
//         const blob = await response.blob();
//         const reader = new FileReader();
//         reader.onloadend = () => setBase64Logo(reader.result);
//         reader.readAsDataURL(blob);
//       } catch (error) {
//         console.error("Logo conversion error:", error);
//       }
//     };
//     convertLogoToBase64();
//   }, []);

//   // 2. Fetch Data
//   useEffect(() => {
//     async function buildLedger() {
//       try {
//         setLoading(true);
//         const ledger = [];
//         const baseUrl = "https://accounts-sps-backend-git-main-secure-path-solutions-projects.vercel.app/api";

//         const [stateRes, payRes, salRes, invRes] = await Promise.all([
//           fetch(`${baseUrl}/state`),
//           fetch(`${baseUrl}/payments`),
//           fetch(`${baseUrl}/salaries`),
//           fetch(`${baseUrl}/inventory-requests`),
//         ]);

//         const stateData = await stateRes.json();
//         const payments = await payRes.json();
//         const salaries = await salRes.json();
//         const inventory = await invRes.json();

//         (stateData.receivings || []).forEach((r) => {
//           if (r.status?.toLowerCase() === "received") {
//             const d = new Date(r.createdAt || r.date);
//             ledger.push({ id: `rec-${r._id}`, rawDate: d, date: d.toDateString(), name: r.clientName || "Receiving", desc: r.notes || "Amount Received", type: "credit", amount: Number(r.amount), month: d.toLocaleString("default", { month: "long" }), year: String(d.getFullYear()), paymentMode: r.paymentMode || "Cash" });
//           }
//         });

//         payments.forEach((p) => {
//           if (p.status?.toLowerCase() === "paid") {
//             const d = new Date(p.paymentDate || p.date);
//             ledger.push({ id: `pay-${p._id}`, rawDate: d, date: d.toDateString(), name: p.payee || "Payment", desc: p.description || p.category || "Expense", type: "debit", amount: Number(p.amount), month: d.toLocaleString("default", { month: "long" }), year: String(d.getFullYear()), paymentMode: p.paymentMode || "Cash" });
//           }
//         });

//         salaries.forEach((s) => {
//           if (s.status?.toLowerCase() === "paid") {
//             const d = new Date(s.paymentDate || s.date);
//             ledger.push({ id: `sal-${s._id}`, rawDate: d, date: d.toDateString(), name: s.employeeName || "Salary", desc: `Salary – ${s.month}`, type: "debit", amount: Number(s.amount), month: d.toLocaleString("default", { month: "long" }), year: String(d.getFullYear()), paymentMode: s.paymentMethod || "Cash" });
//           }
//         });

//         inventory.forEach((r) => {
//           if (r.receipt?.paymentStatus === "Paid") {
//             const d = new Date(r.receipt.receivedAt);
//             ledger.push({ id: `inv-${r._id}`, rawDate: d, date: d.toDateString(), name: r.store || "Store", desc: r.item || "Inventory Item", type: "debit", amount: Number(r.receipt.amount), month: d.toLocaleString("default", { month: "long" }), year: String(d.getFullYear()), paymentMode: r.receipt?.paymentMethod || "Cash" });
//           }
//         });

//         setAllTransactions(ledger.sort((a, b) => b.rawDate - a.rawDate));
//       } catch (err) { console.error(err); } finally { setLoading(false); }
//     }
//     buildLedger();
//   }, []);

//   // 3. Filtering
//   const filtered = useMemo(() => {
//     return allTransactions.filter((t) => {
//       if (viewType === "monthly") return t.month === month && t.year === year;
//       if (viewType === "yearly") return t.year === year;
//       if (viewType === "custom") {
//         if (!startDate || !endDate) return true;
//         const start = new Date(startDate);
//         const end = new Date(endDate);
//         end.setHours(23, 59, 59);
//         return t.rawDate >= start && t.rawDate <= end;
//       }
//       return true;
//     });
//   }, [allTransactions, viewType, month, year, startDate, endDate]);

//   const totalCredit = filtered.filter(t => t.type === "credit").reduce((sum, t) => sum + t.amount, 0);
//   const totalDebit = filtered.filter(t => t.type === "debit").reduce((sum, t) => sum + t.amount, 0);

//   // 0. Inject Spinner Animation
// useEffect(() => {
//   const style = document.createElement('style');
//   style.innerHTML = `
//     @keyframes spin {
//       to { transform: rotate(360deg); }
//     }
//   `;
//   document.head.appendChild(style);
//   return () => document.head.removeChild(style); // Cleanup on unmount
// }, []);
//   // 4. PDF
//   const downloadPDF = () => {
//     if (filtered.length === 0) return alert("No data available for the selected range.");
//     const doc = new jsPDF();
//     let reportTitle = viewType === "monthly" ? `${month} ${year}` : viewType === "yearly" ? `Year ${year}` : `${startDate} to ${endDate}`;
    
//     if (base64Logo) doc.addImage(base64Logo, "PNG", 15, 10, 22, 22);
//     doc.setFontSize(18).setFont("helvetica", "bold").text("SECURE PATH SOLUTIONS PVT LTD", 42, 20);
//     doc.setFontSize(10).setFont("helvetica", "normal").setTextColor(100).text(`Financial Ledger Report | ${reportTitle}`, 42, 27);

//     autoTable(doc, {
//       startY: 40,
//       head: [["Date", "Entity Name", "Description", "Mode", "Credit (PKR)", "Debit (PKR)"]],
//       body: filtered.map(t => [t.date, t.name, t.desc, t.paymentMode || "—", t.type === "credit" ? t.amount.toLocaleString() : "-", t.type === "debit" ? t.amount.toLocaleString() : "-"]),
//       headStyles: { fillColor: [30, 58, 138] },
//       columnStyles: { 4: { halign: "right" }, 5: { halign: "right" } },
//       styles: { fontSize: 8 },
//     });

//     const finalY = doc.lastAutoTable.finalY + 10;
//     doc.setFontSize(11).setTextColor(0).text(`Total Credit: Rs. ${totalCredit.toLocaleString()}`, 195, finalY, { align: "right" });
//     doc.text(`Total Debit: Rs. ${totalDebit.toLocaleString()}`, 195, finalY + 7, { align: "right" });
//     doc.setFont("helvetica", "bold").text(`Net Balance: Rs. ${(totalCredit - totalDebit).toLocaleString()}`, 195, finalY + 14, { align: "right" });

//     doc.save(`SPS_Ledger_${viewType}.pdf`);
//   };

//   const getPaymentModeColor = (mode) => {
//     const map = { Cash: "#f59e0b", Online: "#3b82f6", Check: "#8b5cf6", "Bank Transfer": "#10b981" };
//     return map[mode] || "#64748b";
//   };

//  if (loading) return (
//   <div style={loaderWrapper}> 
//     <div style={spinner}></div> 
//     <p style={{ color: "#000000", fontWeight: "600", marginTop: "10px" }}>
//       Fetching Financial Data...
//     </p> 
//   </div>
// );
//   return (
//     <div style={containerStyle}>
//       {/* HEADER SECTION */}
//       <header style={headerCard}>
//         <div style={brandBox}>
//           <img src={splogo} alt="Logo" style={{ height: "48px" }} />
//           <div>
//             <h1 style={titleStyle}>Financial Ledger</h1>
//             <p style={subtitleStyle}>Secure Path Solutions Dashboard</p>
//           </div>
//         </div>

//         <div style={filterActionBox}>
//           <div style={inputGroup}>
//             <label style={labelMini}>VIEW TYPE</label>
//             <select value={viewType} onChange={(e) => setViewType(e.target.value)} style={selectStyled}>
//               <option value="monthly">Monthly</option>
//               <option value="yearly">Yearly</option>
//               <option value="custom">Date Range</option>
//             </select>
//           </div>

//           {viewType === "monthly" && (
//             <div style={inputGroup}>
//               <label style={labelMini}>SELECT MONTH & YEAR</label>
//               <div style={{ display: "flex", gap: "8px" }}>
//                 <select value={month} onChange={(e) => setMonth(e.target.value)} style={selectStyled}>
//                   {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map(m => <option key={m} value={m}>{m}</option>)}
//                 </select>
//                 <select value={year} onChange={(e) => setYear(e.target.value)} style={selectStyled}>
//                   {["2024", "2025", "2026","2027","2028"].map(y => <option key={y} value={y}>{y}</option>)}
//                 </select>
//               </div>
//             </div>
//           )}

//           {viewType === "yearly" && (
//             <div style={inputGroup}>
//               <label style={labelMini}>SELECT YEAR</label>
//               <select value={year} onChange={(e) => setYear(e.target.value)} style={selectStyled}>
//                 {["2024", "2025", "2026","2027","2028"].map(y => <option key={y} value={y}>{y}</option>)}
//               </select>
//             </div>
//           )}

//           {viewType === "custom" && (
//             <div style={inputGroup}>
//               <label style={labelMini}>SELECT DATE RANGE</label>
//               <div style={{ display: "flex", gap: "8px" }}>
//                 <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={selectStyled} />
//                 <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={selectStyled} />
//               </div>
//             </div>
//           )}

//           <button onClick={downloadPDF} style={btnDownload}>
//             <svg width="16" height="16" fill="white" viewBox="0 0 16 16" style={{ marginRight: "8px" }}>
//               <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
//               <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
//             </svg>
//             Export PDF
//           </button>
//         </div>
//       </header>

//       {/* SUMMARY DASHBOARD */}
//       <div style={statsGrid}>
//         <div style={{ ...statCard, borderTop: "4px solid #10b981" }}>
//           <span style={statLabel}>Total Credits</span>
//           <div style={statValue}>Rs. {totalCredit.toLocaleString()}</div>
//         </div>
//         <div style={{ ...statCard, borderTop: "4px solid #ef4444" }}>
//           <span style={statLabel}>Total Debits</span>
//           <div style={statValue}>Rs. {totalDebit.toLocaleString()}</div>
//         </div>
//         <div style={{ ...statCard, borderTop: "4px solid #3b82f6" }}>
//           <span style={statLabel}>Net Balance</span>
//           <div style={{ ...statValue, color: totalCredit - totalDebit >= 0 ? "#1e40af" : "#b91c1c" }}>
//             Rs. {(totalCredit - totalDebit).toLocaleString()}
//           </div>
//         </div>
//       </div>

//       {/* TABLE SECTION */}
//       <div style={tableWrapper}>
//         <div style={tableHeader}>
//             <h3 style={{ margin: 0, fontSize: "16px" ,color:"black"}}>Transaction Records</h3>
//             <span style={badgeCount}>{filtered.length} entries</span>
//         </div>
//         <div style={{ overflowX: "auto" }}>
//           <table style={mainTable}>
//             <thead>
//               <tr style={theadRow}>
//                 <th style={thCol}>DATE</th>
//                 <th style={thCol}>ENTITY / NAME</th>
//                 <th style={thCol}>DESCRIPTION</th>
//                 <th style={thCol}>PAYMENT MODE</th>
//                 <th style={{ ...thCol, textAlign: "right" }}>CREDIT</th>
//                 <th style={{ ...thCol, textAlign: "right" }}>DEBIT</th>
//               </tr>
//             </thead>
//             <tbody>
//               {filtered.length > 0 ? (
//                 filtered.map((t) => (
//                   <tr key={t.id} style={tbodyRow}>
//                     <td style={tdCol}>{t.date}</td>
//                     <td style={{ ...tdCol, fontWeight: "600", color: "#1e293b" }}>{t.name}</td>
//                     <td style={tdCol}>{t.desc}</td>
//                     <td style={tdCol}>
//                       <span style={{ ...modeBadge, backgroundColor: getPaymentModeColor(t.paymentMode) }}>{t.paymentMode}</span>
//                     </td>
//                     <td style={{ ...tdCol, textAlign: "right", color: "#059669", fontWeight: "700" }}>
//                       {t.type === "credit" ? `Rs ${t.amount.toLocaleString()}` : "—"}
//                     </td>
//                     <td style={{ ...tdCol, textAlign: "right", color: "#dc2626", fontWeight: "700" }}>
//                       {t.type === "debit" ? `Rs ${t.amount.toLocaleString()}` : "—"}
//                     </td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr><td colSpan="6" style={noDataStyle}>No transactions found for the selected criteria.</td></tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// };

// // --- STYLING (Modern Dashboard) ---
// const containerStyle = { backgroundColor: "#f1f5f9", minHeight: "100vh", padding: "30px", fontFamily: "'Inter', sans-serif" };
// const headerCard = { backgroundColor: "white", padding: "24px", borderRadius: "16px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px", marginBottom: "30px", border: "1px solid #e2e8f0" };
// const brandBox = { display: "flex", alignItems: "center", gap: "15px" };
// const titleStyle = { margin: 0, fontSize: "24px", fontWeight: "800", color: "#1e3a8a" };
// const subtitleStyle = { margin: 0, fontSize: "13px", color: "#64748b" };
// const filterActionBox = { display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "flex-end" };
// const inputGroup = { display: "flex", flexDirection: "column", gap: "6px" };
// const labelMini = { fontSize: "10px", fontWeight: "bold", color: "#94a3b8", letterSpacing: "1px" };
// const selectStyled = { 
//   padding: "10px 14px", 
//   borderRadius: "10px", 
//   border: "1px solid #cbd5e1", 
//   fontSize: "14px", 
//   outline: "none", 
//   backgroundColor: "#ffffff", 
//   color: "#000000",          
//   fontWeight: "500",
//   cursor: "pointer" 
// };
// const btnDownload = { backgroundColor: "#1e3a8a", color: "white", border: "none", padding: "12px 20px", borderRadius: "10px", fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", transition: "0.2s" };
// const statsGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px", marginBottom: "30px" };
// const statCard = { backgroundColor: "white", padding: "24px", borderRadius: "16px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0" };
// const statLabel = { color: "#64748b", fontSize: "13px", fontWeight: "600", textTransform: "uppercase" };
// const statValue = { fontSize: "28px", fontWeight: "800", marginTop: "10px", color: "#1e293b" };
// const tableWrapper = { backgroundColor: "white", borderRadius: "16px", overflow: "hidden", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" };
// const tableHeader = { padding: "20px 24px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" };
// const badgeCount = { backgroundColor: "#eff6ff", color: "#2563eb", padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "600" };
// const mainTable = { width: "100%", borderCollapse: "collapse" };
// const theadRow = { backgroundColor: "#f8fafc" };
// const thCol = { padding: "16px 24px", textAlign: "left", fontSize: "11px", fontWeight: "bold", color: "#64748b", letterSpacing: "0.5px" };
// const tbodyRow = { borderBottom: "1px solid #f1f5f9", transition: "0.2s" };
// const tdCol = { padding: "16px 24px", fontSize: "14px", color: "#475569" };
// const modeBadge = { padding: "4px 10px", borderRadius: "8px", color: "white", fontSize: "11px", fontWeight: "bold" };
// const noDataStyle = { padding: "60px", textAlign: "center", color: "#94a3b8" };
// const loaderWrapper = { 
//   height: "100vh", 
//   display: "flex", 
//   flexDirection: "column", 
//   justifyContent: "center", 
//   alignItems: "center", 
//   backgroundColor: "#f8fafc",
//   fontFamily: "'Inter', sans-serif"
// };

// const spinner = { 
//   width: "50px", 
//   height: "50px", 
//   border: "5px solid #e2e8f0", 
//   borderTop: "5px solid #1e3a8a", 
//   borderRadius: "50%", 
//   animation: "spin 0.8s linear infinite", 
//   marginBottom: "15px"
// };
// export default FinanceStatementApp;
import React, { useState, useEffect, useMemo } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import splogo from "../assets/sps-logo.png";

const FinanceStatementApp = () => {
  const [allTransactions, setAllTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [base64Logo, setBase64Logo] = useState("");

  // --- Filter States ---
  const [viewType, setViewType] = useState("monthly");
  const [month, setMonth] = useState(new Date().toLocaleString("default", { month: "long" }));
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // 1. Inject Spinner Animation & Logo Conversion
  useEffect(() => {
    // Inject CSS for spinner
    const style = document.createElement('style');
    style.innerHTML = `@keyframes spin { to { transform: rotate(360deg); } }`;
    document.head.appendChild(style);

    const convertLogoToBase64 = async () => {
      try {
        const response = await fetch(splogo);
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = () => setBase64Logo(reader.result);
        reader.readAsDataURL(blob);
      } catch (error) {
        console.error("Logo conversion error:", error);
      }
    };
    convertLogoToBase64();

    return () => document.head.removeChild(style);
  }, []);

  // 2. Fetch Data
  useEffect(() => {
    async function buildLedger() {
      try {
        setLoading(true);
        const ledger = [];
        const baseUrl = "https://accounts-sps-backend-git-main-secure-path-solutions-projects.vercel.app/api";

        const [stateRes, payRes, salRes, invRes] = await Promise.all([
          fetch(`${baseUrl}/state`),
          fetch(`${baseUrl}/payments`),
          fetch(`${baseUrl}/salaries`),
          fetch(`${baseUrl}/inventory-requests`),
        ]);

        const stateData = await stateRes.json();
        const payments = await payRes.json();
        const salaries = await salRes.json();
        const inventory = await invRes.json();

        (stateData.receivings || []).forEach((r) => {
          if (r.status?.toLowerCase() === "received") {
            const d = new Date(r.createdAt || r.date);
            ledger.push({ id: `rec-${r._id}`, rawDate: d, date: d.toDateString(), name: r.clientName || "Receiving", desc: r.notes || "Amount Received", type: "credit", amount: Number(r.amount), month: d.toLocaleString("default", { month: "long" }), year: String(d.getFullYear()), paymentMode: r.paymentMode || "Cash" });
          }
        });

        payments.forEach((p) => {
          if (p.status?.toLowerCase() === "paid") {
            const d = new Date(p.paymentDate || p.date);
            ledger.push({ id: `pay-${p._id}`, rawDate: d, date: d.toDateString(), name: p.payee || "Payment", desc: p.description || p.category || "Expense", type: "debit", amount: Number(p.amount), month: d.toLocaleString("default", { month: "long" }), year: String(d.getFullYear()), paymentMode: p.paymentMode || "Cash" });
          }
        });

        salaries.forEach((s) => {
          if (s.status?.toLowerCase() === "paid") {
            const d = new Date(s.paymentDate || s.date);
            ledger.push({ id: `sal-${s._id}`, rawDate: d, date: d.toDateString(), name: s.employeeName || "Salary", desc: `Salary – ${s.month}`, type: "debit", amount: Number(s.amount), month: d.toLocaleString("default", { month: "long" }), year: String(d.getFullYear()), paymentMode: s.paymentMethod || "Cash" });
          }
        });

        inventory.forEach((r) => {
          if (r.receipt?.paymentStatus === "Paid") {
            const d = new Date(r.receipt.receivedAt);
            ledger.push({ id: `inv-${r._id}`, rawDate: d, date: d.toDateString(), name: r.store || "Store", desc: r.item || "Inventory Item", type: "debit", amount: Number(r.receipt.amount), month: d.toLocaleString("default", { month: "long" }), year: String(d.getFullYear()), paymentMode: r.receipt?.paymentMethod || "Cash" });
          }
        });

        setAllTransactions(ledger.sort((a, b) => b.rawDate - a.rawDate));
      } catch (err) { console.error(err); } finally { setLoading(false); }
    }
    buildLedger();
  }, []);

  // 3. Filtering logic
  const filtered = useMemo(() => {
    return allTransactions.filter((t) => {
      if (viewType === "monthly") return t.month === month && t.year === year;
      if (viewType === "yearly") return t.year === year;
      if (viewType === "custom") {
        if (!startDate || !endDate) return true;
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59);
        return t.rawDate >= start && t.rawDate <= end;
      }
      return true;
    });
  }, [allTransactions, viewType, month, year, startDate, endDate]);

  const totalCredit = filtered.filter(t => t.type === "credit").reduce((sum, t) => sum + t.amount, 0);
  const totalDebit = filtered.filter(t => t.type === "debit").reduce((sum, t) => sum + t.amount, 0);
  const netBalance = totalCredit - totalDebit;

  // 4. PDF Generation
  const downloadPDF = () => {
    if (filtered.length === 0) return alert("No data available for the selected range.");
    const doc = new jsPDF();
    let reportTitle = viewType === "monthly" ? `${month} ${year}` : viewType === "yearly" ? `Year ${year}` : `${startDate} to ${endDate}`;
    
    if (base64Logo) doc.addImage(base64Logo, "PNG", 15, 10, 22, 22);
    doc.setFontSize(18).setFont("helvetica", "bold").setTextColor(30, 58, 138).text("SECURE PATH SOLUTIONS PVT LTD", 42, 20);
    doc.setFontSize(10).setFont("helvetica", "normal").setTextColor(100).text(`Financial Ledger Report | ${reportTitle}`, 42, 27);

    autoTable(doc, {
      startY: 40,
      head: [["Date", "Entity Name", "Description", "Mode", "Credit (PKR)", "Debit (PKR)"]],
      body: filtered.map(t => [t.date, t.name, t.desc, t.paymentMode || "—", t.type === "credit" ? t.amount.toLocaleString() : "-", t.type === "debit" ? t.amount.toLocaleString() : "-"]),
      headStyles: { fillColor: [30, 58, 138] },
      columnStyles: { 4: { halign: "right" }, 5: { halign: "right" } },
      styles: { fontSize: 8 },
    });

    // --- Styled Summary Section ---
    const finalY = doc.lastAutoTable.finalY + 15;
    const rightEdge = 195;

    doc.setFontSize(10).setFont("helvetica", "normal").setTextColor(100);
    doc.text("Total Credit:", rightEdge - 45, finalY);
    doc.setTextColor(0).setFont("helvetica", "bold").text(`Rs. ${totalCredit.toLocaleString()}`, rightEdge, finalY, { align: "right" });

    doc.setFontSize(10).setFont("helvetica", "normal").setTextColor(100);
    doc.text("Total Debit:", rightEdge - 45, finalY + 7);
    doc.setTextColor(0).setFont("helvetica", "bold").text(`Rs. ${totalDebit.toLocaleString()}`, rightEdge, finalY + 7, { align: "right" });

    doc.setDrawColor(200);
    doc.line(rightEdge - 55, finalY + 10, rightEdge, finalY + 10);

    doc.setFontSize(12).setFont("helvetica", "bold");
    doc.setTextColor(netBalance >= 0 ? 30 : 185, netBalance >= 0 ? 58 : 28, netBalance >= 0 ? 138 : 28);
    doc.text("Net Balance:", rightEdge - 45, finalY + 17);
    doc.text(`Rs. ${netBalance.toLocaleString()}`, rightEdge, finalY + 17, { align: "right" });

    doc.save(`SPS_Ledger_${viewType}.pdf`);
  };

  const getPaymentModeColor = (mode) => {
    const map = { Cash: "#f59e0b", Online: "#3b82f6", Check: "#8b5cf6", "Bank Transfer": "#10b981" };
    return map[mode] || "#64748b";
  };

  if (loading) return (
    <div style={loaderWrapper}> 
      <div style={spinner}></div> 
      <p style={{ color: "#000000", fontWeight: "600", marginTop: "15px", fontSize: "16px" }}>
        Fetching Financial Data...
      </p> 
    </div>
  );

  return (
    <div style={containerStyle}>
      <header style={headerCard}>
        <div style={brandBox}>
          <img src={splogo} alt="Logo" style={{ height: "48px" }} />
          <div>
            <h1 style={titleStyle}>Financial Ledger</h1>
            <p style={subtitleStyle}>Secure Path Solutions Dashboard</p>
          </div>
        </div>

        <div style={filterActionBox}>
          <div style={inputGroup}>
            <label style={labelMini}>VIEW TYPE</label>
            <select value={viewType} onChange={(e) => setViewType(e.target.value)} style={selectStyled}>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
              <option value="custom">Date Range</option>
            </select>
          </div>

          {viewType === "monthly" && (
            <div style={inputGroup}>
              <label style={labelMini}>SELECT MONTH & YEAR</label>
              <div style={{ display: "flex", gap: "8px" }}>
                <select value={month} onChange={(e) => setMonth(e.target.value)} style={selectStyled}>
                  {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <select value={year} onChange={(e) => setYear(e.target.value)} style={selectStyled}>
                  {["2024", "2025", "2026","2027","2028"].map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>
          )}

          {viewType === "yearly" && (
            <div style={inputGroup}>
              <label style={labelMini}>SELECT YEAR</label>
              <select value={year} onChange={(e) => setYear(e.target.value)} style={selectStyled}>
                {["2024", "2025", "2026","2027","2028"].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          )}

          {viewType === "custom" && (
            <div style={inputGroup}>
              <label style={labelMini}>SELECT DATE RANGE</label>
              <div style={{ display: "flex", gap: "8px" }}>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={selectStyled} />
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={selectStyled} />
              </div>
            </div>
          )}

          <button onClick={downloadPDF} style={btnDownload}>
            <svg width="16" height="16" fill="white" viewBox="0 0 16 16" style={{ marginRight: "8px" }}>
              <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
              <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
            </svg>
            Export PDF
          </button>
        </div>
      </header>

      <div style={statsGrid}>
        <div style={{ ...statCard, borderTop: "4px solid #10b981" }}>
          <span style={statLabel}>Total Credits</span>
          <div style={statValue}>Rs. {totalCredit.toLocaleString()}</div>
        </div>
        <div style={{ ...statCard, borderTop: "4px solid #ef4444" }}>
          <span style={statLabel}>Total Debits</span>
          <div style={statValue}>Rs. {totalDebit.toLocaleString()}</div>
        </div>
        <div style={{ ...statCard, borderTop: "4px solid #3b82f6" }}>
          <span style={statLabel}>Net Balance</span>
          <div style={{ ...statValue, color: netBalance >= 0 ? "#1e40af" : "#b91c1c" }}>
            Rs. {netBalance.toLocaleString()}
          </div>
        </div>
      </div>

      <div style={tableWrapper}>
        <div style={tableHeader}>
            <h3 style={{ margin: 0, fontSize: "16px" ,color:"black"}}>Transaction Records</h3>
            <span style={badgeCount}>{filtered.length} entries</span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={mainTable}>
            <thead>
              <tr style={theadRow}>
                <th style={thCol}>DATE</th>
                <th style={thCol}>ENTITY / NAME</th>
                <th style={thCol}>DESCRIPTION</th>
                <th style={thCol}>PAYMENT MODE</th>
                <th style={{ ...thCol, textAlign: "right" }}>CREDIT</th>
                <th style={{ ...thCol, textAlign: "right" }}>DEBIT</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map((t) => (
                  <tr key={t.id} style={tbodyRow}>
                    <td style={tdCol}>{t.date}</td>
                    <td style={{ ...tdCol, fontWeight: "600", color: "#1e293b" }}>{t.name}</td>
                    <td style={tdCol}>{t.desc}</td>
                    <td style={tdCol}>
                      <span style={{ ...modeBadge, backgroundColor: getPaymentModeColor(t.paymentMode) }}>{t.paymentMode}</span>
                    </td>
                    <td style={{ ...tdCol, textAlign: "right", color: "#059669", fontWeight: "700" }}>
                      {t.type === "credit" ? `Rs ${t.amount.toLocaleString()}` : "—"}
                    </td>
                    <td style={{ ...tdCol, textAlign: "right", color: "#dc2626", fontWeight: "700" }}>
                      {t.type === "debit" ? `Rs ${t.amount.toLocaleString()}` : "—"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="6" style={noDataStyle}>No transactions found for the selected criteria.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// --- STYLING ---
const containerStyle = { backgroundColor: "#f1f5f9", minHeight: "100vh", padding: "30px", fontFamily: "'Inter', sans-serif" };
const headerCard = { backgroundColor: "white", padding: "24px", borderRadius: "16px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px", marginBottom: "30px", border: "1px solid #e2e8f0" };
const brandBox = { display: "flex", alignItems: "center", gap: "15px" };
const titleStyle = { margin: 0, fontSize: "24px", fontWeight: "800", color: "#1e3a8a" };
const subtitleStyle = { margin: 0, fontSize: "13px", color: "#64748b" };
const filterActionBox = { display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "flex-end" };
const inputGroup = { display: "flex", flexDirection: "column", gap: "6px" };
const labelMini = { fontSize: "10px", fontWeight: "bold", color: "#94a3b8", letterSpacing: "1px" };
const selectStyled = { padding: "10px 14px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "14px", outline: "none", backgroundColor: "#ffffff", color: "#000000", fontWeight: "500", cursor: "pointer" };
const btnDownload = { backgroundColor: "#1e3a8a", color: "white", border: "none", padding: "12px 20px", borderRadius: "10px", fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", transition: "0.2s" };
const statsGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px", marginBottom: "30px" };
const statCard = { backgroundColor: "white", padding: "24px", borderRadius: "16px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0" };
const statLabel = { color: "#64748b", fontSize: "13px", fontWeight: "600", textTransform: "uppercase" };
const statValue = { fontSize: "28px", fontWeight: "800", marginTop: "10px", color: "#1e293b" };
const tableWrapper = { backgroundColor: "white", borderRadius: "16px", overflow: "hidden", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" };
const tableHeader = { padding: "20px 24px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" };
const badgeCount = { backgroundColor: "#eff6ff", color: "#2563eb", padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "600" };
const mainTable = { width: "100%", borderCollapse: "collapse" };
const theadRow = { backgroundColor: "#f8fafc" };
const thCol = { padding: "16px 24px", textAlign: "left", fontSize: "11px", fontWeight: "bold", color: "#64748b", letterSpacing: "0.5px" };
const tbodyRow = { borderBottom: "1px solid #f1f5f9", transition: "0.2s" };
const tdCol = { padding: "16px 24px", fontSize: "14px", color: "#475569" };
const modeBadge = { padding: "4px 10px", borderRadius: "8px", color: "white", fontSize: "11px", fontWeight: "bold" };
const noDataStyle = { padding: "60px", textAlign: "center", color: "#94a3b8" };

// Loader Styles
const loaderWrapper = { 
  height: "100vh", 
  display: "flex", 
  flexDirection: "column", 
  justifyContent: "center", 
  alignItems: "center", 
  backgroundColor: "#f8fafc" 
};
const spinner = { 
  width: "50px", 
  height: "50px", 
  border: "5px solid #e2e8f0", 
  borderTop: "5px solid #1e3a8a", 
  borderRadius: "50%", 
  animation: "spin 0.8s linear infinite" 
};

export default FinanceStatementApp;