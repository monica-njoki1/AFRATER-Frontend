// src/components/PaymentTab.jsx
// Drop-in replacement for the PaymentTab inside Dashboard.jsx

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, CreditCard, AlertTriangle, CheckCircle,
  XCircle, Loader2, ChevronRight, Flag, ArrowLeft
} from "lucide-react";
import { initiatePayment, pollPaymentStatus } from "../api/api";

const BASE_URL = "https://afrater-backend.onrender.com";
const getToken = () => localStorage.getItem("token");

async function preflightCheck(phone, amount) {
  const res = await fetch(`${BASE_URL}/mpesa/preflight`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ phone, amount }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Preflight failed");
  return data;
}

async function reportNumber(phone, message) {
  const res = await fetch(`${BASE_URL}/mpesa/report`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ phone, message }),
  });
  return res.json();
}

// ── Risk badge ───────────────────────────────────────────────────
function RiskBadge({ level }) {
  const map = {
    high:   "bg-red-500/20 text-red-400 border-red-500/30",
    medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    low:    "bg-green-500/20 text-green-400 border-green-500/30",
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${map[level] || map.low}`}>
      {level} risk
    </span>
  );
}

// ── Warning screen shown before payment ─────────────────────────
function WarningScreen({ preflight, phone, amount, onProceed, onCancel, onReport }) {
  const [reporting, setReporting] = useState(false);
  const [reported, setReported]   = useState(false);

  const isHardBlock = preflight.blocked || preflight.reputation?.is_blacklisted;

  const handleReport = async () => {
    setReporting(true);
    await reportNumber(phone, "User flagged before sending payment");
    setReporting(false);
    setReported(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-5"
    >
      {/* Header */}
      <div className={`rounded-xl p-5 border ${
        isHardBlock
          ? "bg-red-500/10 border-red-500/30"
          : "bg-yellow-500/10 border-yellow-500/30"
      }`}>
        <div className="flex items-center gap-3 mb-3">
          {isHardBlock
            ? <XCircle className="w-7 h-7 text-red-400 flex-shrink-0" />
            : <AlertTriangle className="w-7 h-7 text-yellow-400 flex-shrink-0" />
          }
          <div>
            <p className={`font-bold text-lg ${isHardBlock ? "text-red-400" : "text-yellow-400"}`}>
              {isHardBlock ? "Payment Blocked" : "Warning — Proceed with Caution"}
            </p>
            <p className="text-gray-400 text-sm">
              Sending KES {amount} to {phone}
            </p>
          </div>
          <div className="ml-auto">
            <RiskBadge level={preflight.risk_level} />
          </div>
        </div>

        {/* Fraud score bar */}
        {preflight.score !== undefined && (
          <div className="space-y-1 mt-3">
            <div className="flex justify-between text-xs text-gray-400">
              <span>Fraud Risk Score</span>
              <span className="font-bold text-white">{preflight.score}/100</span>
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${
                  preflight.score >= 60 ? "bg-red-500" :
                  preflight.score >= 30 ? "bg-yellow-500" : "bg-green-500"
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${preflight.score}%` }}
                transition={{ duration: 0.8 }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Warnings list */}
      {preflight.warnings?.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-gray-400 uppercase tracking-wider">Why we flagged this</p>
          {preflight.warnings.map((w, i) => (
            <div key={i} className="flex items-start gap-2 bg-gray-800/60 rounded-lg px-3 py-2.5">
              <ChevronRight className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-gray-300">{w}</p>
            </div>
          ))}
        </div>
      )}

      {/* Reputation details */}
      {preflight.reputation && (
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-gray-800/60 rounded-lg p-3 text-center">
            <p className="text-xl font-bold text-white">{preflight.reputation.scam_report_count}</p>
            <p className="text-xs text-gray-400 mt-0.5">Scam Reports</p>
          </div>
          <div className="bg-gray-800/60 rounded-lg p-3 text-center">
            <p className="text-xl font-bold text-white">{preflight.reputation.unique_reporters}</p>
            <p className="text-xs text-gray-400 mt-0.5">Reporters</p>
          </div>
          <div className="bg-gray-800/60 rounded-lg p-3 text-center">
            <p className={`text-xl font-bold ${preflight.reputation.first_time ? "text-yellow-400" : "text-green-400"}`}>
              {preflight.reputation.first_time ? "NEW" : "KNOWN"}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">Recipient</p>
          </div>
        </div>
      )}

      {/* Advice */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
        <p className="text-sm text-blue-300 font-medium mb-1">💡 AFRATER Advice</p>
        {isHardBlock ? (
          <p className="text-sm text-gray-300">
            This number has been blacklisted by our community. Do not send money. If someone is pressuring you to pay, hang up and call a trusted person.
          </p>
        ) : (
          <p className="text-sm text-gray-300">
            Be extra careful. Scammers often create urgency — "send now or lose the deal." Take your time, verify the recipient in person or via a known contact before sending.
          </p>
        )}
      </div>

      {/* Report button */}
      {!reported ? (
        <button
          onClick={handleReport}
          disabled={reporting}
          className="w-full flex items-center justify-center gap-2 py-2.5 border border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-lg text-sm transition-colors"
        >
          <Flag className="w-4 h-4" />
          {reporting ? "Reporting..." : "Report this number to the community"}
        </button>
      ) : (
        <div className="flex items-center gap-2 justify-center py-2 text-green-400 text-sm">
          <CheckCircle className="w-4 h-4" />
          Reported — thank you for protecting others
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3 pt-1">
        <button
          onClick={onCancel}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl text-sm font-semibold text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Cancel
        </button>

        {!isHardBlock && (
          <button
            onClick={onProceed}
            className="flex-1 py-3 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/40 rounded-xl text-sm font-semibold text-yellow-300 transition-colors"
          >
            I understand — proceed anyway
          </button>
        )}
      </div>
    </motion.div>
  );
}

// ── Payment status after STK push ───────────────────────────────
function PaymentStatus({ status, onDone }) {
  const STATUS_DISPLAY = {
    completed: { label: "Payment confirmed ✓",    color: "text-green-400", icon: CheckCircle },
    cancelled:  { label: "Cancelled by user",      color: "text-yellow-400", icon: AlertTriangle },
    timed_out:  { label: "Request timed out",       color: "text-gray-400",   icon: XCircle },
    wrong_pin:  { label: "Wrong PIN — not sent",    color: "text-red-400",    icon: XCircle },
  };
  const s = STATUS_DISPLAY[status];
  if (!s) return null;
  const Icon = s.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-3 p-4 bg-gray-800 rounded-xl border border-white/10">
        <Icon className={`w-6 h-6 flex-shrink-0 ${s.color}`} />
        <p className={`font-semibold ${s.color}`}>{s.label}</p>
      </div>
      <button onClick={onDone} className="w-full py-3 bg-gray-700 hover:bg-gray-600 rounded-xl text-sm text-white transition-colors">
        Make another payment
      </button>
    </motion.div>
  );
}

