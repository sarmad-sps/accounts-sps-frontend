import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Send, CheckCircle, Clock, Package, Bell,
  ShieldCheck, Printer, ListChecks, AlertTriangle
} from "lucide-react";
import SlipModal from "./SlipModal";
import { BANKS } from "../store";
export default function UserReqForm({ role = "user" }) {
  const [requests, setRequests] = useState([]);
  const [formData, setFormData] = useState({ name: "", item: "", qty: "", desc: "" });
  const [selectedSlip, setSelectedSlip] = useState(null);
  const [showNotify, setShowNotify] = useState(false);
  const [receiptModal, setReceiptModal] = useState(null);
  const [receiptData, setReceiptData] = useState({ invoiceNo: "", receivedQty: "", paymentMethod: "Cash", bank: (BANKS && BANKS[0] && BANKS[0].key) || "", paymentStatus: "Paid", amount: "" });
  const [errorMsg, setErrorMsg] = useState("");

  const BASE_URL = "https://accounts-sps-backend-git-main-secure-path-solutions-projects.vercel.app/api/inventory-requests";

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await axios.get(BASE_URL);
      setRequests(res.data || []);
      setErrorMsg("");
    } catch (err) {
      console.error("Failed to fetch requests:", err);
      setErrorMsg("Could not load requests. Server may be down.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const newReq = {
        item: formData.item.trim(),
        qty: Number(formData.qty),
        desc: formData.desc.trim(),
        requestedBy: formData.name.trim(),
        status: "pending_store",
      };
      const res = await axios.post(BASE_URL, newReq);
      setRequests(prev => [res.data, ...prev]);
      setFormData({ name: "", item: "", qty: "", desc: "" });
      alert("Request Submitted Successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to submit request!");
    }
  };

  const handleAction = async (id, newStatus, extra = {}) => {
    console.log(`Action called → ID: ${id}, Status: ${newStatus}`, extra);
    try {
      const res = await axios.patch(`${BASE_URL}/${id}`, { status: newStatus, ...extra });
      console.log("PATCH success → New status:", res.data.status);
      fetchRequests();
    } catch (err) {
      console.error("PATCH failed:", err.response?.data || err.message);
      alert("Failed to update! Check console.");
    }
  };

  const handleReceiptSave = async (id) => {
    try {
      const { invoiceNo, receivedQty, paymentMethod, bank, paymentStatus, amount } = receiptData;

    if (!invoiceNo.trim() || !receivedQty || Number(receivedQty) < 1 || !paymentMethod) {
      alert("Invoice number, received quantity and payment method required!");
      return;
    }
    if ((paymentMethod === "Bank Transfer" || paymentMethod === "Check") && !bank) {
      alert("Please select a bank for Bank Transfer or Check");
      return;
    }
      await axios.patch(`${BASE_URL}/${id}`, {
        status: "stock_received",
        invoiceNo: invoiceNo.trim(),
        receivedQty: Number(receivedQty),
        paymentMethod,
        bank: bank || null,
        paymentStatus: paymentStatus || "Paid",
        amount: amount ? Number(amount) : null,
      });
      setReceiptModal(null);
      setReceiptData({ invoiceNo: "", receivedQty: "", paymentMethod: "Cash", bank: (BANKS && BANKS[0] && BANKS[0].key) || "BANK_ISLAMI", paymentStatus: "Paid", amount: "" });
      fetchRequests();
      alert("Stock updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to save receipt!");
    }
  };

  const pendingCount = requests.filter((r) => {
    if (role === "store") return ["pending_store", "stock_received"].includes(r.status);
    if (role === "admin") return ["needs_purchase", "pending_admin", "purchase_approved"].includes(r.status);
    if (role === "accountant") return r.status === "purchase_approved";
    return false;
  }).length;

  return (
    <div style={containerStyle}>
      {errorMsg && (
        <div style={{ background: "#7f1d1d", color: "white", padding: "12px", borderRadius: "8px", marginBottom: "16px", display: "flex", gap: "12px", alignItems: "center" }}>
          <AlertTriangle size={20} /> {errorMsg}
        </div>
      )}

      {/* Top Bar */}
      <div style={topNav}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={roleBadge}>System: {role.toUpperCase()}</div>
        </div>

        {(role === "store" || role === "admin" || role === "accountant") && (
          <div style={{ position: "relative" }}>
            <button onClick={() => setShowNotify(!showNotify)} style={notifyBtn}>
              <Bell size={20} />
              {pendingCount > 0 && <span style={redDot} />}
            </button>

            {showNotify && (
              <div style={notifyDrawer}>
                <h4 style={{ margin: "0 0 12px 0", fontSize: "14px", fontWeight: 600 }}>Notifications</h4>
                {pendingCount > 0 ? (
                  requests
                    .filter((r) => {
                      if (role === "store") return ["pending_store", "stock_received"].includes(r.status);
                      if (role === "admin") return ["needs_purchase", "pending_admin", "purchase_approved"].includes(r.status);
                      if (role === "accountant") return r.status === "purchase_approved";
                      return false;
                    })
                    .map((req) => (
                      <div key={req._id} style={notifyItem}>
                        <div style={{ fontWeight: 500 }}>
                          {req.item} × {req.qty}
                        </div>
                        <div style={{ fontSize: "12px", color: colors.textLight }}>
                          by <strong>{req.requestedBy}</strong>
                        </div>
                      </div>
                    ))
                ) : (
                  <p style={{ fontSize: "13px", color: colors.textLight }}>No pending requests</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* User Form */}
      {role === "user" && (
        <div style={formCard}>
          <div style={headerFlex}>
            <div style={iconBox}><Package size={24} color={colors.primary} /></div>
            <h3 style={{ margin: 0, fontSize: "22px", fontWeight: 600 }}>New Requisition</h3>
          </div>

          <form onSubmit={handleSubmit} style={formGrid}>
            <input required style={inputStyle} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Your Full Name" />
            <input required style={inputStyle} value={formData.item} onChange={e => setFormData({...formData, item: e.target.value})} placeholder="Item Name / Description" />
            <input required type="number" min="1" style={inputStyle} value={formData.qty} onChange={e => setFormData({...formData, qty: e.target.value})} placeholder="Quantity" />
            <input required style={inputStyle} value={formData.desc} onChange={e => setFormData({...formData, desc: e.target.value})} placeholder="Purpose / Department" />
            <button type="submit" style={btnSubmit}><Send size={18} /> Submit Request</button>
          </form>
        </div>
      )}

      {/* Requests Table */}
      <div style={tableCard}>
        <div style={tableHeader}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <ListChecks size={22} color={colors.primary} />
            <h3 style={{ margin: 0, fontSize: "20px", fontWeight: 600 }}>Requisition Pipeline</h3>
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Request</th>
                <th style={thStyle}>Item</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req._id} style={trStyle}>
                  <td style={tdStyle}>
                    <div style={{ fontWeight: 600, fontSize: "15px" }}>#{req._id?.slice(-6).toUpperCase()}</div>
                    <div style={{ fontSize: "12px", color: colors.textLight, margin: "4px 0" }}>
                      {new Date(req.createdAt || req.date).toLocaleString("en-PK", { dateStyle: "medium", timeStyle: "short" })}
                    </div>
                    <div style={{ fontSize: "13px", color: colors.textLight }}>
                      <strong>{req.requestedBy}</strong> • {req.desc}
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ fontWeight: 600, color: colors.text }}>{req.item}</div>
                    <div style={{ color: colors.primary, fontSize: "13px", marginTop: "4px" }}>Qty: {req.qty}</div>
                    <div style={{ fontSize: "12px", color: colors.textLight }}>
                      Stock: {req.stock != null ? req.stock : "N/A"}
                    </div>
                  </td>
                  <td style={tdStyle}>{getStatusBadge(req.status)}</td>
                  <td style={actionTd}>
                    <div style={actionGroup}>

                      {/* Store: initial check */}
                      {role === "store" && req.status === "pending_store" && (
                        <>
                          <button onClick={() => handleAction(req._id, "send_to_admin")} style={(req.stock ?? 0) >= req.qty ? btnApprove : btnVerify}>
                            {(req.stock ?? 0) >= req.qty ? "Stock In" : "Stock Out"}
                          </button>
                        </>
                      )}

                      {/* Admin */}
                      {role === "admin" && req.status === "pending_admin" && (
                        <button onClick={() => handleAction(req._id, "approved")} style={btnApprove}>Approve Request</button>
                      )}
                      {role === "admin" && req.status === "needs_purchase" && (
                        <button onClick={() => handleAction(req._id, "purchase_approved")} style={btnApprove}>Approve Purchase</button>
                      )}

                      {/* Accountant */}
                      {role === "accountant" && req.status === "purchase_approved" && (
                        <button onClick={() => setReceiptModal(req)} style={btnApprove}>Enter Receipt</button>
                      )}

                      {/* Store after stock received */}
                      {role === "store" && req.status === "stock_received" && (
                        <button onClick={() => handleAction(req._id, "approved")} style={btnApprove}>
                          stock receive- Approve
                        </button>
                      )}

                      {/* Store: issue item */}
                      {role === "store" && req.status === "approved" && (req.stock ?? 0) >= req.qty && (
                        <button onClick={() => handleAction(req._id, "issued")} style={btnIssue}>Issue Item</button>
                      )}

                      {/* Print slip */}
                      {req.status === "issued" && (
                        <button onClick={() => setSelectedSlip(req)} style={btnPrintSlip}>
                          <Printer size={16} /> Slip
                        </button>
                      )}

                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

     {/* Receipt Modal */}
{/* Receipt Modal */}
{receiptModal && (
  <div style={modalStyles.overlay}>
    <div style={modalStyles.card}>
      {/* Header Section */}
      <div style={modalStyles.header}>
        <h3 style={modalStyles.title}>Enter Purchase Receipt</h3>
        <p style={modalStyles.subtitle}>
          Item: <span style={{ color: "white", fontWeight: "600" }}>{receiptModal.item}</span>
        </p>
      </div>

      <div style={modalStyles.formBody}>
        {/* Invoice Number */}
        <div style={modalStyles.inputGroup}>
          <label style={modalStyles.label}>Invoice Number</label>
          <input
            style={modalStyles.input}
            placeholder="INV-00123"
            value={receiptData.invoiceNo}
            onChange={(e) => setReceiptData({ ...receiptData, invoiceNo: e.target.value })}
          />
        </div>

        {/* Row 1: Payment Method & Bank (conditional) */}
        <div style={modalStyles.grid}>
          <div style={modalStyles.inputGroup}>
            <label style={modalStyles.label}>Payment Method</label>
            <select
              style={modalStyles.select}
              value={receiptData.paymentMethod}
              onChange={(e) => setReceiptData({ ...receiptData, paymentMethod: e.target.value })}
            >
              <option value="Cash">Cash</option>
              <option value="Check">Check</option>
              <option value="Bank Transfer">Bank Transfer</option>
            </select>
          </div>

          {/* ✅ Bank field sirf tab dikhao jab Cash NA ho */}
          {receiptData.paymentMethod !== "Cash" && (
            <div style={modalStyles.inputGroup}>
              <label style={modalStyles.label}>Select Bank</label>
              <select
                style={modalStyles.select}
                value={receiptData.bank}
                onChange={(e) => setReceiptData({ ...receiptData, bank: e.target.value })}
              >
                {BANKS.map((b) => (
                  <option key={b.key} value={b.key}>
                    {b.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Row 2: Status & Quantity */}
        <div style={modalStyles.grid}>
          <div style={modalStyles.inputGroup}>
            <label style={modalStyles.label}>Payment Status</label>
            <select
              style={{
                ...modalStyles.select,
                color: receiptData.paymentStatus === "Paid" ? "#4ade80" : "#fbbf24",
              }}
              value={receiptData.paymentStatus}
              onChange={(e) => setReceiptData({ ...receiptData, paymentStatus: e.target.value })}
            >
              <option value="Paid">Paid</option>
              <option value="Unpaid">Unpaid</option>
            </select>
          </div>

          <div style={modalStyles.inputGroup}>
            <label style={modalStyles.label}>Received Qty</label>
            <input
              type="number"
              min="1"
              style={modalStyles.input}
              placeholder="0"
              value={receiptData.receivedQty}
              onChange={(e) => setReceiptData({ ...receiptData, receivedQty: e.target.value })}
            />
          </div>
        </div>

        {/* Amount Section */}
        <div style={modalStyles.inputGroup}>
          <label style={modalStyles.label}>Total Amount (PKR)</label>
          <div style={{ position: "relative" }}>
            <span style={modalStyles.currencyPrefix}>Rs.</span>
            <input
              type="number"
              step="0.01"
              style={{ ...modalStyles.input, paddingLeft: "45px" }}
              placeholder="0.00"
              value={receiptData.amount}
              onChange={(e) => setReceiptData({ ...receiptData, amount: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div style={modalStyles.footer}>
        <button style={modalStyles.cancelBtn} onClick={() => setReceiptModal(null)}>
          Cancel
        </button>
        <button style={modalStyles.saveBtn} onClick={() => handleReceiptSave(receiptModal._id)}>
          Confirm & Save
        </button>
      </div>
    </div>
  </div>
)}

      {/* Slip Modal (unchanged) */}
     <SlipModal slip={selectedSlip} setSelectedSlip={setSelectedSlip} />
    </div>
  );
}

// Status Badge function unchanged
function getStatusBadge(status) {
  const cfg = {
    pending_store: { label: "Pending Review", color: "#d97706", bg: "#fef3c722" },
    needs_purchase: { label: "Needs Purchase", color: "#b91c1c", bg: "#fee2e222" },
    purchase_approved: { label: "Purchase Approved", color: "#7c3aed", bg: "#f3e8ff22" },
    stock_received: { label: "Stock Received", color: "#059669", bg: "#ecfdf522" },
    approved: { label: "Approved", color: "#059669", bg: "#ecfdf522" },
    issued: { label: "Issued", color: "#0e7490", bg: "#e0f2fe22" },
  };
  const s = cfg[status] || cfg.pending_store;
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: "6px",
      padding: "6px 14px", borderRadius: "999px", fontSize: "13px", fontWeight: 600,
      background: s.bg, color: s.color, border: `1px solid ${s.color}40`
    }}>
      <Clock size={14} /> {s.label}
    </div>
  );
}
const colors = {
  bg: "#e5e7eb", card: "#f3f4f6", border: "#d1d5db",
  text: "#111827", textLight: "#4b5563", primary: "#6366f1",
  success: "#10b981", cyan: "#06b6d4", warning: "#d97706",
};

const containerStyle = {
  padding: "24px", background: colors.bg, color: colors.text, minHeight: "100vh",
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
};

const topNav = {
  display: "flex", justifyContent: "space-between", alignItems: "center",
  background: colors.card, padding: "16px 20px", borderRadius: "12px",
  border: `1px solid ${colors.border}`, marginBottom: "32px"
};

const roleBadge = {
  fontSize: "12px", fontWeight: 700, color: colors.primary,
  background: `${colors.primary}15`, padding: "4px 12px", borderRadius: "6px"
};

const notifyBtn = {
  background: "#ffffff", border: `1px solid ${colors.border}`,
  color: colors.text, padding: "10px", borderRadius: "10px", cursor: "pointer",
  position: "relative", transition: "all 0.2s"
};

const redDot = {
  position: "absolute", top: "-4px", right: "-4px", width: "10px", height: "10px",
  background: "#ef4444", borderRadius: "50%", border: `2px solid ${colors.bg}`
};

const notifyDrawer = {
  position: "absolute", top: "48px", right: "0", width: "260px",
  background: colors.card, border: `1px solid ${colors.border}`, borderRadius: "10px",
  padding: "16px", zIndex: 100, boxShadow: "0 10px 25px rgba(0,0,0,0.15)"
};

const notifyItem = { padding: "8px 0", borderBottom: `1px solid ${colors.border}`, fontSize: "13px" };

const formCard = {
  background: colors.card, padding: "28px", borderRadius: "16px",
  border: `1px solid ${colors.border}`, marginBottom: "32px"
};

const headerFlex = { display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" };

const iconBox = { background: `${colors.primary}15`, padding: "10px", borderRadius: "10px", lineHeight: 0 };

const formGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px 24px" };

const inputStyle = {
  background: "#ffffff", border: `1px solid ${colors.border}`, borderRadius: "10px",
  padding: "14px 16px", color: colors.text, fontSize: "15px", transition: "all 0.2s", outline: "none",
  "::placeholder": { color: colors.textLight },
  ":focus": { borderColor: colors.primary, boxShadow: `0 0 0 3px ${colors.primary}30` }
};

const btnSubmit = {
  background: `linear-gradient(135deg, ${colors.primary} 0%, #4f46e5 100%)`,
  color: "white", border: "none", padding: "14px 24px", borderRadius: "10px", fontSize: "15px",
  fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "8px",
  transition: "all 0.2s", ":hover": { transform: "translateY(-1px)", boxShadow: `0 6px 16px ${colors.primary}50` }
};

const tableCard = { background: colors.card, borderRadius: "16px", border: `1px solid ${colors.border}`, overflow: "hidden" };

const tableHeader = { padding: "20px 24px", background: "#ffffff", borderBottom: `1px solid ${colors.border}` };

const tableStyle = { width: "100%", borderCollapse: "separate", borderSpacing: "0 8px", padding: "0 8px" };

const thStyle = { textAlign: "left", padding: "14px 20px", fontSize: "13px", fontWeight: 500, color: colors.textLight, background: "#ffffff" };

const trStyle = { background: "#f9fafb", borderRadius: "10px", transition: "background 0.15s", ":hover": { background: "#f3f4f6" } };

const tdStyle = { padding: "16px 20px", fontSize: "14px", border: "none", verticalAlign: "middle" };

const actionTd = { ...tdStyle, textAlign: "right" };

const actionGroup = { display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "flex-end" };

const btnBase = { padding: "8px 16px", fontSize: "13px", fontWeight: 600, borderRadius: "8px", cursor: "pointer", transition: "all 0.18s", border: "none" };

const btnVerify = { ...btnBase, background: "#064e3b", color: "white" };
const btnApprove = { ...btnBase, background: colors.primary, color: "white" };
const btnIssue = { ...btnBase, background: colors.cyan, color: "white" };
const btnPrintSlip = { ...btnBase, background: "#ffffff", color: colors.primary, border: `1px solid ${colors.border}`, display: "flex", alignItems: "center", gap: "6px" };

const modalOverlay = {
  position: "fixed", inset: 0, background: "rgba(0,0,0,0.50)",
  display: "flex", justifyContent: "center", alignItems: "flex-start",
  zIndex: 2000, padding: "20px 0", overflowY: "auto"
};

const modalContent = { width: "100%", maxWidth: "720px" };

const slipPaper = {
  background: "#ffffff", color: "#111827",
  padding: "40px 50px", borderRadius: "12px",
  boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
  fontFamily: '"Helvetica Neue", Arial, sans-serif',
  lineHeight: 1.5,
  maxWidth: "210mm", margin: "0 auto",
  boxSizing: "border-box"
};

const slipHeader = { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "32px" };
const slipLogo = { margin: 0, fontSize: "42px", fontWeight: 900, color: "#1e293b", letterSpacing: "-1px" };
const slipSubtitle = { margin: "4px 0 0", fontSize: "13px", color: "#4b5563", fontWeight: 500 };
const slipOrgInfo = { margin: "2px 0 0", fontSize: "11px", color: "#6b7280" };
const slipTypeBadge = { background: colors.primary, color: "#ffffff", padding: "6px 14px", fontSize: "13px", fontWeight: 700, borderRadius: "6px", marginBottom: "8px" };
const slipNo = { fontSize: "15px", fontWeight: 600, margin: "8px 0 4px" };
const slipDate = { fontSize: "13px", color: "#4b5563" };
const slipDivider = { border: "none", borderTop: "2px solid #d1d5db", margin: "32px 0" };
const slipInfoGrid = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px", marginBottom: "40px" };
const slipLabelSmall = { fontSize: "11px", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 500, marginBottom: "4px" };
const slipValueBold = { fontSize: "17px", fontWeight: 700 };
const slipValueNormal = { fontSize: "15px", fontWeight: 500 };
const slipItemTable = { border: "1px solid #d1d5db", borderRadius: "8px", overflow: "hidden", margin: "32px 0 48px" };
const slipItemHeaderRow = { background: "#f3f4f6", padding: "14px 20px", display: "flex", fontSize: "13px", fontWeight: 600, borderBottom: "1px solid #d1d5db" };
const slipItemDataRow = { padding: "18px 20px", display: "flex", fontSize: "15px" };
const slipSignaturesArea = { display: "flex", justifyContent: "space-between", gap: "24px", marginTop: "60px", paddingTop: "40px" };
const sigContainer = { flex: 1, textAlign: "center" };
const sigLine = { borderTop: "1.5px solid #374151", height: "50px", marginBottom: "12px" };
const sigTitle = { fontSize: "13px", fontWeight: 600, color: "#374151" };
const sigName = { fontSize: "12px", color: "#6b7280", marginTop: "8px" };
const slipFooter = { marginTop: "64px", textAlign: "center", fontSize: "11px", color: "#6b7280", borderTop: "1px dashed #9ca3af", paddingTop: "16px" };
const slipFooterText = { marginBottom: "8px" };
const slipFooterStamp = { fontStyle: "italic", opacity: 0.7 };
const modalActions = { display: "flex", gap: "16px", marginTop: "24px", justifyContent: "center" };
const btnSecondary = { padding: "12px 28px", background: "#9ca3af", color: "white", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: 600 };
const btnPrint = { padding: "12px 28px", background: colors.success, color: "white", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", gap: "8px" };

const modalStyles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(2, 6, 23, 0.85)", // Deeper dark overlay
    backdropFilter: "blur(8px)", // Modern blur effect
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2000,
    padding: "20px"
  },
  card: {
    width: "100%",
    maxWidth: "500px",
    background: "#1e293b", // Slate-800 modern dark
    borderRadius: "24px",
    padding: "32px",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    display: "flex",
    flexDirection: "column",
  },
  header: { marginBottom: "24px" },
  title: { margin: 0, fontSize: "22px", fontWeight: 800, color: "#f8fafc", letterSpacing: "-0.5px" },
  subtitle: { margin: "4px 0 0", fontSize: "14px", color: "#94a3b8" },
  formBody: { display: "flex", flexDirection: "column", gap: "20px" },
  inputGroup: { display: "flex", flexDirection: "column", gap: "8px" },
  label: { fontSize: "12px", fontWeight: "600", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" },
  input: {
    background: "#0f172a",
    border: "1px solid #334155",
    borderRadius: "12px",
    padding: "12px 16px",
    color: "white",
    fontSize: "15px",
    outline: "none",
    width: "100%",
    transition: "border-color 0.2s",
  },
  select: {
    background: "#0f172a",
    border: "1px solid #334155",
    borderRadius: "12px",
    padding: "12px 16px",
    color: "white",
    fontSize: "15px",
    outline: "none",
    width: "100%",
    appearance: "none", // Removes default arrow for custom feel
    cursor: "pointer"
  },
  currencyPrefix: {
    position: "absolute",
    left: "16px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#64748b",
    fontSize: "14px",
    fontWeight: "600"
  },
  footer: { 
    display: "flex", 
    justifyContent: "flex-end", 
    gap: "12px", 
    marginTop: "32px",
    borderTop: "1px solid #334155",
    paddingTop: "20px"
  },
  cancelBtn: {
    padding: "12px 24px",
    borderRadius: "12px",
    fontWeight: 600,
    border: "none",
    cursor: "pointer",
    background: "transparent",
    color: "#94a3b8",
    transition: "color 0.2s",
  },
  saveBtn: {
    padding: "12px 30px",
    borderRadius: "12px",
    fontWeight: 700,
    border: "none",
    cursor: "pointer",
    background: "#2563eb", // Vibrant Blue
    color: "white",
    boxShadow: "0 10px 15px -3px rgba(37, 99, 235, 0.3)",
    transition: "transform 0.2s",
  }
};