// import React, { useState, useEffect, useMemo, useRef } from "react";
// import axios from "axios";
// import logo from "../assets/sps-logo.png";
// import html2pdf from "html2pdf.js";
// import { Eye, Edit, Trash2 } from "lucide-react";

// export default function SalaryManager() {
//   const API_URL =
//     "https://accounts-sps-backend-git-main-secure-path-solutions-projects.vercel.app/api/salaries";

//   const [salaries, setSalaries] = useState([]);
//   const [empName, setEmpName] = useState("");
//   const [salaryAmount, setSalaryAmount] = useState("");
//   const [salaryMonth, setSalaryMonth] = useState(
//     new Date().toLocaleString("default", { month: "long" }),
//   );
//   const [paymentDate, setPaymentDate] = useState(
//     new Date().toISOString().slice(0, 10),
//   );
//   const [designation, setDesignation] = useState("Staff");
//   const [paymentMode, setPaymentMode] = useState("Cash");
//   const [bank, setBank] = useState("");
//   const [status, setStatus] = useState("Paid");

//   const [selectedSlip, setSelectedSlip] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [editingId, setEditingId] = useState(null);
//   const [isSaving, setIsSaving] = useState(false);

//   // Ref for scrolling to form
//   const formRef = useRef(null);

//   const banks = ["HBL", "Bank Islami"];
//   const statusOptions = ["Paid", "Unpaid"];
//   const designations = ["Staff", "Manager", "Store", "Employee", "Accountant"];
//   const paymentModes = ["Cash", "Online", "Cheque", "Bank Transfer"];

//   useEffect(() => {
//     fetchSalaries();
//   }, []);

//   const fetchSalaries = async () => {
//     try {
//       setLoading(true);
//       const res = await axios.get(API_URL);
//       setSalaries(res.data || []);
//     } catch (err) {
//       console.error("Error fetching salaries:", err);
//       alert("Records load nahi ho rahe");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const totalPayroll = useMemo(() => {
//     return salaries
//       .filter((s) => s.status === "Paid")
//       .reduce((acc, s) => acc + Number(s.amount || 0), 0);
//   }, [salaries]);

//   const loadForEdit = (salary) => {
//     setEmpName(salary.employeeName || "");
//     setSalaryAmount(String(salary.amount || ""));
//     setSalaryMonth(
//       salary.month || new Date().toLocaleString("default", { month: "long" }),
//     );
//     setPaymentDate(
//       salary.paymentDate?.slice(0, 10) || new Date().toISOString().slice(0, 10),
//     );
//     setDesignation(salary.designation || "Staff");
//     setPaymentMode(salary.paymentMethod || "Cash");
//     setBank(salary.bank || "");
//     setStatus(salary.status || "Paid");
//     setEditingId(salary._id);

//     // Scroll smoothly to the form
//     setTimeout(() => {
//       if (formRef.current) {
//         formRef.current.scrollIntoView({
//           behavior: "smooth",
//           block: "start",
//         });
//       } else {
//         window.scrollTo({ top: 0, behavior: "smooth" });
//       }
//     }, 120);
//   };

//   const resetForm = () => {
//     setEmpName("");
//     setSalaryAmount("");
//     setSalaryMonth(new Date().toLocaleString("default", { month: "long" }));
//     setPaymentDate(new Date().toISOString().slice(0, 10));
//     setDesignation("Staff");
//     setPaymentMode("Cash");
//     setBank("");
//     setStatus("Paid");
//     setEditingId(null);
//   };

//   const saveSalary = async (e) => {
//     e.preventDefault();
//     setIsSaving(true);

//     if (!empName.trim()) {
//       alert("Employee name daal do");
//       setIsSaving(false);
//       return;
//     }

//     const rawAmount = salaryAmount.trim().replace(/[^0-9]/g, "");
//     if (!rawAmount) {
//       alert("Amount daal do");
//       setIsSaving(false);
//       return;
//     }

//     const amountValue = parseInt(rawAmount, 10);
//     if (isNaN(amountValue) || amountValue <= 0) {
//       alert("Valid positive amount daalo");
//       setIsSaving(false);
//       return;
//     }

//     const payload = {
//       employeeName: empName.trim(),
//       designation,
//       amount: amountValue,
//       month: salaryMonth,
//       paymentDate,
//       paymentMethod: paymentMode,
//       status,
//     };

//     if (paymentMode !== "Cash" && bank.trim()) {
//       payload.bank = bank.trim();
//     }

//     try {
//       let updatedSalaries;
//       let newSalary;

//       if (editingId) {
//         const res = await axios.put(`${API_URL}/${editingId}`, payload);
//         newSalary = res.data.salary || res.data;
//         updatedSalaries = salaries.map((s) =>
//           s._id === editingId ? newSalary : s,
//         );
//       } else {
//         const res = await axios.post(API_URL, payload);
//         newSalary = res.data.salary || res.data;
//         updatedSalaries = [newSalary, ...salaries];
//       }

