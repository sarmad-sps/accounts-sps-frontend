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

  
// const clientLedger = useMemo(() => {
//   const ledger = {};
//   receivings.forEach((r) => {
//     if (!ledger[r.clientName]) {
//       ledger[r.clientName] = [];
//     }
//     ledger[r.clientName].push({
//       date: r.date,
//       party: r.party,
//       category: r.category,
//       amount: Number(r.amount) || 0,
//       status: r.status,
//       paymentMode: r.paymentMode,
//       notes: r.notes,
//     });
//   });

//   // Optionally sort by date
//   Object.keys(ledger).forEach((client) => {
//     ledger[client].sort(
//       (a, b) => new Date(a.date) - new Date(b.date)
//     );
//   });

//   return ledger;
// }, [receivings]);
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
//           <div style={{ position: "relative", flex: 1, minWidth: "min(100%, 280px)" }}>
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

//       <section style={ledgerStyles.container}>
//   <h2 style={ledgerStyles.title}>Client Ledger</h2>

//   {Object.keys(clientLedger).length === 0 ? (
//     <p style={ledgerStyles.emptyText}>No ledger records available yet.</p>
//   ) : (
//     Object.entries(clientLedger).map(([client, entries]) => {
//       let runningBalance = 0;
//       let totalAmount = 0;
//       let totalReceived = 0;
//       let totalPending = 0;

//       entries.forEach((e) => {
//         totalAmount += e.amount;
//         if (e.status === "RECEIVED") totalReceived += e.amount;
//         else totalPending += e.amount;
//       });

//       return (
//         <div key={client} style={ledgerStyles.clientCard}>
//           {/* ─── Header with totals ─── */}
//           <h3 style={ledgerStyles.clientName}>{client}</h3>

//           {/* Table without summary row */}
//           <table style={ledgerStyles.table}>
//             <thead style={ledgerStyles.thead}>
//               <tr>
//                 <th style={ledgerStyles.th}>Date</th>
//                 <th style={ledgerStyles.th}>Party</th>
//                 <th style={ledgerStyles.th}>Category</th>
//                 <th style={{ ...ledgerStyles.th, textAlign: "right" }}>Amount</th>
//                 <th style={ledgerStyles.th}>Status</th>
//                 <th style={{ ...ledgerStyles.th, textAlign: "right" }}>Running Balance</th>
//               </tr>
//             </thead>
//             <tbody>
//               {entries.map((e, i) => {
//                 runningBalance += e.status === "RECEIVED" ? e.amount : 0;

//                 return (
//                   <tr
//                     key={i}
//                     style={{
//                       backgroundColor: i % 2 === 0 ? "#ffffff" : "#f9fafb",
//                     }}
//                   >
//                     <td style={ledgerStyles.td}>{e.date}</td>
//                     <td style={ledgerStyles.td}>{e.party}</td>
//                     <td style={ledgerStyles.td}>{e.category}</td>
//                     <td style={{ ...ledgerStyles.td, ...ledgerStyles.amountCell }}>
//                       Rs. {e.amount.toLocaleString()}
//                     </td>
//                     <td style={ledgerStyles.td}>
//                       <span
//                         style={
//                           e.status === "RECEIVED"
//                             ? ledgerStyles.statusReceived
//                             : ledgerStyles.statusPending
//                         }
//                       >
//                         {e.status}
//                       </span>
//                     </td>
//                     <td style={{ ...ledgerStyles.td, ...ledgerStyles.balanceCell }}>
//                       Rs. {runningBalance.toLocaleString()}
//                     </td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>
//            <div style={ledgerStyles.clientHeader}>
           

//             <div style={ledgerStyles.clientStats}>
//               <span style={ledgerStyles.statItem}>
//                 Total: <strong style={{ color: "#1e40af" }}>Rs. {totalAmount.toLocaleString()}</strong>
//               </span>
//               <span style={{ ...ledgerStyles.statItem, color: "#065f46" }}>
//                 Received: <strong>Rs. {totalReceived.toLocaleString()}</strong>
//               </span>
//               <span style={{ ...ledgerStyles.statItem, color: "#b45309" }}>
//                 Pending: <strong>Rs. {totalPending.toLocaleString()}</strong>
//               </span>
//               <span style={{ ...ledgerStyles.statItem, fontWeight: "700", color: "#1e293b" }}>
//                 Balance: <strong>Rs. {totalReceived.toLocaleString()}</strong>
//               </span>
//             </div>
//           </div>
//         </div>
//       );
//     })
//   )}
// </section>
//     </div>
//   );
// }

// // ─── Styles ───

// const ledgerStyles = {
//   container: {
//     padding: "24px 16px",
//     maxWidth: "1400px",
//     margin: "0 auto 40px",
//     fontFamily: "Inter, system-ui, sans-serif",
//   },

//   title: {
//     fontSize: "1.6rem",
//     fontWeight: "700",
//     color: "#0f172a",
//     margin: "0 0 1.5rem 0",
//     letterSpacing: "-0.01em",
//   },

//   emptyText: {
//     color: "#64748b",
//     fontSize: "1.1rem",
//     textAlign: "center",
//     padding: "60px 20px",
//     background: "#f8fafc",
//     borderRadius: "12px",
//     border: "1px dashed #cbd5e1",
//   },

//   clientCard: {
//     background: "#ffffff",
//     borderRadius: "12px",
//     border: "1px solid #e2e8f0",
//     marginBottom: "28px",
//     overflow: "hidden",
//     boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)",
//     transition: "all 0.2s ease",
//     "&:hover": {
//       boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)",
//       transform: "translateY(-2px)",
//     },
//   },

//   clientHeader: {
//     padding: "20px 20px",
//     background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
//     borderBottom: "1px solid #e2e8f0",
//     display: "flex",
//     justifyContent: "space-between",
//     alignItems: "center",
//     flexWrap: "wrap",
//     gap: "16px",
//   },

//   clientName: {
//     fontSize: "1.25rem",
//     fontWeight: "700",
//     color: "#1e293b",
//     margin: 20,
//   },

//   clientStats: {
//     fontSize: "0.95rem",
//     color: "#475569",
//     display: "flex",
//     gap: "1.5rem",
//     flexWrap: "wrap",
//   },

//   statItem: {
//     fontWeight: "600",
//   },

//   table: {
//     width: "100%",
//     borderCollapse: "collapse",
//     fontSize: "0.95rem",
//   },

//   thead: {
//     background: "#f1f5f9",
//   },

//   th: {
//     padding: "12px 16px",
//     textAlign: "left",
//     fontSize: "0.82rem",
//     fontWeight: "600",
//     color: "#475569",
//     textTransform: "uppercase",
//     letterSpacing: "0.4px",
//     borderBottom: "2px solid #cbd5e1",
//     whiteSpace: "nowrap",
//   },

//   td: {
//     padding: "14px 16px",
//     color: "#1e293b",
//     borderBottom: "1px solid #f1f5f9",
//   },

//   amountCell: {
//     textAlign: "right",
//     fontWeight: "600",
//     fontVariantNumeric: "tabular-nums",
//   },

//   statusCell: {
//     fontWeight: "600",
//   },

//   balanceCell: {
//     textAlign: "right",
//     fontWeight: "700",
//     color: "#1e40af",
//     fontVariantNumeric: "tabular-nums",
//   },

//   summaryRow: {
//     background: "#e0f2fe",
//     fontWeight: "700",
//     color: "#1e293b",
//   },

//   summaryLabel: {
//     textAlign: "center",
//     fontSize: "1.05rem",
//   },

//   // Status badge styles
//   statusPending: {
//     background: "#fef3c7",
//     color: "#92400e",
//     padding: "4px 10px",
//     borderRadius: "999px",
//     fontSize: "0.82rem",
//     fontWeight: "600",
//     display: "inline-block",
//   },

