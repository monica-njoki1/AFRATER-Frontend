// src/components/Navbar.jsx
import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Shield, Menu, X, Upload, Trash2, LogOut, ChevronDown, Eye, EyeOff } from "lucide-react";
import { updateProfile, deleteAccount } from "../api/api";
import "@fontsource/orbitron/700.css";

function getInitials(name) {
  if (!name) return "?";
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getAvatarColor(name) {
  const colors = ["#06b6d4", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#3b82f6", "#ef4444", "#14b8a6"];
  if (!name) return colors[0];
  return colors[name.charCodeAt(0) % colors.length];
}

function Avatar({ user, size = "sm" }) {
  const [imgError, setImgError] = useState(false);
  const rawUrl = user?.profile_pic_url || user?.profile_pic_cache || null;
  const avatarSrc = rawUrl && rawUrl.includes("cloudinary.com")
    ? rawUrl.replace("/upload/", "/upload/fl_animated,fl_awebp/")
    : rawUrl;
  useEffect(() => { setImgError(false); }, [avatarSrc]);
  const avatarUrl = !imgError ? avatarSrc : null;
  const dimensions = size === "sm" ? "w-9 h-9 text-xs" : size === "md" ? "w-12 h-12 text-sm" : "w-16 h-16 text-lg";
  const initials = getInitials(user?.name);
  const bgColor = getAvatarColor(user?.name);
  if (avatarUrl) {
    return (
      <div className={`${dimensions} rounded-full overflow-hidden flex-shrink-0 ring-2 ring-cyan-400/40`}>
        <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" onError={() => setImgError(true)} />
      </div>
    );
  }
  return (
    <div className={`${dimensions} rounded-full flex items-center justify-center flex-shrink-0 font-bold text-white ring-2 ring-cyan-400/40`} style={{ backgroundColor: bgColor }}>
      {initials}
    </div>
  );
}

function ProfilePanel({ user, onLogout, onProfileUpdate, onClose }) {
  const [uploading, setUploading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [showDeletePassword, setShowDeletePassword] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const handleProfilePicChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target.result;
      onProfileUpdate && onProfileUpdate({ ...user, profile_pic_cache: dataUrl });
      setUploading(true);
      setError("");
      try {
        const updated = await updateProfile({ profile_pic: file });
        const updatedUser = updated.user || updated;
        const finalUser = { ...user, ...updatedUser, profile_pic_cache: null };
        onProfileUpdate && onProfileUpdate(finalUser);
        const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
        localStorage.setItem("user", JSON.stringify({ ...savedUser, ...updatedUser, profile_pic_cache: null }));
      } catch (err) {
        setError(err.message || "Failed to upload photo.");
        onProfileUpdate && onProfileUpdate({ ...user });
      }
      setUploading(false);
      e.target.value = "";
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteConfirm = async () => {
    if (!deletePassword) { setError("Please enter your password."); return; }
    setDeleting(true);
    setError("");
    try {
      await deleteAccount(deletePassword);
      if (user?.email) localStorage.removeItem(`profile_pic_${user.email}`);
      onLogout();
    } catch (err) {
      setError(err.message || "Incorrect password.");
      setDeleting(false);
    }
  };

  return (
    <div className="w-full">
      <div className="px-4 py-5 flex items-center gap-4 border-b border-white/10">
        <Avatar user={user} size="lg" />
        <div className="overflow-hidden">
          <p className="text-white font-bold text-base truncate">{user?.name}</p>
          <p className="text-gray-400 text-xs truncate">{user?.email}</p>
        </div>
      </div>
      {!showDeleteConfirm ? (
        <div className="py-2">
          <button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="w-full flex items-center gap-3 px-4 py-3.5 text-sm text-gray-200 hover:bg-white/10 active:bg-white/20 transition-colors disabled:opacity-50">
            <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
              <Upload className="w-4 h-4 text-cyan-400" />
            </div>
            {uploading ? "Uploading..." : "Change Profile Photo"}
          </button>
          <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/gif" className="hidden" onChange={handleProfilePicChange} />
          <button onClick={() => { onClose && onClose(); onLogout(); }} className="w-full flex items-center gap-3 px-4 py-3.5 text-sm text-gray-200 hover:bg-white/10 active:bg-white/20 transition-colors">
            <div className="w-8 h-8 rounded-full bg-gray-500/20 flex items-center justify-center flex-shrink-0">
              <LogOut className="w-4 h-4 text-gray-400" />
            </div>
            Logout
          </button>
          <div className="border-t border-white/10 my-1" />
          <button onClick={() => { setShowDeleteConfirm(true); setError(""); }} className="w-full flex items-center gap-3 px-4 py-3.5 text-sm text-red-400 hover:bg-red-500/10 active:bg-red-500/20 transition-colors">
            <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
              <Trash2 className="w-4 h-4 text-red-400" />
            </div>
            Delete Account
          </button>
        </div>
      ) : (
        <div className="px-4 py-5 space-y-4">
          <div>
            <p className="text-sm text-white font-semibold">Confirm deletion</p>
            <p className="text-xs text-gray-400 mt-1">This is permanent and cannot be undone.</p>
          </div>
          <div className="relative">
            <input type={showDeletePassword ? "text" : "password"} placeholder="Enter your password" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleDeleteConfirm()} className="w-full px-3 py-2.5 pr-10 rounded-lg bg-gray-700 border border-gray-600 text-white text-sm focus:outline-none focus:border-red-400 transition-colors" />
            <button type="button" onClick={() => setShowDeletePassword(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
              {showDeletePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <div className="flex gap-2">
            <button onClick={() => { setShowDeleteConfirm(false); setDeletePassword(""); setError(""); }} className="flex-1 py-2.5 rounded-lg bg-gray-700 hover:bg-gray-600 text-sm text-gray-200 transition-colors">Cancel</button>
            <button onClick={handleDeleteConfirm} disabled={deleting} className="flex-1 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 disabled:opacity-50 text-sm text-white font-semibold transition-colors">
              {deleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      )}
      {error && !showDeleteConfirm && <p className="px-4 pb-3 text-xs text-red-400">{error}</p>}
    </div>
  );
}

export default function Navbar({ user, onLoginClick, onLogout, onProfileUpdate }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState("menu");
  const desktopDropdownRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const isOnLanding = location.pathname === "/";

  // ✅ Smart nav link handler:
  // If already on landing → smooth scroll
  // If on dashboard → navigate to / then scroll after mount
  const handleNavClick = (sectionId) => {
    setMobileOpen(false);
    if (isOnLanding) {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      navigate(`/?section=${sectionId}`);
    }
  };

  // If we arrived from dashboard with ?section=xxx, scroll to it
  useEffect(() => {
    if (isOnLanding) {
      const params = new URLSearchParams(window.location.search);
      const section = params.get("section");
      if (section) {
        setTimeout(() => {
          const el = document.getElementById(section);
          if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
        // Clean up the URL
        window.history.replaceState({}, "", "/");
      }
    }
  }, [isOnLanding]);

  useEffect(() => {
    const handler = (e) => {
      if (desktopDropdownRef.current && !desktopDropdownRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const navLinks = [
    { label: "Platform", section: "platform" },
    { label: "Features", section: "features" },
    { label: "Demo",     section: "demo" },
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 bg-gray-900/95 backdrop-blur-md border-b border-white/10 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <button onClick={() => navigate("/")} className="flex items-center gap-2">
            <Shield className="w-7 h-7 text-cyan-400" />
            <span className="text-xl font-bold text-white" style={{ fontFamily: "Orbitron" }}>AFRATER</span>
          </button>

          {/* Desktop nav links — only show on landing */}
          {isOnLanding && (
            <div className="hidden md:flex items-center gap-8 text-sm font-medium">
              {navLinks.map(link => (
                <button
                  key={link.label}
                  onClick={() => handleNavClick(link.section)}
                  className="text-gray-300 hover:text-cyan-400 transition-colors"
                >
                  {link.label}
                </button>
              ))}
            </div>
          )}

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative" ref={desktopDropdownRef}>
                <button onClick={() => setProfileOpen(p => !p)} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors">
                  <Avatar user={user} size="sm" />
                  <span className="text-sm font-medium text-gray-200">{user?.name?.split(" ")[0]}</span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${profileOpen ? "rotate-180" : ""}`} />
                </button>
                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-gray-800 border border-white/10 rounded-xl shadow-2xl overflow-hidden">
                    <ProfilePanel user={user} onLogout={onLogout} onProfileUpdate={onProfileUpdate} onClose={() => setProfileOpen(false)} />
                  </div>
                )}
              </div>
            ) : (
              <button onClick={onLoginClick} className="px-5 py-2 bg-gradient-to-r from-purple-500 to-cyan-400 rounded-lg font-semibold text-white hover:scale-[1.02] transition-transform text-sm">
                Get Started
              </button>
            )}
          </div>

          <div className="flex md:hidden items-center gap-3">
            {user && (
              <button onClick={() => { setMobileOpen(true); setMobileTab("profile"); }} className="flex items-center">
                <Avatar user={user} size="sm" />
              </button>
            )}
            <button onClick={() => { setMobileOpen(true); setMobileTab("menu"); }} className="p-2 text-gray-300 hover:text-white transition-colors">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </nav>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-80 max-w-[90vw] bg-gray-900 border-l border-white/10 flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-4 h-16 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-cyan-400" />
                <span className="text-sm font-bold text-white" style={{ fontFamily: "Orbitron" }}>AFRATER</span>
              </div>
              <button onClick={() => setMobileOpen(false)} className="p-2 text-gray-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            {user && (
              <div className="flex border-b border-white/10">
                <button onClick={() => setMobileTab("menu")} className={`flex-1 py-3 text-sm font-medium transition-colors ${mobileTab === "menu" ? "text-cyan-400 border-b-2 border-cyan-400" : "text-gray-400"}`}>Menu</button>
                <button onClick={() => setMobileTab("profile")} className={`flex-1 py-3 text-sm font-medium transition-colors ${mobileTab === "profile" ? "text-cyan-400 border-b-2 border-cyan-400" : "text-gray-400"}`}>Profile</button>
              </div>
            )}
            <div className="flex-1 overflow-y-auto">
              {mobileTab === "menu" || !user ? (
                <div className="py-4">
                  {navLinks.map(link => (
                    <button
                      key={link.label}
                      onClick={() => handleNavClick(link.section)}
                      className="w-full text-left flex items-center px-6 py-4 text-gray-200 hover:text-cyan-400 hover:bg-white/5 transition-colors text-base font-medium"
                    >
                      {link.label}
                    </button>
                  ))}
                  {!user && (
                    <div className="px-4 pt-4 border-t border-white/10 mt-2">
                      <button onClick={() => { setMobileOpen(false); onLoginClick(); }} className="w-full py-3 bg-gradient-to-r from-purple-500 to-cyan-400 rounded-lg font-semibold text-white text-sm">
                        Get Started
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <ProfilePanel user={user} onLogout={() => { setMobileOpen(false); onLogout(); }} onProfileUpdate={onProfileUpdate} onClose={() => setMobileOpen(false)} />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}