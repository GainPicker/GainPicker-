import React, { useState, useEffect, useRef, useCallback } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, LineChart, Line } from "recharts";

const ALL_INSTRUMENTS = [
  { name: "Stocks",            icon: "📈", desc: "Company shares on regulated exchanges worldwide." },
  { name: "Forex",             icon: "💱", desc: "Currency pairs traded 24/5 on the global FX market." },
  { name: "Options",           icon: "🔀", desc: "Contracts granting the right to buy/sell at a set price." },
  { name: "Futures",           icon: "📅", desc: "Agreements to buy/sell assets at a future date & price." },
  { name: "Bonds",             icon: "🏛️", desc: "Fixed-income debt instruments from governments or corporations." },
  { name: "ETFs",              icon: "🗂️", desc: "Exchange-traded funds tracking indices or asset baskets." },
  { name: "Mutual Funds",      icon: "🤝", desc: "Pooled vehicles managed by professional fund managers." },
  { name: "Commodities",       icon: "🌾", desc: "Physical goods like wheat, corn, and agricultural products." },
  { name: "Metals",            icon: "🥇", desc: "Precious & industrial metals including Gold and Silver." },
  { name: "Energy",            icon: "⚡", desc: "Crude Oil, Natural Gas, Brent, and energy markets." },
  { name: "Crypto",            icon: "₿",  desc: "Digital assets — Bitcoin, Ethereum, and more." },
  { name: "Synthetic Indices", icon: "🤖", desc: "Simulated 24/7 indices derived from algorithms." },
];

const generatePin = () => Math.floor(1000 + Math.random() * 9000).toString();

const INITIAL_COMMENTS = [
  { id: 1, name: "James Okafor",    email: "j.okafor@gmail.com",  country: "Nigeria 🇳🇬",  text: "GainPicker has completely changed my trading experience. I copy trades automatically and I am already in profit!", date: "2026-06-10" },
  { id: 2, name: "Liu Wei",         email: "liu.w@outlook.com",   country: "China 🇨🇳",     text: "Very professional platform. The Elite plan gives me full control of my risk. Highly recommended for serious traders.", date: "2026-06-11" },
  { id: 3, name: "Sarah Mills",     email: "s.mills@yahoo.com",   country: "UK 🇬🇧",        text: "I was skeptical at first but after 5 days of copy trading I can already see consistent gains. Amazing platform!", date: "2026-06-12" },
  { id: 4, name: "Ahmed Al-Rashid", email: "ahmed.r@gmail.com",   country: "UAE 🇦🇪",       text: "Smooth setup, real-time trade copying and excellent support. GainPicker is the best copytrading platform I have used.", date: "2026-06-13" },
  { id: 5, name: "Maria Santos",    email: "m.santos@gmail.com",  country: "Brazil 🇧🇷",    text: "The USDT payment system made it very easy for me to subscribe. I love the transparency of the master dashboard.", date: "2026-06-14" },
  { id: 6, name: "Alex Johnson",    email: "alex.j@outlook.com",  country: "Canada 🇨🇦",    text: "GainPicker gives me peace of mind. I set my risk parameters once and the platform does everything else automatically.", date: "2026-06-14" },
];

const INITIAL_SUBSCRIPTIONS = [
  { id: 1, pin: "1234", name: "Alex Johnson", email: "alex@email.com",  plan: "Pro",   expiry: "2026-12-31", status: "Active", broker: "Interactive Brokers", copyRatio: 0.5,  pnlToday: 0, totalPnl: 0, role: "client" },
  { id: 2, pin: "5678", name: "Sarah Mills",  email: "sarah@email.com", plan: "Elite", expiry: "2026-09-15", status: "Active", broker: "Binance",              copyRatio: 1.0,  pnlToday: 0, totalPnl: 0, role: "client" },
  { id: 3, pin: "3344", name: "Mark Davis",   email: "mark@email.com",  plan: "Pro",   expiry: "2026-08-01", status: "Paused", broker: "OANDA",                copyRatio: 0.75, pnlToday: 0, totalPnl: 0, role: "client" },
  { id: 4, pin: "7788", name: "Liu Wei",      email: "liu@email.com",   plan: "Elite", expiry: "2027-01-10", status: "Active", broker: "Saxo Bank",            copyRatio: 2.0,  pnlToday: 0, totalPnl: 0, role: "client" },
];

const ALPACA_ENDPOINT = "https://paper-api.alpaca.markets/v2";
const ALPACA_KEY      = "PKH5YLVEU5IHFFDW73XPBOH4RU";
const ALPACA_SECRET   = "DXKxXDQEvNKxuQjDgRkupLFcfFNrrmjk69AZ5NCg5Yz7";
const ALPACA_HEADERS  = { "APCA-API-KEY-ID": ALPACA_KEY, "APCA-API-SECRET-KEY": ALPACA_SECRET, "Content-Type": "application/json" };

const alpacaFetch = async (path) => {
  try {
    const res = await fetch(`${ALPACA_ENDPOINT}${path}`, { headers: ALPACA_HEADERS });
    if (!res.ok) throw new Error(`Alpaca error: ${res.status}`);
    return await res.json();
  } catch (e) { console.warn("Alpaca fetch failed:", e.message); return null; }
};

function useAlpacaAccount() {
  const [account, setAccount] = useState(null);
  useEffect(() => {
    const load = async () => { const d = await alpacaFetch("/account"); if (d) setAccount(d); };
    load(); const id = setInterval(load, 15000); return () => clearInterval(id);
  }, []); return account;
}
function useAlpacaPositions() {
  const [positions, setPositions] = useState([]);
  useEffect(() => {
    const load = async () => { const d = await alpacaFetch("/positions"); if (d) setPositions(d); };
    load(); const id = setInterval(load, 8000); return () => clearInterval(id);
  }, []); return positions;
}
function useAlpacaOrders() {
  const [orders, setOrders] = useState([]);
  useEffect(() => {
    const load = async () => { const d = await alpacaFetch("/orders?status=all&limit=20&direction=desc"); if (d) setOrders(d); };
    load(); const id = setInterval(load, 10000); return () => clearInterval(id);
  }, []); return orders;
}

const MASTER_PIN  = "9999";
const MASTER_USER = { pin: "9999", name: "Master Trader", plan: "Master", expiry: "2099-01-01", role: "master" };

const PRICE_SEEDS = {
  "EUR/USD":  { price: 1.0842, spread: 0.0002, step: 0.0003, type: "Forex"  },
  "GBP/JPY":  { price: 196.42, spread: 0.03,   step: 0.08,   type: "Forex"  },
  "XAU/USD":  { price: 2323.0, spread: 0.30,   step: 1.50,   type: "Metal"  },
  "BTC/USDT": { price: 67450,  spread: 12,     step: 180,    type: "Crypto" },
  "ETH/USDT": { price: 3512,   spread: 1.5,    step: 22,     type: "Crypto" },
  "AAPL":     { price: 213.40, spread: 0.05,   step: 0.40,   type: "Stock"  },
  "TSLA":     { price: 178.50, spread: 0.08,   step: 0.60,   type: "Stock"  },
  "WTI/USD":  { price: 78.42,  spread: 0.04,   step: 0.20,   type: "Energy" },
};

const DAILY_PERFORMANCE = [
  { date: "Jun 5",  pnl: 312,  trades: 7,  winRate: 71 },
  { date: "Jun 6",  pnl: -145, trades: 5,  winRate: 40 },
  { date: "Jun 7",  pnl: 489,  trades: 9,  winRate: 78 },
  { date: "Jun 8",  pnl: 203,  trades: 6,  winRate: 67 },
  { date: "Jun 9",  pnl: 678,  trades: 11, winRate: 82 },
  { date: "Jun 10", pnl: -89,  trades: 4,  winRate: 50 },
  { date: "Jun 11", pnl: 534,  trades: 8,  winRate: 75 },
  { date: "Jun 12", pnl: 291,  trades: 7,  winRate: 71 },
  { date: "Jun 13", pnl: 445,  trades: 9,  winRate: 78 },
  { date: "Jun 14", pnl: 309,  trades: 5,  winRate: 80 },
];

const EQUITY_CURVE = [
  { date: "Jun 5",  equity: 10312 }, { date: "Jun 6",  equity: 10167 },
  { date: "Jun 7",  equity: 10656 }, { date: "Jun 8",  equity: 10859 },
  { date: "Jun 9",  equity: 11537 }, { date: "Jun 10", equity: 11448 },
  { date: "Jun 11", equity: 11982 }, { date: "Jun 12", equity: 12273 },
  { date: "Jun 13", equity: 12718 }, { date: "Jun 14", equity: 13027 },
];

const NOWPAYMENTS_API_KEY = "EDJB26R-M5248SA-PPZMNXQ-ZQM2QBD";
const NOWPAYMENTS_IPN_KEY = "81Akcbxv0UW71KxtxbC5UH9aANT2UEnA";
const SUBSCRIPTION_PLANS = [
  { id: "starter", name: "Starter", price: 10, currency: "USDTTRC20", durationDays: 5, color: "#6b7694", features: ["1 broker connection", "Forex & Crypto only", "Standard copy ratio (max 1x)", "Email support"] },
  { id: "pro",     name: "Pro",     price: 10, currency: "USDTTRC20", durationDays: 5, color: "#4d9dff", features: ["3 broker connections", "All 12 instruments", "Copy ratio up to 3x", "Priority support"] },
  { id: "elite",   name: "Elite",   price: 10, currency: "USDTTRC20", durationDays: 5, color: "#ffd14d", features: ["Unlimited brokers", "All 12 instruments", "Copy ratio up to 5x", "Dedicated support", "Custom risk settings"] },
];

const addDays = (days) => { const d = new Date(); d.setDate(d.getDate() + days); return d.toISOString().split("T")[0]; };

const fmtMoney = (n) => (n >= 0 ? "+" : "-") + "$" + Math.abs(n).toFixed(2);
const pnlColor = (n) => (n >= 0 ? "#00d4aa" : "#ff4d6d");
const fmt      = (n, d = 2) => Number(n).toFixed(d);
const useIsMobile = () => {
  const [m, setM] = useState(window.innerWidth < 768);
  useEffect(() => { const h = () => setM(window.innerWidth < 768); window.addEventListener("resize", h); return () => window.removeEventListener("resize", h); }, []);
  return m;
};

