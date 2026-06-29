// src/pages/Landing.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Database, AlertTriangle, CheckCircle, ArrowRight,
  Eye, Search, Bell, Zap, Shield, Loader2, ChevronRight
} from "lucide-react";
import "@fontsource/orbitron/700.css";
import AuthModal from "../components/AuthModal";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { checkMessage } from "../api/api";

const STATS = [
  { value: "10K+", label: "Messages Analyzed" },
  { value: "98%",  label: "Detection Accuracy" },
  { value: "<1s",  label: "Response Time" },
  { value: "500+", label: "Scams Blocked Daily" },
];

const CAPABILITIES = [
  { icon: Eye,      title: "Complete Visibility",   desc: "Real-time monitoring of all M-Pesa messages and transaction patterns across your network." },
  { icon: Search,   title: "Deep Analysis",          desc: "AI-powered pattern recognition that uncovers social engineering tactics others miss." },
  { icon: Bell,     title: "Instant Alerts",         desc: "Immediate notifications when suspicious activity is detected, stopping fraud before it happens." },
  { icon: Database, title: "Community Intelligence", desc: "Crowdsourced fraud database updated in real-time with the latest scam patterns." },
];

const USE_CASES = [
  { title: "For Individuals", points: ["Protect personal M-Pesa accounts", "Verify suspicious messages instantly", "Get alerts before sharing sensitive codes"] },
  { title: "For Businesses",  points: ["Safeguard employee transactions", "Monitor business account activity", "Reduce financial fraud losses"] },
  { title: "For Agents",      points: ["Build customer trust", "Identify fraudulent transactions", "Protect your float from scams"] },
];

const VERDICT_STYLE = {
  fraud:      { bg: "bg-red-500/10 border-red-500/30",       text: "text-red-400",    icon: AlertTriangle, label: "FRAUD DETECTED" },
  suspicious: { bg: "bg-yellow-500/10 border-yellow-500/30", text: "text-yellow-400", icon: AlertTriangle, label: "SUSPICIOUS" },
  safe:       { bg: "bg-green-500/10 border-green-500/30",   text: "text-green-400",  icon: CheckCircle,   label: "SAFE" },
};

