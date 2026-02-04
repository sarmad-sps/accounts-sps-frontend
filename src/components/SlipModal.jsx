// import React from "react";
// import { Printer } from "lucide-react";
// export default function SlipModal({ slip, setSelectedSlip }) {
//   if (!slip) return null;

//   const slipPaper = {
//     background: "#ffffff", color: "#111827",
//     padding: "40px 50px", borderRadius: "12px",
//     boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
//     fontFamily: '"Helvetica Neue", Arial, sans-serif',
//     lineHeight: 1.5,
//     maxWidth: "210mm", margin: "0 auto",
//     boxSizing: "border-box"
//   };

//   const modalOverlay = {
//     position: "fixed", inset: 0, background: "rgba(0,0,0,0.80)",
//     display: "flex", justifyContent: "center", alignItems: "flex-start",
//     zIndex: 2000, padding: "20px 0", overflowY: "auto"
//   };

//   const modalContent = { width: "100%", maxWidth: "720px" };
//   const modalActions = { display: "flex", gap: "16px", marginTop: "24px", justifyContent: "center" };
//   const btnSecondary = { padding: "12px 28px", background: "#334155", color: "white", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: 600 };
//   const btnPrint = { padding: "12px 28px", background: "#10b981", color: "white", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", gap: "8px" };

//   return (
//     <div style={modalOverlay}>
//       <div style={modalContent}>
//         <div id="printable-slip" style={slipPaper}>
//           {/* Header */}
//           <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "32px" }}>
//             <div>
//               <h1 style={{ margin: 0, fontSize: "42px", fontWeight: 900, color: "#1e293b", letterSpacing: "-1px" }}>SPS</h1>
//               <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#4b5563", fontWeight: 500 }}>Stores & Inventory Department</p>
//               <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#6b7280" }}>Lahore, Pakistan</p>
//             </div>

//             <div style={{ textAlign: "right" }}>
//               <div style={{ background: "#111827", color: "#ffffff", padding: "6px 14px", fontSize: "13px", fontWeight: 700, borderRadius: "6px", marginBottom: "8px" }}>GOODS ISSUANCE SLIP</div>
//               <div style={{ fontSize: "15px", fontWeight: 600, margin: "8px 0 4px" }}>
//                 No: <strong>{slip._id?.slice(-8).toUpperCase() || "—"}</strong>
//               </div>
//               <div style={{ fontSize: "13px", color: "#4b5563" }}>
//                 Issued: {slip.issuedDate
//                   ? new Date(slip.issuedDate).toLocaleDateString("en-PK", { year: "numeric", month: "long", day: "numeric" })
//                   : "Pending"}
//               </div>
//             </div>
//           </div>

//           <hr style={{ border: "none", borderTop: "2px solid #d1d5db", margin: "32px 0" }} />

//           {/* Info */}
//           <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px", marginBottom: "40px" }}>
//             <div>
//               <div style={{ fontSize: "11px", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 500, marginBottom: "4px" }}>Requested By</div>
//               <div style={{ fontSize: "17px", fontWeight: 700 }}>{slip.requestedBy || "—"}</div>
//             </div>
//             <div>
//               <div style={{ fontSize: "11px", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 500, marginBottom: "4px" }}>Purpose / Department</div>
//               <div style={{ fontSize: "15px", fontWeight: 500 }}>{slip.desc || "—"}</div>
//             </div>
//           </div>

//           {/* Items Table */}
//           <div style={{ border: "1px solid #d1d5db", borderRadius: "8px", overflow: "hidden", margin: "32px 0 48px" }}>
//             <div style={{ background: "#f3f4f6", padding: "14px 20px", display: "flex", fontSize: "13px", fontWeight: 600, borderBottom: "1px solid #d1d5db" }}>
//               <div style={{ flex: 1 }}>Item Description</div>
//               <div style={{ width: "140px", textAlign: "right" }}>Quantity</div>
//             </div>

//             <div style={{ padding: "18px 20px", display: "flex", fontSize: "15px" }}>
//               <div style={{ flex: 1, fontWeight: 500 }}>{slip.item || "—"}</div>
//               <div style={{ width: "140px", textAlign: "right", fontWeight: 700 }}>
//                 {slip.qty} {parseInt(slip.qty) === 1 ? "unit" : "units"}
//               </div>
//             </div>
//           </div>

//           {/* Signatures */}
//           <div style={{ display: "flex", justifyContent: "space-between", gap: "24px", marginTop: "60px", paddingTop: "40px" }}>
//             {["Receiver", "Issued By (Store)", "Authorized"].map((title, idx) => (
//               <div key={idx} style={{ flex: 1, textAlign: "center" }}>
//                 <div style={{ borderTop: "1.5px solid " + (title === "Issued By (Store)" ? "#059669" : "#374151"), height: "50px", marginBottom: "12px" }}></div>
//                 <div style={{ fontSize: "13px", fontWeight: 600, color: title === "Issued By (Store)" ? "#059669" : "#374151" }}>{title}'s Signature</div>
//                 <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "8px" }}>Name: ____________________</div>
//               </div>
//             ))}
//           </div>