//       setSalaries(updatedSalaries);
//       resetForm();
//       alert(
//         editingId
//           ? "Salary updated successfully!"
//           : "Salary added successfully!",
//       );
//     } catch (err) {
//       console.error("Error saving salary:", err);
//       alert(
//         err.response?.data?.error ||
//           (editingId ? "Update failed" : "Save failed"),
//       );
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   const deleteRecord = async (id) => {
//     if (!window.confirm("Are you sure you want to delete this record?")) return;

//     try {
//       await axios.delete(`${API_URL}/${id}`);
//       setSalaries((prev) => prev.filter((s) => s._id !== id));
//       if (selectedSlip?._id === id) setSelectedSlip(null);
//       if (editingId === id) resetForm();
//       alert("Record deleted successfully!");
//     } catch (err) {
//       console.error("Delete error:", err);
//       alert("Can't delete record");
//     }
//   };

//   const handlePDF = () => {
//     const element = document.querySelector(".slip-document");
//     const opt = {
//       margin: [10, 10, 10, 10],
//       filename: `Salary-Slip-${selectedSlip.employeeName}-${selectedSlip.month}.pdf`,
//       image: { type: "jpeg", quality: 0.98 },
//       html2canvas: { scale: 2, useCORS: true },
//       jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
//     };
//     html2pdf().set(opt).from(element).save();
//   };

//   const formatAmount = (amt) => Number(amt || 0).toLocaleString("en-PK");

//   const getBankColor = (b) => {
//     const map = {
//       HBL: "#047857",
//       "Bank Islami": "#1e40af",
//       Other: "#6b7280",
//     };
//     return map[b] || "#6b7280";
//   };

//   const getPaymentModeColor = (mode) => {
//     const map = {
//       Cash: "#ea580c",
//       Online: "#2563eb",
//       Cheque: "#d97706",
//       "Bank Transfer": "#1d4ed8",
//     };
//     return map[mode] || "#6b7280";
//   };

//   const getStatusStyle = (stat) => {
//     return stat === "Paid"
//       ? { color: "#059669", bg: "#ecfdf5" }
//       : { color: "#b45309", bg: "#fffbeb" };
//   };

//   if (loading) return <div className="loading">Loading salary records...</div>;

//   return (
//     <div className="payroll-container">
//       <style>{payrollStyle}</style>

//       {selectedSlip && (
//         <div className="modal-overlay">
//           <div className="slip-modal">
//             <div className="slip-document">
//               {/* HEADER */}
//               <div className="company-header">
//                 <div className="company-block">
//                   <div className="logo-placeholder">
//                     <img
//                       src={logo}
//                       alt="Secure Path Solutions Logo"
//                       style={{
//                         width: "100%",
//                         height: "100%",
//                         objectFit: "contain",
//                       }}
//                     />
//                   </div>
//                   <div className="company-details">
//                     <h2>Secure Path Solutions (Pvt) Ltd</h2>
//                     <p>123 Business Street, Gulberg-III, Lahore</p>
//                     <p>Ph: +92 42 111 000 111</p>
//                   </div>
//                 </div>
//               </div>

//               {/* TITLE */}
//               <div className="slip-title-block">
//                 <h1>PAY SLIP</h1>
//                 <div className="meta-info">
//                   <p>
//                     Salary Month: <strong>{selectedSlip.month}</strong>
//                   </p>
//                   <p>
//                     Payment Date:{" "}
//                     {new Date(selectedSlip.paymentDate).toLocaleDateString(
//                       "en-PK",
//                     )}
//                   </p>
//                   <p>
//                     Status:{" "}
//                     <strong
//                       style={{
//                         color:
//                           selectedSlip.status === "Paid"
//                             ? "#059669"
//                             : "#b45309",
//                       }}
//                     >
//                       {selectedSlip.status || "—"}
//                     </strong>
//                   </p>
//                 </div>
//               </div>

//               <hr className="divider" />

//               {/* EMPLOYEE INFO */}
//               <div className="info-grid">
//                 <div>
//                   <h3>Employee Details</h3>
//                   <p>
//                     <strong>Name:</strong> {selectedSlip.employeeName}
//                   </p>
//                   <p>
//                     <strong>Designation:</strong>{" "}
//                     {selectedSlip.designation || "N/A"}
//                   </p>
//                   <p>
//                     <strong>Employee ID:</strong> EMP-
//                     {selectedSlip._id?.slice(-6)}
//                   </p>
//                 </div>

//                 <div>
//                   <h3>Payment Info</h3>
//                   <p>
//                     <strong>Payment Mode:</strong>{" "}
//                     {selectedSlip.paymentMethod || "Cash"}
//                   </p>
//                   <p>
//                     <strong>Bank:</strong>{" "}
//                     <span style={{ color: getBankColor(selectedSlip.bank) }}>
//                       {selectedSlip.paymentMethod === "Cash" ||
//                       !selectedSlip.bank?.trim()
//                         ? "—"
//                         : selectedSlip.bank}
//                     </span>
//                   </p>
//                 </div>
//               </div>

//               <hr className="divider" />

//               {/* EARNINGS + DEDUCTIONS */}
//               <div className="tables-container">
//                 <div className="table-wrapper">
//                   <table className="slip-table earnings">
//                     <thead>
//                       <tr>
//                         <th>Earnings</th>
//                         <th>Amount (PKR)</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       <tr>
//                         <td>Basic Salary</td>
//                         <td>{formatAmount(selectedSlip.amount)}</td>
//                       </tr>
//                       <tr className="total">
//                         <td>
//                           <strong>Gross Earnings</strong>
//                         </td>
//                         <td>
//                           <strong>{formatAmount(selectedSlip.amount)}</strong>
//                         </td>
//                       </tr>
//                     </tbody>
//                   </table>
//                 </div>

//                 <div className="table-wrapper">
//                   <table className="slip-table deductions">
//                     <thead>
//                       <tr>
//                         <th>Deductions</th>
//                         <th>Amount (PKR)</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       <tr>
//                         <td>Income Tax / Withholding</td>
//                         <td>0</td>
//                       </tr>
//                       <tr>
//                         <td>Other Deductions</td>
//                         <td>0</td>
//                       </tr>
//                       <tr className="total">
//                         <td>
//                           <strong>Total Deductions</strong>
//                         </td>
//                         <td>
//                           <strong>0</strong>
//                         </td>
//                       </tr>
//                     </tbody>
//                   </table>
//                 </div>
//               </div>

//               {/* NET PAY */}
//               <div className="net-pay-box">
//                 <div className="net-label">NET SALARY PAID</div>
//                 <div className="net-value">
//                   Rs. {formatAmount(selectedSlip.amount)}
//                 </div>
//               </div>

//               {/* FOOTER */}
//               <div className="footer-note">
//                 This is a computer-generated payslip. No signature required.
//               </div>
//             </div>

//             <div className="modal-actions no-print">
//               <button className="action-btn pdf" onClick={handlePDF}>
//                 Save as PDF
//               </button>
//               <button
//                 className="action-btn close"
//                 onClick={() => setSelectedSlip(null)}
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* MAIN UI */}
//       <div className="main-card no-print">
//         <header className="header">
//           <div>
//             <h1>Salary Portal</h1>
//             <p className="subtitle">Employee Payroll Management</p>
//           </div>
//           <div className="total-box">
//             <small>Total Paid</small>
//             <div className="total-amount">Rs {formatAmount(totalPayroll)}</div>
//           </div>
//         </header>

