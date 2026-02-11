import React, { useEffect, useState } from "react";
import { BANKS, toMoney } from "../store";

function StatCard({ title, value, hint, variant = "default" }) {
  const variants = {
    blue: {
      bg: "linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)",
      hoverBg: "linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)",
      shadow: "0 10px 25px rgba(59, 130, 246, 0.2)",
      hoverShadow: "0 20px 40px rgba(59, 130, 246, 0.4)",
      text: "#fff",
      hintColor: "rgba(255,255,255,0.8)",
    },
    default: {
      bg: "rgba(255, 255, 255, 0.7)",
      hoverBg: "rgba(255, 255, 255, 0.9)",
      shadow: "0 8px 32px rgba(31, 38, 135, 0.07)",
      hoverShadow: "0 12px 40px rgba(31, 38, 135, 0.15)",
      border: "1px solid rgba(255, 255, 255, 0.18)",
      hoverBorder: "1px solid #3b82f6",
      text: "#1e293b",
      hintColor: "#64748b",
    },
  };
  const style = variants[variant] || variants.default;

  return (
    <div
      style={{
        background: style.bg,
        color: style.text,
        borderRadius: "20px",
        padding: "24px 28px",
        boxShadow: style.shadow,
        border: style.border || "none",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        width: "100%",
        boxSizing: "border-box",
        minWidth: "0",
      }}
    >
      <div
        style={{
          fontSize: "12px",
          fontWeight: "700",
          opacity: 0.6,
          textTransform: "uppercase",
          letterSpacing: "1px",
        }}
      >
        {title}
      </div>
      <div style={{ fontSize: "clamp(22px, 6vw, 26px)", fontWeight: "800" }}>
        {value}
      </div>
      {hint && (
        <div
          style={{
            fontSize: "12px",
            color: style.hintColor,
            marginTop: "4px",
            fontWeight: "500",
          }}
        >
          {hint}
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const [summary, setSummary] = useState({
    totalAssets: 0, 
    totalReceived: 0,
    totalPending: 0,
    totalPaid: 0,
    bankBalanceByBank: {},
    receivedByBank: {},
    pendingByBank: {},
    paidByBank: {},
    cashInHand: {
      received: 0,
      paid: 0,
      pending: 0,
      balance: 0,
    },
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchState() {
      try {
        const [resState, resPayments, resSalaries, resInventory] =
          await Promise.all([
            fetch(
              "https://accounts-sps-backend-git-main-secure-path-solutions-projects.vercel.app/api/state",
            ),
            fetch(
              "https://accounts-sps-backend-git-main-secure-path-solutions-projects.vercel.app/api/payments",
            ),
            fetch(
              "https://accounts-sps-backend-git-main-secure-path-solutions-projects.vercel.app/api/salaries",
            ),
            fetch(
              "https://accounts-sps-backend-git-main-secure-path-solutions-projects.vercel.app/api/inventory-requests",
            ),
          ]);

        if (
          !resState.ok ||
          !resPayments.ok ||
          !resSalaries.ok ||
          !resInventory.ok
        ) {
          throw new Error("One or more API calls failed");
        }

        const stateData = await resState.json();
        const payments = await resPayments.json();
        const salaries = await resSalaries.json();
        const inventoryRequests = await resInventory.json();

        const normalizeBankKey = (bankName) => {
          if (!bankName) return "CASH";
          const b = bankName.trim().toLowerCase();
          if (b === "bank islami" || b === "islamic bank") return "BANK_ISLAMI";
          if (b === "hbl") return "HBL";
          return bankName.toUpperCase().replace(/\s+/g, "_");
        };

        const openingBalances = stateData.openingBalances || {};

        let bankBalanceByBank = { ...openingBalances };

        let receivedByBank = {};
        let pendingByBank = {};
        let paidByBank = {};

        let cashInHand = {
          received: 0,
          paid: 0,
          pending: 0,
          balance: Number(openingBalances.CASH || 0),
        };

        let totalReceived = 0;
        let totalPending = 0;
        let totalPaid = 0;

        const processTransaction = (
          item,
          modeField,
          bankField,
          amountField,
          statusField,
        ) => {
          const amount = Number(item[amountField]) || 0;
          if (amount === 0) return;

          const status = (item[statusField] || "").toLowerCase().trim();
          const mode = (item[modeField] || "").toLowerCase().trim();
          const bank = normalizeBankKey(item[bankField]);

          const isCash = mode === "cash" || bank === "CASH" || !item[bankField];

          if (isCash) {
            if (status === "received") {
              cashInHand.received += amount;
              cashInHand.balance += amount;
              totalReceived += amount;
            } else if (status === "pending" || status === "unpaid") {
              cashInHand.pending += amount;
              totalPending += amount;
            } else if (status === "paid") {
              cashInHand.paid += amount;
              cashInHand.balance -= amount;
              totalPaid += amount;
            }
            return;
          }

          // Bank transaction
          if (status === "received") {
            receivedByBank[bank] = (receivedByBank[bank] || 0) + amount;
            bankBalanceByBank[bank] = (bankBalanceByBank[bank] || 0) + amount;
            totalReceived += amount;
          } else if (status === "pending" || status === "unpaid") {
            pendingByBank[bank] = (pendingByBank[bank] || 0) + amount;
            totalPending += amount;
          } else if (status === "paid") {
            paidByBank[bank] = (paidByBank[bank] || 0) + amount;
            bankBalanceByBank[bank] = (bankBalanceByBank[bank] || 0) - amount;
            totalPaid += amount;
          }
        };

        (stateData.receivings || []).forEach((r) =>
          processTransaction(r, "mode", "bank", "amount", "status"),
        );
        (payments || []).forEach((p) =>
          processTransaction(p, "paymentMode", "bank", "amount", "status"),
        );
        (salaries || []).forEach((s) =>
          processTransaction(s, "paymentMode", "bank", "amount", "status"),
        );
        (inventoryRequests || []).forEach((r) => {
          if (r.receipt)
            processTransaction(
              r.receipt,
              "mode",
              "bank",
              "amount",
              "paymentStatus",
            );
        });

        const totalBankBalances = Object.values(bankBalanceByBank).reduce(
          (sum, val) => sum + (Number(val) || 0),
          0,
        );

        const netCashEffect = cashInHand.received - cashInHand.paid;

        const totalAssets = totalBankBalances + netCashEffect;
       
        setSummary({
          totalAssets,
          totalReceived,
          totalPending,
          totalPaid,
          bankBalanceByBank,
          receivedByBank,
          pendingByBank,
          paidByBank,
          cashInHand,
        });

        setLoading(false);
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to load dashboard data");
        setLoading(false);
      }
    }

    fetchState();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <h2 style={{ color: "#64748b", fontWeight: "600" }}>
          Loading Dashboard...
        </h2>
      </div>
    );
  }

  if (error)
    return (
      <div style={{ padding: "40px", color: "red", textAlign: "center" }}>
        Error: {error}
      </div>
    );

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "clamp(24px, 5vw, 40px) clamp(16px, 4vw, 24px)",
        backgroundColor: "#f8fafc",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
        {/* Header */}
        <div
          style={{
            marginBottom: "40px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            alignItems: "flex-start",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "clamp(28px, 7vw, 32px)",
                fontWeight: "800",
                color: "#0f172a",
                margin: 0,
              }}
            >
              Finance <span style={{ color: "#3b82f6" }}>Dashboard</span>
            </h1>
            <p
              style={{
                color: "#64748b",
                margin: "4px 0 0",
                fontSize: "clamp(14px, 4vw, 16px)",
                fontWeight: "500",
              }}
            >
              Monitoring real-time cashflow and bank assets
            </p>
          </div>
          <div
            style={{
              padding: "8px 16px",
              background: "#fff",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
              fontSize: "14px",
              fontWeight: "600",
              color: "black",
            }}
          >
            Today: {new Date().toLocaleDateString()}
          </div>
        </div>

        {/* Top Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "24px",
            marginBottom: "48px",
          }}
        >
          <StatCard
            title="Total Balance"
            value={toMoney(summary.totalAssets)}
            variant="blue"
            hint="All banks + net cash in hand"
          />
          <StatCard
            title="Total Received"
            value={toMoney(summary.totalReceived)}
            hint="Status: received"
          />
          <StatCard
            title="Total Paid"
            value={toMoney(summary.totalPaid)}
            hint="Operational expenses"
          />
          <StatCard
            title="Pending"
            value={toMoney(summary.totalPending)}
            hint="Status: pending / unpaid"
          />
          <StatCard
            title="Cash in Hand"
            value={toMoney(summary.cashInHand.balance || 0)}
            hint="Opening + received - paid"
          />
        </div>

        {/* Accounts Breakdown */}
        <div
          style={{
            background: "#fff",
            borderRadius: "24px",
            padding: "clamp(20px, 5vw, 32px)",
            boxShadow: "0 20px 50px rgba(0,0,0,0.04)",
            border: "1px solid #f1f5f9",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "32px",
            }}
          >
            <div
              style={{
                width: "4px",
                height: "24px",
                background: "#3b82f6",
                borderRadius: "10px",
              }}
            ></div>
            <h2
              style={{
                fontSize: "clamp(20px, 5.5vw, 22px)",
                fontWeight: "800",
                color: "#0f172a",
                margin: 0,
              }}
            >
              Accounts Breakdown
            </h2>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "clamp(16px, 4vw, 24px)",
            }}
          >
            {BANKS.map((b) => {
              const isCash = b.key === "CASH";
              const balance = isCash
                ? summary.cashInHand.balance
                : summary.bankBalanceByBank[b.key] || 0;
              const received = isCash
                ? summary.cashInHand.received
                : summary.receivedByBank[b.key] || 0;
              const paid = isCash
                ? summary.cashInHand.paid
                : summary.paidByBank[b.key] || 0;
              const pending = isCash
                ? summary.cashInHand.pending
                : summary.pendingByBank[b.key] || 0;

              return (
                <div
                  key={b.key}
                  style={{
                    width: "100%",
                    padding: "24px",
                    borderRadius: "20px",
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    boxSizing: "border-box",
                    display: "flex",
                    flexDirection: "column",
                    gap: "20px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: "12px",
                    }}
                  >
                    <span
                      style={{
                        fontWeight: "700",
                        fontSize: "clamp(15px, 4.2vw, 16px)",
                        color: "#334155",
                      }}
                    >
                      {b.label}
                    </span>
                    <span
                      style={{
                        fontSize: "clamp(20px, 5.8vw, 24px)",
                        fontWeight: "800",
                        color: "#2563eb",
                      }}
                    >
                      {toMoney(balance)}
                    </span>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "clamp(12px, 3.5vw, 16px)",
                      background: "#fff",
                      padding: "16px",
                      borderRadius: "16px",
                      border: "1px solid #f1f5f9",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <div
                        style={{
                          color: "#94a3b8",
                          fontSize: "clamp(10px, 3vw, 11px)",
                          fontWeight: "700",
                          textTransform: "uppercase",
                        }}
                      >
                        Received
                      </div>
                      <div
                        style={{
                          fontWeight: "800",
                          color: "#10b981",
                          fontSize: "clamp(14px, 4vw, 16px)",
                        }}
                      >
                        {toMoney(received)}
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <div
                        style={{
                          color: "#94a3b8",
                          fontSize: "clamp(10px, 3vw, 11px)",
                          fontWeight: "700",
                          textTransform: "uppercase",
                        }}
                      >
                        Paid
                      </div>
                      <div
                        style={{
                          fontWeight: "800",
                          color: "#ef4444",
                          fontSize: "clamp(14px, 4vw, 16px)",
                        }}
                      >
                        {toMoney(paid)}
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <div
                        style={{
                          color: "#94a3b8",
                          fontSize: "clamp(10px, 3vw, 11px)",
                          fontWeight: "700",
                          textTransform: "uppercase",
                        }}
                      >
                        Pending
                      </div>
                      <div
                        style={{
                          fontWeight: "800",
                          color: "#f59e0b",
                          fontSize: "clamp(14px, 4vw, 16px)",
                        }}
                      >
                        {toMoney(pending)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
