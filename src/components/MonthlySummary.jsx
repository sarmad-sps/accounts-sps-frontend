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
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh", padding: "clamp(20px, 5vw, 40px)", fontFamily: "sans-serif", boxSizing: "border-box" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        
        {/* HEADER BAR */}
        <div style={{ display: 'flex', flexDirection: window.innerWidth < 640 ? 'column' : 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'clamp(20px, 5vw, 30px)', gap: 'clamp(12px, 3vw, 20px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(8px, 2vw, 12px)' }}>
            <img src={splogo} alt="Logo" style={{ height: 'clamp(32px, 8vw, 40px)' }} />
            <div>
              <h1 style={{ fontSize: 'clamp(18px, 5vw, 22px)', fontWeight: '800', color: '#1e293b', margin: 0 }}>Secure Path Solutions</h1>
              <span style={{ fontSize: 'clamp(11px, 2.5vw, 13px)', color: '#64748b' }}>Ledger Management System</span>
            </div>
          </div>
          {/* <div style={{ display: 'flex', gap: 'clamp(8px, 2vw, 10px)', width: window.innerWidth < 640 ? '100%' : 'auto', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <select value={month} onChange={(e) => setMonth(e.target.value)} style={{ padding: 'clamp(8px, 2vw, 10px) clamp(12px, 3vw, 14px)', borderRadius: 'clamp(6px, 1.5vw, 8px)', border: '2px solid #e2e8f0', outline: 'none', fontSize: 'clamp(11px, 2.5vw, 13px)', minWidth: 'clamp(90px, 20vw, 120px)', background: '#ffffff', color: '#1e293b', fontWeight: '500', cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.08)', transition: 'all 0.2s ease', appearance: 'none', backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%221e293b%22 stroke-width=%222%22%3e%3cpath d=%22M6 9l6 6 6-6%22/%3e%3c/svg%3e")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right clamp(6px, 1.5vw, 10px) center', backgroundSize: 'clamp(14px, 3vw, 18px)', paddingRight: 'clamp(28px, 7vw, 32px)' }} onFocus={(e) => { e.target.style.borderColor = '#1e3a8a'; e.target.style.boxShadow = '0 0 0 3px rgba(30, 58, 138, 0.1)'; }} onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = '0 2px 6px rgba(0,0,0,0.08)'; }}>
              {["January","February","March","April","May","June","July","August","September","October","November","December"].map(m => <option key={m}>{m}</option>)}
            </select>
            <select value={year} onChange={(e) => setYear(e.target.value)} style={{ padding: 'clamp(8px, 2vw, 10px) clamp(12px, 3vw, 14px)', borderRadius: 'clamp(6px, 1.5vw, 8px)', border: '2px solid #e2e8f0', outline: 'none', fontSize: 'clamp(11px, 2.5vw, 13px)', minWidth: 'clamp(70px, 15vw, 90px)', background: '#ffffff', color: '#1e293b', fontWeight: '500', cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.08)', transition: 'all 0.2s ease', appearance: 'none', backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%221e293b%22 stroke-width=%222%22%3e%3cpath d=%22M6 9l6 6 6-6%22/%3e%3c/svg%3e")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right clamp(6px, 1.5vw, 10px) center', backgroundSize: 'clamp(14px, 3vw, 18px)', paddingRight: 'clamp(28px, 7vw, 32px)' }} onFocus={(e) => { e.target.style.borderColor = '#1e3a8a'; e.target.style.boxShadow = '0 0 0 3px rgba(30, 58, 138, 0.1)'; }} onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = '0 2px 6px rgba(0,0,0,0.08)'; }}>
              {["2024","2025","2026"].map(y => <option key={y}>{y}</option>)}
            </select>
            <button onClick={downloadPDF} style={{ background: '#1e3a8a', color: 'white', padding: 'clamp(8px, 2vw, 10px) clamp(16px, 5vw, 24px)', borderRadius: 'clamp(6px, 1.5vw, 8px)', border: 'none', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s ease', fontSize: 'clamp(11px, 2.5vw, 14px)', minHeight: 'clamp(32px, 7vw, 36px)', boxShadow: '0 2px 8px rgba(30, 58, 138, 0.25)' }} onMouseEnter={(e) => { e.target.style.background = '#1e3a8a'; e.target.style.boxShadow = '0 4px 12px rgba(30, 58, 138, 0.35)'; e.target.style.transform = 'translateY(-1px)'; }} onMouseLeave={(e) => { e.target.style.background = '#1e3a8a'; e.target.style.boxShadow = '0 2px 8px rgba(30, 58, 138, 0.25)'; e.target.style.transform = 'translateY(0)'; }}>Download Statement</button>
          </div> */}
          <div style={{ 
  display: 'flex', 
  gap: '12px', 
  width: '100%', 
  maxWidth: '650px', 
  flexWrap: 'wrap', 
  justifyContent: 'flex-end',
  alignItems: 'center',
  padding: '8px'
}}>
  {/* Selector Container for Mobile Side-by-Side */}
  <div style={{ 
    display: 'flex', 
    gap: '10px', 
    flex: window.innerWidth < 640 ? '1 1 100%' : 'none' 
  }}>
    {[ 
      { value: month, setter: setMonth, options: ["January","February","March","April","May","June","July","August","September","October","November","December"] },
      { value: year, setter: setYear, options: ["2024","2025","2026"] }
    ].map((select, idx) => (
      <div key={idx} style={{ position: 'relative', flex: 1 }}>
        <select 
          value={select.value} 
          onChange={(e) => select.setter(e.target.value)} 
          style={{ 
            width: '100%',
            padding: '10px 32px 10px 14px', 
            borderRadius: '10px', 
            border: '1px solid #cbd5e1', 
            outline: 'none', 
            fontSize: '14px', 
            background: '#f8fafc', 
            color: '#334155', 
            fontWeight: '500', 
            cursor: 'pointer', 
            appearance: 'none',
            transition: 'all 0.2s ease',
            backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%2364748b%22 stroke-width=%222.5%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22%3e%3cpath d=%22M6 9l6 6 6-6%22/%3e%3c/svg%3e")',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 10px center',
            backgroundSize: '14px'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#3b82f6';
            e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#cbd5e1';
            e.target.style.boxShadow = 'none';
          }}
        >
          {select.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      </div>
    ))}
  </div>

  {/* Professional Download Button */}
  <button 
    onClick={downloadPDF} 
    style={{ 
      flex: window.innerWidth < 640 ? '1 1 100%' : 'none',
      background: '#0f172a', 
      color: 'white', 
      padding: '11px 24px', 
      borderRadius: '10px', 
      border: 'none', 
      fontWeight: '600', 
      cursor: 'pointer', 
      fontSize: '14px', 
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      transition: 'transform 0.1s active, background 0.2s'
    }}
    onMouseEnter={(e) => e.target.style.background = '#334155'}
    onMouseLeave={(e) => e.target.style.background = '#0f172a'}
    onMouseDown={(e) => e.target.style.transform = 'scale(0.98)'}
    onMouseUp={(e) => e.target.style.transform = 'scale(1)'}
  >
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
    Download Statement
  </button>
</div>
        </div>

        {/* SUMMARY TILES */}
        <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(3, 1fr)', gap: 'clamp(16px, 4vw, 20px)', marginBottom: 'clamp(20px, 5vw, 30px)' }}>
          <div style={S.tile('#10b981')}>
            <span style={{ fontSize: 'clamp(10px, 2.5vw, 12px)', fontWeight: 'bold', color: '#64748b', letterSpacing: '0.5px' }}>TOTAL CREDITS</span>
            <div style={{ fontSize: 'clamp(18px, 5vw, 26px)', fontWeight: '800', color: '#059669', marginTop: 'clamp(4px, 1vw, 5px)', wordBreak: 'break-word' }}>Rs. {totalCredit.toLocaleString()}</div>
          </div>
          <div style={S.tile('#ef4444')}>
            <span style={{ fontSize: 'clamp(10px, 2.5vw, 12px)', fontWeight: 'bold', color: '#64748b', letterSpacing: '0.5px' }}>TOTAL DEBITS</span>
            <div style={{ fontSize: 'clamp(18px, 5vw, 26px)', fontWeight: '800', color: '#dc2626', marginTop: 'clamp(4px, 1vw, 5px)', wordBreak: 'break-word' }}>Rs. {totalDebit.toLocaleString()}</div>
          </div>
          <div style={S.tile('#1e3a8a')}>
            <span style={{ fontSize: 'clamp(10px, 2.5vw, 12px)', fontWeight: 'bold', color: '#64748b', letterSpacing: '0.5px' }}>NET BALANCE</span>
            <div style={{ fontSize: 'clamp(18px, 5vw, 26px)', fontWeight: '800', color: '#1e3a8a', marginTop: 'clamp(4px, 1vw, 5px)', wordBreak: 'break-word' }}>Rs. {net.toLocaleString()}</div>
          </div>
        </div>

        {/* MAIN LEDGER TABLE */}
        <div style={S.card}>
          <div style={{ padding: 'clamp(12px, 3vw, 18px) clamp(16px, 4vw, 24px)', background: '#fff', borderBottom: '1px solid #f1f5f9', overflowX: 'auto' }}>
            <h2 style={{ fontSize: 'clamp(13px, 3.5vw, 16px)', margin: 0, color: '#334155' }}>Transaction History for {month} {year}</h2>
          </div>
          <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
            <thead>
              <tr>
                <th style={{ ...S.th, padding: 'clamp(10px, 2.5vw, 15px)', fontSize: 'clamp(9px, 2vw, 11px)' }}>Date</th>
                <th style={{ ...S.th, padding: 'clamp(10px, 2.5vw, 15px)', fontSize: 'clamp(9px, 2vw, 11px)' }}>Entity/Name</th>
                <th style={{ ...S.th, padding: 'clamp(10px, 2.5vw, 15px)', fontSize: 'clamp(9px, 2vw, 11px)' }}>Description</th>
                <th style={{ ...S.th, textAlign: 'right', padding: 'clamp(10px, 2.5vw, 15px)', fontSize: 'clamp(9px, 2vw, 11px)' }}>Credit</th>
                <th style={{ ...S.th, textAlign: 'right', padding: 'clamp(10px, 2.5vw, 15px)', fontSize: 'clamp(9px, 2vw, 11px)' }}>Debit</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? filtered.map((t) => (
                <tr key={t.id} style={{ transition: 'background 0.2s' }}>
                  <td style={{ ...S.td, textAlign: 'center', fontSize: 'clamp(10px, 2.5vw, 12px)', padding: 'clamp(10px, 2.5vw, 14px)' }}>{t.date}</td>
                  <td style={{ ...S.td, textAlign: 'center', fontWeight: '600', fontSize: 'clamp(11px, 2.5vw, 14px)', padding: 'clamp(10px, 2.5vw, 14px)' }}>{t.name}</td>
                  <td style={{ ...S.td, textAlign: 'center', color: '#64748b', fontSize: 'clamp(10px, 2.5vw, 13px)', padding: 'clamp(10px, 2.5vw, 14px)' }}>{t.desc}</td>
                  <td style={{ ...S.td, textAlign: 'right', color: '#059669', fontWeight: 'bold', fontSize: 'clamp(11px, 2.5vw, 14px)', padding: 'clamp(10px, 2.5vw, 14px)' }}>{t.type === 'credit' ? t.amount.toLocaleString() : '—'}</td>
                  <td style={{ ...S.td, textAlign: 'right', color: '#dc2626', fontWeight: 'bold', fontSize: 'clamp(11px, 2.5vw, 14px)', padding: 'clamp(10px, 2.5vw, 14px)' }}>{t.type === 'debit' ? t.amount.toLocaleString() : '—'}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" style={{ padding: 'clamp(30px, 10vw, 50px)', textAlign: 'center', color: '#94a3b8', fontSize: 'clamp(11px, 2.5vw, 14px)' }}>No transactions found for this period.</td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinanceStatementApp;