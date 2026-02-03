import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import splogo from "../assets/sps-logo.png"; 

const FinanceStatementApp = () => {
  const [allTransactions, setAllTransactions] = useState([]);
  const [month, setMonth] = useState(new Date().toLocaleString("default", { month: "long" }));
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [loading, setLoading] = useState(true);
  const [base64Logo, setBase64Logo] = useState("");

  
  useEffect(() => {
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
  }, []);

  // Fetch and Build Ledger
 useEffect(() => {
    async function buildLedger() {
      try {
        setLoading(true);

        const ledger = [];

        // ===== RECEIVINGS =====
        const stateRes = await fetch("https://accounts-sps-backend-git-main-secure-path-solutions-projects.vercel.app/api/state");
        const stateData = await stateRes.json();

        (stateData.receivings || []).forEach((r) => {
          if (r.status?.toLowerCase() === "received") {
            const d = new Date(r.createdAt || r.date);
            ledger.push({
              id: `rec-${r._id}`,
              date: d.toDateString(),
              name: r.clientName || "Receiving",
              desc: r.notes || "Amount Received",
              type: "credit",
              amount: Number(r.amount),
              month: d.toLocaleString("default", { month: "long" }),
              year: String(d.getFullYear()),
            });
          }
        });

        // ===== PAYMENTS =====
        const payRes = await fetch("https://accounts-sps-backend-git-main-secure-path-solutions-projects.vercel.app/api/payments");
        const payments = await payRes.json();

        payments.forEach((p) => {
          if (p.status?.toLowerCase() === "paid") {
            const d = new Date(p.paymentDate || p.date);
            ledger.push({
              id: `pay-${p._id}`,
              date: d.toDateString(),
              name: p.payee || "Payment",
              desc: p.description || p.category || "Expense",
              type: "debit",
              amount: Number(p.amount),
              month: d.toLocaleString("default", { month: "long" }),
              year: String(d.getFullYear()),
            });
          }
        });

        // ===== SALARIES =====
        const salRes = await fetch("https://accounts-sps-backend-git-main-secure-path-solutions-projects.vercel.app/api/salaries");
        const salaries = await salRes.json();

        salaries.forEach((s) => {
          if (s.status?.toLowerCase() === "paid") {
            const d = new Date(s.paymentDate || s.date);
            ledger.push({
              id: `sal-${s._id}`,
              date: d.toDateString(),
              name: s.employeeName || "Salary",
              desc: `Salary – ${s.month}`,
              type: "debit",
              amount: Number(s.amount),
              month: d.toLocaleString("default", { month: "long" }),
              year: String(d.getFullYear()),
            });
          }
        });

const invRes = await fetch("https://accounts-sps-backend-git-main-secure-path-solutions-projects.vercel.app/api/inventory-requests");
const inventory = await invRes.json();

inventory.forEach(r => {
  if (r.receipt?.paymentStatus === "Paid") {
    const d = new Date(r.receipt.receivedAt);
    const storeName = r.store || "Store"; 
    const itemName = r.item || "Inventory Item"; 
    ledger.push({
      id: `inv-${r._id}`,
      date: d.toDateString(),
      name: storeName, 
      desc: `${itemName} (${storeName})`, 
      type: "debit",
      amount: Number(r.receipt.amount),
      month: d.toLocaleString("default", { month: "long" }),
      year: String(d.getFullYear())
    });
  }
});

        setAllTransactions(ledger);
      } catch (err) {
        console.error("Ledger error:", err);
      } finally {
        setLoading(false); 
      }
    }

    buildLedger();
  }, []);
  const filtered = allTransactions.filter(t => t.month === month && t.year === year);
  const totalCredit = filtered.filter(t => t.type === "credit").reduce((sum, t) => sum + t.amount, 0);
  const totalDebit = filtered.filter(t => t.type === "debit").reduce((sum, t) => sum + t.amount, 0);
  const net = totalCredit - totalDebit;

  // --- PDF GENERATION WITH INTEGRATED TOTALS ---
  const downloadPDF = () => {
    if (filtered.length === 0) return alert("Selected month has no data.");
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // 1. Header
    doc.setFillColor(30, 58, 138); 
    doc.rect(0, 0, pageWidth, 40, "F");
    if (base64Logo) doc.addImage(base64Logo, 'PNG', 15, 8, 25, 25);
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18); doc.setFont("helvetica", "bold");
    doc.text("SECURE PATH SOLUTIONS PVT LTD", 45, 20);
    doc.setFontSize(10); doc.setFont("helvetica", "normal");
    doc.text(`Financial Ledger | ${month.toUpperCase()} ${year}`, 45, 28);

    // 2. Main Transaction Table
    autoTable(doc, {
      startY: 50,
      head: [["Date", "Entity Name", "Description", "Credit (PKR)", "Debit (PKR)"]],
      body: filtered.map(t => [
        t.date, t.name, t.desc, 
        t.type === "credit" ? t.amount.toLocaleString() : "-", 
        t.type === "debit" ? t.amount.toLocaleString() : "-"
      ]),
      headStyles: { fillColor: [30, 58, 138], halign: 'center' },
      columnStyles: {
        0: { halign: 'center', cellWidth: 35 },
        1: { fontStyle: 'bold' },
        3: { halign: 'right', textColor: [21, 128, 61] },
        4: { halign: 'right', textColor: [185, 28, 28] }
      },
      styles: { fontSize: 8, cellPadding: 3 },
      alternateRowStyles: { fillColor: [250, 250, 250] },
      margin: { bottom: 60 } // Table ko summary ke liye jagah chorne par majboor karta hai
    });

    // 3. FIXED BOTTOM SUMMARY BLOCK (Bottom Right)
    const summaryWidth = 85;
    const summaryHeight = 25;
    const margin = 15;
    const startX = pageWidth - summaryWidth - margin;
    const startY = pageHeight - summaryHeight - 25; // Page ke bottom se 25 units upar

    // Summary Heading
    doc.setTextColor(30, 58, 138);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("FINAL ACCOUNT SUMMARY", startX, startY - 2);

    autoTable(doc, {
      startY: startY,
      margin: { left: startX },
      tableWidth: summaryWidth,
      body: [
        ["Total Credits", { content: `Rs. ${totalCredit.toLocaleString()}`, styles: { halign: 'right', textColor: [21, 128, 61] } }],
        ["Total Debits", { content: `Rs. ${totalDebit.toLocaleString()}`, styles: { halign: 'right', textColor: [185, 28, 28] } }],
        ["Net Balance", { content: `Rs. ${net.toLocaleString()}`, styles: { halign: 'right', fontStyle: 'bold', fillColor: [30, 58, 138], textColor: [255, 255, 255] } }]
      ],
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 2.5 }
    });

    // 4. Footer (Page Numbers)
    const totalPages = doc.internal.getNumberOfPages();
    for(let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8); doc.setTextColor(150);
        doc.text(`Secure Path Solutions - System Generated Report`, 15, pageHeight - 10);
        doc.text(`Page ${i} of ${totalPages}`, pageWidth - 30, pageHeight - 10);
    }

    doc.save(`SPS_Ledger_${month}_${year}.pdf`);
  };
  const S = {
    card: { background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', overflow: 'hidden' },
    tile: (color) => ({ background: 'white', padding: '20px', borderRadius: '12px', borderTop: `4px solid ${color}`, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }),
    th: { padding: '15px', background: '#f8fafc', color: '#475569', fontSize: '11px', fontWeight: 'bold', textAlign: 'center', borderBottom: '2px solid #e2e8f0' },
    td: { padding: '14px', fontSize: '14px', borderBottom: '1px solid #f1f5f9', color: '#1e293b' }
  };

  if (loading) return (
    <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', background: '#f8fafc', flexDirection: 'column', gap: '15px' }}>
      <div style={{ width: '40px', height: '40px', border: '4px solid #ddd', borderTopColor: '#1e3a8a', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      <p style={{ fontFamily: 'sans-serif', color: '#64748b' }}>Preparing Financial Data...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh", padding: "40px 20px", fontFamily: "sans-serif" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        
        {/* HEADER BAR */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src={splogo} alt="Logo" style={{ height: '40px' }} />
            <div>
              <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#1e293b', margin: 0 }}>Secure Path Solutions</h1>
              <span style={{ fontSize: '13px', color: '#64748b' }}>Ledger Management System</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <select value={month} onChange={(e) => setMonth(e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}>
              {["January","February","March","April","May","June","July","August","September","October","November","December"].map(m => <option key={m}>{m}</option>)}
            </select>
            <select value={year} onChange={(e) => setYear(e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}>
              {["2024","2025","2026"].map(y => <option key={y}>{y}</option>)}
            </select>
            <button onClick={downloadPDF} style={{ background: '#1e3a8a', color: 'white', padding: '10px 24px', borderRadius: '8px', border: 'none', fontWeight: '600', cursor: 'pointer', transition: '0.2s opacity' }}>Download Statement</button>
          </div>
        </div>

        {/* SUMMARY TILES */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' }}>
          <div style={S.tile('#10b981')}>
            <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b' }}>TOTAL CREDITS</span>
            <div style={{ fontSize: '26px', fontWeight: '800', color: '#059669', marginTop: '5px' }}>Rs. {totalCredit.toLocaleString()}</div>
          </div>
          <div style={S.tile('#ef4444')}>
            <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b' }}>TOTAL DEBITS</span>
            <div style={{ fontSize: '26px', fontWeight: '800', color: '#dc2626', marginTop: '5px' }}>Rs. {totalDebit.toLocaleString()}</div>
          </div>
          <div style={S.tile('#1e3a8a')}>
            <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b' }}>NET BALANCE</span>
            <div style={{ fontSize: '26px', fontWeight: '800', color: '#1e3a8a', marginTop: '5px' }}>Rs. {net.toLocaleString()}</div>
          </div>
        </div>

        {/* MAIN LEDGER TABLE */}
        <div style={S.card}>
          <div style={{ padding: '18px 24px', background: '#fff', borderBottom: '1px solid #f1f5f9' }}>
            <h2 style={{ fontSize: '16px', margin: 0, color: '#334155' }}>Transaction History for {month} {year}</h2>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={S.th}>Date</th>
                <th style={S.th}>Entity/Name</th>
                <th style={S.th}>Description</th>
                <th style={{ ...S.th, textAlign: 'right' }}>Credit</th>
                <th style={{ ...S.th, textAlign: 'right' }}>Debit</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? filtered.map((t) => (
                <tr key={t.id} style={{ transition: 'background 0.2s' }}>
                  <td style={{ ...S.td, textAlign: 'center', fontSize: '12px' }}>{t.date}</td>
                  <td style={{ ...S.td, textAlign: 'center', fontWeight: '600' }}>{t.name}</td>
                  <td style={{ ...S.td, textAlign: 'center', color: '#64748b', fontSize: '13px' }}>{t.desc}</td>
                  <td style={{ ...S.td, textAlign: 'right', color: '#059669', fontWeight: 'bold' }}>{t.type === 'credit' ? t.amount.toLocaleString() : '—'}</td>
                  <td style={{ ...S.td, textAlign: 'right', color: '#dc2626', fontWeight: 'bold' }}>{t.type === 'debit' ? t.amount.toLocaleString() : '—'}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" style={{ padding: '50px', textAlign: 'center', color: '#94a3b8' }}>No transactions found for this period.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FinanceStatementApp;