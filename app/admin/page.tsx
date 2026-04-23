"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Artwork, SiteSettings, GalleryLayout } from "@/lib/types";
import { AVAILABLE_FONTS, applyTheme } from "@/components/ThemeProvider";
import ArtworkUploader from "@/components/admin/ArtworkUploader";
import ArtworkTable from "@/components/admin/ArtworkTable";
import LogoManager from "@/components/admin/LogoManager";
import AboutEditor from "@/components/admin/AboutEditor";
import KioskEditor from "@/components/admin/KioskEditor";

const TABS = ["Art Pieces", "About Me", "Appearance", "Kiosk"] as const;
type Tab = (typeof TABS)[number];

export default function AdminDashboard() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<SiteSettings>({ showAnnotations: true });
  const [activeTab, setActiveTab] = useState<Tab>("Art Pieces");

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

  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const updateSettings = async (updates: Partial<SiteSettings>) => {
    const merged = { ...settings, ...updates };
    setSettings(merged);
    if (updates.headerSpacing !== undefined || updates.siteFont !== undefined) {
      applyTheme(merged);
    }
    await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(merged),
    });
  };

  // Debounced version for rapid-fire inputs like range sliders
  const updateSettingsDebounced = (updates: Partial<SiteSettings>) => {
    const merged = { ...settings, ...updates };
    setSettings(merged);
    if (updates.headerSpacing !== undefined || updates.siteFont !== undefined) {
      applyTheme(merged);
    }
    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(merged),
      });
    }, 500);
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-dark mb-6">Admin Dashboard</h1>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-dark/10 mb-8">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors relative ${
              activeTab === tab
                ? "text-base after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-base"
                : "text-dark/50 hover:text-dark"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "Art Pieces" && (
        <div className="space-y-8">
          <div className="flex items-center justify-between bg-white rounded-lg p-4 shadow-sm border border-dark/10">
            <div>
              <h3 className="text-sm font-semibold text-dark">Show Annotations</h3>
              <p className="text-xs text-dark/50">Display descriptions and medium in the gallery modal</p>
            </div>
            <button
              onClick={() => updateSettings({ showAnnotations: !settings.showAnnotations })}
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
      )}

      {activeTab === "About Me" && (
        <div className="space-y-8">
          <LogoManager settings={settings} onUpdate={updateSettings} />
          <AboutEditor settings={settings} onUpdate={updateSettings} />
        </div>
      )}

      {activeTab === "Appearance" && (
        <div className="bg-white rounded-lg p-4 shadow-sm border border-dark/10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="text-sm font-medium text-dark/70 block mb-1">Gallery Layout</label>
              <select
                value={settings.galleryLayout ?? "masonry"}
                onChange={(e) => updateSettings({ galleryLayout: e.target.value as GalleryLayout })}
                className="w-full border border-dark/20 rounded px-3 py-2 text-sm focus:outline-none focus:border-base"
              >
                <option value="masonry">Masonry</option>
                <option value="grid">Grid</option>
                <option value="featured">Featured</option>
                <option value="horizontal">Horizontal Scroll</option>
                <option value="justified">Justified</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-dark/70 block mb-1">Site Font</label>
              <select
                value={settings.siteFont ?? "Baloo 2"}
                onChange={(e) => updateSettings({ siteFont: e.target.value })}
                className="w-full border border-dark/20 rounded px-3 py-2 text-sm focus:outline-none focus:border-base"
              >
                {AVAILABLE_FONTS.map((font) => (
                  <option key={font} value={font}>{font}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-dark/70 block mb-1">
                Header Spacing ({settings.headerSpacing ?? 80}px)
              </label>
              <input
                type="range"
                min={60}
                max={160}
                step={4}
                value={settings.headerSpacing ?? 80}
                onChange={(e) => updateSettingsDebounced({ headerSpacing: Number(e.target.value) })}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-dark/40 mt-1">
                <span>60px</span>
                <span>160px</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "Kiosk" && (
        <KioskEditor artworks={artworks} settings={settings} onUpdate={updateSettings} />
      )}
    </div>
  );
}