//           {/* Footer */}
//           <div style={{ marginTop: "64px", textAlign: "center", fontSize: "11px", color: "#6b7280", borderTop: "1px dashed #9ca3af", paddingTop: "16px" }}>
//             <div style={{ marginBottom: "8px" }}>This is a computer-generated document. No manual signature required for internal use.</div>
//             <div style={{ fontStyle: "italic", opacity: 0.7 }}>Generated on {new Date().toLocaleString("en-PK")}</div>
//           </div>
//         </div>

//         <div style={modalActions}>
//           <button onClick={() => setSelectedSlip(null)} style={btnSecondary}>Close</button>
//           <button onClick={() => window.print()} style={btnPrint}><Printer size={18} /> Print / Save as PDF</button>
//         </div>

//         <style jsx global>{`
//           @media print {
//             @page { size: A4; margin: 8mm 10mm 12mm 10mm !important; }
//             body * { visibility: hidden; }
//             #printable-slip, #printable-slip * { visibility: visible !important; }
//             #printable-slip { position: absolute; top: 0; left: 0; width: 100%; margin: 0; padding: 25px 35px; box-shadow: none; border-radius: 0; background: white; color: black; }
//             .modal-actions, .modal-overlay > :not(#printable-slip) { display: none !important; }
//           }
//         `}</style>
//       </div>
//     </div>
//   );
// }
import React, { useRef } from "react";
import { Printer, X } from "lucide-react";
import spLogo from "../assets/sps-logo.png";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

