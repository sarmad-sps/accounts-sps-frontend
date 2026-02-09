import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import logo from "../assets/sps-logo.png";
import html2pdf from "html2pdf.js";

export default function SalaryManager() {
  const API_URL = "https://accounts-sps-backend-git-main-secure-path-solutions-projects.vercel.app/api/salaries";

  const [salaries, setSalaries] = useState([]);
  const [empName, setEmpName] = useState("");
  const [salaryAmount, setSalaryAmount] = useState("");
  const [salaryMonth, setSalaryMonth] = useState(
    new Date().toLocaleString("default", { month: "long" })
  );
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [designation, setDesignation] = useState("Staff");
  const [paymentMode, setPaymentMode] = useState("Cash");
  const [bank, setBank] = useState("HBL");
  const [status, setStatus] = useState("Paid");

  const [selectedSlip, setSelectedSlip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null); // New: Track editing record
  const [isSaving, setIsSaving] = useState(false); // New: Loading state for save

  const banks = ["HBL", "Islamic Bank"];
  const statusOptions = ["Paid", "Unpaid"];
  const designations = ["Staff", "Manager", "Store", "Employee", "Accountant"];
  const paymentModes = ["Cash", "Online", "Cheque", "Bank Transfer"];

  useEffect(() => {
    const fetchSalaries = async () => {
      try {
        setLoading(true);
        const res = await axios.get(API_URL);
        setSalaries(res.data || []);
      } catch (err) {
        console.error("Error fetching salaries:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSalaries();
  }, []);

  const totalPayroll = useMemo(() => {
    return salaries
      .filter((s) => s.status === "Paid")
      .reduce((acc, s) => acc + (Number(s.amount) || 0), 0);
  }, [salaries]);

  // New: Load data into form for editing
  const loadForEdit = (salary) => {
    setEmpName(salary.employeeName || "");
    setSalaryAmount((salary.amount || 0).toString());
    setSalaryMonth(salary.month || new Date().toLocaleString("default", { month: "long" }));
    setPaymentDate(salary.paymentDate?.slice(0, 10) || new Date().toISOString().slice(0, 10));
    setDesignation(salary.designation || "Staff");
    setPaymentMode(salary.paymentMethod || "Cash");
    setBank(salary.bank || "HBL");
    setStatus(salary.status || "Paid");
    setEditingId(salary._id);
  };

  // New: Reset form to add mode
  const resetForm = () => {
    setEmpName("");
    setSalaryAmount("");
    setSalaryMonth(new Date().toLocaleString("default", { month: "long" }));
    setPaymentDate(new Date().toISOString().slice(0, 10));
    setDesignation("Staff");
    setPaymentMode("Cash");
    setBank("HBL");
    setStatus("Paid");
    setEditingId(null);
  };

  const saveSalary = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    if (!empName.trim()) return alert("Enter Employee name");

    const rawAmount = salaryAmount.trim().replace(/[^0-9]/g, "");
    if (!rawAmount) return alert("Enter Amount");

    const amountValue = parseInt(rawAmount, 10);
    if (isNaN(amountValue) || amountValue <= 0) {
      return alert("Enter Valid positive amount");
    }

    const payload = {
      employeeName: empName.trim(),
      designation,
      amount: amountValue,
      month: salaryMonth,
      paymentDate,
      paymentMethod: paymentMode,
      bank: paymentMode === "Cash" ? null : bank,
      status,
    };

    try {
      let updatedSalaries;
      let newSalary;

      if (editingId) {
        // Update existing record
        const res = await axios.put(`${API_URL}/${editingId}`, payload);
        newSalary = res.data.salary;
        updatedSalaries = salaries.map((s) => (s._id === editingId ? newSalary : s));
      } else {
        // Add new record
        const res = await axios.post(API_URL, payload);
        newSalary = {
          _id: res.data.salary._id,
          employeeName: res.data.salary.employeeName || payload.employeeName,
          designation: res.data.salary.designation || payload.designation,
          amount: res.data.salary.amount || payload.amount,
          month: res.data.salary.month || payload.month,
          paymentDate: res.data.salary.paymentDate || payload.paymentDate,
          paymentMethod: res.data.salary.paymentMethod || payload.paymentMethod,
          bank: res.data.salary.bank || payload.bank,
          status: res.data.salary.status || payload.status,
        };
        updatedSalaries = [newSalary, ...salaries];
      }

      setSalaries(updatedSalaries);

      // Reset form
      resetForm();
      alert(editingId ? "Salary updated successfully!" : "Salary added successfully!");
    } catch (err) {
      console.error("Error saving salary:", err);
      alert(editingId ? "Failed to update salary" : "Salary could not save");
    } finally {
      setIsSaving(false);
    }
  };

  const cancelEdit = () => {
    resetForm();
  };

  const deleteRecord = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;

    try {
      await axios.delete(`${API_URL}/${id}`);
      setSalaries((prev) => prev.filter((s) => s._id !== id));
      if (selectedSlip?._id === id) setSelectedSlip(null);
      if (editingId === id) resetForm();
      alert("Record deleted successfully!");
    } catch (err) {
      console.error("Delete error:", err);
      alert("Can't delete record");
    }
  };

  const handlePDF = () => {
    const element = document.querySelector(".slip-document");
    const opt = {
      margin: [10, 10, 10, 10],
      filename: `Salary-Slip-${selectedSlip.employeeName}-${selectedSlip.month}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };
    html2pdf().set(opt).from(element).save();
  };

  const formatAmount = (amt) => {
    const num = Number(amt) || 0;
    return num.toLocaleString("en-PK");
  };

  const getBankColor = (b) => {
    const map = {
      HBL: "#047857",
      "Islamic Bank": "#1e40af",
      Other: "#6b7280",
    };
    return map[b] || "#6b7280";
  };

  if (loading) return <div className="loading">Loading salary records...</div>;

  return (
    <div className="payroll-container">
      <style>{payrollStyle}</style>

      {selectedSlip && (
        <div className="modal-overlay">
          <div className="slip-modal">
            <div className="slip-document">
              {/* HEADER */}
              <div className="company-header">
                <div className="company-block">
                  <div className="logo-placeholder">
                    <img
                      src={logo}
                      alt="Secure Path Solutions Logo"
                      style={{ width: "100%", height: "100%", objectFit: "contain" }}
                    />
                  </div>
                  <div className="company-details">
                    <h2>Secure Path Solutions (Pvt) Ltd</h2>
                    <p>123 Business Street, Gulberg-III, Lahore</p>
                    <p>Ph: +92 42 111 000 111</p>
                  </div>
                </div>
              </div>

              {/* TITLE */}
              <div className="slip-title-block">
                <h1>PAY SLIP</h1>
                <div className="meta-info">
                  <p>
                    Salary Month: <strong>{selectedSlip.month}</strong>
                  </p>
                  <p>
                    Payment Date: {new Date(selectedSlip.paymentDate).toLocaleDateString("en-PK")}
                  </p>
                  <p>
                    Status:{" "}
                    <strong style={{ color: selectedSlip.status === "Paid" ? "#059669" : "#b45309" }}>
                      {selectedSlip.status || "—"}
                    </strong>
                  </p>
                </div>
              </div>

              <hr className="divider" />

              {/* EMPLOYEE INFO */}
              <div className="info-grid">
                <div>
                  <h3>Employee Details</h3>
                  <p><strong>Name:</strong> {selectedSlip.employeeName}</p>
                  <p><strong>Designation:</strong> {selectedSlip.designation || "N/A"}</p>
                  <p><strong>Employee ID:</strong> EMP-{selectedSlip._id?.slice(-6)}</p>
                </div>

                <div>
                  <h3>Payment Info</h3>
                  <p><strong>Payment Mode:</strong> {selectedSlip.paymentMethod || "Cash"}</p>
                  <p>
                    <strong>Bank:</strong>{" "}
                    <span style={{ color: getBankColor(selectedSlip.bank) }}>
                      {selectedSlip.paymentMethod === "Cash" || !selectedSlip.bank || selectedSlip.bank.trim() === "" 
                        ? "—" 
                        : selectedSlip.bank}
                    </span>
                  </p>
                </div>
              </div>

              <hr className="divider" />

              {/* EARNINGS + DEDUCTIONS */}
              <div className="tables-container">
                <div className="table-wrapper">
                  <table className="slip-table earnings">
                    <thead>
                      <tr>
                        <th>Earnings</th>
                        <th>Amount (PKR)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Basic Salary</td>
                        <td>{formatAmount(selectedSlip.amount)}</td>
                      </tr>
                      <tr className="total">
                        <td><strong>Gross Earnings</strong></td>
                        <td><strong>{formatAmount(selectedSlip.amount)}</strong></td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="table-wrapper">
                  <table className="slip-table deductions">
                    <thead>
                      <tr>
                        <th>Deductions</th>
                        <th>Amount (PKR)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Income Tax / Withholding</td>
                        <td>0</td>
                      </tr>
                      <tr>
                        <td>Other Deductions</td>
                        <td>0</td>
                      </tr>
                      <tr className="total">
                        <td><strong>Total Deductions</strong></td>
                        <td><strong>0</strong></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* NET PAY */}
              <div className="net-pay-box">
                <div className="net-label">NET SALARY PAID</div>
                <div className="net-value">
                  Rs. {formatAmount(selectedSlip.amount)}
                </div>
              </div>

              {/* FOOTER */}
              <div className="footer-note">
                This is a computer-generated payslip. No signature required.
              </div>
            </div>

            <div className="modal-actions no-print">
              <button className="action-btn pdf" onClick={handlePDF}>
                Save as PDF
              </button>
              <button className="action-btn close" onClick={() => setSelectedSlip(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN UI */}
      <div className="main-card no-print">
        <header className="header">
          <div>
            <h1>Salary Portal</h1>
            <p className="subtitle">Employee Payroll Management</p>
          </div>
          <div className="total-box">
            <small>Total Paid</small>
            <div className="total-amount">
              Rs {formatAmount(totalPayroll)}
            </div>
          </div>
        </header>

        <form className="add-form" onSubmit={saveSalary}>
          <div className="form-header">
            <h3>{editingId ? "Edit Salary Record" : "New Salary Record"}</h3>
            {editingId && (
              <button type="button" className="cancel-btn" onClick={cancelEdit}>
                Cancel Edit
              </button>
            )}
          </div>

          <div className="form-fields">
            <div className="field">
              <label>Employee Name</label>
              <input
                value={empName}
                onChange={(e) => setEmpName(e.target.value)}
                required
              />
            </div>

            <div className="field">
              <label>Amount (Rs)</label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="e.g. 45000"
                value={salaryAmount}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, "");
                  setSalaryAmount(val);
                }}
                required
              />
            </div>

            <div className="field">
              <label>Month</label>
              <select
                value={salaryMonth}
                onChange={(e) => setSalaryMonth(e.target.value)}
              >
                {[
                  "January", "February", "March", "April", "May", "June",
                  "July", "August", "September", "October", "November", "December",
                ].map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </div>

            <div className="field">
              <label>Payment Date</label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
              />
            </div>

            <div className="field">
              <label>Designation</label>
              <select
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
              >
                {designations.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div className="field">
              <label>Payment Mode</label>
              <select
                value={paymentMode}
                onChange={(e) => {
                  setPaymentMode(e.target.value);
                  if (e.target.value === "Cash") setBank("HBL");
                }}
              >
                {paymentModes.map((mode) => (
                  <option key={mode} value={mode}>{mode}</option>
                ))}
              </select>
            </div>

            {paymentMode !== "Cash" && (
              <div className="field">
                <label>Bank</label>
                <select value={bank} onChange={(e) => setBank(e.target.value)}>
                  {banks.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="field">
              <label>Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)}>
                {statusOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="field button-field">
              <button type="submit" className="submit-button" disabled={isSaving}>
                {isSaving ? "Saving..." : (editingId ? "Update Record" : "Add Record")}
              </button>
            </div>
          </div>
        </form>

        <div className="list-title">Payment Ledger</div>

        <div className="records">
          {salaries.length === 0 ? (
            <div className="empty">No records found</div>
          ) : (
            salaries.map((s) => (
              <div key={s._id} className="record-row">
                <div className="record-left">
                  <div className="avatar">{s.employeeName?.charAt(0) || "?"}</div>
                  <div>
                    <div className="name">{s.employeeName || "—"}</div>
                    <div className="meta">
                      {s.designation || "—"} • {s.paymentMethod || "Cash"} • {s.bank || "—"} • {s.month || "—"}
                    </div>
                  </div>
                </div>
                <div className="record-right">
                  <div className="amt">Rs {formatAmount(s.amount)}</div>
                  <div className="date">
                    {s.paymentDate?.slice(0, 10) || "—"} •{" "}
                    <span
                      style={{
                        color: (s.status || "Unpaid") === "Paid" ? "#059669" : "#b45309",
                        fontWeight: 600,
                      }}
                    >
                      {s.status || "Unpaid"}
                    </span>
                  </div>
                  <div className="actions">
                    <button 
                      className="view" 
                      onClick={() => setSelectedSlip(s)}
                      title="View Payslip"
                    >
                      View Slip
                    </button>
                    {!editingId && (
                      <button 
                        className="edit" 
                        onClick={() => loadForEdit(s)}
                        title="Edit Record"
                      >
                        Edit
                      </button>
                    )}
                    <button 
                      className="del" 
                      onClick={() => deleteRecord(s._id)}
                      title="Delete Record"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// --------------------- Updated Styles ---------------------
const payrollStyle = `
  :root {
    --primary: #3b82f6;
    --success: #059669;
    --warning: #d97706;
    --danger: #dc2626;
    --bg: #e5e7eb;
    --card: #ffffff;
    --text: #111827;
    --dim: #4b5563;
    --border: #d1d5db;
  }

  .payroll-container {
    color: var(--text);
    min-height: 100vh;
    padding: clamp(16px, 4vw, 24px);
    font-family: Inter, system-ui, sans-serif;
    background: #e5e7eb;
  }

  .loading {
    text-align: center;
    padding: 40px;
    font-size: 16px;
    color: var(--dim);
  }

  .main-card {
    max-width: 1100px;
    margin: 0 auto;
    background: var(--card);
    border-radius: 16px;
    padding: clamp(20px, 5vw, 28px);
    border: 1px solid var(--border);
    box-shadow: 0 4px 12px rgba(0,0,0,0.06);
    box-sizing: border-box;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: clamp(12px, 3vw, 20px);
    margin-bottom: clamp(20px, 5vw, 32px);
    padding: clamp(12px, 3vw, 16px) clamp(14px, 3.5vw, 20px);
    background: #ffffff;
    border-radius: 12px;
    border: 1px solid var(--border);
    color: black;
  }

  h1 {
    margin: 0;
    font-size: clamp(22px, 6vw, 28px);
    font-weight: 800;
    color: var(--text);
  }

  .subtitle {
    color: var(--dim);
    margin-top: 4px;
    font-size: clamp(12px, 3.2vw, 14px);
  }

  .total-box {
    background: #f9fafb;
    padding: clamp(10px, 2.5vw, 12px) clamp(16px, 4vw, 24px);
    border-radius: 12px;
    border: 1px solid var(--border);
    text-align: center;
  }

  .total-amount {
    font-size: clamp(18px, 5vw, 22px);
    font-weight: 800;
    color: var(--success);
  }

  .add-form {
    background: #f9fafb;
    border: 1px solid var(--border);
    padding: clamp(16px, 4vw, 24px);
    border-radius: 12px;
    margin-bottom: clamp(20px, 5vw, 32px);
  }

  .form-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: clamp(14px, 3.5vw, 20px);
  }

  .add-form h3 {
    margin: 0;
    color: var(--text);
    font-size: clamp(16px, 4.5vw, 18px);
    font-weight: 700;
  }

  .cancel-btn {
    background: var(--warning);
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .cancel-btn:hover {
    background: #b45309;
  }

  .form-fields {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(clamp(180px, 100%, 220px), 1fr));
    gap: clamp(14px, 3.5vw, 20px);
  }

  .field label {
    font-size: clamp(10px, 2.5vw, 12px);
    margin-bottom: clamp(4px, 1vw, 6px);
    display: block;
    color: var(--dim);
    font-weight: 600;
    text-transform: uppercase;
  }

  .field input,
  .field select {
    width: 100%;
    padding: clamp(8px, 2vw, 10px) clamp(10px, 2.5vw, 12px);
    background: #ffffff;
    border: 1px solid var(--border);
    color: var(--text);
    border-radius: 8px;
    font-size: clamp(13px, 3.5vw, 14px);
    box-sizing: border-box;
    transition: border-color 0.2s;
  }

  .field input:focus,
  .field select:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
  }

  .submit-button {
    background: var(--primary);
    color: white;
    border: none;
    padding: clamp(10px, 2.5vw, 12px) clamp(18px, 4vw, 24px);
    border-radius: 8px;
    font-weight: 700;
    cursor: pointer;
    width: 100%;
    font-size: clamp(13px, 3.5vw, 15px);
    margin-top: clamp(18px, 4vw, 28px);
    min-height: clamp(36px, 8vw, 44px);
    transition: all 0.2s;
  }

  .submit-button:hover:not(:disabled) {
    background: #2563eb;
    transform: translateY(-1px);
  }

  .submit-button:disabled {
    background: #9ca3af;
    cursor: not-allowed;
    transform: none;
  }

  .list-title {
    font-size: clamp(18px, 5vw, 20px);
    font-weight: 700;
    margin: clamp(20px, 5vw, 32px) 0 clamp(10px, 2.5vw, 16px);
    color: var(--text);
  }

  .records {
    display: flex;
    flex-direction: column;
    gap: clamp(10px, 2.5vw, 12px);
  }

  .record-row {
    background: #ffffff;
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: clamp(12px, 3vw, 16px) clamp(14px, 3.5vw, 20px);
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: clamp(10px, 2.5vw, 16px);
    transition: all 0.15s;
  }

  .record-row:hover {
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    transform: translateY(-1px);
  }

  .record-left {
    display: flex;
    align-items: center;
    gap: clamp(8px, 2vw, 12px);
    min-width: clamp(150px, 100%, 220px);
  }

  .avatar {
    width: clamp(36px, 8vw, 44px);
    height: clamp(36px, 8vw, 44px);
    background: var(--primary);
    color: white;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: clamp(14px, 3.5vw, 18px);
    flex-shrink: 0;
  }

  .name {
    font-weight: 600;
    font-size: clamp(13px, 3.5vw, 15px);
  }

  .meta {
    font-size: clamp(11px, 3vw, 13px);
    color: var(--dim);
  }

  .record-right {
    text-align: right;
    display: flex;
    flex-direction: column;
    gap: clamp(4px, 1vw, 6px);
    align-items: flex-end;
  }

  .amt {
    color: var(--success);
    font-weight: 800;
    font-size: clamp(16px, 4vw, 18px);
  }

  .date {
    font-size: clamp(11px, 3vw, 13px);
    color: var(--dim);
  }

  .actions {
    display: flex;
    gap: clamp(6px, 1.5vw, 8px);
    flex-wrap: wrap;
    align-items: center;
  }

  .view,
  .edit,
  .del {
    background: none;
    border: none;
    font-size: clamp(11px, 3vw, 13px);
    font-weight: 600;
    cursor: pointer;
    padding: clamp(6px, 1.5vw, 8px) clamp(10px, 2.5vw, 14px);
    border-radius: 6px;
    min-height: clamp(28px, 6vw, 32px);
    display: flex;
    align-items: center;
    transition: all 0.2s;
  }

  .view {
    color: var(--primary);
    background: rgba(59,130,246,0.1);
  }

  .view:hover {
    background: rgba(59,130,246,0.2);
    transform: translateY(-1px);
  }

  .edit {
    color: var(--warning);
    background: rgba(234,179,8,0.1);
  }

  .edit:hover {
    background: rgba(234,179,8,0.2);
    transform: translateY(-1px);
  }

  .del {
    color: var(--danger);
    background: rgba(220,38,38,0.1);
  }

  .del:hover {
    background: rgba(220,38,38,0.2);
    transform: translateY(-1px);
  }

  .empty {
    text-align: center;
    color: var(--dim);
    padding: clamp(40px, 10vw, 60px) clamp(12px, 3vw, 20px);
    font-size: clamp(13px, 3.5vw, 15px);
  }

  /* MODAL & PAYSLIP - Light Theme (unchanged) */
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.6);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: flex-start;
    justify-content: center;
    z-index: 1000;
    padding: clamp(20px, 4vw, 40px);
    overflow-y: auto;
  }

  .slip-modal {
    background: #ffffff;
    width: 100%;
    max-width: 820px;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 20px 50px rgba(0,0,0,0.25);
  }

  .slip-document {
    padding: clamp(30px, 5vw, 50px) clamp(30px, 5vw, 60px);
    background: white;
    position: relative;
    color: #111827;
    box-sizing: border-box;
  }

  .slip-document::before {
    content: "OFFICIAL";
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(-45deg);
    font-size: clamp(80px, 20vw, 140px);
    font-weight: 900;
    color: rgba(0,0,0,0.03);
    pointer-events: none;
  }

  .company-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: clamp(24px, 5vw, 40px);
    border-bottom: 3px solid #1d4ed8;
    padding-bottom: clamp(14px, 3.5vw, 20px);
    gap: clamp(12px, 3vw, 20px);
    flex-wrap: wrap;
  }

  .company-block {
    display: flex;
    align-items: center;
    gap: clamp(14px, 3.5vw, 24px);
  }

  .logo-placeholder {
    width: clamp(60px, 15vw, 90px);
    height: clamp(60px, 15vw, 90px);
  }

  .company-details h2 {
    margin: 0;
    font-size: clamp(20px, 5.5vw, 26px);
    color: #111827;
    text-transform: uppercase;
    letter-spacing: 1.2px;
  }

  .company-details p {
    margin: 4px 0;
    font-size: clamp(11px, 3vw, 13px);
    color: #4b5563;
  }

  .slip-title-block {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: clamp(20px, 5vw, 35px);
    gap: clamp(12px, 3vw, 20px);
    flex-wrap: wrap;
  }

  .slip-title-block h1 {
    margin: 0;
    font-size: clamp(24px, 6.5vw, 32px);
    color: #111827;
    border-left: 6px solid #1d4ed8;
    padding-left: clamp(12px, 3vw, 18px);
  }

  .meta-info {
    text-align: right;
    font-size: clamp(12px, 3.2vw, 14px);
    color: #4b5563;
  }

  .info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: clamp(24px, 6vw, 40px);
    background: #f9fafb;
    padding: clamp(16px, 4vw, 24px);
    border-radius: 8px;
    margin-bottom: clamp(24px, 5vw, 35px);
    border: 1px solid #e5e7eb;
  }

  .info-grid h3 {
    margin: 0 0 clamp(8px, 2vw, 12px);
    font-size: clamp(12px, 3.2vw, 14px);
    text-transform: uppercase;
    color: #1d4ed8;
    border-bottom: 1px solid #cbd5e1;
    padding-bottom: clamp(4px, 1vw, 6px);
  }

  .info-grid p {
    margin: clamp(4px, 1vw, 6px) 0;
    font-size: clamp(12px, 3.2vw, 13.5px);
    color: #111827;
  }

  .tables-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    overflow: hidden;
    margin-bottom: clamp(28px, 6vw, 40px);
  }

  .table-wrapper {
    border-right: 1px solid #d1d5db;
  }

  .table-wrapper:last-child {
    border-right: none;
  }

  .slip-table {
    width: 100%;
    border-collapse: collapse;
  }

  .slip-table th {
    background: #f3f4f6;
    padding: clamp(10px, 2.5vw, 12px) clamp(12px, 3vw, 16px);
    text-align: left;
    font-size: clamp(11px, 3vw, 12px);
    text-transform: uppercase;
    color: #4b5563;
    border-bottom: 1px solid #d1d5db;
  }

  .slip-table td {
    padding: clamp(10px, 2.5vw, 12px) clamp(12px, 3vw, 16px);
    font-size: clamp(12px, 3.2vw, 13.5px);
    border-bottom: 1px solid #e5e7eb;
    color: #111827;
  }

  .slip-table .total {
    background: #f9fafb;
    font-weight: 700;
  }

  .net-pay-box {
    background: #1d4ed8;
    color: white;
    padding: clamp(12px, 3vw, 16px) clamp(16px, 4vw, 24px);
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: clamp(20px, 5vw, 35px) 0;
    border-radius: 10px;
    font-size: clamp(14px, 3.5vw, 18px);
    flex-wrap: wrap;
    gap: clamp(12px, 3vw, 16px);
  }

  .net-label {
    font-weight: 600;
    letter-spacing: 0.5px;
    font-size: clamp(13px, 3.5vw, 16px);
  }

  .net-value {
    font-size: clamp(20px, 6vw, 28px);
    font-weight: 800;
  }

  .footer-note {
    margin-top: clamp(30px, 7vw, 50px);
    text-align: center;
    font-size: clamp(10px, 2.5vw, 12px);
    color: #6b7280;
    font-style: italic;
  }

  .modal-actions {
    display: flex;
    gap: clamp(10px, 2.5vw, 16px);
    justify-content: center;
    padding: clamp(16px, 4vw, 24px) clamp(24px, 5vw, 40px);
    background: #f9fafb;
    border-top: 1px solid #d1d5db;
    flex-wrap: wrap;
  }

  .action-btn {
    padding: clamp(10px, 2.5vw, 12px) clamp(20px, 4vw, 28px);
    font-size: clamp(12px, 3.2vw, 14px);
    font-weight: 600;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    min-width: clamp(120px, 25vw, 150px);
    transition: all 0.2s;
  }

  .action-btn.pdf {
    background: #1d4ed8;
    color: white;
  }

  .action-btn.close {
    background: #6b7280;
    color: white;
  }

  @media print {
    .no-print { display: none !important; }
    .modal-overlay { background: white !important; padding: 0; }
    .slip-modal { box-shadow: none; border: none; border-radius: 0; max-width: none; }
    .slip-document { padding: 40px 50px; }
    .net-pay-box { border: 2px solid #000 !important; background: #f9fafb !important; color: #000 !important; }
    @page {
      size: A4;
      margin: 12mm;
    }
  }

  @media (max-width: 768px) {
    .actions {
      width: 100%;
      justify-content: flex-end;
    }
    
    .record-right {
      width: 100%;
      align-items: stretch;
    }
    
    .form-fields {
      grid-template-columns: 1fr;
    }
  }
`;