//         <form ref={formRef} className="add-form" onSubmit={saveSalary}>
//           <div className="form-header">
//             <h3>{editingId ? "Edit Salary Record" : "New Salary Record"}</h3>
//             {editingId && (
//               <button type="button" className="cancel-btn" onClick={resetForm}>
//                 Cancel Edit
//               </button>
//             )}
//           </div>

//           <div className="form-fields">
//             <div className="field">
//               <label>Employee Name</label>
//               <input
//                 value={empName}
//                 onChange={(e) => setEmpName(e.target.value)}
//                 required
//               />
//             </div>

//             <div className="field">
//               <label>Amount (Rs)</label>
//               <input
//                 type="text"
//                 inputMode="numeric"
//                 pattern="[0-9]*"
//                 placeholder="e.g. 45000"
//                 value={salaryAmount}
//                 onChange={(e) =>
//                   setSalaryAmount(e.target.value.replace(/[^0-9]/g, ""))
//                 }
//                 required
//               />
//             </div>

//             <div className="field">
//               <label>Month</label>
//               <select
//                 value={salaryMonth}
//                 onChange={(e) => setSalaryMonth(e.target.value)}
//               >
//                 {[
//                   "January",
//                   "February",
//                   "March",
//                   "April",
//                   "May",
//                   "June",
//                   "July",
//                   "August",
//                   "September",
//                   "October",
//                   "November",
//                   "December",
//                 ].map((m) => (
//                   <option key={m}>{m}</option>
//                 ))}
//               </select>
//             </div>

//             <div className="field">
//               <label>Payment Date</label>
//               <input
//                 type="date"
//                 value={paymentDate}
//                 onChange={(e) => setPaymentDate(e.target.value)}
//               />
//             </div>

//             <div className="field">
//               <label>Designation</label>
//               <select
//                 value={designation}
//                 onChange={(e) => setDesignation(e.target.value)}
//               >
//                 {designations.map((d) => (
//                   <option key={d} value={d}>
//                     {d}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <div className="field">
//               <label>Payment Mode</label>
//               <select
//                 value={paymentMode}
//                 onChange={(e) => {
//                   const mode = e.target.value;
//                   setPaymentMode(mode);
//                   if (mode === "Cash") setBank("");
//                 }}
//               >
//                 {paymentModes.map((mode) => (
//                   <option key={mode} value={mode}>
//                     {mode}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             {paymentMode !== "Cash" && (
//               <div className="field">
//                 <label>Bank</label>
//                 <select value={bank} onChange={(e) => setBank(e.target.value)}>
//                   <option value="">Select Bank</option>
//                   {banks.map((b) => (
//                     <option key={b} value={b}>
//                       {b}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             )}

//             <div className="field">
//               <label>Status</label>
//               <select
//                 value={status}
//                 onChange={(e) => setStatus(e.target.value)}
//               >
//                 {statusOptions.map((s) => (
//                   <option key={s} value={s}>
//                     {s}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <div className="field button-field">
//               <button
//                 type="submit"
//                 className="submit-button"
//                 disabled={isSaving}
//               >
//                 {isSaving
//                   ? "Saving..."
//                   : editingId
//                   ? "Update Record"
//                   : "Add Record"}
//               </button>
//             </div>
//           </div>
//         </form>

//         <div className="list-title">Payment Ledger</div>

//         <div className="table-container">
//           <table>
//             <thead>
//               <tr>
//                 <th>Employee</th>
//                 <th>Designation</th>
//                 <th>Month</th>
//                 <th>Status</th>
//                 <th>Mode</th>
//                 <th style={{ minWidth: "clamp(100px, 15vw, 140px)" }}>Bank</th>
//                 <th style={{ textAlign: "right" }}>Amount</th>
//                 <th style={{ textAlign: "center" }}>Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {salaries.map((s) => {
//                 const isPaid = (s.status || "Unpaid") === "Paid";

