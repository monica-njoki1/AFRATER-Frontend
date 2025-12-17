import React, { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Zap, Database, AlertTriangle, CheckCircle, ArrowRight, Eye, Search, Bell } from "lucide-react";
import "@fontsource/orbitron/700.css";
import AuthModal from "../components/AuthModal";

const STATS = [
  { value: "10K+", label: "Messages Analyzed" },
  { value: "98%", label: "Detection Accuracy" },
  { value: "<1s", label: "Response Time" },
  { value: "500+", label: "Scams Blocked Daily" },
];

const CAPABILITIES = [
  { icon: Eye, title: "Complete Visibility", desc: "Real-time monitoring of all M-Pesa messages and transaction patterns across your network." },
  { icon: Search, title: "Deep Analysis", desc: "AI-powered pattern recognition that uncovers social engineering tactics others miss." },
  { icon: Bell, title: "Instant Alerts", desc: "Immediate notifications when suspicious activity is detected, stopping fraud before it happens." },
  { icon: Database, title: "Community Intelligence", desc: "Crowdsourced fraud database updated in real-time with the latest scam patterns." },
];

const USE_CASES = [
  { title: "For Individuals", points: ["Protect personal M-Pesa accounts", "Verify suspicious messages instantly", "Get alerts before sharing sensitive codes"] },
  { title: "For Businesses", points: ["Safeguard employee transactions", "Monitor business account activity", "Reduce financial fraud losses"] },
  { title: "For Agents", points: ["Build customer trust", "Identify fraudulent transactions", "Protect your float from scams"] },
];

