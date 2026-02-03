import React from "react";
import { Printer } from "lucide-react";
export default function SlipModal({ slip, setSelectedSlip }) {
  if (!slip) return null;

  const slipPaper = {
    background: "#ffffff", color: "#111827",
    padding: "40px 50px", borderRadius: "12px",
    boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
    fontFamily: '"Helvetica Neue", Arial, sans-serif',
    lineHeight: 1.5,
    maxWidth: "210mm", margin: "0 auto",
    boxSizing: "border-box"
  };

  const modalOverlay = {
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.80)",
    display: "flex", justifyContent: "center", alignItems: "flex-start",
    zIndex: 2000, padding: "20px 0", overflowY: "auto"
  };

  const modalContent = { width: "100%", maxWidth: "720px" };
  const modalActions = { display: "flex", gap: "16px", marginTop: "24px", justifyContent: "center" };
  const btnSecondary = { padding: "12px 28px", background: "#334155", color: "white", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: 600 };
  const btnPrint = { padding: "12px 28px", background: "#10b981", color: "white", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", gap: "8px" };

  return (
    <div style={modalOverlay}>
      <div style={modalContent}>
        <div id="printable-slip" style={slipPaper}>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "32px" }}>
            <div>
              <h1 style={{ margin: 0, fontSize: "42px", fontWeight: 900, color: "#1e293b", letterSpacing: "-1px" }}>SPS</h1>
              <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#4b5563", fontWeight: 500 }}>Stores & Inventory Department</p>
              <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#6b7280" }}>Lahore, Pakistan</p>
            </div>

            <div style={{ textAlign: "right" }}>
              <div style={{ background: "#111827", color: "#ffffff", padding: "6px 14px", fontSize: "13px", fontWeight: 700, borderRadius: "6px", marginBottom: "8px" }}>GOODS ISSUANCE SLIP</div>
              <div style={{ fontSize: "15px", fontWeight: 600, margin: "8px 0 4px" }}>
                No: <strong>{slip._id?.slice(-8).toUpperCase() || "—"}</strong>
              </div>
              <div style={{ fontSize: "13px", color: "#4b5563" }}>
                Issued: {slip.issuedDate
                  ? new Date(slip.issuedDate).toLocaleDateString("en-PK", { year: "numeric", month: "long", day: "numeric" })
                  : "Pending"}
              </div>
            </div>
          </div>

          <hr style={{ border: "none", borderTop: "2px solid #d1d5db", margin: "32px 0" }} />

          {/* Info */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px", marginBottom: "40px" }}>
            <div>
              <div style={{ fontSize: "11px", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 500, marginBottom: "4px" }}>Requested By</div>
              <div style={{ fontSize: "17px", fontWeight: 700 }}>{slip.requestedBy || "—"}</div>
            </div>
            <div>
              <div style={{ fontSize: "11px", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 500, marginBottom: "4px" }}>Purpose / Department</div>
              <div style={{ fontSize: "15px", fontWeight: 500 }}>{slip.desc || "—"}</div>
            </div>
          </div>

          {/* Items Table */}
          <div style={{ border: "1px solid #d1d5db", borderRadius: "8px", overflow: "hidden", margin: "32px 0 48px" }}>
            <div style={{ background: "#f3f4f6", padding: "14px 20px", display: "flex", fontSize: "13px", fontWeight: 600, borderBottom: "1px solid #d1d5db" }}>
              <div style={{ flex: 1 }}>Item Description</div>
              <div style={{ width: "140px", textAlign: "right" }}>Quantity</div>
            </div>

            <div style={{ padding: "18px 20px", display: "flex", fontSize: "15px" }}>
              <div style={{ flex: 1, fontWeight: 500 }}>{slip.item || "—"}</div>
              <div style={{ width: "140px", textAlign: "right", fontWeight: 700 }}>
                {slip.qty} {parseInt(slip.qty) === 1 ? "unit" : "units"}
              </div>
            </div>
          </div>

          {/* Signatures */}
          <div style={{ display: "flex", justifyContent: "space-between", gap: "24px", marginTop: "60px", paddingTop: "40px" }}>
            {["Receiver", "Issued By (Store)", "Authorized"].map((title, idx) => (
              <div key={idx} style={{ flex: 1, textAlign: "center" }}>
                <div style={{ borderTop: "1.5px solid " + (title === "Issued By (Store)" ? "#059669" : "#374151"), height: "50px", marginBottom: "12px" }}></div>
                <div style={{ fontSize: "13px", fontWeight: 600, color: title === "Issued By (Store)" ? "#059669" : "#374151" }}>{title}'s Signature</div>
                <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "8px" }}>Name: ____________________</div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div style={{ marginTop: "64px", textAlign: "center", fontSize: "11px", color: "#6b7280", borderTop: "1px dashed #9ca3af", paddingTop: "16px" }}>
            <div style={{ marginBottom: "8px" }}>This is a computer-generated document. No manual signature required for internal use.</div>
            <div style={{ fontStyle: "italic", opacity: 0.7 }}>Generated on {new Date().toLocaleString("en-PK")}</div>
          </div>
        </div>

        <div style={modalActions}>
          <button onClick={() => setSelectedSlip(null)} style={btnSecondary}>Close</button>
          <button onClick={() => window.print()} style={btnPrint}><Printer size={18} /> Print / Save as PDF</button>
        </div>

        <style jsx global>{`
          @media print {
            @page { size: A4; margin: 8mm 10mm 12mm 10mm !important; }
            body * { visibility: hidden; }
            #printable-slip, #printable-slip * { visibility: visible !important; }
            #printable-slip { position: absolute; top: 0; left: 0; width: 100%; margin: 0; padding: 25px 35px; box-shadow: none; border-radius: 0; background: white; color: black; }
            .modal-actions, .modal-overlay > :not(#printable-slip) { display: none !important; }
          }
        `}</style>
      </div>
    </div>
  );
}
