import React, { useState } from "react";
import { ArrowRight, X } from "lucide-react";
import { registerUser, loginUser } from "../api/api";

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setIsError(false);

    try {
      if (isLogin) {
        const res = await loginUser(email, password);
        setMessage("Login successful!");
        setIsError(false);
        
        // Clear form
        setEmail("");
        setPassword("");
        
        // Close modal after 1 second and trigger success callback
        setTimeout(() => {
          onClose();
          if (onAuthSuccess) onAuthSuccess(res);
        }, 1000);
      } else {
        const res = await registerUser({ name, email, password });
        setMessage("Registered successfully! Please login.");
        setIsError(false);
        
        // Clear form and switch to login
        setName("");
        setEmail("");
        setPassword("");
        
        // Switch to login form after 1.5 seconds
        setTimeout(() => {
          setIsLogin(true);
          setMessage("");
        }, 1500);
      }
    } catch (err) {
      setMessage(err.message || "Something went wrong.");
      setIsError(true);
    }
    setLoading(false);
  };

  const handleClose = () => {
    // Clear all state when closing
    setEmail("");
    setPassword("");
    setName("");
    setMessage("");
    setIsError(false);
    setIsLogin(true);
    onClose();
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setMessage("");
    setIsError(false);
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleClose}
    >
      <div 
        className="bg-gray-900 text-white rounded-2xl p-8 max-w-md w-full relative border border-white/10 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: "Orbitron" }}>
          {isLogin ? "Welcome Back" : "Join AFRATER"}
        </h2>
        <p className="text-gray-400 mb-6">
          {isLogin ? "Login to access your dashboard" : "Create an account to get started"}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Full Name
              </label>
              <input
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors"
                required
              />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email Address
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-500 to-cyan-400 hover:from-purple-600 hover:to-cyan-500 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed py-3 rounded-lg font-bold transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Processing...
              </>
            ) : (
              <>
                {isLogin ? "Login" : "Create Account"}
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-400">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              onClick={switchMode}
              className="text-cyan-400 font-semibold hover:text-cyan-300 transition-colors"
            >
              {isLogin ? "Sign up" : "Login"}
            </button>
          </p>
        </div>

        {message && (
          <div className={`mt-4 p-3 rounded-lg text-sm font-medium ${
            isError 
              ? "bg-red-500/10 border border-red-500/30 text-red-400" 
              : "bg-green-500/10 border border-green-500/30 text-green-400"
          }`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}