"use client";

import { useRef, useState } from "react";
import { MerchItem } from "@/lib/types";
import { compressImages } from "@/lib/image-compress";

const MAX_TOTAL_BYTES = 4 * 1024 * 1024;

function totalBytes(files: File[]): number {
  return files.reduce((s, f) => s + f.size, 0);
}

function formatMB(bytes: number): string {
  return (bytes / 1024 / 1024).toFixed(1) + " MB";
}

interface MerchEditModalProps {
  item: MerchItem;
  categories: string[];
  onSave: (updatedItem: MerchItem) => void;
  onClose: () => void;
}

export default function MerchEditModal({ item, categories, onSave, onClose }: MerchEditModalProps) {
  const [title, setTitle] = useState(item.title);
  const [description, setDescription] = useState(item.description);
  const [price, setPrice] = useState(item.price);
  const [category, setCategory] = useState(item.category);
  const [externalUrl, setExternalUrl] = useState(item.externalUrl ?? "");
  const [order, setOrder] = useState(item.order);
  const [images, setImages] = useState<string[]>(item.images);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const removeImage = (i: number) => setImages(images.filter((_, idx) => idx !== i));

  const moveImage = (i: number, dir: -1 | 1) => {
    const next = [...images];
    const target = i + dir;
    if (target < 0 || target >= next.length) return;
    [next[i], next[target]] = [next[target], next[i]];
    setImages(next);
  };

  const removeNewFile = (i: number) => setNewFiles(newFiles.filter((_, idx) => idx !== i));

  const handleSave = async () => {
    if (images.length === 0 && newFiles.length === 0) {
      alert("Item must have at least one image.");
      return;
    }

    setSaving(true);

    const compressed = await compressImages(newFiles);
    const total = totalBytes(compressed);
    if (total > MAX_TOTAL_BYTES) {
      setSaving(false);
      alert(
        `Combined new-image size is ${formatMB(total)} after compression. Vercel caps uploads at ~4.5 MB per request — remove or shrink images so the total is under 4 MB.`
      );
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("category", category);
    formData.append("externalUrl", externalUrl);
    formData.append("order", String(order));
    formData.append("images", JSON.stringify(images));
    compressed.forEach((f) => formData.append("newImages", f));

    const res = await fetch(`/api/merch/${item.id}`, { method: "PUT", body: formData });
    if (res.ok) {
      const updated: MerchItem = await res.json();
      onSave(updated);
    } else {
      const body = await res.text().catch(() => "");
      alert(`Failed to save item (${res.status}): ${body || "unknown error"}`);
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-dark mb-4">Edit Merch Item</h2>

        <div className="mb-4">
          <label className="block text-sm font-medium text-dark/70 mb-2">Images</label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-2">
            {images.map((url, i) => (
              <div key={url} className="relative group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`Image ${i + 1}`}
                  className="w-full h-24 object-cover rounded border border-dark/10"
                />
                {i === 0 && (
                  <span className="absolute top-1 left-1 bg-base text-white text-[10px] px-1.5 py-0.5 rounded">
                    Cover
                  </span>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                  <button
                    onClick={() => moveImage(i, -1)}
                    className="text-white text-xs bg-black/50 px-1.5 rounded"
                  >
                    ←
                  </button>
                  <button
                    onClick={() => moveImage(i, 1)}
                    className="text-white text-xs bg-black/50 px-1.5 rounded"
                  >
                    →
                  </button>
                  <button
                    onClick={() => removeImage(i)}
                    className="text-white text-xs bg-red-500/80 px-1.5 rounded"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
            {newFiles.map((f, i) => (
              <div key={`new-${i}`} className="relative group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={URL.createObjectURL(f)}
                  alt={f.name}
                  className="w-full h-24 object-cover rounded border border-base/40"
                />
                <span className="absolute top-1 left-1 bg-amber-500 text-white text-[10px] px-1.5 py-0.5 rounded">
                  New
                </span>
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    onClick={() => removeNewFile(i)}
                    className="text-white text-xs bg-red-500/80 px-1.5 rounded"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) =>
              setNewFiles((prev) => [...prev, ...Array.from(e.target.files || [])])
            }
          />
          <button
            onClick={() => fileRef.current?.click()}
            className="text-sm px-3 py-1.5 bg-dark/5 rounded hover:bg-dark/10 transition-colors"
          >
            + Add images
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-dark/70 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-dark/20 rounded focus:outline-none focus:border-base"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-dark/70 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-dark/20 rounded focus:outline-none focus:border-base"
              >
                {!categories.includes(category) && (
                  <option value={category}>{category} (removed)</option>
                )}
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-dark/70 mb-1">Price (display)</label>
              <input
                type="text"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3 py-2 border border-dark/20 rounded focus:outline-none focus:border-base"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-dark/70 mb-1">
              External Buy URL (blank = &ldquo;Coming soon&rdquo;)
            </label>
            <input
              type="url"
              value={externalUrl}
              onChange={(e) => setExternalUrl(e.target.value)}
              className="w-full px-3 py-2 border border-dark/20 rounded focus:outline-none focus:border-base"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark/70 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-dark/20 rounded focus:outline-none focus:border-base"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark/70 mb-1">Display Order</label>
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
            disabled={saving}
            className="bg-base text-white px-6 py-2 rounded hover:bg-base-light transition-colors disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
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
