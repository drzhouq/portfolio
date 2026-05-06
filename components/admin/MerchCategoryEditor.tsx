"use client";

import { useState } from "react";
import { SiteSettings, DEFAULT_MERCH_CATEGORIES } from "@/lib/types";

interface MerchCategoryEditorProps {
  settings: SiteSettings;
  onUpdate: (updates: Partial<SiteSettings>) => Promise<void>;
}

export default function MerchCategoryEditor({ settings, onUpdate }: MerchCategoryEditorProps) {
  const current = settings.merchCategories ?? [...DEFAULT_MERCH_CATEGORIES];
  const [draft, setDraft] = useState<string[]>(current);
  const [newCat, setNewCat] = useState("");
  const [saving, setSaving] = useState(false);

  const dirty = JSON.stringify(draft) !== JSON.stringify(current);

  const addCategory = () => {
    const v = newCat.trim();
    if (!v || draft.includes(v)) return;
    setDraft([...draft, v]);
    setNewCat("");
  };

  const renameCategory = (index: number, value: string) => {
    const next = [...draft];
    next[index] = value;
    setDraft(next);
  };

  const removeCategory = (index: number) => {
    setDraft(draft.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setSaving(true);
    const cleaned = draft.map((c) => c.trim()).filter(Boolean);
    await onUpdate({ merchCategories: cleaned });
    setSaving(false);
  };

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-dark/10">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-dark">Merch Categories</h3>
          <p className="text-xs text-dark/50">Add or rename categories used by merch items.</p>
        </div>
        {dirty && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="text-sm px-4 py-1.5 bg-base text-white rounded hover:bg-base-light transition-colors disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Categories"}
          </button>
        )}
      </div>

      <div className="space-y-2 mb-3">
        {draft.map((cat, i) => (
          <div key={i} className="flex gap-2">
            <input
              value={cat}
              onChange={(e) => renameCategory(i, e.target.value)}
              className="flex-1 border border-dark/20 rounded px-3 py-2 text-sm focus:outline-none focus:border-base"
            />
            <button
              onClick={() => removeCategory(i)}
              className="text-red-400 hover:text-red-600 text-sm px-2"
              aria-label={`Remove ${cat}`}
            >
              &times;
            </button>
          </div>
        ))}
        {draft.length === 0 && (
          <p className="text-xs text-dark/50">No categories yet. Add one below.</p>
        )}
      </div>

      <div className="flex gap-2">
        <input
          value={newCat}
          onChange={(e) => setNewCat(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addCategory();
            }
          }}
          placeholder="New category name"
          className="flex-1 border border-dark/20 rounded px-3 py-2 text-sm focus:outline-none focus:border-base"
        />
        <button
          onClick={addCategory}
          disabled={!newCat.trim()}
          className="text-sm px-3 py-1.5 bg-dark/5 rounded hover:bg-dark/10 transition-colors disabled:opacity-50"
        >
          + Add
        </button>
      </div>
    </div>
  );
}