// ================================================================
//  MAIN PAYMENT TAB
// ================================================================
export default function PaymentTab() {
  const [phone,  setPhone]  = useState("");
  const [amount, setAmount] = useState("");

  // Stages: "form" | "checking" | "warning" | "sending" | "polling" | "done"
  const [stage,       setStage]       = useState("form");
  const [preflight,   setPreflight]   = useState(null);
  const [payStatus,   setPayStatus]   = useState(null);
  const [error,       setError]       = useState("");

  const reset = () => {
    setPhone(""); setAmount(""); setStage("form");
    setPreflight(null); setPayStatus(null); setError("");
  };

  // Step 1 — run pre-flight check when user clicks "Check & Send"
  const handleCheck = async () => {
    if (!phone.trim() || !amount) return;
    setStage("checking");
    setError("");
    try {
      const result = await preflightCheck(phone.trim(), parseFloat(amount));
      setPreflight(result);

      // If completely safe — skip warning screen and send directly
      if (result.safe && !result.should_block && !result.requires_override) {
        await sendPayment(false, result);
      } else {
        setStage("warning");
      }
    } catch (err) {
      setError(err.message || "Check failed.");
      setStage("form");
    }
  };

  // Step 2 — send STK push (with or without override)
  const sendPayment = async (override = false, preflightData = preflight) => {
    setStage("sending");
    setError("");
    try {
      const res = await fetch(`${BASE_URL}/mpesa/pay`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          phone: phone.trim(),
          amount: parseFloat(amount),
          override,
        }),
      });
      const data = await res.json();

      if (!res.ok && res.status === 403) {
        // Hard blocked
        setPreflight({ ...preflightData, ...data, blocked: true });
        setStage("warning");
        return;
      }

      if (!res.ok) throw new Error(data.error || "Payment failed");

      // Poll for STK result
      const checkoutId = data.stk_response?.CheckoutRequestID;
      if (checkoutId) {
        setStage("polling");
        let attempts = 0;
        const interval = setInterval(async () => {
          attempts++;
          try {
            const status = await pollPaymentStatus(checkoutId);
            if (status.status !== "pending") {
              clearInterval(interval);
              setPayStatus(status.status);
              setStage("done");
            }
          } catch {}
          if (attempts >= 20) {
            clearInterval(interval);
            setPayStatus("timed_out");
            setStage("done");
          }
        }, 3000);
      } else {
        setStage("done");
        setPayStatus("completed");
      }
    } catch (err) {
      setError(err.message || "Payment failed.");
      setStage("form");
    }
  };

  return (
    <div className="space-y-5">
      <AnimatePresence mode="wait">

        {/* ── Form ── */}
        {(stage === "form" || stage === "checking") && (
          <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
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
                AFRATER checks the recipient's reputation and fraud history before sending. High-risk payments are flagged automatically.
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">{error}</div>
            )}

            <button
              onClick={handleCheck}
              disabled={stage === "checking" || !phone.trim() || !amount}
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-cyan-400 hover:from-purple-600 hover:to-cyan-500 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2"
            >
              {stage === "checking" ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Checking recipient...</>
              ) : (
                <><CreditCard className="w-5 h-5" /> Check & Send</>
              )}
            </button>
          </motion.div>
        )}

        {/* ── Warning screen ── */}
        {stage === "warning" && preflight && (
          <motion.div key="warning" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <WarningScreen
              preflight={preflight}
              phone={phone}
              amount={amount}
              onProceed={() => sendPayment(true)}
              onCancel={reset}
              onReport={() => {}}
            />
          </motion.div>
        )}

        {/* ── Sending ── */}
        {stage === "sending" && (
          <motion.div key="sending" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
            <p className="text-white font-medium">Sending STK push...</p>
            <p className="text-gray-400 text-sm">Check your phone</p>
          </motion.div>
        )}

        {/* ── Polling ── */}
        {stage === "polling" && (
          <motion.div key="polling" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="space-y-4">
            <div className="flex items-center gap-3 p-5 bg-gray-800 rounded-xl border border-white/10">
              <Loader2 className="w-6 h-6 text-cyan-400 animate-spin flex-shrink-0" />
              <div>
                <p className="text-white font-semibold">Waiting for confirmation</p>
                <p className="text-gray-400 text-sm mt-0.5">Enter your M-Pesa PIN on your phone to complete</p>
              </div>
            </div>
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
              <p className="text-yellow-300 text-sm font-medium">⚠️ Important</p>
              <p className="text-gray-300 text-sm mt-1">
                Only enter your PIN if YOU initiated this payment. If someone called you and asked you to enter a code — cancel immediately and call them back on a known number.
              </p>
            </div>
          </motion.div>
        )}

        {/* ── Done ── */}
        {stage === "done" && (
          <motion.div key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <PaymentStatus status={payStatus} onDone={reset} />
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}