//                 return (
//                   <tr key={s._id} className={isPaid ? "paid-row" : ""}>
//                     <td style={{ fontWeight: 600 }}>{s.employeeName || "—"}</td>
//                     <td>{s.designation || "—"}</td>
//                     <td>{s.month || "—"}</td>
//                     <td>
//                       <span
//                         style={{
//                           padding: "clamp(3px, 1vw, 4px) clamp(8px, 2vw, 12px)",
//                           borderRadius: "20px",
//                           fontSize: "clamp(10px, 2.5vw, 12px)",
//                           fontWeight: 600,
//                           backgroundColor: getStatusStyle(s.status || "Unpaid").bg,
//                           color: getStatusStyle(s.status || "Unpaid").color,
//                         }}
//                       >
//                         {s.status || "Unpaid"}
//                       </span>
//                     </td>
//                     <td>
//                       <span
//                         style={{
//                           padding: "clamp(3px, 1vw, 4px) clamp(8px, 2vw, 12px)",
//                           borderRadius: "20px",
//                           fontSize: "clamp(10px, 2.5vw, 12px)",
//                           fontWeight: 600,
//                           color: "white",
//                           backgroundColor: getPaymentModeColor(s.paymentMethod || "Cash"),
//                         }}
//                       >
//                         {s.paymentMethod || "Cash"}
//                       </span>
//                     </td>
//                     <td>
//                       {s.paymentMethod === "Cash" || !s.bank?.trim() ? (
//                         "—"
//                       ) : (
//                         <span
//                           style={{
//                             padding: "clamp(3px, 1vw, 4px) clamp(8px, 2vw, 12px)",
//                             borderRadius: "20px",
//                             fontSize: "clamp(10px, 2.5vw, 12px)",
//                             fontWeight: 600,
//                             color: "white",
//                             backgroundColor: getBankColor(s.bank),
//                             whiteSpace: "nowrap",
//                             display: "inline-block",
//                           }}
//                         >
//                           {s.bank}
//                         </span>
//                       )}
//                     </td>
//                     <td style={{ textAlign: "right", fontWeight: 700, color: "#374151" }}>
//                       Rs {formatAmount(s.amount)}
//                     </td>
//                     <td>
//                       <div className="action-group">
//                         <button
//                           onClick={() => setSelectedSlip(s)}
//                           title="View Payslip"
//                           style={{
//                             background: "rgba(37,99,235,0.1)",
//                             color: "#2563eb",
//                             border: "none",
//                             padding: "clamp(6px, 1.5vw, 8px)",
//                             borderRadius: "8px",
//                             cursor: "pointer",
//                             minHeight: "clamp(32px, 7vw, 36px)",
//                             minWidth: "clamp(32px, 7vw, 36px)",
//                             display: "flex",
//                             alignItems: "center",
//                             justifyContent: "center",
//                           }}
//                         >
//                           <Eye size={18} />
//                         </button>
//                         <button
//                           onClick={() => loadForEdit(s)}
//                           title="Edit"
//                           style={{
//                             background: "rgba(180,83,9,0.1)",
//                             color: "#b45309",
//                             border: "none",
//                             padding: "clamp(6px, 1.5vw, 8px)",
//                             borderRadius: "8px",
//                             cursor: "pointer",
//                             minHeight: "clamp(32px, 7vw, 36px)",
//                             minWidth: "clamp(32px, 7vw, 36px)",
//                             display: "flex",
//                             alignItems: "center",
//                             justifyContent: "center",
//                           }}
//                         >
//                           <Edit size={18} />
//                         </button>
//                         <button
//                           onClick={() => deleteRecord(s._id)}
//                           title="Delete"
//                           style={{
//                             background: "rgba(220,38,38,0.1)",
//                             color: "#dc2626",
//                             border: "none",
//                             padding: "clamp(6px, 1.5vw, 8px)",
//                             borderRadius: "8px",
//                             cursor: "pointer",
//                             minHeight: "clamp(32px, 7vw, 36px)",
//                             minWidth: "clamp(32px, 7vw, 36px)",
//                             display: "flex",
//                             alignItems: "center",
//                             justifyContent: "center",
//                           }}
//                         >
//                           <Trash2 size={18} />
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// }


// const payrollStyle = `
//   :root {
//     --primary: #3b82f6;
//     --success: #059669;
//     --warning: #d97706;
//     --danger: #dc2626;
//     --bg: #e5e7eb;
//     --card: #ffffff;
//     --text: #111827;
//     --dim: #4b5563;
//     --border: #d1d5db;
//   }

//   .payroll-container {
//     color: var(--text);
//     min-height: 100vh;
//     padding: clamp(16px, 4vw, 24px);
//     font-family: Inter, system-ui, sans-serif;
  
//   }

//   .loading {
//     text-align: center;
//     padding: 40px;
//     font-size: 16px;
//     color: var(--dim);
//   }

//   .main-card {
//     max-width: 1100px;
//     margin: 0 auto;
//     background: var(--card);
//     border-radius: 16px;
//     padding: clamp(20px, 5vw, 28px);
//     border: 1px solid var(--border);
//     box-sizing: border-box;
//   }

//   .header {
//     display: flex;
//     justify-content: space-between;
//     align-items: center;
//     flex-wrap: wrap;
//     gap: clamp(12px, 3vw, 20px);
//     margin-bottom: clamp(20px, 5vw, 32px);
//     padding: clamp(12px, 3vw, 16px) clamp(14px, 3.5vw, 20px);
//     background: #ffffff;
//     border-radius: 12px;
//     border: 1px solid var(--border);
//   }

//   h1 {
//     margin: 0;
//     font-size: clamp(22px, 6vw, 28px);
//     font-weight: 800;
//     color: var(--text);
//   }

//   .subtitle {
//     color: var(--dim);
//     margin-top: 4px;
//     font-size: clamp(12px, 3.2vw, 14px);
//   }

//   .total-box {
//     background: #f9fafb;
//     padding: clamp(10px, 2.5vw, 12px) clamp(16px, 4vw, 24px);
//     border-radius: 12px;
//     border: 1px solid var(--border);
//     text-align: center;
//   }

//   .total-amount {
//     font-size: clamp(18px, 5vw, 22px);
//     font-weight: 800;
//     color: var(--success);
//   }

//   .add-form {
//     background: #f9fafb;
//     border: 1px solid var(--border);
//     padding: clamp(16px, 4vw, 24px);
//     border-radius: 12px;
//     margin-bottom: clamp(20px, 5vw, 32px);
//   }

//   .form-header {
//     display: flex;
//     justify-content: space-between;
//     align-items: center;
//     margin-bottom: clamp(14px, 3.5vw, 20px);
//   }

//   .add-form h3 {
//     margin: 0;
//     color: var(--text);
//     font-size: clamp(16px, 4.5vw, 18px);
//     font-weight: 700;
//   }

//   .cancel-btn {
//     background: var(--warning);
//     color: white;
//     border: none;
//     padding: 8px 16px;
//     border-radius: 6px;
//     font-size: 13px;
//     font-weight: 600;
//     cursor: pointer;
//     transition: all 0.2s;
//   }

//   .cancel-btn:hover {
//     background: #b45309;
//   }

//   .form-fields {
//     display: grid;
//     grid-template-columns: repeat(auto-fit, minmax(clamp(180px, 100%, 220px), 1fr));
//     gap: clamp(14px, 3.5vw, 20px);
//   }

//   .field label {
//     font-size: clamp(10px, 2.5vw, 12px);
//     margin-bottom: clamp(4px, 1vw, 6px);
//     display: block;
//     color: var(--dim);
//     font-weight: 600;
//     text-transform: uppercase;
//   }

