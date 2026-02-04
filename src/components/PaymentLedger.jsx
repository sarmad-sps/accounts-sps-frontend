import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import axios from "axios";
import {
  Plus,
  Search,
  Trash2,
  User,
  CreditCard,
  FileText,
  Download,
  Tag,
  ChevronDown,
  AlertCircle,
  Eye,
  X,
  Edit,
  CheckCircle,
  Clock,
  RotateCcw,
} from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

import logo from "../assets/sps-logo.png";

export default function PaymentLedger() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payee, setPayee] = useState("");
  const [category, setCategory] = useState("Inventory");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("Unpaid");
  const [paymentMode, setPaymentMode] = useState("Online");
  const [bank, setBank] = useState("HBL");
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPayment, setSelectedPayment] = useState(null);

  const voucherRef = useRef(null);

  const categories = [
    "Inventory",
    "Salary",
    "Utility Bill",
    "Rent",
    "Maintenance",
    "Marketing",
    "Tracker",
    "Other",
  ];

  const statusOptions = ["Paid", "Unpaid"];
  const paymentModes = ["Online", "Bank Transfer", "Check", "Cash"];
  const banks = ["HBL", "Islamic Bank", "Other"];

  const API_URL = "https://accounts-sps-backend-git-main-secure-path-solutions-projects.vercel.app/api/payments";

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_URL);
      const data = res.data.map((item) => ({
        id: item._id,
        date: new Date(item.paymentDate).toLocaleDateString("en-GB"),
        payee: item.payee,
        category: item.category,
        amount: item.amount,
        description: item.description || "—",
        status: item.status || "Unpaid",
        paymentMode: item.paymentMode || "Online",
        bank: item.bank || "HBL",
      }));
      setPayments(data);
    } catch (err) {
      console.error("Error fetching payments:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const cleaned = amount.replace(/[^0-9]/g, "");
    const numericAmount = Number(cleaned);

    if (!payee.trim() || !cleaned || numericAmount <= 0) {
      alert("Please enter a valid payee and amount greater than 0");
      return;
    }

    const payload = {
      payee: payee.trim(),
      category,
      amount: numericAmount,
      description: description.trim() || "—",
      status,
      paymentMode,
      bank,
    };

    try {
      if (editingId) {
        const res = await axios.put(`${API_URL}/${editingId}`, payload);
        setPayments((prev) =>
          prev.map((p) =>
            p.id === editingId
              ? {
                  ...p,
                  payee: res.data.payee,
                  category: res.data.category,
                  amount: res.data.amount,
                  description: res.data.description || "—",
                  status: res.data.status,
                  paymentMode: res.data.paymentMode || "Online",
                  bank: res.data.bank || "HBL",
                }
              : p
          )
        );
        setEditingId(null);
      } else {
        const res = await axios.post(API_URL, payload);
        setPayments((prev) => [
          {
            id: res.data._id,
            date: new Date(res.data.paymentDate).toLocaleDateString("en-GB"),
            payee: res.data.payee,
            category: res.data.category,
            amount: res.data.amount,
            description: res.data.description || "—",
            status: res.data.status,
            paymentMode: res.data.paymentMode || "Online",
            bank: res.data.bank || "HBL",
          },
          ...prev,
        ]);
      }
      resetForm();
      setSelectedPayment(null);
    } catch (err) {
      console.error("Error saving payment:", err);
      alert("Failed to save payment. Check console for details.");
    }
  };

  const resetForm = () => {
    setPayee("");
    setAmount("");
    setDescription("");
    setCategory("Inventory");
    setStatus("Unpaid");
    setPaymentMode("Online");
    setBank("HBL");
    setEditingId(null);
  };

  const startEdit = (payment) => {
    setPayee(payment.payee);
    setCategory(payment.category);
    setAmount(payment.amount.toLocaleString("en-PK", { minimumFractionDigits: 0, maximumFractionDigits: 0 }));
    setDescription(payment.description === "—" ? "" : payment.description);
    setStatus(payment.status);
    setPaymentMode(payment.paymentMode || "Online");
    setBank(payment.bank || "HBL");
    setEditingId(payment.id);
    setSelectedPayment(null);
  };

  const removePayment = useCallback(
    async (id) => {
      if (!window.confirm("Delete this payment record permanently?")) return;
      try {
        await axios.delete(`${API_URL}/${id}`);
        setPayments((prev) => prev.filter((p) => p.id !== id));
        if (selectedPayment?.id === id) setSelectedPayment(null);
      } catch (err) {
        console.error("Error deleting:", err);
      }
    },
    [selectedPayment]
  );

  const handleView = (payment) => {
    setSelectedPayment(payment);
    setTimeout(() => {
      document.getElementById("voucher-preview")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 150);
  };

  const downloadAsPDF = async () => {
    if (!voucherRef.current || !selectedPayment) return;

    try {
      const element = voucherRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        allowTaint: true,
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
      const finalWidth = imgWidth * ratio;
      const finalHeight = imgHeight * ratio;

      const marginTop = (pdfHeight - finalHeight) / 2;

      pdf.addImage(imgData, "PNG", 0, marginTop || 0, finalWidth, finalHeight);

      const fileName = `Payment-Voucher-${selectedPayment.id.slice(-8)}.pdf`;
      pdf.save(fileName);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Failed to generate PDF. Please try again.");
    }
  };

  const filteredEntries = useMemo(() => {
    if (!searchTerm.trim()) return payments;
    const term = searchTerm.toLowerCase();
    return payments.filter(
      (p) =>
        p.payee.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term) ||
        p.status.toLowerCase().includes(term) ||
        p.paymentMode.toLowerCase().includes(term) ||
        p.bank.toLowerCase().includes(term)
    );
  }, [payments, searchTerm]);

  const stats = useMemo(() => {
    const unpaid = filteredEntries
      .filter((p) => p.status === "Unpaid")
      .reduce((sum, p) => sum + p.amount, 0);
    const paid = filteredEntries
      .filter((p) => p.status === "Paid")
      .reduce((sum, p) => sum + p.amount, 0);
    return { unpaid, paid, total: unpaid + paid };
  }, [filteredEntries]);

  const formatCurrency = (num) =>
    Number(num).toLocaleString("en-PK", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });

  const getCategoryColor = (cat) => {
    const map = {
      Salary: "#059669",
      "Utility Bill": "#dc2626",
      Rent: "#d97706",
      Maintenance: "#2563eb",
      Inventory: "#7c3aed",
      Marketing: "#db2777",
      Tracker: "#ea580c",
      Other: "#4b5563",
    };
    return map[cat] || "#4b5563";
  };

  const getStatusStyle = (stat) => {
    return stat === "Paid"
      ? { color: "#059669", bg: "#ecfdf5" }
      : { color: "#b45309", bg: "#fffbeb" };
  };

  const getPaymentModeColor = (mode) => {
    const map = {
      Online: "#2563eb",
      "Bank Transfer": "#1d4ed8",
      Check: "#d97706",
      Cash: "#ea580c",
    };
    return map[mode] || "#6b7280";
  };

  const getBankColor = (b) => {
    const map = {
      HBL: "#047857",
      "Islamic Bank": "#1e40af",
      Other: "#6b7280",
    };
    return map[b] || "#6b7280";
  };

  const exportToCSV = () => {
    if (!payments.length) return;
    const headers = ["Date", "Payee", "Category", "Status", "Payment Mode", "Bank", "Amount", "Description"];
    const rows = payments.map((p) => [
      p.date,
      `"${p.payee.replace(/"/g, '""')}"`,
      p.category,
      p.status,
      p.paymentMode,
      p.bank,
      p.amount,
      `"${p.description.replace(/"/g, '""')}"`,
    ]);
    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payment-ledger-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div
      style={{
        background: "#e5e7eb",
        color: "#111827",
        padding: "clamp(16px, 4vw, 32px)",
        fontFamily: "Inter, system-ui, sans-serif",
        minHeight: "100vh",
      }}
    >
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "clamp(20px, 5vw, 32px)",
          gap: "clamp(12px, 3vw, 20px)",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1 style={{ fontSize: "clamp(22px, 6vw, 36px)", fontWeight: 800, margin: 0, letterSpacing: "-0.02em", color: "#111827" }}>
            Payment Ledger
          </h1>
          <p style={{ color: "#4b5563", marginTop: "8px", fontSize: "clamp(13px, 3.5vw, 15px)" }}>
            Track outgoing payments • {payments.length} record{payments.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div style={{ display: "flex", gap: "clamp(10px, 2.5vw, 16px)", flexWrap: "wrap", width: "100%", justifyContent: "flex-start" }}>
          <div
            style={{
              background: "#ffffff",
              padding: "clamp(12px, 3vw, 16px) clamp(16px, 4vw, 28px)",
              borderRadius: "16px",
              border: "1px solid #d1d5db",
              minWidth: "clamp(120px, calc(50% - 5px), 200px)",
              textAlign: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              boxSizing: "border-box",
              flex: "1 1 auto",
            }}
          >
            <div style={{ color: "#4b5563", fontSize: "clamp(9px, 2vw, 11px)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Total Outstanding
            </div>
            <div style={{ fontSize: "clamp(14px, 4.5vw, 26px)", fontWeight: 800, marginTop: "clamp(6px, 1.5vw, 8px)", color: "#b45309", wordBreak: "break-word" }}>
              Rs. {formatCurrency(stats.unpaid)}
            </div>
          </div>
          <div
            style={{
              background: "#ffffff",
              padding: "clamp(12px, 3vw, 16px) clamp(16px, 4vw, 28px)",
              borderRadius: "16px",
              border: "1px solid #d1d5db",
              minWidth: "clamp(120px, calc(50% - 5px), 200px)",
              textAlign: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              boxSizing: "border-box",
              flex: "1 1 auto",
            }}
          >
            <div style={{ color: "#4b5563", fontSize: "clamp(9px, 2vw, 11px)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Total Paid
            </div>
            <div style={{ fontSize: "clamp(14px, 4.5vw, 26px)", fontWeight: 800, marginTop: "clamp(6px, 1.5vw, 8px)", color: "#059669", wordBreak: "break-word" }}>
              Rs. {formatCurrency(stats.paid)}
            </div>
          </div>
        </div>
      </header>

      <section
        style={{
          background: "#ffffff",
          borderRadius: "16px",
          border: "1px solid #d1d5db",
          padding: "clamp(16px, 4vw, 24px)",
          marginBottom: "clamp(20px, 5vw, 32px)",
          boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
          boxSizing: "border-box",
        }}
      >
        <form
          onSubmit={handleSubmit}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(clamp(160px, 100%, 220px), 1fr))",
            gap: "clamp(14px, 3.5vw, 24px)",
            alignItems: "end",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label style={{ fontSize: "clamp(10px, 2.5vw, 12px)", fontWeight: 700, color: "#4b5563", textTransform: "uppercase", marginLeft: "4px" }}>
              Payee
            </label>
            <div style={{ position: "relative" }}>
              <User size={18} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "#6b7280" }} />
              <input
                required
                value={payee}
                onChange={(e) => setPayee(e.target.value)}
                placeholder="Supplier / Person name"
                style={{
                  width: "100%",
                  padding: "clamp(10px, 2.5vw, 12px) clamp(12px, 3vw, 16px) clamp(10px, 2.5vw, 12px) clamp(40px, 8vw, 48px)",
                  background: "#f9fafb",
                  border: "1px solid #d1d5db",
                  borderRadius: "10px",
                  color: "#111827",
                  fontSize: "clamp(13px, 3.5vw, 16px)",
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label style={{ fontSize: "clamp(10px, 2.5vw, 12px)", fontWeight: 700, color: "#4b5563", textTransform: "uppercase", marginLeft: "4px" }}>
              Category
            </label>
            <div style={{ position: "relative" }}>
              <Tag size={18} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "#6b7280" }} />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{
                  width: "100%",
                  padding: "clamp(10px, 2.5vw, 12px) clamp(12px, 3vw, 16px) clamp(10px, 2.5vw, 12px) clamp(40px, 8vw, 48px)",
                  background: "#f9fafb",
                  border: "1px solid #d1d5db",
                  borderRadius: "10px",
                  color: "#111827",
                  appearance: "none",
                  cursor: "pointer",
                  fontSize: "clamp(13px, 3.5vw, 16px)",
                  boxSizing: "border-box",
                }}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <ChevronDown size={16} style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", color: "#6b7280", pointerEvents: "none" }} />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label style={{ fontSize: "clamp(10px, 2.5vw, 12px)", fontWeight: 700, color: "#4b5563", textTransform: "uppercase", marginLeft: "4px" }}>
              Amount (PKR)
            </label>
            <div style={{ position: "relative" }}>
              <CreditCard size={18} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "#6b7280" }} />
              <input
                type="text"
                required
                value={amount}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9,]/g, "");
                  setAmount(val);
                }}
                placeholder="0"
                style={{
                  width: "100%",
                  padding: "clamp(10px, 2.5vw, 12px) clamp(12px, 3vw, 16px) clamp(10px, 2.5vw, 12px) clamp(40px, 8vw, 48px)",
                  background: "#f9fafb",
                  border: "1px solid #d1d5db",
                  borderRadius: "10px",
                  color: "#111827",
                  fontSize: "clamp(13px, 3.5vw, 16px)",
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label style={{ fontSize: "clamp(10px, 2.5vw, 12px)", fontWeight: 700, color: "#4b5563", textTransform: "uppercase", marginLeft: "4px" }}>
              Status
            </label>
            <div style={{ position: "relative" }}>
              <Clock size={18} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "#6b7280" }} />
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                style={{
                  width: "100%",
                  padding: "clamp(10px, 2.5vw, 12px) clamp(12px, 3vw, 16px) clamp(10px, 2.5vw, 12px) clamp(40px, 8vw, 48px)",
                  background: "#f9fafb",
                  border: "1px solid #d1d5db",
                  borderRadius: "10px",
                  color: "#111827",
                  appearance: "none",
                  cursor: "pointer",
                  fontSize: "clamp(13px, 3.5vw, 16px)",
                  boxSizing: "border-box",
                }}
              >
                {statusOptions.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <ChevronDown size={16} style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", color: "#6b7280", pointerEvents: "none" }} />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label style={{ fontSize: "clamp(10px, 2.5vw, 12px)", fontWeight: 700, color: "#4b5563", textTransform: "uppercase", marginLeft: "4px" }}>
              Payment Mode
            </label>
            <div style={{ position: "relative" }}>
              <CreditCard size={18} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "#6b7280" }} />
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
                style={{
                  width: "100%",
                  padding: "clamp(10px, 2.5vw, 12px) clamp(12px, 3vw, 16px) clamp(10px, 2.5vw, 12px) clamp(40px, 8vw, 48px)",
                  background: "#f9fafb",
                  border: "1px solid #d1d5db",
                  borderRadius: "10px",
                  color: "#111827",
                  appearance: "none",
                  cursor: "pointer",
                  fontSize: "clamp(13px, 3.5vw, 16px)",
                  boxSizing: "border-box",
                }}
              >
                {paymentModes.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <ChevronDown size={16} style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", color: "#6b7280", pointerEvents: "none" }} />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label style={{ fontSize: "clamp(10px, 2.5vw, 12px)", fontWeight: 700, color: "#4b5563", textTransform: "uppercase", marginLeft: "4px" }}>
              Bank
            </label>
            <div style={{ position: "relative" }}>
              <CreditCard size={18} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "#6b7280" }} />
              <select
                value={bank}
                onChange={(e) => setBank(e.target.value)}
                style={{
                  width: "100%",
                  padding: "clamp(10px, 2.5vw, 12px) clamp(12px, 3vw, 16px) clamp(10px, 2.5vw, 12px) clamp(40px, 8vw, 48px)",
                  background: "#f9fafb",
                  border: "1px solid #d1d5db",
                  borderRadius: "10px",
                  color: "#111827",
                  appearance: "none",
                  cursor: "pointer",
                  fontSize: "clamp(13px, 3.5vw, 16px)",
                  boxSizing: "border-box",
                }}
              >
                {banks.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
              <ChevronDown size={16} style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", color: "#6b7280", pointerEvents: "none" }} />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label style={{ fontSize: "clamp(10px, 2.5vw, 12px)", fontWeight: 700, color: "#4b5563", textTransform: "uppercase", marginLeft: "4px" }}>
              Remarks
            </label>
            <div style={{ position: "relative" }}>
              <FileText size={18} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "#6b7280" }} />
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Invoice #, notes..."
                style={{
                  width: "100%",
                  padding: "clamp(10px, 2.5vw, 12px) clamp(12px, 3vw, 16px) clamp(10px, 2.5vw, 12px) clamp(40px, 8vw, 48px)",
                  background: "#f9fafb",
                  border: "1px solid #d1d5db",
                  borderRadius: "10px",
                  color: "#111827",
                  fontSize: "clamp(13px, 3.5vw, 16px)",
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: "clamp(8px, 2vw, 12px)", alignItems: "center", flexWrap: "wrap" }}>
            <button
              type="submit"
              style={{
                background: "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)",
                color: "white",
                border: "none",
                padding: "clamp(10px, 2.5vw, 14px) clamp(18px, 4vw, 28px)",
                borderRadius: "10px",
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "clamp(6px, 1.5vw, 8px)",
                minWidth: "clamp(140px, 100%, 160px)",
                justifyContent: "center",
                fontSize: "clamp(13px, 3.5vw, 15px)",
                minHeight: "clamp(36px, 8vw, 44px)",
              }}
            >
              {editingId ? <Edit size={20} /> : <Plus size={20} />}
              {editingId ? "Update" : "Add"} Entry
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                style={{
                  background: "#fef2f2",
                  color: "#b91c1c",
                  border: "1px solid #fecaca",
                  padding: "clamp(10px, 2.5vw, 14px) clamp(16px, 4vw, 24px)",
                  borderRadius: "10px",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "clamp(6px, 1.5vw, 8px)",
                  fontSize: "clamp(13px, 3.5vw, 15px)",
                  minHeight: "clamp(36px, 8vw, 44px)",
                }}
              >
                <RotateCcw size={18} /> Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      <section
        style={{
          background: "#ffffff",
          borderRadius: "16px",
          border: "1px solid #d1d5db",
          padding: "clamp(16px, 4vw, 24px)",
          boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
          boxSizing: "border-box",
          overflowX: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "clamp(16px, 4vw, 24px)",
            gap: "clamp(10px, 2.5vw, 16px)",
            flexWrap: "wrap",
          }}
        >
          <div style={{ position: "relative", flex: 1, minWidth: "clamp(200px, 100%, 280px)" }}>
            <Search
              size={18}
              style={{
                position: "absolute",
                left: 14,
                top: "50%",
                transform: "translateY(-50%)",
                color: "#6b7280",
              }}
            />
            <input
              placeholder="Search payee, category, mode, bank, remarks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%",
                padding: "clamp(8px, 2vw, 10px) clamp(12px, 3vw, 16px) clamp(8px, 2vw, 10px) clamp(38px, 8vw, 44px)",
                background: "#f9fafb",
                border: "1px solid #d1d5db",
                borderRadius: "10px",
                color: "#111827",
                fontSize: "clamp(13px, 3.5vw, 16px)",
                boxSizing: "border-box",
              }}
            />
          </div>
          <button
            onClick={exportToCSV}
            disabled={!payments.length}
            style={{
              background: "#f3f4f6",
              border: "1px solid #d1d5db",
              color: "#374151",
              padding: "clamp(8px, 2vw, 10px) clamp(14px, 3.5vw, 20px)",
              borderRadius: "10px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "clamp(6px, 1.5vw, 8px)",
              fontWeight: 500,
              fontSize: "clamp(12px, 3.2vw, 14px)",
            }}
          >
            <Download size={16} /> Export CSV
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "clamp(40px, 10vw, 80px) clamp(12px, 3vw, 20px)", color: "#6b7280" }}>
            <div style={{ fontSize: "clamp(24px, 6vw, 40px)", opacity: 0.4 }}>⌛</div>
            <h3 style={{ fontSize: "clamp(14px, 4vw, 18px)" }}>Loading records...</h3>
          </div>
        ) : filteredEntries.length === 0 ? (
          <div style={{ textAlign: "center", padding: "clamp(40px, 10vw, 80px) clamp(12px, 3vw, 20px)", color: "#6b7280" }}>
            <AlertCircle size={48} style={{ opacity: 0.4, marginBottom: 16 }} />
            <h3 style={{ fontSize: "clamp(14px, 4vw, 18px)" }}>No transactions found</h3>
            <p style={{ marginTop: 8, fontSize: "clamp(12px, 3.5vw, 14px)" }}>
              {searchTerm ? "Try different search terms" : "Add your first payment above"}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                tableLayout: "auto",
                minWidth: "clamp(300px, 100%, 1100px)",
              }}
            >
              <thead>
                <tr style={{ background: "#f9fafb" }}>
                  <th style={{ padding: "clamp(10px, 2.5vw, 16px)", color: "#4b5563", fontSize: "clamp(10px, 2.5vw, 12px)", textTransform: "uppercase", textAlign: "left", borderBottom: "1px solid #e5e7eb" }}>Date</th>
                  <th style={{ padding: "clamp(10px, 2.5vw, 16px)", color: "#4b5563", fontSize: "clamp(10px, 2.5vw, 12px)", textTransform: "uppercase", textAlign: "left", borderBottom: "1px solid #e5e7eb" }}>Payee</th>
                  <th style={{ padding: "clamp(10px, 2.5vw, 16px)", color: "#4b5563", fontSize: "clamp(10px, 2.5vw, 12px)", textTransform: "uppercase", textAlign: "left", borderBottom: "1px solid #e5e7eb" }}>Category</th>
                  <th style={{ padding: "clamp(10px, 2.5vw, 16px)", color: "#4b5563", fontSize: "clamp(10px, 2.5vw, 12px)", textTransform: "uppercase", textAlign: "left", borderBottom: "1px solid #e5e7eb" }}>Status</th>
                  <th style={{ padding: "clamp(10px, 2.5vw, 16px)", color: "#4b5563", fontSize: "clamp(10px, 2.5vw, 12px)", textTransform: "uppercase", textAlign: "left", borderBottom: "1px solid #e5e7eb" }}>Mode</th>
                  <th
                    style={{
                      padding: "clamp(10px, 2.5vw, 16px)",
                      color: "#4b5563",
                      fontSize: "clamp(10px, 2.5vw, 12px)",
                      textTransform: "uppercase",
                      textAlign: "left",
                      borderBottom: "1px solid #e5e7eb",
                      whiteSpace: "nowrap",
                      minWidth: "clamp(100px, 15vw, 140px)",
                    }}
                  >
                    Bank
                  </th>
                  <th style={{ padding: "clamp(10px, 2.5vw, 16px)", color: "#4b5563", fontSize: "clamp(10px, 2.5vw, 12px)", textTransform: "uppercase", textAlign: "right", borderBottom: "1px solid #e5e7eb" }}>Amount</th>
                  <th style={{ padding: "clamp(10px, 2.5vw, 16px)", color: "#4b5563", fontSize: "clamp(10px, 2.5vw, 12px)", textTransform: "uppercase", textAlign: "center", borderBottom: "1px solid #e5e7eb" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEntries.map((item) => (
                  <tr
                    key={item.id}
                    style={{
                      background: item.status === "Paid" ? "#ecfdf5" : "#ffffff",
                      transition: "background 0.15s",
                    }}
                  >
                    <td style={{ padding: "clamp(10px, 2.5vw, 16px)", borderBottom: "1px solid #e5e7eb", fontSize: "clamp(12px, 3.2vw, 14px)" }}>{item.date}</td>
                    <td style={{ padding: "clamp(10px, 2.5vw, 16px)", borderBottom: "1px solid #e5e7eb", fontWeight: 600, fontSize: "clamp(12px, 3.2vw, 14px)" }}>{item.payee}</td>
                    <td style={{ padding: "clamp(10px, 2.5vw, 16px)", borderBottom: "1px solid #e5e7eb" }}>
                      <span
                        style={{
                          padding: "clamp(3px, 1vw, 4px) clamp(8px, 2vw, 12px)",
                          borderRadius: "20px",
                          fontSize: "clamp(10px, 2.5vw, 12px)",
                          fontWeight: 600,
                          color: "white",
                          backgroundColor: getCategoryColor(item.category),
                        }}
                      >
                        {item.category}
                      </span>
                    </td>
                    <td style={{ padding: "clamp(10px, 2.5vw, 16px)", borderBottom: "1px solid #e5e7eb" }}>
                      <span
                        style={{
                          padding: "clamp(3px, 1vw, 4px) clamp(8px, 2vw, 12px)",
                          borderRadius: "20px",
                          fontSize: "clamp(10px, 2.5vw, 12px)",
                          fontWeight: 600,
                          backgroundColor: getStatusStyle(item.status).bg,
                          color: getStatusStyle(item.status).color,
                        }}
                      >
                        {item.status}
                        {item.status === "Paid" && <CheckCircle size={14} style={{ marginLeft: 6 }} />}
                      </span>
                    </td>
                    <td style={{ padding: "clamp(10px, 2.5vw, 16px)", borderBottom: "1px solid #e5e7eb" }}>
                      <span
                        style={{
                          padding: "clamp(3px, 1vw, 4px) clamp(8px, 2vw, 12px)",
                          borderRadius: "20px",
                          fontSize: "clamp(10px, 2.5vw, 12px)",
                          fontWeight: 600,
                          color: "white",
                          backgroundColor: getPaymentModeColor(item.paymentMode),
                        }}
                      >
                        {item.paymentMode}
                      </span>
                    </td>
                    <td style={{ padding: "clamp(10px, 2.5vw, 16px)", borderBottom: "1px solid #e5e7eb", whiteSpace: "nowrap" }}>
                      <span
                        style={{
                          padding: "clamp(3px, 1vw, 4px) clamp(8px, 2vw, 12px)",
                          borderRadius: "20px",
                          fontSize: "clamp(10px, 2.5vw, 12px)",
                          fontWeight: 600,
                          color: "white",
                          backgroundColor: getBankColor(item.bank),
                          whiteSpace: "nowrap",
                          display: "inline-block",
                        }}
                      >
                        {item.bank}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "clamp(10px, 2.5vw, 16px)",
                        borderBottom: "1px solid #e5e7eb",
                        textAlign: "right",
                        fontWeight: 700,
                        color: item.status === "Unpaid" ? "#7c3aed" : "#374151",
                        textDecoration: item.status === "Paid" ? "line-through" : "none",
                        fontSize: "clamp(12px, 3.2vw, 14px)",
                      }}
                    >
                      Rs. {formatCurrency(item.amount)}
                    </td>
                    <td
                      style={{
                        padding: "clamp(10px, 2.5vw, 16px)",
                        borderBottom: "1px solid #e5e7eb",
                        display: "flex",
                        gap: "clamp(6px, 1.5vw, 8px)",
                        justifyContent: "center",
                        flexWrap: "wrap",
                      }}
                    >
                      <button
                        onClick={() => handleView(item)}
                        style={{ background: "rgba(37,99,235,0.1)", color: "#2563eb", border: "none", padding: "clamp(6px, 1.5vw, 8px)", borderRadius: "8px", cursor: "pointer", minHeight: "clamp(32px, 7vw, 36px)", minWidth: "clamp(32px, 7vw, 36px)", display: "flex", alignItems: "center", justifyContent: "center" }}
                        title="View Voucher"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => startEdit(item)}
                        style={{ background: "rgba(180,83,9,0.1)", color: "#b45309", border: "none", padding: "clamp(6px, 1.5vw, 8px)", borderRadius: "8px", cursor: "pointer", minHeight: "clamp(32px, 7vw, 36px)", minWidth: "clamp(32px, 7vw, 36px)", display: "flex", alignItems: "center", justifyContent: "center" }}
                        title="Edit"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => removePayment(item.id)}
                        style={{ background: "rgba(220,38,38,0.1)", color: "#dc2626", border: "none", padding: "clamp(6px, 1.5vw, 8px)", borderRadius: "8px", cursor: "pointer", minHeight: "clamp(32px, 7vw, 36px)", minWidth: "clamp(32px, 7vw, 36px)", display: "flex", alignItems: "center", justifyContent: "center" }}
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

     {selectedPayment && (
  <div id="voucher-preview" style={{ marginTop: "clamp(20px, 5vw, 40px)", display: "flex", flexDirection: "column", alignItems: "center", padding: "clamp(12px, 3vw, 20px)" }}>
    {/* Main Voucher Container */}
    <div
      ref={voucherRef}
      style={{
        width: "100%",
        maxWidth: "210mm",
        minHeight: "297mm",
        background: "#ffffff",
        padding: "clamp(20px, 5vw, 40px) clamp(24px, 5vw, 50px)",
        boxShadow: "0 0 10px rgba(0,0,0,0.1)",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        fontFamily: "'Helvetica', 'Arial', sans-serif",
        color: "#1a1a1a",
        boxSizing: "border-box"
      }}
    >
      {/* Header Section */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "clamp(24px, 5vw, 40px)", gap: "clamp(12px, 3vw, 20px)", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "clamp(10px, 2.5vw, 15px)" }}>
          <img src={logo} alt="Logo" style={{ height: "clamp(44px, 10vw, 60px)" }} />
          <div>
            <h2 style={{ margin: 0, fontSize: "clamp(16px, 4.5vw, 22px)", fontWeight: "bold", color: "#000" }}>Secure Path Solutions</h2>
            <p style={{ margin: 0, fontSize: "clamp(10px, 2.5vw, 12px)", color: "#666" }}>Premium Vehicle Tracking & Security</p>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ 
            background: "#eef2ff", 
            color: "#3b82f6", 
            padding: "clamp(4px, 1vw, 6px) clamp(14px, 3vw, 20px)", 
            borderRadius: "5px", 
            fontSize: "clamp(12px, 3.2vw, 14px)", 
            fontWeight: "bold",
            display: "inline-block",
            marginBottom: "10px",
            border: "1px solid #dbeafe"
          }}>
            OFFICIAL RECEIPT
          </div>
          <p style={{ margin: 0, fontSize: "clamp(11px, 3vw, 13px)", fontWeight: "bold" }}>No: <span style={{ fontWeight: "normal" }}>REC-{selectedPayment.id.slice(-8).toUpperCase()}</span></p>
          <p style={{ margin: "2px 0 0 0", fontSize: "clamp(11px, 3vw, 13px)", fontWeight: "bold" }}>Date: <span style={{ fontWeight: "normal" }}>{selectedPayment.date}</span></p>
        </div>
      </div>

      {/* Address Boxes Section */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(16px, 4vw, 25px)", marginBottom: "clamp(20px, 5vw, 30px)" }}>
        <div style={{ border: "1px solid #e5e7eb", borderRadius: "8px", padding: "clamp(10px, 2.5vw, 15px)" }}>
          <h4 style={{ margin: "0 0 8px 0", fontSize: "clamp(10px, 2.5vw, 12px)", color: "#3b82f6", fontWeight: "bold", textTransform: "uppercase" }}>Issued By</h4>
          <p style={{ margin: 0, fontSize: "clamp(11px, 3vw, 13px)", fontWeight: "bold" }}>Secure Path Solutions Pvt Ltd.</p>
          <p style={{ margin: "4px 0 0 0", fontSize: "clamp(10px, 2.5vw, 12px)", color: "#4b5563", lineHeight: "1.4" }}>
            House 1-A, Upper Mall, Lahore<br />
            Tel: 042-111-000-320
          </p>
        </div>
        <div style={{ border: "1px solid #e5e7eb", borderRadius: "8px", padding: "clamp(10px, 2.5vw, 15px)" }}>
          <h4 style={{ margin: "0 0 8px 0", fontSize: "clamp(10px, 2.5vw, 12px)", color: "#3b82f6", fontWeight: "bold", textTransform: "uppercase" }}>Received From / Client</h4>
          <p style={{ margin: 0, fontSize: "clamp(11px, 3vw, 13px)", fontWeight: "bold" }}>{selectedPayment.payee}</p>
          <p style={{ margin: "4px 0 0 0", fontSize: "clamp(10px, 2.5vw, 12px)", color: "#4b5563" }}>
            Category: {selectedPayment.category}<br />
            Payment Mode: {selectedPayment.paymentMode} ({selectedPayment.bank})
          </p>
        </div>
      </div>

      {/* Amount Highlight Box */}
      <div style={{ 
        background: "#f9fafb", 
        borderLeft: "6px solid #2563eb", 
        padding: "clamp(14px, 3.5vw, 20px) clamp(16px, 4vw, 25px)", 
        borderRadius: "4px",
        marginBottom: "clamp(24px, 5vw, 40px)"
      }}>
        <p style={{ margin: "0 0 5px 0", fontSize: "clamp(11px, 3vw, 13px)", fontWeight: "bold", color: "#4b5563" }}>Total Amount</p>
        <h2 style={{ margin: 0, fontSize: "clamp(20px, 6vw, 28px)", fontWeight: "800", color: "#111827" }}>PKR Rs. {formatCurrency(selectedPayment.amount)}.00</h2>
      </div>

      {/* Remarks Section */}
      <div style={{ flexGrow: 1 }}>
        <h4 style={{ fontSize: "clamp(11px, 3vw, 13px)", color: "#111827", borderBottom: "1px solid #e5e7eb", paddingBottom: "8px", marginBottom: "10px" }}>Description / Remarks</h4>
        <p style={{ fontSize: "clamp(12px, 3.2vw, 14px)", color: "#4b5563", lineHeight: "1.6" }}>{selectedPayment.description}</p>
      </div>

      {/* Footer (Sticks to bottom) */}
      <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: "clamp(12px, 3vw, 20px)", textAlign: "center" }}>
        <p style={{ margin: 0, fontSize: "clamp(9px, 2.2vw, 11px)", color: "#4b5563", fontWeight: "bold" }}>
          Phone: <span style={{ fontWeight: "normal" }}>03006492075</span> | Email: <span style={{ fontWeight: "normal" }}>contact@securepathsolution.com</span>
        </p>
        <p style={{ margin: "4px 0 0 0", fontSize: "clamp(8px, 2vw, 10px)", color: "#9ca3af" }}>This is a computer-generated document.</p>
      </div>
    </div>

    {/* Buttons Container */}
    <div style={{ margin: "clamp(20px, 5vw, 30px) 0", display: "flex", gap: "clamp(10px, 2.5vw, 15px)", flexWrap: "wrap", justifyContent: "center" }}>
      <button onClick={downloadAsPDF} style={{ background: "#2563eb", color: "white", padding: "clamp(10px, 2.5vw, 12px) clamp(18px, 4vw, 25px)", borderRadius: "6px", fontWeight: "bold", border: "none", cursor: "pointer", fontSize: "clamp(12px, 3.2vw, 14px)", minHeight: "clamp(36px, 8vw, 44px)" }}>
        Download PDF
      </button>
      <button onClick={() => setSelectedPayment(null)} style={{ background: "#f3f4f6", color: "#4b5563", padding: "clamp(10px, 2.5vw, 12px) clamp(18px, 4vw, 25px)", borderRadius: "6px", fontWeight: "bold", border: "1px solid #d1d5db", cursor: "pointer", fontSize: "clamp(12px, 3.2vw, 14px)", minHeight: "clamp(36px, 8vw, 44px)" }}>
        Close
      </button>
    </div>
  </div>
)}
    </div>
  );
}