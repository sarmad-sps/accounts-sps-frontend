import React, { useMemo, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { BANKS } from "../store";
import Invoice from "./Invoice";

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
    setInsuranceCover("");
    setBank(BANKS?.[0]?.key || "BANK_ISLAMI");
  };

  const onAdd = (e) => {
    e.preventDefault();
    const cat = category === "Other" ? customCategory.trim() : category;

    if (!clientName.trim()) return alert("Client Name daalain");
    if (!clientAddress.trim()) return alert("Client Address daalain");
    if (!clientPhone.trim() || !/^\d{10,13}$/.test(clientPhone.trim())) {
      return alert("Client Phone Number sahi daalain (10-13 digits)");
    }
    if (!party.trim()) return alert("Company / Party name daalain");
    if (!amount || Number(amount) <= 0) return alert("Amount daalain");
    if (!dateObj) return alert("Date select karain");
    if (!cat) return alert("Category select karain");

    if (paymentMode !== "Cash" && !bank) {
      return alert("Online ya Check select kiya hai, Bank select karain");
    }

    if (category === "Tracker") {
      if (!trackerCompany) return alert("Tracker Company select karain");
      if (!trackerType) return alert("Tracker Type select karain");
      if (!vehicleType) return alert("Vehicle Type select karain");
      if (!registrationNo.trim()) return alert("Registration Number daalain");
      if (!vehicleBrand.trim()) return alert("Vehicle Brand daalain");
      if (!chassisNumber.trim()) return alert("Chassis Number daalain");
      if (!engineno.trim()) return alert("Engine Number daalain");
      if (!agentName.trim()) return alert("Agent / Installer Name daalain");
    }

    if (category === "Insurance") {
      if (!insuranceCover) return alert("Insurance cover type select karain");
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

    const newReceiving = {
      id: Date.now().toString(),
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

    actions.addReceiving(newReceiving);
    resetForm();
  };

  const onExportCSV = () => {
    const headers = [
      "Date","Client Name","Client Address","Client Phone",
      "Party","Category",
      "Tracker Company","Tracker Type","Add-on Service",
      "Vehicle Type","Registration No","Vehicle Brand",
      "Chassis Number","Engine Number","Agent Name",
      "Status","Bank","Payment Mode","Amount","Notes",
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
        <h2 style={styles.cardTitle}>Add New Receiving</h2>
        <form onSubmit={onAdd}>
          {/* Client Information */}
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

          {/* Party & Amount */}
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

          {/* Date & Status */}
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
            <div></div>
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
            <div></div>
          </div>

          {/* Bank - conditionally show only if not Cash */}
          {paymentMode !== "Cash" && (
            <div style={styles.formGrid2}>
              <div>
                <label style={styles.label}>Bank *</label>
                <select
                  style={styles.select}
                  value={bank}
                  onChange={(e) => setBank(e.target.value)}
                  required
                >
                  {BANKS.map((b) => (
                    <option key={b.key} value={b.key}>
                      {b.label}
                    </option>
                  ))}
                </select>
              </div>
              <div></div>
            </div>
          )}

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
                <option value="">Select type</option>
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
                placeholder="Optional notes..."
              />
            </div>
          </div>

          {category === "Other" && (
            <div style={{ margin: "20px 0" }}>
              <label style={styles.label}>Custom Category Name *</label>
              <input
                style={styles.input}
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="e.g. Health Insurance, Event Expense..."
                required
              />
            </div>
          )}

          {category === "Tracker" && (
            <div style={styles.trackerCard}>
              <div style={styles.trackerTitle}>Tracker Installation Details</div>

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
                    placeholder="LEB-19-1234 or ABC-567"
                    required
                  />
                </div>

                <div>
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
            <div style={{ margin: "24px 0" }}>
              <div style={styles.formGrid2}>
                <div>
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
                <div></div>
              </div>
            </div>
          )}

          <div style={styles.formActions}>
            <button type="submit" style={styles.submitBtn}>
              Add Receiving
            </button>
          </div>
        </form>
      </div>

      {/* List */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Receivings List</h2>
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Client Name</th>
                <th style={styles.th}>Phone</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Mode</th>
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
                      <div style={styles.secondaryText}>
                        {r.date} • {r.category}
                      </div>
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
            <h2 style={styles.cardTitle}>Invoice / Voucher Preview</h2>
            <button style={styles.closeBtn} onClick={() => setSelected(null)}>
              ✕ Close
            </button>
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
            <button style={styles.closeBtn} onClick={() => setSelectedReceipt(null)}>
              ✕ Close
            </button>
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

// ─── Styles ─── (same as your previous version)
const styles = {
  container: {
    padding: "clamp(16px, 4vw, 24px)",
    maxWidth: 1400,
    margin: "0 auto",
    background: "#f8fafc",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: 20,
    marginBottom: 32,
  },
  title: {
    fontSize: "clamp(26px, 5vw, 34px)",
    fontWeight: 800,
    margin: 0,
    color: "#0f172a",
  },
  summary: {
    fontSize: "clamp(14px, 3.5vw, 16px)",
    color: "#111827",
    marginTop: 8,
    fontWeight: "500",
  },
  headerActions: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    alignItems: "center",
  },
  searchInput: {
    padding: "10px 16px",
    borderRadius: 12,
    border: "1px solid #e2e8f0",
    minWidth: 280,
    flex: 1,
    fontSize: 15,
    color: "#111827",
    background: "#ffffff",
  },
  exportBtn: {
    padding: "10px 20px",
    borderRadius: 12,
    background: "#fff",
    border: "1px solid #cbd5e1",
    fontWeight: 600,
    cursor: "pointer",
  },
  card: {
    background: "#ffffff",
    borderRadius: 16,
    border: "1px solid #e2e8f0",
    padding: "clamp(20px, 4vw, 28px)",
    marginBottom: 32,
    boxShadow: "0 4px 14px rgba(0,0,0,0.04)",
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 700,
    margin: "0 0 24px 0",
    color: "#0f172a",
  },
  label: {
    fontSize: 13,
    fontWeight: 700,
    color: "#1e293b",
    marginBottom: 8,
    display: "block",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  input: {
    width: "100%",
    padding: "11px 14px",
    borderRadius: 10,
    border: "1px solid #cbd5e1",
    fontSize: 15,
    background: "#fafcff",
    color: "#111827",
  },
  select: {
    width: "100%",
    padding: "11px 14px",
    borderRadius: 10,
    border: "1px solid #cbd5e1",
    background: "#ffffff",
    fontSize: 15,
    color: "#111827",
    appearance: "none",
    backgroundImage:
      'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'8\' viewBox=\'0 0 12 8\'><path fill=\'%23334155\' d=\'M1 1l5 5 5-5\'/></svg>")',
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 14px center",
  },
  formGrid2: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "20px 24px",
    margin: "20px 0",
  },
  formGrid3: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "20px 24px",
    margin: "20px 0",
  },
  trackerCard: {
    margin: "28px 0",
    padding: 24,
    background: "#f0f9ff",
    border: "1px solid #bae6fd",
    borderRadius: 16,
  },
  trackerTitle: {
    fontSize: 19,
    fontWeight: 700,
    color: "#1e40af",
    marginBottom: 16,
  },
  formActions: {
    marginTop: 36,
    textAlign: "right",
  },
  submitBtn: {
    padding: "12px 40px",
    background: "#3b82f6",
    color: "white",
    border: "none",
    borderRadius: 12,
    fontSize: 16,
    fontWeight: 700,
    cursor: "pointer",
  },
  tableContainer: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    textAlign: "left",
    padding: "14px 16px",
    fontSize: 13,
    fontWeight: 700,
    color: "#111827",
    background: "#f8fafc",
    borderBottom: "1px solid #e2e8f0",
    textTransform: "uppercase",
  },
  thActions: {
    textAlign: "right",
    padding: "14px 16px",
    fontSize: 13,
    fontWeight: 700,
    color: "#111827",
    background: "#f8fafc",
    borderBottom: "1px solid #e2e8f0",
  },
  td: {
    padding: "14px 16px",
    borderBottom: "1px solid #f1f5f9",
    fontSize: 14.5,
    color: "#111827",
  },
  tdActions: {
    padding: "14px 16px",
    textAlign: "right",
    borderBottom: "1px solid #f1f5f9",
  },
  secondaryText: {
    fontSize: "12.5px",
    color: "#111827",
    marginTop: 4,
    fontWeight: "500",
  },
  actionButtons: {
    display: "flex",
    gap: 10,
    justifyContent: "flex-end",
    flexWrap: "wrap",
  },
  invoiceBtn: {
    padding: "8px 16px",
    background: "#eff6ff",
    color: "#2563eb",
    border: "1px solid #bfdbfe",
    borderRadius: 8,
    fontWeight: 600,
    cursor: "pointer",
  },
  receiptBtn: {
    padding: "8px 16px",
    background: "#f0fdf4",
    color: "#15803d",
    border: "1px solid #bbf7d0",
    borderRadius: 8,
    fontWeight: 600,
    cursor: "pointer",
  },
  deleteBtn: {
    padding: "8px 16px",
    background: "#fef2f2",
    color: "#dc2626",
    border: "1px solid #fecaca",
    borderRadius: 8,
    fontWeight: 600,
    cursor: "pointer",
  },
  previewHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 16,
    borderBottom: "1px solid #e2e8f0",
  },
  closeBtn: {
    padding: "8px 18px",
    background: "#f1f5f9",
    border: "1px solid #cbd5e1",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 600,
  },
  emptyCell: {
    textAlign: "center",
    padding: "60px 20px",
    color: "#111827",
    fontSize: 16,
  },
};

function chipStyle(status) {
  const received = status?.toUpperCase() === "RECEIVED";
  return {
    padding: "6px 12px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
    background: received ? "#dcfce7" : "#dbeafe",
    color: received ? "#166534" : "#1e40af",
  };
}

function paymentChipStyle(mode) {
  const m = (mode || "Cash").toLowerCase();
  let bg = "#e0f2fe", color = "#0369a1";
  if (m === "cash") { bg = "#ffedd5"; color = "#9a3412"; }
  if (m === "check") { bg = "#f3e8ff"; color = "#6b21a8"; }
  if (m === "online") { bg = "#dcfce7"; color = "#166534"; }

  return {
    padding: "6px 12px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
    background: bg,
    color,
  };
}