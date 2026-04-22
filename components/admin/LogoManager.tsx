"use client";

import { useState } from "react";
import { SiteSettings } from "@/lib/types";

interface LogoManagerProps {
  settings: SiteSettings;
  onUpdate: (updates: Partial<SiteSettings>) => Promise<void>;
}

function ImageUploadField({
  label,
  currentUrl,
  fallback,
  onUploaded,
}: {
  label: string;
  currentUrl?: string | null;
  fallback: string;
  onUploaded: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: form });
    if (res.ok) {
      const { url } = await res.json();
      onUploaded(url);
    }
    setUploading(false);
    e.target.value = "";
  };

  return (
    <div className="flex items-center gap-4">
      <img
        src={currentUrl || fallback}
        alt={label}
        className="h-12 w-auto bg-dark/5 rounded p-1"
      />
      <div className="flex-1">
        <p className="text-sm font-medium text-dark">{label}</p>
        <label className="text-sm text-base cursor-pointer hover:text-base-light">
          {uploading ? "Uploading..." : "Replace"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleUpload}
            disabled={uploading}
          />
        </label>
      </div>
    </div>
  );
}

export default function LogoManager({ settings, onUpdate }: LogoManagerProps) {
  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-dark/10">
      <h3 className="text-sm font-semibold text-dark mb-4">Logos & Profile Photo</h3>
      <div className="space-y-4">
        <ImageUploadField
          label="Logo Icon"
          currentUrl={settings.logoIconUrl}
          fallback="/images/logos/arislogodark.svg"
          onUploaded={(url) => onUpdate({ logoIconUrl: url })}
        />
        <ImageUploadField
          label="Logo Name"
          currentUrl={settings.logoNameUrl}
          fallback="/images/logos/arisnamedark.svg"
          onUploaded={(url) => onUpdate({ logoNameUrl: url })}
        />
        <ImageUploadField
          label="Profile Photo"
          currentUrl={settings.profilePhotoUrl}
          fallback="/images/profile.png"
          onUploaded={(url) => onUpdate({ profilePhotoUrl: url })}
        />
      </div>
    </div>
  );
}