function Badge({ label, color }) {
  const map = { green: { bg: "#00d4aa18", text: "#00d4aa", border: "#00d4aa40" }, red: { bg: "#ff4d6d18", text: "#ff4d6d", border: "#ff4d6d40" }, blue: { bg: "#4d9dff18", text: "#4d9dff", border: "#4d9dff40" }, yellow: { bg: "#ffd14d18", text: "#ffd14d", border: "#ffd14d40" }, purple: { bg: "#b07aff18", text: "#b07aff", border: "#b07aff40" }, gray: { bg: "#6b769418", text: "#6b7694", border: "#6b769440" } };
  const c = map[color] || map.gray;
  return <span style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}`, borderRadius: 6, padding: "2px 9px", fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{label}</span>;
}

function StatCard({ label, value, sub, color, small }) {
  return (
    <div style={{ background: "linear-gradient(135deg,#1a1f2e,#141824)", border: "1px solid #252d3d", borderRadius: 12, padding: small ? "14px 16px" : "18px 20px", flex: 1, minWidth: small ? 120 : 140 }}>
      <div style={{ color: "#6b7694", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>{label}</div>
      <div style={{ color: color || "#f0f4ff", fontSize: small ? 20 : 24, fontWeight: 700, letterSpacing: "-0.02em" }}>{value}</div>
      {sub && <div style={{ color: "#4b5568", fontSize: 11, marginTop: 3 }}>{sub}</div>}
    </div>
  );
}

function useLivePrices() {
  const [prices, setPrices] = useState(() => Object.fromEntries(Object.entries(PRICE_SEEDS).map(([k, v]) => [k, { ...v, prev: v.price, flash: null }])));
  useEffect(() => {
    const id = setInterval(() => {
      setPrices(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(sym => {
          const s = next[sym]; const delta = (Math.random() - 0.49) * s.step;
          next[sym] = { ...s, prev: s.price, price: Math.max(s.price * 0.9, s.price + delta), flash: delta > 0 ? "up" : "down" };
        }); return next;
      });
      setTimeout(() => setPrices(p => { const n = { ...p }; Object.keys(n).forEach(k => { n[k] = { ...n[k], flash: null }; }); return n; }), 400);
    }, 1800);
    return () => clearInterval(id);
  }, []); return prices;
}

function LiveTicker({ prices, isMobile }) {
  const symbols = Object.keys(prices);
  const TickerItem = ({ sym }) => {
    const p = prices[sym]; const change = p.price - PRICE_SEEDS[sym].price; const pct = (change / PRICE_SEEDS[sym].price) * 100; const up = change >= 0;
    const decimals = p.price > 1000 ? 2 : p.price > 10 ? 3 : 4; const flashColor = p.flash === "up" ? "#00d4aa" : p.flash === "down" ? "#ff4d6d" : null;
    return (
      <div style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "0 20px", borderRight: "1px solid #1a1f2e", height: "100%" }}>
        <span style={{ color: "#6b7694", fontSize: 11, fontWeight: 700 }}>{sym}</span>
        <span style={{ color: flashColor || (up ? "#00d4aa" : "#ff4d6d"), fontSize: 12, fontWeight: 800, fontFamily: "monospace", transition: "color 0.3s" }}>{fmt(p.price, decimals)}</span>
        <span style={{ color: up ? "#00d4aa" : "#ff4d6d", fontSize: 10, fontWeight: 600 }}>{up ? "▲" : "▼"} {Math.abs(pct).toFixed(2)}%</span>
      </div>
    );
  };
  return (
    <div style={{ background: "#0a0e17", borderBottom: "1px solid #1f2535", height: 36, overflow: "hidden", position: "relative", display: "flex", alignItems: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "0 14px", borderRight: "1px solid #252d3d", height: "100%", background: "#0a0e17", zIndex: 10, flexShrink: 0 }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#00d4aa", display: "inline-block", animation: "pulse 1.5s infinite" }} />
        <span style={{ color: "#00d4aa", fontSize: 10, fontWeight: 800, letterSpacing: "0.1em" }}>LIVE</span>
      </div>
      <div style={{ flex: 1, overflow: "hidden", height: "100%", display: "flex", alignItems: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", height: "100%", animation: "tickerScroll 28s linear infinite", whiteSpace: "nowrap" }}>
          {[...symbols, ...symbols].map((sym, i) => <TickerItem key={`${sym}-${i}`} sym={sym} />)}
        </div>
      </div>
      <style>{`@keyframes tickerScroll{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
    </div>
  );
}

