// src/pages/Dashboard.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, MessageSquare, Image, CreditCard,
  AlertTriangle, CheckCircle, XCircle, LogOut,
  Upload, Loader2, ChevronRight
} from "lucide-react";
import "@fontsource/orbitron/700.css";
import Navbar from "../components/Navbar";
import {
  checkMessage,
  uploadScreenshot,
  initiatePayment,
  pollPaymentStatus,
  logoutUser,
} from "../api/api";

// ── Verdict badge ────────────────────────────────────────────────
function VerdictBadge({ verdict }) {
  const map = {
    fraud:      { color: "text-red-400 bg-red-500/10 border-red-500/30",      icon: XCircle,      label: "FRAUD DETECTED" },
    suspicious: { color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30", icon: AlertTriangle, label: "SUSPICIOUS" },
    safe:       { color: "text-green-400 bg-green-500/10 border-green-500/30",  icon: CheckCircle,  label: "SAFE" },
  };
  const v = map[verdict] || map.safe;
  const Icon = v.icon;
  return (
    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border font-bold text-sm ${v.color}`}>
      <Icon className="w-4 h-4" />
      {v.label}
    </div>
  );
}

// ── Score bar ────────────────────────────────────────────────────
function ScoreBar({ score }) {
  const color = score >= 60 ? "bg-red-500" : score >= 30 ? "bg-yellow-500" : "bg-green-500";
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-gray-400">
        <span>Fraud Risk Score</span>
        <span className="font-bold text-white">{score}/100</span>
      </div>
      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

// ── Result card ──────────────────────────────────────────────────
function ResultCard({ result }) {
  if (!result) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800/60 border border-white/10 rounded-xl p-5 space-y-4"
    >
      <div className="flex items-center justify-between flex-wrap gap-3">
        <VerdictBadge verdict={result.verdict} />
        {result.score !== undefined && <ScoreBar score={result.score} />}
      </div>

      {result.reasons && result.reasons.length > 0 && (
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Why flagged</p>
          <ul className="space-y-1.5">
            {result.reasons.map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                <ChevronRight className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                {r}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* OCR data from screenshot */}
      {result.ocr && (
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Extracted from image</p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {result.ocr.phone && (
              <div className="bg-gray-700/50 rounded-lg px-3 py-2">
                <span className="text-gray-400 text-xs">Phone</span>
                <p className="text-white font-mono">{result.ocr.phone}</p>
              </div>
            )}
            {result.ocr.amount && (
              <div className="bg-gray-700/50 rounded-lg px-3 py-2">
                <span className="text-gray-400 text-xs">Amount</span>
                <p className="text-white font-mono">KES {result.ocr.amount}</p>
              </div>
            )}
          </div>
          {result.ocr.message && (
            <div className="mt-2 bg-gray-700/50 rounded-lg px-3 py-2 text-sm text-gray-300 italic">
              "{result.ocr.message}"
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

// ================================================================
//  TAB 1 — Check Message
// ================================================================
function MessageTab() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleCheck = async () => {
    if (!message.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await checkMessage(message.trim());
      setResult(res);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Paste the suspicious message
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={5}
          placeholder="e.g. Dear customer, please reverse KES 500 sent by mistake to your account. Call 0712345678 immediately."
          className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm resize-none focus:outline-none focus:border-cyan-400 transition-colors placeholder:text-gray-500"
        />
      </div>

      <button
        onClick={handleCheck}
        disabled={loading || !message.trim()}
        className="w-full py-3 bg-gradient-to-r from-purple-500 to-cyan-400 hover:from-purple-600 hover:to-cyan-500 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2"
      >
        {loading ? (
          <><Loader2 className="w-5 h-5 animate-spin" /> Analysing...</>
        ) : (
          <><Shield className="w-5 h-5" /> Analyse Message</>
        )}
      </button>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      <ResultCard result={result} />
    </div>
  );
}

// ================================================================
//  TAB 2 — Screenshot Upload
// ================================================================
function ScreenshotTab() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const inputRef = React.useRef(null);

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setResult(null);
    setError("");
    setPreview(URL.createObjectURL(f));
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await uploadScreenshot(file);
      setResult(res.fraud);
      // merge OCR into result for display
      if (res.ocr) setResult({ ...res.fraud, ocr: res.ocr });
    } catch (err) {
      setError(err.message || "Upload failed.");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-5">
      <div
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-gray-600 hover:border-cyan-400 rounded-xl p-8 text-center cursor-pointer transition-colors group"
      >
        {preview ? (
          <img src={preview} alt="preview" className="max-h-48 mx-auto rounded-lg object-contain" />
        ) : (
          <div className="space-y-3">
            <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center mx-auto group-hover:bg-cyan-500/30 transition-colors">
              <Upload className="w-6 h-6 text-cyan-400" />
            </div>
            <p className="text-gray-300 font-medium">Drop your M-Pesa screenshot here</p>
            <p className="text-gray-500 text-sm">PNG, JPG, WEBP supported</p>
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />

      {file && (
        <div className="flex items-center justify-between bg-gray-800 rounded-lg px-4 py-3 text-sm">
          <span className="text-gray-300 truncate">{file.name}</span>
          <button onClick={() => { setFile(null); setPreview(null); setResult(null); }} className="text-gray-500 hover:text-red-400 ml-3 flex-shrink-0 transition-colors">
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={loading || !file}
        className="w-full py-3 bg-gradient-to-r from-purple-500 to-cyan-400 hover:from-purple-600 hover:to-cyan-500 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2"
      >
        {loading ? (
          <><Loader2 className="w-5 h-5 animate-spin" /> Scanning with AI...</>
        ) : (
          <><Image className="w-5 h-5" /> Scan Screenshot</>
        )}
      </button>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      <ResultCard result={result} />
    </div>
  );
}

// ================================================================
//  TAB 3 — Send Payment
// ================================================================
function PaymentTab() {
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [polling, setPolling] = useState(false);
  const [result, setResult] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [error, setError] = useState("");

  const handlePay = async () => {
    if (!phone.trim() || !amount) return;
    setLoading(true);
    setError("");
    setResult(null);
    setPaymentStatus(null);

    try {
      const res = await initiatePayment(phone.trim(), parseFloat(amount));

      if (res.blocked) {
        // Hard blocked by fraud engine
        setResult({
          verdict: "fraud",
          score: res.score,
          reasons: res.reasons,
        });
        setLoading(false);
        return;
      }

      // Not blocked — show fraud score + start polling
      setResult({
        verdict: res.verdict,
        score: res.score,
        reasons: res.reasons,
      });

      // Poll for STK push completion
      const checkoutId = res.stk_response?.CheckoutRequestID;
      if (checkoutId) {
        setPolling(true);
        let attempts = 0;
        const interval = setInterval(async () => {
          attempts++;
          try {
            const status = await pollPaymentStatus(checkoutId);
            if (status.status !== "pending") {
              clearInterval(interval);
              setPolling(false);
              setPaymentStatus(status.status);
            }
          } catch {}
          if (attempts >= 20) {
            clearInterval(interval);
            setPolling(false);
            setPaymentStatus("timed_out");
          }
        }, 3000);
      }
    } catch (err) {
      setError(err.message || "Payment failed.");
    }
    setLoading(false);
  };

  const STATUS_DISPLAY = {
    completed: { label: "Payment confirmed", color: "text-green-400", icon: CheckCircle },
    cancelled:  { label: "Cancelled by user", color: "text-yellow-400", icon: AlertTriangle },
    timed_out:  { label: "Request timed out", color: "text-gray-400", icon: XCircle },
    wrong_pin:  { label: "Wrong PIN entered", color: "text-red-400", icon: XCircle },
  };

  return (
    <div className="space-y-5">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="0712 345 678"
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-400 transition-colors placeholder:text-gray-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Amount (KES)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="500"
            min="1"
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-400 transition-colors placeholder:text-gray-500"
          />
        </div>
      </div>

      <div className="flex items-start gap-2 p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
        <Shield className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-cyan-300">
          AFRATER runs a fraud check before sending the STK push. High-risk payments are blocked automatically.
        </p>
      </div>

      <button
        onClick={handlePay}
        disabled={loading || !phone.trim() || !amount}
        className="w-full py-3 bg-gradient-to-r from-purple-500 to-cyan-400 hover:from-purple-600 hover:to-cyan-500 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2"
      >
        {loading ? (
          <><Loader2 className="w-5 h-5 animate-spin" /> Checking & Sending...</>
        ) : (
          <><CreditCard className="w-5 h-5" /> Send Payment</>
        )}
      </button>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      <ResultCard result={result} />

      {/* STK push polling status */}
      {polling && (
        <div className="flex items-center gap-3 p-4 bg-gray-800 rounded-xl border border-white/10">
          <Loader2 className="w-5 h-5 text-cyan-400 animate-spin flex-shrink-0" />
          <div>
            <p className="text-white text-sm font-medium">Waiting for confirmation</p>
            <p className="text-gray-400 text-xs">Check your phone and enter your M-Pesa PIN</p>
          </div>
        </div>
      )}

      {paymentStatus && STATUS_DISPLAY[paymentStatus] && (() => {
        const s = STATUS_DISPLAY[paymentStatus];
        const Icon = s.icon;
        return (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 p-4 bg-gray-800 rounded-xl border border-white/10"
          >
            <Icon className={`w-5 h-5 flex-shrink-0 ${s.color}`} />
            <p className={`text-sm font-medium ${s.color}`}>{s.label}</p>
          </motion.div>
        );
      })()}
    </div>
  );
}

// ================================================================
//  DASHBOARD PAGE
// ================================================================
const TABS = [
  { id: "message",    label: "Check Message",   icon: MessageSquare },
  { id: "screenshot", label: "Screenshot Scan",  icon: Image },
  { id: "payment",    label: "Send Payment",     icon: CreditCard },
];

export default function Dashboard({ user, onLogout, onProfileUpdate }) {
  const [activeTab, setActiveTab] = useState("message");
  const navigate = useNavigate();

  const handleLogout = async () => {
    try { await logoutUser(); } catch {}
    onLogout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar
        user={user}
        onLogout={handleLogout}
        onProfileUpdate={onProfileUpdate}
      />

      <main className="pt-24 pb-16 px-4 max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold" style={{ fontFamily: "Orbitron" }}>
            Fraud Terminal
          </h1>
          <p className="text-gray-400 mt-1 text-sm">
            Welcome back, {user?.name?.split(" ")[0]}. Run checks below.
          </p>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 bg-gray-800/60 p-1 rounded-xl mb-6 border border-white/10">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all ${
                  active
                    ? "bg-gradient-to-r from-purple-500 to-cyan-400 text-white shadow"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <div className="bg-gray-800/40 border border-white/10 rounded-2xl p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.18 }}
            >
              {activeTab === "message"    && <MessageTab />}
              {activeTab === "screenshot" && <ScreenshotTab />}
              {activeTab === "payment"    && <PaymentTab />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}