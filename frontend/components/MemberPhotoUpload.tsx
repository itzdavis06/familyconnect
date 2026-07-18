"use client";

import { useRef, useState } from "react";
import { API_URL } from "@/lib/api";

export default function MemberPhotoUpload({
  familyId,
  memberId,
  initialPhotoUrl,
  initials,
  onUploaded,
}: {
  familyId: string;
  memberId: string;
  initialPhotoUrl: string | null;
  initials: string;
  onUploaded: () => void;
}) {
  const [photoUrl, setPhotoUrl] = useState(initialPhotoUrl);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    const formData = new FormData();
    formData.append("photo", file);

    try {
      const res = await fetch(
        `${API_URL}/api/families/${familyId}/members/${memberId}/photo`,
        { method: "POST", credentials: "include", body: formData }
      );

      const data = await res.json();

      if (res.ok) {
        setPhotoUrl(data.photoUrl);
        onUploaded();
      }
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => fileInputRef.current?.click()}
        className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-navy-700 text-xs font-semibold text-white"
      >
        {photoUrl ? (
          <img src={photoUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          initials
        )}
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-[10px]">
            ...
          </div>
        )}
      </button>
      <div className="pointer-events-none absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-green-600 text-[9px] text-white ring-2 ring-white">
        +
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}