//   .field input,
//   .field select {
//     width: 100%;
//     padding: clamp(8px, 2vw, 10px) clamp(10px, 2.5vw, 12px);
//     background: #ffffff;
//     border: 1px solid var(--border);
//     color: var(--text);
//     border-radius: 8px;
//     font-size: clamp(13px, 3.5vw, 14px);
//     box-sizing: border-box;
//     transition: border-color 0.2s;
//   }

//   .field input:focus,
//   .field select:focus {
//     outline: none;
//     border-color: var(--primary);
//     box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
//   }

//   .submit-button {
//     background: var(--primary);
//     color: white;
//     border: none;
//     padding: clamp(10px, 2.5vw, 12px) clamp(18px, 4vw, 24px);
//     border-radius: 8px;
//     font-weight: 700;
//     cursor: pointer;
//     width: 100%;
//     font-size: clamp(13px, 3.5vw, 15px);
//     margin-top: clamp(18px, 4vw, 28px);
//     min-height: clamp(36px, 8vw, 44px);
//     transition: all 0.2s;
//   }

//   .submit-button:hover:not(:disabled) {
//     background: #2563eb;
//     transform: translateY(-1px);
//   }

//   .submit-button:disabled {
//     background: #9ca3af;
//     cursor: not-allowed;
//     transform: none;
//   }

//   .list-title {
//     font-size: clamp(18px, 5vw, 20px);
//     font-weight: 700;
//     margin: clamp(20px, 5vw, 32px) 0 clamp(10px, 2.5vw, 16px);
//     color: var(--text);
//   }

//   .modal-overlay {
//     position: fixed;
//     inset: 0;
//     background: rgba(0,0,0,0.6);
//     backdrop-filter: blur(4px);
//     display: flex;
//     align-items: flex-start;
//     justify-content: center;
//     z-index: 1000;
//     padding: clamp(20px, 4vw, 40px);
//     overflow-y: auto;
//   }

//   .slip-modal {
//     background: #ffffff;
//     width: 100%;
//     max-width: 820px;
//     border-radius: 12px;
//     overflow: hidden;
//     box-shadow: 0 20px 50px rgba(0,0,0,0.25);
//   }

//   .slip-document {
//     padding: clamp(30px, 5vw, 50px) clamp(30px, 5vw, 60px);
//     background: white;
//     position: relative;
//     color: #111827;
//     box-sizing: border-box;
//   }

//   .slip-document::before {
//     content: "OFFICIAL";
//     position: absolute;
//     top: 50%;
//     left: 50%;
//     transform: translate(-50%, -50%) rotate(-45deg);
//     font-size: clamp(80px, 20vw, 140px);
//     font-weight: 900;
//     color: rgba(0,0,0,0.03);
//     pointer-events: none;
//   }

//   .company-header {
//     display: flex;
//     justify-content: space-between;
//     align-items: flex-start;
//     margin-bottom: clamp(24px, 5vw, 40px);
//     border-bottom: 3px solid #1d4ed8;
//     padding-bottom: clamp(14px, 3.5vw, 20px);
//     gap: clamp(12px, 3vw, 20px);
//     flex-wrap: wrap;
//   }

//   .company-block {
//     display: flex;
//     align-items: center;
//     gap: clamp(14px, 3.5vw, 24px);
//   }

//   .logo-placeholder {
//     width: clamp(60px, 15vw, 90px);
//     height: clamp(60px, 15vw, 90px);
//   }

//   .company-details h2 {
//     margin: 0;
//     font-size: clamp(20px, 5.5vw, 26px);
//     color: #111827;
//     text-transform: uppercase;
//     letter-spacing: 1.2px;
//   }

//   .company-details p {
//     margin: 4px 0;
//     font-size: clamp(11px, 3vw, 13px);
//     color: #4b5563;
//   }

//   .slip-title-block {
//     display: flex;
//     justify-content: space-between;
//     align-items: flex-end;
//     margin-bottom: clamp(20px, 5vw, 35px);
//     gap: clamp(12px, 3vw, 20px);
//     flex-wrap: wrap;
//   }

//   .slip-title-block h1 {
//     margin: 0;
//     font-size: clamp(24px, 6.5vw, 32px);
//     color: #111827;
//     border-left: 6px solid #1d4ed8;
//     padding-left: clamp(12px, 3vw, 18px);
//   }

//   .meta-info {
//     text-align: right;
//     font-size: clamp(12px, 3.2vw, 14px);
//     color: #4b5563;
//   }

//   .info-grid {
//     display: grid;
//     grid-template-columns: 1fr 1fr;
//     gap: clamp(24px, 6vw, 40px);
//     background: #f9fafb;
//     padding: clamp(16px, 4vw, 24px);
//     border-radius: 8px;
//     margin-bottom: clamp(24px, 5vw, 35px);
//     border: 1px solid #e5e7eb;
//   }

//   .info-grid h3 {
//     margin: 0 0 clamp(8px, 2vw, 12px);
//     font-size: clamp(12px, 3.2vw, 14px);
//     text-transform: uppercase;
//     color: #1d4ed8;
//     border-bottom: 1px solid #cbd5e1;
//     padding-bottom: clamp(4px, 1vw, 6px);
//   }

//   .info-grid p {
//     margin: clamp(4px, 1vw, 6px) 0;
//     font-size: clamp(12px, 3.2vw, 13.5px);
//     color: #111827;
//   }

//   .table-container {
//     overflow-x: auto;
//     background: white;
//     border-radius: 12px;
//     border: 1px solid var(--border);
//   }

//   table {
//     width: 100%;
//     border-collapse: separate;
//     border-spacing: 0;
//   }

//   thead th {
//     background: #f9fafb;
//     padding: clamp(10px, 2.5vw, 16px);
//     text-align: left;
//     font-weight: 600;
//     color: #4b5563;
//     font-size: clamp(10px, 2.5vw, 12px);
//     text-transform: uppercase;
//     border-bottom: 1px solid #e5e7eb;
//   }

