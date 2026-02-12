import React, { useEffect, useMemo, useState } from "react";
import { BANKS } from "../store"; 

export default function Settings({ state, actions }) {
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(state?.companyName || "");

  const bankKeys = useMemo(() => BANKS.map((b) => b.key), []);

  const [balDraft, setBalDraft] = useState(() => {
    const ob = state?.openingBalances || {};
    const obj = {};
    bankKeys.forEach((k) => {
      obj[k] = String(ob?.[k] ?? 0);
    });
    return obj;
  });

  
  useEffect(() => {
    setNameDraft(state?.companyName || "");

    const ob = state?.openingBalances || {};
    setBalDraft((prev) => {
      const next = { ...prev };
      bankKeys.forEach((k) => {
        next[k] = String(ob?.[k] ?? 0);
      });
      return next;
    });
  }, [state?.companyName, state?.openingBalances, bankKeys]);

  const saveCompanyName = () => {
    actions.setCompanyName(nameDraft.trim());
    setEditingName(false);
  };

  const saveOpeningFor = (key) => {
    const value = balDraft[key];
    // optional: اگر خالی ہے تو 0 سیٹ کر دو
    actions.setOpeningBalance(key, value === "" ? "0" : value);
  };

  const saveAllOpenings = () => {
    BANKS.forEach((b) => {
      const value = balDraft[b.key];
      actions.setOpeningBalance(b.key, value === "" ? "0" : value);
    });
  };

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.headerCard}>
        <div>
          <div style={styles.title}>Settings</div>
          <div style={styles.subtitle}>
            Manage company name & opening balances (auto-saved)
          </div>
        </div>

        <div style={styles.headerBadges}>
          <span style={styles.badge}>Auto-saved</span>
        </div>
      </div>

      {/* Main grid */}
      <div style={styles.grid}>
        {/* Company Name Card */}
        <div style={styles.card}>
          <div style={styles.cardTop}>
            <div>
              <div style={styles.cardTitle}>Company Information</div>
              <div style={styles.cardHint}>Update company name</div>
            </div>

            {!editingName ? (
              <button
                style={styles.smallBtn}
                onClick={() => setEditingName(true)}
              >
                Edit
              </button>
            ) : (
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  style={styles.cancelBtn}
                  onClick={() => {
                    setNameDraft(state?.companyName || "");
                    setEditingName(false);
                  }}
                >
                  Cancel
                </button>
                <button style={styles.primaryBtn} onClick={saveCompanyName}>
                  Save
                </button>
              </div>
            )}
          </div>

          {!editingName ? (
            <div style={styles.readRow}>
              <div style={styles.readLabel}>Company Name</div>
              <div style={styles.readValue}>
                {state?.companyName || "Not set"}
              </div>
            </div>
          ) : (
            <div style={{ marginTop: 16 }}>
              <label style={styles.label}>Company Name</label>
              <input
                style={styles.input}
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                placeholder="Enter company name"
              />
              <div style={styles.mutedLine}>
                Changes will be saved automatically.
              </div>
            </div>
          )}
        </div>

        {/* Opening Balances Card (بینک + کیش) */}
        <div style={{ ...styles.card, gridColumn: "1 / -1" }}>
          <div style={styles.cardTop}>
            <div>
              <div style={styles.cardTitle}>Opening Balances</div>
              <div style={styles.cardHint}>
                Set initial balances for each bank account and cash in hand
              </div>
            </div>

            <button style={styles.primaryBtn} onClick={saveAllOpenings}>
              Save All
            </button>
          </div>

          <div style={styles.bankGrid}>
            {BANKS.map((b) => (
              <div
                key={b.key}
                style={{
                  ...styles.bankCard,
                  ...(b.isCash && {
                    background: "#f0fdf4",
                    borderColor: "#86efac",
                  }),
                }}
              >
                <div style={styles.bankHeader}>
                  <div style={styles.bankName}>
                    {b.label}
                    {b.isCash && (
                      <span
                        style={{
                          ...styles.miniBadge,
                          background: "rgba(34,197,94,0.1)",
                          color: "#15803d",
                          borderColor: "rgba(34,197,94,0.2)",
                          marginLeft: 8,
                        }}
                      >
                        Cash
                      </span>
                    )}
                  </div>
                  <span style={styles.miniBadge}>PKR</span>
                </div>

                <label style={styles.label}>Opening Balance</label>
                <input
                  style={styles.input}
                  value={balDraft[b.key] ?? "0"}
                  onChange={(e) =>
                    setBalDraft((prev) => ({
                      ...prev,
                      [b.key]: e.target.value,
                    }))
                  }
                  placeholder="0"
                  type="number"
                  min="0"
                  step="1"
                />

                <div style={styles.balanceFooter}>
                  <div style={styles.mutedLineSmall}>
                    Saved:{" "}
                    <strong>{state?.openingBalances?.[b.key] ?? 0}</strong>
                  </div>
                  <button
                    style={styles.smallBtn}
                    onClick={() => saveOpeningFor(b.key)}
                  >
                    Save
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div style={styles.footerNote}>
            Note: These values (including Cash in Hand) are used as starting
            balances and persist after refresh.
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Light Theme Styles ────────────────────────────────────────────────────
const styles = {
  page: {
    padding: "24px",
    maxWidth: "1200px",
    margin: "0 auto",
    color: "#111827",
    minHeight: "100vh",
    fontFamily: "Inter, system-ui, sans-serif",
  },

  headerCard: {
    padding: "20px 24px",
    borderRadius: "16px",
    background: "#ffffff",
    border: "1px solid #d1d5db",
    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 32,
  },

  title: { fontSize: 28, fontWeight: 800, color: "#111827", margin: 0 },

  subtitle: { fontSize: 14, color: "#4b5563", marginTop: 4 },

  headerBadges: { display: "flex", gap: 12, flexWrap: "wrap" },

  badge: {
    padding: "6px 14px",
    borderRadius: "999px",
    fontSize: 13,
    fontWeight: 600,
    background: "rgba(59,130,246,0.1)",
    color: "#3b82f6",
    border: "1px solid rgba(59,130,246,0.2)",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: 24,
  },

  card: {
    background: "#ffffff",
    borderRadius: 16,
    border: "1px solid #d1d5db",
    padding: 24,
    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
  },

  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
    flexWrap: "wrap",
    marginBottom: 20,
  },

  cardTitle: { fontSize: 18, fontWeight: 700, color: "#111827" },

  cardHint: { fontSize: 13, color: "#4b5563", marginTop: 4 },

  readRow: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    background: "#f9fafb",
    border: "1px solid #d1d5db",
  },

  readLabel: { fontSize: 13, color: "#4b5563", fontWeight: 600 },

  readValue: { marginTop: 6, fontSize: 17, fontWeight: 700, color: "#111827" },

  label: {
    display: "block",
    fontSize: 13,
    color: "#4b5563",
    fontWeight: 600,
    marginBottom: 8,
    textTransform: "uppercase",
  },

  input: {
    width: "100%",
    padding: "12px 16px",
    background: "#f9fafb",
    border: "1px solid #d1d5db",
    borderRadius: "10px",
    color: "#111827",
    fontSize: 15,
    outline: "none",
    transition: "all 0.2s",
  },

  mutedLine: { marginTop: 8, fontSize: 12, color: "#6b7280" },

  mutedLineSmall: { fontSize: 12, color: "#6b7280" },

  smallBtn: {
    height: 36,
    padding: "0 16px",
    borderRadius: 10,
    border: "1px solid #d1d5db",
    background: "#ffffff",
    color: "#374151",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s",
  },

  cancelBtn: {
    height: 36,
    padding: "0 16px",
    borderRadius: 10,
    border: "1px solid #fecaca",
    background: "#fef2f2",
    color: "#b91c1c",
    fontWeight: 600,
    cursor: "pointer",
  },

  primaryBtn: {
    height: 36,
    padding: "0 20px",
    borderRadius: 10,
    background: "#3b82f6",
    color: "white",
    border: "none",
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.2s",
  },

  bankGrid: {
    marginTop: 20,
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: 16,
  },

  bankCard: {
    padding: 16,
    borderRadius: 12,
    background: "#f9fafb",
    border: "1px solid #d1d5db",
  },

  bankHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  bankName: { fontSize: 17, fontWeight: 800, color: "#111827" },

  miniBadge: {
    padding: "4px 10px",
    borderRadius: 999,
    fontSize: 12,
    background: "rgba(59,130,246,0.1)",
    color: "#3b82f6",
    border: "1px solid rgba(59,130,246,0.2)",
  },

  balanceFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },

  footerNote: {
    marginTop: 24,
    fontSize: 13,
    color: "#4b5563",
    fontStyle: "italic",
    textAlign: "center",
  },
};

if (typeof window !== "undefined" && window.innerWidth < 900) {
  styles.grid = { ...styles.grid, gridTemplateColumns: "1fr" };
  styles.bankGrid = { ...styles.bankGrid, gridTemplateColumns: "1fr" };
}