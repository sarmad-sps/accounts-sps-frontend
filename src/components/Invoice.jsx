
import React, { useMemo, useRef, useState } from "react";
import { BANKS, toMoney } from "../store";
import { downloadPdfFromElement } from "../utils/pdf";
import logo from "../assets/sps-logo.png";

function bankLabel(key) {
  return BANKS.find((b) => b.key === key)?.label || key;
}

export default function Invoice({ record, companyName, mode = "invoice" }) {
  const invoiceRef = useRef(null);
  const [busy, setBusy] = useState(false);

  const isReceipt = mode === "receipt";
  const accentColor = isReceipt ? "#22c55e" : "#2563eb";
  const lightAccent = isReceipt ? "#f0fdf4" : "#eff6ff";

  const docNo = useMemo(() => {
    const dateStr = String(record?.date || "").replace(/[-/]/g, "");
    const shortId = String(record?.id || "000000")
      .slice(-6)
      .toUpperCase();

    return isReceipt ? `REC-${dateStr}-${shortId}` : `INV-${dateStr}-${shortId}`;
  }, [record, isReceipt]);

  if (!record) return null;

  async function handleDownloadPdf() {
    try {
      setBusy(true);
      const safeClient = String(record.clientName || record.party || "client").replaceAll(" ", "_");
      const filename = `${isReceipt ? "Receipt" : "Invoice"}_${safeClient}_${docNo}.pdf`;
      await downloadPdfFromElement(invoiceRef.current, filename);
    } catch (err) {
      console.error("PDF Download Error:", err);
      alert("Failed to export PDF. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  function handlePrint() {
    const el = invoiceRef.current;
    if (!el) return;
    const printWindow = window.open("", "_blank", "width=1000,height=800");
    if (!printWindow) return alert("Popup blocked. Please allow popups.");

    const html = `
      <html>
        <head>
          <title>${docNo}</title>
          <style>
            @page { size: A4; margin: 0; }
            body { margin: 0; padding: 0; font-family: 'Inter', system-ui, sans-serif; }
            * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          </style>
        </head>
        <body>${el.outerHTML}</body>
        <script>window.onload = () => { window.print(); window.close(); }</script>
      </html>`;

    printWindow.document.write(html);
    printWindow.document.close();
  }

  const normalizedStatus = (record?.status || "PENDING").toUpperCase();

  return (
    <div style={previewStyles.container}>
      {/* Top Action Bar - Buttons Section */}
      <div style={previewStyles.actionBar}>
        <div style={previewStyles.infoGroup}>
          <div style={{ ...previewStyles.statusDot, background: accentColor }} />
          <div>
            <div style={previewStyles.mainTitle}>
              {isReceipt ? "Official Payment Receipt" : "Receipt Voucher / Invoice"}
            </div>
            <div style={previewStyles.idSubtitle}>
              {docNo} • {record.date}
            </div>
          </div>
        </div>
        <div style={previewStyles.buttonGroup}>
          <button
            style={previewStyles.secondaryBtn}
            onClick={handleDownloadPdf}
            disabled={busy}
          >
            {busy ? "Generating..." : "Export PDF"}
          </button>
          <button
            style={{
              ...previewStyles.primaryBtn,
              backgroundColor: accentColor,
            }}
            onClick={handlePrint}
          >
            Print Document
          </button>
        </div>
      </div>

      {/* Invoice/Receipt Paper */}
      <div className="invoice-paper" ref={invoiceRef} style={paperStyles.canvas}>
        <div style={paperStyles.innerPadding}>
          {/* Header */}
          <div style={paperStyles.header}>
            <div style={paperStyles.brand}>
              <img src={logo} alt="logo" style={paperStyles.logoImg} />
              <div>
                <div style={paperStyles.brandName}>
                  {companyName || "SECURE PATH SOLUTIONS"}
                </div>
                <div style={paperStyles.brandTagline}>
                  Premium Vehicle Tracking & Security
                </div>
              </div>
            </div>
            <div style={paperStyles.meta}>
              <div
                style={{
                  ...paperStyles.badge,
                  color: accentColor,
                  backgroundColor: lightAccent,
                }}
              >
                {isReceipt ? "PAYMENT RECEIPT" : "OFFICIAL INVOICE"}
              </div>
              <div style={paperStyles.metaRow}>
                <strong>No:</strong> {docNo}
              </div>
              <div style={paperStyles.metaRow}>
                <strong>Date:</strong> {record.date}
              </div>
            </div>
          </div>

          {/* Client & Company Info */}
          <div style={paperStyles.partiesGrid}>
            <div style={paperStyles.partyBox}>
              <div style={{ ...paperStyles.partyTitle, color: accentColor }}>ISSUED BY</div>
              <div style={paperStyles.partyContent}>
                <div style={paperStyles.partyName}>Secure Path Solutions Pvt Ltd.</div>
                <div style={paperStyles.partyDetail}>House 1-A, Upper Mall, Lahore</div>
                <div style={paperStyles.partyDetail}>03008492075</div>
              </div>
            </div>

            <div style={paperStyles.partyBox}>
              <div style={{ ...paperStyles.partyTitle, color: accentColor }}>
                {isReceipt ? "RECEIVED FROM" : "BILL TO / CLIENT"}
              </div>
              <div style={paperStyles.partyContent}>
                <div style={{ display: "flex", marginBottom: "6px" }}>
                  <span style={{ width: "110px", fontWeight: "600", color: "black", fontSize: "13px" }}>Client Name:</span>
                  <span style={paperStyles.partyName}>{record.clientName || record.party || "Valued Client"}</span>
                </div>
                <div style={{ display: "flex", marginBottom: "6px" }}>
                  <span style={{ width: "110px", fontWeight: "600", color: "black", fontSize: "13px" }}>Phone:</span>
                  <span style={paperStyles.partyDetail}>{record.clientPhone || "N/A"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Insurance Details */}
          {record.category === "Insurance" && record.insuranceCover && (
            <div style={paperStyles.tableWrapper}>
              <div style={{ ...paperStyles.tableHeader, backgroundColor: lightAccent, color: accentColor }}>
                Insurance Details
              </div>
              <div style={paperStyles.gridTable}>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 20px", gridColumn: "span 2" }}>
                  <span style={paperStyles.gridLabel}>Insurance Cover Type:</span>
                  <span style={{ ...paperStyles.gridValue, fontWeight: "700" }}>{record.insuranceCover}</span>
                </div>
              </div>
            </div>
          )}

          {/* Tracker Details */}
          {record.category === "Tracker" && (
            <div style={paperStyles.tableWrapper}>
              <div style={{ ...paperStyles.tableHeader, backgroundColor: lightAccent, color: accentColor }}>
                Vehicle & Tracker Details
              </div>
              <div style={paperStyles.gridTable}>
                {[
                  { label: "Tracker Company", value: record.trackerCompany },
                  { label: "Tracker Type", value: record.trackerType },
                  { label: "Registration No", value: record.registrationNo },
                  { label: "Vehicle Brand", value: record.vehicleBrand },
                  { label: "Chassis Number", value: record.chassisNumber },
                  { label: "Engine Number", value: record.engineNumber },
                ].map((item, idx) => (
                  <div key={idx} style={{ ...paperStyles.gridItem, borderBottom: idx < 4 ? "1px solid #eee" : "none" }}>
                    <span style={paperStyles.gridLabel}>{item.label}</span>
                    <span style={paperStyles.gridValue}>{item.value || "—"}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Amount Box */}
          <div style={{ ...paperStyles.summaryBox, borderLeft: `6px solid ${accentColor}` }}>
            <div style={paperStyles.summaryContent}>
              <div style={paperStyles.summaryLabel}>{isReceipt ? "Amount Received" : "Total Amount"}</div>
              <div style={paperStyles.summaryValue}>PKR {toMoney(record.amount)}</div>
            </div>
           <div style={paperStyles.summaryMode}>
  {isReceipt && (
    <>
      <div style={{ ...paperStyles.modeLabel, color: "#000000" }}>
        Payment Mode
      </div>
      <div style={{ ...paperStyles.modeValue, color: "#000000" }}>
        {record.paymentMode || "Cash"}
      </div>

      <div
        style={{
          marginTop: "12px",
          fontSize: "18px",
          fontWeight: "800",
          color:
            normalizedStatus === "RECEIVED"
              ? "#15803d"
              : "#b45309",
        }}
      >
        {normalizedStatus}
      </div>
    </>
  )}
</div>

          </div>

          {/* Signatures */}
          {isReceipt && (
            <div style={paperStyles.footerSignatures}>
              <div style={{ ...paperStyles.stampBox, borderColor: accentColor, color: accentColor }}>
                PAID & RECEIVED
                <div style={paperStyles.stampDate}>{record.date}</div>
              </div>
              <div style={paperStyles.sigGroup}>
                <div style={paperStyles.sigLine} />
                <div style={paperStyles.sigText}>Authorized Signature</div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={paperStyles.footerBar}>
          <strong>Phone:</strong> 03008492075 | <strong>Email:</strong> contact@securepathsolution.com
          <br />
          This is a computer-generated document.
        </div>
      </div>
    </div>
  );
}

const previewStyles = {
  container: { 
    padding: "clamp(12px, 3vw, 20px)", 
    display: "flex", 
    flexDirection: "column", 
    gap: "clamp(16px, 4vw, 24px)", 
    alignItems: "center", 
    background: "#f1f5f9", 
    minHeight: "100vh",
    width: "100%",
    boxSizing: "border-box"
  },
  actionBar: { 
    width: "100%", 
    maxWidth: "210mm", 
    background: "#ffffff", 
    border: "1px solid #e2e8f0", 
    borderRadius: "12px", 
    padding: "clamp(12px, 3vw, 16px) clamp(14px, 3.5vw, 24px)", 
    display: "flex", 
    justifyContent: "space-between", 
    alignItems: "center",
    flexWrap: "wrap",
    gap: "clamp(10px, 2.5vw, 16px)",
    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
    boxSizing: "border-box"
  },
  infoGroup: { 
    display: "flex", 
    gap: "clamp(10px, 2.5vw, 16px)", 
    alignItems: "center",
    flex: 1,
    minWidth: "clamp(200px, 100%, 300px)"
  },
  statusDot: { 
    width: "clamp(10px, 2vw, 12px)", 
    height: "clamp(10px, 2vw, 12px)", 
    borderRadius: "50%",
    flexShrink: 0
  },
  mainTitle: { 
    fontSize: "clamp(15px, 4vw, 18px)", 
    fontWeight: "700", 
    color: "#1e293b" 
  },
  idSubtitle: { 
    fontSize: "clamp(11px, 3vw, 13px)", 
    color: "black",
    wordBreak: "break-word"
  },
  buttonGroup: { 
    display: "flex", 
    gap: "clamp(8px, 2vw, 12px)",
    flexWrap: "wrap"
  },
  primaryBtn: { 
    padding: "clamp(8px, 2vw, 10px) clamp(14px, 3vw, 20px)", 
    borderRadius: "8px", 
    color: "white", 
    border: "none", 
    fontWeight: "600", 
    cursor: "pointer",
    fontSize: "clamp(12px, 3.2vw, 14px)",
    whiteSpace: "nowrap",
    minHeight: "clamp(34px, 8vw, 40px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease"
  },
  modeLabel: {
  fontSize: "clamp(10px, 2.5vw, 12px)",
  fontWeight: "600",
  color: "#000000",
},

modeValue: {
  fontSize: "clamp(12px, 3.2vw, 14px)",
  fontWeight: "700",
  color: "#000000",
},

  secondaryBtn: { 
    padding: "clamp(8px, 2vw, 10px) clamp(14px, 3vw, 20px)", 
    borderRadius: "8px", 
    color: "#1e293b", 
    background: "#f1f5f9", 
    border: "1px solid #cbd5e1", 
    fontWeight: "600", 
    cursor: "pointer",
    fontSize: "clamp(12px, 3.2vw, 14px)",
    whiteSpace: "nowrap",
    minHeight: "clamp(34px, 8vw, 40px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease"
  },
};

const paperStyles = {
  canvas: { 
    width: "100%",
    maxWidth: "210mm",
    minHeight: "297mm", 
    background: "#fff", 
    display: "flex", 
    flexDirection: "column", 
    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
    boxSizing: "border-box",
    color:'black'
  },
  innerPadding: { 
    padding: "clamp(30px, 5vw, 50px) clamp(20px, 4vw, 60px)", 
    flex: 1,
    boxSizing: "border-box"
  },
  header: { 
    display: "flex", 
    justifyContent: "space-between", 
    marginBottom: "clamp(24px, 5vw, 40px)",
    flexWrap: "wrap",
    gap: "clamp(12px, 3vw, 20px)"
  },
  brand: { 
    display: "flex", 
    gap: "clamp(10px, 2.5vw, 15px)", 
    alignItems: "center" 
  },
  logoImg: { 
    width: "clamp(40px, 8vw, 60px)", 
    height: "clamp(40px, 8vw, 60px)", 
    objectFit: "contain" 
  },
  brandName: { 
    fontSize: "clamp(16px, 4.5vw, 20px)", 
    fontWeight: "800", 
    color: "#0f172a" 
  },
  brandTagline: { 
    fontSize: "clamp(9px, 2.5vw, 11px)", 
    color: "#64748b" 
  },
  meta: { 
    textAlign: "right",
    minWidth: "clamp(120px, 30%, 200px)"
  },
  badge: { 
    padding: "clamp(6px, 1.5vw, 8px) clamp(10px, 2.5vw, 15px)", 
    borderRadius: "6px", 
    fontSize: "clamp(12px, 3.2vw, 14px)", 
    fontWeight: "800", 
    marginBottom: "10px", 
    display: "inline-block" 
  },
  metaRow: { 
    fontSize: "clamp(11px, 3vw, 13px)", 
    marginBottom: "2px",
    wordBreak: "break-word",
    color: "#000000"
  },
  partiesGrid: { 
    display: "grid", 
    gridTemplateColumns: "repeat(auto-fit, minmax(clamp(160px, 100%, 200px), 1fr))", 
    gap: "clamp(16px, 4vw, 30px)", 
    marginBottom: "clamp(20px, 4vw, 30px)" 
  },
  partyBox: { 
    border: "1px solid black", 
    borderRadius: "8px", 
    padding: "clamp(12px, 3vw, 15px)", 
    background: "#fcfcfc",
    boxSizing: "border-box"
  },
  partyTitle: { 
    fontSize: "clamp(10px, 2.5vw, 12px)", 
    fontWeight: "800", 
    marginBottom: "8px" 
  },
  partyName: { 
    fontSize: "clamp(12px, 3.2vw, 14px)", 
    fontWeight: "700", 
    color: "#0f172a" 
  },
  partyDetail: { 
    fontSize: "clamp(11px, 3vw, 13px)", 
    color: "#475569",
    wordBreak: "break-word"
  },
  tableWrapper: { 
    border: "1px solid black", 
    borderRadius: "8px", 
    overflow: "hidden", 
    marginBottom: "clamp(16px, 4vw, 25px)",
    width: "100%",
    boxSizing: "border-box"
  },
  tableHeader: { 
    padding: "clamp(10px, 2.5vw, 10px) clamp(12px, 2.5vw, 15px)", 
    fontSize: "clamp(13px, 3.5vw, 15px)", 
    fontWeight: "700" 
  },
  gridTable: { 
    display: "grid", 
    gridTemplateColumns: "1fr 1fr" 
  },
  gridItem: { 
    padding: "clamp(8px, 2vw, 10px) clamp(12px, 2.5vw, 15px)", 
    display: "flex", 
    justifyContent: "space-between",
    gap: "8px"
  },
  gridLabel: { 
    fontSize: "clamp(10px, 2.5vw, 12px)", 
    color: "black" 
  },
  gridValue: { 
    fontSize: "clamp(11px, 3vw, 13px)", 
    fontWeight: "600" 
  },
  summaryBox: { 
    display: "flex", 
    justifyContent: "space-between", 
    alignItems: "center", 
    background: "#f8fafc", 
    padding: "clamp(14px, 3.5vw, 20px)", 
    borderRadius: "8px", 
    marginBottom: "clamp(20px, 4vw, 30px)",
    flexWrap: "wrap",
    gap: "12px"
  },
  summaryLabel: { 
    fontSize: "clamp(10px, 2.5vw, 12px)", 
    fontWeight: "600", 
    color: "#64748b" 
  },
  summaryValue: { 
    fontSize: "clamp(18px, 5vw, 24px)", 
    fontWeight: "800", 
    color: "#0f172a" 
  },
  footerSignatures: { 
    display: "flex", 
    justifyContent: "space-between", 
    alignItems: "flex-end", 
    marginTop: "clamp(24px, 5vw, 40px)",
    flexWrap: "wrap",
    gap: "clamp(12px, 3vw, 20px)"
  },
  stampBox: { 
    border: "2px solid", 
    padding: "clamp(8px, 2vw, 10px)", 
    borderRadius: "4px", 
    fontWeight: "800", 
    textAlign: "center", 
    minWidth: "clamp(100px, 20vw, 150px)",
    fontSize: "clamp(10px, 2.5vw, 12px)"
  },
  sigLine: { 
    width: "clamp(100px, 25vw, 180px)", 
    height: "1px", 
    background: "#0f172a", 
    marginBottom: "5px" 
  },
  sigText: { 
    fontSize: "clamp(10px, 2.5vw, 12px)", 
    fontWeight: "700" ,
    color:'black'

  },
  footerBar: { 
    padding: "clamp(12px, 3vw, 20px)", 
    background: "#f8fafc", 
    fontSize: "clamp(8px, 2vw, 10px)", 
    textAlign: "center", 
    borderTop: "1px solid #e2e8f0",
    wordBreak: "break-word"
  },
};