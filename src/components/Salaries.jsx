import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import logo from "../assets/sps-logo.png";
import html2pdf from "html2pdf.js";

export default function SalaryManager() {
  const API_URL = "http://localhost:3000/api/salaries";

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

  const banks = ["HBL", "Islamic Bank", "Other"];
  const statusOptions = ["Paid", "Unpaid"];

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

  const addSalary = async (e) => {
    e.preventDefault();

    if (!empName.trim()) return alert("Enter Employee name");

    const rawAmount = salaryAmount.trim().replace(/[^0-9]/g, "");
    if (!rawAmount) return alert("Enter Amount");

    const amountValue = parseInt(rawAmount, 10);
    if (isNaN(amountValue) || amountValue <= 0) {
      return alert("Enter Valid positive amount ");
    }

    const payload = {
      employeeName: empName.trim(),
      designation,
      amount: amountValue,
      month: salaryMonth,
      paymentDate,
      paymentMethod: paymentMode,
      bank,
      status,
    };

    try {
      const res = await axios.post(API_URL, payload);
      const newSalary = {
        _id: res.data._id,
        employeeName: res.data.employeeName || payload.employeeName,
        designation: res.data.designation || payload.designation,
        amount: res.data.amount || payload.amount,
        month: res.data.month || payload.month,
        paymentDate: res.data.paymentDate || payload.paymentDate,
        paymentMethod: res.data.paymentMethod || payload.paymentMethod,
        bank: res.data.bank || payload.bank,
        status: res.data.status || payload.status,
      };

      setSalaries((prev) => [newSalary, ...prev]);

      // Reset form
      setEmpName("");
      setSalaryAmount("");
      setSalaryMonth(new Date().toLocaleString("default", { month: "long" }));
      setPaymentDate(new Date().toISOString().slice(0, 10));
      setDesignation("Staff");
      setPaymentMode("Cash");
      setBank("HBL");
      setStatus("Paid");
    } catch (err) {
      console.error("Error adding salary:", err);
      alert("Salary could not save");
    }
  };

  const deleteRecord = async (id) => {
    if (!window.confirm("Are you sure you want to delete?")) return;

    try {
      await axios.delete(`${API_URL}/${id}`);
      setSalaries((prev) => prev.filter((s) => s._id !== id));
      if (selectedSlip?._id === id) setSelectedSlip(null);
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

  if (loading) return <div>Loading salary records...</div>;

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
                      {selectedSlip.bank || "—"}
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

        <form className="add-form" onSubmit={addSalary}>
          <h3>New Salary Record</h3>

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
                <option>Staff</option>
                <option>Manager</option>
                <option>Store</option>
                <option>Employee</option>
                <option>Accountant</option>
              </select>
            </div>

            <div className="field">
              <label>Payment Mode</label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
              >
                <option value="Cash">Cash</option>
                <option value="Cheque">Cheque</option>
                <option value="Bank Transfer">Bank Transfer</option>
              </select>
            </div>

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
              <button type="submit" className="submit-button">
                Add Record
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
                    <button className="view" onClick={() => setSelectedSlip(s)}>
                      View Slip
                    </button>
                    <button className="del" onClick={() => deleteRecord(s._id)}>
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

// --------------------- Style remains same ---------------------
const payrollStyle = `
  :root {
    --primary: #3b82f6;
    --success: #059669;
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
    padding: 24px;
    font-family: Inter, system-ui, sans-serif;
    background: #e5e7eb;
  }

  .main-card {
    max-width: 1100px;
    margin: 0 auto;
    background: var(--card);
    border-radius: 16px;
    padding: 28px;
    border: 1px solid var(--border);
    box-shadow: 0 4px 12px rgba(0,0,0,0.06);
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 20px;
    margin-bottom: 32px;
    padding: 16px 20px;
    background: #ffffff;
    border-radius: 12px;
    border: 1px solid var(--border);
    color:black;
  }

  h1 {
    margin: 0;
    font-size: 28px;
    font-weight: 800;
    color: var(--text);
  }

  .subtitle {
    color: var(--dim);
    margin-top: 4px;
    font-size: 14px;
  }

  .total-box {
    background: #f9fafb;
    padding: 12px 24px;
    border-radius: 12px;
    border: 1px solid var(--border);
    text-align: center;
  }

  .total-amount {
    font-size: 22px;
    font-weight: 800;
    color: var(--success);
  }

  .add-form {
    background: #f9fafb;
    border: 1px solid var(--border);
    padding: 24px;
    border-radius: 12px;
    margin-bottom: 32px;
  }

  .add-form h3 {
    margin: 0 0 20px 0;
    color: var(--text);
    font-size: 18px;
    font-weight: 700;
  }

  .form-fields {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 20px;
  }

  .field label {
    font-size: 12px;
    margin-bottom: 6px;
    display: block;
    color: var(--dim);
    font-weight: 600;
    text-transform: uppercase;
  }

  .field input,
  .field select {
    width: 100%;
    padding: 10px 12px;
    background: #ffffff;
    border: 1px solid var(--border);
    color: var(--text);
    border-radius: 8px;
    font-size: 14px;
  }

  .submit-button {
    background: var(--primary);
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    font-weight: 700;
    cursor: pointer;
    width: 100%;
    font-size: 15px;
    margin-top: 28px;
  }

  .list-title {
    font-size: 20px;
    font-weight: 700;
    margin: 32px 0 16px;
    color: var(--text);
  }

  .records {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .record-row {
    background: #ffffff;
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 16px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 16px;
    transition: all 0.15s;
  }

  .record-row:hover {
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  }

  .record-left {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 220px;
  }

  .avatar {
    width: 44px;
    height: 44px;
    background: var(--primary);
    color: white;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 18px;
  }

  .name {
    font-weight: 600;
    font-size: 15px;
  }

  .meta {
    font-size: 13px;
    color: var(--dim);
  }

  .record-right {
    text-align: right;
    display: flex;
    flex-direction: column;
    gap: 6px;
    align-items: flex-end;
  }

  .amt {
    color: var(--success);
    font-weight: 800;
    font-size: 18px;
  }

  .date {
    font-size: 13px;
    color: var(--dim);
  }

  .actions {
    display: flex;
    gap: 12px;
  }

  .view,
  .del {
    background: none;
    border: none;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    padding: 6px 12px;
    border-radius: 6px;
  }

  .view {
    color: var(--primary);
    background: rgba(59,130,246,0.1);
  }

  .del {
    color: var(--danger);
    background: rgba(220,38,38,0.1);
  }

  .empty {
    text-align: center;
    color: var(--dim);
    padding: 60px 0;
    font-size: 15px;
  }

  /* MODAL & PAYSLIP - Light Theme */
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.6);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: flex-start;
    justify-content: center;
    z-index: 1000;
    padding: 40px 20px;
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
    padding: 50px 60px;
    background: white;
    position: relative;
    color: #111827;
  }

  .slip-document::before {
    content: "OFFICIAL";
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(-45deg);
    font-size: 140px;
    font-weight: 900;
    color: rgba(0,0,0,0.03);
    pointer-events: none;
  }

  .company-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 40px;
    border-bottom: 3px solid #1d4ed8;
    padding-bottom: 20px;
  }

  .company-block {
    display: flex;
    align-items: center;
    gap: 24px;
  }

  .logo-placeholder {
    width: 90px;
    height: 90px;
  }

  .company-details h2 {
    margin: 0;
    font-size: 26px;
    color: #111827;
    text-transform: uppercase;
    letter-spacing: 1.2px;
  }

  .company-details p {
    margin: 4px 0;
    font-size: 13px;
    color: #4b5563;
  }

  .slip-title-block {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 35px;
  }

  .slip-title-block h1 {
    margin: 0;
    font-size: 32px;
    color: #111827;
    border-left: 6px solid #1d4ed8;
    padding-left: 18px;
  }

  .meta-info {
    text-align: right;
    font-size: 14px;
    color: #4b5563;
  }

  .info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 40px;
    background: #f9fafb;
    padding: 24px;
    border-radius: 8px;
    margin-bottom: 35px;
    border: 1px solid #e5e7eb;
  }

  .info-grid h3 {
    margin: 0 0 12px;
    font-size: 14px;
    text-transform: uppercase;
    color: #1d4ed8;
    border-bottom: 1px solid #cbd5e1;
    padding-bottom: 6px;
  }

  .info-grid p {
    margin: 6px 0;
    font-size: 13.5px;
    color: #111827;
  }

  .tables-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    overflow: hidden;
    margin-bottom: 40px;
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
    padding: 12px 16px;
    text-align: left;
    font-size: 12px;
    text-transform: uppercase;
    color: #4b5563;
    border-bottom: 1px solid #d1d5db;
  }

  .slip-table td {
    padding: 12px 16px;
    font-size: 13.5px;
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
    padding: 16px 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 35px 0;
    border-radius: 10px;
    font-size: 18px;
  }

  .net-label {
    font-weight: 600;
    letter-spacing: 0.5px;
  }

  .net-value {
    font-size: 28px;
    font-weight: 800;
  }

  .footer-note {
    margin-top: 50px;
    text-align: center;
    font-size: 12px;
    color: #6b7280;
    font-style: italic;
  }

  .modal-actions {
    display: flex;
    gap: 16px;
    justify-content: center;
    padding: 24px 40px;
    background: #f9fafb;
    border-top: 1px solid #d1d5db;
  }

  .action-btn {
    padding: 12px 28px;
    font-size: 14px;
    font-weight: 600;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    min-width: 150px;
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
`;