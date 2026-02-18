"use client";

import { useState } from "react";
import { Artwork } from "@/lib/types";
import ArtworkEditModal from "./ArtworkEditModal";

interface ArtworkTableProps {
  artworks: Artwork[];
  onRefresh: () => void;
}

export default function ArtworkTable({ artworks, onRefresh }: ArtworkTableProps) {
  const [editingArtwork, setEditingArtwork] = useState<Artwork | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const sorted = [...artworks].sort((a, b) => a.order - b.order);

  const toggleVisibility = async (artwork: Artwork) => {
    await fetch(`/api/artworks/${artwork.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visible: !artwork.visible }),
    });
    onRefresh();
  };

  const handleDelete = async (id: string) => {
    if (deleting === id) {
      await fetch(`/api/artworks/${id}`, { method: "DELETE" });
      setDeleting(null);
      onRefresh();
    } else {
      setDeleting(id);
      setTimeout(() => setDeleting(null), 3000);
    }
  };

  const handleSave = async (updates: Partial<Artwork>) => {
    if (!editingArtwork) return;
    await fetch(`/api/artworks/${editingArtwork.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    setEditingArtwork(null);
    onRefresh();
  };

  const moveOrder = async (artwork: Artwork, direction: -1 | 1) => {
    await fetch(`/api/artworks/${artwork.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order: artwork.order + direction }),
    });
    onRefresh();
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-dark/5">
              <tr>
                <th className="px-4 py-3 text-sm font-medium text-dark/70">
                  Image
                </th>
                <th className="px-4 py-3 text-sm font-medium text-dark/70">
                  Title
                </th>
                <th className="px-4 py-3 text-sm font-medium text-dark/70">
                  Category
                </th>
                <th className="px-4 py-3 text-sm font-medium text-dark/70">
                  Visible
                </th>
                <th className="px-4 py-3 text-sm font-medium text-dark/70">
                  Order
                </th>
                <th className="px-4 py-3 text-sm font-medium text-dark/70">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark/10">
              {sorted.map((artwork) => (
                <tr key={artwork.id} className="hover:bg-dark/[0.02]">
                  <td className="px-4 py-2">
                    <img
                      src={artwork.imageUrl}
                      alt={artwork.title}
                      className="w-16 h-16 object-cover rounded"
                    />
                  </td>
                  <td className="px-4 py-2 font-medium">{artwork.title}</td>
                  <td className="px-4 py-2 text-sm text-dark/70">
                    {artwork.category.replace("_", " ")}
                  </td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => toggleVisibility(artwork)}
                      className={`w-10 h-6 rounded-full transition-colors relative ${
                        artwork.visible ? "bg-base" : "bg-dark/20"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                          artwork.visible ? "left-[18px]" : "left-0.5"
                        }`}
                      />
                    </button>
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => moveOrder(artwork, -1)}
                        className="text-dark/50 hover:text-dark text-lg"
                      >
                        ↑
                      </button>
                      <span className="text-sm w-8 text-center">
                        {artwork.order}
                      </span>
                      <button
                        onClick={() => moveOrder(artwork, 1)}
                        className="text-dark/50 hover:text-dark text-lg"
                      >
                        ↓
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingArtwork(artwork)}
                        className="text-sm px-3 py-1 bg-dark/5 rounded hover:bg-dark/10 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(artwork.id)}
                        className={`text-sm px-3 py-1 rounded transition-colors ${
                          deleting === artwork.id
                            ? "bg-red-500 text-white"
                            : "bg-red-50 text-red-600 hover:bg-red-100"
                        }`}
                      >
                        {deleting === artwork.id ? "Confirm?" : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {artworks.length === 0 && (
          <p className="text-center text-dark/50 py-8">No artworks yet.</p>
        )}
      </div>

      {editingArtwork && (
        <ArtworkEditModal
          artwork={editingArtwork}
          onSave={handleSave}
          onClose={() => setEditingArtwork(null)}
        />
      )}
    </>
  );
}
