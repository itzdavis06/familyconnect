"use client";

import { useRef, useState } from "react";
import { API_URL } from "@/lib/api";

export default function ProfilePhotoUpload({
  initialPhotoUrl,
  initials,
}: {
  initialPhotoUrl: string | null;
  initials: string;
}) {
  const [photoUrl, setPhotoUrl] = useState(initialPhotoUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setUploading(true);

    const formData = new FormData();
    formData.append("photo", file);

    try {
      const res = await fetch(`${API_URL}/api/me/photo`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Upload failed");
        return;
      }

      setPhotoUrl(data.photoUrl);
    } catch {
      setError("Could not reach the server");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={() => fileInputRef.current?.click()}
        className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-navy-700 text-lg font-semibold text-white"
      >
        {photoUrl ? (
          <img src={photoUrl} alt="Profile" className="h-full w-full object-cover" />
        ) : (
          initials
        )}
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-xs">
            ...
          </div>
        )}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        className="text-xs font-medium text-navy-700 underline"
      >
        {photoUrl ? "Change photo" : "Add photo"}
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}