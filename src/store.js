import { useEffect, useReducer, useState } from "react";
import { api } from "./api";

export const BANKS = [
  { key: "BANK_ISLAMI", label: "Bank Islami" },
  { key: "HBL", label: "HBL" },
  { key: "CASH", label: "Cash in Hand" },
];

function uid() {
  return Math.random().toString(16).slice(2) + "-" + Date.now().toString(16);
}

const initialState = {
  companyName: "Secure Path Solutions",
  openingBalances: { BANK_ISLAMI: 0, HBL: 0, CASH: 0 },
  receivings: [], // {id, party, amount, date, notes, status, bank}  status: PENDING|RECEIVED
  payments: []    // {id, party, category, amount, date, notes, bank}
};

function safeNumber(n) {
  const x = Number(n);
  return Number.isFinite(x) ? x : 0;
}

function reducer(state, action) {
  switch (action.type) {
    case "LOAD":
      return action.payload ?? state;

    case "SET_COMPANY_NAME":
      return { ...state, companyName: String(action.payload || "") };

    case "SET_OPENING_BALANCE":
      return {
        ...state,
        openingBalances: {
          ...state.openingBalances,
          [action.payload.bank]: safeNumber(action.payload.value)
        }
      };

    case "ADD_RECEIVING":
      return {
        ...state,
        receivings: [
          {
            id: uid(),
            status: action.payload.status || "PENDING",
            category: action.payload.category || "",  
            ...action.payload,
            amount: safeNumber(action.payload.amount)
          },
          ...state.receivings
        ]
      };

    case "UPDATE_RECEIVING":
      return {
        ...state,
        receivings: state.receivings.map((r) => {
          if (r.id !== action.payload.id) return r;
          return {
            ...r,
            ...action.payload.data,
            amount: safeNumber(action.payload.data.amount)
          };
        })
      };

    case "TOGGLE_RECEIVING_STATUS":
      return {
        ...state,
        receivings: state.receivings.map((r) => {
          if (r.id !== action.payload) return r;
          const next = r.status === "PENDING" ? "RECEIVED" : "PENDING";
          return { ...r, status: next };
        })
      };

    case "DELETE_RECEIVING":
      return { ...state, receivings: state.receivings.filter((r) => r.id !== action.payload) };

    case "ADD_PAYMENT":
      return {
        ...state,
        payments: [
          {
            id: uid(),
            category: action.payload.category || "", // ✅ default
            ...action.payload,
            amount: safeNumber(action.payload.amount)
          },
          ...state.payments
        ]
      };

    case "DELETE_PAYMENT":
      return { ...state, payments: state.payments.filter((p) => p.id !== action.payload) };

    default:
      return state;
  }
}

export function useAccountingStore() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    const s = await api.getState();
    dispatch({ type: "LOAD", payload: s });
  }

  // initial load from server
  useEffect(() => {
    (async () => {
      try {
        await refresh();
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // push every change to server (simple approach)
  useEffect(() => {
    if (loading) return;
    api.putState(state).catch(() => {
      // if server is down, keep UI working but show later if needed
    });
  }, [state, loading]);

  const actions = {
    refresh,
    setCompanyName: (v) => dispatch({ type: "SET_COMPANY_NAME", payload: v }),
    setOpeningBalance: (bank, value) => dispatch({ type: "SET_OPENING_BALANCE", payload: { bank, value } }),

    addReceiving: (payload) => dispatch({ type: "ADD_RECEIVING", payload }),
    updateReceiving: (id, data) => dispatch({ type: "UPDATE_RECEIVING", payload: { id, data } }),
    toggleReceivingStatus: (id) => dispatch({ type: "TOGGLE_RECEIVING_STATUS", payload: id }),
    deleteReceiving: (id) => dispatch({ type: "DELETE_RECEIVING", payload: id }),

    addPayment: (payload) => dispatch({ type: "ADD_PAYMENT", payload }),
    deletePayment: (id) => dispatch({ type: "DELETE_PAYMENT", payload: id })
  };

  return { state, actions, loading };
}

export function calcSummary(state) {
  const openingByBank = state.openingBalances || { BANK_ISLAMI: 0, HBL: 0, CASH: 0 };

  const receivedByBank = { BANK_ISLAMI: 0, HBL: 0, CASH: 0 };
  const paidByBank = { BANK_ISLAMI: 0, HBL: 0, CASH: 0 };
  const pendingReceivable = {};

  // Safe loop — null/undefined entries ko skip karo
  for (const r of (state.receivings || [])) {
    // Agar r null/undefined ya object nahi hai → skip
    if (!r || typeof r !== 'object') continue;

    const bank = r.bank || "BANK_ISLAMI";
    const amt = Number(r.amount) || 0;

    if (r.status === "RECEIVED") {
      receivedByBank[bank] = (receivedByBank[bank] || 0) + amt;
    } else {
      pendingReceivable[r.party] = (pendingReceivable[r.party] || 0) + amt;
    }
  }

  for (const p of (state.payments || [])) {
    if (!p || typeof p !== 'object') continue;

    const bank = p.bank || "BANK_ISLAMI";
    const amt = Number(p.amount) || 0;
    paidByBank[bank] = (paidByBank[bank] || 0) + amt;
  }

  const bankBalanceByBank = {};
  for (const b of Object.keys(openingByBank)) {
    bankBalanceByBank[b] = (Number(openingByBank[b]) || 0) + (receivedByBank[b] || 0) - (paidByBank[b] || 0);
  }

  const totalReceived = Object.values(receivedByBank).reduce((a, b) => a + b, 0);
  const totalPaid = Object.values(paidByBank).reduce((a, b) => a + b, 0);
  const totalOpening = Object.values(openingByBank).reduce((a, b) => a + (Number(b) || 0), 0);
  const totalBankBalance = Object.values(bankBalanceByBank).reduce((a, b) => a + b, 0);
  const totalPending = Object.values(pendingReceivable).reduce((a, b) => a + b, 0);

  return {
    openingByBank,
    receivedByBank,
    paidByBank,
    bankBalanceByBank,
    totalOpening,
    totalReceived,
    totalPaid,
    totalBankBalance,
    totalPending
  };
}

export function toMoney(n) {
  return new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR" }).format(n || 0);
}

export function makeCsv(rows) {
  const esc = (v) => `"${String(v ?? "").replaceAll('"', '""')}"`;
  return rows.map((r) => r.map(esc).join(",")).join("\n");
}

export function downloadText(filename, text, mime = "text/plain") {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}