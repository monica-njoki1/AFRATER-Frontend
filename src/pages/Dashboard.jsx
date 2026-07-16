// src/pages/Dashboard.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, MessageSquare, Image, CreditCard, ArrowDownLeft,
  History, AlertTriangle, CheckCircle, XCircle, Loader2,
  ChevronRight, Upload, Flag, ArrowLeft, RefreshCw, Star,
  Eye, EyeOff, TrendingUp, Bell, ChevronDown, ChevronUp,
  LogOut, Trash2, User, Lock, Send, Search, MoreHorizontal,
  Activity, Zap, ArrowUpRight, ArrowDownRight, Phone
} from "lucide-react";
import "@fontsource/orbitron/700.css";
import Navbar from "../components/Navbar";
import PaymentTab from "../components/PaymentTab";
import { checkMessage, uploadScreenshot, logoutUser, updateProfile, deleteAccount } from "../api/api";

const BASE_URL = "https://afrater-backend.onrender.com";
const getToken = () => localStorage.getItem("token");

async function apiFetch(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    mode: "cors", ...options,
    headers: { Authorization: `Bearer ${getToken()}`, ...options.headers },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

// ── Simulated balance — updates when payments go through ─────────
const INITIAL_BALANCE = 12450.00;
const BALANCE_KEY = "afrater_sim_balance";

function getSimBalance() {
  try {
    const saved = localStorage.getItem(BALANCE_KEY);
    return saved ? parseFloat(saved) : INITIAL_BALANCE;
  } catch { return INITIAL_BALANCE; }
}

function setSimBalance(amount) {
  try { localStorage.setItem(BALANCE_KEY, amount.toString()); } catch {}
}

// ── Simulated recent transactions ────────────────────────────────
const SIMULATED_RECENT = [
  { id: 1, phone: "0712 345 678", name: "John Kamau",    amount: -500,   status: "completed", verdict: "safe",       time: "Today, 10:23 AM" },
  { id: 2, phone: "0756 140 378", name: "Unknown",       amount: -1000,  status: "blocked",   verdict: "fraud",      time: "Today, 08:15 AM" },
  { id: 3, phone: "0798 765 432", name: "Grace Wanjiku", amount: +2000,  status: "completed", verdict: "safe",       time: "Yesterday, 4:30 PM" },
  { id: 4, phone: "0733 111 222", name: "Unknown",       amount: -300,   status: "completed", verdict: "suspicious", time: "Yesterday, 1:10 PM" },
  { id: 5, phone: "0711 999 888", name: "James Otieno",  amount: +500,   status: "completed", verdict: "safe",       time: "Mon, 9:00 AM" },
];

// ── Verdict styles ───────────────────────────────────────────────
const VERDICT = {
  fraud:      { color: "text-red-400",    bg: "bg-red-500/10",    border: "border-red-500/20",    icon: XCircle,      label: "FRAUD" },
  suspicious: { color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20", icon: AlertTriangle, label: "RISK" },
  safe:       { color: "text-green-400",  bg: "bg-green-500/10",  border: "border-green-500/20",  icon: CheckCircle,  label: "SAFE" },
};

function VerdictBadge({ verdict }) {
  const v = VERDICT[verdict] || VERDICT.safe;
  const Icon = v.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-bold ${v.color} ${v.bg} ${v.border}`}>
      <Icon className="w-3 h-3" />{v.label}
    </span>
  );
}

// ── Avatar ───────────────────────────────────────────────────────
function Avatar({ user, size = "md" }) {
  const [err, setErr] = useState(false);
  const sizes = { sm: "w-8 h-8 text-xs", md: "w-11 h-11 text-sm", lg: "w-16 h-16 text-xl" };
  const colors = ["#06b6d4","#8b5cf6","#ec4899","#f59e0b","#10b981"];
  const bg = colors[(user?.name?.charCodeAt(0) || 0) % colors.length];
  const initials = user?.name?.split(" ").map(p => p[0]).slice(0,2).join("").toUpperCase() || "?";
  const src = !err ? (user?.profile_pic_url || user?.profile_pic_cache || null) : null;

  if (src) return (
    <div className={`${sizes[size]} rounded-full overflow-hidden flex-shrink-0 ring-2 ring-cyan-400/30`}>
      <img src={src} alt="avatar" className="w-full h-full object-cover" onError={() => setErr(true)} />
    </div>
  );
  return (
    <div className={`${sizes[size]} rounded-full flex items-center justify-center flex-shrink-0 font-bold text-white ring-2 ring-cyan-400/30`} style={{ backgroundColor: bg }}>
      {initials}
    </div>
  );
}

// ================================================================
//  BALANCE CARD
// ================================================================
function BalanceCard({ balance, onRefresh }) {
  const [show, setShow] = useState(true);

  return (
    <div className="relative rounded-2xl overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-purple-700 to-cyan-600 opacity-90" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxjaXJjbGUgY3g9IjMwIiBjeT0iMzAiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L2c+PC9zdmc+')] opacity-40" />

      <div className="relative p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-white/80" />
            <span className="text-white/80 text-xs font-medium tracking-wider uppercase">M-Pesa Wallet</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onRefresh} className="text-white/40 hover:text-white transition-colors">
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => setShow(s => !s)} className="text-white/60 hover:text-white transition-colors">
              {show ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div>
          <p className="text-white/60 text-xs mb-1">Available Balance</p>
          <motion.div key={balance} initial={{ scale: 0.97 }} animate={{ scale: 1 }}>
            <span className="text-4xl font-extrabold text-white tracking-tight" style={{ fontFamily: "Orbitron" }}>
              {show ? `KES ${balance.toLocaleString("en-KE", { minimumFractionDigits: 2 })}` : "KES ••••••"}
            </span>
          </motion.div>
          <p className="text-white/40 text-xs mt-1">* Simulated — live data coming soon</p>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="bg-white/10 rounded-xl px-3 py-2.5">
            <div className="flex items-center gap-1.5 mb-0.5">
              <ArrowUpRight className="w-3.5 h-3.5 text-red-300" />
              <span className="text-white/60 text-xs">Sent (30d)</span>
            </div>
            <p className="text-white font-bold text-sm">KES 1,800</p>
          </div>
          <div className="bg-white/10 rounded-xl px-3 py-2.5">
            <div className="flex items-center gap-1.5 mb-0.5">
              <ArrowDownRight className="w-3.5 h-3.5 text-green-300" />
              <span className="text-white/60 text-xs">Received (30d)</span>
            </div>
            <p className="text-white font-bold text-sm">KES 2,500</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ================================================================
//  SECURITY SCORE STRIP
// ================================================================
function SecurityStrip() {
  const score = 87;
  const label = score >= 80 ? "Excellent" : score >= 60 ? "Good" : "At Risk";
  const color = score >= 80 ? "from-green-500 to-cyan-400" : score >= 60 ? "from-yellow-500 to-orange-400" : "from-red-500 to-orange-500";

  return (
    <div className="bg-gray-800/60 border border-white/10 rounded-xl px-4 py-3 flex items-center gap-4">
      <div className="flex-1 space-y-1.5">
        <div className="flex justify-between text-xs">
          <span className="text-gray-400 flex items-center gap-1"><Lock className="w-3 h-3" /> Security Score</span>
          <span className="text-white font-bold">{score}/100 — {label}</span>
        </div>
        <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
          <motion.div className={`h-full rounded-full bg-gradient-to-r ${color}`}
            initial={{ width: 0 }} animate={{ width: `${score}%` }}
            transition={{ duration: 1, delay: 0.3 }} />
        </div>
      </div>
      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-cyan-400 flex items-center justify-center flex-shrink-0">
        <Shield className="w-4 h-4 text-white" />
      </div>
    </div>
  );
}

// ================================================================
//  QUICK ACTIONS
// ================================================================
function QuickActions({ onAction }) {
  const actions = [
    { id: "send",      label: "Send",    icon: Send,         color: "from-purple-500 to-purple-600" },
    { id: "receive",   label: "Receive", icon: ArrowDownLeft, color: "from-cyan-500 to-cyan-600" },
    { id: "check",     label: "Check",   icon: MessageSquare, color: "from-blue-500 to-blue-600" },
    { id: "scan",      label: "Scan",    icon: Search,        color: "from-pink-500 to-pink-600" },
  ];

  return (
    <div className="grid grid-cols-4 gap-3">
      {actions.map(a => {
        const Icon = a.icon;
        return (
          <button key={a.id} onClick={() => onAction(a.id)}
            className="flex flex-col items-center gap-2 group">
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${a.color} flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <span className="text-gray-400 text-xs font-medium group-hover:text-white transition-colors">{a.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ================================================================
//  RECENT TRANSACTIONS
// ================================================================
function RecentTransactions({ onViewAll }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-white font-bold text-sm">Recent Transactions</h2>
        <button onClick={onViewAll} className="text-cyan-400 text-xs font-medium hover:text-cyan-300 transition-colors flex items-center gap-1">
          View all <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      <div className="space-y-2">
        {SIMULATED_RECENT.map((tx, i) => {
          const v = VERDICT[tx.verdict] || VERDICT.safe;
          const Icon = v.icon;
          const isOut = tx.amount < 0;

          return (
            <motion.div key={tx.id}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="flex items-center gap-3 bg-gray-800/50 hover:bg-gray-700/50 border border-white/5 rounded-xl px-4 py-3 transition-colors cursor-pointer">

              {/* Icon */}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${v.bg}`}>
                <Icon className={`w-4 h-4 ${v.color}`} />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{tx.name}</p>
                <p className="text-gray-400 text-xs">{tx.phone} · {tx.time}</p>
              </div>

              {/* Amount + badge */}
              <div className="text-right flex-shrink-0">
                <p className={`font-bold text-sm ${isOut ? "text-red-400" : "text-green-400"}`}>
                  {isOut ? "-" : "+"}KES {Math.abs(tx.amount).toLocaleString()}
                </p>
                <VerdictBadge verdict={tx.verdict} />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ================================================================
//  FRAUD ALERT BANNER
// ================================================================
function FraudAlertBanner() {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;
  return (
    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
      className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 flex items-start gap-3">
      <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-red-300 font-semibold text-sm">Fraud Attempt Blocked</p>
        <p className="text-gray-400 text-xs mt-0.5">A payment to 0756 140 378 was blocked — this number is community-blacklisted.</p>
      </div>
      <button onClick={() => setVisible(false)} className="text-gray-500 hover:text-white transition-colors flex-shrink-0">
        <XCircle className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

// ================================================================
//  EXPANDABLE PROFILE SECTION
// ================================================================
function ProfileSection({ user, onLogout, onProfileUpdate }) {
  const [open,       setOpen]       = useState(false);
  const [uploading,  setUploading]  = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [delPass,    setDelPass]    = useState("");
  const [deleting,   setDeleting]   = useState(false);
  const [error,      setError]      = useState("");
  const fileRef = useRef(null);
  const dropdownRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false); setShowDelete(false); setDelPass(""); setError("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handlePicChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      onProfileUpdate({ ...user, profile_pic_cache: ev.target.result });
      setUploading(true);
      try {
        const updated = await updateProfile({ profile_pic: file });
        const u = updated.user || updated;
        onProfileUpdate({ ...user, ...u, profile_pic_cache: null });
        localStorage.setItem("user", JSON.stringify({ ...user, ...u, profile_pic_cache: null }));
      } catch (err) { setError(err.message); }
      setUploading(false);
      e.target.value = "";
    };
    reader.readAsDataURL(file);
  };

  const handleDelete = async () => {
    if (!delPass) { setError("Enter your password"); return; }
    setDeleting(true);
    try {
      await deleteAccount(delPass);
      onLogout();
    } catch (err) { setError(err.message); setDeleting(false); }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Compact trigger — avatar + name + chevron */}
      <button
        onClick={() => { setOpen(o => !o); setShowDelete(false); setError(""); }}
        className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/10 transition-colors"
      >
        <Avatar user={user} size="sm" />
        <span className="text-sm font-medium text-gray-200 hidden sm:block max-w-[100px] truncate">
          {user?.name?.split(" ")[0]}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-12 w-72 bg-gray-800 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50"
          >
            {/* User info header */}
            <div className="px-4 py-4 flex items-center gap-3 border-b border-white/10">
              <Avatar user={user} size="md" />
              <div className="overflow-hidden">
                <p className="text-white font-bold text-sm truncate">{user?.name}</p>
                <p className="text-gray-400 text-xs truncate">{user?.email}</p>
              </div>
            </div>

            {!showDelete ? (
              <div className="py-2">
                <button onClick={() => fileRef.current?.click()} disabled={uploading}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-200 hover:bg-white/10 transition-colors disabled:opacity-50">
                  <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                    <Upload className="w-4 h-4 text-cyan-400" />
                  </div>
                  {uploading ? "Uploading..." : "Change Profile Photo"}
                </button>
                <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/gif" className="hidden" onChange={handlePicChange} />

                <button onClick={() => { setOpen(false); onLogout(); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-200 hover:bg-white/10 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-gray-500/20 flex items-center justify-center flex-shrink-0">
                    <LogOut className="w-4 h-4 text-gray-400" />
                  </div>
                  Logout
                </button>

                <div className="border-t border-white/10 my-1" />

                <button onClick={() => setShowDelete(true)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </div>
                  Delete Account
                </button>
              </div>
            ) : (
              <div className="px-4 py-4 space-y-3">
                <p className="text-white text-sm font-semibold">Confirm account deletion</p>
                <p className="text-gray-400 text-xs">This is permanent. Enter your password to confirm.</p>
                <input type="password" placeholder="Your password" value={delPass}
                  onChange={e => setDelPass(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleDelete()}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-red-400 transition-colors" />
                {error && <p className="text-red-400 text-xs">{error}</p>}
                <div className="flex gap-2">
                  <button onClick={() => { setShowDelete(false); setDelPass(""); setError(""); }}
                    className="flex-1 py-2.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm text-gray-200 transition-colors">Cancel</button>
                  <button onClick={handleDelete} disabled={deleting}
                    className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 disabled:opacity-50 rounded-lg text-sm text-white font-semibold transition-colors">
                    {deleting ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ================================================================
//  RESULT CARD (shared across tabs)
// ================================================================
function ResultCard({ result }) {
  if (!result) return null;
  const verdictBg = {
    fraud: "border-red-500/30 bg-red-500/5",
    suspicious: "border-yellow-500/30 bg-yellow-500/5",
    safe: "border-green-500/30 bg-green-500/5",
  };
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className={`border rounded-xl p-4 space-y-3 ${verdictBg[result.verdict] || verdictBg.safe}`}>
      <div className="flex items-center justify-between flex-wrap gap-2">
        <VerdictBadge verdict={result.verdict} />
        {result.score !== undefined && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-400">Risk Score</span>
            <span className="text-white font-bold">{result.score}/100</span>
          </div>
        )}
      </div>
      {result.reasons?.length > 0 && (
        <ul className="space-y-1.5">
          {result.reasons.map((r, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
              <ChevronRight className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />{r}
            </li>
          ))}
        </ul>
      )}
      {result.ocr && (
        <div className="grid grid-cols-2 gap-2 text-sm">
          {result.ocr.phone && (
            <div className="bg-gray-700/50 rounded-lg px-3 py-2">
              <p className="text-gray-400 text-xs">Phone</p>
              <p className="text-white font-mono">{result.ocr.phone}</p>
            </div>
          )}
          {result.ocr.amount && (
            <div className="bg-gray-700/50 rounded-lg px-3 py-2">
              <p className="text-gray-400 text-xs">Amount</p>
              <p className="text-white font-mono">KES {result.ocr.amount}</p>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

// ================================================================
//  SUB-SCREENS
// ================================================================
function MessageScreen() {
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handle = async () => {
    if (!msg.trim()) return;
    setLoading(true); setError(""); setResult(null);
    try { setResult(await checkMessage(msg.trim())); }
    catch (err) { setError(err.message); }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <MessageSquare className="w-5 h-5 text-cyan-400" />
        <h2 className="text-white font-bold">Check Message</h2>
      </div>
      <p className="text-gray-400 text-sm">Paste any suspicious M-Pesa message to check if it's a scam.</p>
      <textarea value={msg} onChange={e => setMsg(e.target.value)} rows={5}
        placeholder="e.g. Please reverse KES 500 sent by mistake..."
        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm resize-none focus:outline-none focus:border-cyan-400 transition-colors placeholder:text-gray-500" />
      <button onClick={handle} disabled={loading || !msg.trim()}
        className="w-full py-3 bg-gradient-to-r from-purple-500 to-cyan-400 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all">
        {loading ? <><Loader2 className="w-5 h-5 animate-spin" />Analysing...</> : <><Shield className="w-5 h-5" />Analyse Message</>}
      </button>
      {error && <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">{error}</div>}
      <ResultCard result={result} />
    </div>
  );
}

function ScanScreen() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const ref = useRef(null);

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f); setResult(null); setError("");
    setPreview(URL.createObjectURL(f));
  };

  const handle = async () => {
    if (!file) return;
    setLoading(true); setError(""); setResult(null);
    try {
      const res = await uploadScreenshot(file);
      setResult(res.fraud ? { ...res.fraud, ocr: res.ocr } : res);
    } catch (err) { setError(err.message); }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <Search className="w-5 h-5 text-cyan-400" />
        <h2 className="text-white font-bold">Screenshot Scan</h2>
      </div>
      <p className="text-gray-400 text-sm">Upload an M-Pesa screenshot — AI will read and analyse it for fraud.</p>
      <div onClick={() => ref.current?.click()}
        className="border-2 border-dashed border-gray-600 hover:border-cyan-400 rounded-xl p-8 text-center cursor-pointer transition-colors">
        {preview
          ? <img src={preview} alt="preview" className="max-h-48 mx-auto rounded-lg object-contain" />
          : <div className="space-y-2">
              <Upload className="w-8 h-8 text-cyan-400 mx-auto" />
              <p className="text-gray-300 font-medium">Tap to upload screenshot</p>
              <p className="text-gray-500 text-sm">PNG, JPG, WEBP</p>
            </div>
        }
      </div>
      <input ref={ref} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleFile} />
      <button onClick={handle} disabled={loading || !file}
        className="w-full py-3 bg-gradient-to-r from-purple-500 to-cyan-400 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all">
        {loading ? <><Loader2 className="w-5 h-5 animate-spin" />Scanning...</> : <><Search className="w-5 h-5" />Scan with AI</>}
      </button>
      {error && <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">{error}</div>}
      <ResultCard result={result} />
    </div>
  );
}

function ReceiveScreen() {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handle = async () => {
    if (!phone.trim()) return;
    setLoading(true); setError(""); setResult(null);
    try {
      const res = await apiFetch("/wallet/receive/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim() }),
      });
      setResult(res);
    } catch (err) { setError(err.message); }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <ArrowDownLeft className="w-5 h-5 text-cyan-400" />
        <h2 className="text-white font-bold">Check Incoming Money</h2>
      </div>
      <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
        <p className="text-blue-300 text-sm">Someone wants to send you money or is asking you to receive on their behalf — check their number first.</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Sender's Phone</label>
        <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
          placeholder="0712 345 678"
          className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-400 transition-colors placeholder:text-gray-500" />
      </div>
      <button onClick={handle} disabled={loading || !phone.trim()}
        className="w-full py-3 bg-gradient-to-r from-purple-500 to-cyan-400 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all">
        {loading ? <><Loader2 className="w-5 h-5 animate-spin" />Checking...</> : <><Shield className="w-5 h-5" />Check Sender</>}
      </button>
      {error && <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">{error}</div>}
      {result && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className={`border rounded-xl p-4 space-y-3 ${result.safe ? "border-green-500/30 bg-green-500/5" : "border-red-500/30 bg-red-500/5"}`}>
          <div className="flex items-center gap-3">
            {result.safe ? <CheckCircle className="w-6 h-6 text-green-400" /> : <AlertTriangle className="w-6 h-6 text-red-400" />}
            <span className={`font-bold ${result.safe ? "text-green-400" : "text-red-400"}`}>
              {result.safe ? "Sender looks safe" : "Warning — be careful"}
            </span>
          </div>
          {result.reputation && (
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                { label: "Reports", value: result.reputation.scam_report_count },
                { label: "Reporters", value: result.reputation.unique_reporters },
                { label: "Sender", value: result.reputation.first_time ? "NEW" : "KNOWN",
                  color: result.reputation.first_time ? "text-yellow-400" : "text-green-400" },
              ].map((s, i) => (
                <div key={i} className="bg-gray-800/60 rounded-lg p-2">
                  <p className={`text-lg font-bold ${s.color || "text-white"}`}>{s.value}</p>
                  <p className="text-xs text-gray-400">{s.label}</p>
                </div>
              ))}
            </div>
          )}
          {result.advice?.map((a, i) => (
            <p key={i} className="text-sm text-gray-300 flex items-start gap-2">
              <ChevronRight className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />{a}
            </p>
          ))}
        </motion.div>
      )}
    </div>
  );
}

function HistoryScreen() {
  const [txs, setTxs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const res = await apiFetch(`/wallet/transactions?filter=${filter}&limit=50`);
      setTxs(res.transactions || []);
    } catch { setTxs(SIMULATED_RECENT); }
    setLoading(false);
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  if (selected) {
    const tx = txs.find(t => t.id === selected) || SIMULATED_RECENT.find(t => t.id === selected);
    return (
      <div className="space-y-4">
        <button onClick={() => setSelected(null)} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        {tx && (
          <div className="space-y-4">
            <div className={`border rounded-xl p-5 space-y-3 ${(VERDICT[tx.verdict] || VERDICT.safe).border} bg-gray-800/40`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-white font-bold text-2xl">KES {Math.abs(tx.amount || 0).toLocaleString()}</p>
                  <p className="text-gray-400 text-sm mt-0.5">{tx.phone_number || tx.phone}</p>
                </div>
                <VerdictBadge verdict={tx.verdict} />
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {[
                  { label: "Status", value: tx.status },
                  { label: "Date", value: tx.time || new Date(tx.created_at).toLocaleString() },
                  { label: "Reference", value: tx.reference || "—" },
                  { label: "Direction", value: tx.amount < 0 ? "Sent" : "Received" },
                ].map((s, i) => (
                  <div key={i} className="bg-gray-700/40 rounded-lg px-3 py-2">
                    <p className="text-gray-400 text-xs">{s.label}</p>
                    <p className="text-white text-xs mt-0.5 capitalize">{s.value}</p>
                  </div>
                ))}
              </div>
              {tx.flags?.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-gray-400 uppercase tracking-wider">Fraud Flags</p>
                  {tx.flags.map((f, i) => (
                    <div key={i} className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                      <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-gray-300">{f.reason || f}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <History className="w-5 h-5 text-cyan-400" />
        <h2 className="text-white font-bold">Transaction History</h2>
      </div>
      <div className="flex gap-1 bg-gray-800/60 p-1 rounded-lg">
        {["all", "fraud", "suspicious", "safe"].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`flex-1 py-1.5 rounded-md text-xs font-semibold capitalize transition-colors ${filter === f ? "bg-gray-600 text-white" : "text-gray-400 hover:text-white"}`}>
            {f}
          </button>
        ))}
      </div>
      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="w-8 h-8 text-cyan-400 animate-spin" /></div>
      ) : (
        <div className="space-y-2">
          {(txs.length > 0 ? txs : SIMULATED_RECENT).map((tx, i) => {
            const v = VERDICT[tx.verdict] || VERDICT.safe;
            const Icon = v.icon;
            const amt = tx.amount || 0;
            return (
              <button key={tx.id} onClick={() => setSelected(tx.id)}
                className="w-full flex items-center gap-3 bg-gray-800/50 hover:bg-gray-700/50 border border-white/5 rounded-xl px-4 py-3 transition-colors text-left">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${v.bg}`}>
                  <Icon className={`w-4 h-4 ${v.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{tx.name || tx.phone_number}</p>
                  <p className="text-gray-400 text-xs">{tx.time || new Date(tx.created_at).toLocaleDateString()}</p>
                </div>
                <div className="text-right flex-shrink-0 space-y-0.5">
                  <p className={`font-bold text-sm ${amt < 0 ? "text-red-400" : "text-green-400"}`}>
                    {amt < 0 ? "-" : "+"}KES {Math.abs(amt).toLocaleString()}
                  </p>
                  <VerdictBadge verdict={tx.verdict} />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ================================================================
//  MAIN DASHBOARD
// ================================================================
export default function Dashboard({ user, onLogout, onProfileUpdate }) {
  const [screen,  setScreen]  = useState(null);
  const [balance, setBalance] = useState(getSimBalance);
  const navigate = useNavigate();

  const deductBalance = (amount) => {
    setBalance(prev => {
      const next = Math.max(0, prev - amount);
      setSimBalance(next);
      return next;
    });
  };

  const refreshBalance = () => {
    setBalance(getSimBalance());
  };

  const handleLogout = async () => {
    try { await logoutUser(); } catch {}
    onLogout();
    navigate("/");
  };

  const handleProfileUpdate = (updated) => {
    onProfileUpdate(updated);
  };

  const screenMap = {
    check:   <MessageScreen />,
    scan:    <ScanScreen />,
    send:    <PaymentTab onPaymentSuccess={(amount) => { deductBalance(amount); setScreen(null); }} />,
    receive: <ReceiveScreen />,
    history: <HistoryScreen />,
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Unified top nav — always visible */}
      <div className="fixed top-0 left-0 right-0 bg-gray-900/95 backdrop-blur-md border-b border-white/10 z-40">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          {/* Left side */}
          {screen ? (
            <button onClick={() => setScreen(null)} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span className="text-white font-semibold text-sm">
                {screen === "check" ? "Check Message" : screen === "scan" ? "Screenshot Scan" : screen === "send" ? "Send Payment" : screen === "receive" ? "Receive Check" : "History"}
              </span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-cyan-400" />
              <span className="text-base font-bold text-white" style={{ fontFamily: "Orbitron" }}>AFRATER</span>
            </div>
          )}

          {/* Right side — profile dropdown always visible */}
          <ProfileSection
            user={user}
            onLogout={handleLogout}
            onProfileUpdate={handleProfileUpdate}
          />
        </div>
      </div>

      <main className="pt-16 pb-6 px-4 max-w-lg mx-auto">
        <AnimatePresence mode="wait">
          {!screen ? (
            <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="space-y-5 pt-4">

              {/* Balance card */}
              <BalanceCard balance={balance} onRefresh={refreshBalance} />

              {/* Fraud alert banner */}
              <FraudAlertBanner />

              {/* Security score */}
              <SecurityStrip />

              {/* Quick actions */}
              <div>
                <h2 className="text-white font-bold text-sm mb-3">Quick Actions</h2>
                <QuickActions onAction={setScreen} />
              </div>

              {/* Recent transactions */}
              <RecentTransactions onViewAll={() => setScreen("history")} />

            </motion.div>
          ) : (
            <motion.div key={screen} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.18 }}
              className="pt-4">
              <div className="bg-gray-800/40 border border-white/10 rounded-2xl p-5">
                {screenMap[screen]}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}