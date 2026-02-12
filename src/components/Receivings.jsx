// import React, { useMemo, useState, useRef } from "react";
// import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";
// import { BANKS } from "../store";
// import Invoice from "./Invoice";
// import {
//   Search,
//   Download,
//   Edit,
//   Trash2,
//   Eye,
//   FileText,
//   Receipt as ReceiptIcon,
// } from "lucide-react";

// const CATEGORIES = ["Tracker", "Insurance", "IT Software", "Other"];

// function fmt(n) {
//   const x = Number(n);
//   return Number.isFinite(x) ? x.toLocaleString("en-US") : "0";
// }

// function formatMMDDYYYY(d) {
//   if (!d) return "";
//   const mm = String(d.getMonth() + 1).padStart(2, "0");
//   const dd = String(d.getDate()).padStart(2, "0");
//   const yy = d.getFullYear();
//   return `${mm}/${dd}/${yy}`;
// }

// function parseMMDDYYYY(str) {
//   if (!str) return new Date();
//   const parts = str.split("/");
//   if (parts.length === 3) {
//     const [mm, dd, yyyy] = parts;
//     return new Date(Number(yyyy), Number(mm) - 1, Number(dd));
//   }
//   return new Date();
// }

// export default function Receivings({ state, actions }) {
//   const [clientName, setClientName] = useState("");
//   const [clientAddress, setClientAddress] = useState("");
//   const [clientPhone, setClientPhone] = useState("");
//   const [selectedReceipt, setSelectedReceipt] = useState(null);
//   const [party, setParty] = useState("");
//   const [amount, setAmount] = useState("");
//   const [dateObj, setDateObj] = useState(new Date());
//   const [status, setStatus] = useState("PENDING");
//   const [bank, setBank] = useState(BANKS?.[0]?.key || "BANK_ISLAMI");
//   const [notes, setNotes] = useState("");
//   const [category, setCategory] = useState("");
//   const [customCategory, setCustomCategory] = useState("");
//   const [q, setQ] = useState("");
//   const [insuranceCover, setInsuranceCover] = useState("");
//   const [trackerCompany, setTrackerCompany] = useState("");
//   const [trackerType, setTrackerType] = useState("");
//   const [addonService, setAddonService] = useState("");
//   const [vehicleType, setVehicleType] = useState("");
//   const [registrationNo, setRegistrationNo] = useState("");
//   const [vehicleBrand, setVehicleBrand] = useState("");
//   const [chassisNumber, setChassisNumber] = useState("");
//   const [engineno, setEngineNo] = useState("");
//   const [agentName, setAgentName] = useState("");
//   const [paymentMode, setPaymentMode] = useState("Cash");
//   const [selected, setSelected] = useState(null);
//   const [editingId, setEditingId] = useState(null);

//   const formRef = useRef(null);
//   const previewRef = useRef(null);

//   const receivings = state?.receivings || [];

//   const handleCategoryChange = (val) => {
//     setCategory(val);
//     if (val !== "Tracker") {
//       setTrackerCompany("");
//       setTrackerType("");
//       setAddonService("");
//       setVehicleType("");
//       setRegistrationNo("");
//       setVehicleBrand("");
//       setChassisNumber("");
//       setEngineNo("");
//       setAgentName("");
//     }
//     if (val !== "Insurance") {
//       setInsuranceCover("");
//     }
//   };

//   const filtered = useMemo(() => {
//     const s = q.trim().toLowerCase();
//     if (!s) return receivings;
//     return receivings.filter((r) => {
//       const hay = [
//         r.clientName,
//         r.clientAddress,
//         r.clientPhone,
//         r.party,
//         r.notes,
//         r.status,
//         r.bank,
//         r.category,
//         r.date,
//         String(r.amount || ""),
//         r.trackerCompany,
//         r.trackerType,
//         r.addonService,
//         r.vehicleType,
//         r.registrationNo,
//         r.vehicleBrand,
//         r.chassisNumber,
//         r.engineNumber,
//         r.agentName,
//         r.paymentMode,
//       ]
//         .filter(Boolean)
//         .join(" ")
//         .toLowerCase();
//       return hay.includes(s);
//     });
//   }, [receivings, q]);

//   const totals = useMemo(() => {
//     let received = 0;
//     let pending = 0;
//     receivings.forEach((r) => {
//       const amt = Number(r.amount) || 0;
//       if ((r.status || "").toUpperCase() === "RECEIVED") received += amt;
//       else pending += amt;
//     });
//     return { received, pending, total: received + pending };
//   }, [receivings]);

//   const resetForm = () => {
//     setClientName("");
//     setClientAddress("");
//     setClientPhone("");
//     setParty("");
//     setAmount("");
//     setNotes("");
//     setStatus("PENDING");
//     setCategory("");
//     setCustomCategory("");
//     setDateObj(new Date());
//     setTrackerCompany("");
//     setTrackerType("");
//     setAddonService("");
//     setVehicleType("");
//     setRegistrationNo("");
//     setVehicleBrand("");
//     setChassisNumber("");
//     setEngineNo("");
//     setAgentName("");
//     setPaymentMode("Cash");
//     setInsuranceCover("");
//     setBank(BANKS?.[0]?.key || "BANK_ISLAMI");
//     setEditingId(null);
//   };

//   const loadRecordForEdit = (record) => {
//     setEditingId(record.id);
//     setClientName(record.clientName || "");
//     setClientAddress(record.clientAddress || "");
//     setClientPhone(record.clientPhone || "");
//     setParty(record.party || "");
//     setAmount(String(record.amount || ""));
//     setDateObj(parseMMDDYYYY(record.date));
//     setStatus(record.status || "PENDING");
//     setBank(record.bank || BANKS?.[0]?.key || "BANK_ISLAMI");
//     setNotes(record.notes || "");
//     setPaymentMode(record.paymentMode || "Cash");
//     setInsuranceCover(record.insuranceCover || "");

//     const knownCategories = ["Tracker", "Insurance", "IT Software"];
//     if (knownCategories.includes(record.category)) {
//       setCategory(record.category);
//       setCustomCategory("");
//     } else {
//       setCategory("Other");
//       setCustomCategory(record.category || "");
//     }

//     setTrackerCompany(record.trackerCompany || "");
//     setTrackerType(record.trackerType || "");
//     setAddonService(record.addonService || "");
//     setVehicleType(record.vehicleType || "");
//     setRegistrationNo(record.registrationNo || "");
//     setVehicleBrand(record.vehicleBrand || "");
//     setChassisNumber(record.chassisNumber || "");
//     setEngineNo(record.engineNumber || "");
//     setAgentName(record.agentName || "");

//     // Scroll to form (top)
//     setTimeout(() => {
//       if (formRef.current) {
//         formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
//       } else {
//         window.scrollTo({ top: 0, behavior: "smooth" });
//       }
//     }, 120);
//   };

//   const handleViewInvoice = (record) => {
//     setSelectedReceipt(null);
//     setSelected(record);
//     setTimeout(() => {
//       if (previewRef.current) {
//         previewRef.current.scrollIntoView({
//           behavior: "smooth",
//           block: "start",
//         });
//       }
//     }, 150);
//   };

//   const handleViewReceipt = (record) => {
//     setSelected(null);
//     setSelectedReceipt(record);
//     setTimeout(() => {
//       if (previewRef.current) {
//         previewRef.current.scrollIntoView({
//           behavior: "smooth",
//           block: "start",
//         });
//       }
//     }, 150);
//   };

//   const onAdd = (e) => {
//     e.preventDefault();
//     const cat = category === "Other" ? customCategory.trim() : category;

//     if (!clientName.trim()) return alert("Enter Client Name");
//     if (!clientAddress.trim()) return alert("Enter Client Address");
//     if (!clientPhone.trim() || !/^\d{10,13}$/.test(clientPhone.trim())) {
//       return alert("Enter Correct Phone Number");
//     }
//     if (!party.trim()) return alert("Enter Company / Party name");
//     if (!amount || Number(amount) <= 0) return alert("Enter Amount");
//     if (!dateObj) return alert("select Date");
//     if (!cat) return alert("Category select");
//     if (paymentMode !== "Cash" && !bank) {
//       return alert("Select Bank");
//     }
//     if (category === "Tracker") {
//       if (!trackerCompany) return alert("Select Tracker Company");
//       if (!trackerType) return alert("Select Tracker Type");
//       if (!vehicleType) return alert("Select Vehicle Type");
//       if (!registrationNo.trim()) return alert("Enter Registration Number");
//       if (!vehicleBrand.trim()) return alert("Enter Vehicle Brand");
//       if (!chassisNumber.trim()) return alert("Enter Chassis Number");
//       if (!engineno.trim()) return alert("Enter Engine Number");
//       if (!agentName.trim()) return alert("Enter Agent / Installer Name");
//     }
//     if (category === "Insurance") {
//       if (!insuranceCover) return alert("Select Insurance cover type");
//     }

//     const extra =
//       category === "Tracker"
//         ? {
//             trackerCompany,
//             trackerType,
//             addonService: addonService.trim() || null,
//             vehicleType,
//             registrationNo: registrationNo.trim().toUpperCase(),
//             vehicleBrand: vehicleBrand.trim(),
//             chassisNumber: chassisNumber.trim().toUpperCase(),
//             engineNumber: engineno.trim().toUpperCase(),
//             agentName: agentName.trim(),
//           }
//         : {};