// Smooth scroll helper — works with React Router (no full reload)
function scrollTo(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function Landing({ onAuthSuccess, onLogout, onProfileUpdate, user: userProp }) {
  const navigate = useNavigate();
  const [authOpen, setAuthOpen] = useState(false);

  const [user, setUser] = useState(() => {
    if (userProp) return userProp;
    try {
      const saved = localStorage.getItem("user");
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  // Demo state
  const [demoMessage, setDemoMessage] = useState("");
  const [demoLoading, setDemoLoading] = useState(false);
  const [demoResult, setDemoResult]   = useState(null);
  const [demoError, setDemoError]     = useState("");

  const handleAuthSuccess = (userData) => {
    const u = userData.user || userData;
    setUser(u);
    localStorage.setItem("user", JSON.stringify(u));
    setAuthOpen(false);
    if (onAuthSuccess) onAuthSuccess(u);
    navigate("/dashboard");
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    if (onLogout) onLogout();
  };

  const handleProfileUpdate = (updated) => {
    setUser((prev) => {
      const newUser = { ...prev, ...updated };
      localStorage.setItem("user", JSON.stringify(newUser));
      if (onProfileUpdate) onProfileUpdate(newUser);
      return newUser;
    });
  };

  const handleDemoAnalyse = async () => {
    if (!demoMessage.trim()) return;
    if (!user) { setAuthOpen(true); return; }
    setDemoLoading(true);
    setDemoError("");
    setDemoResult(null);
    try {
      const res = await checkMessage(demoMessage.trim());
      setDemoResult(res);
    } catch (err) {
      setDemoError(err.message || "Something went wrong.");
    }
    setDemoLoading(false);
  };

  return (
    <div className="bg-gray-900 text-white">
      <Navbar
        user={user}
        onLoginClick={() => setAuthOpen(true)}
        onLogout={handleLogout}
        onProfileUpdate={handleProfileUpdate}
      />

      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#0b1220] to-[#071126]">
        <div className="absolute top-0 left-0 w-72 h-72 bg-purple-500 rounded-full opacity-20 blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-cyan-400 rounded-full opacity-20 blur-3xl animate-pulse delay-2000" />
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="space-y-6 z-10 relative">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 border border-white/20 rounded-full text-sm font-medium">
              <Zap className="w-4 h-4" /> MVP Launch
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold leading-tight" style={{ fontFamily: "Orbitron" }}>
              SEE WHAT OTHERS MISS.<br />
              <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Secure what others can't.
              </span>
            </h1>
            <p className="text-gray-300 text-xl leading-relaxed">
              AFRATER delivers real-time M-Pesa fraud detection, uncovering social engineering scams before they can harm you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              {/* ✅ onClick scroll — no href="#" */}
              <button
                onClick={() => scrollTo("demo")}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-cyan-400 text-white rounded-xl font-bold shadow-lg hover:scale-[1.02] transition-transform"
              >
                Try Live Demo <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => scrollTo("platform")}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-white/30 text-white rounded-xl font-semibold hover:bg-white/10 transition"
              >
                Learn More
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8 border-t border-white/20">
              {STATS.map((stat, i) => (
                <div key={i}>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-sm text-gray-300">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.2 }} className="relative z-10">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 shadow-2xl">
              <div className="space-y-4">
                <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                  <div className="w-10 h-10 bg-cyan-500 rounded-lg flex items-center justify-center">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold">Fraud Detection</div>
                    <div className="text-sm text-gray-300">Real-time analysis</div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="p-4 bg-red-50/10 border border-red-400/20 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-medium text-red-300">Scam Detected</div>
                        <div className="text-sm text-red-200 mt-1">Social engineering pattern identified</div>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-green-50/10 border border-green-400/20 rounded-lg">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-medium text-green-300">Transaction Safe</div>
                        <div className="text-sm text-green-200 mt-1">No suspicious patterns found</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-4 -right-4 bg-gradient-to-r from-purple-400 to-cyan-400 text-white px-4 py-2 rounded-lg shadow-lg font-semibold text-sm"
            >
              98% Accuracy
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Platform ───────────────────────────────────────────── */}
      <section id="platform" className="py-20 px-6 bg-gray-900">
        <div className="max-w-7xl mx-auto text-center mb-16">
          <motion.h2 initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="text-4xl md:text-5xl font-bold mb-4" style={{fontFamily:"Orbitron"}}>
            Complete Fraud Protection for M-Pesa
          </motion.h2>
          <motion.p initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:0.1}} className="text-xl text-gray-300 max-w-3xl mx-auto">
            AFRATER combines AI-powered detection, community intelligence, and real-time monitoring to protect users from social engineering scams.
          </motion.p>
        </div>
        <div className="grid md:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {CAPABILITIES.map((cap, i) => (
            <motion.div key={i} initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*0.1}} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 hover:shadow-2xl hover:scale-[1.02] transition-transform">
              <div className="w-12 h-12 bg-cyan-500 rounded-lg flex items-center justify-center mb-4">
                <cap.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">{cap.title}</h3>
              <p className="text-gray-300">{cap.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────── */}
      <section id="features" className="py-20 px-6 bg-gray-900">
        <div className="max-w-7xl mx-auto text-center mb-16">
          <motion.h2 initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="text-4xl md:text-5xl font-bold mb-4" style={{fontFamily:"Orbitron"}}>
            Protection for Everyone
          </motion.h2>
          <motion.p initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:0.1}} className="text-xl text-gray-300">
            AFRATER adapts to your specific needs
          </motion.p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {USE_CASES.map((uc, i) => (
            <motion.div key={i} initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*0.1}} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 hover:shadow-2xl transition-transform">
              <h3 className="text-xl font-bold mb-4">{uc.title}</h3>
              <ul className="space-y-3">
                {uc.points.map((p, j) => (
                  <li key={j} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">{p}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Demo ───────────────────────────────────────────────── */}
      <section id="demo" className="py-20 px-6 bg-gray-900">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <motion.h2 initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="text-4xl md:text-5xl font-bold mb-4" style={{fontFamily:"Orbitron"}}>
            Try the Demo
          </motion.h2>
          <motion.p initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:0.1}} className="text-xl text-gray-300">
            Paste a suspicious M-Pesa message and see AFRATER in action.
            {!user && <span className="text-cyan-400"> Login to analyse.</span>}
          </motion.p>
        </div>

        <div className="max-w-2xl mx-auto space-y-4">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
            <textarea
              value={demoMessage}
              onChange={(e) => setDemoMessage(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white text-sm resize-none focus:outline-none focus:border-cyan-400 transition-colors placeholder:text-gray-500"
              rows={4}
              placeholder="e.g. Dear customer, please reverse KES 500 sent by mistake. Call 0712345678 urgently."
            />
            <button
              onClick={handleDemoAnalyse}
              disabled={demoLoading || !demoMessage.trim()}
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-cyan-400 hover:from-purple-600 hover:to-cyan-500 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed rounded-lg font-bold text-white transition-all flex items-center justify-center gap-2"
            >
              {demoLoading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Analysing...</>
              ) : !user ? (
                <><Shield className="w-5 h-5" /> Login to Analyse</>
              ) : (
                <><Shield className="w-5 h-5" /> Analyse Message</>
              )}
            </button>
          </div>

          {demoError && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {demoError}
            </div>
          )}

          {demoResult && (() => {
            const v = VERDICT_STYLE[demoResult.verdict] || VERDICT_STYLE.safe;
            const Icon = v.icon;
            return (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-white/5 border rounded-2xl p-6 space-y-4 ${v.bg}`}
              >
                <div className="flex items-center gap-3 flex-wrap">
                  <Icon className={`w-6 h-6 ${v.text}`} />
                  <span className={`font-bold text-lg ${v.text}`}>{v.label}</span>
                  {demoResult.score !== undefined && (
                    <span className="ml-auto text-sm text-gray-400">
                      Score: <span className="text-white font-bold">{demoResult.score}/100</span>
                    </span>
                  )}
                </div>
                {demoResult.reasons?.length > 0 && (
                  <ul className="space-y-1.5">
                    {demoResult.reasons.map((r, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                        <ChevronRight className={`w-4 h-4 flex-shrink-0 mt-0.5 ${v.text}`} />
                        {r}
                      </li>
                    ))}
                  </ul>
                )}
                <button
                  onClick={() => navigate("/dashboard")}
                  className="w-full py-2.5 border border-white/20 rounded-lg text-sm text-gray-300 hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                >
                  Open full dashboard <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })()}
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-gradient-to-br from-purple-500 to-cyan-400 text-white">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <motion.h2 initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="text-4xl md:text-5xl font-bold" style={{fontFamily:"Orbitron"}}>
            Ready to Stop Fraud?
          </motion.h2>
          <motion.p initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:0.1}} className="text-xl text-white/90">
            Join thousands protecting their M-Pesa transactions with AFRATER
          </motion.p>
          <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:0.2}}>
            <button
              onClick={() => setAuthOpen(true)}
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-purple-600 rounded-xl font-bold text-lg hover:bg-gray-50 transition-shadow shadow-xl"
            >
              Get Started Free <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        </div>
      </section>

      <Footer />

      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
}