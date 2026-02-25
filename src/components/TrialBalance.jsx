// ─── TrialBalance.jsx ───
// Import kar lo: import TrialBalance from "./TrialBalance";
// Use kar lo: <TrialBalance receivings={state?.receivings || []} companyName={state?.companyName} logoSrc={spsLogo} />

import React, { useMemo, useState } from "react";
import { Download, TrendingUp, TrendingDown, DollarSign, AlertCircle, CheckCircle } from "lucide-react";

export default function TrialBalance({ receivings = [], companyName = "Secure Path Solutions", logoSrc }) {

  const [selectedPeriod, setSelectedPeriod] = useState("all");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  // ── Parse MM/DD/YYYY ──
  const parseDate = (str) => {
    if (!str) return null;
    const [mm, dd, yyyy] = str.split("/");
    return new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  };

  // ── Filter by period ──
  const filteredData = useMemo(() => {
    const now = new Date();
    return receivings.filter((r) => {
      const d = parseDate(r.date);
      if (!d) return true;
      if (selectedPeriod === "this_month") {
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }
      if (selectedPeriod === "this_year") {
        return d.getFullYear() === now.getFullYear();
      }
      if (selectedPeriod === "custom" && customFrom && customTo) {
        const from = new Date(customFrom);
        const to = new Date(customTo);
        to.setHours(23, 59, 59);
        return d >= from && d <= to;
      }
      return true;
    });
  }, [receivings, selectedPeriod, customFrom, customTo]);

  // ── Build Trial Balance Accounts ──
  const trialData = useMemo(() => {
    // Group by category
    const categoryMap = {};
    filteredData.forEach((r) => {
      const cat = r.category || "Other";
      if (!categoryMap[cat]) {
        categoryMap[cat] = {
          category: cat,
          totalInvoice: 0,
          totalReceived: 0,
          totalPending: 0,
          count: 0,
          receivedCount: 0,
          pendingCount: 0,
        };
      }
      const inv = Number(r.totalAmount) || Number(r.amount) || 0;
      const rec = Number(r.amount) || 0;
      const pen = Number(r.totalAmount) > 0 ? Math.max(0, Number(r.totalAmount) - rec) : 0;

      categoryMap[cat].totalInvoice += inv;
      categoryMap[cat].totalReceived += rec;
      categoryMap[cat].totalPending += pen;
      categoryMap[cat].count++;
      if ((r.status || "").toUpperCase() === "RECEIVED") categoryMap[cat].receivedCount++;
      else categoryMap[cat].pendingCount++;
    });

    return Object.values(categoryMap).sort((a, b) => b.totalInvoice - a.totalInvoice);
  }, [filteredData]);

  // ── Grand totals ──
  const grand = useMemo(() => {
    const totalInvoice  = trialData.reduce((s, r) => s + r.totalInvoice, 0);
    const totalReceived = trialData.reduce((s, r) => s + r.totalReceived, 0);
    const totalPending  = trialData.reduce((s, r) => s + r.totalPending, 0);
    const totalTx       = trialData.reduce((s, r) => s + r.count, 0);
    // Trial balance check: Debit = Credit?
    // In this system: Debit side = Receivables (invoice), Credit side = Received + Pending
    const isBalanced = Math.abs(totalInvoice - (totalReceived + totalPending)) < 1;
    return { totalInvoice, totalReceived, totalPending, totalTx, isBalanced };
  }, [trialData]);

  // ── Payment Mode breakdown ──
  const paymentBreakdown = useMemo(() => {
    const modes = {};
    filteredData.forEach((r) => {
      const mode = r.paymentMode || "Cash";
      if (!modes[mode]) modes[mode] = { amount: 0, count: 0 };
      modes[mode].amount += Number(r.amount) || 0;
      modes[mode].count++;
    });
    return Object.entries(modes).sort((a, b) => b[1].amount - a[1].amount);
  }, [filteredData]);

  // ── Period label ──
  const periodLabel = useMemo(() => {
    if (selectedPeriod === "this_month") {
      return new Date().toLocaleDateString("en-PK", { month: "long", year: "numeric" });
    }
    if (selectedPeriod === "this_year") return `Year ${new Date().getFullYear()}`;
    if (selectedPeriod === "custom" && customFrom && customTo) return `${customFrom} to ${customTo}`;
    return "All Time";
  }, [selectedPeriod, customFrom, customTo]);

  // ═══════════════════════════════════════════
  // PDF EXPORT
  // ═══════════════════════════════════════════
  const handleDownloadPDF = async () => {
    const loadScript = (src) => new Promise((res, rej) => {
      if (document.querySelector(`script[src="${src}"]`)) return res();
      const s = document.createElement("script");
      s.src = src; s.onload = res; s.onerror = rej;
      document.head.appendChild(s);
    });

    try {
      if (!window.jspdf) await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js");
      await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.28/jspdf.plugin.autotable.min.js");

      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();
      const margin = 40;
      const cW = pageW - margin * 2;

      // ── Logo helper ──
      const getLogoB64 = (src) => new Promise((res) => {
        if (!src) return res(null);
        const img = new Image(); img.crossOrigin = "anonymous";
        img.onload = () => {
          const c = document.createElement("canvas");
          c.width = img.width; c.height = img.height;
          c.getContext("2d").drawImage(img, 0, 0);
          res(c.toDataURL("image/png"));
        };
        img.onerror = () => res(null);
        img.src = src;
      });

      const logo = await getLogoB64(logoSrc);

      // ── PAGE HEADER ──
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, pageW, 70, "F");
      doc.setFillColor(59, 130, 246);
      doc.rect(0, 68, pageW, 3, "F");

      if (logo) doc.addImage(logo, "PNG", margin, 12, 44, 44);
      const tx = logo ? margin + 56 : margin;

      doc.setFont("helvetica", "bold"); doc.setFontSize(14); doc.setTextColor(255, 255, 255);
      doc.text((companyName || "SECURE PATH SOLUTIONS").toUpperCase(), tx, 32);
      doc.setFontSize(9); doc.setFont("helvetica", "normal"); doc.setTextColor(148, 163, 184);
      doc.text("TRIAL BALANCE SHEET", tx, 50);

      doc.setFontSize(8.5); doc.setTextColor(148, 163, 184);
      doc.text(`Period: ${periodLabel}`, pageW - margin, 32, { align: "right" });
      doc.text(`Generated: ${new Date().toLocaleDateString("en-PK")}`, pageW - margin, 50, { align: "right" });

      let y = 88;

      // ── TITLE ROW ──
      doc.setFillColor(239, 246, 255); doc.setDrawColor(191, 219, 254); doc.setLineWidth(1);
      doc.roundedRect(margin, y, cW, 28, 4, 4, "FD");
      doc.setFont("helvetica", "bold"); doc.setFontSize(12); doc.setTextColor(30, 64, 175);
      doc.text("TRIAL BALANCE", margin + 14, y + 19);
      doc.setFont("helvetica", "normal"); doc.setFontSize(8.5); doc.setTextColor(100, 116, 139);
      doc.text(`${grand.totalTx} total transactions`, pageW - margin - 14, y + 19, { align: "right" });
      y += 40;

      // ── 4 SUMMARY CARDS ──
      const cardW4 = (cW - 18) / 4;
      const c4 = [
        { label: "TOTAL BILLED",    val: `Rs. ${grand.totalInvoice.toLocaleString()}`,   bg: [219,234,254], bd: [147,197,253], lc: [30,64,175],  vc: [30,58,138]  },
        { label: "TOTAL RECEIVED",  val: `Rs. ${grand.totalReceived.toLocaleString()}`,  bg: [209,250,229], bd: [110,231,183], lc: [6,95,70],    vc: [4,60,44]    },
        { label: "TOTAL PENDING",   val: `Rs. ${grand.totalPending.toLocaleString()}`,   bg: [254,243,199], bd: [252,211,77],  lc: [146,64,0],   vc: [120,53,15]  },
        { label: "BALANCE STATUS",  val: grand.isBalanced ? "✓ BALANCED" : "✗ MISMATCH", bg: grand.isBalanced ? [209,250,229] : [254,226,226], bd: grand.isBalanced ? [110,231,183] : [252,165,165], lc: grand.isBalanced ? [6,95,70] : [185,28,28], vc: grand.isBalanced ? [4,60,44] : [153,27,27] },
      ];

      c4.forEach((c, i) => {
        const cx = margin + i * (cardW4 + 6);
        doc.setFillColor(...c.bg); doc.setDrawColor(...c.bd); doc.setLineWidth(1);
        doc.roundedRect(cx, y, cardW4, 54, 5, 5, "FD");
        doc.setFontSize(6.5); doc.setFont("helvetica", "bold"); doc.setTextColor(...c.lc);
        doc.text(c.label, cx + 10, y + 16);
        doc.setFontSize(i === 3 ? 10 : 12); doc.setFont("helvetica", "bold"); doc.setTextColor(...c.vc);
        doc.text(c.val, cx + 10, y + 38);
      });

      y += 64;

      // ── MAIN TRIAL BALANCE TABLE ──
      const tbHead = [["ACCOUNT / CATEGORY", "TRANSACTIONS", "TOTAL BILLED (Dr.)", "TOTAL RECEIVED (Cr.)", "PENDING BALANCE"]];
      const tbBody = trialData.map((r) => [
        r.category,
        `${r.count} (✓${r.receivedCount} / ⏳${r.pendingCount})`,
        `Rs. ${r.totalInvoice.toLocaleString()}`,
        `Rs. ${r.totalReceived.toLocaleString()}`,
        r.totalPending > 0 ? `Rs. ${r.totalPending.toLocaleString()}` : "✓ Cleared",
      ]);

      // Total row
      tbBody.push([
        "GRAND TOTAL",
        `${grand.totalTx} transactions`,
        `Rs. ${grand.totalInvoice.toLocaleString()}`,
        `Rs. ${grand.totalReceived.toLocaleString()}`,
        grand.totalPending > 0 ? `Rs. ${grand.totalPending.toLocaleString()}` : "✓ FULLY CLEARED",
      ]);

      doc.autoTable({
        startY: y,
        head: tbHead,
        body: tbBody,
        theme: "grid",
        styles: { fontSize: 8, cellPadding: 7, valign: "middle", halign: "center" },
        headStyles: { fillColor: [15, 23, 42], textColor: [200, 210, 230], fontStyle: "bold", halign: "center", fontSize: 7.5 },
        columnStyles: {
          0: { halign: "left", fontStyle: "bold", cellWidth: 120 },
          1: { cellWidth: 80 },
          2: { cellWidth: 95 },
          3: { cellWidth: 95 },
          4: { cellWidth: 95 },
        },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        didParseCell: (data) => {
          // Grand total row styling
          if (data.row.index === trialData.length) {
            data.cell.styles.fillColor = [15, 23, 42];
            data.cell.styles.textColor = [255, 255, 255];
            data.cell.styles.fontStyle = "bold";
            data.cell.styles.fontSize = 8.5;
          }
          // Pending column — color red if > 0
          if (data.column.index === 4 && data.row.index < trialData.length) {
            const row = trialData[data.row.index];
            if (row.totalPending > 0) data.cell.styles.textColor = [180, 83, 9];
            else data.cell.styles.textColor = [5, 150, 105];
          }
        },
        margin: { left: margin, right: margin },
      });

      y = doc.lastAutoTable.finalY + 18;

      // ── PAYMENT MODE BREAKDOWN ──
      if (y > pageH - 120) { doc.addPage(); y = 50; }

      doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.setTextColor(15, 23, 42);
      doc.text("PAYMENT MODE BREAKDOWN", margin, y); y += 10;

      doc.autoTable({
        startY: y,
        head: [["PAYMENT MODE", "TRANSACTIONS", "AMOUNT RECEIVED"]],
        body: paymentBreakdown.map(([mode, v]) => [
          mode,
          `${v.count} transactions`,
          `Rs. ${v.amount.toLocaleString()}`,
        ]),
        theme: "striped",
        styles: { fontSize: 8, cellPadding: 7, halign: "center" },
        headStyles: { fillColor: [30, 64, 175], textColor: 255, fontStyle: "bold" },
        columnStyles: {
          0: { halign: "left", fontStyle: "bold" },
          2: { fontStyle: "bold", textColor: [4, 60, 44] },
        },
        margin: { left: margin, right: margin },
      });

      y = doc.lastAutoTable.finalY + 20;

      // ── TRIAL BALANCE VERIFICATION BOX ──
      if (y > pageH - 100) { doc.addPage(); y = 50; }

      doc.setFillColor(grand.isBalanced ? 209 : 254, grand.isBalanced ? 250 : 226, grand.isBalanced ? 229 : 226);
      doc.setDrawColor(grand.isBalanced ? 110 : 252, grand.isBalanced ? 231 : 165, grand.isBalanced ? 183 : 165);
      doc.setLineWidth(1);
      doc.roundedRect(margin, y, cW, 52, 6, 6, "FD");

      doc.setFont("helvetica", "bold"); doc.setFontSize(10);
      doc.setTextColor(...(grand.isBalanced ? [4, 60, 44] : [185, 28, 28]));
      doc.text(
        grand.isBalanced ? "✓  TRIAL BALANCE IS BALANCED" : "✗  TRIAL BALANCE MISMATCH DETECTED",
        margin + 14, y + 20
      );
      doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(71, 85, 105);
      doc.text(
        `Debit (Total Billed): Rs. ${grand.totalInvoice.toLocaleString()}   |   Credit (Received + Pending): Rs. ${(grand.totalReceived + grand.totalPending).toLocaleString()}`,
        margin + 14, y + 38
      );

      // ── SIGNATURE LINE ──
      y = doc.lastAutoTable ? doc.lastAutoTable.finalY + 30 : y + 70;
      if (y > pageH - 60) { doc.addPage(); y = pageH - 80; }

      doc.setDrawColor(203, 213, 225); doc.setLineWidth(0.5);
      doc.line(pageW - margin - 160, pageH - 55, pageW - margin, pageH - 55);
      doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(100, 116, 139);
      doc.text("Authorized Signatory", pageW - margin - 80, pageH - 42, { align: "center" });

      // ── FOOTER ──
      doc.setFontSize(7.5); doc.setTextColor(148, 163, 184);
      doc.text(
        `${companyName || "Secure Path Solutions"} • Trial Balance • ${new Date().toLocaleString("en-PK")}`,
        pageW / 2, pageH - 18, { align: "center" }
      );

      doc.save(`TrialBalance_${periodLabel.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0,10)}.pdf`);

    } catch (err) {
      console.error("PDF Error:", err);
      alert("PDF generate nahi ho saki. Dobara try karo.");
    }
  };

  // ═══════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════
  const modeColors = { Cash: "#ea580c", Online: "#2563eb", Check: "#d97706" };

  return (
    <div style={tbStyles.wrapper}>

      {/* ── Page Header ── */}
      <div style={tbStyles.pageHeader}>
        <div>
          <h2 style={tbStyles.pageTitle}>Trial Balance Sheet</h2>
          <p style={tbStyles.pageSub}>Debit & Credit summary by account category</p>
        </div>
        <button onClick={handleDownloadPDF} style={tbStyles.downloadBtn}>
          <Download size={16} style={{ marginRight: 6 }} />
          Download PDF
        </button>
      </div>

      {/* ── Period Filter ── */}
      <div style={tbStyles.filterBar}>
        <span style={tbStyles.filterLabel}>Period:</span>
        {[
          { v: "all",        l: "All Time"    },
          { v: "this_month", l: "This Month"  },
          { v: "this_year",  l: "This Year"   },
          { v: "custom",     l: "Custom"      },
        ].map((opt) => (
          <button
            key={opt.v}
            onClick={() => setSelectedPeriod(opt.v)}
            style={{ ...tbStyles.filterBtn, ...(selectedPeriod === opt.v ? tbStyles.filterBtnActive : {}) }}
          >
            {opt.l}
          </button>
        ))}
        {selectedPeriod === "custom" && (
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} style={tbStyles.dateInput} />
            <span style={{ color: "#64748b", fontSize: 13 }}>to</span>
            <input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} style={tbStyles.dateInput} />
          </div>
        )}
      </div>

      {/* ── 4 Summary Cards ── */}
      <div style={tbStyles.cardsRow}>
        {[
          { icon: <DollarSign size={20} />, label: "Total Billed",    val: `Rs. ${grand.totalInvoice.toLocaleString()}`,  sub: `${grand.totalTx} transactions`, color: "#1e40af", bg: "#eff6ff", border: "#bfdbfe" },
          { icon: <TrendingUp size={20} />, label: "Total Received",  val: `Rs. ${grand.totalReceived.toLocaleString()}`, sub: "Credit side",                    color: "#059669", bg: "#f0fdf4", border: "#bbf7d0" },
          { icon: <TrendingDown size={20} />,label: "Total Pending",  val: `Rs. ${grand.totalPending.toLocaleString()}`, sub: "Outstanding balance",             color: "#b45309", bg: "#fffbeb", border: "#fde68a" },
          {
            icon: grand.isBalanced ? <CheckCircle size={20} /> : <AlertCircle size={20} />,
            label: "Balance Status",
            val: grand.isBalanced ? "✓ Balanced" : "✗ Mismatch",
            sub: grand.isBalanced ? "Debit = Credit" : "Check entries",
            color: grand.isBalanced ? "#059669" : "#dc2626",
            bg:     grand.isBalanced ? "#f0fdf4" : "#fef2f2",
            border: grand.isBalanced ? "#bbf7d0" : "#fecaca",
          },
        ].map((c, i) => (
          <div key={i} style={{ ...tbStyles.card, background: c.bg, borderColor: c.border }}>
            <div style={{ color: c.color, marginBottom: 8 }}>{c.icon}</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>{c.label}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: c.color, marginBottom: 2 }}>{c.val}</div>
            <div style={{ fontSize: 11, color: "#94a3b8" }}>{c.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Main Trial Balance Table ── */}
      <div style={tbStyles.tableCard}>
        <div style={tbStyles.tableCardHeader}>
          <h3 style={tbStyles.tableCardTitle}>Account-wise Trial Balance</h3>
          <span style={{ fontSize: 12, color: "#64748b" }}>Period: <strong>{periodLabel}</strong></span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={tbStyles.table}>
            <thead>
              <tr style={{ background: "#0f172a" }}>
                <th style={{ ...tbStyles.th, color: "#94a3b8", textAlign: "left" }}>Account / Category</th>
                <th style={{ ...tbStyles.th, color: "#94a3b8" }}>Transactions</th>
                <th style={{ ...tbStyles.th, color: "#93c5fd" }}>Total Billed (Dr.)</th>
                <th style={{ ...tbStyles.th, color: "#6ee7b7" }}>Total Received (Cr.)</th>
                <th style={{ ...tbStyles.th, color: "#fde68a" }}>Pending Balance</th>
                <th style={{ ...tbStyles.th, color: "#94a3b8" }}>Collection %</th>
              </tr>
            </thead>
            <tbody>
              {trialData.map((r, i) => {
                const pct = r.totalInvoice > 0 ? Math.round((r.totalReceived / r.totalInvoice) * 100) : 0;
                return (
                  <tr key={i} style={{ background: i % 2 === 0 ? "#ffffff" : "#f8fafc", borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ ...tbStyles.td, fontWeight: 700, color: "#1e293b" }}>{r.category}</td>
                    <td style={{ ...tbStyles.td, textAlign: "center" }}>
                      <span style={{ fontSize: 12 }}>{r.count}</span>
                      <span style={{ fontSize: 11, color: "#64748b", marginLeft: 4 }}>
                        (<span style={{ color: "#059669" }}>✓{r.receivedCount}</span> / <span style={{ color: "#b45309" }}>⏳{r.pendingCount}</span>)
                      </span>
                    </td>
                    <td style={{ ...tbStyles.td, textAlign: "right", fontWeight: 600, color: "#1e40af" }}>Rs. {r.totalInvoice.toLocaleString()}</td>
                    <td style={{ ...tbStyles.td, textAlign: "right", fontWeight: 600, color: "#059669" }}>Rs. {r.totalReceived.toLocaleString()}</td>
                    <td style={{ ...tbStyles.td, textAlign: "right", fontWeight: 600 }}>
                      {r.totalPending > 0
                        ? <span style={{ color: "#b45309", background: "#fffbeb", padding: "3px 8px", borderRadius: 6, fontSize: 12 }}>Rs. {r.totalPending.toLocaleString()}</span>
                        : <span style={{ color: "#059669", background: "#f0fdf4", padding: "3px 8px", borderRadius: 6, fontSize: 12 }}>✓ Cleared</span>
                      }
                    </td>
                    <td style={{ ...tbStyles.td, textAlign: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "center" }}>
                        <div style={{ flex: 1, maxWidth: 80, height: 6, background: "#e2e8f0", borderRadius: 3, overflow: "hidden" }}>
                          <div style={{ width: `${pct}%`, height: "100%", background: pct >= 100 ? "#10b981" : "#3b82f6", borderRadius: 3 }} />
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 700, color: pct >= 100 ? "#059669" : "#3b82f6", minWidth: 32 }}>{pct}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {/* Grand Total Row */}
            <tfoot>
              <tr style={{ background: "#0f172a" }}>
                <td style={{ ...tbStyles.td, fontWeight: 800, color: "#fff", fontSize: 13 }}>GRAND TOTAL</td>
                <td style={{ ...tbStyles.td, textAlign: "center", color: "#94a3b8", fontWeight: 600 }}>{grand.totalTx} txns</td>
                <td style={{ ...tbStyles.td, textAlign: "right", fontWeight: 800, color: "#93c5fd", fontSize: 13 }}>Rs. {grand.totalInvoice.toLocaleString()}</td>
                <td style={{ ...tbStyles.td, textAlign: "right", fontWeight: 800, color: "#6ee7b7", fontSize: 13 }}>Rs. {grand.totalReceived.toLocaleString()}</td>
                <td style={{ ...tbStyles.td, textAlign: "right", fontWeight: 800, fontSize: 13, color: grand.totalPending > 0 ? "#fde68a" : "#6ee7b7" }}>
                  {grand.totalPending > 0 ? `Rs. ${grand.totalPending.toLocaleString()}` : "✓ CLEARED"}
                </td>
                <td style={{ ...tbStyles.td, textAlign: "center", fontWeight: 800, color: "#6ee7b7", fontSize: 13 }}>
                  {grand.totalInvoice > 0 ? `${Math.round((grand.totalReceived / grand.totalInvoice) * 100)}%` : "—"}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* ── Payment Mode Breakdown ── */}
      <div style={tbStyles.tableCard}>
        <div style={tbStyles.tableCardHeader}>
          <h3 style={tbStyles.tableCardTitle}>Payment Mode Breakdown</h3>
        </div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", padding: "0 20px 20px" }}>
          {paymentBreakdown.map(([mode, v]) => (
            <div key={mode} style={{ flex: "1 1 140px", background: "#f8fafc", border: `2px solid ${modeColors[mode] || "#94a3b8"}22`, borderRadius: 10, padding: "14px 18px" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: modeColors[mode] || "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>{mode}</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#1e293b", marginBottom: 2 }}>Rs. {v.amount.toLocaleString()}</div>
              <div style={{ fontSize: 11, color: "#94a3b8" }}>{v.count} transactions</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Balance Verification ── */}
      <div style={{ ...tbStyles.balanceBox, background: grand.isBalanced ? "#f0fdf4" : "#fef2f2", borderColor: grand.isBalanced ? "#86efac" : "#fca5a5" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {grand.isBalanced
            ? <CheckCircle size={22} color="#059669" />
            : <AlertCircle size={22} color="#dc2626" />}
          <div>
            <div style={{ fontWeight: 700, color: grand.isBalanced ? "#059669" : "#dc2626", fontSize: 15 }}>
              {grand.isBalanced ? "Trial Balance is Balanced ✓" : "Trial Balance Mismatch Detected ✗"}
            </div>
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
              Debit (Total Billed): <strong>Rs. {grand.totalInvoice.toLocaleString()}</strong>
              &nbsp;&nbsp;|&nbsp;&nbsp;
              Credit (Received + Pending): <strong>Rs. {(grand.totalReceived + grand.totalPending).toLocaleString()}</strong>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

// ── Styles ──
const tbStyles = {
  wrapper: { padding: "24px 16px", maxWidth: 1400, margin: "0 auto", fontFamily: "Inter, system-ui, sans-serif" },
  pageHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 24 },
  pageTitle: { fontSize: 26, fontWeight: 800, color: "#0f172a", margin: 0, letterSpacing: "-0.02em" },
  pageSub: { fontSize: 13, color: "#64748b", margin: "4px 0 0" },
  downloadBtn: { display: "flex", alignItems: "center", padding: "10px 22px", background: "linear-gradient(135deg, #1e40af, #3b82f6)", color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: "pointer", boxShadow: "0 2px 10px rgba(59,130,246,0.35)", whiteSpace: "nowrap" },
  filterBar: { display: "flex", alignItems: "center", flexWrap: "wrap", gap: 8, marginBottom: 24, padding: "12px 16px", background: "#f8fafc", borderRadius: 12, border: "1px solid #e2e8f0" },
  filterLabel: { fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", marginRight: 4 },
  filterBtn: { padding: "6px 16px", background: "#ffffff", border: "1.5px solid #d1d5db", borderRadius: 8, fontSize: 12, fontWeight: 600, color: "#475569", cursor: "pointer" },
  filterBtnActive: { background: "#1e40af", borderColor: "#1e40af", color: "#ffffff" },
  dateInput: { padding: "6px 10px", border: "1.5px solid #d1d5db", borderRadius: 8, fontSize: 12, color: "#1e293b", background: "#fff" },
  cardsRow: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 24 },
  card: { borderRadius: 12, border: "1.5px solid", padding: "18px 20px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" },
  tableCard: { background: "#ffffff", borderRadius: 14, border: "1px solid #e2e8f0", marginBottom: 20, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" },
  tableCardHeader: { padding: "16px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 },
  tableCardTitle: { fontSize: 16, fontWeight: 700, color: "#1e293b", margin: 0 },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { padding: "12px 16px", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", textAlign: "right", whiteSpace: "nowrap" },
  td: { padding: "11px 16px", fontSize: 13, color: "#1e293b" },
  balanceBox: { borderRadius: 12, border: "1.5px solid", padding: "16px 20px", marginBottom: 20 },
};