//     const receivingData = {
//       clientName: clientName.trim(),
//       clientAddress: clientAddress.trim(),
//       clientPhone: clientPhone.trim(),
//       party: party.trim(),
//       amount: Number(amount),
//       date: formatMMDDYYYY(dateObj),
//       status,
//       bank: paymentMode === "Cash" ? null : bank,
//       notes: notes.trim(),
//       category: cat,
//       paymentMode,
//       insuranceCover: category === "Insurance" ? insuranceCover : null,
//       ...extra,
//     };

//     if (editingId) {
//       actions.updateReceiving(editingId, receivingData);
//     } else {
//       const newReceiving = { id: Date.now().toString(), ...receivingData };
//       actions.addReceiving(newReceiving);
//     }

//     resetForm();
//   };

//   const onExportCSV = () => {
//     const headers = [
//       "Date",
//       "Client Name",
//       "Client Address",
//       "Client Phone",
//       "Party",
//       "Category",
//       "Tracker Company",
//       "Tracker Type",
//       "Add-on Service",
//       "Vehicle Type",
//       "Registration No",
//       "Vehicle Brand",
//       "Chassis Number",
//       "Engine Number",
//       "Agent Name",
//       "Status",
//       "Bank",
//       "Payment Mode",
//       "Amount",
//       "Notes",
//     ];

//     const rows = filtered.map((r) => [
//       r.date || "",
//       `"${(r.clientName || "").replace(/"/g, '""')}"`,
//       `"${(r.clientAddress || "").replace(/"/g, '""')}"`,
//       r.clientPhone || "",
//       `"${(r.party || "").replace(/"/g, '""')}"`,
//       r.category || "",
//       r.trackerCompany || "",
//       r.trackerType || "",
//       r.addonService || "",
//       r.vehicleType || "",
//       r.registrationNo || "",
//       r.vehicleBrand || "",
//       r.chassisNumber || "",
//       r.engineNumber || "",
//       r.agentName || "",
//       r.status || "",
//       r.bank || "",
//       r.paymentMode || "Cash",
//       r.amount || "",
//       `"${(r.notes || "").replace(/"/g, '""').replace(/\n/g, " ")}"`,
//     ]);

//     const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
//     const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
//     const url = URL.createObjectURL(blob);
//     const link = document.createElement("a");
//     link.href = url;
//     link.download = `receivings_${new Date().toISOString().slice(0, 10)}.csv`;
//     link.click();
//     URL.revokeObjectURL(url);
//   };

//   const getCategoryColor = (cat) => {
//     const map = {
//       Tracker: "#7c3aed",
//       Insurance: "#dc2626",
//       "IT Software": "#2563eb",
//       Other: "#4b5563",
//     };
//     return map[cat] || "#4b5563";
//   };

//   const getStatusStyle = (stat) => {
//     return stat?.toUpperCase() === "RECEIVED"
//       ? { color: "#059669", bg: "#ecfdf5" }
//       : { color: "#b45309", bg: "#fffbeb" };
//   };

//   const getPaymentModeColor = (mode) => {
//     const map = { Cash: "#ea580c", Online: "#2563eb", Check: "#d97706" };
//     return map[mode] || "#6b7280";
//   };

//   return (
//     <div style={styles.container}>
//       <div style={styles.header}>
//         <div>
//           <h1 style={styles.title}>Receivings</h1>
//           <div style={styles.summary}>
//             Total: <strong>{fmt(totals.total)}</strong> • Received:{" "}
//             <strong>{fmt(totals.received)}</strong> • Pending:{" "}
//             <strong>{fmt(totals.pending)}</strong>
//           </div>
//         </div>
//         <div style={styles.headerActions}>
//           <input
//             style={styles.searchInput}
//             value={q}
//             onChange={(e) => setQ(e.target.value)}
//             placeholder="Search client, phone, party, reg#, chassis..."
//           />
//           <button style={styles.exportBtn} onClick={onExportCSV}>
//             Export CSV
//           </button>
//         </div>
//       </div>

//       <div style={styles.card}>
//         <h2 style={styles.cardTitle}>
//           {editingId ? "Edit Receiving" : "Add New Receiving"}
//         </h2>

//         {editingId && (
//           <div style={styles.editBanner}>
//             <span>Editing record...</span>
//             <button style={styles.cancelEditBtn} onClick={resetForm}>
//               Cancel Edit
//             </button>
//           </div>
//         )}

//         <form ref={formRef} onSubmit={onAdd}>
//           <div style={styles.formGrid3}>
//             <div style={styles.fieldWrapper}>
//               <label style={styles.label}>Client Name *</label>
//               <input
//                 style={styles.input}
//                 value={clientName}
//                 onChange={(e) => setClientName(e.target.value)}
//                 placeholder="Client name"
//                 required
//               />
//             </div>
//             <div style={styles.fieldWrapper}>
//               <label style={styles.label}>Client Address *</label>
//               <input
//                 style={styles.input}
//                 value={clientAddress}
//                 onChange={(e) => setClientAddress(e.target.value)}
//                 placeholder="Full address"
//                 required
//               />
//             </div>
//             <div style={styles.fieldWrapper}>
//               <label style={styles.label}>Client Phone *</label>
//               <input
//                 style={styles.input}
//                 value={clientPhone}
//                 onChange={(e) =>
//                   setClientPhone(e.target.value.replace(/[^0-9]/g, ""))
//                 }
//                 placeholder="03001234567"
//                 inputMode="tel"
//                 maxLength={13}
//                 required
//               />
//             </div>
//           </div>

//           <div style={styles.formGrid2}>
//             <div style={styles.fieldWrapper}>
//               <label style={styles.label}>Company / Party *</label>
//               <input
//                 style={styles.input}
//                 value={party}
//                 onChange={(e) => setParty(e.target.value)}
//                 placeholder="ABC Traders"
//                 required
//               />
//             </div>
//             <div style={styles.fieldWrapper}>
//               <label style={styles.label}>Amount (PKR) *</label>
//               <input
//                 style={styles.input}
//                 value={amount}
//                 onChange={(e) =>
//                   setAmount(e.target.value.replace(/[^0-9]/g, ""))
//                 }
//                 placeholder="145000"
//                 inputMode="numeric"
//                 required
//               />
//             </div>
//           </div>

//           <div style={styles.formGrid2}>
//             <div style={styles.fieldWrapper}>
//               <label style={styles.label}>Date *</label>
//               <DatePicker
//                 selected={dateObj}
//                 onChange={(d) => setDateObj(d || new Date())}
//                 dateFormat="MM/dd/yyyy"
//                 customInput={<input style={styles.input} />}
//                 required
//               />
//             </div>
//             <div style={styles.fieldWrapper}>
//               <label style={styles.label}>Status</label>
//               <select
//                 style={styles.select}
//                 value={status}
//                 onChange={(e) => setStatus(e.target.value)}
//               >
//                 <option value="PENDING">Pending</option>
//                 <option value="RECEIVED">Received</option>
//               </select>
//             </div>
//           </div>

//           <div style={styles.formGrid2}>
//             <div style={styles.fieldWrapper}>
//               <label style={styles.label}>Payment Mode *</label>
//               <select
//                 style={{
//                   ...styles.select,
//                   background:
//                     paymentMode === "Cash"
//                       ? "rgba(251,146,60,0.12)"
//                       : paymentMode === "Check"
//                         ? "rgba(139,92,246,0.12)"
//                         : "rgba(52,211,153,0.12)",
//                   color: "#111827",
//                 }}
//                 value={paymentMode}
//                 onChange={(e) => setPaymentMode(e.target.value)}
//                 required
//               >
//                 <option value="Cash">Cash</option>
//                 <option value="Online">Online</option>
//                 <option value="Check">Check</option>
//               </select>
//             </div>
//             <div style={styles.fieldWrapper}></div>
//           </div>

//           {paymentMode !== "Cash" && (
//             <div style={styles.formGrid2}>
//               <div style={styles.fieldWrapper}>
//                 <label style={styles.label}>Bank *</label>
//                 <select
//                   style={styles.select}
//                   value={bank}
//                   onChange={(e) => setBank(e.target.value)}
//                   required
//                 >
//                   {BANKS.filter((b) => b.key !== "CASH").map((b) => (
//                     <option key={b.key} value={b.key}>
//                       {b.label}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//               <div style={styles.fieldWrapper}></div>
//             </div>
//           )}

//           <div style={styles.formGrid2}>
//             <div style={styles.fieldWrapper}>
//               <label style={styles.label}>Category / Purpose *</label>
//               <select
//                 style={styles.select}
//                 value={category}
//                 onChange={(e) => handleCategoryChange(e.target.value)}
//                 required
//               >
//                 <option value="">Select type</option>
//                 {CATEGORIES.map((c) => (
//                   <option key={c} value={c}>
//                     {c}
//                   </option>
//                 ))}
//               </select>
//             </div>
//             <div style={styles.fieldWrapper}>
//               <label style={styles.label}>Notes</label>
//               <input
//                 style={styles.input}
//                 value={notes}
//                 onChange={(e) => setNotes(e.target.value)}
//                 placeholder="Optional notes..."
//               />
//             </div>
//           </div>

