"use client";

import { useState } from "react";
import { Artwork } from "@/lib/types";

interface ArtworkEditModalProps {
  artwork: Artwork;
  onSave: (updated: Partial<Artwork>) => void;
  onClose: () => void;
}

const categories: Artwork["category"][] = [
  "illustrations",
  "comics",
  "graphic_design",
  "sketchbook",
  "visdev",
];

export default function ArtworkEditModal({
  artwork,
  onSave,
  onClose,
}: ArtworkEditModalProps) {
  const [title, setTitle] = useState(artwork.title);
  const [category, setCategory] = useState(artwork.category);
  const [medium, setMedium] = useState(artwork.medium);
  const [annotation, setAnnotation] = useState(artwork.annotation);
  const [tags, setTags] = useState(artwork.tags.join(", "));
  const [order, setOrder] = useState(artwork.order);

  const handleSave = () => {
    onSave({
      title,
      category,
      medium,
      annotation,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      order,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-dark mb-4">Edit Artwork</h2>

        <div className="mb-3">
          <img
            src={artwork.imageUrl}
            alt={artwork.title}
            className="w-full max-h-48 object-contain rounded bg-[#f0f0f0]"
          />
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-dark/70 mb-1">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-dark/20 rounded focus:outline-none focus:border-base"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark/70 mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) =>
                setCategory(e.target.value as Artwork["category"])
              }
              className="w-full px-3 py-2 border border-dark/20 rounded focus:outline-none focus:border-base"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-dark/70 mb-1">
              Medium
            </label>
            <input
              type="text"
              value={medium}
              onChange={(e) => setMedium(e.target.value)}
              className="w-full px-3 py-2 border border-dark/20 rounded focus:outline-none focus:border-base"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark/70 mb-1">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full px-3 py-2 border border-dark/20 rounded focus:outline-none focus:border-base"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark/70 mb-1">
              Annotation
            </label>
            <textarea
              value={annotation}
              onChange={(e) => setAnnotation(e.target.value)}
              className="w-full px-3 py-2 border border-dark/20 rounded focus:outline-none focus:border-base"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark/70 mb-1">
              Display Order
            </label>
            <input
              type="number"
              value={order}
              onChange={(e) => setOrder(Number(e.target.value))}
              className="w-full px-3 py-2 border border-dark/20 rounded focus:outline-none focus:border-base"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleSave}
            className="bg-base text-white px-6 py-2 rounded hover:bg-base-light transition-colors"
          >
            Save
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 rounded border border-dark/20 hover:bg-dark/5 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
