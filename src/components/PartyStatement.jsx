import React, { useMemo, useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { BANKS } from "../store";

// --- Helper Functions ---
function toMoney(n) {
  const x = Number(n) || 0;
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    minimumFractionDigits: 0,
  }).format(x);
}

function formatMMDDYYYY(d) {
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const yy = d.getFullYear();
  return `${mm}/${dd}/${yy}`;
}

function parseMMDDYYYY(s) {
  if (!s || typeof s !== "string") return null;
  const [mm, dd, yy] = s.split("/");
  const m = Number(mm), d = Number(dd), y = Number(yy);
  if (!m || !d || !y) return null;
  const dt = new Date(y, m - 1, d);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

function inRange(date, from, to) {
  if (!date) return false;
  const t = date.getTime();
  if (from && t < from.getTime()) return false;
  if (to && t > to.getTime()) return false;
  return true;
}

// --- Main Component ---
export default function PartyStatements({ state }) {
  const receivings = (state?.receivings || []).filter(Boolean);
  const payments = (state?.payments || []).filter(Boolean);

  const parties = useMemo(() => {
    const set = new Set();
    for (const r of receivings) if (r?.party) set.add(r.party);
    for (const p of payments) if (p?.party) set.add(p.party);
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [receivings, payments]);

  const [party, setParty] = useState(parties[0] || "");
  const [from, setFrom] = useState(null);
  const [to, setTo] = useState(null);

  useEffect(() => {
    if (!party && parties.length) setParty(parties[0]);
  }, [parties, party]);

  const ledger = useMemo(() => {
    if (!party) return [];
    const items = [];

    receivings.forEach((r) => {
      if (r?.party === party) {
        const dt = parseMMDDYYYY(r.date);
        if (dt && inRange(dt, from, to)) {
          items.push({
            id: r.id || `r-${r.date}-${r.amount}`,
            date: dt,
            dateText: r.date,
            type: "IN",
            bank: r.bank || "BANK_ISLAMI",
            amount: Number(r.amount) || 0,
            notes: r.notes || "",
            status: r.status || "",
            category: r.category || "",
          });
        }
      }
    });

    payments.forEach((p) => {
      if (p?.party === party) {
        const dt = parseMMDDYYYY(p.date);
        if (dt && inRange(dt, from, to)) {
          items.push({
            id: p.id || `p-${p.date}-${p.amount}`,
            date: dt,
            dateText: p.date,
            type: "OUT",
            bank: p.bank || "BANK_ISLAMI",
            amount: Number(p.amount) || 0,
            notes: p.notes || "",
            status: "",
            category: p.category || "",
          });
        }
      }
    });

    return items.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [party, receivings, payments, from, to]);

  const totals = useMemo(() => {
    let totalIn = 0, totalOut = 0;
    ledger.forEach((x) => {
      if (x.type === "IN") totalIn += x.amount;
      else totalOut += x.amount;
    });
    return { totalIn, totalOut, net: totalIn - totalOut };
  }, [ledger]);

  const bankLabel = (key) => BANKS.find((b) => b.key === key)?.label || key;

  const exportCsv = () => {
    const rows = [
      ["Date", "Type", "Party", "Category", "Status", "Bank", "Amount", "Notes"],
      ...ledger.map((x) => [
        x.dateText, x.type, party, x.category, x.status, bankLabel(x.bank), x.amount, x.notes.replace(/\n/g, " ")
      ]),
    ];
    const csv = rows.map(r => r.map(v => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Statement_${party}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div style={styles.page}>
      <style>{`
        .sps-input {
          width: 100%;
          padding: 10px 12px;
          border-radius: 10px;
          border: 1px solid #d1d5db;
          background: #ffffff;
          color: #111827;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .sps-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59,130,246,0.15);
        }
        .sps-input::placeholder {
          color: #9ca3af;
        }
        .table-row:hover {
          background-color: #f1f5f9;
        }
      `}</style>

      <div style={styles.top}>
        <div>
          <h1 style={styles.h1}>Party Statement</h1>
          <p style={styles.sub}>Track financial history and ledger for your selected parties.</p>
        </div>
        <button style={styles.btn} onClick={exportCsv} disabled={!ledger.length}>
          Export Statement
        </button>
      </div>

      <div style={styles.card}>
        <div style={styles.filtersRow}>
          <div style={styles.field}>
            <label style={styles.label}>Select Party</label>
            <select className="sps-input" value={party} onChange={(e) => setParty(e.target.value)}>
              {parties.map((p) => <option key={p} value={p}>{p}</option>)}
              {parties.length === 0 && <option>No parties found</option>}
            </select>
          </div>
          <div style={styles.field}>
            <label style={styles.label}>From Date</label>
            <DatePicker
              selected={from}
              onChange={setFrom}
              dateFormat="MM/dd/yyyy"
              className="sps-input"
              placeholderText="Start date"
              isClearable
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>To Date</label>
            <DatePicker
              selected={to}
              onChange={setTo}
              dateFormat="MM/dd/yyyy"
              className="sps-input"
              placeholderText="End date"
              isClearable
            />
          </div>
          <button style={styles.smallBtn} onClick={() => { setFrom(null); setTo(null); }}>
            Reset
          </button>
        </div>

        <div style={styles.totalsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Total Receivings (IN)</div>
            <div style={{ ...styles.statValue, color: "#059669" }}>
              {toMoney(totals.totalIn)}
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Total Payments (OUT)</div>
            <div style={{ ...styles.statValue, color: "#dc2626" }}>
              {toMoney(totals.totalOut)}
            </div>
          </div>
          <div style={{
            ...styles.statCard,
            background: totals.net >= 0 ? "#ecfdf5" : "#fee2e2",
            borderColor: totals.net >= 0 ? "#bbf7d0" : "#fecaca",
          }}>
            <div style={styles.statLabel}>Net Balance</div>
            <div style={{
              ...styles.statValue,
              color: totals.net >= 0 ? "#059669" : "#dc2626",
            }}>
              {toMoney(totals.net)}
            </div>
          </div>
        </div>
      </div>

      <div style={styles.card}>
        <div style={styles.cardTitle}>Transaction Ledger</div>
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Type</th>
                <th style={styles.th}>Bank Account</th>
                <th style={styles.th}>Category</th>
                <th style={styles.thRight}>Amount</th>
                <th style={styles.th}>Notes</th>
              </tr>
            </thead>
            <tbody>
              {ledger.length === 0 ? (
                <tr>
                  <td style={{ ...styles.td, textAlign: 'center' }} colSpan={6}>
                    No transactions found for this period.
                  </td>
                </tr>
              ) : (
                ledger.map((x) => (
                  <tr key={x.id} className="table-row">
                    <td style={styles.td}>{x.dateText}</td>
                    <td style={styles.td}>
                      <span style={x.type === "IN" ? styles.inChip : styles.outChip}>
                        {x.type}
                      </span>
                      {x.status && <span style={styles.mutedSmall}>• {x.status}</span>}
                    </td>
                    <td style={styles.td}>{bankLabel(x.bank)}</td>
                    <td style={styles.td}>{x.category || "—"}</td>
                    <td style={styles.tdRight}>{toMoney(x.amount)}</td>
                    <td style={{ ...styles.td, fontSize: 13, color: '#4b5563' }}>
                      {x.notes || "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div style={styles.footerHint}>
          Showing <b>{ledger.length}</b> records for <b>{party || "—"}</b>
        </div>
      </div>
    </div>
  );
}

// --- Updated Light Theme Styles ---
const styles = {
  page: {
    padding: "24px",
    maxWidth: "1200px",
    margin: "0 auto",
    color: "#111827",
 
    minHeight: "100vh",
    fontFamily: "Inter, system-ui, sans-serif",
  },
  top: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: 24,
  },
  h1: {
    fontSize: 28,
    fontWeight: 800,
    color: "#111827",
    margin: 0,
  },
  sub: {
    fontSize: 14,
    color: "#4b5563",
    margin: "4px 0 0 0",
  },
  card: {
    padding: 24,
    borderRadius: 16,
    border: "1px solid #d1d5db",
    background: "#ffffff",
    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: "#111827",
    marginBottom: 16,
  },
  filtersRow: {
    display: "grid",
    gridTemplateColumns: "1.3fr 1fr 1fr auto",
    gap: 16,
    alignItems: "end",
  },
  field: {
    display: "flex",
    flexDirection: "column",
  },
  label: {
    display: "block",
    fontSize: 12,
    color: "#4b5563",
    marginBottom: 6,
    fontWeight: 600,
    textTransform: "uppercase",
  },
  totalsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 16,
    marginTop: 24,
  },
  statCard: {
    padding: 20,
    borderRadius: 12,
    border: "1px solid #d1d5db",
    background: "#ffffff",
    textAlign: "center",
  },
  statLabel: {
    fontSize: 12,
    color: "#4b5563",
    fontWeight: 600,
    marginBottom: 6,
    textTransform: "uppercase",
  },
  statValue: {
    fontSize: 24,
    fontWeight: 800,
  },
  btn: {
    height: 44,
    padding: "0 24px",
    borderRadius: 10,
    background: "#3b82f6",
    color: "#ffffff",
    border: "none",
    fontWeight: 700,
    cursor: "pointer",
    transition: "background 0.2s",
  },
  smallBtn: {
    height: 40,
    padding: "0 16px",
    borderRadius: 10,
    border: "1px solid #d1d5db",
    background: "#ffffff",
    color: "#374151",
    fontWeight: 600,
    cursor: "pointer",
  },
  tableWrap: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: 900,
  },
  th: {
    textAlign: "left",
    padding: "12px 14px",
    borderBottom: "2px solid #e5e7eb",
    fontSize: 13,
    color: "#4b5563",
    fontWeight: 700,
    background: "#f9fafb",
  },
  thRight: {
    textAlign: "right",
    padding: "12px 14px",
    borderBottom: "2px solid #e5e7eb",
    fontSize: 13,
    color: "#4b5563",
    fontWeight: 700,
    background: "#f9fafb",
  },
  td: {
    padding: "14px 14px",
    borderBottom: "1px solid #e5e7eb",
    fontSize: 14,
    color: "#111827",
  },
  tdRight: {
    padding: "14px 14px",
    borderBottom: "1px solid #e5e7eb",
    textAlign: "right",
    fontWeight: 700,
    color: "#111827",
  },
  inChip: {
    padding: "4px 10px",
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 800,
    background: "#ecfdf5",
    color: "#065f46",
    border: "1px solid #a7f3d0",
  },
  outChip: {
    padding: "4px 10px",
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 800,
    background: "#fee2e2",
    color: "#991b1b",
    border: "1px solid #fecaca",
  },
  mutedSmall: {
    fontSize: 12,
    color: "#6b7280",
    marginLeft: 8,
  },
  footerHint: {
    marginTop: 16,
    fontSize: 13,
    color: "#4b5563",
    textAlign: "right",
  },
};