//           {category === "Other" && (
//             <div style={styles.formGrid2}>
//               <div style={styles.fieldWrapper}>
//                 <label style={styles.label}>Custom Category Name *</label>
//                 <input
//                   style={styles.input}
//                   value={customCategory}
//                   onChange={(e) => setCustomCategory(e.target.value)}
//                   placeholder="e.g. Health Insurance..."
//                   required
//                 />
//               </div>
//               <div style={styles.fieldWrapper}></div>
//             </div>
//           )}

//           {category === "Tracker" && (
//             <div style={styles.trackerCard}>
//               <div style={styles.trackerTitle}>
//                 Tracker Installation Details
//               </div>
//               <div style={styles.formGrid2}>
//                 <div style={styles.fieldWrapper}>
//                   <label style={styles.label}>Tracker Company *</label>
//                   <select
//                     style={styles.select}
//                     value={trackerCompany}
//                     onChange={(e) => setTrackerCompany(e.target.value)}
//                     required
//                   >
//                     <option value="">Select Company</option>
//                     <option value="TPL">TPL</option>
//                     <option value="Promaset">Promaset</option>
//                   </select>
//                 </div>
//                 <div style={styles.fieldWrapper}>
//                   <label style={styles.label}>Tracker Type *</label>
//                   <select
//                     style={styles.select}
//                     value={trackerType}
//                     onChange={(e) => setTrackerType(e.target.value)}
//                     required
//                   >
//                     <option value="">Select type</option>
//                     <option value="Simple Tracker (Rental)">
//                       Simple Tracker (Rental)
//                     </option>
//                     <option value="Simple Tracker (Cash)">
//                       Simple Tracker (Cash)
//                     </option>
//                     <option value="Simple OBD (Connector)">
//                       Simple OBD (Connector)
//                     </option>
//                     <option value="Voice OBD">Voice OBD</option>
//                     <option value="Voice Simple">Voice Simple</option>
//                     <option value="Video Surveillance Dashcam">
//                       Video Surveillance-Dashcam
//                     </option>
//                     <option value="Video Surveillance MDVR">
//                       Video Surveillance-MDVR
//                     </option>
//                     <option value="Fuel Gauge">Fuel Gauge</option>
//                   </select>
//                 </div>
//               </div>

//               <div style={styles.formGrid2}>
//                 <div style={styles.fieldWrapper}>
//                   <label style={styles.label}>Add-on Services</label>
//                   <select
//                     style={styles.select}
//                     value={addonService}
//                     onChange={(e) => setAddonService(e.target.value)}
//                   >
//                     <option value="">None</option>
//                     <option value="SMS">SMS</option>
//                     <option value="System Transfer">System Transfer</option>
//                     <option value="Ownership Change">Ownership Change</option>
//                   </select>
//                 </div>
//                 <div style={styles.fieldWrapper}>
//                   <label style={styles.label}>Vehicle Type *</label>
//                   <select
//                     style={styles.select}
//                     value={vehicleType}
//                     onChange={(e) => setVehicleType(e.target.value)}
//                     required
//                   >
//                     <option value="">Select vehicle type</option>
//                     <option value="Car">Car</option>
//                     <option value="Bike">Bike / Motorcycle</option>
//                     <option value="Rickshaw">Rickshaw</option>
//                     <option value="Truck">Truck / Heavy Vehicle</option>
//                   </select>
//                 </div>
//               </div>

//               <div style={styles.formGrid2}>
//                 <div style={styles.fieldWrapper}>
//                   <label style={styles.label}>Registration Number *</label>
//                   <input
//                     style={styles.input}
//                     value={registrationNo}
//                     onChange={(e) =>
//                       setRegistrationNo(e.target.value.toUpperCase())
//                     }
//                     placeholder="LEB-19-1234 or ABC-567"
//                     required
//                   />
//                 </div>
//                 <div style={styles.fieldWrapper}>
//                   <label style={styles.label}>Vehicle Brand *</label>
//                   <input
//                     style={styles.input}
//                     value={vehicleBrand}
//                     onChange={(e) => setVehicleBrand(e.target.value)}
//                     placeholder="Toyota, Honda, Suzuki..."
//                     required
//                   />
//                 </div>
//               </div>

//               <div style={styles.formGrid3}>
//                 <div style={styles.fieldWrapper}>
//                   <label style={styles.label}>Chassis Number *</label>
//                   <input
//                     style={styles.input}
//                     value={chassisNumber}
//                     onChange={(e) =>
//                       setChassisNumber(e.target.value.toUpperCase())
//                     }
//                     placeholder="JF53K-..."
//                     required
//                   />
//                 </div>
//                 <div style={styles.fieldWrapper}>
//                   <label style={styles.label}>Engine No *</label>
//                   <input
//                     style={styles.input}
//                     value={engineno}
//                     onChange={(e) => setEngineNo(e.target.value.toUpperCase())}
//                     placeholder="1NZ-FXE-..."
//                     required
//                   />
//                 </div>
//                 <div style={styles.fieldWrapper}>
//                   <label style={styles.label}>Agent / Installer Name *</label>
//                   <input
//                     style={styles.input}
//                     value={agentName}
//                     onChange={(e) => setAgentName(e.target.value)}
//                     placeholder="Ali Ahmed, Usman Installers..."
//                     required
//                   />
//                 </div>
//               </div>
//             </div>
//           )}

//           {category === "Insurance" && (
//             <div style={styles.formGrid2}>
//               <div style={styles.fieldWrapper}>
//                 <label style={styles.label}>Insurance Cover Type *</label>
//                 <select
//                   style={styles.select}
//                   value={insuranceCover}
//                   onChange={(e) => setInsuranceCover(e.target.value)}
//                   required
//                 >
//                   <option value="">Select Cover Type</option>
//                   <option value="Motor">Motor</option>
//                   <option value="Travel">Travel</option>
//                   <option value="Fire">Fire</option>
//                   <option value="Marine">Marine</option>
//                   <option value="Health">Health</option>
//                   <option value="Life">Life</option>
//                   <option value="Misc">Misc</option>
//                 </select>
//               </div>
//               <div style={styles.fieldWrapper}></div>
//             </div>
//           )}

//           <div style={styles.formActions}>
//             <button type="submit" style={styles.submitBtn}>
//               {editingId ? "Update Receiving" : "Add Receiving"}
//             </button>
//           </div>
//         </form>
//       </div>

//       <section style={styles.tableSection}>
//         <div style={styles.tableSectionHeader}>
//           <div style={{ position: "relative", flex: 1, minWidth: "280px" }}>
//             <Search
//               size={18}
//               style={{
//                 position: "absolute",
//                 left: 14,
//                 top: "50%",
//                 transform: "translateY(-50%)",
//                 color: "#6b7280",
//               }}
//             />
//             <input
//               placeholder="Search client, phone, party, category..."
//               value={q}
//               onChange={(e) => setQ(e.target.value)}
//               style={styles.searchInputTable}
//             />
//           </div>
//           <button
//             onClick={onExportCSV}
//             disabled={!receivings.length}
//             style={styles.exportBtnTable}
//           >
//             <Download size={16} /> Export CSV
//           </button>
//         </div>