export default function Landing() {
  const [messageInput, setMessageInput] = useState("");
  const [checkResult, setCheckResult] = useState(null);
  const [checking, setChecking] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [user, setUser] = useState(null);

  const checkMessage = async () => {
    setChecking(true);
    setCheckResult(null);
    await new Promise(resolve => setTimeout(resolve, 1500));
    const isSuspicious = messageInput.toLowerCase().includes("code") || 
                         messageInput.toLowerCase().includes("refund") ||
                         messageInput.toLowerCase().includes("confirm") ||
                         messageInput.toLowerCase().includes("enter");
    setCheckResult(isSuspicious);
    setChecking(false);
  };

  const handleAuthSuccess = (userData) => {
    setUser(userData);
    console.log("User logged in:", userData);
    // Optional: redirect to dashboard
    // window.location.href = "/dashboard";
  };

  return (
    <div className="bg-gray-900 text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/5 backdrop-blur-sm border-b border-white/20 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-8 h-8 text-cyan-400" />
            <span className="text-2xl font-bold text-white" style={{ fontFamily: "Orbitron" }}>AFRATER</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a href="#platform" className="hover:text-cyan-400 transition-colors">Platform</a>
            <a href="#features" className="hover:text-cyan-400 transition-colors">Features</a>
            <a href="#demo" className="hover:text-cyan-400 transition-colors">Demo</a>
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-gray-300">Welcome, {user.name || user.email}</span>
                <button
                  onClick={() => {
                    setUser(null);
                    localStorage.removeItem("token");
                  }}
                  className="px-5 py-2 bg-gray-700 hover:bg-gray-600 rounded-md font-semibold text-white transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => setAuthOpen(true)}
                className="px-5 py-2 bg-gradient-to-r from-purple-500 to-cyan-400 rounded-md font-semibold text-white hover:scale-[1.02] transition-transform"
              >
                Get Started
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#0b1220] to-[#071126]">
        <div className="absolute top-0 left-0 w-72 h-72 bg-purple-500 rounded-full opacity-20 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-cyan-400 rounded-full opacity-20 blur-3xl animate-pulse delay-2000"></div>

        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6 z-10 relative"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 border border-white/20 rounded-full text-sm font-medium text-white">
              <Zap className="w-4 h-4" /> MVP Launch
            </div>

            <h1 className="text-7xl md:text-6xl font-extrabold leading-tight" style={{ fontFamily: "Orbitron" }}>
              SEE WHAT OTHERS MISS.<br />
              <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">Secure what others can't.</span>
            </h1>

            <p className="text-gray-300 text-xl leading-relaxed">
              AFRATER delivers real-time M-Pesa fraud detection, uncovering social engineering scams before they can harm you.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <a href="#demo" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-cyan-400 text-white rounded-xl font-bold shadow-lg hover:scale-[1.02] transition-transform">
                Try Live Demo <ArrowRight className="w-5 h-5" />
              </a>
              <a href="#platform" className="inline-flex items-center gap-2 px-6 py-3 border border-white/30 text-white rounded-xl font-semibold hover:bg-white/10 transition">
                Learn More
              </a>
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

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative z-10"
          >
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 shadow-2xl">
              <div className="space-y-4">
                <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                  <div className="w-10 h-10 bg-cyan-500 rounded-lg flex items-center justify-center">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">Fraud Detection</div>
                    <div className="text-sm text-gray-300">Real-time analysis</div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="p-4 bg-red-50/10 border border-red-400/20 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <div className="font-medium text-red-300">Scam Detected</div>
                        <div className="text-sm text-red-200 mt-1">Social engineering pattern identified</div>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-green-50/10 border border-green-400/20 rounded-lg">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
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

      {/* Platform / Capabilities */}
      <section id="platform" className="py-20 px-6 bg-gray-900">
        <div className="max-w-7xl mx-auto text-center mb-16">
          <motion.h2 initial={{opacity:0, y:20}} whileInView={{opacity:1, y:0}} viewport={{once:true}} className="text-4xl md:text-5xl font-bold mb-4"
          style={{ fontFamily: "Orbitron" }}>Complete Fraud Protection for M-Pesa</motion.h2>
          <motion.p initial={{opacity:0, y:20}} whileInView={{opacity:1, y:0}} viewport={{once:true}} transition={{delay:0.1}} className="text-xl text-gray-300 max-w-3xl mx-auto">
            AFRATER combines AI-powered detection, community intelligence, and real-time monitoring to protect users from social engineering scams.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {CAPABILITIES.map((cap,i) => (
            <motion.div key={i} initial={{opacity:0, y:20}} whileInView={{opacity:1, y:0}} viewport={{once:true}} transition={{delay:i*0.1}} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 hover:shadow-2xl hover:scale-[1.02] transition-transform">
              <div className="w-12 h-12 bg-cyan-500 rounded-lg flex items-center justify-center mb-4">
                <cap.icon className="w-6 h-6 text-white"/>
              </div>
              <h3 className="text-xl font-bold mb-2">{cap.title}</h3>
              <p className="text-gray-300">{cap.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 px-6 bg-gray-900">
        <div className="max-w-7xl mx-auto text-center mb-16">
          <motion.h2 initial={{opacity:0, y:20}} whileInView={{opacity:1, y:0}} viewport={{once:true}} className="text-4xl md:text-5xl font-bold mb-4"
          style={{ fontFamily: "Orbitron" }}>Protection for Everyone</motion.h2>
          <motion.p initial={{opacity:0, y:20}} whileInView={{opacity:1, y:0}} viewport={{once:true}} transition={{delay:0.1}} className="text-xl text-gray-300">
            AFRATER adapts to your specific needs
          </motion.p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {USE_CASES.map((uc,i) => (
            <motion.div key={i} initial={{opacity:0, y:20}} whileInView={{opacity:1, y:0}} viewport={{once:true}} transition={{delay:i*0.1}} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 hover:shadow-2xl transition-transform">
              <h3 className="text-xl font-bold mb-4">{uc.title}</h3>
              <ul className="space-y-3">
                {uc.points.map((p,j) => (
                  <li key={j} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-cyan-400 mt-0.5" />
                    <span className="text-gray-300">{p}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-purple-500 to-cyan-400 text-white">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <motion.h2 initial={{opacity:0, y:20}} whileInView={{opacity:1, y:0}} viewport={{once:true}} className="text-4xl md:text-5xl font-bold"
          style={{ fontFamily: "Orbitron" }}>Ready to Stop Fraud?</motion.h2>
          <motion.p initial={{opacity:0, y:20}} whileInView={{opacity:1, y:0}} viewport={{once:true}} transition={{delay:0.1}} className="text-xl text-white/90">
            Join thousands protecting their M-Pesa transactions with AFRATER
          </motion.p>
          <motion.div initial={{opacity:0, y:20}} whileInView={{opacity:1, y:0}} viewport={{once:true}} transition={{delay:0.2}}>
            <button
              onClick={() => setAuthOpen(true)}
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-purple-600 rounded-xl font-bold text-lg hover:bg-gray-50 transition-shadow shadow-xl"
            >
              Get Started Free <ArrowRight className="w-5 h-5"/>
            </button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-6 h-6 text-cyan-400"/>
              <span className="text-xl font-bold text-white" style={{ fontFamily: "Orbitron" }}>AFRATER</span>
            </div>
            <p className="text-gray-400 text-sm">Amok Fraud Terminator — Protecting M-Pesa users from social engineering scams</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-white transition-colors">How It Works</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">About</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-white/20 text-sm text-center">
          © 2024 AFRATER. All rights reserved. MVP Launch.
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={authOpen} 
        onClose={() => setAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
}