//   tbody tr {
//     transition: background 0.15s;
//   }

//   tbody tr.paid-row {
//     background-color: #ecfdf5;
//   }

//   tbody td {
//     padding: clamp(10px, 2.5vw, 16px);
//     vertical-align: middle;
//     border-bottom: 1px solid #e5e7eb;
//     font-size: clamp(12px, 3.2vw, 14px);
//   }

//   tbody tr:last-child td {
//     border-bottom: none;
//   }

//   .action-group {
//     display: flex;
//     gap: clamp(6px, 1.5vw, 8px);
//     justify-content: center;
//     flex-wrap: wrap;
//   }

//   .slip-table {
//     width: 100%;
//     border-collapse: collapse;
//   }

//   .slip-table th {
//     background: #f3f4f6;
//     padding: clamp(10px, 2.5vw, 12px) clamp(12px, 3vw, 16px);
//     text-align: left;
//     font-size: clamp(11px, 3vw, 12px);
//     text-transform: uppercase;
//     color: #4b5563;
//     border-bottom: 1px solid #d1d5db;
//   }

//   .slip-table td {
//     padding: clamp(10px, 2.5vw, 12px) clamp(12px, 3vw, 16px);
//     font-size: clamp(12px, 3.2vw, 13.5px);
//     border-bottom: 1px solid #e5e7eb;
//     color: #111827;
//   }

//   .slip-table .total {
//     background: #f9fafb;
//     font-weight: 700;
//   }

//   .net-pay-box {
//     background: #1d4ed8;
//     color: white;
//     padding: clamp(12px, 3vw, 16px) clamp(16px, 4vw, 24px);
//     display: flex;
//     justify-content: space-between;
//     align-items: center;
//     margin: clamp(20px, 5vw, 35px) 0;
//     border-radius: 10px;
//     font-size: clamp(14px, 3.5vw, 18px);
//     flex-wrap: wrap;
//     gap: clamp(12px, 3vw, 16px);
//   }

//   .net-label {
//     font-weight: 600;
//     letter-spacing: 0.5px;
//     font-size: clamp(13px, 3.5vw, 16px);
//   }

//   .net-value {
//     font-size: clamp(20px, 6vw, 28px);
//     font-weight: 800;
//   }

//   .footer-note {
//     margin-top: clamp(30px, 7vw, 50px);
//     text-align: center;
//     font-size: clamp(10px, 2.5vw, 12px);
//     color: #6b7280;
//     font-style: italic;
//   }

//   .modal-actions {
//     display: flex;
//     gap: clamp(10px, 2.5vw, 16px);
//     justify-content: center;
//     padding: clamp(16px, 4vw, 24px) clamp(24px, 5vw, 40px);
//     background: #f9fafb;
//     border-top: 1px solid #d1d5db;
//     flex-wrap: wrap;
//   }

//   .action-btn {
//     padding: clamp(10px, 2.5vw, 12px) clamp(20px, 4vw, 28px);
//     font-size: clamp(12px, 3.2vw, 14px);
//     font-weight: 600;
//     border: none;
//     border-radius: 8px;
//     cursor: pointer;
//     min-width: clamp(120px, 25vw, 150px);
//     transition: all 0.2s;
//   }

//   .action-btn.pdf {
//     background: #1d4ed8;
//     color: white;
//   }

//   .action-btn.close {
//     background: #6b7280;
//     color: white;
//   }

//   @media print {
//     .no-print { display: none !important; }
//     .modal-overlay { background: white !important; padding: 0; }
//     .slip-modal { box-shadow: none; border: none; border-radius: 0; max-width: none; }
//     .slip-document { padding: 40px 50px; }
//     .net-pay-box { border: 2px solid #000 !important; background: #f9fafb !important; color: #000 !important; }
//     @page {
//       size: A4;
//       margin: 12mm;
//     }
//   }

//   @media (max-width: 768px) {
//     .form-fields {
//       grid-template-columns: 1fr;
//     }
//   }
// `;
import React, { useState, useEffect, useMemo, useRef } from "react";
import axios from "axios";
import logo from "../assets/sps-logo.png";
import html2pdf from "html2pdf.js";
import { Eye, Edit, Trash2 } from "lucide-react";