//         {filtered.length === 0 ? (
//           <div style={styles.emptyState}>
//             <FileText size={48} style={{ opacity: 0.4, marginBottom: 16 }} />
//             <h3 style={{ fontSize: "clamp(14px, 4vw, 18px)" }}>
//               No records found
//             </h3>
//             <p style={{ marginTop: 8, fontSize: "clamp(12px, 3.5vw, 14px)" }}>
//               {q
//                 ? "Try different search terms"
//                 : "Add your first receiving above"}
//             </p>
//           </div>
//         ) : (
//           <div style={{ overflowX: "auto" }}>
//             <table style={styles.table}>
//               <thead>
//                 <tr style={{ background: "#f9fafb" }}>
//                   <th style={styles.th}>Date</th>
//                   <th style={styles.th}>Client</th>
//                   <th style={styles.th}>Category</th>
//                   <th style={styles.th}>Status</th>
//                   <th style={styles.th}>Mode</th>
//                   <th style={styles.th}>Bank</th>
//                   <th style={{ ...styles.th, textAlign: "right" }}>Amount</th>
//                   <th style={{ ...styles.th, textAlign: "center" }}>Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {filtered.map((r) => (
//                   <tr
//                     key={r.id}
//                     style={{
//                       background:
//                         r.status?.toUpperCase() === "RECEIVED"
//                           ? "#ecfdf5"
//                           : "#ffffff",
//                       transition: "background 0.15s",
//                     }}
//                   >
//                     <td style={styles.td}>{r.date}</td>
//                     <td style={{ ...styles.td, fontWeight: 600 }}>
//                       {r.clientName}
//                       <div style={styles.secondaryText}>{r.clientPhone}</div>
//                     </td>
//                     <td style={styles.td}>
//                       <span
//                         style={{
//                           padding: "4px 12px",
//                           borderRadius: "20px",
//                           fontSize: 12,
//                           fontWeight: 600,
//                           color: "white",
//                           backgroundColor: getCategoryColor(r.category),
//                         }}
//                       >
//                         {r.category}
//                       </span>
//                     </td>
//                     <td style={styles.td}>
//                       <span
//                         style={{
//                           padding: "4px 12px",
//                           borderRadius: "20px",
//                           fontSize: 12,
//                           fontWeight: 600,
//                           backgroundColor: getStatusStyle(r.status).bg,
//                           color: getStatusStyle(r.status).color,
//                         }}
//                       >
//                         {r.status}
//                       </span>
//                     </td>
//                     <td style={styles.td}>
//                       <span
//                         style={{
//                           padding: "4px 12px",
//                           borderRadius: "20px",
//                           fontSize: 12,
//                           fontWeight: 600,
//                           color: "white",
//                           backgroundColor: getPaymentModeColor(r.paymentMode),
//                         }}
//                       >
//                         {r.paymentMode || "Cash"}
//                       </span>
//                     </td>
//                     <td style={styles.td}>
//                       {r.paymentMode === "Cash" || !r.bank ? (
//                         "—"
//                       ) : (
//                         <span
//                           style={{
//                             padding: "4px 12px",
//                             borderRadius: "20px",
//                             fontSize: 12,
//                             fontWeight: 600,
//                             color: "white",
//                             backgroundColor: "#047857",
//                           }}
//                         >
//                           {r.bank}
//                         </span>
//                       )}
//                     </td>
//                     <td
//                       style={{
//                         ...styles.td,
//                         textAlign: "right",
//                         fontWeight: 700,
//                         color:
//                           r.status?.toUpperCase() === "RECEIVED"
//                             ? "#374151"
//                             : "#7c3aed",
//                         textDecoration:
//                           r.status?.toUpperCase() === "RECEIVED"
//                             ? "line-through"
//                             : "none",
//                       }}
//                     >
//                       Rs. {fmt(r.amount)}
//                     </td>
//                     <td
//                       style={{
//                         ...styles.td,
//                         display: "flex",
//                         gap: 8,
//                         justifyContent: "center",
//                         flexWrap: "wrap",
//                       }}
//                     >
//                       <button
//                         onClick={() => handleViewInvoice(r)}
//                         style={styles.actionBtn}
//                         title="View Invoice"
//                       >
//                         <Eye size={18} />
//                       </button>
//                       <button
//                         onClick={() => loadRecordForEdit(r)}
//                         style={{
//                           ...styles.actionBtn,
//                           background: "rgba(180,83,9,0.1)",
//                           color: "#b45309",
//                         }}
//                         title="Edit"
//                       >
//                         <Edit size={18} />
//                       </button>
//                       <button
//                         onClick={() => handleViewReceipt(r)}
//                         style={{
//                           ...styles.actionBtn,
//                           background: "rgba(5,150,105,0.1)",
//                           color: "#059669",
//                         }}
//                         title="View Receipt"
//                       >
//                         <ReceiptIcon size={18} />
//                       </button>
//                       <button
//                         onClick={() => actions.deleteReceiving(r.id)}
//                         style={{
//                           ...styles.actionBtn,
//                           background: "rgba(220,38,38,0.1)",
//                           color: "#dc2626",
//                         }}
//                         title="Delete"
//                       >
//                         <Trash2 size={18} />
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </section>

//       {(selected || selectedReceipt) && (
//         <div ref={previewRef} style={styles.card}>
//           <div style={styles.previewHeader}>
//             <h2 style={styles.cardTitle}>
//               {selected
//                 ? "Invoice / Voucher Preview"
//                 : "Official Payment Receipt"}
//             </h2>
//             <button
//               style={styles.closeBtn}
//               onClick={() => {
//                 setSelected(null);
//                 setSelectedReceipt(null);
//               }}
//             >
//               ✕ Close
//             </button>
//           </div>
//           <Invoice
//             record={selected || selectedReceipt}
//             companyName={state?.companyName || "Secure Path Solutions"}
//             mode={selected ? "voucher" : "receipt"}
//           />
//         </div>
//       )}
//     </div>
//   );
// }