function SubscribePage({ onBack, onPaymentSuccess }) {
  const isMobile = useIsMobile();
  const [step, setStep] = useState("plans");
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [form, setForm] = useState({ name: "", email: "" });
  const [paymentData, setPaymentData] = useState(null);
  const [pinGenerated, setPinGenerated] = useState(null);
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);
  const [countdown, setCountdown] = useState(300);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (step === "paying") {
      intervalRef.current = setInterval(() => { setCountdown(c => { if (c <= 1) { clearInterval(intervalRef.current); return 0; } return c - 1; }); }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [step]);

  const fmtCountdown = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const createPayment = async () => {
    if (!form.name || !form.email) { setError("Please fill in your name and email."); return; }
    setError(""); setStep("paying");
    try {
      const res = await fetch("https://api.nowpayments.io/v1/payment", { method: "POST", headers: { "x-api-key": NOWPAYMENTS_API_KEY, "Content-Type": "application/json" }, body: JSON.stringify({ price_amount: selectedPlan.price, price_currency: "usd", pay_currency: "usdttrc20", order_id: `GAINPICKER-${Date.now()}`, order_description: `GainPicker ${selectedPlan.name} Plan - 5 Days` }) });
      const data = await res.json();
      if (data.payment_id) { setPaymentData(data); }
      else { setPaymentData({ payment_id: "DEMO-" + Date.now(), pay_address: "TDemo7xR9kPqW3mNvBsLtYuHgFjCdAeZi", pay_amount: selectedPlan.price, pay_currency: "USDT (TRC20)", payment_status: "waiting" }); }
    } catch { setPaymentData({ payment_id: "DEMO-" + Date.now(), pay_address: "TDemo7xR9kPqW3mNvBsLtYuHgFjCdAeZi", pay_amount: selectedPlan.price, pay_currency: "USDT (TRC20)", payment_status: "waiting" }); }
  };

  const checkPayment = async () => {
    setChecking(true);
    try {
      const res = await fetch(`https://api.nowpayments.io/v1/payment/${paymentData.payment_id}`, { headers: { "x-api-key": NOWPAYMENTS_API_KEY } });
      const data = await res.json();
      if (data.payment_status === "finished" || data.payment_status === "confirmed") { completeSubscription(); }
      else { setStep("confirming"); setTimeout(() => completeSubscription(), 2000); }
    } catch { setStep("confirming"); setTimeout(() => completeSubscription(), 2000); }
    setChecking(false);
  };

  const completeSubscription = () => {
    const pin = generatePin(); const expiry = addDays(selectedPlan.durationDays);
    const newClient = { id: Date.now(), pin, name: form.name, email: form.email, plan: selectedPlan.name, expiry, status: "Active", broker: "", copyRatio: 1.0, pnlToday: 0, totalPnl: 0, role: "client" };
    setPinGenerated(pin); setStep("done"); onPaymentSuccess(newClient);
  };

  const cardStyle = (plan) => ({ background: selectedPlan?.id === plan.id ? `${plan.color}11` : "#1a1f2e", border: `2px solid ${selectedPlan?.id === plan.id ? plan.color : "#252d3d"}`, borderRadius: 14, padding: isMobile ? 16 : 22, cursor: "pointer", transition: "all 0.2s", flex: 1 });

  return (
    <div style={{ minHeight: "100vh", background: "#0d1117", fontFamily: "'Inter',-apple-system,sans-serif", color: "#f0f4ff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: isMobile ? 16 : 24 }}>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ width: 52, height: 52, borderRadius: 14, background: "linear-gradient(135deg,#4d9dff,#7b5ea7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, margin: "0 auto 12px", boxShadow: "0 0 32px #4d9dff44" }}>📈</div>
        <div style={{ color: "#f0f4ff", fontSize: 22, fontWeight: 800 }}>GainPicker</div>
        <div style={{ color: "#6b7694", fontSize: 13, marginTop: 3 }}>Subscribe to start CopyTrading</div>
      </div>
      <div style={{ width: "100%", maxWidth: 640 }}>
        {step === "plans" && (
          <>
            <div style={{ color: "#f0f4ff", fontWeight: 700, fontSize: 17, marginBottom: 6, textAlign: "center" }}>Choose Your Plan</div>
            <div style={{ color: "#6b7694", fontSize: 13, marginBottom: 20, textAlign: "center" }}>All plans are <span style={{ color: "#00d4aa", fontWeight: 700 }}>$10 USDT</span> for 5 days access</div>
            <div style={{ display: "flex", gap: 12, marginBottom: 16, flexDirection: isMobile ? "column" : "row" }}>
              {SUBSCRIPTION_PLANS.map(plan => (
                <div key={plan.id} onClick={() => setSelectedPlan(plan)} style={cardStyle(plan)}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <div style={{ color: plan.color, fontWeight: 800, fontSize: 16 }}>{plan.name}</div>
                    <div style={{ width: 18, height: 18, borderRadius: "50%", border: `2px solid ${selectedPlan?.id === plan.id ? plan.color : "#3a4258"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {selectedPlan?.id === plan.id && <div style={{ width: 8, height: 8, borderRadius: "50%", background: plan.color }} />}
                    </div>
                  </div>
                  <div style={{ color: "#f0f4ff", fontWeight: 800, fontSize: 24, marginBottom: 4 }}>$10 <span style={{ fontSize: 12, color: "#6b7694", fontWeight: 400 }}>USDT / 5 days</span></div>
                  <div style={{ borderTop: `1px solid ${plan.color}33`, marginTop: 12, paddingTop: 12 }}>
                    {plan.features.map(f => <div key={f} style={{ color: "#8892aa", fontSize: 12, marginBottom: 6, display: "flex", gap: 7 }}><span style={{ color: plan.color, fontWeight: 700 }}>✓</span> {f}</div>)}
                  </div>
                  {selectedPlan?.id === plan.id && <div style={{ marginTop: 10, background: `${plan.color}18`, border: `1px solid ${plan.color}44`, borderRadius: 8, padding: "6px 10px", textAlign: "center", color: plan.color, fontSize: 11, fontWeight: 700 }}>✓ SELECTED</div>}
                </div>
              ))}
            </div>
            <div style={{ background: "#ffd14d0d", border: "1px solid #ffd14d33", borderRadius: 8, padding: "10px 14px", marginBottom: 16 }}>
              <span style={{ color: "#ffd14d", fontSize: 12 }}>⚠ You can only select ONE plan per subscription. Each PIN is tied to one plan.</span>
            </div>
            <button onClick={() => selectedPlan && setStep("details")} disabled={!selectedPlan} style={{ width: "100%", background: selectedPlan ? "linear-gradient(135deg,#4d9dff,#7b5ea7)" : "#252d3d", border: "none", borderRadius: 10, padding: 14, color: selectedPlan ? "#fff" : "#6b7694", fontSize: 15, fontWeight: 700, cursor: selectedPlan ? "pointer" : "not-allowed" }}>
              Continue with {selectedPlan?.name || "a Plan"} →
            </button>
            <div style={{ textAlign: "center", marginTop: 14 }}><button onClick={onBack} style={{ background: "none", border: "none", color: "#6b7694", fontSize: 13, cursor: "pointer" }}>← Back to Login</button></div>
          </>
        )}
        {step === "details" && (
          <div style={{ background: "#141824", border: "1px solid #252d3d", borderRadius: 18, padding: isMobile ? 20 : 32 }}>
            <div style={{ color: "#f0f4ff", fontWeight: 700, fontSize: 17, marginBottom: 4 }}>Your Details</div>
            <div style={{ color: "#6b7694", fontSize: 13, marginBottom: 24 }}>We'll send your PIN to this email after payment</div>
            <div style={{ display: "flex", gap: 8, alignItems: "center", background: "#1a1f2e", borderRadius: 10, padding: "10px 14px", marginBottom: 20, border: "1px solid #252d3d" }}>
              <span style={{ color: selectedPlan?.color, fontWeight: 700 }}>{selectedPlan?.name}</span>
              <span style={{ color: "#4b5568", fontSize: 12 }}>·</span>
              <span style={{ color: "#00d4aa", fontWeight: 700 }}>$10 USDT</span>
              <span style={{ color: "#4b5568", fontSize: 12 }}>·</span>
              <span style={{ color: "#6b7694", fontSize: 12 }}>5 days</span>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ color: "#8892aa", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", display: "block", marginBottom: 6 }}>FULL NAME</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Your full name" style={{ width: "100%", background: "#1a1f2e", border: "1px solid #252d3d", borderRadius: 8, padding: "12px 14px", color: "#f0f4ff", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ color: "#8892aa", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", display: "block", marginBottom: 6 }}>EMAIL ADDRESS</label>
              <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="your@email.com" style={{ width: "100%", background: "#1a1f2e", border: "1px solid #252d3d", borderRadius: 8, padding: "12px 14px", color: "#f0f4ff", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
            </div>
            {error && <div style={{ color: "#ff4d6d", background: "#ff4d6d11", border: "1px solid #ff4d6d33", borderRadius: 8, padding: "10px 14px", fontSize: 13, marginBottom: 14 }}>⚠ {error}</div>}
            <button onClick={createPayment} style={{ width: "100%", background: "linear-gradient(135deg,#4d9dff,#7b5ea7)", border: "none", borderRadius: 10, padding: 14, color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", marginBottom: 10 }}>Proceed to Payment →</button>
            <button onClick={() => setStep("plans")} style={{ width: "100%", background: "none", border: "1px solid #252d3d", borderRadius: 10, padding: 12, color: "#6b7694", fontSize: 13, cursor: "pointer" }}>← Back</button>
          </div>
        )}
        {step === "paying" && paymentData && (
          <div style={{ background: "#141824", border: "1px solid #252d3d", borderRadius: 18, padding: isMobile ? 20 : 32 }}>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div style={{ color: "#f0f4ff", fontWeight: 700, fontSize: 17, marginBottom: 4 }}>Send Payment</div>
              <div style={{ color: "#6b7694", fontSize: 13 }}>Send exactly the amount below to this USDT (TRC20) address</div>
            </div>
            <div style={{ background: "#1a1f2e", border: "2px solid #00d4aa44", borderRadius: 12, padding: 18, marginBottom: 16, textAlign: "center" }}>
              <div style={{ color: "#6b7694", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", marginBottom: 6 }}>AMOUNT TO SEND</div>
              <div style={{ color: "#00d4aa", fontSize: 36, fontWeight: 800 }}>{paymentData.pay_amount} USDT</div>
              <div style={{ color: "#4b5568", fontSize: 11, marginTop: 4 }}>TRC20 Network only</div>
            </div>
            <div style={{ background: "#1a1f2e", border: "1px solid #252d3d", borderRadius: 12, padding: 16, marginBottom: 16 }}>
              <div style={{ color: "#6b7694", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", marginBottom: 8 }}>USDT TRC20 WALLET ADDRESS</div>
              <div style={{ background: "#0d1117", borderRadius: 8, padding: "12px 14px", fontFamily: "monospace", fontSize: isMobile ? 11 : 13, color: "#4d9dff", wordBreak: "break-all", border: "1px solid #1f2535", marginBottom: 8 }}>{paymentData.pay_address}</div>
              <button onClick={() => navigator.clipboard?.writeText(paymentData.pay_address)} style={{ background: "#252d3d", border: "none", borderRadius: 6, color: "#8892aa", padding: "6px 14px", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>📋 Copy Address</button>
            </div>
            <div style={{ background: "#1a1f2e", borderRadius: 10, padding: "10px 14px", marginBottom: 20, display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#6b7694", fontSize: 12 }}>Payment ID</span>
              <span style={{ color: "#8892aa", fontFamily: "monospace", fontSize: 12 }}>{paymentData.payment_id}</span>
            </div>
            <div style={{ background: "#ffd14d0d", border: "1px solid #ffd14d33", borderRadius: 10, padding: "12px 14px", marginBottom: 20 }}>
              <div style={{ color: "#ffd14d", fontWeight: 700, fontSize: 12, marginBottom: 6 }}>⚠ Important</div>
              <div style={{ color: "#8892aa", fontSize: 12, lineHeight: 1.6 }}>
                • Send <strong style={{ color: "#f0f4ff" }}>exactly $10 USDT</strong> on the <strong style={{ color: "#f0f4ff" }}>TRC20 network</strong> only<br />
                • Do NOT send from an exchange that does not support TRC20<br />
                • After sending, click "I've Sent Payment" below<br />
                • Your PIN will be generated instantly after confirmation
              </div>
            </div>
            <div style={{ textAlign: "center", marginBottom: 16 }}>
              <div style={{ color: countdown < 60 ? "#ff4d6d" : "#6b7694", fontSize: 13 }}>Payment window expires in <span style={{ fontWeight: 700, fontFamily: "monospace", fontSize: 16, color: countdown < 60 ? "#ff4d6d" : "#ffd14d" }}>{fmtCountdown(countdown)}</span></div>
            </div>
            <button onClick={checkPayment} disabled={checking} style={{ width: "100%", background: checking ? "#252d3d" : "linear-gradient(135deg,#00d4aa,#00a884)", border: "none", borderRadius: 10, padding: 14, color: checking ? "#6b7694" : "#fff", fontSize: 15, fontWeight: 700, cursor: checking ? "not-allowed" : "pointer", marginBottom: 10 }}>
              {checking ? "Verifying Payment…" : "✓ I've Sent Payment"}
            </button>
            <button onClick={() => setStep("details")} style={{ width: "100%", background: "none", border: "1px solid #252d3d", borderRadius: 10, padding: 12, color: "#6b7694", fontSize: 13, cursor: "pointer" }}>← Cancel</button>
          </div>
        )}
        {step === "confirming" && (
          <div style={{ background: "#141824", border: "1px solid #252d3d", borderRadius: 18, padding: 40, textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 16, animation: "spin 1s linear infinite", display: "inline-block" }}>⟳</div>
            <div style={{ color: "#4d9dff", fontWeight: 700, fontSize: 17, marginBottom: 8 }}>Confirming Payment…</div>
            <div style={{ color: "#6b7694", fontSize: 13 }}>Verifying your transaction on the blockchain.</div>
            <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
          </div>
        )}
        {step === "done" && (
          <div style={{ background: "#141824", border: "1px solid #00d4aa44", borderRadius: 18, padding: isMobile ? 24 : 40, textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
            <div style={{ color: "#00d4aa", fontWeight: 800, fontSize: 20, marginBottom: 6 }}>Payment Confirmed!</div>
            <div style={{ color: "#6b7694", fontSize: 13, marginBottom: 28 }}>Your GainPicker subscription is now active</div>
            <div style={{ background: "#0d1117", border: "2px solid #00d4aa", borderRadius: 16, padding: "24px 20px", marginBottom: 20 }}>
              <div style={{ color: "#4b5568", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 8 }}>YOUR SUBSCRIPTION PIN</div>
              <div style={{ color: "#00d4aa", fontSize: 44, fontWeight: 900, fontFamily: "monospace", letterSpacing: "0.4em" }}>{pinGenerated}</div>
              <div style={{ color: "#4b5568", fontSize: 11, marginTop: 8 }}>Use this PIN to log in to GainPicker</div>
            </div>
            <div style={{ background: "#1a1f2e", borderRadius: 10, padding: 14, marginBottom: 20, textAlign: "left" }}>
              {[["Name", form.name], ["Email", form.email], ["Plan", selectedPlan?.name], ["Expires", addDays(selectedPlan?.durationDays || 5)]].map(([l, v]) => (
                <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #252d3d" }}>
                  <span style={{ color: "#6b7694", fontSize: 12 }}>{l}</span>
                  <span style={{ color: "#f0f4ff", fontWeight: 600, fontSize: 12 }}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ background: "#ffd14d0d", border: "1px solid #ffd14d33", borderRadius: 8, padding: "10px 14px", marginBottom: 20 }}>
              <span style={{ color: "#ffd14d", fontSize: 12 }}>📧 Your PIN has also been sent to <strong>{form.email}</strong></span>
            </div>
            <button onClick={onBack} style={{ width: "100%", background: "linear-gradient(135deg,#4d9dff,#7b5ea7)", border: "none", borderRadius: 10, padding: 14, color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>Login with PIN →</button>
          </div>
        )}
      </div>
    </div>
  );
}

function AddCommentForm() {
  const [form, setForm] = useState({ name: "", email: "", country: "", text: "" });
  const [submitted, setSubmitted] = useState(false);
  const isMobile = useIsMobile();
  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const handleSubmit = () => { if (!form.name || !form.email || !form.country || !form.text) return; setSubmitted(true); };
  const inp = { width: "100%", background: "#1a1f2e", border: "1px solid #252d3d", borderRadius: 8, padding: "10px 12px", color: "#f0f4ff", fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "inherit" };
  const lbl = { color: "#8892aa", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", display: "block", marginBottom: 5 };
  return (
    <div style={{ background: "#141824", border: "1px solid #252d3d", borderRadius: 14, padding: 20, marginTop: 16 }}>
      <div style={{ color: "#f0f4ff", fontWeight: 700, fontSize: 14, marginBottom: 4 }}>Share Your Experience</div>
      <div style={{ color: "#6b7694", fontSize: 12, marginBottom: 16 }}>Tell other traders about your GainPicker journey</div>
      {submitted ? (
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>🎉</div>
          <div style={{ color: "#00d4aa", fontWeight: 700, fontSize: 15 }}>Thank you for your review!</div>
          <div style={{ color: "#6b7694", fontSize: 12, marginTop: 6 }}>Your comment will appear after approval.</div>
        </div>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div><label style={lbl}>YOUR NAME</label><input value={form.name} onChange={e => update("name", e.target.value)} placeholder="Full name" style={inp} /></div>
            <div><label style={lbl}>EMAIL ADDRESS</label><input type="email" value={form.email} onChange={e => update("email", e.target.value)} placeholder="your@email.com" style={inp} /></div>
          </div>
          <div style={{ marginBottom: 12 }}><label style={lbl}>COUNTRY</label><input value={form.country} onChange={e => update("country", e.target.value)} placeholder="e.g. Nigeria, UK, USA" style={inp} /></div>
          <div style={{ marginBottom: 16 }}><label style={lbl}>YOUR COMMENT</label><textarea value={form.text} onChange={e => update("text", e.target.value)} placeholder="Share your trading experience with GainPicker..." rows={3} style={{ ...inp, resize: "vertical", lineHeight: 1.5 }} /></div>
          <button onClick={handleSubmit} disabled={!form.name || !form.email || !form.country || !form.text} style={{ width: "100%", background: (!form.name || !form.email || !form.country || !form.text) ? "#252d3d" : "linear-gradient(135deg,#4d9dff,#7b5ea7)", border: "none", borderRadius: 8, padding: "11px", color: (!form.name || !form.email || !form.country || !form.text) ? "#6b7694" : "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Submit Review →</button>
        </>
      )}
    </div>
  );
}

function LoginScreen({ onLogin, subscriptions, onSubscribe }) {
  const [pin, setPin] = useState(""); const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  const isMobile = useIsMobile();
  const handleLogin = () => {
    setLoading(true); setError("");
    setTimeout(() => {
      if (pin === MASTER_PIN) { onLogin(MASTER_USER); return; }
      const sub = subscriptions.find(s => s.pin === pin);
      if (sub) { onLogin(sub); } else { setError("Invalid PIN. Please check your subscription PIN."); setLoading(false); }
    }, 700);
  };
  return (
    <div style={{ minHeight: "100vh", background: "#0d1117", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", fontFamily: "'Inter',-apple-system,sans-serif", padding: 20, paddingTop: 40 }}>
      <div style={{ marginBottom: 32, textAlign: "center" }}>
        <div style={{ width: 60, height: 60, borderRadius: 16, background: "linear-gradient(135deg,#4d9dff,#7b5ea7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, margin: "0 auto 14px", boxShadow: "0 0 40px #4d9dff44" }}>📈</div>
        <div style={{ color: "#f0f4ff", fontSize: isMobile ? 24 : 28, fontWeight: 800, letterSpacing: "-0.03em" }}>GainPicker</div>
        <div style={{ color: "#6b7694", fontSize: 13, marginTop: 4 }}>Professional CopyTrading Platform</div>
      </div>
      <div style={{ background: "#141824", border: "1px solid #252d3d", borderRadius: 20, padding: isMobile ? 24 : 36, width: "100%", maxWidth: 380, boxShadow: "0 24px 80px #00000099" }}>
        <div style={{ color: "#f0f4ff", fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Welcome back</div>
        <div style={{ color: "#6b7694", fontSize: 13, marginBottom: 28 }}>Enter your subscription PIN to access your dashboard</div>
        <label style={{ color: "#8892aa", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", display: "block", marginBottom: 8 }}>SUBSCRIPTION PIN</label>
        <input type="password" value={pin} onChange={e => setPin(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} placeholder="••••" maxLength={8} style={{ width: "100%", background: "#1a1f2e", border: "1px solid #252d3d", borderRadius: 10, padding: "14px 16px", color: "#f0f4ff", fontSize: 22, letterSpacing: "0.4em", outline: "none", boxSizing: "border-box", fontFamily: "monospace", marginBottom: 10 }} />
        {error && <div style={{ color: "#ff4d6d", fontSize: 13, background: "#ff4d6d11", border: "1px solid #ff4d6d33", borderRadius: 8, padding: "10px 14px", marginBottom: 12 }}>⚠ {error}</div>}
        <button onClick={handleLogin} disabled={loading || pin.length < 4} style={{ width: "100%", background: pin.length < 4 ? "#252d3d" : "linear-gradient(135deg,#4d9dff,#7b5ea7)", border: "none", borderRadius: 10, padding: 14, color: pin.length < 4 ? "#6b7694" : "#fff", fontSize: 15, fontWeight: 700, cursor: pin.length < 4 ? "not-allowed" : "pointer", marginTop: 4 }}>
          {loading ? "Verifying…" : "Access Dashboard →"}
        </button>
        <div style={{ borderTop: "1px solid #1f2535", marginTop: 20, paddingTop: 16, textAlign: "center" }}>
          <div style={{ color: "#6b7694", fontSize: 13, marginBottom: 10 }}>Don't have a PIN yet?</div>
          <button onClick={onSubscribe} style={{ width: "100%", background: "#00d4aa18", border: "1px solid #00d4aa44", borderRadius: 10, padding: "11px", color: "#00d4aa", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Subscribe Now — $10 USDT →</button>
        </div>
        <div style={{ color: "#2a3040", fontSize: 10, textAlign: "center", marginTop: 14 }}>Demo: <span style={{ color: "#2a3855" }}>9999</span> Master · <span style={{ color: "#2a3855" }}>1234</span> / <span style={{ color: "#2a3855" }}>5678</span> Client</div>
      </div>

      {/* Testimonials */}
      <div style={{ width: "100%", maxWidth: 420, marginTop: 40 }}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ color: "#f0f4ff", fontWeight: 700, fontSize: 16 }}>What Our Traders Say</div>
          <div style={{ color: "#6b7694", fontSize: 12, marginTop: 4 }}>Real feedback from active GainPicker subscribers</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {INITIAL_COMMENTS.map(c => (
            <div key={c.id} style={{ background: "#141824", border: "1px solid #252d3d", borderRadius: 14, padding: 16 }}>
              <div style={{ color: "#8892aa", fontSize: 13, lineHeight: 1.6, marginBottom: 12, fontStyle: "italic" }}>"{c.text}"</div>
              <div style={{ borderTop: "1px solid #1f2535", paddingTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ color: "#f0f4ff", fontWeight: 700, fontSize: 13 }}>{c.name}</div>
                  <div style={{ color: "#4b5568", fontSize: 11, marginTop: 2 }}>{c.email}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ color: "#4d9dff", fontSize: 12, fontWeight: 600 }}>{c.country}</div>
                  <div style={{ color: "#4b5568", fontSize: 10, marginTop: 2 }}>{c.date}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <AddCommentForm />
      </div>
    </div>
  );
}

function ClientSetupModal({ onSave, onClose, existing }) {
  const [form, setForm] = useState(existing || { broker: "", apiKey: "", apiSecret: "", riskPercent: 1, copyRatio: 1.0, maxLoss: 500, assets: ALL_INSTRUMENTS.map(i => i.name), lotSizeMode: "proportional" });
  const [saved, setSaved] = useState(false);
  const isMobile = useIsMobile();
  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const toggleAsset = a => setForm(f => ({ ...f, assets: f.assets.includes(a) ? f.assets.filter(x => x !== a) : [...f.assets, a] }));
  const handleSave = () => { setSaved(true); setTimeout(() => { onSave(form); onClose(); }, 900); };
  const inp = { width: "100%", background: "#1a1f2e", border: "1px solid #252d3d", borderRadius: 8, padding: "11px 14px", color: "#f0f4ff", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit" };
  const lbl = { color: "#8892aa", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", display: "block", marginBottom: 6 };
  const LOT_MODES = [
    { value: "proportional", icon: "⚖️", title: "Proportional", desc: "Your lot scales with the master's position using your Copy Ratio. If master opens 1.0 lot and your ratio is 0.5x, you get 0.5 lot.", example: "Master 1.0 lot × 0.5 ratio → Your 0.5 lot" },
    { value: "fixed",        icon: "📌", title: "Fixed Lot",    desc: "Every trade uses a fixed lot size you define, regardless of how large or small the master's position is.", example: "Master 2.0 lots → You always get 0.1 lot" },
    { value: "risk",         icon: "🛡️", title: "Risk-Based",  desc: "Lot size is auto-calculated from your Risk Per Trade (%) and account balance. Each trade risks exactly your set percentage.", example: "$5,000 account · 1% risk → $50 risked per trade" },
  ];
  return (
    <div style={{ position: "fixed", inset: 0, background: "#000000aa", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: isMobile ? 12 : 20 }}>
      <div style={{ background: "#141824", border: "1px solid #252d3d", borderRadius: 20, padding: isMobile ? 20 : 32, width: "100%", maxWidth: 540, maxHeight: "92vh", overflowY: "auto", boxShadow: "0 32px 100px #000000cc" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div><div style={{ color: "#f0f4ff", fontSize: 18, fontWeight: 700 }}>CopyTrade Setup</div><div style={{ color: "#6b7694", fontSize: 12, marginTop: 2 }}>Connect your broker & configure risk settings</div></div>
          <button onClick={onClose} style={{ background: "#252d3d", border: "none", color: "#6b7694", borderRadius: 8, width: 34, height: 34, cursor: "pointer", fontSize: 18 }}>×</button>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={lbl}>BROKER NAME</label>
          <input value={form.broker} onChange={e => update("broker", e.target.value)} placeholder="e.g. Interactive Brokers, Saxo Bank, OANDA…" style={inp} />
          <div style={{ color: "#4b5568", fontSize: 11, marginTop: 5 }}>Any regulated broker with API access is supported.</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12, marginBottom: 20 }}>
          <div><label style={lbl}>API KEY</label><input value={form.apiKey} onChange={e => update("apiKey", e.target.value)} placeholder="Your broker API key" style={inp} /></div>
          <div><label style={lbl}>API SECRET</label><input type="password" value={form.apiSecret} onChange={e => update("apiSecret", e.target.value)} placeholder="••••••••••••" style={inp} /></div>
        </div>
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <label style={{ ...lbl, marginBottom: 0 }}>SUPPORTED INSTRUMENTS</label>
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={() => setForm(f => ({ ...f, assets: ALL_INSTRUMENTS.map(i => i.name) }))} style={{ background: "#4d9dff22", border: "1px solid #4d9dff44", borderRadius: 6, color: "#4d9dff", fontSize: 10, fontWeight: 700, padding: "3px 8px", cursor: "pointer" }}>All</button>
              <button onClick={() => setForm(f => ({ ...f, assets: [] }))} style={{ background: "#1a1f2e", border: "1px solid #252d3d", borderRadius: 6, color: "#6b7694", fontSize: 10, fontWeight: 700, padding: "3px 8px", cursor: "pointer" }}>Clear</button>
            </div>
          </div>
          <div style={{ color: "#4b5568", fontSize: 11, marginBottom: 10 }}>Select what your broker supports. Only matching instruments will be copied.</div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 7 }}>
            {ALL_INSTRUMENTS.map(({ name, icon, desc }) => {
              const on = form.assets.includes(name);
              return (
                <div key={name} onClick={() => toggleAsset(name)} style={{ border: `1px solid ${on ? "#4d9dff" : "#252d3d"}`, background: on ? "#4d9dff0d" : "#1a1f2e", borderRadius: 10, padding: "11px 12px", cursor: "pointer", display: "flex", gap: 9, alignItems: "flex-start", transition: "all 0.15s" }}>
                  <div style={{ width: 15, height: 15, borderRadius: 4, border: `2px solid ${on ? "#4d9dff" : "#3a4258"}`, background: on ? "#4d9dff" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                    {on && <span style={{ color: "#fff", fontSize: 9, fontWeight: 900 }}>✓</span>}
                  </div>
                  <div>
                    <div style={{ display: "flex", gap: 5, alignItems: "center", marginBottom: 2 }}><span style={{ fontSize: 13 }}>{icon}</span><span style={{ color: on ? "#4d9dff" : "#f0f4ff", fontWeight: 700, fontSize: 12 }}>{name}</span></div>
                    <div style={{ color: "#6b7694", fontSize: 10, lineHeight: 1.4 }}>{desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
          {form.assets.length > 0 && <div style={{ marginTop: 8, background: "#0d1117", borderRadius: 7, padding: "7px 12px", border: "1px solid #1f2535" }}><span style={{ color: "#4b5568", fontSize: 10 }}>Selected ({form.assets.length}): </span><span style={{ color: "#4d9dff", fontSize: 10, fontWeight: 600 }}>{form.assets.join(" · ")}</span></div>}
        </div>
        <div style={{ background: "#1a1f2e", borderRadius: 12, padding: 18, marginBottom: 18 }}>
          <div style={{ color: "#f0f4ff", fontSize: 13, fontWeight: 700, marginBottom: 14 }}>Risk Management</div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: 12 }}>
            <div><label style={lbl}>COPY RATIO</label><input type="number" value={form.copyRatio} step={0.25} min={0.25} max={5} onChange={e => update("copyRatio", parseFloat(e.target.value))} style={inp} /><div style={{ color: "#4b5568", fontSize: 10, marginTop: 4 }}>0.5x = half lot size</div></div>
            <div><label style={lbl}>RISK/TRADE (%)</label><input type="number" value={form.riskPercent} step={0.5} min={0.5} max={10} onChange={e => update("riskPercent", parseFloat(e.target.value))} style={inp} /><div style={{ color: "#4b5568", fontSize: 10, marginTop: 4 }}>% of account balance</div></div>
            <div><label style={lbl}>MAX DAILY LOSS ($)</label><input type="number" value={form.maxLoss} step={50} min={50} onChange={e => update("maxLoss", parseFloat(e.target.value))} style={inp} /><div style={{ color: "#4b5568", fontSize: 10, marginTop: 4 }}>Pauses copying at limit</div></div>
          </div>
        </div>
        <div style={{ marginBottom: 24 }}>
          <label style={lbl}>LOT SIZE MODE</label>
          <div style={{ color: "#4b5568", fontSize: 11, marginBottom: 10 }}>Choose how trade sizes are calculated when copying the master.</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {LOT_MODES.map(({ value, icon, title, desc, example }) => {
              const on = form.lotSizeMode === value;
              return (
                <div key={value} onClick={() => update("lotSizeMode", value)} style={{ border: `1px solid ${on ? "#00d4aa" : "#252d3d"}`, background: on ? "#00d4aa0a" : "#1a1f2e", borderRadius: 11, padding: "14px 16px", cursor: "pointer", transition: "all 0.15s" }}>
                  <div style={{ display: "flex", gap: 9, alignItems: "center", marginBottom: 6 }}>
                    <div style={{ width: 15, height: 15, borderRadius: "50%", border: `2px solid ${on ? "#00d4aa" : "#3a4258"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{on && <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#00d4aa" }} />}</div>
                    <span style={{ fontSize: 14 }}>{icon}</span><span style={{ color: on ? "#00d4aa" : "#f0f4ff", fontWeight: 700, fontSize: 13 }}>{title}</span>
                  </div>
                  <div style={{ color: "#8892aa", fontSize: 12, lineHeight: 1.5, marginLeft: 24, marginBottom: 7 }}>{desc}</div>
                  <div style={{ marginLeft: 24, background: "#0d1117", borderRadius: 6, padding: "5px 10px", color: on ? "#00d4aa" : "#4b5568", fontSize: 11, fontFamily: "monospace", border: `1px solid ${on ? "#00d4aa33" : "#1f2535"}` }}>{example}</div>
                </div>
              );
            })}
          </div>
        </div>
        <button onClick={handleSave} style={{ width: "100%", background: saved ? "#00d4aa22" : "linear-gradient(135deg,#4d9dff,#7b5ea7)", border: saved ? "1px solid #00d4aa" : "none", borderRadius: 10, padding: 14, color: saved ? "#00d4aa" : "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
          {saved ? "✓ Settings Saved!" : "Save & Start CopyTrading"}
        </button>
      </div>
    </div>
  );
}

function PinModal({ onClose, onAdd }) {
  const [form, setForm] = useState({ name: "", email: "", plan: "Pro", expiry: "" });
  const [generated, setGenerated] = useState(null);
  const isMobile = useIsMobile();
  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const handleGenerate = () => { const pin = generatePin(); const newClient = { id: Date.now(), pin, ...form, status: "Active", copyRatio: 1.0, pnlToday: 0, totalPnl: 0, role: "client" }; setGenerated(pin); onAdd(newClient); };
  const inp = { width: "100%", background: "#1a1f2e", border: "1px solid #252d3d", borderRadius: 8, padding: "11px 14px", color: "#f0f4ff", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit" };
  const lbl = { color: "#8892aa", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", display: "block", marginBottom: 6 };
  return (
    <div style={{ position: "fixed", inset: 0, background: "#000000aa", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: isMobile ? 12 : 20 }}>
      <div style={{ background: "#141824", border: "1px solid #252d3d", borderRadius: 20, padding: isMobile ? 20 : 32, width: "100%", maxWidth: 440, boxShadow: "0 32px 100px #000000cc" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div><div style={{ color: "#f0f4ff", fontSize: 18, fontWeight: 700 }}>Generate Subscription PIN</div><div style={{ color: "#6b7694", fontSize: 12, marginTop: 2 }}>Create access PIN for a new client</div></div>
          <button onClick={onClose} style={{ background: "#252d3d", border: "none", color: "#6b7694", borderRadius: 8, width: 34, height: 34, cursor: "pointer", fontSize: 18 }}>×</button>
        </div>
        {!generated ? (
          <>
            <div style={{ display: "grid", gap: 14, marginBottom: 20 }}>
              <div><label style={lbl}>CLIENT FULL NAME</label><input value={form.name} onChange={e => update("name", e.target.value)} placeholder="e.g. John Smith" style={inp} /></div>
              <div><label style={lbl}>CLIENT EMAIL</label><input type="email" value={form.email} onChange={e => update("email", e.target.value)} placeholder="client@email.com" style={inp} /></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div><label style={lbl}>PLAN</label><select value={form.plan} onChange={e => update("plan", e.target.value)} style={{ ...inp, cursor: "pointer" }}><option value="Starter">Starter</option><option value="Pro">Pro</option><option value="Elite">Elite</option></select></div>
                <div><label style={lbl}>EXPIRY DATE</label><input type="date" value={form.expiry} onChange={e => update("expiry", e.target.value)} style={inp} /></div>
              </div>
            </div>
            <div style={{ background: "#1a1f2e", borderRadius: 10, padding: 14, marginBottom: 20 }}>
              <div style={{ color: "#6b7694", fontSize: 11, fontWeight: 700, marginBottom: 10, letterSpacing: "0.06em" }}>PLAN FEATURES</div>
              {[{ plan: "Starter", color: "#6b7694", features: ["1 broker", "Forex & Crypto only", "Email support"] }, { plan: "Pro", color: "#4d9dff", features: ["3 brokers", "All instruments", "Priority support"] }, { plan: "Elite", color: "#ffd14d", features: ["Unlimited brokers", "All instruments", "Dedicated support", "Custom ratio up to 5x"] }].map(p => (
                <div key={p.plan} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 8 }}>
                  <Badge label={p.plan} color={p.plan === "Elite" ? "yellow" : p.plan === "Pro" ? "blue" : "gray"} />
                  <span style={{ color: "#6b7694", fontSize: 11 }}>{p.features.join(" · ")}</span>
                </div>
              ))}
            </div>
            <button onClick={handleGenerate} disabled={!form.name || !form.email || !form.expiry} style={{ width: "100%", background: (!form.name || !form.email || !form.expiry) ? "#252d3d" : "linear-gradient(135deg,#4d9dff,#7b5ea7)", border: "none", borderRadius: 10, padding: 14, color: (!form.name || !form.email || !form.expiry) ? "#6b7694" : "#fff", fontSize: 15, fontWeight: 700, cursor: (!form.name || !form.email || !form.expiry) ? "not-allowed" : "pointer" }}>Generate PIN & Add Client</button>
          </>
        ) : (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🎉</div>
            <div style={{ color: "#00d4aa", fontSize: 16, fontWeight: 700, marginBottom: 6 }}>PIN Generated Successfully!</div>
            <div style={{ color: "#6b7694", fontSize: 13, marginBottom: 24 }}>Share this PIN securely with your client</div>
            <div style={{ background: "#0d1117", border: "2px solid #00d4aa", borderRadius: 14, padding: "20px 0", marginBottom: 20 }}>
              <div style={{ color: "#4b5568", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 6 }}>SUBSCRIPTION PIN</div>
              <div style={{ color: "#00d4aa", fontSize: 40, fontWeight: 800, fontFamily: "monospace", letterSpacing: "0.3em" }}>{generated}</div>
            </div>
            <div style={{ background: "#1a1f2e", borderRadius: 10, padding: 14, marginBottom: 20, textAlign: "left" }}>
              <div style={{ color: "#6b7694", fontSize: 11, marginBottom: 6 }}>Client Details</div>
              <div style={{ color: "#f0f4ff", fontSize: 13, fontWeight: 600 }}>{form.name}</div>
              <div style={{ color: "#6b7694", fontSize: 12 }}>{form.email}</div>
              <div style={{ display: "flex", gap: 6, marginTop: 6 }}><Badge label={form.plan} color={form.plan === "Elite" ? "yellow" : "blue"} /><span style={{ color: "#4b5568", fontSize: 11 }}>Expires {form.expiry}</span></div>
            </div>
            <div style={{ background: "#ffd14d11", border: "1px solid #ffd14d33", borderRadius: 8, padding: "10px 14px", marginBottom: 20 }}><span style={{ color: "#ffd14d", fontSize: 12 }}>⚠ Send this PIN securely. It grants full dashboard access.</span></div>
            <button onClick={onClose} style={{ width: "100%", background: "#1a1f2e", border: "1px solid #252d3d", borderRadius: 10, padding: 12, color: "#f0f4ff", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Done</button>
          </div>
        )}
      </div>
    </div>
  );
}

function Header({ user, onLogout, rightSlot, isMobile }) {
  return (
    <div style={{ background: "#141824", borderBottom: "1px solid #1f2535", padding: isMobile ? "0 16px" : "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 58 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: 9, background: "linear-gradient(135deg,#4d9dff,#7b5ea7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>📈</div>
        {!isMobile && <span style={{ fontWeight: 800, fontSize: 16, letterSpacing: "-0.02em", color: "#f0f4ff" }}>GainPicker</span>}
        <Badge label={user.role === "master" ? "MASTER" : user.plan?.toUpperCase()} color={user.role === "master" ? "purple" : "blue"} />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {rightSlot}
        {!isMobile && <div style={{ textAlign: "right", marginLeft: 6 }}><div style={{ color: "#f0f4ff", fontSize: 13, fontWeight: 600 }}>{user.name}</div><div style={{ color: "#6b7694", fontSize: 11 }}>{user.role === "master" ? "Master Trader" : user.broker || "Client"}</div></div>}
        <button onClick={onLogout} style={{ background: "#1a1f2e", border: "1px solid #252d3d", borderRadius: 8, color: "#6b7694", padding: isMobile ? "7px 10px" : "7px 12px", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>{isMobile ? "⏻" : "Logout"}</button>
      </div>
    </div>
  );
}

function MobileTabBar({ tabs, active, onChange }) {
  return (
    <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#141824", borderTop: "1px solid #1f2535", display: "flex", zIndex: 100 }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => onChange(t.id)} style={{ flex: 1, background: "none", border: "none", padding: "10px 4px 8px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
          <span style={{ fontSize: 18 }}>{t.icon}</span>
          <span style={{ fontSize: 9, fontWeight: 700, color: active === t.id ? "#4d9dff" : "#4b5568", letterSpacing: "0.04em" }}>{t.label.toUpperCase()}</span>
          {active === t.id && <div style={{ width: 18, height: 2, background: "#4d9dff", borderRadius: 2 }} />}
        </button>
      ))}
    </div>
  );
}

function MasterDashboard({ user, onLogout, subscriptions, onAddClient, prices }) {
  const [tab, setTab] = useState("overview");
  const [showPin, setShowPin] = useState(false);
  const isMobile = useIsMobile();
  const account   = useAlpacaAccount();
  const positions = useAlpacaPositions();
  const orders    = useAlpacaOrders();
  const equity      = account ? parseFloat(account.equity) : 13027;
  const buyingPower = account ? parseFloat(account.buying_power) : 0;
  const todayPnl    = account ? parseFloat(account.unrealized_pl) : 0;
  const totalPnl    = account ? parseFloat(account.unrealized_plpc) * 100 : 0;
  const liveTrades = positions.length > 0 ? positions.map(p => ({ id: p.asset_id, asset: p.symbol, type: p.asset_class === "crypto" ? "Crypto" : "Stock", side: parseFloat(p.qty) > 0 ? "BUY" : "SELL", entry: parseFloat(p.avg_entry_price), current: parseFloat(p.current_price), size: Math.abs(parseFloat(p.qty)), pnl: parseFloat(p.unrealized_pl), status: "OPEN", date: new Date().toISOString().split("T")[0] })) : [];
  const recentOrders = orders.length > 0 ? orders.map(o => ({ id: o.id, asset: o.symbol, side: o.side.toUpperCase(), size: parseFloat(o.qty || o.filled_qty || 0), price: parseFloat(o.filled_avg_price || o.limit_price || 0), status: o.status, date: o.created_at?.split("T")[0], time: o.created_at?.split("T")[1]?.slice(0, 5) })) : [];
  const TABS = [{ id: "overview", label: "Overview", icon: "📊" }, { id: "prices", label: "Prices", icon: "💹" }, { id: "positions", label: "Positions", icon: "📂" }, { id: "orders", label: "Orders", icon: "📋" }, { id: "clients", label: "Clients", icon: "👥" }, { id: "subscriptions", label: "Subs", icon: "🔑" }, { id: "performance", label: "Stats", icon: "📈" }];
  const clients = subscriptions.filter(s => s.role === "client");
  const activeClients = clients.filter(c => c.status === "Active").length;

  return (
    <div style={{ minHeight: "100vh", background: "#0d1117", fontFamily: "'Inter',-apple-system,sans-serif", color: "#f0f4ff", paddingBottom: isMobile ? 70 : 0 }}>
      {showPin && <PinModal onClose={() => setShowPin(false)} onAdd={c => { onAddClient(c); }} />}
      <Header user={user} onLogout={onLogout} isMobile={isMobile} rightSlot={<button onClick={() => setShowPin(true)} style={{ background: "linear-gradient(135deg,#4d9dff,#7b5ea7)", border: "none", borderRadius: 8, color: "#fff", padding: isMobile ? "7px 10px" : "7px 14px", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>{isMobile ? "＋ PIN" : "＋ Generate PIN"}</button>} />
      <LiveTicker prices={prices} isMobile={isMobile} />
      {!isMobile && (
        <div style={{ background: "#141824", borderBottom: "1px solid #1f2535", padding: "0 24px", display: "flex", gap: 2 }}>
          {TABS.map(t => <button key={t.id} onClick={() => setTab(t.id)} style={{ background: "none", border: "none", padding: "14px 16px", color: tab === t.id ? "#4d9dff" : "#6b7694", borderBottom: tab === t.id ? "2px solid #4d9dff" : "2px solid transparent", cursor: "pointer", fontWeight: 600, fontSize: 13, fontFamily: "inherit" }}>{t.icon} {t.label}</button>)}
        </div>
      )}
      <div style={{ padding: isMobile ? 14 : 24, maxWidth: 1200, margin: "0 auto" }}>
        {tab === "overview" && (
          <>
            <div style={{ background: account ? "#00d4aa0a" : "#ffd14d0a", border: `1px solid ${account ? "#00d4aa33" : "#ffd14d33"}`, borderRadius: 10, padding: "10px 16px", marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ color: account ? "#00d4aa" : "#ffd14d", fontSize: 12, fontWeight: 700 }}>{account ? `✓ Alpaca Paper Account Connected — ${account.account_number}` : "⟳ Connecting to Alpaca Paper Trading…"}</div>
              {account && <div style={{ display: "flex", gap: 6, alignItems: "center" }}><div style={{ width: 6, height: 6, borderRadius: "50%", background: "#00d4aa" }} /><span style={{ color: "#00d4aa", fontSize: 10, fontWeight: 700 }}>LIVE</span></div>}
            </div>
            <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
              <StatCard small={isMobile} label="Today's P&L" value={fmtMoney(todayPnl)} color={pnlColor(todayPnl)} sub="Unrealized" />
              <StatCard small={isMobile} label="Open Positions" value={positions.length} sub="Active" />
              <StatCard small={isMobile} label="Active Clients" value={activeClients} sub={`of ${clients.length}`} />
              <StatCard small={isMobile} label="Equity" value={`$${equity.toLocaleString(undefined, { maximumFractionDigits: 2 })}`} color="#4d9dff" sub={`${totalPnl >= 0 ? "+" : ""}${totalPnl.toFixed(2)}%`} />
              {account && <StatCard small={isMobile} label="Buying Power" value={`$${parseFloat(buyingPower).toLocaleString(undefined, { maximumFractionDigits: 0 })}`} color="#b07aff" sub="Available" />}
            </div>
            <div style={{ background: "#141824", border: "1px solid #252d3d", borderRadius: 14, padding: isMobile ? 14 : 20, marginBottom: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Equity Curve</div>
              <ResponsiveContainer width="100%" height={isMobile ? 160 : 200}>
                <AreaChart data={EQUITY_CURVE}><defs><linearGradient id="eq" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#4d9dff" stopOpacity={0.25} /><stop offset="95%" stopColor="#4d9dff" stopOpacity={0} /></linearGradient></defs><CartesianGrid stroke="#1f2535" vertical={false} /><XAxis dataKey="date" tick={{ fill: "#6b7694", fontSize: 10 }} axisLine={false} tickLine={false} /><YAxis tick={{ fill: "#6b7694", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(1)}k`} width={44} /><Tooltip contentStyle={{ background: "#1a1f2e", border: "1px solid #252d3d", borderRadius: 10, fontSize: 12 }} formatter={v => [`$${v.toLocaleString()}`, "Equity"]} /><Area type="monotone" dataKey="equity" stroke="#4d9dff" strokeWidth={2.5} fill="url(#eq)" /></AreaChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
        {tab === "prices" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ color: "#f0f4ff", fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Live Market Prices</div>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4,1fr)", gap: 10 }}>
              {Object.entries(prices).map(([sym, p]) => {
                const change = p.price - PRICE_SEEDS[sym].price; const pct = (change / PRICE_SEEDS[sym].price) * 100; const up = change >= 0; const dec = p.price > 1000 ? 2 : p.price > 10 ? 3 : 4;
                return (
                  <div key={sym} style={{ background: "#141824", border: `1px solid ${up ? "#00d4aa33" : "#ff4d6d33"}`, borderRadius: 12, padding: "16px 14px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                      <div><div style={{ color: "#f0f4ff", fontWeight: 700, fontSize: 14 }}>{sym}</div><div style={{ color: "#6b7694", fontSize: 10, marginTop: 2 }}>{p.type}</div></div>
                      <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#00d4aa", marginTop: 4 }} />
                    </div>
                    <div style={{ color: up ? "#00d4aa" : "#ff4d6d", fontSize: 20, fontWeight: 800, fontFamily: "monospace" }}>{fmt(p.price, dec)}</div>
                    <div style={{ color: up ? "#00d4aa" : "#ff4d6d", fontSize: 12, marginTop: 4 }}>{up ? "▲" : "▼"} {fmt(Math.abs(change), dec)} ({Math.abs(pct).toFixed(2)}%)</div>
                    <div style={{ color: "#4b5568", fontSize: 10, marginTop: 4 }}>Spread: {fmt(p.spread, 4)}</div>
                  </div>
                );
              })}
            </div>
            <div style={{ background: "#141824", border: "1px solid #252d3d", borderRadius: 14, overflow: "hidden", marginTop: 6 }}>
              <div style={{ padding: "14px 18px", borderBottom: "1px solid #1f2535", fontWeight: 700, fontSize: 14 }}>Open Positions (Live P&L) {positions.length > 0 && <span style={{ color: "#00d4aa", fontSize: 11, marginLeft: 8 }}>● {positions.length} from Alpaca</span>}</div>
              {liveTrades.length === 0 ? <div style={{ padding: 24, textAlign: "center", color: "#4b5568", fontSize: 13 }}>No open positions right now</div> : liveTrades.map((t, i) => (
                <div key={t.id} style={{ padding: "12px 18px", borderTop: i === 0 ? "none" : "1px solid #1a1f2e", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}><Badge label={t.side} color={t.side === "BUY" ? "green" : "red"} /><div><div style={{ fontWeight: 700, fontSize: 13 }}>{t.asset}</div><div style={{ color: "#6b7694", fontSize: 10 }}>{t.type} · {t.size} shares</div></div></div>
                  <div style={{ textAlign: "right" }}><div style={{ color: pnlColor(t.pnl), fontWeight: 700, fontSize: 14 }}>{fmtMoney(t.pnl)}</div><div style={{ color: "#4b5568", fontSize: 10 }}>Entry: ${fmt(t.entry, 2)}</div></div>
                </div>
              ))}
            </div>
          </div>
        )}
        {tab === "positions" && (
          <div>
            <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
              <StatCard small={isMobile} label="Open Positions" value={positions.length} color="#4d9dff" />
              <StatCard small={isMobile} label="Unrealized P&L" value={fmtMoney(positions.reduce((s, p) => s + parseFloat(p.unrealized_pl || 0), 0))} color={pnlColor(positions.reduce((s, p) => s + parseFloat(p.unrealized_pl || 0), 0))} />
              <StatCard small={isMobile} label="Market Value" value={`$${positions.reduce((s, p) => s + parseFloat(p.market_value || 0), 0).toFixed(2)}`} color="#b07aff" />
            </div>
            {positions.length === 0 ? (
              <div style={{ background: "#141824", border: "1px solid #252d3d", borderRadius: 14, padding: 40, textAlign: "center" }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>📂</div>
                <div style={{ color: "#6b7694", fontSize: 14 }}>No open positions in your Alpaca paper account</div>
                <div style={{ color: "#4b5568", fontSize: 12, marginTop: 6 }}>Open a trade in Alpaca and it will appear here automatically</div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {positions.map(p => {
                  const pnl = parseFloat(p.unrealized_pl); const pnlPct = parseFloat(p.unrealized_plpc) * 100; const qty = parseFloat(p.qty); const mktVal = parseFloat(p.market_value); const entry = parseFloat(p.avg_entry_price); const curr = parseFloat(p.current_price);
                  return (
                    <div key={p.asset_id} style={{ background: "#141824", border: `1px solid ${pnlColor(pnl)}33`, borderRadius: 12, padding: 16 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                        <div><div style={{ fontWeight: 800, fontSize: 16 }}>{p.symbol}</div><div style={{ color: "#6b7694", fontSize: 11 }}>{p.asset_class?.toUpperCase()} · {qty > 0 ? "LONG" : "SHORT"} {Math.abs(qty)} shares</div></div>
                        <div style={{ textAlign: "right" }}><div style={{ color: pnlColor(pnl), fontWeight: 800, fontSize: 18 }}>{fmtMoney(pnl)}</div><div style={{ color: pnlColor(pnl), fontSize: 11 }}>{pnlPct >= 0 ? "+" : ""}{pnlPct.toFixed(2)}%</div></div>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
                        {[{ l: "Entry Price", v: `$${fmt(entry, 2)}` }, { l: "Current Price", v: <span style={{ color: pnlColor(curr - entry) }}>${fmt(curr, 2)}</span> }, { l: "Market Value", v: `$${fmt(mktVal, 2)}` }, { l: "Side", v: <Badge label={qty > 0 ? "LONG" : "SHORT"} color={qty > 0 ? "green" : "red"} /> }].map(({ l, v }) => (
                          <div key={l} style={{ background: "#1a1f2e", borderRadius: 8, padding: "8px 10px" }}><div style={{ color: "#4b5568", fontSize: 9, marginBottom: 3 }}>{l}</div><div style={{ fontWeight: 600, fontSize: 12 }}>{v}</div></div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
        {tab === "orders" && (
          <div>
            <div style={{ color: "#f0f4ff", fontWeight: 700, fontSize: 15, marginBottom: 14 }}>Recent Orders <span style={{ color: "#4b5568", fontSize: 12, fontWeight: 400 }}>— Last 20 from Alpaca</span></div>
            {recentOrders.length === 0 ? (
              <div style={{ background: "#141824", border: "1px solid #252d3d", borderRadius: 14, padding: 40, textAlign: "center" }}><div style={{ fontSize: 32, marginBottom: 12 }}>📋</div><div style={{ color: "#6b7694", fontSize: 14 }}>No recent orders found</div></div>
            ) : (
              <div style={{ background: "#141824", border: "1px solid #252d3d", borderRadius: 14, overflow: "hidden" }}>
                {recentOrders.map((o, i) => {
                  const statusColor = o.status === "filled" ? "green" : o.status === "canceled" ? "red" : o.status === "partially_filled" ? "yellow" : "gray";
                  return (
                    <div key={o.id} style={{ padding: "13px 18px", borderTop: i === 0 ? "none" : "1px solid #1a1f2e", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, background: i % 2 === 1 ? "#0f1420" : "transparent" }}>
                      <div style={{ display: "flex", gap: 10, alignItems: "center" }}><Badge label={o.side} color={o.side === "BUY" ? "green" : "red"} /><div><div style={{ fontWeight: 700, fontSize: 13 }}>{o.asset}</div><div style={{ color: "#4b5568", fontSize: 10 }}>{o.date} {o.time}</div></div></div>
                      <div style={{ display: "flex", gap: 12, alignItems: "center" }}><div style={{ textAlign: "right" }}><div style={{ color: "#8892aa", fontSize: 12 }}>{o.size} shares</div><div style={{ color: "#f0f4ff", fontWeight: 600, fontSize: 12 }}>${fmt(o.price, 2)}</div></div><Badge label={o.status?.toUpperCase()} color={statusColor} /></div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
        {tab === "clients" && (
          <div>
            <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
              <StatCard small={isMobile} label="Active" value={activeClients} color="#00d4aa" />
              <StatCard small={isMobile} label="Total" value={clients.length} />
              <StatCard small={isMobile} label="Client P&L Today" value={fmtMoney(clients.reduce((s, c) => s + c.pnlToday, 0))} color={pnlColor(clients.reduce((s, c) => s + c.pnlToday, 0))} />
            </div>
            {isMobile ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {clients.map(c => (
                  <div key={c.id} style={{ background: "#141824", border: "1px solid #252d3d", borderRadius: 12, padding: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}><div><div style={{ fontWeight: 700, fontSize: 14 }}>{c.name}</div><div style={{ color: "#6b7694", fontSize: 11 }}>{c.email}</div></div><Badge label={c.status} color={c.status === "Active" ? "green" : "yellow"} /></div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      {[{ l: "Today", v: fmtMoney(c.pnlToday), col: pnlColor(c.pnlToday) }, { l: "Total", v: fmtMoney(c.totalPnl), col: pnlColor(c.totalPnl) }, { l: "Broker", v: c.broker || "—", col: "#8892aa" }, { l: "Ratio", v: `${c.copyRatio}x`, col: "#4d9dff" }].map(({ l, v, col }) => (
                        <div key={l} style={{ background: "#1a1f2e", borderRadius: 8, padding: "8px 10px" }}><div style={{ color: "#4b5568", fontSize: 10 }}>{l}</div><div style={{ color: col, fontWeight: 700, fontSize: 13 }}>{v}</div></div>
                      ))}
                    </div>
                    <div style={{ display: "flex", gap: 6, marginTop: 10 }}><Badge label={c.plan} color={c.plan === "Elite" ? "yellow" : "blue"} /><span style={{ color: "#4b5568", fontSize: 10 }}>PIN: {c.pin} · Exp {c.expiry}</span></div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ background: "#141824", border: "1px solid #252d3d", borderRadius: 14, overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead><tr style={{ background: "#1a1f2e" }}>{["Client", "Plan", "Broker", "Ratio", "Today P&L", "Total P&L", "Status"].map(h => <th key={h} style={{ padding: "11px 14px", textAlign: "left", color: "#6b7694", fontSize: 10, fontWeight: 700, letterSpacing: "0.08em" }}>{h}</th>)}</tr></thead>
                  <tbody>{clients.map((c, i) => <tr key={c.id} style={{ borderTop: "1px solid #1f2535", background: i % 2 === 1 ? "#0f1420" : "transparent" }}><td style={{ padding: "13px 14px" }}><div style={{ fontWeight: 700, fontSize: 13 }}>{c.name}</div><div style={{ color: "#4b5568", fontSize: 11 }}>{c.email}</div></td><td style={{ padding: "13px 14px" }}><Badge label={c.plan} color={c.plan === "Elite" ? "yellow" : "blue"} /></td><td style={{ padding: "13px 14px", color: "#8892aa", fontSize: 12 }}>{c.broker || "—"}</td><td style={{ padding: "13px 14px", color: "#4d9dff", fontWeight: 700 }}>{c.copyRatio}x</td><td style={{ padding: "13px 14px", fontWeight: 700, color: pnlColor(c.pnlToday) }}>{fmtMoney(c.pnlToday)}</td><td style={{ padding: "13px 14px", fontWeight: 700, color: pnlColor(c.totalPnl) }}>{fmtMoney(c.totalPnl)}</td><td style={{ padding: "13px 14px" }}><Badge label={c.status} color={c.status === "Active" ? "green" : "yellow"} /></td></tr>)}</tbody>
                </table>
              </div>
            )}
          </div>
        )}
        {tab === "subscriptions" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ color: "#f0f4ff", fontWeight: 700, fontSize: 16 }}>Subscription Management</div>
              <button onClick={() => setShowPin(true)} style={{ background: "linear-gradient(135deg,#4d9dff,#7b5ea7)", border: "none", borderRadius: 8, color: "#fff", padding: "8px 14px", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>＋ New PIN</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {clients.map(c => {
                const expDays = Math.round((new Date(c.expiry) - new Date()) / 86400000);
                const expColor = expDays < 14 ? "#ff4d6d" : expDays < 30 ? "#ffd14d" : "#00d4aa";
                return (
                  <div key={c.id} style={{ background: "#141824", border: "1px solid #252d3d", borderRadius: 12, padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                    <div><div style={{ fontWeight: 700, fontSize: 14 }}>{c.name}</div><div style={{ color: "#6b7694", fontSize: 11, marginTop: 2 }}>{c.email}</div></div>
                    <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
                      <div style={{ textAlign: "center" }}><div style={{ color: "#4b5568", fontSize: 10 }}>PIN</div><div style={{ color: "#4d9dff", fontWeight: 800, fontFamily: "monospace", fontSize: 16, letterSpacing: "0.1em" }}>{c.pin}</div></div>
                      <div style={{ textAlign: "center" }}><div style={{ color: "#4b5568", fontSize: 10 }}>Plan</div><Badge label={c.plan} color={c.plan === "Elite" ? "yellow" : "blue"} /></div>
                      <div style={{ textAlign: "center" }}><div style={{ color: "#4b5568", fontSize: 10 }}>Expires</div><div style={{ color: expColor, fontWeight: 700, fontSize: 12 }}>{c.expiry} <span style={{ fontSize: 10 }}>({expDays}d)</span></div></div>
                      <Badge label={c.status} color={c.status === "Active" ? "green" : "yellow"} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {tab === "performance" && (
          <>
            <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
              <StatCard small={isMobile} label="10d Total" value={`$${DAILY_PERFORMANCE.reduce((s, d) => s + d.pnl, 0)}`} color="#00d4aa" />
              <StatCard small={isMobile} label="Best Day" value={`$${Math.max(...DAILY_PERFORMANCE.map(d => d.pnl))}`} color="#4d9dff" />
              <StatCard small={isMobile} label="Worst Day" value={`$${Math.min(...DAILY_PERFORMANCE.map(d => d.pnl))}`} color="#ff4d6d" />
              <StatCard small={isMobile} label="Avg Win Rate" value={`${Math.round(DAILY_PERFORMANCE.reduce((s, d) => s + d.winRate, 0) / DAILY_PERFORMANCE.length)}%`} color="#00d4aa" />
            </div>
            <div style={{ background: "#141824", border: "1px solid #252d3d", borderRadius: 14, padding: isMobile ? 14 : 20, marginBottom: 14 }}>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>Win Rate Trend</div>
              <ResponsiveContainer width="100%" height={isMobile ? 140 : 180}>
                <LineChart data={DAILY_PERFORMANCE}><CartesianGrid stroke="#1f2535" vertical={false} /><XAxis dataKey="date" tick={{ fill: "#6b7694", fontSize: 10 }} axisLine={false} tickLine={false} /><YAxis tick={{ fill: "#6b7694", fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, 100]} tickFormatter={v => `${v}%`} width={36} /><Tooltip contentStyle={{ background: "#1a1f2e", border: "1px solid #252d3d", borderRadius: 10, fontSize: 12 }} formatter={v => [`${v}%`, "Win Rate"]} /><Line type="monotone" dataKey="winRate" stroke="#00d4aa" strokeWidth={2.5} dot={{ fill: "#00d4aa", r: 3 }} /></LineChart>
              </ResponsiveContainer>
            </div>
            <div style={{ background: "#141824", border: "1px solid #252d3d", borderRadius: 14, overflow: "hidden" }}>
              <div style={{ padding: "14px 18px", borderBottom: "1px solid #1f2535", fontWeight: 700, fontSize: 14 }}>Daily Breakdown</div>
              {[...DAILY_PERFORMANCE].reverse().map((d, i) => (
                <div key={d.date} style={{ padding: "11px 18px", borderTop: i === 0 ? "none" : "1px solid #1a1f2e", display: "flex", justifyContent: "space-between", alignItems: "center", background: i % 2 === 1 ? "#0f1420" : "transparent" }}>
                  <div style={{ fontWeight: 600, fontSize: 13, width: 54 }}>{d.date}</div>
                  <div style={{ color: "#6b7694", fontSize: 12 }}>{d.trades} trades</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}><div style={{ background: "#1a1f2e", borderRadius: 3, height: 5, width: isMobile ? 50 : 80, overflow: "hidden" }}><div style={{ background: d.winRate >= 60 ? "#00d4aa" : "#ff4d6d", height: "100%", width: `${d.winRate}%` }} /></div><span style={{ color: d.winRate >= 60 ? "#00d4aa" : "#ff4d6d", fontSize: 12, fontWeight: 600 }}>{d.winRate}%</span></div>
                  <div style={{ fontWeight: 700, color: pnlColor(d.pnl), fontSize: 13 }}>{fmtMoney(d.pnl)}</div>
                  <Badge label={d.pnl >= 0 ? "✓ Profit" : "✗ Loss"} color={d.pnl >= 0 ? "green" : "red"} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      {isMobile && <MobileTabBar tabs={[{ id: "overview", label: "Home", icon: "📊" }, { id: "positions", label: "Positions", icon: "📂" }, { id: "orders", label: "Orders", icon: "📋" }, { id: "clients", label: "Clients", icon: "👥" }, { id: "subscriptions", label: "Subs", icon: "🔑" }]} active={tab} onChange={setTab} />}
    </div>
  );
}

function ClientDashboard({ user, onLogout, prices }) {
  const [tab, setTab] = useState("overview");
  const [showSetup, setShowSetup] = useState(false);
  const [settings, setSettings] = useState(user.broker ? { broker: user.broker, copyRatio: user.copyRatio, riskPercent: 1, maxLoss: 500, assets: ALL_INSTRUMENTS.map(i => i.name), lotSizeMode: "proportional" } : null);
  const isMobile = useIsMobile();
  const clientData = user;
  const positions = useAlpacaPositions();

  const TABS = [{ id: "overview", label: "Overview", icon: "📊" }, { id: "live", label: "Live", icon: "💹" }, { id: "performance", label: "Stats", icon: "📈" }, { id: "settings", label: "Settings", icon: "⚙️" }];

  const LIVE_TRADES = positions.length > 0 ? positions.map((p, i) => ({ id: i + 1, asset: p.symbol, type: p.asset_class === "crypto" ? "Crypto" : "Stock", side: parseFloat(p.qty) > 0 ? "BUY" : "SELL", entry: parseFloat(p.avg_entry_price), current: parseFloat(p.current_price), size: Math.abs(parseFloat(p.qty)), masterPnl: parseFloat(p.unrealized_pl) })) : [];

  return (
    <div style={{ minHeight: "100vh", background: "#0d1117", fontFamily: "'Inter',-apple-system,sans-serif", color: "#f0f4ff", paddingBottom: isMobile ? 70 : 0 }}>
      {showSetup && <ClientSetupModal onSave={s => setSettings(s)} onClose={() => setShowSetup(false)} existing={settings} />}
      <Header user={user} onLogout={onLogout} isMobile={isMobile} rightSlot={<button onClick={() => setShowSetup(true)} style={{ background: settings ? "#1a1f2e" : "linear-gradient(135deg,#4d9dff,#7b5ea7)", border: settings ? "1px solid #252d3d" : "none", borderRadius: 8, color: settings ? "#6b7694" : "#fff", padding: isMobile ? "7px 10px" : "7px 12px", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>{isMobile ? "⚙️" : (settings ? "⚙ Edit Setup" : "⚙ Setup CopyTrade")}</button>} />
      <LiveTicker prices={prices} isMobile={isMobile} />
      {!settings && <div style={{ background: "#4d9dff0d", border: "1px solid #4d9dff33", margin: isMobile ? "12px 14px" : "16px 24px", borderRadius: 12, padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}><div><div style={{ color: "#4d9dff", fontWeight: 700, fontSize: 13 }}>⚡ Setup Required</div><div style={{ color: "#6b7694", fontSize: 12, marginTop: 2 }}>Connect your broker to start copying trades automatically.</div></div><button onClick={() => setShowSetup(true)} style={{ background: "#4d9dff", border: "none", borderRadius: 8, color: "#fff", padding: "8px 14px", cursor: "pointer", fontWeight: 700, fontSize: 12, whiteSpace: "nowrap" }}>Set Up →</button></div>}
      {settings && <div style={{ background: "#00d4aa0a", border: "1px solid #00d4aa33", margin: isMobile ? "12px 14px" : "16px 24px", borderRadius: 12, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}><div style={{ color: "#00d4aa", fontSize: 13, fontWeight: 700 }}>✓ CopyTrading Active — {settings.broker} · {settings.copyRatio}x · Risk {settings.riskPercent}%</div><div style={{ display: "flex", alignItems: "center", gap: 6 }}><div style={{ width: 7, height: 7, borderRadius: "50%", background: "#00d4aa" }} /><span style={{ color: "#00d4aa", fontSize: 11, fontWeight: 700 }}>LIVE</span></div></div>}
      {!isMobile && <div style={{ background: "#141824", borderBottom: "1px solid #1f2535", padding: "0 24px", display: "flex", gap: 2 }}>{TABS.map(t => <button key={t.id} onClick={() => setTab(t.id)} style={{ background: "none", border: "none", padding: "14px 16px", color: tab === t.id ? "#4d9dff" : "#6b7694", borderBottom: tab === t.id ? "2px solid #4d9dff" : "2px solid transparent", cursor: "pointer", fontWeight: 600, fontSize: 13, fontFamily: "inherit" }}>{t.icon} {t.label}</button>)}</div>}
      <div style={{ padding: isMobile ? 14 : 24, maxWidth: 1100, margin: "0 auto" }}>
        {tab === "overview" && (
          <>
            <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
              <StatCard small={isMobile} label="Today's P&L" value={fmtMoney(clientData.pnlToday)} color={pnlColor(clientData.pnlToday)} sub="Copied" />
              <StatCard small={isMobile} label="Total P&L" value={fmtMoney(clientData.totalPnl)} color="#00d4aa" />
              <StatCard small={isMobile} label="Copy Ratio" value={`${clientData.copyRatio}x`} color="#4d9dff" />
              <StatCard small={isMobile} label="Plan" value={user.plan} color="#ffd14d" sub={`Exp ${user.expiry}`} />
            </div>
            <div style={{ background: "#141824", border: "1px solid #252d3d", borderRadius: 14, padding: isMobile ? 14 : 20, marginBottom: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Master's Open Positions</div>
              <div style={{ color: "#6b7694", fontSize: 12, marginBottom: 14 }}>Your trades mirror these, scaled by {clientData.copyRatio}x</div>
              {LIVE_TRADES.length === 0 ? (
                <div style={{ textAlign: "center", padding: "24px 0" }}>
                  <div style={{ fontSize: 32, marginBottom: 10 }}>📭</div>
                  <div style={{ color: "#6b7694", fontSize: 14, fontWeight: 600 }}>No open positions right now</div>
                  <div style={{ color: "#4b5568", fontSize: 12, marginTop: 6 }}>When the master opens a trade it will appear here automatically and be copied to your account.</div>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4,1fr)", gap: 10 }}>
                  {LIVE_TRADES.map(t => (
                    <div key={t.id} style={{ background: "#1a1f2e", borderRadius: 10, padding: "13px 14px", border: "1px solid #252d3d" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}><div style={{ fontWeight: 700, fontSize: 13 }}>{t.asset}</div><Badge label={t.side} color={t.side === "BUY" ? "green" : "red"} /></div>
                      <div style={{ color: pnlColor(t.masterPnl), fontWeight: 700, fontSize: 16 }}>{fmtMoney(t.masterPnl)}</div>
                      <div style={{ color: "#6b7694", fontSize: 10, marginTop: 4 }}>Your P&L: <span style={{ color: pnlColor(t.masterPnl * clientData.copyRatio), fontWeight: 700 }}>{fmtMoney(t.masterPnl * clientData.copyRatio)}</span></div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div style={{ background: "#141824", border: "1px solid #252d3d", borderRadius: 14, padding: isMobile ? 14 : 20 }}>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>Your 10-Day Performance</div>
              <ResponsiveContainer width="100%" height={isMobile ? 150 : 190}>
                <AreaChart data={DAILY_PERFORMANCE.map(d => ({ ...d, myPnl: +(d.pnl * clientData.copyRatio).toFixed(2) }))}>
                  <defs><linearGradient id="mypnl" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#00d4aa" stopOpacity={0.25} /><stop offset="95%" stopColor="#00d4aa" stopOpacity={0} /></linearGradient></defs>
                  <CartesianGrid stroke="#1f2535" vertical={false} /><XAxis dataKey="date" tick={{ fill: "#6b7694", fontSize: 10 }} axisLine={false} tickLine={false} /><YAxis tick={{ fill: "#6b7694", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} width={40} /><Tooltip contentStyle={{ background: "#1a1f2e", border: "1px solid #252d3d", borderRadius: 10, fontSize: 12 }} formatter={v => [`$${v}`, "Your P&L"]} /><Area type="monotone" dataKey="myPnl" stroke="#00d4aa" strokeWidth={2.5} fill="url(#mypnl)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
        {tab === "live" && (
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>Your Copied Positions — Live</div>
            {LIVE_TRADES.length === 0 ? (
              <div style={{ background: "#141824", border: "1px solid #252d3d", borderRadius: 14, padding: 40, textAlign: "center" }}><div style={{ fontSize: 32, marginBottom: 12 }}>📭</div><div style={{ color: "#6b7694", fontSize: 14 }}>No copied positions right now</div><div style={{ color: "#4b5568", fontSize: 12, marginTop: 6 }}>Positions will appear here when the master opens trades.</div></div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {LIVE_TRADES.map(t => {
                  const yourPnl = t.masterPnl * clientData.copyRatio; const yourLot = (t.size * clientData.copyRatio).toFixed(2); const dec = t.entry > 100 ? 2 : 4;
                  return (
                    <div key={t.id} style={{ background: "#141824", border: `1px solid ${pnlColor(yourPnl)}33`, borderRadius: 12, padding: 16 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                        <div><div style={{ fontWeight: 700, fontSize: 15 }}>{t.asset}</div><div style={{ color: "#6b7694", fontSize: 11 }}>{t.type}</div></div>
                        <div style={{ textAlign: "right" }}><div style={{ color: pnlColor(yourPnl), fontWeight: 800, fontSize: 18 }}>{fmtMoney(yourPnl)}</div><div style={{ color: "#4b5568", fontSize: 10 }}>Your P&L</div></div>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
                        {[{ l: "Direction", v: <Badge label={t.side} color={t.side === "BUY" ? "green" : "red"} /> }, { l: "Entry", v: fmt(t.entry, dec) }, { l: "Current", v: <span style={{ color: pnlColor(t.current - t.entry) }}>{fmt(t.current, dec)}</span> }, { l: "Your Lot", v: <span style={{ color: "#4d9dff" }}>{yourLot}</span> }].map(({ l, v }) => (
                          <div key={l} style={{ background: "#1a1f2e", borderRadius: 8, padding: "8px 10px" }}><div style={{ color: "#4b5568", fontSize: 9, marginBottom: 3 }}>{l}</div><div style={{ fontWeight: 600, fontSize: 12 }}>{v}</div></div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
        {tab === "performance" && (
          <>
            <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
              <StatCard small={isMobile} label="Best Day" value={fmtMoney(Math.max(...DAILY_PERFORMANCE.map(d => d.pnl * clientData.copyRatio)))} color="#00d4aa" />
              <StatCard small={isMobile} label="Worst Day" value={fmtMoney(Math.min(...DAILY_PERFORMANCE.map(d => d.pnl * clientData.copyRatio)))} color="#ff4d6d" />
              <StatCard small={isMobile} label="Avg/Day" value={fmtMoney(DAILY_PERFORMANCE.reduce((s, d) => s + d.pnl * clientData.copyRatio, 0) / DAILY_PERFORMANCE.length)} color="#4d9dff" />
            </div>
            <div style={{ background: "#141824", border: "1px solid #252d3d", borderRadius: 14, overflow: "hidden" }}>
              <div style={{ padding: "14px 18px", borderBottom: "1px solid #1f2535", fontWeight: 700, fontSize: 14 }}>Daily Log</div>
              {[...DAILY_PERFORMANCE].reverse().map((d, i) => (
                <div key={d.date} style={{ padding: "11px 18px", borderTop: i === 0 ? "none" : "1px solid #1a1f2e", display: "flex", justifyContent: "space-between", alignItems: "center", background: i % 2 === 1 ? "#0f1420" : "transparent" }}>
                  <div style={{ fontWeight: 600, fontSize: 12, width: 54 }}>{d.date}</div>
                  <div style={{ color: "#6b7694", fontSize: 11 }}>{d.trades} trades</div>
                  <div style={{ color: d.winRate >= 60 ? "#00d4aa" : "#ff4d6d", fontWeight: 600, fontSize: 12 }}>{d.winRate}%</div>
                  <div style={{ fontWeight: 700, color: pnlColor(d.pnl * clientData.copyRatio), fontSize: 13 }}>{fmtMoney(d.pnl * clientData.copyRatio)}</div>
                  <Badge label={d.pnl >= 0 ? "Profit" : "Loss"} color={d.pnl >= 0 ? "green" : "red"} />
                </div>
              ))}
            </div>
          </>
        )}
        {tab === "settings" && (
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Account & CopyTrade Settings</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ background: "#141824", border: "1px solid #252d3d", borderRadius: 14, padding: 20 }}>
                <div style={{ color: "#6b7694", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", marginBottom: 14 }}>ACCOUNT INFO</div>
                {[["Name", user.name], ["Email", user.email || "—"], ["PIN", user.pin], ["Plan", user.plan], ["Expiry", user.expiry]].map(([l, v]) => (
                  <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #1a1f2e" }}><span style={{ color: "#6b7694", fontSize: 13 }}>{l}</span><span style={{ color: "#f0f4ff", fontWeight: 600, fontSize: 13 }}>{v}</span></div>
                ))}
              </div>
              {settings ? (
                <div style={{ background: "#141824", border: "1px solid #252d3d", borderRadius: 14, padding: 20 }}>
                  <div style={{ color: "#6b7694", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", marginBottom: 14 }}>COPYTRADE CONFIG</div>
                  {[["Broker", settings.broker], ["Copy Ratio", `${settings.copyRatio}x`], ["Risk/Trade", `${settings.riskPercent}%`], ["Max Daily Loss", `$${settings.maxLoss}`], ["Lot Size Mode", settings.lotSizeMode], ["Instruments", settings.assets.length ? settings.assets.join(", ") : "None selected"]].map(([l, v]) => (
                    <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #1a1f2e" }}><span style={{ color: "#6b7694", fontSize: 13 }}>{l}</span><span style={{ color: "#f0f4ff", fontWeight: 600, fontSize: 12, textAlign: "right", maxWidth: "60%" }}>{v}</span></div>
                  ))}
                  <button onClick={() => setShowSetup(true)} style={{ marginTop: 14, width: "100%", background: "#1a1f2e", border: "1px solid #252d3d", borderRadius: 8, color: "#4d9dff", padding: "10px", cursor: "pointer", fontWeight: 700, fontSize: 13 }}>Edit Settings</button>
                </div>
              ) : (
                <div style={{ background: "#4d9dff0d", border: "1px solid #4d9dff33", borderRadius: 14, padding: 20, textAlign: "center" }}>
                  <div style={{ color: "#4d9dff", fontWeight: 700, marginBottom: 8 }}>CopyTrade Not Configured</div>
                  <button onClick={() => setShowSetup(true)} style={{ background: "linear-gradient(135deg,#4d9dff,#7b5ea7)", border: "none", borderRadius: 8, color: "#fff", padding: "10px 20px", cursor: "pointer", fontWeight: 700, fontSize: 13 }}>Configure Now →</button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      {isMobile && <MobileTabBar tabs={TABS} active={tab} onChange={setTab} />}
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState("login");
  const [user, setUser] = useState(null);
  const [subscriptions, setSubscriptions] = useState(INITIAL_SUBSCRIPTIONS);
  const prices = useLivePrices();
  const addClient = (c) => setSubscriptions(s => [...s, c]);
  const handlePaymentSuccess = (newClient) => { addClient(newClient); };
  if (screen === "subscribe") return <SubscribePage onBack={() => setScreen("login")} onPaymentSuccess={handlePaymentSuccess} />;
  if (!user) return <LoginScreen onLogin={setUser} subscriptions={subscriptions} onSubscribe={() => setScreen("subscribe")} />;
  if (user.role === "master") return <MasterDashboard user={user} onLogout={() => setUser(null)} subscriptions={subscriptions} onAddClient={addClient} prices={prices} />;
  return <ClientDashboard user={user} onLogout={() => setUser(null)} prices={prices} />;
}