//   statusReceived: {
//     background: "#d1fae5",
//     color: "#065f46",
//     padding: "4px 10px",
//     borderRadius: "999px",
//     fontSize: "0.82rem",
//     fontWeight: "600",
//     display: "inline-block",
//   },
// };
// const styles = {
//   container: {
//     padding: "clamp(12px, 3vw, 24px)",
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
//     gap: "clamp(12px, 3vw, 20px)",
//     marginBottom: "clamp(20px, 5vw, 32px)",
//   },
//   title: {
//     fontSize: "clamp(24px, 6vw, 34px)",
//     fontWeight: 800,
//     margin: 0,
//     color: "#111827",
//     letterSpacing: "-0.02em",
//   },
//   summary: {
//     fontSize: "clamp(13px, 3.5vw, 16px)",
//     color: "#4b5563",
//     marginTop: "clamp(4px, 1.5vw, 8px)",
//     fontWeight: "500",
//   },
//   headerActions: {
//     display: "flex",
//     gap: "clamp(8px, 2vw, 12px)",
//     flexWrap: "wrap",
//     alignItems: "center",
//     width: "100%",
//   },
//   searchInput: {
//     padding: "clamp(8px, 2vw, 10px) clamp(12px, 3vw, 16px)",
//     borderRadius: "clamp(8px, 2vw, 12px)",
//     border: "1px solid #d1d5db",
//     minWidth: "min(100%, 280px)",
//     flex: 1,
//     fontSize: "clamp(13px, 3.5vw, 15px)",
//     color: "#111827",
//     background: "#ffffff",
//     boxSizing: "border-box",
//   },
//   exportBtn: {
//     padding: "clamp(8px, 2vw, 10px) clamp(16px, 4vw, 20px)",
//     borderRadius: "clamp(8px, 2vw, 12px)",
//     background: "#fff",
//     border: "1px solid #d1d5db",
//     fontWeight: 600,
//     cursor: "pointer",
//     fontSize: "clamp(12px, 3vw, 14px)",
//     color: "#374151",
//     whiteSpace: "nowrap",
//   },
//   card: {
//     background: "#ffffff",
//     borderRadius: "clamp(12px, 3vw, 16px)",
//     border: "1px solid #d1d5db",
//     padding: "clamp(16px, 4vw, 28px)",
//     marginBottom: "clamp(20px, 5vw, 32px)",
//     boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
//     boxSizing: "border-box",
//   },
//   cardTitle: {
//     fontSize: "clamp(18px, 4.5vw, 22px)",
//     fontWeight: 700,
//     margin: "0 0 clamp(16px, 4vw, 24px) 0",
//     color: "#111827",
//   },
//   editBanner: {
//     background: "#fef3c7",
//     border: "1px solid #fbbf24",
//     borderRadius: "clamp(8px, 2vw, 10px)",
//     padding: "clamp(10px, 2.5vw, 12px) clamp(12px, 3vw, 16px)",
//     marginBottom: "clamp(16px, 4vw, 20px)",
//     display: "flex",
//     justifyContent: "space-between",
//     alignItems: "center",
//     fontWeight: 600,
//     fontSize: "clamp(12px, 3vw, 14px)",
//     color: "#92400e",
//     flexWrap: "wrap",
//     gap: "clamp(8px, 2vw, 10px)",
//   },
//   cancelEditBtn: {
//     padding: "clamp(4px, 1.5vw, 6px) clamp(10px, 2.5vw, 14px)",
//     background: "#fff",
//     border: "1px solid #fbbf24",
//     borderRadius: "clamp(6px, 1.5vw, 8px)",
//     cursor: "pointer",
//     fontWeight: 600,
//     fontSize: "clamp(11px, 2.8vw, 13px)",
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
//     marginBottom: "clamp(6px, 1.5vw, 8px)",
//     display: "block",
//     textTransform: "uppercase",
//     letterSpacing: 0.5,
//     marginLeft: 4,
//   },
//   input: {
//     width: "100%",
//     padding: "clamp(10px, 2.5vw, 11px) clamp(12px, 3vw, 14px)",
//     borderRadius: "clamp(8px, 2vw, 10px)",
//     border: "1px solid #d1d5db",
//     fontSize: "clamp(14px, 3.5vw, 15px)",
//     background: "#f9fafb",
//     color: "#111827",
//     boxSizing: "border-box",
//   },
//   select: {
//     width: "100%",
//     padding: "clamp(10px, 2.5vw, 11px) clamp(12px, 3vw, 14px)",
//     borderRadius: "clamp(8px, 2vw, 10px)",
//     border: "1px solid #d1d5db",
//     background: "#f9fafb",
//     fontSize: "clamp(14px, 3.5vw, 15px)",
//     color: "#111827",
//     appearance: "none",
//     boxSizing: "border-box",
//     backgroundImage:
//       "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'><path fill='%23334155' d='M1 1l5 5 5-5'/></svg>\")",
//     backgroundRepeat: "no-repeat",
//     backgroundPosition: "right clamp(10px, 2.5vw, 14px) center",
//     cursor: "pointer",
//   },
//   formGrid2: {
//     display: "grid",
//     gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))",
//     gap: "clamp(12px, 3vw, 20px) clamp(16px, 4vw, 24px)",
//     marginTop: "clamp(12px, 3vw, 20px)",
//   },
//   formGrid3: {
//     display: "grid",
//     gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))",
//     gap: "clamp(12px, 3vw, 20px) clamp(16px, 4vw, 24px)",
//     marginTop: "clamp(12px, 3vw, 20px)",
//   },
//   trackerCard: {
//     marginTop: "clamp(20px, 5vw, 28px)",
//     padding: "clamp(16px, 4vw, 24px)",
//     background: "#f0f9ff",
//     border: "1px solid #bae6fd",
//     borderRadius: "clamp(12px, 3vw, 16px)",
//   },
//   trackerTitle: {
//     fontSize: "clamp(16px, 4vw, 19px)",
//     fontWeight: 700,
//     color: "#1e40af",
//     marginBottom: "clamp(12px, 3vw, 16px)",
//   },
//   formActions: {
//     marginTop: "clamp(24px, 6vw, 36px)",
//     textAlign: "right",
//   },
//   submitBtn: {
//     padding: "clamp(10px, 2.5vw, 12px) clamp(24px, 6vw, 40px)",
//     background: "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)",
//     color: "white",
//     border: "none",
//     borderRadius: "clamp(8px, 2vw, 12px)",
//     fontSize: "clamp(14px, 3.5vw, 16px)",
//     fontWeight: 700,
//     cursor: "pointer",
//     width: "100%",
//     maxWidth: "min(100%, 300px)",
//   },
//   tableSection: {
//     background: "#ffffff",
//     borderRadius: "clamp(12px, 3vw, 16px)",
//     border: "1px solid #d1d5db",
//     padding: "clamp(12px, 3vw, 24px)",
//     boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
//     boxSizing: "border-box",
//     overflowX: "auto",
//   },
//   tableSectionHeader: {
//     display: "flex",
//     justifyContent: "space-between",
//     marginBottom: "clamp(12px, 3vw, 24px)",
//     gap: "clamp(8px, 2vw, 16px)",
//     flexWrap: "wrap",
//   },
//   searchInputTable: {
//     width: "100%",
//     padding:
//       "clamp(8px, 2vw, 10px) clamp(12px, 3vw, 16px) clamp(8px, 2vw, 10px) clamp(38px, 8vw, 44px)",
//     background: "#f9fafb",
//     border: "1px solid #d1d5db",
//     borderRadius: "clamp(8px, 2vw, 10px)",
//     color: "#111827",
//     fontSize: "clamp(13px, 3.5vw, 16px)",
//     boxSizing: "border-box",
//   },
//   exportBtnTable: {
//     background: "#f3f4f6",
//     border: "1px solid #d1d5db",
//     color: "#374151",
//     padding: "clamp(8px, 2vw, 10px) clamp(14px, 3.5vw, 20px)",
//     borderRadius: "clamp(8px, 2vw, 10px)",
//     cursor: "pointer",
//     display: "flex",
//     alignItems: "center",
//     gap: "clamp(6px, 1.5vw, 8px)",
//     fontWeight: 500,
//     fontSize: "clamp(12px, 3.2vw, 14px)",
//     whiteSpace: "nowrap",
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
//     padding: "clamp(8px, 2vw, 16px)",
//     color: "#4b5563",
//     fontSize: "clamp(10px, 2.5vw, 12px)",
//     textTransform: "uppercase",
//     textAlign: "left",
//     borderBottom: "1px solid #e5e7eb",
//     fontWeight: 700,
//     whiteSpace: "nowrap",
//   },
//   td: {
//     padding: "clamp(8px, 2vw, 16px)",
//     borderBottom: "1px solid #e5e7eb",
//     fontSize: "clamp(12px, 3.2vw, 14px)",
//     color: "#111827",
//   },
//   secondaryText: {
//     fontSize: "clamp(11px, 2.8vw, 12px)",
//     color: "#6b7280",
//     marginTop: "clamp(2px, 0.5vw, 4px)",
//     fontWeight: 400,
//   },
//   actionBtn: {
//     background: "rgba(37,99,235,0.1)",
//     color: "#2563eb",
//     border: "none",
//     padding: "clamp(6px, 1.5vw, 8px)",
//     borderRadius: "clamp(6px, 1.5vw, 8px)",
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
//     marginBottom: "clamp(16px, 4vw, 20px)",
//     paddingBottom: "clamp(12px, 3vw, 16px)",
//     borderBottom: "1px solid #e2e8f0",
//     gap: "clamp(8px, 2vw, 12px)",
//     flexWrap: "wrap",
//   },
//   closeBtn: {
//     padding: "clamp(6px, 1.5vw, 8px) clamp(12px, 3vw, 18px)",
//     background: "#f1f5f9",
//     border: "1px solid #cbd5e1",
//     borderRadius: "clamp(8px, 2vw, 10px)",
//     cursor: "pointer",
//     fontSize: "clamp(12px, 3vw, 14px)",
//     fontWeight: 600,
//     whiteSpace: "nowrap",
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
  const [ledgerSearch, setLedgerSearch] = useState("");
  const [showAllLedgers, setShowAllLedgers] = useState(false);

  const formRef = useRef(null);
  const previewRef = useRef(null);

  const receivings = state?.receivings || [];

  const handleCategoryChange = (val) => {
    setCategory(val);
    if (val !== "Tracker") {
      setTrackerCompany(""); setTrackerType(""); setAddonService("");
      setVehicleType(""); setRegistrationNo(""); setVehicleBrand("");
      setChassisNumber(""); setEngineNo(""); setAgentName("");
    }
    if (val !== "Insurance") setInsuranceCover("");
  };

  const clientLedger = useMemo(() => {
    const ledger = {};
    receivings.forEach((r) => {
      if (!ledger[r.clientName]) ledger[r.clientName] = [];
      ledger[r.clientName].push({
        date: r.date, party: r.party, category: r.category,
        amount: Number(r.amount) || 0, status: r.status,
        paymentMode: r.paymentMode, notes: r.notes,
      });
    });
    Object.keys(ledger).forEach((client) => {
      ledger[client].sort((a, b) => new Date(a.date) - new Date(b.date));
    });
    return ledger;
  }, [receivings]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return receivings;
    return receivings.filter((r) => {
      const hay = [
        r.clientName, r.clientAddress, r.clientPhone, r.party, r.notes,
        r.status, r.bank, r.category, r.date, String(r.amount || ""),
        r.trackerCompany, r.trackerType, r.addonService, r.vehicleType,
        r.registrationNo, r.vehicleBrand, r.chassisNumber, r.engineNumber,
        r.agentName, r.paymentMode,
      ].filter(Boolean).join(" ").toLowerCase();
      return hay.includes(s);
    });
  }, [receivings, q]);

  const totals = useMemo(() => {
    let received = 0, pending = 0;
    receivings.forEach((r) => {
      const amt = Number(r.amount) || 0;
      if ((r.status || "").toUpperCase() === "RECEIVED") received += amt;
      else pending += amt;
    });
    return { received, pending, total: received + pending };
  }, [receivings]);

  const resetForm = () => {
    setClientName(""); setClientAddress(""); setClientPhone("");
    setParty(""); setAmount(""); setNotes("");
    setStatus("PENDING"); setCategory(""); setCustomCategory("");
    setDateObj(new Date()); setTrackerCompany(""); setTrackerType("");
    setAddonService(""); setVehicleType(""); setRegistrationNo("");
    setVehicleBrand(""); setChassisNumber(""); setEngineNo("");
    setAgentName(""); setPaymentMode("Cash"); setInsuranceCover("");
    setBank(BANKS?.[0]?.key || "BANK_ISLAMI"); setEditingId(null);
  };

  const loadRecordForEdit = (record) => {
    setEditingId(record.id);
    setClientName(record.clientName || ""); setClientAddress(record.clientAddress || "");
    setClientPhone(record.clientPhone || ""); setParty(record.party || "");
    setAmount(String(record.amount || "")); setDateObj(parseMMDDYYYY(record.date));
    setStatus(record.status || "PENDING"); setBank(record.bank || BANKS?.[0]?.key || "BANK_ISLAMI");
    setNotes(record.notes || ""); setPaymentMode(record.paymentMode || "Cash");
    setInsuranceCover(record.insuranceCover || "");
    const knownCategories = ["Tracker", "Insurance", "IT Software"];
    if (knownCategories.includes(record.category)) { setCategory(record.category); setCustomCategory(""); }
    else { setCategory("Other"); setCustomCategory(record.category || ""); }
    setTrackerCompany(record.trackerCompany || ""); setTrackerType(record.trackerType || "");
    setAddonService(record.addonService || ""); setVehicleType(record.vehicleType || "");
    setRegistrationNo(record.registrationNo || ""); setVehicleBrand(record.vehicleBrand || "");
    setChassisNumber(record.chassisNumber || ""); setEngineNo(record.engineNumber || "");
    setAgentName(record.agentName || "");
    setTimeout(() => {
      if (formRef.current) formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      else window.scrollTo({ top: 0, behavior: "smooth" });
    }, 120);
  };

  const handleViewInvoice = (record) => {
    setSelectedReceipt(null); setSelected(record);
    setTimeout(() => { if (previewRef.current) previewRef.current.scrollIntoView({ behavior: "smooth", block: "start" }); }, 150);
  };

  const handleViewReceipt = (record) => {
    setSelected(null); setSelectedReceipt(record);
    setTimeout(() => { if (previewRef.current) previewRef.current.scrollIntoView({ behavior: "smooth", block: "start" }); }, 150);
  };

  const onAdd = (e) => {
    e.preventDefault();
    const cat = category === "Other" ? customCategory.trim() : category;
    if (!clientName.trim()) return alert("Enter Client Name");
    if (!clientAddress.trim()) return alert("Enter Client Address");
    if (!clientPhone.trim() || !/^\d{10,13}$/.test(clientPhone.trim())) return alert("Enter Correct Phone Number");
    if (!party.trim()) return alert("Enter Company / Party name");
    if (!amount || Number(amount) <= 0) return alert("Enter Amount");
    if (!dateObj) return alert("select Date");
    if (!cat) return alert("Category select");
    if (paymentMode !== "Cash" && !bank) return alert("Select Bank");
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
    if (category === "Insurance" && !insuranceCover) return alert("Select Insurance cover type");
    const extra = category === "Tracker" ? {
      trackerCompany, trackerType, addonService: addonService.trim() || null,
      vehicleType, registrationNo: registrationNo.trim().toUpperCase(),
      vehicleBrand: vehicleBrand.trim(), chassisNumber: chassisNumber.trim().toUpperCase(),
      engineNumber: engineno.trim().toUpperCase(), agentName: agentName.trim(),
    } : {};
    const receivingData = {
      clientName: clientName.trim(), clientAddress: clientAddress.trim(),
      clientPhone: clientPhone.trim(), party: party.trim(), amount: Number(amount),
      date: formatMMDDYYYY(dateObj), status, bank: paymentMode === "Cash" ? null : bank,
      notes: notes.trim(), category: cat, paymentMode,
      insuranceCover: category === "Insurance" ? insuranceCover : null, ...extra,
    };
    if (editingId) actions.updateReceiving(editingId, receivingData);
    else actions.addReceiving({ id: Date.now().toString(), ...receivingData });
    resetForm();
  };

  const onExportCSV = () => {
    const headers = ["Date","Client Name","Client Address","Client Phone","Party","Category","Tracker Company","Tracker Type","Add-on Service","Vehicle Type","Registration No","Vehicle Brand","Chassis Number","Engine Number","Agent Name","Status","Bank","Payment Mode","Amount","Notes"];
    const rows = filtered.map((r) => [
      r.date || "", `"${(r.clientName || "").replace(/"/g, '""')}"`,
      `"${(r.clientAddress || "").replace(/"/g, '""')}"`, r.clientPhone || "",
      `"${(r.party || "").replace(/"/g, '""')}"`, r.category || "",
      r.trackerCompany || "", r.trackerType || "", r.addonService || "",
      r.vehicleType || "", r.registrationNo || "", r.vehicleBrand || "",
      r.chassisNumber || "", r.engineNumber || "", r.agentName || "",
      r.status || "", r.bank || "", r.paymentMode || "Cash", r.amount || "",
      `"${(r.notes || "").replace(/"/g, '""').replace(/\n/g, " ")}"`,
    ]);
    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url; link.download = `receivings_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click(); URL.revokeObjectURL(url);
  };

  const getCategoryColor = (cat) => ({ Tracker: "#7c3aed", Insurance: "#dc2626", "IT Software": "#2563eb", Other: "#4b5563" }[cat] || "#4b5563");
  const getStatusStyle = (stat) => stat?.toUpperCase() === "RECEIVED" ? { color: "#059669", bg: "#ecfdf5" } : { color: "#b45309", bg: "#fffbeb" };
  const getPaymentModeColor = (mode) => ({ Cash: "#ea580c", Online: "#2563eb", Check: "#d97706" }[mode] || "#6b7280");

  // ─── PDF Download ───
  const handleDownloadLedgerPDF = (client, entries) => {
    let totalAmount = 0, totalReceived = 0, totalPending = 0;
    entries.forEach((e) => {
      totalAmount += e.amount;
      if (e.status === "RECEIVED") totalReceived += e.amount;
      else totalPending += e.amount;
    });
    const generatePDF = () => {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();
      const margin = 40;
      let y = margin;
      doc.setFontSize(18); doc.setFont("helvetica", "bold"); doc.setTextColor(15, 23, 42);
      doc.text(`Client Ledger: ${client}`, margin, y); y += 22;
      doc.setFontSize(10); doc.setFont("helvetica", "normal"); doc.setTextColor(100, 116, 139);
      doc.text(`Generated: ${new Date().toLocaleDateString("en-PK", { year: "numeric", month: "long", day: "numeric" })}   |   Company: ${state?.companyName || "Secure Path Solutions"}`, margin, y); y += 18;
      doc.setDrawColor(203, 213, 225); doc.line(margin, y, pageW - margin, y); y += 18;
      const cols = [
        { label: "Date", w: 65, right: false }, { label: "Party", w: 115, right: false },
        { label: "Category", w: 80, right: false }, { label: "Amount", w: 80, right: true },
        { label: "Status", w: 65, right: false }, { label: "Running Balance", w: 95, right: true },
      ];
      doc.setFillColor(241, 245, 249); doc.rect(margin, y - 13, pageW - margin * 2, 22, "F");
      doc.setFontSize(9); doc.setFont("helvetica", "bold"); doc.setTextColor(71, 85, 105);
      let x = margin + 6;
      cols.forEach((col) => { if (col.right) doc.text(col.label, x + col.w - 6, y, { align: "right" }); else doc.text(col.label, x, y); x += col.w; });
      y += 16;
      doc.setFont("helvetica", "normal"); doc.setFontSize(9);
      let rb = 0;
      entries.forEach((e, i) => {
        rb += e.status === "RECEIVED" ? e.amount : 0;
        if (i % 2 !== 0) { doc.setFillColor(249, 250, 251); doc.rect(margin, y - 11, pageW - margin * 2, 18, "F"); }
        const rowData = [
          { val: e.date || "", right: false, color: [30, 41, 59] },
          { val: e.party || "", right: false, color: [30, 41, 59] },
          { val: e.category || "", right: false, color: [30, 41, 59] },
          { val: `Rs. ${e.amount.toLocaleString()}`, right: true, color: [30, 41, 59] },
          { val: e.status || "", right: false, color: e.status === "RECEIVED" ? [6, 95, 70] : [146, 64, 0] },
          { val: `Rs. ${rb.toLocaleString()}`, right: true, color: [30, 64, 175] },
        ];
        x = margin + 6;
        rowData.forEach((cell, ci) => {
          doc.setTextColor(...cell.color);
          if (cell.right) doc.text(cell.val, x + cols[ci].w - 6, y, { align: "right" });
          else doc.text(cell.val, x, y);
          x += cols[ci].w;
        });
        y += 18;
        if (y > pageH - 90) { doc.addPage(); y = margin + 20; }
      });
      y += 14;
      doc.setFillColor(248, 250, 252); doc.setDrawColor(226, 232, 240);
      doc.roundedRect(margin, y, pageW - margin * 2, 44, 5, 5, "FD");
      const summaryItems = [
        { label: "Total", val: `Rs. ${totalAmount.toLocaleString()}`, color: [30, 64, 175] },
        { label: "Received", val: `Rs. ${totalReceived.toLocaleString()}`, color: [6, 95, 70] },
        { label: "Pending", val: `Rs. ${totalPending.toLocaleString()}`, color: [146, 64, 0] },
        { label: "Balance", val: `Rs. ${totalReceived.toLocaleString()}`, color: [15, 23, 42] },
      ];
      const colW = (pageW - margin * 2) / summaryItems.length;
      summaryItems.forEach((item, i) => {
        const sx = margin + i * colW + colW / 2;
        doc.setFontSize(8); doc.setFont("helvetica", "normal"); doc.setTextColor(100, 116, 139);
        doc.text(item.label, sx, y + 16, { align: "center" });
        doc.setFontSize(11); doc.setFont("helvetica", "bold"); doc.setTextColor(...item.color);
        doc.text(item.val, sx, y + 32, { align: "center" });
      });
      doc.save(`Ledger_${client}_${new Date().toISOString().slice(0, 10)}.pdf`);
    };
    if (window.jspdf) generatePDF();
    else {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
      script.onload = generatePDF;
      script.onerror = () => alert("PDF library load nahi ho saki. Internet connection check karo.");
      document.head.appendChild(script);
    }
  };

  // ─── Ledger filtering logic ───
  const filteredLedgerClients = useMemo(() => {
    const s = ledgerSearch.trim().toLowerCase();
    const allEntries = Object.entries(clientLedger);
    if (showAllLedgers) return s ? allEntries.filter(([c]) => c.toLowerCase().includes(s)) : allEntries;
    if (!s) return [];
    return allEntries.filter(([c]) => c.toLowerCase().includes(s));
  }, [clientLedger, ledgerSearch, showAllLedgers]);

  const totalClientCount = Object.keys(clientLedger).length;

  // ─── Ledger Card ───
  const renderLedgerCard = ([client, entries]) => {
    let runningBalance = 0, totalAmount = 0, totalReceived = 0, totalPending = 0;
    entries.forEach((e) => {
      totalAmount += e.amount;
      if (e.status === "RECEIVED") totalReceived += e.amount;
      else totalPending += e.amount;
    });
    return (
      <div key={client} style={ledgerStyles.clientCard}>
        <div style={ledgerStyles.clientCardHeader}>
          <h3 style={ledgerStyles.clientName}>{client}</h3>
          <button onClick={() => handleDownloadLedgerPDF(client, entries)} style={ledgerStyles.downloadBtn}>
            <Download size={15} /> Download Ledger PDF
          </button>
        </div>
        <table style={ledgerStyles.table}>
          <thead style={ledgerStyles.thead}>
            <tr>
              <th style={ledgerStyles.th}>Date</th>
              <th style={ledgerStyles.th}>Party</th>
              <th style={ledgerStyles.th}>Category</th>
              <th style={{ ...ledgerStyles.th, textAlign: "right" }}>Amount</th>
              <th style={ledgerStyles.th}>Status</th>
              <th style={{ ...ledgerStyles.th, textAlign: "right" }}>Running Balance</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e, i) => {
              runningBalance += e.status === "RECEIVED" ? e.amount : 0;
              return (
                <tr key={i} style={{ backgroundColor: i % 2 === 0 ? "#ffffff" : "#f9fafb" }}>
                  <td style={ledgerStyles.td}>{e.date}</td>
                  <td style={ledgerStyles.td}>{e.party}</td>
                  <td style={ledgerStyles.td}>{e.category}</td>
                  <td style={{ ...ledgerStyles.td, ...ledgerStyles.amountCell }}>Rs. {e.amount.toLocaleString()}</td>
                  <td style={ledgerStyles.td}>
                    <span style={e.status === "RECEIVED" ? ledgerStyles.statusReceived : ledgerStyles.statusPending}>{e.status}</span>
                  </td>
                  <td style={{ ...ledgerStyles.td, ...ledgerStyles.balanceCell }}>Rs. {runningBalance.toLocaleString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div style={ledgerStyles.clientFooter}>
          <span style={ledgerStyles.statItem}>Total: <strong style={{ color: "#1e40af" }}>Rs. {totalAmount.toLocaleString()}</strong></span>
          <span style={{ ...ledgerStyles.statItem, color: "#065f46" }}>Received: <strong>Rs. {totalReceived.toLocaleString()}</strong></span>
          <span style={{ ...ledgerStyles.statItem, color: "#b45309" }}>Pending: <strong>Rs. {totalPending.toLocaleString()}</strong></span>
          <span style={{ ...ledgerStyles.statItem, color: "#1e293b" }}>Balance: <strong>Rs. {totalReceived.toLocaleString()}</strong></span>
        </div>
      </div>
    );
  };

  return (
    <div style={styles.container}>
      {/* ─── Header ─── */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Receivings</h1>
          <div style={styles.summary}>
            Total: <strong>{fmt(totals.total)}</strong> • Received: <strong>{fmt(totals.received)}</strong> • Pending: <strong>{fmt(totals.pending)}</strong>
          </div>
        </div>
        <div style={styles.headerActions}>
          <input style={styles.searchInput} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search client, phone, party, reg#, chassis..." />
          <button style={styles.exportBtn} onClick={onExportCSV}>Export CSV</button>
        </div>
      </div>

      {/* ─── Add/Edit Form ─── */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>{editingId ? "Edit Receiving" : "Add New Receiving"}</h2>
        {editingId && (
          <div style={styles.editBanner}>
            <span>Editing record...</span>
            <button style={styles.cancelEditBtn} onClick={resetForm}>Cancel Edit</button>
          </div>
        )}
        <form ref={formRef} onSubmit={onAdd}>
          <div style={styles.formGrid3}>
            <div style={styles.fieldWrapper}><label style={styles.label}>Client Name *</label><input style={styles.input} value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Client name" required /></div>
            <div style={styles.fieldWrapper}><label style={styles.label}>Client Address *</label><input style={styles.input} value={clientAddress} onChange={(e) => setClientAddress(e.target.value)} placeholder="Full address" required /></div>
            <div style={styles.fieldWrapper}><label style={styles.label}>Client Phone *</label><input style={styles.input} value={clientPhone} onChange={(e) => setClientPhone(e.target.value.replace(/[^0-9]/g, ""))} placeholder="03001234567" inputMode="tel" maxLength={13} required /></div>
          </div>
          <div style={styles.formGrid2}>
            <div style={styles.fieldWrapper}><label style={styles.label}>Company / Party *</label><input style={styles.input} value={party} onChange={(e) => setParty(e.target.value)} placeholder="ABC Traders" required /></div>
            <div style={styles.fieldWrapper}><label style={styles.label}>Amount (PKR) *</label><input style={styles.input} value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ""))} placeholder="145000" inputMode="numeric" required /></div>
          </div>
          <div style={styles.formGrid2}>
            <div style={styles.fieldWrapper}><label style={styles.label}>Date *</label><DatePicker selected={dateObj} onChange={(d) => setDateObj(d || new Date())} dateFormat="MM/dd/yyyy" customInput={<input style={styles.input} />} required /></div>
            <div style={styles.fieldWrapper}><label style={styles.label}>Status</label><select style={styles.select} value={status} onChange={(e) => setStatus(e.target.value)}><option value="PENDING">Pending</option><option value="RECEIVED">Received</option></select></div>
          </div>
          <div style={styles.formGrid2}>
            <div style={styles.fieldWrapper}>
              <label style={styles.label}>Payment Mode *</label>
              <select style={{ ...styles.select, background: paymentMode === "Cash" ? "rgba(251,146,60,0.12)" : paymentMode === "Check" ? "rgba(139,92,246,0.12)" : "rgba(52,211,153,0.12)", color: "#111827" }} value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)} required>
                <option value="Cash">Cash</option><option value="Online">Online</option><option value="Check">Check</option>
              </select>
            </div>
            <div style={styles.fieldWrapper}></div>
          </div>
          {paymentMode !== "Cash" && (
            <div style={styles.formGrid2}>
              <div style={styles.fieldWrapper}><label style={styles.label}>Bank *</label><select style={styles.select} value={bank} onChange={(e) => setBank(e.target.value)} required>{BANKS.filter((b) => b.key !== "CASH").map((b) => <option key={b.key} value={b.key}>{b.label}</option>)}</select></div>
              <div style={styles.fieldWrapper}></div>
            </div>
          )}
          <div style={styles.formGrid2}>
            <div style={styles.fieldWrapper}><label style={styles.label}>Category / Purpose *</label><select style={styles.select} value={category} onChange={(e) => handleCategoryChange(e.target.value)} required><option value="">Select type</option>{CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}</select></div>
            <div style={styles.fieldWrapper}><label style={styles.label}>Notes</label><input style={styles.input} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional notes..." /></div>
          </div>
          {category === "Other" && (
            <div style={styles.formGrid2}><div style={styles.fieldWrapper}><label style={styles.label}>Custom Category Name *</label><input style={styles.input} value={customCategory} onChange={(e) => setCustomCategory(e.target.value)} placeholder="e.g. Health Insurance..." required /></div><div style={styles.fieldWrapper}></div></div>
          )}
          {category === "Tracker" && (
            <div style={styles.trackerCard}>
              <div style={styles.trackerTitle}>Tracker Installation Details</div>
              <div style={styles.formGrid2}>
                <div style={styles.fieldWrapper}><label style={styles.label}>Tracker Company *</label><select style={styles.select} value={trackerCompany} onChange={(e) => setTrackerCompany(e.target.value)} required><option value="">Select Company</option><option value="TPL">TPL</option><option value="Promaset">Promaset</option></select></div>
                <div style={styles.fieldWrapper}><label style={styles.label}>Tracker Type *</label><select style={styles.select} value={trackerType} onChange={(e) => setTrackerType(e.target.value)} required><option value="">Select type</option><option value="Simple Tracker (Rental)">Simple Tracker (Rental)</option><option value="Simple Tracker (Cash)">Simple Tracker (Cash)</option><option value="Simple OBD (Connector)">Simple OBD (Connector)</option><option value="Voice OBD">Voice OBD</option><option value="Voice Simple">Voice Simple</option><option value="Video Surveillance Dashcam">Video Surveillance-Dashcam</option><option value="Video Surveillance MDVR">Video Surveillance-MDVR</option><option value="Fuel Gauge">Fuel Gauge</option></select></div>
              </div>
              <div style={styles.formGrid2}>
                <div style={styles.fieldWrapper}><label style={styles.label}>Add-on Services</label><select style={styles.select} value={addonService} onChange={(e) => setAddonService(e.target.value)}><option value="">None</option><option value="SMS">SMS</option><option value="System Transfer">System Transfer</option><option value="Ownership Change">Ownership Change</option></select></div>
                <div style={styles.fieldWrapper}><label style={styles.label}>Vehicle Type *</label><select style={styles.select} value={vehicleType} onChange={(e) => setVehicleType(e.target.value)} required><option value="">Select vehicle type</option><option value="Car">Car</option><option value="Bike">Bike / Motorcycle</option><option value="Rickshaw">Rickshaw</option><option value="Truck">Truck / Heavy Vehicle</option></select></div>
              </div>
              <div style={styles.formGrid2}>
                <div style={styles.fieldWrapper}><label style={styles.label}>Registration Number *</label><input style={styles.input} value={registrationNo} onChange={(e) => setRegistrationNo(e.target.value.toUpperCase())} placeholder="LEB-19-1234 or ABC-567" required /></div>
                <div style={styles.fieldWrapper}><label style={styles.label}>Vehicle Brand *</label><input style={styles.input} value={vehicleBrand} onChange={(e) => setVehicleBrand(e.target.value)} placeholder="Toyota, Honda, Suzuki..." required /></div>
              </div>
              <div style={styles.formGrid3}>
                <div style={styles.fieldWrapper}><label style={styles.label}>Chassis Number *</label><input style={styles.input} value={chassisNumber} onChange={(e) => setChassisNumber(e.target.value.toUpperCase())} placeholder="JF53K-..." required /></div>
                <div style={styles.fieldWrapper}><label style={styles.label}>Engine No *</label><input style={styles.input} value={engineno} onChange={(e) => setEngineNo(e.target.value.toUpperCase())} placeholder="1NZ-FXE-..." required /></div>
                <div style={styles.fieldWrapper}><label style={styles.label}>Agent / Installer Name *</label><input style={styles.input} value={agentName} onChange={(e) => setAgentName(e.target.value)} placeholder="Ali Ahmed, Usman Installers..." required /></div>
              </div>
            </div>
          )}
          {category === "Insurance" && (
            <div style={styles.formGrid2}><div style={styles.fieldWrapper}><label style={styles.label}>Insurance Cover Type *</label><select style={styles.select} value={insuranceCover} onChange={(e) => setInsuranceCover(e.target.value)} required><option value="">Select Cover Type</option><option value="Motor">Motor</option><option value="Travel">Travel</option><option value="Fire">Fire</option><option value="Marine">Marine</option><option value="Health">Health</option><option value="Life">Life</option><option value="Misc">Misc</option></select></div><div style={styles.fieldWrapper}></div></div>
          )}
          <div style={styles.formActions}>
            <button type="submit" style={styles.submitBtn}>{editingId ? "Update Receiving" : "Add Receiving"}</button>
          </div>
        </form>
      </div>

      {/* ─── Records Table ─── */}
      <section style={styles.tableSection}>
        <div style={styles.tableSectionHeader}>
          <div style={{ position: "relative", flex: 1, minWidth: "min(100%, 280px)" }}>
            <Search size={18} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#6b7280" }} />
            <input placeholder="Search client, phone, party, category..." value={q} onChange={(e) => setQ(e.target.value)} style={styles.searchInputTable} />
          </div>
          <button onClick={onExportCSV} disabled={!receivings.length} style={styles.exportBtnTable}><Download size={16} /> Export CSV</button>
        </div>
        {filtered.length === 0 ? (
          <div style={styles.emptyState}>
            <FileText size={48} style={{ opacity: 0.4, marginBottom: 16 }} />
            <h3 style={{ fontSize: "clamp(14px, 4vw, 18px)" }}>No records found</h3>
            <p style={{ marginTop: 8, fontSize: "clamp(12px, 3.5vw, 14px)" }}>{q ? "Try different search terms" : "Add your first receiving above"}</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={styles.table}>
              <thead>
                <tr style={{ background: "#f9fafb" }}>
                  <th style={styles.th}>Date</th><th style={styles.th}>Client</th><th style={styles.th}>Category</th>
                  <th style={styles.th}>Status</th><th style={styles.th}>Mode</th><th style={styles.th}>Bank</th>
                  <th style={{ ...styles.th, textAlign: "right" }}>Amount</th>
                  <th style={{ ...styles.th, textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} style={{ background: r.status?.toUpperCase() === "RECEIVED" ? "#ecfdf5" : "#ffffff", transition: "background 0.15s" }}>
                    <td style={styles.td}>{r.date}</td>
                    <td style={{ ...styles.td, fontWeight: 600 }}>{r.clientName}<div style={styles.secondaryText}>{r.clientPhone}</div></td>
                    <td style={styles.td}><span style={{ padding: "4px 12px", borderRadius: "20px", fontSize: 12, fontWeight: 600, color: "white", backgroundColor: getCategoryColor(r.category) }}>{r.category}</span></td>
                    <td style={styles.td}><span style={{ padding: "4px 12px", borderRadius: "20px", fontSize: 12, fontWeight: 600, backgroundColor: getStatusStyle(r.status).bg, color: getStatusStyle(r.status).color }}>{r.status}</span></td>
                    <td style={styles.td}><span style={{ padding: "4px 12px", borderRadius: "20px", fontSize: 12, fontWeight: 600, color: "white", backgroundColor: getPaymentModeColor(r.paymentMode) }}>{r.paymentMode || "Cash"}</span></td>
                    <td style={styles.td}>{r.paymentMode === "Cash" || !r.bank ? "—" : <span style={{ padding: "4px 12px", borderRadius: "20px", fontSize: 12, fontWeight: 600, color: "white", backgroundColor: "#047857" }}>{r.bank}</span>}</td>
                    <td style={{ ...styles.td, textAlign: "right", fontWeight: 700, color: r.status?.toUpperCase() === "RECEIVED" ? "#374151" : "#7c3aed", textDecoration: r.status?.toUpperCase() === "RECEIVED" ? "line-through" : "none" }}>Rs. {fmt(r.amount)}</td>
                    <td style={{ ...styles.td, display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                      <button onClick={() => handleViewInvoice(r)} style={styles.actionBtn} title="View Invoice"><Eye size={18} /></button>
                      <button onClick={() => loadRecordForEdit(r)} style={{ ...styles.actionBtn, background: "rgba(180,83,9,0.1)", color: "#b45309" }} title="Edit"><Edit size={18} /></button>
                      <button onClick={() => handleViewReceipt(r)} style={{ ...styles.actionBtn, background: "rgba(5,150,105,0.1)", color: "#059669" }} title="View Receipt"><ReceiptIcon size={18} /></button>
                      <button onClick={() => actions.deleteReceiving(r.id)} style={{ ...styles.actionBtn, background: "rgba(220,38,38,0.1)", color: "#dc2626" }} title="Delete"><Trash2 size={18} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ─── Invoice / Receipt Preview ─── */}
      {(selected || selectedReceipt) && (
        <div ref={previewRef} style={styles.card}>
          <div style={styles.previewHeader}>
            <h2 style={styles.cardTitle}>{selected ? "Invoice / Voucher Preview" : "Official Payment Receipt"}</h2>
            <button style={styles.closeBtn} onClick={() => { setSelected(null); setSelectedReceipt(null); }}>✕ Close</button>
          </div>
          <Invoice record={selected || selectedReceipt} companyName={state?.companyName || "Secure Path Solutions"} mode={selected ? "voucher" : "receipt"} />
        </div>
      )}

      {/* ─── Client Ledger Section ─── */}
      <section style={ledgerStyles.container}>
        <h2 style={ledgerStyles.title}>Client Ledger</h2>

        {/* Search + Show All / Close All */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", marginBottom: 28 }}>
          {/* Search */}
          <div style={{ position: "relative", flex: 1, minWidth: 240 }}>
            <Search size={18} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#6b7280", pointerEvents: "none" }} />
            <input
              placeholder="Search Client name..."
              value={ledgerSearch}
              onChange={(e) => { setLedgerSearch(e.target.value); if (showAllLedgers) setShowAllLedgers(false); }}
              style={{ width: "100%", padding: "11px 16px 11px 44px", background: "#f9fafb", border: "1.5px solid #d1d5db", borderRadius: 10, color: "#111827", fontSize: 15, boxSizing: "border-box", outline: "none" }}
            />
          </div>

          {/* Toggle button */}
          {!showAllLedgers ? (
            <button
              onClick={() => { setShowAllLedgers(true); setLedgerSearch(""); }}
              disabled={totalClientCount === 0}
              style={{
                display: "flex", alignItems: "center", gap: 7, padding: "11px 22px",
                background: totalClientCount === 0 ? "#e5e7eb" : "linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)",
                color: totalClientCount === 0 ? "#9ca3af" : "#fff",
                border: "none", borderRadius: 10, fontWeight: 700, fontSize: 13,
                cursor: totalClientCount === 0 ? "not-allowed" : "pointer",
                boxShadow: totalClientCount === 0 ? "none" : "0 2px 8px rgba(124,58,237,0.3)",
                whiteSpace: "nowrap",
              }}
            >
              📋 Show All ({totalClientCount}) Clients
            </button>
          ) : (
            <button
              onClick={() => { setShowAllLedgers(false); setLedgerSearch(""); }}
              style={{
                display: "flex", alignItems: "center", gap: 7, padding: "11px 22px",
                background: "linear-gradient(135deg, #dc2626 0%, #f87171 100%)",
                color: "#fff", border: "none", borderRadius: 10, fontWeight: 700,
                fontSize: 13, cursor: "pointer",
                boxShadow: "0 2px 8px rgba(220,38,38,0.3)", whiteSpace: "nowrap",
              }}
            >
              ✕ Close All Ledgers
            </button>
          )}
        </div>

        {/* Ledger Results */}
        {!showAllLedgers && !ledgerSearch.trim() ? (
          <div style={ledgerStyles.emptyText}>
            click to view ledger details for all clients.
          </div>
        ) : filteredLedgerClients.length === 0 ? (
          <div style={ledgerStyles.emptyText}>
            ❌ <strong>"{ledgerSearch}"</strong> "No client found with this name."
          </div>
        ) : (
          filteredLedgerClients.map(renderLedgerCard)
        )}
      </section>
    </div>
  );
}

// ─── Ledger Styles ───
const ledgerStyles = {
  container: { padding: "24px 16px", maxWidth: "1400px", margin: "0 auto 40px", fontFamily: "Inter, system-ui, sans-serif" },
  title: { fontSize: "1.6rem", fontWeight: "700", color: "#0f172a", margin: "0 0 1.5rem 0", letterSpacing: "-0.01em" },
  emptyText: { color: "#64748b", fontSize: "1rem", textAlign: "center", padding: "48px 20px", background: "#f8fafc", borderRadius: "12px", border: "1px dashed #cbd5e1", lineHeight: 1.8 },
  clientCard: { background: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0", marginBottom: "28px", overflow: "hidden", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -1px rgba(0,0,0,0.04)" },
  clientCardHeader: { padding: "16px 20px", background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 },
  downloadBtn: { display: "flex", alignItems: "center", gap: 7, padding: "8px 18px", background: "linear-gradient(135deg, #2563eb 0%, #60a5fa 100%)", color: "#fff", border: "none", borderRadius: 9, fontWeight: 700, fontSize: 13, cursor: "pointer", boxShadow: "0 2px 8px rgba(37,99,235,0.25)", whiteSpace: "nowrap" },
  clientFooter: { padding: "14px 20px", background: "#f8fafc", borderTop: "1px solid #e2e8f0", display: "flex", gap: "1.5rem", flexWrap: "wrap", alignItems: "center", justifyContent: "flex-end" },
  clientName: { fontSize: "1.2rem", fontWeight: "700", color: "#1e293b", margin: 0 },
  statItem: { fontSize: "0.92rem", fontWeight: "600", color: "#475569" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: "0.93rem" },
  thead: { background: "#f1f5f9" },
  th: { padding: "12px 16px", textAlign: "left", fontSize: "0.8rem", fontWeight: "700", color: "#475569", textTransform: "uppercase", letterSpacing: "0.4px", borderBottom: "2px solid #cbd5e1", whiteSpace: "nowrap" },
  td: { padding: "12px 16px", color: "#1e293b", borderBottom: "1px solid #f1f5f9" },
  amountCell: { textAlign: "right", fontWeight: "600", fontVariantNumeric: "tabular-nums" },
  balanceCell: { textAlign: "right", fontWeight: "700", color: "#1e40af", fontVariantNumeric: "tabular-nums" },
  statusPending: { background: "#fef3c7", color: "#92400e", padding: "4px 10px", borderRadius: "999px", fontSize: "0.8rem", fontWeight: "600", display: "inline-block" },
  statusReceived: { background: "#d1fae5", color: "#065f46", padding: "4px 10px", borderRadius: "999px", fontSize: "0.8rem", fontWeight: "600", display: "inline-block" },
};

// ─── Main Styles ───
const styles = {
  container: { padding: "clamp(12px, 3vw, 24px)", maxWidth: 1400, margin: "0 auto", minHeight: "100vh", fontFamily: "Inter, system-ui, sans-serif" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "clamp(12px, 3vw, 20px)", marginBottom: "clamp(20px, 5vw, 32px)" },
  title: { fontSize: "clamp(24px, 6vw, 34px)", fontWeight: 800, margin: 0, color: "#111827", letterSpacing: "-0.02em" },
  summary: { fontSize: "clamp(13px, 3.5vw, 16px)", color: "#4b5563", marginTop: "clamp(4px, 1.5vw, 8px)", fontWeight: "500" },
  headerActions: { display: "flex", gap: "clamp(8px, 2vw, 12px)", flexWrap: "wrap", alignItems: "center", width: "100%" },
  searchInput: { padding: "clamp(8px, 2vw, 10px) clamp(12px, 3vw, 16px)", borderRadius: "clamp(8px, 2vw, 12px)", border: "1px solid #d1d5db", minWidth: "min(100%, 280px)", flex: 1, fontSize: "clamp(13px, 3.5vw, 15px)", color: "#111827", background: "#ffffff", boxSizing: "border-box" },
  exportBtn: { padding: "clamp(8px, 2vw, 10px) clamp(16px, 4vw, 20px)", borderRadius: "clamp(8px, 2vw, 12px)", background: "#fff", border: "1px solid #d1d5db", fontWeight: 600, cursor: "pointer", fontSize: "clamp(12px, 3vw, 14px)", color: "#374151", whiteSpace: "nowrap" },
  card: { background: "#ffffff", borderRadius: "clamp(12px, 3vw, 16px)", border: "1px solid #d1d5db", padding: "clamp(16px, 4vw, 28px)", marginBottom: "clamp(20px, 5vw, 32px)", boxShadow: "0 4px 14px rgba(0,0,0,0.06)", boxSizing: "border-box" },
  cardTitle: { fontSize: "clamp(18px, 4.5vw, 22px)", fontWeight: 700, margin: "0 0 clamp(16px, 4vw, 24px) 0", color: "#111827" },
  editBanner: { background: "#fef3c7", border: "1px solid #fbbf24", borderRadius: "clamp(8px, 2vw, 10px)", padding: "clamp(10px, 2.5vw, 12px) clamp(12px, 3vw, 16px)", marginBottom: "clamp(16px, 4vw, 20px)", display: "flex", justifyContent: "space-between", alignItems: "center", fontWeight: 600, fontSize: "clamp(12px, 3vw, 14px)", color: "#92400e", flexWrap: "wrap", gap: "clamp(8px, 2vw, 10px)" },
  cancelEditBtn: { padding: "clamp(4px, 1.5vw, 6px) clamp(10px, 2.5vw, 14px)", background: "#fff", border: "1px solid #fbbf24", borderRadius: "clamp(6px, 1.5vw, 8px)", cursor: "pointer", fontWeight: 600, fontSize: "clamp(11px, 2.8vw, 13px)", color: "#92400e" },
  fieldWrapper: { display: "flex", flexDirection: "column" },
  label: { fontSize: "clamp(10px, 2.5vw, 12px)", fontWeight: 700, color: "#4b5563", marginBottom: "clamp(6px, 1.5vw, 8px)", display: "block", textTransform: "uppercase", letterSpacing: 0.5, marginLeft: 4 },
  input: { width: "100%", padding: "clamp(10px, 2.5vw, 11px) clamp(12px, 3vw, 14px)", borderRadius: "clamp(8px, 2vw, 10px)", border: "1px solid #d1d5db", fontSize: "clamp(14px, 3.5vw, 15px)", background: "#f9fafb", color: "#111827", boxSizing: "border-box" },
  select: { width: "100%", padding: "clamp(10px, 2.5vw, 11px) clamp(12px, 3vw, 14px)", borderRadius: "clamp(8px, 2vw, 10px)", border: "1px solid #d1d5db", background: "#f9fafb", fontSize: "clamp(14px, 3.5vw, 15px)", color: "#111827", appearance: "none", boxSizing: "border-box", backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'><path fill='%23334155' d='M1 1l5 5 5-5'/></svg>\")", backgroundRepeat: "no-repeat", backgroundPosition: "right clamp(10px, 2.5vw, 14px) center", cursor: "pointer" },
  formGrid2: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))", gap: "clamp(12px, 3vw, 20px) clamp(16px, 4vw, 24px)", marginTop: "clamp(12px, 3vw, 20px)" },
  formGrid3: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))", gap: "clamp(12px, 3vw, 20px) clamp(16px, 4vw, 24px)", marginTop: "clamp(12px, 3vw, 20px)" },
  trackerCard: { marginTop: "clamp(20px, 5vw, 28px)", padding: "clamp(16px, 4vw, 24px)", background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: "clamp(12px, 3vw, 16px)" },
  trackerTitle: { fontSize: "clamp(16px, 4vw, 19px)", fontWeight: 700, color: "#1e40af", marginBottom: "clamp(12px, 3vw, 16px)" },
  formActions: { marginTop: "clamp(24px, 6vw, 36px)", textAlign: "right" },
  submitBtn: { padding: "clamp(10px, 2.5vw, 12px) clamp(24px, 6vw, 40px)", background: "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)", color: "white", border: "none", borderRadius: "clamp(8px, 2vw, 12px)", fontSize: "clamp(14px, 3.5vw, 16px)", fontWeight: 700, cursor: "pointer", width: "100%", maxWidth: "min(100%, 300px)" },
  tableSection: { background: "#ffffff", borderRadius: "clamp(12px, 3vw, 16px)", border: "1px solid #d1d5db", padding: "clamp(12px, 3vw, 24px)", boxShadow: "0 4px 12px rgba(0,0,0,0.06)", boxSizing: "border-box", overflowX: "auto", marginBottom: "clamp(20px, 5vw, 32px)" },
  tableSectionHeader: { display: "flex", justifyContent: "space-between", marginBottom: "clamp(12px, 3vw, 24px)", gap: "clamp(8px, 2vw, 16px)", flexWrap: "wrap" },
  searchInputTable: { width: "100%", padding: "clamp(8px, 2vw, 10px) clamp(12px, 3vw, 16px) clamp(8px, 2vw, 10px) clamp(38px, 8vw, 44px)", background: "#f9fafb", border: "1px solid #d1d5db", borderRadius: "clamp(8px, 2vw, 10px)", color: "#111827", fontSize: "clamp(13px, 3.5vw, 16px)", boxSizing: "border-box" },
  exportBtnTable: { background: "#f3f4f6", border: "1px solid #d1d5db", color: "#374151", padding: "clamp(8px, 2vw, 10px) clamp(14px, 3.5vw, 20px)", borderRadius: "clamp(8px, 2vw, 10px)", cursor: "pointer", display: "flex", alignItems: "center", gap: "clamp(6px, 1.5vw, 8px)", fontWeight: 500, fontSize: "clamp(12px, 3.2vw, 14px)", whiteSpace: "nowrap" },
  emptyState: { textAlign: "center", padding: "clamp(40px, 10vw, 80px) clamp(12px, 3vw, 20px)", color: "#6b7280" },
  table: { width: "100%", borderCollapse: "collapse", tableLayout: "auto", minWidth: "clamp(300px, 100%, 1100px)" },
  th: { padding: "clamp(8px, 2vw, 16px)", color: "#4b5563", fontSize: "clamp(10px, 2.5vw, 12px)", textTransform: "uppercase", textAlign: "left", borderBottom: "1px solid #e5e7eb", fontWeight: 700, whiteSpace: "nowrap" },
  td: { padding: "clamp(8px, 2vw, 16px)", borderBottom: "1px solid #e5e7eb", fontSize: "clamp(12px, 3.2vw, 14px)", color: "#111827" },
  secondaryText: { fontSize: "clamp(11px, 2.8vw, 12px)", color: "#6b7280", marginTop: "clamp(2px, 0.5vw, 4px)", fontWeight: 400 },
  actionBtn: { background: "rgba(37,99,235,0.1)", color: "#2563eb", border: "none", padding: "clamp(6px, 1.5vw, 8px)", borderRadius: "clamp(6px, 1.5vw, 8px)", cursor: "pointer", minHeight: "clamp(32px, 7vw, 36px)", minWidth: "clamp(32px, 7vw, 36px)", display: "flex", alignItems: "center", justifyContent: "center" },
  previewHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "clamp(16px, 4vw, 20px)", paddingBottom: "clamp(12px, 3vw, 16px)", borderBottom: "1px solid #e2e8f0", gap: "clamp(8px, 2vw, 12px)", flexWrap: "wrap" },
  closeBtn: { padding: "clamp(6px, 1.5vw, 8px) clamp(12px, 3vw, 18px)", background: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: "clamp(8px, 2vw, 10px)", cursor: "pointer", fontSize: "clamp(12px, 3vw, 14px)", fontWeight: 600, whiteSpace: "nowrap" },
};