// // ─── Styles ───
// const styles = {
//   container: {
//     padding: "clamp(16px, 4vw, 24px)",
//     maxWidth: 1400,
//     margin: "0 auto",
//     minHeight: "100vh",
//     fontFamily: "Inter, system-ui, sans-serif",
//   },
//   header: {
//     display: "flex",
//     justifyContent: "space-between",
//     alignItems: "flex-start",
//     flexWrap: "wrap",
//     gap: 20,
//     marginBottom: 32,
//   },
//   title: {
//     fontSize: "clamp(26px, 5vw, 34px)",
//     fontWeight: 800,
//     margin: 0,
//     color: "#111827",
//     letterSpacing: "-0.02em",
//   },
//   summary: {
//     fontSize: "clamp(14px, 3.5vw, 16px)",
//     color: "#4b5563",
//     marginTop: 8,
//     fontWeight: "500",
//   },
//   headerActions: {
//     display: "flex",
//     gap: 12,
//     flexWrap: "wrap",
//     alignItems: "center",
//   },
//   searchInput: {
//     padding: "10px 16px",
//     borderRadius: 12,
//     border: "1px solid #d1d5db",
//     minWidth: 280,
//     flex: 1,
//     fontSize: 15,
//     color: "#111827",
//     background: "#ffffff",
//     boxSizing: "border-box",
//   },
//   exportBtn: {
//     padding: "10px 20px",
//     borderRadius: 12,
//     background: "#fff",
//     border: "1px solid #d1d5db",
//     fontWeight: 600,
//     cursor: "pointer",
//     fontSize: 14,
//     color: "#374151",
//   },
//   card: {
//     background: "#ffffff",
//     borderRadius: 16,
//     border: "1px solid #d1d5db",
//     padding: "clamp(20px, 4vw, 28px)",
//     marginBottom: 32,
//     boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
//     boxSizing: "border-box",
//   },
//   cardTitle: {
//     fontSize: 22,
//     fontWeight: 700,
//     margin: "0 0 24px 0",
//     color: "#111827",
//   },
//   editBanner: {
//     background: "#fef3c7",
//     border: "1px solid #fbbf24",
//     borderRadius: 10,
//     padding: "12px 16px",
//     marginBottom: 20,
//     display: "flex",
//     justifyContent: "space-between",
//     alignItems: "center",
//     fontWeight: 600,
//     color: "#92400e",
//   },
//   cancelEditBtn: {
//     padding: "6px 14px",
//     background: "#fff",
//     border: "1px solid #fbbf24",
//     borderRadius: 8,
//     cursor: "pointer",
//     fontWeight: 600,
//     color: "#92400e",
//   },
//   fieldWrapper: {
//     display: "flex",
//     flexDirection: "column",
//   },
//   label: {
//     fontSize: "clamp(10px, 2.5vw, 12px)",
//     fontWeight: 700,
//     color: "#4b5563",
//     marginBottom: 8,
//     display: "block",
//     textTransform: "uppercase",
//     letterSpacing: 0.5,
//     marginLeft: 4,
//   },
//   input: {
//     width: "100%",
//     padding: "11px 14px",
//     borderRadius: 10,
//     border: "1px solid #d1d5db",
//     fontSize: 15,
//     background: "#f9fafb",
//     color: "#111827",
//     boxSizing: "border-box",
//   },
//   select: {
//     width: "100%",
//     padding: "11px 14px",
//     borderRadius: 10,
//     border: "1px solid #d1d5db",
//     background: "#f9fafb",
//     fontSize: 15,
//     color: "#111827",
//     appearance: "none",
//     boxSizing: "border-box",
//     backgroundImage:
//       "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'><path fill='%23334155' d='M1 1l5 5 5-5'/></svg>\")",
//     backgroundRepeat: "no-repeat",
//     backgroundPosition: "right 14px center",
//     cursor: "pointer",
//   },
//   formGrid2: {
//     display: "grid",
//     gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
//     gap: "20px 24px",
//     marginTop: 20,
//   },
//   formGrid3: {
//     display: "grid",
//     gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
//     gap: "20px 24px",
//     marginTop: 20,
//   },
//   trackerCard: {
//     marginTop: 28,
//     padding: 24,
//     background: "#f0f9ff",
//     border: "1px solid #bae6fd",
//     borderRadius: 16,
//   },
//   trackerTitle: {
//     fontSize: 19,
//     fontWeight: 700,
//     color: "#1e40af",
//     marginBottom: 16,
//   },
//   formActions: {
//     marginTop: 36,
//     textAlign: "right",
//   },
//   submitBtn: {
//     padding: "12px 40px",
//     background: "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)",
//     color: "white",
//     border: "none",
//     borderRadius: 12,
//     fontSize: 16,
//     fontWeight: 700,
//     cursor: "pointer",
//   },
//   tableSection: {
//     background: "#ffffff",
//     borderRadius: 16,
//     border: "1px solid #d1d5db",
//     padding: "clamp(16px, 4vw, 24px)",
//     boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
//     boxSizing: "border-box",
//     overflowX: "auto",
//   },
//   tableSectionHeader: {
//     display: "flex",
//     justifyContent: "space-between",
//     marginBottom: "clamp(16px, 4vw, 24px)",
//     gap: "clamp(10px, 2.5vw, 16px)",
//     flexWrap: "wrap",
//   },
//   searchInputTable: {
//     width: "100%",
//     padding:
//       "clamp(8px, 2vw, 10px) clamp(12px, 3vw, 16px) clamp(8px, 2vw, 10px) clamp(38px, 8vw, 44px)",
//     background: "#f9fafb",
//     border: "1px solid #d1d5db",
//     borderRadius: 10,
//     color: "#111827",
//     fontSize: "clamp(13px, 3.5vw, 16px)",
//     boxSizing: "border-box",
//   },
//   exportBtnTable: {
//     background: "#f3f4f6",
//     border: "1px solid #d1d5db",
//     color: "#374151",
//     padding: "clamp(8px, 2vw, 10px) clamp(14px, 3.5vw, 20px)",
//     borderRadius: 10,
//     cursor: "pointer",
//     display: "flex",
//     alignItems: "center",
//     gap: "clamp(6px, 1.5vw, 8px)",
//     fontWeight: 500,
//     fontSize: "clamp(12px, 3.2vw, 14px)",
//   },
//   emptyState: {
//     textAlign: "center",
//     padding: "clamp(40px, 10vw, 80px) clamp(12px, 3vw, 20px)",
//     color: "#6b7280",
//   },
//   table: {
//     width: "100%",
//     borderCollapse: "collapse",
//     tableLayout: "auto",
//     minWidth: "clamp(300px, 100%, 1100px)",
//   },
//   th: {
//     padding: "clamp(10px, 2.5vw, 16px)",
//     color: "#4b5563",
//     fontSize: "clamp(10px, 2.5vw, 12px)",
//     textTransform: "uppercase",
//     textAlign: "left",
//     borderBottom: "1px solid #e5e7eb",
//     fontWeight: 700,
//   },
//   td: {
//     padding: "clamp(10px, 2.5vw, 16px)",
//     borderBottom: "1px solid #e5e7eb",
//     fontSize: "clamp(12px, 3.2vw, 14px)",
//     color: "#111827",
//   },
//   secondaryText: {
//     fontSize: "12px",
//     color: "#6b7280",
//     marginTop: 4,
//     fontWeight: 400,
//   },
//   actionBtn: {
//     background: "rgba(37,99,235,0.1)",
//     color: "#2563eb",
//     border: "none",
//     padding: "clamp(6px, 1.5vw, 8px)",
//     borderRadius: 8,
//     cursor: "pointer",
//     minHeight: "clamp(32px, 7vw, 36px)",
//     minWidth: "clamp(32px, 7vw, 36px)",
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   previewHeader: {
//     display: "flex",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 20,
//     paddingBottom: 16,
//     borderBottom: "1px solid #e2e8f0",
//   },
//   closeBtn: {
//     padding: "8px 18px",
//     background: "#f1f5f9",
//     border: "1px solid #cbd5e1",
//     borderRadius: 10,
//     cursor: "pointer",
//     fontWeight: 600,
//   },
// };

import React, { useMemo, useState, useRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { BANKS } from "../store";
import Invoice from "./Invoice";
import {
  Search,
  Download,
  Edit,
  Trash2,
  Eye,
  FileText,
  Receipt as ReceiptIcon,
} from "lucide-react";

const CATEGORIES = ["Tracker", "Insurance", "IT Software", "Other"];

function fmt(n) {
  const x = Number(n);
  return Number.isFinite(x) ? x.toLocaleString("en-US") : "0";
}

function formatMMDDYYYY(d) {
  if (!d) return "";
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const yy = d.getFullYear();
  return `${mm}/${dd}/${yy}`;
}

function parseMMDDYYYY(str) {
  if (!str) return new Date();
  const parts = str.split("/");
  if (parts.length === 3) {
    const [mm, dd, yyyy] = parts;
    return new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  }
  return new Date();
}

export default function Receivings({ state, actions }) {
  const [clientName, setClientName] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [party, setParty] = useState("");
  const [amount, setAmount] = useState("");
  const [dateObj, setDateObj] = useState(new Date());
  const [status, setStatus] = useState("PENDING");
  const [bank, setBank] = useState(BANKS?.[0]?.key || "BANK_ISLAMI");
  const [notes, setNotes] = useState("");
  const [category, setCategory] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [q, setQ] = useState("");
  const [insuranceCover, setInsuranceCover] = useState("");
  const [trackerCompany, setTrackerCompany] = useState("");
  const [trackerType, setTrackerType] = useState("");
  const [addonService, setAddonService] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [registrationNo, setRegistrationNo] = useState("");
  const [vehicleBrand, setVehicleBrand] = useState("");
  const [chassisNumber, setChassisNumber] = useState("");
  const [engineno, setEngineNo] = useState("");
  const [agentName, setAgentName] = useState("");
  const [paymentMode, setPaymentMode] = useState("Cash");
  const [selected, setSelected] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const formRef = useRef(null);
  const previewRef = useRef(null);

  const receivings = state?.receivings || [];

  const handleCategoryChange = (val) => {
    setCategory(val);
    if (val !== "Tracker") {
      setTrackerCompany("");
      setTrackerType("");
      setAddonService("");
      setVehicleType("");
      setRegistrationNo("");
      setVehicleBrand("");
      setChassisNumber("");
      setEngineNo("");
      setAgentName("");
    }
    if (val !== "Insurance") {
      setInsuranceCover("");
    }
  };

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return receivings;
    return receivings.filter((r) => {
      const hay = [
        r.clientName,
        r.clientAddress,
        r.clientPhone,
        r.party,
        r.notes,
        r.status,
        r.bank,
        r.category,
        r.date,
        String(r.amount || ""),
        r.trackerCompany,
        r.trackerType,
        r.addonService,
        r.vehicleType,
        r.registrationNo,
        r.vehicleBrand,
        r.chassisNumber,
        r.engineNumber,
        r.agentName,
        r.paymentMode,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(s);
    });
  }, [receivings, q]);

  const totals = useMemo(() => {
    let received = 0;
    let pending = 0;
    receivings.forEach((r) => {
      const amt = Number(r.amount) || 0;
      if ((r.status || "").toUpperCase() === "RECEIVED") received += amt;
      else pending += amt;
    });
    return { received, pending, total: received + pending };
  }, [receivings]);

  const resetForm = () => {
    setClientName("");
    setClientAddress("");
    setClientPhone("");
    setParty("");
    setAmount("");
    setNotes("");
    setStatus("PENDING");
    setCategory("");
    setCustomCategory("");
    setDateObj(new Date());
    setTrackerCompany("");
    setTrackerType("");
    setAddonService("");
    setVehicleType("");
    setRegistrationNo("");
    setVehicleBrand("");
    setChassisNumber("");
    setEngineNo("");
    setAgentName("");
    setPaymentMode("Cash");
    setInsuranceCover("");
    setBank(BANKS?.[0]?.key || "BANK_ISLAMI");
    setEditingId(null);
  };

  const loadRecordForEdit = (record) => {
    setEditingId(record.id);
    setClientName(record.clientName || "");
    setClientAddress(record.clientAddress || "");
    setClientPhone(record.clientPhone || "");
    setParty(record.party || "");
    setAmount(String(record.amount || ""));
    setDateObj(parseMMDDYYYY(record.date));
    setStatus(record.status || "PENDING");
    setBank(record.bank || BANKS?.[0]?.key || "BANK_ISLAMI");
    setNotes(record.notes || "");
    setPaymentMode(record.paymentMode || "Cash");
    setInsuranceCover(record.insuranceCover || "");

    const knownCategories = ["Tracker", "Insurance", "IT Software"];
    if (knownCategories.includes(record.category)) {
      setCategory(record.category);
      setCustomCategory("");
    } else {
      setCategory("Other");
      setCustomCategory(record.category || "");
    }

    setTrackerCompany(record.trackerCompany || "");
    setTrackerType(record.trackerType || "");
    setAddonService(record.addonService || "");
    setVehicleType(record.vehicleType || "");
    setRegistrationNo(record.registrationNo || "");
    setVehicleBrand(record.vehicleBrand || "");
    setChassisNumber(record.chassisNumber || "");
    setEngineNo(record.engineNumber || "");
    setAgentName(record.agentName || "");

    // Scroll to form (top)
    setTimeout(() => {
      if (formRef.current) {
        formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }, 120);
  };

  const handleViewInvoice = (record) => {
    setSelectedReceipt(null);
    setSelected(record);
    setTimeout(() => {
      if (previewRef.current) {
        previewRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }, 150);
  };

  const handleViewReceipt = (record) => {
    setSelected(null);
    setSelectedReceipt(record);
    setTimeout(() => {
      if (previewRef.current) {
        previewRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }, 150);
  };

  const onAdd = (e) => {
    e.preventDefault();
    const cat = category === "Other" ? customCategory.trim() : category;

    if (!clientName.trim()) return alert("Enter Client Name");
    if (!clientAddress.trim()) return alert("Enter Client Address");
    if (!clientPhone.trim() || !/^\d{10,13}$/.test(clientPhone.trim())) {
      return alert("Enter Correct Phone Number");
    }
    if (!party.trim()) return alert("Enter Company / Party name");
    if (!amount || Number(amount) <= 0) return alert("Enter Amount");
    if (!dateObj) return alert("select Date");
    if (!cat) return alert("Category select");
    if (paymentMode !== "Cash" && !bank) {
      return alert("Select Bank");
    }
    if (category === "Tracker") {
      if (!trackerCompany) return alert("Select Tracker Company");
      if (!trackerType) return alert("Select Tracker Type");
      if (!vehicleType) return alert("Select Vehicle Type");
      if (!registrationNo.trim()) return alert("Enter Registration Number");
      if (!vehicleBrand.trim()) return alert("Enter Vehicle Brand");
      if (!chassisNumber.trim()) return alert("Enter Chassis Number");
      if (!engineno.trim()) return alert("Enter Engine Number");
      if (!agentName.trim()) return alert("Enter Agent / Installer Name");
    }
    if (category === "Insurance") {
      if (!insuranceCover) return alert("Select Insurance cover type");
    }

    const extra =
      category === "Tracker"
        ? {
            trackerCompany,
            trackerType,
            addonService: addonService.trim() || null,
            vehicleType,
            registrationNo: registrationNo.trim().toUpperCase(),
            vehicleBrand: vehicleBrand.trim(),
            chassisNumber: chassisNumber.trim().toUpperCase(),
            engineNumber: engineno.trim().toUpperCase(),
            agentName: agentName.trim(),
          }
        : {};

    const receivingData = {
      clientName: clientName.trim(),
      clientAddress: clientAddress.trim(),
      clientPhone: clientPhone.trim(),
      party: party.trim(),
      amount: Number(amount),
      date: formatMMDDYYYY(dateObj),
      status,
      bank: paymentMode === "Cash" ? null : bank,
      notes: notes.trim(),
      category: cat,
      paymentMode,
      insuranceCover: category === "Insurance" ? insuranceCover : null,
      ...extra,
    };

    if (editingId) {
      actions.updateReceiving(editingId, receivingData);
    } else {
      const newReceiving = { id: Date.now().toString(), ...receivingData };
      actions.addReceiving(newReceiving);
    }

    resetForm();
  };

  const onExportCSV = () => {
    const headers = [
      "Date",
      "Client Name",
      "Client Address",
      "Client Phone",
      "Party",
      "Category",
      "Tracker Company",
      "Tracker Type",
      "Add-on Service",
      "Vehicle Type",
      "Registration No",
      "Vehicle Brand",
      "Chassis Number",
      "Engine Number",
      "Agent Name",
      "Status",
      "Bank",
      "Payment Mode",
      "Amount",
      "Notes",
    ];

    const rows = filtered.map((r) => [
      r.date || "",
      `"${(r.clientName || "").replace(/"/g, '""')}"`,
      `"${(r.clientAddress || "").replace(/"/g, '""')}"`,
      r.clientPhone || "",
      `"${(r.party || "").replace(/"/g, '""')}"`,
      r.category || "",
      r.trackerCompany || "",
      r.trackerType || "",
      r.addonService || "",
      r.vehicleType || "",
      r.registrationNo || "",
      r.vehicleBrand || "",
      r.chassisNumber || "",
      r.engineNumber || "",
      r.agentName || "",
      r.status || "",
      r.bank || "",
      r.paymentMode || "Cash",
      r.amount || "",
      `"${(r.notes || "").replace(/"/g, '""').replace(/\n/g, " ")}"`,
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `receivings_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getCategoryColor = (cat) => {
    const map = {
      Tracker: "#7c3aed",
      Insurance: "#dc2626",
      "IT Software": "#2563eb",
      Other: "#4b5563",
    };
    return map[cat] || "#4b5563";
  };

  const getStatusStyle = (stat) => {
    return stat?.toUpperCase() === "RECEIVED"
      ? { color: "#059669", bg: "#ecfdf5" }
      : { color: "#b45309", bg: "#fffbeb" };
  };

  const getPaymentModeColor = (mode) => {
    const map = { Cash: "#ea580c", Online: "#2563eb", Check: "#d97706" };
    return map[mode] || "#6b7280";
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Receivings</h1>
          <div style={styles.summary}>
            Total: <strong>{fmt(totals.total)}</strong> • Received:{" "}
            <strong>{fmt(totals.received)}</strong> • Pending:{" "}
            <strong>{fmt(totals.pending)}</strong>
          </div>
        </div>
        <div style={styles.headerActions}>
          <input
            style={styles.searchInput}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search client, phone, party, reg#, chassis..."
          />
          <button style={styles.exportBtn} onClick={onExportCSV}>
            Export CSV
          </button>
        </div>
      </div>

      <div style={styles.card}>
        <h2 style={styles.cardTitle}>
          {editingId ? "Edit Receiving" : "Add New Receiving"}
        </h2>

        {editingId && (
          <div style={styles.editBanner}>
            <span>Editing record...</span>
            <button style={styles.cancelEditBtn} onClick={resetForm}>
              Cancel Edit
            </button>
          </div>
        )}

        <form ref={formRef} onSubmit={onAdd}>
          <div style={styles.formGrid3}>
            <div style={styles.fieldWrapper}>
              <label style={styles.label}>Client Name *</label>
              <input
                style={styles.input}
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Client name"
                required
              />
            </div>
            <div style={styles.fieldWrapper}>
              <label style={styles.label}>Client Address *</label>
              <input
                style={styles.input}
                value={clientAddress}
                onChange={(e) => setClientAddress(e.target.value)}
                placeholder="Full address"
                required
              />
            </div>
            <div style={styles.fieldWrapper}>
              <label style={styles.label}>Client Phone *</label>
              <input
                style={styles.input}
                value={clientPhone}
                onChange={(e) =>
                  setClientPhone(e.target.value.replace(/[^0-9]/g, ""))
                }
                placeholder="03001234567"
                inputMode="tel"
                maxLength={13}
                required
              />
            </div>
          </div>

          <div style={styles.formGrid2}>
            <div style={styles.fieldWrapper}>
              <label style={styles.label}>Company / Party *</label>
              <input
                style={styles.input}
                value={party}
                onChange={(e) => setParty(e.target.value)}
                placeholder="ABC Traders"
                required
              />
            </div>
            <div style={styles.fieldWrapper}>
              <label style={styles.label}>Amount (PKR) *</label>
              <input
                style={styles.input}
                value={amount}
                onChange={(e) =>
                  setAmount(e.target.value.replace(/[^0-9]/g, ""))
                }
                placeholder="145000"
                inputMode="numeric"
                required
              />
            </div>
          </div>

          <div style={styles.formGrid2}>
            <div style={styles.fieldWrapper}>
              <label style={styles.label}>Date *</label>
              <DatePicker
                selected={dateObj}
                onChange={(d) => setDateObj(d || new Date())}
                dateFormat="MM/dd/yyyy"
                customInput={<input style={styles.input} />}
                required
              />
            </div>
            <div style={styles.fieldWrapper}>
              <label style={styles.label}>Status</label>
              <select
                style={styles.select}
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="PENDING">Pending</option>
                <option value="RECEIVED">Received</option>
              </select>
            </div>
          </div>

          <div style={styles.formGrid2}>
            <div style={styles.fieldWrapper}>
              <label style={styles.label}>Payment Mode *</label>
              <select
                style={{
                  ...styles.select,
                  background:
                    paymentMode === "Cash"
                      ? "rgba(251,146,60,0.12)"
                      : paymentMode === "Check"
                        ? "rgba(139,92,246,0.12)"
                        : "rgba(52,211,153,0.12)",
                  color: "#111827",
                }}
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
                required
              >
                <option value="Cash">Cash</option>
                <option value="Online">Online</option>
                <option value="Check">Check</option>
              </select>
            </div>
            <div style={styles.fieldWrapper}></div>
          </div>

          {paymentMode !== "Cash" && (
            <div style={styles.formGrid2}>
              <div style={styles.fieldWrapper}>
                <label style={styles.label}>Bank *</label>
                <select
                  style={styles.select}
                  value={bank}
                  onChange={(e) => setBank(e.target.value)}
                  required
                >
                  {BANKS.filter((b) => b.key !== "CASH").map((b) => (
                    <option key={b.key} value={b.key}>
                      {b.label}
                    </option>
                  ))}
                </select>
              </div>
              <div style={styles.fieldWrapper}></div>
            </div>
          )}

          <div style={styles.formGrid2}>
            <div style={styles.fieldWrapper}>
              <label style={styles.label}>Category / Purpose *</label>
              <select
                style={styles.select}
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                required
              >
                <option value="">Select type</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div style={styles.fieldWrapper}>
              <label style={styles.label}>Notes</label>
              <input
                style={styles.input}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional notes..."
              />
            </div>
          </div>

          {category === "Other" && (
            <div style={styles.formGrid2}>
              <div style={styles.fieldWrapper}>
                <label style={styles.label}>Custom Category Name *</label>
                <input
                  style={styles.input}
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="e.g. Health Insurance..."
                  required
                />
              </div>
              <div style={styles.fieldWrapper}></div>
            </div>
          )}

          {category === "Tracker" && (
            <div style={styles.trackerCard}>
              <div style={styles.trackerTitle}>
                Tracker Installation Details
              </div>
              <div style={styles.formGrid2}>
                <div style={styles.fieldWrapper}>
                  <label style={styles.label}>Tracker Company *</label>
                  <select
                    style={styles.select}
                    value={trackerCompany}
                    onChange={(e) => setTrackerCompany(e.target.value)}
                    required
                  >
                    <option value="">Select Company</option>
                    <option value="TPL">TPL</option>
                    <option value="Promaset">Promaset</option>
                  </select>
                </div>
                <div style={styles.fieldWrapper}>
                  <label style={styles.label}>Tracker Type *</label>
                  <select
                    style={styles.select}
                    value={trackerType}
                    onChange={(e) => setTrackerType(e.target.value)}
                    required
                  >
                    <option value="">Select type</option>
                    <option value="Simple Tracker (Rental)">
                      Simple Tracker (Rental)
                    </option>
                    <option value="Simple Tracker (Cash)">
                      Simple Tracker (Cash)
                    </option>
                    <option value="Simple OBD (Connector)">
                      Simple OBD (Connector)
                    </option>
                    <option value="Voice OBD">Voice OBD</option>
                    <option value="Voice Simple">Voice Simple</option>
                    <option value="Video Surveillance Dashcam">
                      Video Surveillance-Dashcam
                    </option>
                    <option value="Video Surveillance MDVR">
                      Video Surveillance-MDVR
                    </option>
                    <option value="Fuel Gauge">Fuel Gauge</option>
                  </select>
                </div>
              </div>

              <div style={styles.formGrid2}>
                <div style={styles.fieldWrapper}>
                  <label style={styles.label}>Add-on Services</label>
                  <select
                    style={styles.select}
                    value={addonService}
                    onChange={(e) => setAddonService(e.target.value)}
                  >
                    <option value="">None</option>
                    <option value="SMS">SMS</option>
                    <option value="System Transfer">System Transfer</option>
                    <option value="Ownership Change">Ownership Change</option>
                  </select>
                </div>
                <div style={styles.fieldWrapper}>
                  <label style={styles.label}>Vehicle Type *</label>
                  <select
                    style={styles.select}
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                    required
                  >
                    <option value="">Select vehicle type</option>
                    <option value="Car">Car</option>
                    <option value="Bike">Bike / Motorcycle</option>
                    <option value="Rickshaw">Rickshaw</option>
                    <option value="Truck">Truck / Heavy Vehicle</option>
                  </select>
                </div>
              </div>

              <div style={styles.formGrid2}>
                <div style={styles.fieldWrapper}>
                  <label style={styles.label}>Registration Number *</label>
                  <input
                    style={styles.input}
                    value={registrationNo}
                    onChange={(e) =>
                      setRegistrationNo(e.target.value.toUpperCase())
                    }
                    placeholder="LEB-19-1234 or ABC-567"
                    required
                  />
                </div>
                <div style={styles.fieldWrapper}>
                  <label style={styles.label}>Vehicle Brand *</label>
                  <input
                    style={styles.input}
                    value={vehicleBrand}
                    onChange={(e) => setVehicleBrand(e.target.value)}
                    placeholder="Toyota, Honda, Suzuki..."
                    required
                  />
                </div>
              </div>

              <div style={styles.formGrid3}>
                <div style={styles.fieldWrapper}>
                  <label style={styles.label}>Chassis Number *</label>
                  <input
                    style={styles.input}
                    value={chassisNumber}
                    onChange={(e) =>
                      setChassisNumber(e.target.value.toUpperCase())
                    }
                    placeholder="JF53K-..."
                    required
                  />
                </div>
                <div style={styles.fieldWrapper}>
                  <label style={styles.label}>Engine No *</label>
                  <input
                    style={styles.input}
                    value={engineno}
                    onChange={(e) => setEngineNo(e.target.value.toUpperCase())}
                    placeholder="1NZ-FXE-..."
                    required
                  />
                </div>
                <div style={styles.fieldWrapper}>
                  <label style={styles.label}>Agent / Installer Name *</label>
                  <input
                    style={styles.input}
                    value={agentName}
                    onChange={(e) => setAgentName(e.target.value)}
                    placeholder="Ali Ahmed, Usman Installers..."
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {category === "Insurance" && (
            <div style={styles.formGrid2}>
              <div style={styles.fieldWrapper}>
                <label style={styles.label}>Insurance Cover Type *</label>
                <select
                  style={styles.select}
                  value={insuranceCover}
                  onChange={(e) => setInsuranceCover(e.target.value)}
                  required
                >
                  <option value="">Select Cover Type</option>
                  <option value="Motor">Motor</option>
                  <option value="Travel">Travel</option>
                  <option value="Fire">Fire</option>
                  <option value="Marine">Marine</option>
                  <option value="Health">Health</option>
                  <option value="Life">Life</option>
                  <option value="Misc">Misc</option>
                </select>
              </div>
              <div style={styles.fieldWrapper}></div>
            </div>
          )}

          <div style={styles.formActions}>
            <button type="submit" style={styles.submitBtn}>
              {editingId ? "Update Receiving" : "Add Receiving"}
            </button>
          </div>
        </form>
      </div>

      <section style={styles.tableSection}>
        <div style={styles.tableSectionHeader}>
          <div style={{ position: "relative", flex: 1, minWidth: "min(100%, 280px)" }}>
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
              placeholder="Search client, phone, party, category..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              style={styles.searchInputTable}
            />
          </div>
          <button
            onClick={onExportCSV}
            disabled={!receivings.length}
            style={styles.exportBtnTable}
          >
            <Download size={16} /> Export CSV
          </button>
        </div>

        {filtered.length === 0 ? (
          <div style={styles.emptyState}>
            <FileText size={48} style={{ opacity: 0.4, marginBottom: 16 }} />
            <h3 style={{ fontSize: "clamp(14px, 4vw, 18px)" }}>
              No records found
            </h3>
            <p style={{ marginTop: 8, fontSize: "clamp(12px, 3.5vw, 14px)" }}>
              {q
                ? "Try different search terms"
                : "Add your first receiving above"}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={styles.table}>
              <thead>
                <tr style={{ background: "#f9fafb" }}>
                  <th style={styles.th}>Date</th>
                  <th style={styles.th}>Client</th>
                  <th style={styles.th}>Category</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Mode</th>
                  <th style={styles.th}>Bank</th>
                  <th style={{ ...styles.th, textAlign: "right" }}>Amount</th>
                  <th style={{ ...styles.th, textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr
                    key={r.id}
                    style={{
                      background:
                        r.status?.toUpperCase() === "RECEIVED"
                          ? "#ecfdf5"
                          : "#ffffff",
                      transition: "background 0.15s",
                    }}
                  >
                    <td style={styles.td}>{r.date}</td>
                    <td style={{ ...styles.td, fontWeight: 600 }}>
                      {r.clientName}
                      <div style={styles.secondaryText}>{r.clientPhone}</div>
                    </td>
                    <td style={styles.td}>
                      <span
                        style={{
                          padding: "4px 12px",
                          borderRadius: "20px",
                          fontSize: 12,
                          fontWeight: 600,
                          color: "white",
                          backgroundColor: getCategoryColor(r.category),
                        }}
                      >
                        {r.category}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span
                        style={{
                          padding: "4px 12px",
                          borderRadius: "20px",
                          fontSize: 12,
                          fontWeight: 600,
                          backgroundColor: getStatusStyle(r.status).bg,
                          color: getStatusStyle(r.status).color,
                        }}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span
                        style={{
                          padding: "4px 12px",
                          borderRadius: "20px",
                          fontSize: 12,
                          fontWeight: 600,
                          color: "white",
                          backgroundColor: getPaymentModeColor(r.paymentMode),
                        }}
                      >
                        {r.paymentMode || "Cash"}
                      </span>
                    </td>
                    <td style={styles.td}>
                      {r.paymentMode === "Cash" || !r.bank ? (
                        "—"
                      ) : (
                        <span
                          style={{
                            padding: "4px 12px",
                            borderRadius: "20px",
                            fontSize: 12,
                            fontWeight: 600,
                            color: "white",
                            backgroundColor: "#047857",
                          }}
                        >
                          {r.bank}
                        </span>
                      )}
                    </td>
                    <td
                      style={{
                        ...styles.td,
                        textAlign: "right",
                        fontWeight: 700,
                        color:
                          r.status?.toUpperCase() === "RECEIVED"
                            ? "#374151"
                            : "#7c3aed",
                        textDecoration:
                          r.status?.toUpperCase() === "RECEIVED"
                            ? "line-through"
                            : "none",
                      }}
                    >
                      Rs. {fmt(r.amount)}
                    </td>
                    <td
                      style={{
                        ...styles.td,
                        display: "flex",
                        gap: 8,
                        justifyContent: "center",
                        flexWrap: "wrap",
                      }}
                    >
                      <button
                        onClick={() => handleViewInvoice(r)}
                        style={styles.actionBtn}
                        title="View Invoice"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => loadRecordForEdit(r)}
                        style={{
                          ...styles.actionBtn,
                          background: "rgba(180,83,9,0.1)",
                          color: "#b45309",
                        }}
                        title="Edit"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleViewReceipt(r)}
                        style={{
                          ...styles.actionBtn,
                          background: "rgba(5,150,105,0.1)",
                          color: "#059669",
                        }}
                        title="View Receipt"
                      >
                        <ReceiptIcon size={18} />
                      </button>
                      <button
                        onClick={() => actions.deleteReceiving(r.id)}
                        style={{
                          ...styles.actionBtn,
                          background: "rgba(220,38,38,0.1)",
                          color: "#dc2626",
                        }}
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

      {(selected || selectedReceipt) && (
        <div ref={previewRef} style={styles.card}>
          <div style={styles.previewHeader}>
            <h2 style={styles.cardTitle}>
              {selected
                ? "Invoice / Voucher Preview"
                : "Official Payment Receipt"}
            </h2>
            <button
              style={styles.closeBtn}
              onClick={() => {
                setSelected(null);
                setSelectedReceipt(null);
              }}
            >
              ✕ Close
            </button>
          </div>
          <Invoice
            record={selected || selectedReceipt}
            companyName={state?.companyName || "Secure Path Solutions"}
            mode={selected ? "voucher" : "receipt"}
          />
        </div>
      )}
    </div>
  );
}

// ─── Styles ───
const styles = {
  container: {
    padding: "clamp(12px, 3vw, 24px)",
    maxWidth: 1400,
    margin: "0 auto",
    minHeight: "100vh",
    fontFamily: "Inter, system-ui, sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: "clamp(12px, 3vw, 20px)",
    marginBottom: "clamp(20px, 5vw, 32px)",
  },
  title: {
    fontSize: "clamp(24px, 6vw, 34px)",
    fontWeight: 800,
    margin: 0,
    color: "#111827",
    letterSpacing: "-0.02em",
  },
  summary: {
    fontSize: "clamp(13px, 3.5vw, 16px)",
    color: "#4b5563",
    marginTop: "clamp(4px, 1.5vw, 8px)",
    fontWeight: "500",
  },
  headerActions: {
    display: "flex",
    gap: "clamp(8px, 2vw, 12px)",
    flexWrap: "wrap",
    alignItems: "center",
    width: "100%",
  },
  searchInput: {
    padding: "clamp(8px, 2vw, 10px) clamp(12px, 3vw, 16px)",
    borderRadius: "clamp(8px, 2vw, 12px)",
    border: "1px solid #d1d5db",
    minWidth: "min(100%, 280px)",
    flex: 1,
    fontSize: "clamp(13px, 3.5vw, 15px)",
    color: "#111827",
    background: "#ffffff",
    boxSizing: "border-box",
  },
  exportBtn: {
    padding: "clamp(8px, 2vw, 10px) clamp(16px, 4vw, 20px)",
    borderRadius: "clamp(8px, 2vw, 12px)",
    background: "#fff",
    border: "1px solid #d1d5db",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: "clamp(12px, 3vw, 14px)",
    color: "#374151",
    whiteSpace: "nowrap",
  },
  card: {
    background: "#ffffff",
    borderRadius: "clamp(12px, 3vw, 16px)",
    border: "1px solid #d1d5db",
    padding: "clamp(16px, 4vw, 28px)",
    marginBottom: "clamp(20px, 5vw, 32px)",
    boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
    boxSizing: "border-box",
  },
  cardTitle: {
    fontSize: "clamp(18px, 4.5vw, 22px)",
    fontWeight: 700,
    margin: "0 0 clamp(16px, 4vw, 24px) 0",
    color: "#111827",
  },
  editBanner: {
    background: "#fef3c7",
    border: "1px solid #fbbf24",
    borderRadius: "clamp(8px, 2vw, 10px)",
    padding: "clamp(10px, 2.5vw, 12px) clamp(12px, 3vw, 16px)",
    marginBottom: "clamp(16px, 4vw, 20px)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontWeight: 600,
    fontSize: "clamp(12px, 3vw, 14px)",
    color: "#92400e",
    flexWrap: "wrap",
    gap: "clamp(8px, 2vw, 10px)",
  },
  cancelEditBtn: {
    padding: "clamp(4px, 1.5vw, 6px) clamp(10px, 2.5vw, 14px)",
    background: "#fff",
    border: "1px solid #fbbf24",
    borderRadius: "clamp(6px, 1.5vw, 8px)",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "clamp(11px, 2.8vw, 13px)",
    color: "#92400e",
  },
  fieldWrapper: {
    display: "flex",
    flexDirection: "column",
  },
  label: {
    fontSize: "clamp(10px, 2.5vw, 12px)",
    fontWeight: 700,
    color: "#4b5563",
    marginBottom: "clamp(6px, 1.5vw, 8px)",
    display: "block",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginLeft: 4,
  },
  input: {
    width: "100%",
    padding: "clamp(10px, 2.5vw, 11px) clamp(12px, 3vw, 14px)",
    borderRadius: "clamp(8px, 2vw, 10px)",
    border: "1px solid #d1d5db",
    fontSize: "clamp(14px, 3.5vw, 15px)",
    background: "#f9fafb",
    color: "#111827",
    boxSizing: "border-box",
  },
  select: {
    width: "100%",
    padding: "clamp(10px, 2.5vw, 11px) clamp(12px, 3vw, 14px)",
    borderRadius: "clamp(8px, 2vw, 10px)",
    border: "1px solid #d1d5db",
    background: "#f9fafb",
    fontSize: "clamp(14px, 3.5vw, 15px)",
    color: "#111827",
    appearance: "none",
    boxSizing: "border-box",
    backgroundImage:
      "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'><path fill='%23334155' d='M1 1l5 5 5-5'/></svg>\")",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right clamp(10px, 2.5vw, 14px) center",
    cursor: "pointer",
  },
  formGrid2: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))",
    gap: "clamp(12px, 3vw, 20px) clamp(16px, 4vw, 24px)",
    marginTop: "clamp(12px, 3vw, 20px)",
  },
  formGrid3: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))",
    gap: "clamp(12px, 3vw, 20px) clamp(16px, 4vw, 24px)",
    marginTop: "clamp(12px, 3vw, 20px)",
  },
  trackerCard: {
    marginTop: "clamp(20px, 5vw, 28px)",
    padding: "clamp(16px, 4vw, 24px)",
    background: "#f0f9ff",
    border: "1px solid #bae6fd",
    borderRadius: "clamp(12px, 3vw, 16px)",
  },
  trackerTitle: {
    fontSize: "clamp(16px, 4vw, 19px)",
    fontWeight: 700,
    color: "#1e40af",
    marginBottom: "clamp(12px, 3vw, 16px)",
  },
  formActions: {
    marginTop: "clamp(24px, 6vw, 36px)",
    textAlign: "right",
  },
  submitBtn: {
    padding: "clamp(10px, 2.5vw, 12px) clamp(24px, 6vw, 40px)",
    background: "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)",
    color: "white",
    border: "none",
    borderRadius: "clamp(8px, 2vw, 12px)",
    fontSize: "clamp(14px, 3.5vw, 16px)",
    fontWeight: 700,
    cursor: "pointer",
    width: "100%",
    maxWidth: "min(100%, 300px)",
  },
  tableSection: {
    background: "#ffffff",
    borderRadius: "clamp(12px, 3vw, 16px)",
    border: "1px solid #d1d5db",
    padding: "clamp(12px, 3vw, 24px)",
    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
    boxSizing: "border-box",
    overflowX: "auto",
  },
  tableSectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "clamp(12px, 3vw, 24px)",
    gap: "clamp(8px, 2vw, 16px)",
    flexWrap: "wrap",
  },
  searchInputTable: {
    width: "100%",
    padding:
      "clamp(8px, 2vw, 10px) clamp(12px, 3vw, 16px) clamp(8px, 2vw, 10px) clamp(38px, 8vw, 44px)",
    background: "#f9fafb",
    border: "1px solid #d1d5db",
    borderRadius: "clamp(8px, 2vw, 10px)",
    color: "#111827",
    fontSize: "clamp(13px, 3.5vw, 16px)",
    boxSizing: "border-box",
  },
  exportBtnTable: {
    background: "#f3f4f6",
    border: "1px solid #d1d5db",
    color: "#374151",
    padding: "clamp(8px, 2vw, 10px) clamp(14px, 3.5vw, 20px)",
    borderRadius: "clamp(8px, 2vw, 10px)",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "clamp(6px, 1.5vw, 8px)",
    fontWeight: 500,
    fontSize: "clamp(12px, 3.2vw, 14px)",
    whiteSpace: "nowrap",
  },
  emptyState: {
    textAlign: "center",
    padding: "clamp(40px, 10vw, 80px) clamp(12px, 3vw, 20px)",
    color: "#6b7280",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    tableLayout: "auto",
    minWidth: "clamp(300px, 100%, 1100px)",
  },
  th: {
    padding: "clamp(8px, 2vw, 16px)",
    color: "#4b5563",
    fontSize: "clamp(10px, 2.5vw, 12px)",
    textTransform: "uppercase",
    textAlign: "left",
    borderBottom: "1px solid #e5e7eb",
    fontWeight: 700,
    whiteSpace: "nowrap",
  },
  td: {
    padding: "clamp(8px, 2vw, 16px)",
    borderBottom: "1px solid #e5e7eb",
    fontSize: "clamp(12px, 3.2vw, 14px)",
    color: "#111827",
  },
  secondaryText: {
    fontSize: "clamp(11px, 2.8vw, 12px)",
    color: "#6b7280",
    marginTop: "clamp(2px, 0.5vw, 4px)",
    fontWeight: 400,
  },
  actionBtn: {
    background: "rgba(37,99,235,0.1)",
    color: "#2563eb",
    border: "none",
    padding: "clamp(6px, 1.5vw, 8px)",
    borderRadius: "clamp(6px, 1.5vw, 8px)",
    cursor: "pointer",
    minHeight: "clamp(32px, 7vw, 36px)",
    minWidth: "clamp(32px, 7vw, 36px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  previewHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "clamp(16px, 4vw, 20px)",
    paddingBottom: "clamp(12px, 3vw, 16px)",
    borderBottom: "1px solid #e2e8f0",
    gap: "clamp(8px, 2vw, 12px)",
    flexWrap: "wrap",
  },
  closeBtn: {
    padding: "clamp(6px, 1.5vw, 8px) clamp(12px, 3vw, 18px)",
    background: "#f1f5f9",
    border: "1px solid #cbd5e1",
    borderRadius: "clamp(8px, 2vw, 10px)",
    cursor: "pointer",
    fontSize: "clamp(12px, 3vw, 14px)",
    fontWeight: 600,
    whiteSpace: "nowrap",
  },
};