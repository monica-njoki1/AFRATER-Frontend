//src/components/ProfileDropdown.jsx
import React, { useRef, useState, useEffect } from "react";
import { Upload, Trash2, LogOut, ChevronDown, Eye, EyeOff } from "lucide-react";
import { updateProfile, deleteAccount } from "../api/api";

function getInitials(name) {
  if (!name) return "?";
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getAvatarColor(name) {
  const colors = [
    "#06b6d4", "#8b5cf6", "#ec4899", "#f59e0b",
    "#10b981", "#3b82f6", "#ef4444", "#14b8a6",
  ];
  if (!name) return colors[0];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
}

function Avatar({ user, size = "sm" }) {
  const [imgError, setImgError] = useState(false);

  // Use Cloudinary URL if available, then localStorage cached URL, then nothing
  const avatarUrl = !imgError ? (user?.profile_pic_url || user?.profile_pic_cache || null) : null;

  const dimensions = size === "sm" ? "w-8 h-8 text-xs" : "w-12 h-12 text-sm";
  const initials = getInitials(user?.name);
  const bgColor = getAvatarColor(user?.name);

  if (avatarUrl) {
    return (
      <div className={`${dimensions} rounded-full overflow-hidden flex-shrink-0`}>
        <img
          src={avatarUrl}
          alt="avatar"
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  return (
    <div
      className={`${dimensions} rounded-full flex items-center justify-center flex-shrink-0 font-bold text-white`}
      style={{ backgroundColor: bgColor }}
    >
      {initials}
    </div>
  );
}

export default function ProfileDropdown({ user, onLogout, onProfileUpdate }) {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [showDeletePassword, setShowDeletePassword] = useState(false);
  const [error, setError] = useState("");
  const dropdownRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
        setShowDeleteConfirm(false);
        setDeletePassword("");
        setError("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleProfilePicChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Convert to base64 data URL so it survives refresh
    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target.result;

      // Show instantly
      const cachedUser = { ...user, profile_pic_cache: dataUrl };
      onProfileUpdate && onProfileUpdate(cachedUser);

      // Save to localStorage immediately
      const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
      savedUser.profile_pic_cache = dataUrl;
      localStorage.setItem("user", JSON.stringify(savedUser));

      setUploading(true);
      setError("");
      try {
        const updated = await updateProfile({ profile_pic: file });
        const updatedUser = updated.user || updated;

        // If backend returns a Cloudinary URL, use that instead
        if (updatedUser.profile_pic_url) {
          const finalUser = { ...savedUser, ...updatedUser };
          localStorage.setItem("user", JSON.stringify(finalUser));
          onProfileUpdate && onProfileUpdate(finalUser);
        }
      } catch (err) {
        setError(err.message || "Failed to upload photo.");
      }
      setUploading(false);
      e.target.value = "";
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
    setDeletePassword("");
    setError("");
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setDeletePassword("");
    setError("");
  };

  const handleDeleteConfirm = async () => {
    if (!deletePassword) {
      setError("Please enter your password.");
      return;
    }
    setDeleting(true);
    setError("");
    try {
      await deleteAccount(deletePassword);
      onLogout();
    } catch (err) {
      setError(err.message || "Incorrect password or failed to delete.");
      setDeleting(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger button */}
      <button
        onClick={() => {
          setOpen((prev) => !prev);
          setShowDeleteConfirm(false);
          setDeletePassword("");
          setError("");
        }}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
      >
        <Avatar user={user} size="sm" />
        <span className="text-sm font-medium text-gray-200 hidden md:block">
          {user?.name || user?.email}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-72 bg-gray-800 border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
          {/* User info */}
          <div className="px-4 py-4 border-b border-white/10 flex items-center gap-3">
            <Avatar user={user} size="lg" />
            <div className="overflow-hidden">
              <p className="text-white font-semibold text-sm truncate">{user?.name}</p>
              <p className="text-gray-400 text-xs truncate">{user?.email}</p>
            </div>
          </div>

          {!showDeleteConfirm ? (
            <div className="py-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-200 hover:bg-white/10 transition-colors disabled:opacity-50"
              >
                <Upload className="w-4 h-4 text-cyan-400" />
                {uploading ? "Uploading..." : "Change Profile Photo"}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/gif"
                className="hidden"
                onChange={handleProfilePicChange}
              />

              <button
                onClick={() => { setOpen(false); onLogout(); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-200 hover:bg-white/10 transition-colors"
              >
                <LogOut className="w-4 h-4 text-gray-400" />
                Logout
              </button>

              <div className="border-t border-white/10 my-1" />

              <button
                onClick={handleDeleteClick}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete Account
              </button>
            </div>
          ) : (
            <div className="px-4 py-4 space-y-3">
              <p className="text-sm text-gray-200 font-medium">Confirm account deletion</p>
              <p className="text-xs text-gray-400">This is permanent and cannot be undone. Enter your password to confirm.</p>

              <div className="relative">
                <input
                  type={showDeletePassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleDeleteConfirm()}
                  className="w-full px-3 py-2 pr-10 rounded-lg bg-gray-700 border border-gray-600 text-white text-sm focus:outline-none focus:border-red-400 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowDeletePassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showDeletePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {error && <p className="text-xs text-red-400">{error}</p>}

              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleDeleteCancel}
                  className="flex-1 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-sm text-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={deleting}
                  className="flex-1 py-2 rounded-lg bg-red-500 hover:bg-red-600 disabled:opacity-50 text-sm text-white font-semibold transition-colors"
                >
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          )}

          {error && !showDeleteConfirm && (
            <div className="px-4 pb-3 text-xs text-red-400">{error}</div>
          )}
        </div>
      )}
    </div>
  );
}