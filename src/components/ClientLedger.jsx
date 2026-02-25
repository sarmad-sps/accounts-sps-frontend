// ClientLedger.jsx
import React, { useMemo, useState } from "react";
import { Search, Download } from "lucide-react";
import spsLogo from '../assets/sps-logo.png';  // apna logo path adjust kar lena agar zarurat ho

// Ledger specific styles (aap inko alag file mein bhi rakh sakte ho)
const ledgerStyles = {
  container: { padding: "24px 16px", maxWidth: "1400px", margin: "0 auto 40px", fontFamily: "Inter, system-ui, sans-serif" },
  title: { fontSize: "1.6rem", fontWeight: "700", color: "#0f172a", margin: "0 0 1.5rem 0", letterSpacing: "-0.01em" },
  emptyText: { color: "#64748b", fontSize: "1rem", textAlign: "center", padding: "48px 20px", background: "#f8fafc", borderRadius: "12px", border: "1px dashed #cbd5e1", lineHeight: 1.8 },
  clientCard: { background: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0", marginBottom: "28px", overflow: "hidden", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -1px rgba(0,0,0,0.04)" },
  clientCardHeader: { padding: "16px 20px", background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 },
  downloadBtn: { display: "flex", alignItems: "center", gap: 7, padding: "8px 18px", background: "linear-gradient(135deg, #2563eb 0%, #60a5fa 100%)", color: "#fff", border: "none", borderRadius: 9, fontWeight: 700, fontSize: 13, cursor: "pointer", boxShadow: "0 2px 8px rgba(37,99,235,0.25)", whiteSpace: "nowrap" },
  invoiceSummaryBar: { display: "flex", alignItems: "center", flexWrap: "wrap", gap: 0, background: "#eff6ff", borderBottom: "1px solid #bfdbfe", padding: "10px 20px" },
  invoiceSummaryItem: { display: "flex", flexDirection: "column", paddingRight: 20 },
  invoiceSummaryLabel: { fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" },
  invoiceSummaryValue: { fontSize: 15, fontWeight: 800, marginTop: 1 },
  invoiceSummaryDivider: { width: 1, height: 28, background: "#bfdbfe", marginRight: 20, flexShrink: 0 },
  clientName: { fontSize: "1.2rem", fontWeight: "700", color: "#1e293b", margin: 0 },
  table: { width: "100%", borderCollapse: "collapse", fontSize: "0.93rem" },
  thead: { background: "#f1f5f9" },
  th: { padding: "12px 16px", textAlign: "left", fontSize: "0.8rem", fontWeight: "700", color: "#475569", textTransform: "uppercase", letterSpacing: "0.4px", borderBottom: "2px solid #cbd5e1", whiteSpace: "nowrap" },
  td: { padding: "12px 16px", color: "#1e293b", borderBottom: "1px solid #f1f5f9" },
  amountCell: { textAlign: "right", fontWeight: "600", fontVariantNumeric: "tabular-nums" },
  balanceCell: { textAlign: "right", fontWeight: "700", color: "#1e40af", fontVariantNumeric: "tabular-nums" },
  statusPending: { background: "#fef3c7", color: "#92400e", padding: "4px 10px", borderRadius: "999px", fontSize: "0.8rem", fontWeight: "600", display: "inline-block" },
  statusReceived: { background: "#d1fae5", color: "#065f46", padding: "4px 10px", borderRadius: "999px", fontSize: "0.8rem", fontWeight: "600", display: "inline-block" },
};

export default function ClientLedger({ clientLedger }) {
  const [ledgerSearch, setLedgerSearch] = useState("");
  const [showAllLedgers, setShowAllLedgers] = useState(false);

  const filteredLedgerClients = useMemo(() => {
    const s = ledgerSearch.trim().toLowerCase();
    const allEntries = Object.entries(clientLedger || {});

    if (showAllLedgers) {
      return s ? allEntries.filter(([c]) => c.toLowerCase().includes(s)) : allEntries;
    }
    if (!s) return [];
    return allEntries.filter(([c]) => c.toLowerCase().includes(s));
  }, [clientLedger, ledgerSearch, showAllLedgers]);

  const totalClientCount = Object.keys(clientLedger || {}).length;

  // PDF Generation Function (pura original wala yahan paste kar dena)
  const handleDownloadLedgerPDF = async (client, entries, logoSrc) => {
    const companyName = "SECURE PATH SOLUTIONS";

    const loadScript = (src) => {
      return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) return resolve();
        const script = document.createElement("script");
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    };

    try {
      if (!window.jspdf) {
        await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js");
      }
      await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.28/jspdf.plugin.autotable.min.js");

      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({ orientation: "p", unit: "pt", format: "a4" });
      const pageW = doc.internal.pageSize.getWidth();
      const margin = 40;

      const getLogoData = (src) => {
        return new Promise((resolve) => {
          if (!src) return resolve(null);
          const img = new Image();
          img.crossOrigin = "Anonymous";
          img.src = src;
          img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL("image/png"));
          };
          img.onerror = () => resolve(null);
        });
      };

      const finalLogo = await getLogoData(logoSrc);

      const totalBilled = entries.reduce((s, e) => s + (Number(e.totalAmount) || 0), 0);
      const totalPaid = entries.reduce((s, e) => s + (Number(e.amount) || 0), 0);
      const balance = totalBilled - totalPaid;

      // Header Section
      doc.setFillColor(15, 23, 42); 
      doc.rect(0, 0, pageW, 100, "F");

      if (finalLogo) {
        doc.addImage(finalLogo, "PNG", margin, 25, 50, 50);
      }

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text(companyName, finalLogo ? 100 : margin, 50);
      
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(148, 163, 184);
      doc.text("OFFICIAL CLIENT LEDGER STATEMENT", finalLogo ? 100 : margin, 68);

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, pageW - margin, 50, { align: "right" });
      doc.setFont("helvetica", "bold");
      doc.text(`CLIENT: ${client.toUpperCase()}`, pageW - margin, 68, { align: "right" });

      // Stats Cards
      let y = 130;
      const cardW = (pageW - (margin * 2) - 30) / 3;
      const stats = [
        { label: "TOTAL BILLED", value: totalBilled, color: [79, 70, 229] },
        { label: "TOTAL PAID", value: totalPaid, color: [22, 163, 74] },
        { label: "OUTSTANDING", value: balance, color: [220, 38, 38] }
      ];

      stats.forEach((s, i) => {
        const x = margin + (i * (cardW + 15));
        doc.setDrawColor(241, 245, 249);
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(x, y, cardW, 60, 4, 4, "FD");
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text(s.label, x + 15, y + 22);
        doc.setFontSize(11);
        doc.setTextColor(...s.color);
        doc.setFont("helvetica", "bold");
        doc.text(`Rs. ${s.value.toLocaleString()}`, x + 15, y + 45);
      });

      // Table
      const tableRows = entries.map((e, index) => [
        index + 1,
        e.date || "-",
        e.category || e.party || "N/A",
        (Number(e.totalAmount) || 0).toLocaleString(),
        (Number(e.amount) || 0).toLocaleString()
      ]);

      doc.autoTable({
        startY: y + 90,
        head: [['S.NO', 'DATE', 'CATEGORY', 'BILLED (Rs.)', 'PAID (Rs.)']],
        body: tableRows,
        theme: 'striped',
        styles: { 
          fontSize: 8, 
          halign: 'center',
          valign: 'middle', 
          cellPadding: 8 
        },
        headStyles: { 
          fillColor: [15, 23, 42], 
          textColor: 255, 
          fontStyle: 'bold',
          halign: 'center' 
        },
        columnStyles: {
          0: { cellWidth: 35 }, 
          1: { cellWidth: 80 }, 
          2: { cellWidth: 'auto' },
          3: { cellWidth: 90 }, 
          4: { cellWidth: 90 }, 
        },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        margin: { left: margin, right: margin },
        didDrawPage: (data) => {
          const pageCount = doc.internal.getNumberOfPages();
          doc.setFontSize(8);
          doc.setTextColor(148, 163, 184);
          doc.text(`Page ${pageCount}`, pageW / 2, doc.internal.pageSize.getHeight() - 20, { align: "center" });
        }
      });

      let finalY = doc.lastAutoTable.finalY + 50;
      if (finalY > doc.internal.pageSize.getHeight() - 70) {
        doc.addPage();
        finalY = 50;
      }
      doc.setDrawColor(203, 213, 225);
      doc.line(pageW - margin - 140, finalY, pageW - margin, finalY);
      doc.setFontSize(8);
      doc.setTextColor(30, 41, 59);
      doc.text("AUTHORIZED SIGNATORY", pageW - margin - 70, finalY + 15, { align: "center" });

      doc.save(`Ledger_${client.replace(/\s+/g, '_')}.pdf`);

    } catch (err) {
      console.error("PDF Error:", err);
      alert("Error generating PDF.");
    }
  };

  const renderLedgerCard = ([client, entries]) => {
    let runningBalance = 0;

    const grandInvoice = entries.reduce((s, e) => s + (Number(e.totalAmount) || 0), 0);
    const grandReceived = entries.reduce((s, e) => s + (Number(e.amount) || 0), 0);
    const grandPending = grandInvoice > 0 ? Math.max(0, grandInvoice - grandReceived) : 0;

    return (
      <div key={client} style={ledgerStyles.clientCard}>
        <div style={ledgerStyles.clientCardHeader}>
          <h3 style={ledgerStyles.clientName}>{client}</h3>
          <button onClick={() => handleDownloadLedgerPDF(client, entries, spsLogo)} style={ledgerStyles.downloadBtn}>
            <Download size={15} /> Download Ledger PDF
          </button>
        </div>

        {grandInvoice > 0 && (
          <div style={ledgerStyles.invoiceSummaryBar}>
            <div style={ledgerStyles.invoiceSummaryItem}>
              <span style={ledgerStyles.invoiceSummaryLabel}>Total Invoice</span>
              <span style={{ ...ledgerStyles.invoiceSummaryValue, color: "#1e40af" }}>Rs. {grandInvoice.toLocaleString()}</span>
            </div>
            <div style={ledgerStyles.invoiceSummaryDivider} />
            <div style={ledgerStyles.invoiceSummaryItem}>
              <span style={ledgerStyles.invoiceSummaryLabel}>Received</span>
              <span style={{ ...ledgerStyles.invoiceSummaryValue, color: "#059669" }}>Rs. {grandReceived.toLocaleString()}</span>
            </div>
            <div style={ledgerStyles.invoiceSummaryDivider} />
            <div style={ledgerStyles.invoiceSummaryItem}>
              <span style={ledgerStyles.invoiceSummaryLabel}>Pending</span>
              <span style={{ ...ledgerStyles.invoiceSummaryValue, color: grandPending > 0 ? "#b45309" : "#059669" }}>
                {grandPending > 0 ? `Rs. ${grandPending.toLocaleString()}` : "✓ Cleared"}
              </span>
            </div>
          </div>
        )}

        <div style={{ overflowX: "auto" }}>
          <table style={ledgerStyles.table}>
            <thead style={ledgerStyles.thead}>
              <tr>
                <th style={ledgerStyles.th}>Date</th>
                <th style={ledgerStyles.th}>Party</th>
                <th style={ledgerStyles.th}>Category</th>
                <th style={{ ...ledgerStyles.th, textAlign: "right" }}>Paid Amount</th>
                <th style={{ ...ledgerStyles.th, textAlign: "right" }}>Total Inv.</th>
                <th style={{ ...ledgerStyles.th, textAlign: "right" }}>Entry Pending</th>
                <th style={ledgerStyles.th}>Status</th>
                <th style={{ ...ledgerStyles.th, textAlign: "right" }}>Running Bal.</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e, i) => {
                runningBalance += e.status === "RECEIVED" ? e.amount : 0;
                const entryTotal = Number(e.totalAmount) || 0;
                const entryPending = entryTotal > 0 ? Math.max(0, entryTotal - e.amount) : null;

                return (
                  <tr key={i} style={{ backgroundColor: i % 2 === 0 ? "#ffffff" : "#f9fafb" }}>
                    <td style={ledgerStyles.td}>{e.date || "-"}</td>
                    <td style={ledgerStyles.td}>{e.party || "-"}</td>
                    <td style={ledgerStyles.td}>{e.category || "-"}</td>
                    <td style={{ ...ledgerStyles.td, ...ledgerStyles.amountCell }}>
                      Rs. {Number(e.amount || 0).toLocaleString()}
                    </td>
                    <td style={{ ...ledgerStyles.td, textAlign: "right", fontWeight: 600, color: "#1e40af" }}>
                      {entryTotal > 0 ? `Rs. ${entryTotal.toLocaleString()}` : <span style={{ color: "#9ca3af" }}>—</span>}
                    </td>
                    <td style={{ ...ledgerStyles.td, textAlign: "right", fontWeight: 600 }}>
                      {entryPending === null ? (
                        <span style={{ color: "#9ca3af" }}>—</span>
                      ) : entryPending === 0 ? (
                        <span style={{ color: "#059669" }}>✓ Clear</span>
                      ) : (
                        <span style={{ color: "#b45309" }}>Rs. {entryPending.toLocaleString()}</span>
                      )}
                    </td>
                    <td style={ledgerStyles.td}>
                      <span style={e.status === "RECEIVED" ? ledgerStyles.statusReceived : ledgerStyles.statusPending}>
                        {e.status || "PENDING"}
                      </span>
                    </td>
                    <td style={{ ...ledgerStyles.td, ...ledgerStyles.balanceCell }}>
                      Rs. {runningBalance.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <section style={ledgerStyles.container}>
      <h2 style={ledgerStyles.title}>Client Ledger</h2>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", marginBottom: 28 }}>
        <div style={{ position: "relative", flex: 1, minWidth: 240 }}>
          <Search size={18} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#6b7280", pointerEvents: "none" }} />
          <input
            placeholder="Search Client name..."
            value={ledgerSearch}
            onChange={(e) => {
              setLedgerSearch(e.target.value);
              if (showAllLedgers) setShowAllLedgers(false);
            }}
            style={{
              width: "100%",
              padding: "11px 16px 11px 44px",
              background: "#f9fafb",
              border: "1.5px solid #d1d5db",
              borderRadius: 10,
              color: "#111827",
              fontSize: 15,
              boxSizing: "border-box",
              outline: "none",
            }}
          />
        </div>

        {!showAllLedgers ? (
          <button
            onClick={() => { setShowAllLedgers(true); setLedgerSearch(""); }}
            disabled={totalClientCount === 0}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              padding: "11px 22px",
              background: totalClientCount === 0 ? "#e5e7eb" : "linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)",
              color: totalClientCount === 0 ? "#9ca3af" : "#fff",
              border: "none",
              borderRadius: 10,
              fontWeight: 700,
              fontSize: 13,
              cursor: totalClientCount === 0 ? "not-allowed" : "pointer",
              boxShadow: totalClientCount === 0 ? "none" : "0 2px 8px rgba(124,58,237,0.3)",
              whiteSpace: "nowrap"
            }}
          >
            📋 Show All ({totalClientCount}) Clients
          </button>
        ) : (
          <button
            onClick={() => { setShowAllLedgers(false); setLedgerSearch(""); }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              padding: "11px 22px",
              background: "linear-gradient(135deg, #dc2626 0%, #f87171 100%)",
              color: "#fff",
              border: "none",
              borderRadius: 10,
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(220,38,38,0.3)",
              whiteSpace: "nowrap"
            }}
          >
            ✕ Close All Ledgers
          </button>
        )}
      </div>

      {!showAllLedgers && !ledgerSearch.trim() ? (
        <div style={ledgerStyles.emptyText}>
          Please click <strong>"Show All Clients"</strong> to view complete ledger details.
        </div>
      ) : filteredLedgerClients.length === 0 ? (
        <div style={ledgerStyles.emptyText}>
          No client records found for <strong>"{ledgerSearch}"</strong>.
        </div>
      ) : (
        filteredLedgerClients.map(renderLedgerCard)
      )}
    </section>
  );
}