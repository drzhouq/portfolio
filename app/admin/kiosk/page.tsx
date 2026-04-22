"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Artwork, SiteSettings, KioskConfig } from "@/lib/types";

const DEFAULT_KIOSK: KioskConfig = {
  artworkIds: [],
  intervalSeconds: 8,
  showOverlay: true,
  showDescription: false,
  transition: "fade",
};

export default function KioskConfigPage() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [config, setConfig] = useState<KioskConfig>(DEFAULT_KIOSK);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`/api/artworks?t=${Date.now()}`, { cache: "no-store" }).then((r) => r.json()),
      fetch(`/api/settings?t=${Date.now()}`, { cache: "no-store" }).then((r) => r.json()),
    ]).then(([arts, settings]: [Artwork[], SiteSettings]) => {
      setArtworks(arts.filter((a) => a.visible));
      setConfig(settings.kiosk ?? DEFAULT_KIOSK);
      setLoading(false);
    });
  }, []);

  const update = (partial: Partial<KioskConfig>) => {
    setConfig((prev) => ({ ...prev, ...partial }));
    setDirty(true);
  };

  const handleSave = async () => {
    setSaving(true);
    await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kiosk: config }),
    });
    setSaving(false);
    setDirty(false);
  };

  const addArtwork = (id: string) => {
    if (!config.artworkIds.includes(id)) {
      update({ artworkIds: [...config.artworkIds, id] });
    }
  };

  const removeArtwork = (id: string) => {
    update({ artworkIds: config.artworkIds.filter((aid) => aid !== id) });
  };

  const moveArtwork = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= config.artworkIds.length) return;
    const ids = [...config.artworkIds];
    [ids[index], ids[newIndex]] = [ids[newIndex], ids[index]];
    update({ artworkIds: ids });
  };

  const selectedArtworks = config.artworkIds
    .map((id) => artworks.find((a) => a.id === id))
    .filter(Boolean) as Artwork[];

  const availableArtworks = artworks.filter(
    (a) => !config.artworkIds.includes(a.id)
  );

  if (loading) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 py-8">
        <p className="text-dark/50">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-dark">Kiosk Configuration</h1>
          <Link href="/admin" className="text-sm text-base hover:text-base-light">
            &larr; Back to Dashboard
          </Link>
        </div>
        <div className="flex gap-3">
          <a
            href="/kiosk"
            target="_blank"
            className="text-sm px-4 py-2 bg-dark/5 rounded hover:bg-dark/10 transition-colors"
          >
            Preview
          </a>
          {dirty && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="text-sm px-4 py-2 bg-base text-white rounded hover:bg-base-light transition-colors disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          )}
        </div>
      </div>

      {/* Settings */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-dark/10 mb-8">
        <h3 className="text-sm font-semibold text-dark mb-4">Settings</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <label className="text-sm font-medium text-dark/70 block mb-1">
              Interval (seconds)
            </label>
            <input
              type="number"
              min={3}
              max={60}
              value={config.intervalSeconds}
              onChange={(e) => update({ intervalSeconds: Number(e.target.value) })}
              className="w-full border border-dark/20 rounded px-3 py-2 text-sm focus:outline-none focus:border-base"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-dark/70 block mb-1">
              Transition
            </label>
            <select
              value={config.transition}
              onChange={(e) => update({ transition: e.target.value as KioskConfig["transition"] })}
              className="w-full border border-dark/20 rounded px-3 py-2 text-sm focus:outline-none focus:border-base"
            >
              <option value="fade">Fade</option>
              <option value="crossfade">Crossfade</option>
              <option value="slide">Slide</option>
            </select>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-dark/70">Show Overlay</label>
            <button
              onClick={() => update({ showOverlay: !config.showOverlay })}
              className={`w-10 h-6 rounded-full transition-colors relative ${
                config.showOverlay ? "bg-base" : "bg-dark/20"
              }`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                  config.showOverlay ? "left-[18px]" : "left-0.5"
                }`}
              />
            </button>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-dark/70">Show Description</label>
            <button
              onClick={() => update({ showDescription: !config.showDescription })}
              className={`w-10 h-6 rounded-full transition-colors relative ${
                config.showDescription ? "bg-base" : "bg-dark/20"
              }`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                  config.showDescription ? "left-[18px]" : "left-0.5"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Artwork picker */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Selected */}
        <div>
          <h3 className="text-sm font-semibold text-dark mb-3">
            Selected ({selectedArtworks.length})
          </h3>
          <div className="bg-white rounded-lg shadow-sm border border-dark/10 min-h-[200px]">
            {selectedArtworks.length === 0 ? (
              <p className="text-dark/40 text-sm text-center py-8">
                No artworks selected. Add from the available list.
              </p>
            ) : (
              <div className="divide-y divide-dark/10">
                {selectedArtworks.map((art, i) => (
                  <div key={art.id} className="flex items-center gap-3 px-3 py-2">
                    <div className="flex flex-col gap-0.5">
                      <button
                        onClick={() => moveArtwork(i, -1)}
                        disabled={i === 0}
                        className="text-dark/40 hover:text-dark disabled:opacity-20 text-sm"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => moveArtwork(i, 1)}
                        disabled={i === selectedArtworks.length - 1}
                        className="text-dark/40 hover:text-dark disabled:opacity-20 text-sm"
                      >
                        ↓
                      </button>
                    </div>
                    <span className="text-xs text-dark/40 w-5 text-center">{i + 1}</span>
                    <img
                      src={art.imageUrl}
                      alt={art.title}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <span className="flex-1 text-sm font-medium truncate">{art.title}</span>
                    <button
                      onClick={() => removeArtwork(art.id)}
                      className="text-red-400 hover:text-red-600 text-sm px-2"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Available */}
        <div>
          <h3 className="text-sm font-semibold text-dark mb-3">
            Available ({availableArtworks.length})
          </h3>
          <div className="bg-white rounded-lg shadow-sm border border-dark/10 min-h-[200px] max-h-[500px] overflow-y-auto">
            {availableArtworks.length === 0 ? (
              <p className="text-dark/40 text-sm text-center py-8">
                All artworks have been selected.
              </p>
            ) : (
              <div className="divide-y divide-dark/10">
                {availableArtworks.map((art) => (
                  <div key={art.id} className="flex items-center gap-3 px-3 py-2">
                    <img
                      src={art.imageUrl}
                      alt={art.title}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <span className="flex-1 text-sm font-medium truncate">{art.title}</span>
                    <span className="text-xs text-dark/40">{art.category.replace("_", " ")}</span>
                    <button
                      onClick={() => addArtwork(art.id)}
                      className="text-sm px-3 py-1 bg-base/10 text-base rounded hover:bg-base/20 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
