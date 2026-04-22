"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Artwork, SiteSettings, GalleryLayout } from "@/lib/types";
import ArtworkUploader from "@/components/admin/ArtworkUploader";
import ArtworkTable from "@/components/admin/ArtworkTable";
import LogoManager from "@/components/admin/LogoManager";
import AboutEditor from "@/components/admin/AboutEditor";

export default function AdminDashboard() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<SiteSettings>({ showAnnotations: true });

  const fetchArtworks = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/artworks?t=${Date.now()}`, { cache: "no-store" });
    const data = await res.json();
    setArtworks(data);
    setLoading(false);
  }, []);

  const updateArtwork = useCallback((updated: Artwork) => {
    setArtworks((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
  }, []);

  useEffect(() => {
    fetchArtworks();
    fetch(`/api/settings?t=${Date.now()}`, { cache: "no-store" }).then((r) => r.json()).then(setSettings).catch(() => {});
  }, [fetchArtworks]);

  const updateSettings = async (updates: Partial<SiteSettings>) => {
    const merged = { ...settings, ...updates };
    setSettings(merged);
    await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(merged),
    });
  };

  const toggleAnnotations = () => {
    updateSettings({ showAnnotations: !settings.showAnnotations });
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-dark mb-8">Admin Dashboard</h1>

      <div className="space-y-8">
        <div className="flex items-center justify-between bg-white rounded-lg p-4 shadow-sm border border-dark/10">
          <div>
            <h3 className="text-sm font-semibold text-dark">Show Annotations</h3>
            <p className="text-xs text-dark/50">Display descriptions and medium in the gallery modal</p>
          </div>
          <button
            onClick={toggleAnnotations}
            className={`w-10 h-6 rounded-full transition-colors relative ${
              settings.showAnnotations ? "bg-base" : "bg-dark/20"
            }`}
          >
            <span
              className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                settings.showAnnotations ? "left-[18px]" : "left-0.5"
              }`}
            />
          </button>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border border-dark/10">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-dark">Gallery Layout</h3>
              <p className="text-xs text-dark/50">Choose how artworks are displayed on gallery pages</p>
            </div>
            <select
              value={settings.galleryLayout ?? "masonry"}
              onChange={(e) => updateSettings({ galleryLayout: e.target.value as GalleryLayout })}
              className="border border-dark/20 rounded px-3 py-2 text-sm focus:outline-none focus:border-base"
            >
              <option value="masonry">Masonry</option>
              <option value="grid">Grid</option>
              <option value="featured">Featured</option>
              <option value="horizontal">Horizontal Scroll</option>
              <option value="justified">Justified</option>
            </select>
          </div>
        </div>

        <Link
          href="/admin/kiosk"
          className="block bg-white rounded-lg p-4 shadow-sm border border-dark/10 hover:border-base/30 transition-colors"
        >
          <h3 className="text-sm font-semibold text-dark">Kiosk / Presentation Mode</h3>
          <p className="text-xs text-dark/50">Configure fullscreen slideshow of selected artworks</p>
        </Link>

        <LogoManager settings={settings} onUpdate={updateSettings} />

        <AboutEditor settings={settings} onUpdate={updateSettings} />

        <ArtworkUploader onUploaded={fetchArtworks} />

        <div>
          <h2 className="text-xl font-bold text-dark mb-4">
            Manage Artworks ({artworks.length})
          </h2>
          {loading ? (
            <p className="text-dark/50">Loading...</p>
          ) : (
            <ArtworkTable artworks={artworks} onRefresh={fetchArtworks} onUpdate={updateArtwork} />
          )}
        </div>
      </div>
    </div>
  );
}
