import { useState, useEffect } from "react";
import axios from "axios";

function DailyCashBook() {
  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(today);

  const [formData, setFormData] = useState({
    type: "purchase",
    description: "",
    amount: "",
    party: "",
  });

  const [transactions, setTransactions] = useState([]);

useEffect(() => {
  const fetchTransactions = async () => {
    try {
      console.log("Fetching for date:", selectedDate); // ← see in console

      const res = await axios.get(
        `https://accounts-sps-backend-git-main-secure-path-solutions-projects.vercel.app/api/transactions?date=${selectedDate}`
      );

      console.log("API Response:", res.data);           // ← MUST see the array here
      console.log("Response type:", typeof res.data);   // should be object (array)

      // Force it to be array even if something weird
      const data = Array.isArray(res.data) ? res.data : [];
      setTransactions(data);

    } catch (err) {
      console.error("Fetch failed:", err.message);
      if (err.response) {
        console.error("Response error:", err.response.data);
        console.error("Status:", err.response.status);
      } else if (err.request) {
        console.error("No response received - possible CORS/network issue", err.request);
      }
      setTransactions([]); // clear on error to avoid stale data
    }
  };

  fetchTransactions();
}, [selectedDate]);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.description.trim() || !formData.amount) return;

    const newTransaction = {
      date: selectedDate,
      time: new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
      type: formData.type,
      description: formData.description,
      party: formData.party,
      amount: Number(formData.amount),
    };

    try {
      const res = await axios.post(
        "https://accounts-sps-backend-git-main-secure-path-solutions-projects.vercel.app/api/transactions",
        newTransaction
      );
      setTransactions((prev) => [res.data, ...prev]);
      setFormData({
        type: "purchase",
        description: "",
        amount: "",
        party: "",
      });
    } catch (err) {
      console.error("Failed to add transaction:", err);
    }
  };

  const totalExpense = transactions.reduce((sum, t) => sum + t.amount, 0);

  return (
    <div
      style={{
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        maxWidth: "1280px",
        margin: "0 auto",
        padding: "32px 24px",
        background: "#f5f7fa",
        minHeight: "100vh",
      }}
    >
      {/* Header */}
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "40px",
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: "28px", fontWeight: 700, color: "#1e293b" }}>
            Daily Cash Book
          </h1>
          <p style={{ margin: "8px 0 0", color: "#64748b", fontSize: "15px" }}>
            {new Date(selectedDate).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          style={{
            padding: "10px 16px",
            fontSize: "15px",
            border: "1px solid #cbd5e1",
            borderRadius: "8px",
            background: "white",
            color: "#000000",
          }}
        />
      </header>

      {/* Add Entry Form */}
      <div
        style={{
          background: "white",
          borderRadius: "12px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
          padding: "28px",
          marginBottom: "40px",
        }}
      >
        <h2 style={{ margin: "0 0 24px 0", fontSize: "20px", fontWeight: 600, color: "#1e293b" }}>
          Add New Entry
        </h2>

        <form
          onSubmit={handleSubmit}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "20px",
          }}
        >
          <div>
            <label style={labelStyle}>Type</label>
            <select name="type" value={formData.type} onChange={handleChange} style={selectStyle}>
              <option value="purchase">Purchase</option>
              <option value="expense">Expense</option>
            </select>
          </div>

          <div>
            <label style={labelStyle}>Description</label>
            <input
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Item / purpose of expense"
              style={inputStyle}
              required
            />
          </div>

          <div>
            <label style={labelStyle}>Amount (PKR)</label>
            <input
              name="amount"
              type="number"
              value={formData.amount}
              onChange={handleChange}
              placeholder="0"
              style={inputStyle}
              required
            />
          </div>

          <div>
            <label style={labelStyle}>Paid To / Party</label>
            <input
              name="party"
              value={formData.party}
              onChange={handleChange}
              placeholder="Vendor / person name"
              style={inputStyle}
            />
          </div>

          <div style={{ alignSelf: "end" }}>
            <button
              type="submit"
              style={buttonStyle}
              onMouseOver={(e) => (e.currentTarget.style.background = "#1d4ed8")}
              onMouseOut={(e) => (e.currentTarget.style.background = "#2563eb")}
            >
              Add Entry
            </button>
          </div>
        </form>
      </div>

      {/* Summary */}
      <div
        style={{
          background: "white",
          borderRadius: "12px",
          padding: "24px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
          marginBottom: "32px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ fontSize: "18px", fontWeight: 600, color: "#1e293b" }}>
          Total for {new Date(selectedDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
        </span>
        <span style={{ fontSize: "24px", fontWeight: 700, color: "#dc2626" }}>
          PKR {totalExpense.toLocaleString("en-PK")}
        </span>
      </div>

      {/* Table */}
      <div
        style={{
          background: "white",
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f9fafb", color: "#4b5563" }}>
              <th style={thStyle}>Time</th>
              <th style={thStyle}>Type</th>
              <th style={thStyle}>Description</th>
              <th style={thStyle}>Paid To</th>
              <th style={{ ...thStyle, textAlign: "right" }}>Amount (PKR)</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", padding: "60px 20px", color: "#94a3b8", fontSize: "16px" }}>
                  No entries found for the selected date
                </td>
              </tr>
            ) : (
              transactions.map((t) => (
                <tr
                  key={t._id || t.id}
                  style={{
                    borderBottom: "1px solid #e2e8f0",
                    background: t.type === "purchase" ? "#f0f9ff" : "#fffbeb",
                  }}
                >
                  <td style={tdStyle}>{t.time}</td>
                  <td style={tdStyle}>
                    <span
                      style={{
                        padding: "6px 12px",
                        borderRadius: "999px",
                        fontSize: "13px",
                        fontWeight: 500,
                        background: t.type === "purchase" ? "#3b82f6" : "#f59e0b",
                        color: "white",
                      }}
                    >
                      {t.type === "purchase" ? "Purchase" : "Expense"}
                    </span>
                  </td>
                  <td style={tdStyle}>{t.description}</td>
                  <td style={tdStyle}>{t.party || "—"}</td>
                  <td style={{ ...tdStyle, textAlign: "right", fontWeight: 600, color: "#000000" }}>
                    {t.amount.toLocaleString("en-PK")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Styles (same as your original)
const labelStyle = { display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: 500, color: "#475569" };
const baseInputStyle = { width: "100%", padding: "12px 16px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "15px", background: "white", color: "#000", outline: "none", transition: "border-color 0.2s, box-shadow 0.2s" };
const inputStyle = { ...baseInputStyle };
const selectStyle = { ...baseInputStyle, appearance: "none", paddingRight: "40px" };
const buttonStyle = { width: "100%", padding: "14px 32px", background: "#2563eb", color: "white", border: "none", borderRadius: "8px", fontSize: "16px", fontWeight: 600, cursor: "pointer" };
const thStyle = { padding: "16px 20px", textAlign: "left", fontWeight: 500, fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.5px" };
const tdStyle = { padding: "16px 20px", fontSize: "15px", color: "#1e293b" };

export default DailyCashBook;
