"use client";

import { useState } from "react";
import { API_URL } from "@/lib/api";

export default function Settings() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");

  async function handleLogout() {
    await fetch(`${API_URL}/api/logout`, {
      method: "POST",
      credentials: "include",
    });
    window.location.href = "/login";
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess(false);

    if (newPassword !== confirmNewPassword) {
      setPasswordError("New passwords don't match");
      return;
    }

    const res = await fetch(`${API_URL}/api/me/password`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    const data = await res.json();

    if (!res.ok) {
      setPasswordError(data.error || "Something went wrong");
      return;
    }

    setPasswordSuccess(true);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
  }

  async function handleDeleteAccount() {
    setDeleteError("");

    const res = await fetch(`${API_URL}/api/me`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ password: deletePassword }),
    });

    const data = await res.json();

    if (!res.ok) {
      setDeleteError(data.error || "Something went wrong");
      return;
    }

    window.location.href = "/login";
  }

  return (
    <div>
      <h1 className="font-[var(--font-manrope)] text-2xl font-extrabold text-navy-900">
        Settings
      </h1>

      <div className="mt-6 max-w-md rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-100 p-4">
          <p className="text-xs font-semibold uppercase text-slate-400">
            Account
          </p>

          <button
            onClick={() => setShowPasswordForm(!showPasswordForm)}
            className="mt-2 block w-full py-2 text-left text-sm text-slate-700"
          >
            Change Password
          </button>

          {showPasswordForm && (
            <form
              onSubmit={handleChangePassword}
              className="mb-3 flex flex-col gap-3 rounded-lg bg-gray-50 p-3"
            >
              <div>
                <label className="text-xs font-medium text-slate-700">
                  Current password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700">
                  New password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
                <p className="mt-1 text-xs text-slate-500">
                  At least 8 characters, one uppercase letter, one number
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700">
                  Confirm new password
                </label>
                <input
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  required
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </div>

              {passwordError && (
                <p className="text-xs text-red-600">{passwordError}</p>
              )}
              {passwordSuccess && (
                <p className="text-xs text-green-600">
                  Password changed successfully.
                </p>
              )}

              <button
                type="submit"
                className="rounded-full bg-navy-700 px-4 py-2 text-xs font-semibold text-white"
              >
                Update Password
              </button>
            </form>
          )}

          <button
            onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
            className="block w-full py-2 text-left text-sm text-red-600"
          >
            Delete Account
          </button>

          {showDeleteConfirm && (
            <div className="mb-3 flex flex-col gap-3 rounded-lg bg-red-50 p-3">
              <p className="text-xs text-red-700">
                This permanently deletes your account. This cannot be undone.
                Enter your password to confirm.
              </p>
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="Your password"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
              {deleteError && (
                <p className="text-xs text-red-600">{deleteError}</p>
              )}
              <button
                onClick={handleDeleteAccount}
                className="rounded-full bg-red-600 px-4 py-2 text-xs font-semibold text-white"
              >
                Permanently Delete My Account
              </button>
            </div>
          )}
        </div>

        <div className="border-b border-gray-100 p-4">
          <p className="text-xs font-semibold uppercase text-slate-400">
            App
          </p>
          <button className="mt-2 block w-full py-2 text-left text-sm text-slate-700">
            Privacy &amp; Security
          </button>
          <button className="block w-full py-2 text-left text-sm text-slate-700">
            Notifications
          </button>
          <button className="block w-full py-2 text-left text-sm text-slate-700">
            Help &amp; Support
          </button>
        </div>

        <div className="p-4">
          <button
            onClick={handleLogout}
            className="block w-full py-2 text-left text-sm font-medium text-red-600"
          >
            Log Out
          </button>
        </div>
      </div>

      <p className="mt-6 text-xs text-slate-400">FamilyConnect v1.0.0</p>
    </div>
  );
}