export default function SalaryManager() {
  const API_URL =
    "https://accounts-sps-backend-git-main-secure-path-solutions-projects.vercel.app/api/salaries";

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
  const [bank, setBank] = useState("");
  const [status, setStatus] = useState("Paid");

  const [selectedSlip, setSelectedSlip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const formRef = useRef(null);

  const banks = ["HBL", "Bank Islami"];
  const statusOptions = ["Paid", "Unpaid"];
  const designations = ["Staff", "Manager", "Store", "Employee", "Accountant"];
  const paymentModes = ["Cash", "Online", "Cheque", "Bank Transfer"];

  useEffect(() => {
    fetchSalaries();
  }, []);

  const fetchSalaries = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_URL);
      setSalaries(res.data || []);
    } catch (err) {
      console.error("Error fetching salaries:", err);
      alert("Records load nahi ho rahe");
    } finally {
      setLoading(false);
    }
  };

  const totalPayroll = useMemo(() => {
    return salaries
      .filter((s) => s.status === "Paid")
      .reduce((acc, s) => acc + Number(s.amount || 0), 0);
  }, [salaries]);

  const loadForEdit = (salary) => {
    setEmpName(salary.employeeName || "");
    setSalaryAmount(String(salary.amount || ""));
    setSalaryMonth(
      salary.month || new Date().toLocaleString("default", { month: "long" })
    );
    setPaymentDate(
      salary.paymentDate?.slice(0, 10) || new Date().toISOString().slice(0, 10)
    );
    setDesignation(salary.designation || "Staff");
    setPaymentMode(salary.paymentMethod || "Cash");
    setBank(salary.bank || "");
    setStatus(salary.status || "Paid");
    setEditingId(salary._id);

    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);
  };

  const resetForm = () => {
    setEmpName("");
    setSalaryAmount("");
    setSalaryMonth(new Date().toLocaleString("default", { month: "long" }));
    setPaymentDate(new Date().toISOString().slice(0, 10));
    setDesignation("Staff");
    setPaymentMode("Cash");
    setBank("");
    setStatus("Paid");
    setEditingId(null);
  };

  const saveSalary = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    if (!empName.trim()) {
      alert("Employee name daal do");
      setIsSaving(false);
      return;
    }

    const rawAmount = salaryAmount.trim().replace(/[^0-9]/g, "");
    if (!rawAmount) {
      alert("Amount daal do");
      setIsSaving(false);
      return;
    }

    const amountValue = parseInt(rawAmount, 10);
    if (isNaN(amountValue) || amountValue <= 0) {
      alert("Valid positive amount daalo");
      setIsSaving(false);
      return;
    }

    const payload = {
      employeeName: empName.trim(),
      designation,
      amount: amountValue,
      month: salaryMonth,
      paymentDate,
      paymentMethod: paymentMode,
      status,
    };

    if (paymentMode !== "Cash" && bank.trim()) {
      payload.bank = bank.trim();
    }

    try {
      let updatedSalaries;
      let newSalary;

      if (editingId) {
        const res = await axios.put(`${API_URL}/${editingId}`, payload);
        newSalary = res.data.salary || res.data;
        updatedSalaries = salaries.map((s) =>
          s._id === editingId ? newSalary : s
        );
      } else {
        const res = await axios.post(API_URL, payload);
        newSalary = res.data.salary || res.data;
        updatedSalaries = [newSalary, ...salaries];
      }

      setSalaries(updatedSalaries);
      resetForm();
      alert(
        editingId
          ? "Salary updated successfully!"
          : "Salary added successfully!"
      );
    } catch (err) {
      console.error("Error saving salary:", err);
      alert(
        err.response?.data?.error ||
          (editingId ? "Update failed" : "Save failed")
      );
    } finally {
      setIsSaving(false);
    }
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
      margin: [8, 8, 8, 8], // ← width ke liye margin kam kiya
      filename: `Salary-Slip-${selectedSlip.employeeName}-${selectedSlip.month}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2.2,           // ← zyada scale = better clarity + width handling
        useCORS: true,
        width: 794,           // A4 @96dpi ≈ 794px
        windowWidth: 794      // ← important for correct rendering width
      },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
    };
    html2pdf().set(opt).from(element).save();
  };

  const formatAmount = (amt) => Number(amt || 0).toLocaleString("en-PK");

  const getBankColor = (b) => {
    const map = {
      HBL: "#047857",
      "Bank Islami": "#1e40af",
      Other: "#6b7280"
    };
    return map[b] || "#6b7280";
  };

  const getPaymentModeColor = (mode) => {
    const map = {
      Cash: "#ea580c",
      Online: "#2563eb",
      Cheque: "#d97706",
      "Bank Transfer": "#1d4ed8"
    };
    return map[mode] || "#6b7280";
  };

  const getStatusStyle = (stat) => {
    return stat === "Paid"
      ? { color: "#059669", bg: "#ecfdf5" }
      : { color: "#b45309", bg: "#fffbeb" };
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
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain"
                      }}
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
                    Payment Date:{" "}
                    {new Date(selectedSlip.paymentDate).toLocaleDateString("en-PK")}
                  </p>
                  <p>
                    Status:{" "}
                    <strong
                      style={{
                        color: selectedSlip.status === "Paid" ? "#059669" : "#b45309"
                      }}
                    >
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
                      {selectedSlip.paymentMethod === "Cash" || !selectedSlip.bank?.trim()
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
              <button
                className="action-btn close"
                onClick={() => setSelectedSlip(null)}
              >
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
            <div className="total-amount">Rs {formatAmount(totalPayroll)}</div>
          </div>
        </header>

        <form ref={formRef} className="add-form" onSubmit={saveSalary}>
          <div className="form-header">
            <h3>{editingId ? "Edit Salary Record" : "New Salary Record"}</h3>
            {editingId && (
              <button type="button" className="cancel-btn" onClick={resetForm}>
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
                onChange={(e) =>
                  setSalaryAmount(e.target.value.replace(/[^0-9]/g, ""))
                }
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
                  "July", "August", "September", "October", "November", "December"
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
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label>Payment Mode</label>
              <select
                value={paymentMode}
                onChange={(e) => {
                  const mode = e.target.value;
                  setPaymentMode(mode);
                  if (mode === "Cash") setBank("");
                }}
              >
                {paymentModes.map((mode) => (
                  <option key={mode} value={mode}>
                    {mode}
                  </option>
                ))}
              </select>
            </div>

            {paymentMode !== "Cash" && (
              <div className="field">
                <label>Bank</label>
                <select value={bank} onChange={(e) => setBank(e.target.value)}>
                  <option value="">Select Bank</option>
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
              <button
                type="submit"
                className="submit-button"
                disabled={isSaving}
              >
                {isSaving
                  ? "Saving..."
                  : editingId
                  ? "Update Record"
                  : "Add Record"}
              </button>
            </div>
          </div>
        </form>

        <div className="list-title">Payment Ledger</div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Designation</th>
                <th>Month</th>
                <th>Status</th>
                <th>Mode</th>
                <th style={{ minWidth: "clamp(100px, 15vw, 140px)" }}>Bank</th>
                <th style={{ textAlign: "right" }}>Amount</th>
                <th style={{ textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {salaries.map((s) => {
                const isPaid = (s.status || "Unpaid") === "Paid";

                return (
                  <tr key={s._id} className={isPaid ? "paid-row" : ""}>
                    <td style={{ fontWeight: 600 }}>{s.employeeName || "—"}</td>
                    <td>{s.designation || "—"}</td>
                    <td>{s.month || "—"}</td>
                    <td>
                      <span
                        style={{
                          padding: "clamp(3px, 1vw, 4px) clamp(8px, 2vw, 12px)",
                          borderRadius: "20px",
                          fontSize: "clamp(10px, 2.5vw, 12px)",
                          fontWeight: 600,
                          backgroundColor: getStatusStyle(s.status || "Unpaid").bg,
                          color: getStatusStyle(s.status || "Unpaid").color
                        }}
                      >
                        {s.status || "Unpaid"}
                      </span>
                    </td>
                    <td>
                      <span
                        style={{
                          padding: "clamp(3px, 1vw, 4px) clamp(8px, 2vw, 12px)",
                          borderRadius: "20px",
                          fontSize: "clamp(10px, 2.5vw, 12px)",
                          fontWeight: 600,
                          color: "white",
                          backgroundColor: getPaymentModeColor(s.paymentMethod || "Cash")
                        }}
                      >
                        {s.paymentMethod || "Cash"}
                      </span>
                    </td>
                    <td>
                      {s.paymentMethod === "Cash" || !s.bank?.trim() ? (
                        "—"
                      ) : (
                        <span
                          style={{
                            padding: "clamp(3px, 1vw, 4px) clamp(8px, 2vw, 12px)",
                            borderRadius: "20px",
                            fontSize: "clamp(10px, 2.5vw, 12px)",
                            fontWeight: 600,
                            color: "white",
                            backgroundColor: getBankColor(s.bank),
                            whiteSpace: "nowrap",
                            display: "inline-block"
                          }}
                        >
                          {s.bank}
                        </span>
                      )}
                    </td>
                    <td style={{ textAlign: "right", fontWeight: 700, color: "#374151" }}>
                      Rs {formatAmount(s.amount)}
                    </td>
                    <td>
                      <div className="action-group">
                        <button
                          onClick={() => setSelectedSlip(s)}
                          title="View Payslip"
                          style={{
                            background: "rgba(37,99,235,0.1)",
                            color: "#2563eb",
                            border: "none",
                            padding: "clamp(6px, 1.5vw, 8px)",
                            borderRadius: "8px",
                            cursor: "pointer",
                            minHeight: "clamp(32px, 7vw, 36px)",
                            minWidth: "clamp(32px, 7vw, 36px)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }}
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => loadForEdit(s)}
                          title="Edit"
                          style={{
                            background: "rgba(180,83,9,0.1)",
                            color: "#b45309",
                            border: "none",
                            padding: "clamp(6px, 1.5vw, 8px)",
                            borderRadius: "8px",
                            cursor: "pointer",
                            minHeight: "clamp(32px, 7vw, 36px)",
                            minWidth: "clamp(32px, 7vw, 36px)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }}
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => deleteRecord(s._id)}
                          title="Delete"
                          style={{
                            background: "rgba(220,38,38,0.1)",
                            color: "#dc2626",
                            border: "none",
                            padding: "clamp(6px, 1.5vw, 8px)",
                            borderRadius: "8px",
                            cursor: "pointer",
                            minHeight: "clamp(32px, 7vw, 36px)",
                            minWidth: "clamp(32px, 7vw, 36px)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

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
    max-width: 840px;           /* ← width barha di */
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 20px 50px rgba(0,0,0,0.25);
  }

  .slip-document {
    padding: 40px 55px 50px 55px;   /* ← left-right padding zyada → wide feel */
    background: white;
    position: relative;
    color: #111827;
    box-sizing: border-box;
    max-width: 210mm;               /* A4 width */
    margin: 0 auto;
    width: 100%;
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
    display: flex;
    gap: 30px;                      /* ← tables ke beech gap barhaya */
    margin: 30px 0;
    flex-wrap: wrap;
  }

  .table-wrapper {
    flex: 1;
    min-width: 280px;
  }

  .slip-table {
    width: 100%;
    border-collapse: collapse;
  }

  .slip-table th {
    background: #f3f4f6;
    padding: 12px 18px;             /* ← padding barhaya */
    text-align: left;
    font-size: clamp(11px, 3vw, 12px);
    text-transform: uppercase;
    color: #4b5563;
    border-bottom: 1px solid #d1d5db;
  }

  .slip-table td {
    padding: 12px 18px;             /* ← padding barhaya */
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
    padding: 18px 30px;             /* ← zyada padding */
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

  .table-container {
    overflow-x: auto;
    background: white;
    border-radius: 12px;
    border: 1px solid var(--border);
  }

  table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
  }

  thead th {
    background: #f9fafb;
    padding: clamp(10px, 2.5vw, 16px);
    text-align: left;
    font-weight: 600;
    color: #4b5563;
    font-size: clamp(10px, 2.5vw, 12px);
    text-transform: uppercase;
    border-bottom: 1px solid #e5e7eb;
  }

  tbody tr {
    transition: background 0.15s;
  }

  tbody tr.paid-row {
    background-color: #ecfdf5;
  }

  tbody td {
    padding: clamp(10px, 2.5vw, 16px);
    vertical-align: middle;
    border-bottom: 1px solid #e5e7eb;
    font-size: clamp(12px, 3.2vw, 14px);
  }

  tbody tr:last-child td {
    border-bottom: none;
  }

  .action-group {
    display: flex;
    gap: clamp(6px, 1.5vw, 8px);
    justify-content: center;
    flex-wrap: wrap;
  }

  @media print {
    .no-print { display: none !important; }
    .modal-overlay { background: white !important; padding: 0; }
    .slip-modal { box-shadow: none; border: none; border-radius: 0; max-width: none; }
    .slip-document { padding: 40px 50px; }
    .net-pay-box { border: 2px solid #000 !important; background: #f9fafb !important; color: #000 !important; }
    @page {
      size: A4;
      margin: 10mm;               /* print margin bhi thoda adjust */
    }
  }

  @media (max-width: 768px) {
    .form-fields {
      grid-template-columns: 1fr;
    }
    .tables-container {
      flex-direction: column;
      gap: 20px;
    }
  }
`;