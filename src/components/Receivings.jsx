import React, { useMemo, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { BANKS } from "../store";
import Invoice from "./Invoice";
//import Receipt from "./Receipt";
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

  // Tracker fields
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
  };

  const onAdd = (e) => {
    e.preventDefault();
    const cat = category === "Other" ? customCategory.trim() : category;

    if (!clientName.trim()) return alert("Client Name");
    if (!clientAddress.trim()) return alert("Client Address");
    if (!clientPhone.trim() || !/^\d{10,13}$/.test(clientPhone.trim())) {
      return alert("Client Phone Number sahi daalain (10-13 digits)");
    }
    // if (!party.trim()) return alert("Company / Party name");
    if (!amount || Number(amount) <= 0) return alert("add amount");
    if (!dateObj) return alert("plz select date");
    if (!cat) return alert("Category select");

    if (category === "Tracker") {
      if (!trackerCompany) return alert("Tracker Company select");
      if (!trackerType) return alert("Tracker Type select");
      if (!vehicleType) return alert("Vehicle Type select");
      if (!registrationNo.trim()) return alert("Registration Number");
      if (!vehicleBrand.trim()) return alert("Vehicle Brand");
      if (!chassisNumber.trim()) return alert("Chassis Number");
      if (!engineno.trim()) return alert("Engine Number");
      if (!agentName.trim()) return alert("Agent / Installer Name");
    }
    if (category === "Insurance") {
  if (!insuranceCover) return alert("Insurance cover note select");
}


    const extra = category === "Tracker"
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

    // const newReceiving = {
    //   id: Date.now().toString(),
    //   clientName: clientName.trim(),
    //   clientAddress: clientAddress.trim(),
    //   clientPhone: clientPhone.trim(),
    //   party: party.trim(),
    //   amount: Number(amount),
    //   date: formatMMDDYYYY(dateObj),
    //   status,
    //   bank,
    //   notes: notes.trim(),
    //   category: cat,
    //   paymentMode,
    //   ...extra,
    // };
const newReceiving = {
  id: Date.now().toString(),
  clientName: clientName.trim(),
  clientAddress: clientAddress.trim(),
  clientPhone: clientPhone.trim(),
  party: party.trim(),
  amount: Number(amount),
  date: formatMMDDYYYY(dateObj),
  status,
  bank,
  notes: notes.trim(),
  category: cat,
  paymentMode,
  insuranceCover: category === "Insurance" ? insuranceCover : null,
  ...extra,
};

    actions.addReceiving(newReceiving);
    resetForm();
  };

  const onExportCSV = () => {
    const headers = [
      "Date", "Client Name", "Client Address", "Client Phone",
      "Party", "Category",
      "Tracker Company", "Tracker Type", "Add-on Service",
      "Vehicle Type", "Registration No", "Vehicle Brand",
      "Chassis Number", "Engine Number", "Agent Name",
      "Status", "Bank", "Payment Mode", "Amount", "Notes",
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
  };

  const bankLabelFunc = (key) => BANKS.find((b) => b.key === key)?.label || key;

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
            placeholder="Search client name, phone, party, reg#, chassis..."
          />
          <button style={styles.exportBtn} onClick={onExportCSV}>
            Export CSV
          </button>
        </div>
      </div>

      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Add Receiving</h2>
        <form onSubmit={onAdd}>
          {/* Client Info */}
          <div style={styles.formGrid3}>
            <div>
              <label style={styles.label}>Client Name *</label>
              <input
                style={styles.input}
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Client name"
                required
              />
            </div>
            <div>
              <label style={styles.label}>Client Address *</label>
              <input
                style={styles.input}
                value={clientAddress}
                onChange={(e) => setClientAddress(e.target.value)}
                placeholder="Full address"
                required
              />
            </div>
            <div>
              <label style={styles.label}>Client Phone *</label>
              <input
                style={styles.input}
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value.replace(/[^0-9]/g, ""))}
                placeholder="03001234567"
                inputMode="tel"
                maxLength={13}
                required
              />
            </div>
          </div>

          {/* Company / Party + Amount */}
          <div style={styles.formGrid2}>
            <div>
              <label style={styles.label}>Company / Party *</label>
              <input
                style={styles.input}
                value={party}
                onChange={(e) => setParty(e.target.value)}
                placeholder="ABC Traders"
                required
              />
            </div>
            <div>
              <label style={styles.label}>Amount (PKR) *</label>
              <input
                style={styles.input}
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ""))}
                placeholder="145000"
                inputMode="numeric"
                required
              />
            </div>
          </div>

          {/* Date, Status, Bank */}
          <div style={styles.formGrid3}>
            <div>
              <label style={styles.label}>Date *</label>
              <DatePicker
                selected={dateObj}
                onChange={(d) => setDateObj(d || new Date())}
                dateFormat="MM/dd/yyyy"
                className="date-picker"
                required
              />
            </div>
            <div>
              <label style={styles.label}>Status</label>
              <select style={styles.select} value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="PENDING">Pending</option>
                <option value="RECEIVED">Received</option>
              </select>
            </div>
            <div>
              <label style={styles.label}>Bank</label>
              <select style={styles.select} value={bank} onChange={(e) => setBank(e.target.value)}>
                {BANKS.map((b) => (
                  <option key={b.key} value={b.key}>
                    {b.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Payment Mode */}
          <div style={styles.formGrid2}>
            <div>
              <label style={styles.label}>Payment Mode *</label>
              <select
                style={{
                  ...styles.select,
                  background:
                    paymentMode === "Cash" ? "rgba(251,146,60,0.12)" :
                      paymentMode === "Check" ? "rgba(139,92,246,0.12)" :
                        "rgba(52,211,153,0.12)",
                  color:
                    paymentMode === "Cash" ? "#fb923c" :
                      paymentMode === "Check" ? "#7c3aed" :
                        "#34d399",
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
            <div></div>
          </div>

          {/* Category & Notes */}
          <div style={styles.formGrid2}>
            <div>
              <label style={styles.label}>Category / Purpose *</label>
              <select
                style={styles.select}
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                required
              >
                <option value="">Select your type</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={styles.label}>Notes</label>
              <input
                style={styles.input}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional..."
              />
            </div>
          </div>

          {category === "Other" && (
            <div style={styles.otherCategory}>
              <label style={styles.label}>Custom Category *</label>
              <input
                style={styles.input}
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="Health Insurance, etc."
                required
              />
            </div>
          )}

          {category === "Tracker" && (
            <div style={styles.trackerCard}>
              <div style={styles.trackerTitle}>Tracker Installation Details</div>
              <p style={styles.trackerSubtitle}>Device & Vehicle Information</p>

              <div style={styles.formGrid2}>
                <div>
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

                <div>
                  <label style={styles.label}>Tracker Type *</label>
                  <select
                    style={styles.select}
                    value={trackerType}
                    onChange={(e) => setTrackerType(e.target.value)}
                    required
                  >
                    <option value="">Select type</option>
                    <option value="Simple Tracker (Rental)">Simple Tracker (Rental)</option>
                    <option value="Simple Tracker (Cash)">Simple Tracker (Cash)</option>
                    <option value="Simple OBD (Connector)">Simple OBD (Connector)</option>
                    <option value="Voice OBD">Voice OBD</option>
                    <option value="Voice Simple">Voice Simple</option>
                    <option value="Video Surveillance Dashcam">Video Surveillance-Dashcam</option>
                    <option value="Video Surveillance MDVR">Video Surveillance-MDVR</option>
                    <option value="Fuel Gauge">Fuel Gauge</option>
                  </select>
                </div>
              </div>

              <div style={{ ...styles.formGrid2, marginTop: 20 }}>
                <div>
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

                <div>
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

              <div style={{ ...styles.formGrid2, marginTop: 20 }}>
                <div>
                  <label style={styles.label}>Registration Number *</label>
                  <input
                    style={styles.input}
                    value={registrationNo}
                    onChange={(e) => setRegistrationNo(e.target.value.toUpperCase())}
                    placeholder="LEB-19-1234  or  ABC-567"
                    required
                  />
                </div>

                <div>
                  <label style={styles.label}>Vehicle Brand *</label>
                  <input
                    style={styles.input}
                    value={vehicleBrand}
                    onChange={(e) => setVehicleBrand(e.target.value)}
                    placeholder="Toyota, Honda, Suzuki, Yamaha..."
                    required
                  />
                </div>
              </div>

              <div style={{ ...styles.formGrid3, marginTop: 20 }}>
                <div>
                  <label style={styles.label}>Chassis Number *</label>
                  <input
                    style={styles.input}
                    value={chassisNumber}
                    onChange={(e) => setChassisNumber(e.target.value.toUpperCase())}
                    placeholder="JF53K-..."
                    required
                  />
                </div>

                <div>
                  <label style={styles.label}>Engine No *</label>
                  <input
                    style={styles.input}
                    value={engineno}
                    onChange={(e) => setEngineNo(e.target.value.toUpperCase())}
                    placeholder="1NZ-FXE-..."
                    required
                  />
                </div>

                <div>
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
    <div>
      <label style={styles.label}>Insurance Cover *</label>
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
    <div></div>
  </div>
)}

          <div style={styles.formActions}>
            <button type="submit" style={styles.submitBtn}>
              Add Receiving
            </button>
          </div>
        </form>
      </div>
      {/* ─── Simplified Table ─── */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Receivings List</h2>
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Client Name</th>
                <th style={styles.th}>Client Phone</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Payment Mode</th>
                <th style={styles.thActions}>Actions</th>
                
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} style={styles.emptyCell}>
                    No records found
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id} style={styles.row}>
                    <td style={styles.td}>
                      <strong>{r.clientName || "-"}</strong>
                      <div style={{ fontSize: '11px', opacity: 0.6 }}>{r.date}</div>
                    </td>
                    <td style={styles.td}>{r.clientPhone || "-"}</td>
                    <td style={styles.td}>
                      <span style={chipStyle(r.status)}>{r.status}</span>
                    </td>
                    <td style={styles.td}>
                      <span style={paymentChipStyle(r.paymentMode)}>
                        {r.paymentMode || "Cash"}
                      </span>
                    </td>
                    
                    <td style={styles.tdActions}>
                      <div style={styles.actionButtons}>

                        {/* <button
                          style={styles.salesTaxBtn}
                          onClick={() => alert("Sales Tax Invoice - Coming Soon")}
                        >
                          Sales Tax
                        </button> */}

                        <button
                          style={styles.invoiceBtn}
                          onClick={() => {
                            setSelectedReceipt(null);
                            setSelected(r);
                          }}
                        >
                          Invoice
                        </button>


                        <button
                          style={styles.receiptBtn}
                          onClick={() => {
                            setSelected(null);        
                            setSelectedReceipt(r);    
                          }}
                        >
                          Receipt
                        </button>

                        <button
                          style={styles.deleteBtn}
                          onClick={() => actions.deleteReceiving(r.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
{selected && (
  <div style={styles.card}>
    <div style={styles.previewHeader}>
      <h2 style={styles.cardTitle}>Receipt Voucher / Invoice Preview</h2>
      <button style={styles.closeBtn} onClick={() => setSelected(null)}>✕ Close</button>
    </div>
    <Invoice
      record={selected}
      companyName={state?.companyName || "Secure Path Solutions"}
      mode="voucher"   
    />
  </div>
)}

{selectedReceipt && (
  <div style={styles.card}>
    <div style={styles.previewHeader}>
      <h2 style={styles.cardTitle}>Official Payment Receipt</h2>
      <button style={styles.closeBtn} onClick={() => setSelectedReceipt(null)}>✕ Close</button>
    </div>
    <Invoice
      record={selectedReceipt}
      companyName={state?.companyName || "Secure Path Solutions"}
      mode="receipt"
    />
  </div>
)}


    </div>
  );
}

// ─── Styles ───
const styles = {
  container: {
    padding: "clamp(16px, 4vw, 24px)",
    maxWidth: 1400,
    margin: "0 auto",
    color: "#1e293b", 
    background: '#f8fafc',
    width: "100%",
    boxSizing: "border-box"
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
    fontSize: "clamp(24px, 6vw, 32px)", 
    fontWeight: 800, 
    margin: 0, 
    color: "#0f172a", 
    letterSpacing: "-1px" 
  },
  summary: { 
    fontSize: "clamp(13px, 3.5vw, 15px)", 
    color: "#64748b", 
    marginTop: 6, 
    fontWeight: "500",
    wordBreak: "break-word"
  },
  headerActions: { 
    display: "flex", 
    gap: "clamp(10px, 2.5vw, 14px)", 
    alignItems: "center",
    flexWrap: "wrap",
    width: "100%"
  },
  searchInput: {
    padding: "clamp(8px, 2.5vw, 10px) clamp(12px, 3vw, 18px)",
    borderRadius: 12,
    border: "1px solid #e2e8f0",
    background: "#ffffff",
    color: "#0f172a",
    minWidth: "clamp(200px, 100%, 320px)",
    boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
    fontSize: "clamp(13px, 3.5vw, 14px)",
    boxSizing: "border-box",
    flex: 1
  },
  exportBtn: {
    padding: "clamp(8px, 2.5vw, 10px) clamp(14px, 3vw, 20px)",
    borderRadius: 12,
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    color: "#475569",
    cursor: "pointer",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    transition: "0.2s",
    fontSize: "clamp(12px, 3vw, 14px)",
    whiteSpace: "nowrap"
  },
  card: {
    background: "#ffffff",
    border: "1px solid #eef2f6",
    borderRadius: 20,
    padding: "clamp(16px, 4vw, 28px)",
    marginBottom: "clamp(24px, 5vw, 36px)",
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.04)",
    boxSizing: "border-box",
    width: "100%"
  },
  cardTitle: { 
    fontSize: "clamp(18px, 5vw, 22px)", 
    fontWeight: 700, 
    margin: "0 0 clamp(16px, 4vw, 24px) 0", 
    color: "#0f172a" 
  },
  label: {
    fontSize: "clamp(11px, 2.8vw, 13px)",
    fontWeight: "700",
    color: "black",
    marginBottom: 8,
    display: "block",
    textTransform: "uppercase",
    letterSpacing: "0.5px"
  },
  input: {
    width: "100%",
    padding: "clamp(10px, 2.5vw, 12px) clamp(12px, 3vw, 16px)",
    borderRadius: 12,
    border: "1px solid #e2e8f0",
    background: "#f8fafc",
    color: "#0f172a",
    fontSize: "clamp(13px, 3.5vw, 14px)",
    transition: "border-color 0.2s",
    outline: "none",
    boxSizing: "border-box"
  },
  select: {
    width: "100%",
    padding: "clamp(10px, 2.5vw, 12px) clamp(12px, 3vw, 16px)",
    paddingRight: "36px",
    borderRadius: 12,
    border: "1px solid #e2e8f0",
    background: "#ffffff",
    color: "#0f172a",
    appearance: "none",
    backgroundImage:
      'url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="12" height="8" viewBox="0 0 12 8"><path fill="%2364748b" d="M1 1l5 5 5-5"/></svg>\')',
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 14px center",
    cursor: "pointer",
    fontSize: "clamp(13px, 3.5vw, 14px)",
    boxSizing: "border-box"
  },
  formGrid2: { 
    display: "grid", 
    gridTemplateColumns: "repeat(auto-fit, minmax(clamp(200px, 100%, 280px), 1fr))", 
    gap: "clamp(16px, 4vw, 24px)" 
  },
  formGrid3: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(clamp(200px, 100%, 260px), 1fr))",
    gap: "clamp(16px, 4vw, 24px)",
    margin: "clamp(16px, 4vw, 24px) 0",
  },
  trackerCard: {
    marginTop: "clamp(20px, 5vw, 32px)",
    padding: "clamp(16px, 4vw, 24px)",
    background: "#eff6ff", 
    border: "1px solid #dbeafe",
    borderRadius: 16,
  },
  trackerTitle: {
    fontSize: "clamp(16px, 4vw, 18px)",
    fontWeight: 700,
    color: "#1e40af",
    marginBottom: 8,
  },
  trackerSubtitle: {
    fontSize: "clamp(12px, 3.2vw, 14px)",
    color: "#3b82f6",
    fontWeight: "600",
    margin: "0 0 20px 0",
  },
  otherCategory: { margin: "clamp(16px, 4vw, 20px) 0" },
  formActions: { marginTop: "clamp(24px, 5vw, 36px)", textAlign: "right" },
  submitBtn: {
    padding: "clamp(10px, 2.5vw, 13px) clamp(24px, 5vw, 40px)",
    background: "#3b82f6", 
    color: "white",
    border: "none",
    borderRadius: 14,
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 10px 15px -3px rgba(59, 130, 246, 0.3)",
    fontSize: "clamp(13px, 3.5vw, 15px)"
  },
  tableContainer: { 
    background: "#fff", 
    borderRadius: "16px", 
    border: "1px solid #e2e8f0",
    overflow: "auto",
    width: "100%",
    boxSizing: "border-box"
  },
  table: { width: "100%", borderCollapse: "collapse", tableLayout: "auto" },
  th: {
    textAlign: "left",
    padding: "clamp(12px, 3vw, 16px)",
    fontSize: "clamp(11px, 2.8vw, 13px)",
    fontWeight: "700",
    color: "#64748b",
    background: "#f8fafc",
    borderBottom: "1px solid #e2e8f0",
    textTransform: "uppercase",
    whiteSpace: "nowrap"
  },
  thAmount: {
    textAlign: "right",
    padding: "clamp(12px, 3vw, 16px)",
    fontSize: "clamp(11px, 2.8vw, 13px)",
    fontWeight: "700",
    color: "#64748b",
    background: "#f8fafc",
    borderBottom: "1px solid #e2e8f0",
    textTransform: "uppercase",
    whiteSpace: "nowrap"
  },
  thActions: {
    textAlign: "right",
    padding: "clamp(12px, 3vw, 16px)",
    fontSize: "clamp(11px, 2.8vw, 13px)",
    fontWeight: "700",
    color: "#64748b",
    background: "#f8fafc",
    borderBottom: "1px solid #e2e8f0",
    minWidth: "clamp(150px, 25vw, 220px)",
    whiteSpace: "nowrap"
  },
  td: {
    padding: "clamp(12px, 3vw, 16px)",
    fontSize: "clamp(12px, 3.2vw, 14px)",
    color: "#334155",
    borderBottom: "1px solid #f1f5f9",
  },
  tdAmount: {
    padding: "clamp(12px, 3vw, 16px)",
    fontSize: "clamp(12px, 3.5vw, 15px)",
    textAlign: "right",
    fontWeight: "700",
    color: "#0f172a",
    borderBottom: "1px solid #f1f5f9",
  },
  tdActions: {
    padding: "clamp(12px, 3vw, 16px)",
    textAlign: "right",
    borderBottom: "1px solid #f1f5f9",
  },
  trackerInfo: { 
    fontSize: "clamp(11px, 2.8vw, 13px)", 
    color: "#64748b", 
    marginTop: 6, 
    lineHeight: 1.5,
    wordBreak: "break-word"
  },
  agentInfo: { 
    fontSize: "clamp(11px, 3vw, 13px)", 
    fontWeight: "600", 
    marginTop: 6, 
    color: "#3b82f6",
    wordBreak: "break-word"
  },
  actionButtons: {
    display: "flex",
    flexWrap: "nowrap",
    gap: "clamp(6px, 1.5vw, 10px)",
    justifyContent: "flex-end",
    alignItems: "center",
    overflow: "auto",
    minHeight: "clamp(36px, 8vw, 44px)"
  },
  invoiceBtn: {
    padding: "clamp(7px, 2vw, 8px) clamp(10px, 2.5vw, 14px)",
    background: "#eff6ff",
    color: "#3b82f6",
    border: "1px solid #bfdbfe",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: "clamp(11px, 2.8vw, 13px)",
    fontWeight: "600",
    whiteSpace: "nowrap",
    minHeight: "clamp(32px, 8vw, 36px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease"
  },
  salesTaxBtn: {
    padding: "clamp(7px, 2vw, 8px) clamp(10px, 2.5vw, 14px)",
    background: "#f5f3ff",
    color: "#7c3aed",
    border: "1px solid #ddd6fe",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: "clamp(11px, 2.8vw, 13px)",
    fontWeight: "600",
    whiteSpace: "nowrap",
    minHeight: "clamp(32px, 8vw, 36px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease"
  },
  receiptBtn: {
    padding: "clamp(7px, 2vw, 8px) clamp(10px, 2.5vw, 14px)",
    background: "#f0fdf4",
    color: "#16a34a",
    border: "1px solid #bbf7d0",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: "clamp(11px, 2.8vw, 13px)",
    fontWeight: "600",
    whiteSpace: "nowrap",
    minHeight: "clamp(32px, 8vw, 36px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease"
  },
  deleteBtn: {
    padding: "clamp(7px, 2vw, 8px) clamp(10px, 2.5vw, 14px)",
    background: "#fef2f2",
    color: "#ef4444",
    border: "1px solid #fecaca",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: "clamp(11px, 2.8vw, 13px)",
    fontWeight: "600",
    whiteSpace: "nowrap",
    minHeight: "clamp(32px, 8vw, 36px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease"
  },
  previewHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "clamp(12px, 3vw, 20px)",
    borderBottom: "1px solid #e2e8f0",
    paddingBottom: "clamp(10px, 3vw, 15px)",
    flexWrap: "wrap",
    gap: "clamp(10px, 2.5vw, 15px)"
  },
  closeBtn: {
    padding: "clamp(7px, 2vw, 9px) clamp(14px, 3vw, 20px)",
    background: "#f1f5f9",
    color: "#475569",
    borderRadius: 12,
    cursor: "pointer",
    border: "1px solid #e2e8f0",
    fontWeight: "600",
    fontSize: "clamp(12px, 3vw, 14px)"
  },
  emptyCell: {
    textAlign: "center",
    padding: "clamp(30px, 10vw, 60px) clamp(16px, 4vw, 20px)",
    fontSize: "clamp(14px, 3.5vw, 16px)",
    color: "#94a3b8",
    background: "#fff"
  },
};

function chipStyle(status) {
  const isReceived = status === "RECEIVED";
  return {
    padding: "5px 12px",
    borderRadius: 14,
    fontSize: "11px",
    fontWeight: 800,
    background: isReceived ? "#dcfce7" : "#dbeafe",
    color: isReceived ? "#166534" : "#1e40af",
    textTransform: "uppercase"
  };
}

function paymentChipStyle(mode) {
  const isCash = (mode || "Cash") === "Cash";
  const isCheck = (mode || "Cash") === "Check";
  return {
    padding: "5px 12px",
    borderRadius: 14,
    fontSize: "11px",
    fontWeight: 800,
    background: isCash
      ? "#ffedd5"
      : isCheck
        ? "#f3e8ff"
        : "#dcfce7",
    color: isCash ? "#9a3412" : isCheck ? "#6b21a8" : "#166534",
    textTransform: "uppercase"
  };
}