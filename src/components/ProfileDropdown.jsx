import React, { useRef, useState, useEffect } from "react";
import { User, Upload, Trash2, LogOut, ChevronDown } from "lucide-react";
import { updateProfile, deleteAccount } from "../api/api";

export default function ProfileDropdown({ user, onLogout, onProfileUpdate }) {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState("");
  const dropdownRef = useRef(null);
  const fileInputRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
        setConfirmDelete(false);
        setError("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleProfilePicChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setError("");
    try {
      const updated = await updateProfile({ profile_pic: file });
      if (onProfileUpdate) onProfileUpdate(updated);
    } catch (err) {
      setError(err.message || "Failed to upload photo.");
    }
    setUploading(false);
  };

  const handleDeleteAccount = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setDeleting(true);
    setError("");
    try {
      await deleteAccount();
      onLogout();
    } catch (err) {
      setError(err.message || "Failed to delete account.");
      setDeleting(false);
    }
  };

  const avatarUrl = user?.profile_pic
    ? `https://afrater-backend.onrender.com/uploads/users/${user.profile_pic}`
    : null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger button */}
      <button
        onClick={() => { setOpen((prev) => !prev); setConfirmDelete(false); setError(""); }}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
      >
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full overflow-hidden bg-cyan-500 flex items-center justify-center flex-shrink-0">
          {avatarUrl ? (
            <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
          ) : (
            <User className="w-4 h-4 text-white" />
          )}
        </div>
        <span className="text-sm font-medium text-gray-200 hidden md:block">
          {user?.name || user?.email}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-gray-800 border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
          {/* User info */}
          <div className="px-4 py-4 border-b border-white/10 flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-cyan-500 flex items-center justify-center flex-shrink-0">
              {avatarUrl ? (
                <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-6 h-6 text-white" />
              )}
            </div>
            <div className="overflow-hidden">
              <p className="text-white font-semibold text-sm truncate">{user?.name}</p>
              <p className="text-gray-400 text-xs truncate">{user?.email}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="py-2">
            {/* Upload profile pic */}
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

            {/* Logout */}
            <button
              onClick={() => { setOpen(false); onLogout(); }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-200 hover:bg-white/10 transition-colors"
            >
              <LogOut className="w-4 h-4 text-gray-400" />
              Logout
            </button>

            {/* Divider */}
            <div className="border-t border-white/10 my-1" />

            {/* Delete account */}
            <button
              onClick={handleDeleteAccount}
              disabled={deleting}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              {deleting ? "Deleting..." : confirmDelete ? "Tap again to confirm" : "Delete Account"}
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="px-4 pb-3 text-xs text-red-400">{error}</div>
          )}
        </div>
      )}
    </div>
  );
}