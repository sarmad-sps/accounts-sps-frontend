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

  const API_URL = "http://localhost:3000/api/payments";

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
        padding: "32px",
        fontFamily: "Inter, system-ui, sans-serif",
        minHeight: "100vh",
      }}
    >
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "32px",
          gap: "20px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1 style={{ fontSize: "2.25rem", fontWeight: 800, margin: 0, letterSpacing: "-0.02em", color: "#111827" }}>
            Payment Ledger
          </h1>
          <p style={{ color: "#4b5563", marginTop: "8px" }}>
            Track outgoing payments • {payments.length} record{payments.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
          <div
            style={{
              background: "#ffffff",
              padding: "16px 28px",
              borderRadius: "16px",
              border: "1px solid #d1d5db",
              minWidth: "160px",
              textAlign: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            }}
          >
            <div style={{ color: "#4b5563", fontSize: "0.8rem", fontWeight: 600, textTransform: "uppercase" }}>
              Total Outstanding
            </div>
            <div style={{ fontSize: "1.8rem", fontWeight: 800, marginTop: "4px", color: "#b45309" }}>
              Rs. {formatCurrency(stats.unpaid)}
            </div>
          </div>
          <div
            style={{
              background: "#ffffff",
              padding: "16px 28px",
              borderRadius: "16px",
              border: "1px solid #d1d5db",
              minWidth: "160px",
              textAlign: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            }}
          >
            <div style={{ color: "#4b5563", fontSize: "0.8rem", fontWeight: 600, textTransform: "uppercase" }}>
              Total Paid
            </div>
            <div style={{ fontSize: "1.8rem", fontWeight: 800, marginTop: "4px", color: "#059669" }}>
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
          padding: "24px",
          marginBottom: "32px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
        }}
      >
        <form
          onSubmit={handleSubmit}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "24px",
            alignItems: "end",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#4b5563", textTransform: "uppercase", marginLeft: "4px" }}>
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
                  padding: "12px 16px 12px 48px",
                  background: "#f9fafb",
                  border: "1px solid #d1d5db",
                  borderRadius: "10px",
                  color: "#111827",
                  fontSize: "1rem",
                }}
              />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#4b5563", textTransform: "uppercase", marginLeft: "4px" }}>
              Category
            </label>
            <div style={{ position: "relative" }}>
              <Tag size={18} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "#6b7280" }} />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 16px 12px 48px",
                  background: "#f9fafb",
                  border: "1px solid #d1d5db",
                  borderRadius: "10px",
                  color: "#111827",
                  appearance: "none",
                  cursor: "pointer",
                  fontSize: "1rem",
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
            <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#4b5563", textTransform: "uppercase", marginLeft: "4px" }}>
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
                  padding: "12px 16px 12px 48px",
                  background: "#f9fafb",
                  border: "1px solid #d1d5db",
                  borderRadius: "10px",
                  color: "#111827",
                  fontSize: "1rem",
                }}
              />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#4b5563", textTransform: "uppercase", marginLeft: "4px" }}>
              Status
            </label>
            <div style={{ position: "relative" }}>
              <Clock size={18} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "#6b7280" }} />
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 16px 12px 48px",
                  background: "#f9fafb",
                  border: "1px solid #d1d5db",
                  borderRadius: "10px",
                  color: "#111827",
                  appearance: "none",
                  cursor: "pointer",
                  fontSize: "1rem",
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
            <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#4b5563", textTransform: "uppercase", marginLeft: "4px" }}>
              Payment Mode
            </label>
            <div style={{ position: "relative" }}>
              <CreditCard size={18} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "#6b7280" }} />
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 16px 12px 48px",
                  background: "#f9fafb",
                  border: "1px solid #d1d5db",
                  borderRadius: "10px",
                  color: "#111827",
                  appearance: "none",
                  cursor: "pointer",
                  fontSize: "1rem",
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
            <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#4b5563", textTransform: "uppercase", marginLeft: "4px" }}>
              Bank
            </label>
            <div style={{ position: "relative" }}>
              <CreditCard size={18} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "#6b7280" }} />
              <select
                value={bank}
                onChange={(e) => setBank(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 16px 12px 48px",
                  background: "#f9fafb",
                  border: "1px solid #d1d5db",
                  borderRadius: "10px",
                  color: "#111827",
                  appearance: "none",
                  cursor: "pointer",
                  fontSize: "1rem",
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
            <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#4b5563", textTransform: "uppercase", marginLeft: "4px" }}>
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
                  padding: "12px 16px 12px 48px",
                  background: "#f9fafb",
                  border: "1px solid #d1d5db",
                  borderRadius: "10px",
                  color: "#111827",
                  fontSize: "1rem",
                }}
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <button
              type="submit"
              style={{
                background: "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)",
                color: "white",
                border: "none",
                padding: "14px 28px",
                borderRadius: "10px",
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                minWidth: "160px",
                justifyContent: "center",
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
                  padding: "14px 24px",
                  borderRadius: "10px",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
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
          padding: "24px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "24px",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          <div style={{ position: "relative", flex: 1, minWidth: "280px" }}>
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
                padding: "10px 16px 10px 44px",
                background: "#f9fafb",
                border: "1px solid #d1d5db",
                borderRadius: "10px",
                color: "#111827",
                fontSize: "1rem",
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
              padding: "10px 20px",
              borderRadius: "10px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontWeight: 500,
            }}
          >
            <Download size={16} /> Export CSV
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "80px 20px", color: "#6b7280" }}>
            <div style={{ fontSize: "2.5rem", opacity: 0.4 }}>⌛</div>
            <h3>Loading records...</h3>
          </div>
        ) : filteredEntries.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 20px", color: "#6b7280" }}>
            <AlertCircle size={48} style={{ opacity: 0.4, marginBottom: 16 }} />
            <h3>No transactions found</h3>
            <p style={{ marginTop: 8 }}>
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
                minWidth: "1100px",
              }}
            >
              <thead>
                <tr style={{ background: "#f9fafb" }}>
                  <th style={{ padding: "16px", color: "#4b5563", fontSize: "0.75rem", textTransform: "uppercase", textAlign: "left", borderBottom: "1px solid #e5e7eb" }}>Date</th>
                  <th style={{ padding: "16px", color: "#4b5563", fontSize: "0.75rem", textTransform: "uppercase", textAlign: "left", borderBottom: "1px solid #e5e7eb" }}>Payee</th>
                  <th style={{ padding: "16px", color: "#4b5563", fontSize: "0.75rem", textTransform: "uppercase", textAlign: "left", borderBottom: "1px solid #e5e7eb" }}>Category</th>
                  <th style={{ padding: "16px", color: "#4b5563", fontSize: "0.75rem", textTransform: "uppercase", textAlign: "left", borderBottom: "1px solid #e5e7eb" }}>Status</th>
                  <th style={{ padding: "16px", color: "#4b5563", fontSize: "0.75rem", textTransform: "uppercase", textAlign: "left", borderBottom: "1px solid #e5e7eb" }}>Mode</th>
                  <th
                    style={{
                      padding: "16px",
                      color: "#4b5563",
                      fontSize: "0.75rem",
                      textTransform: "uppercase",
                      textAlign: "left",
                      borderBottom: "1px solid #e5e7eb",
                      whiteSpace: "nowrap",
                      minWidth: "140px",
                    }}
                  >
                    Bank
                  </th>
                  <th style={{ padding: "16px", color: "#4b5563", fontSize: "0.75rem", textTransform: "uppercase", textAlign: "right", borderBottom: "1px solid #e5e7eb" }}>Amount</th>
                  <th style={{ padding: "16px", color: "#4b5563", fontSize: "0.75rem", textTransform: "uppercase", textAlign: "center", borderBottom: "1px solid #e5e7eb" }}>Actions</th>
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
                    <td style={{ padding: "16px 12px", borderBottom: "1px solid #e5e7eb" }}>{item.date}</td>
                    <td style={{ padding: "16px 12px", borderBottom: "1px solid #e5e7eb", fontWeight: 600 }}>{item.payee}</td>
                    <td style={{ padding: "16px 12px", borderBottom: "1px solid #e5e7eb" }}>
                      <span
                        style={{
                          padding: "4px 12px",
                          borderRadius: "20px",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          color: "white",
                          backgroundColor: getCategoryColor(item.category),
                        }}
                      >
                        {item.category}
                      </span>
                    </td>
                    <td style={{ padding: "16px 12px", borderBottom: "1px solid #e5e7eb" }}>
                      <span
                        style={{
                          padding: "4px 12px",
                          borderRadius: "20px",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          backgroundColor: getStatusStyle(item.status).bg,
                          color: getStatusStyle(item.status).color,
                        }}
                      >
                        {item.status}
                        {item.status === "Paid" && <CheckCircle size={14} style={{ marginLeft: 6 }} />}
                      </span>
                    </td>
                    <td style={{ padding: "16px 12px", borderBottom: "1px solid #e5e7eb" }}>
                      <span
                        style={{
                          padding: "4px 12px",
                          borderRadius: "20px",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          color: "white",
                          backgroundColor: getPaymentModeColor(item.paymentMode),
                        }}
                      >
                        {item.paymentMode}
                      </span>
                    </td>
                    <td style={{ padding: "16px 12px", borderBottom: "1px solid #e5e7eb", whiteSpace: "nowrap" }}>
                      <span
                        style={{
                          padding: "4px 12px",
                          borderRadius: "20px",
                          fontSize: "0.75rem",
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
                        padding: "16px 12px",
                        borderBottom: "1px solid #e5e7eb",
                        textAlign: "right",
                        fontWeight: 700,
                        color: item.status === "Unpaid" ? "#7c3aed" : "#374151",
                        textDecoration: item.status === "Paid" ? "line-through" : "none",
                      }}
                    >
                      Rs. {formatCurrency(item.amount)}
                    </td>
                    <td
                      style={{
                        padding: "16px",
                        borderBottom: "1px solid #e5e7eb",
                        display: "flex",
                        gap: "8px",
                        justifyContent: "center",
                      }}
                    >
                      <button
                        onClick={() => handleView(item)}
                        style={{ background: "rgba(37,99,235,0.1)", color: "#2563eb", border: "none", padding: "8px", borderRadius: "8px", cursor: "pointer" }}
                        title="View Voucher"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => startEdit(item)}
                        style={{ background: "rgba(180,83,9,0.1)", color: "#b45309", border: "none", padding: "8px", borderRadius: "8px", cursor: "pointer" }}
                        title="Edit"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => removePayment(item.id)}
                        style={{ background: "rgba(220,38,38,0.1)", color: "#dc2626", border: "none", padding: "8px", borderRadius: "8px", cursor: "pointer" }}
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
  <div id="voucher-preview" style={{ marginTop: "40px", display: "flex", flexDirection: "column", alignItems: "center" }}>
    {/* Main Voucher Container */}
    <div
      ref={voucherRef}
      style={{
        width: "210mm",
        minHeight: "297mm", // Full A4 Height taake footer bottom par aaye
        background: "#ffffff",
        padding: "40px 50px",
        boxShadow: "0 0 10px rgba(0,0,0,0.1)",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        fontFamily: "'Helvetica', 'Arial', sans-serif",
        color: "#1a1a1a"
      }}
    >
      {/* Header Section */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "40px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <img src={logo} alt="Logo" style={{ height: "60px" }} />
          <div>
            <h2 style={{ margin: 0, fontSize: "22px", fontWeight: "bold", color: "#000" }}>Secure Path Solutions</h2>
            <p style={{ margin: 0, fontSize: "12px", color: "#666" }}>Premium Vehicle Tracking & Security</p>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ 
            background: "#eef2ff", 
            color: "#3b82f6", 
            padding: "6px 20px", 
            borderRadius: "5px", 
            fontSize: "14px", 
            fontWeight: "bold",
            display: "inline-block",
            marginBottom: "10px",
            border: "1px solid #dbeafe"
          }}>
            OFFICIAL RECEIPT
          </div>
          <p style={{ margin: 0, fontSize: "13px", fontWeight: "bold" }}>No: <span style={{ fontWeight: "normal" }}>REC-{selectedPayment.id.slice(-8).toUpperCase()}</span></p>
          <p style={{ margin: "2px 0 0 0", fontSize: "13px", fontWeight: "bold" }}>Date: <span style={{ fontWeight: "normal" }}>{selectedPayment.date}</span></p>
        </div>
      </div>

      {/* Address Boxes Section */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "25px", marginBottom: "30px" }}>
        <div style={{ border: "1px solid #e5e7eb", borderRadius: "8px", padding: "15px" }}>
          <h4 style={{ margin: "0 0 8px 0", fontSize: "12px", color: "#3b82f6", fontWeight: "bold", textTransform: "uppercase" }}>Issued By</h4>
          <p style={{ margin: 0, fontSize: "13px", fontWeight: "bold" }}>Secure Path Solutions Pvt Ltd.</p>
          <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#4b5563", lineHeight: "1.4" }}>
            House 1-A, Upper Mall, Lahore<br />
            Tel: 042-111-000-320
          </p>
        </div>
        <div style={{ border: "1px solid #e5e7eb", borderRadius: "8px", padding: "15px" }}>
          <h4 style={{ margin: "0 0 8px 0", fontSize: "12px", color: "#3b82f6", fontWeight: "bold", textTransform: "uppercase" }}>Received From / Client</h4>
          <p style={{ margin: 0, fontSize: "13px", fontWeight: "bold" }}>{selectedPayment.payee}</p>
          <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#4b5563" }}>
            Category: {selectedPayment.category}<br />
            Payment Mode: {selectedPayment.paymentMode} ({selectedPayment.bank})
          </p>
        </div>
      </div>

      {/* Amount Highlight Box */}
      <div style={{ 
        background: "#f9fafb", 
        borderLeft: "6px solid #2563eb", 
        padding: "20px 25px", 
        borderRadius: "4px",
        marginBottom: "40px"
      }}>
        <p style={{ margin: "0 0 5px 0", fontSize: "13px", fontWeight: "bold", color: "#4b5563" }}>Total Amount</p>
        <h2 style={{ margin: 0, fontSize: "28px", fontWeight: "800", color: "#111827" }}>PKR Rs. {formatCurrency(selectedPayment.amount)}.00</h2>
      </div>

      {/* Remarks Section */}
      <div style={{ flexGrow: 1 }}>
        <h4 style={{ fontSize: "13px", color: "#111827", borderBottom: "1px solid #e5e7eb", paddingBottom: "8px", marginBottom: "10px" }}>Description / Remarks</h4>
        <p style={{ fontSize: "14px", color: "#4b5563", lineHeight: "1.6" }}>{selectedPayment.description}</p>
      </div>

      {/* Footer (Sticks to bottom) */}
      <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: "20px", textAlign: "center" }}>
        <p style={{ margin: 0, fontSize: "11px", color: "#4b5563", fontWeight: "bold" }}>
          Phone: <span style={{ fontWeight: "normal" }}>03006492075</span> | Email: <span style={{ fontWeight: "normal" }}>contact@securepathsolution.com</span>
        </p>
        <p style={{ margin: "4px 0 0 0", fontSize: "10px", color: "#9ca3af" }}>This is a computer-generated document.</p>
      </div>
    </div>

    {/* Buttons Container */}
    <div style={{ margin: "30px 0", display: "flex", gap: "15px" }}>
      <button onClick={downloadAsPDF} style={{ background: "#2563eb", color: "white", padding: "12px 25px", borderRadius: "6px", fontWeight: "bold", border: "none", cursor: "pointer" }}>
        Download PDF
      </button>
      <button onClick={() => setSelectedPayment(null)} style={{ background: "#f3f4f6", color: "#4b5563", padding: "12px 25px", borderRadius: "6px", fontWeight: "bold", border: "1px solid #d1d5db", cursor: "pointer" }}>
        Close
      </button>
    </div>
  </div>
)}
    </div>
  );
}