export default function SlipModal({ slip, setSelectedSlip }) {
  if (!slip) return null;

  const printRef = useRef(null);

  const handleDownloadPDF = async () => {
    if (!printRef.current) return;

    try {
      const canvas = await html2canvas(printRef.current, {
        scale: 2.5,           
        useCORS: true,
        logging: false,
        allowTaint: true,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;

      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 0;

      pdf.addImage(imgData, "PNG", imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.save(`Issuance-Voucher-REF-${slip._id?.slice(-8) || "XXXX"}.pdf`);
    } catch (error) {
      console.error("PDF generation failed:", error);
      alert("Can't Generate Pdf.");
    }
  };

  // Styles
  const modalOverlay = {
    position: "fixed",
    inset: 0,
    background: "rgba(15, 23, 42, 0.92)",
    backdropFilter: "blur(10px)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "center",
    zIndex: 9999,
    padding: "24px",
    overflowY: "auto",
  };

  const slipPaper = {
    background: "#ffffff",
    color: "#0f172a",
    width: "210mm",
    minHeight: "297mm",
    margin: "0 auto",
    padding: "20mm 18mm",
    borderRadius: "4px",
    boxShadow: "0 20px 60px -15px rgba(0,0,0,0.4)",
    fontFamily: "'Inter', system-ui, sans-serif",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
  };

  const btnSecondary = {
    padding: "10px 20px",
    background: "#f1f5f9",
    color: "#475569",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: 600,
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
  };

  const btnPrint = {
    padding: "11px 28px",
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: 600,
    display: "inline-flex",
    alignItems: "center",
    gap: "9px",
    boxShadow: "0 2px 6px rgba(37,99,235,0.2)",
  };

  return (
    <div style={modalOverlay}>
      <div style={{ width: "100%", maxWidth: "1000px" }}>
        <div ref={printRef} id="printable-slip" style={slipPaper}>
          {/* Header */}
          <header
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              paddingBottom: "18px",
              borderBottom: "2px solid #1e293b",
              marginBottom: "28px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <img
                src={spLogo}
                alt="SPS Logo"
                style={{ height: "52px", width: "auto", objectFit: "contain" }}
              />
              <div>
                <h1
                  style={{
                    margin: 0,
                    fontSize: "22px",
                    fontWeight: 800,
                    letterSpacing: "-0.4px",
                    color: "#0f172a",
                  }}
                >
                <span style={{ color: "#2563eb" }}>SECURE PATH SOLUTIONS</span>
                </h1>
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    color: "#64748b",
                    textTransform: "uppercase",
                    letterSpacing: "0.4px",
                    marginTop: "3px",
                  }}
                >
                  Inventory• Asset Management
                </div>
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <div
                style={{
                  display: "inline-block",
                  background: "#0f172a",
                  color: "white",
                  padding: "5px 14px",
                  fontSize: "10px",
                  fontWeight: 700,
                  borderRadius: "4px",
                  textTransform: "uppercase",
                  letterSpacing: "0.6px",
                  marginBottom: "8px",
                }}
              >
                Issuance Voucher
              </div>
              <div style={{ fontSize: "15px", fontWeight: 700 }}>
                REF-{slip._id?.slice(-8)?.toUpperCase() || "XXXXXX"}
              </div>
            </div>
          </header>

          {/* Metadata */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "32px",
              marginBottom: "40px",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "10px",
                  fontWeight: 700,
                  color: "#64748b",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  marginBottom: "6px",
                }}
              >
                Issued To
              </div>
              <div style={{ fontSize: "19px", fontWeight: 700, color: "#0f172a" }}>
                {slip.requestedBy || "—"}
              </div>
              <div
                style={{
                  fontSize: "13.5px",
                  color: "#334155",
                  marginTop: "4px",
                  lineHeight: 1.4,
                }}
              >
                Purpose: {slip.desc || "Inventory release / internal use"}
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <div
                style={{
                  fontSize: "10px",
                  fontWeight: 700,
                  color: "#64748b",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  marginBottom: "6px",
                }}
              >
                Issued On
              </div>
              <div style={{ fontSize: "15.5px", fontWeight: 600 }}>
                {slip.issuedDate
                  ? new Date(slip.issuedDate).toLocaleString("en-PK", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })
                  : "—"}
              </div>
              <div
                style={{
                  display: "inline-block",
                  marginTop: "8px",
                  background: "#ecfdf5",
                  color: "#065f46",
                  padding: "4px 10px",
                  borderRadius: "6px",
                  fontSize: "11.5px",
                  fontWeight: 700,
                }}
              >
                DIGITALLY APPROVED
              </div>
            </div>
          </div>

          {/* Items Table */}
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginBottom: "auto",
            }}
          >
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "2.5px solid #1e293b" }}>
                <th
                  style={{
                    textAlign: "left",
                    padding: "14px 16px",
                    fontSize: "11.5px",
                    fontWeight: 700,
                    color: "#1e293b",
                    textTransform: "uppercase",
                  }}
                >
                  Description of Goods
                </th>
                <th
                  style={{
                    textAlign: "center",
                    padding: "14px 16px",
                    fontSize: "11.5px",
                    fontWeight: 700,
                    color: "#1e293b",
                    textTransform: "uppercase",
                  }}
                >
                  UOM
                </th>
                <th
                  style={{
                    textAlign: "right",
                    padding: "14px 16px",
                    fontSize: "11.5px",
                    fontWeight: 700,
                    color: "#1e293b",
                    textTransform: "uppercase",
                  }}
                >
                  Quantity
                </th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                <td
                  style={{
                    padding: "28px 16px",
                    fontSize: "16.5px",
                    fontWeight: 500,
                    color: "#0f172a",
                  }}
                >
                  {slip.item || "—"}
                </td>
                <td
                  style={{
                    padding: "28px 16px",
                    fontSize: "15px",
                    textAlign: "center",
                    color: "#475569",
                  }}
                >
                  Unit
                </td>
                <td
                  style={{
                    padding: "28px 16px",
                    fontSize: "22px",
                    fontWeight: 800,
                    textAlign: "right",
                    color: "#0f172a",
                  }}
                >
                  {slip.qty || "—"}
                </td>
              </tr>
            </tbody>
          </table>
          <div style={{ marginTop: "auto", paddingTop: "48px" }}>
            {/* Signatures */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: "24px",
                textAlign: "center",
                marginBottom: "32px",
              }}
            >
              {["Recipient", "Store Officer", "Authorized By"].map((role, i) => (
                <div key={i}>
                  <div
                    style={{
                      height: "54px",
                      borderTop: "1.5px solid #1e293b",
                      marginBottom: "10px",
                    }}
                  />
                  <div
                    style={{
                      fontSize: "12.5px",
                      fontWeight: 700,
                      color: "#0f172a",
                    }}
                  >
                    {role}
                  </div>
                </div>
              ))}
            </div>

            {/* Important Note – ab footer ke bilkul paas */}
            <div
              style={{
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "6px",
                padding: "16px 20px",
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: "11.5px",
                  color: "#475569",
                  lineHeight: 1.55,
                }}
              >
                <strong style={{ color: "#334155" }}>Important:</strong> This voucher is an official record of inventory movement. The recipient must verify items at the time of receipt. Report any discrepancies immediately to the Inventory Department.
              </p>
            </div>
          </div>
        </div>

        {/* Screen buttons */}
        <div
          style={{
            display: "flex",
            gap: "16px",
            justifyContent: "center",
            marginTop: "28px",
            paddingBottom: "40px",
          }}
          className="no-print"
        >
          <button onClick={() => setSelectedSlip(null)} style={btnSecondary}>
            <X size={18} /> Close
          </button>
          <button onClick={handleDownloadPDF} style={btnPrint}>
            <Printer size={18} /> Download PDF
          </button>
        </div>

        {/* Print fallback styles (optional ab) */}
        <style>{`
          @media print {
            @page { size: A4 portrait; margin: 0; }
            body { margin: 0; padding: 0; background: white; }
            .no-print { display: none !important; }
            #printable-slip { 
              box-shadow: none; 
              border-radius: 0; 
              width: 210mm; 
              min-height: 297mm; 
              padding: 18mm 16mm !important; 
              margin: 0 !important; 
            }
            * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          }
        `}</style>
      </div>
    </div>
  );
}