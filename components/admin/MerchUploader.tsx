"use client";

import { useState, useRef } from "react";
import { compressImages } from "@/lib/image-compress";

const MAX_TOTAL_BYTES = 4 * 1024 * 1024;

function totalBytes(files: File[]): number {
  return files.reduce((s, f) => s + f.size, 0);
}

function formatMB(bytes: number): string {
  return (bytes / 1024 / 1024).toFixed(1) + " MB";
}

interface MerchUploaderProps {
  categories: string[];
  onUploaded: () => void;
}

export default function MerchUploader({ categories, onUploaded }: MerchUploaderProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState(categories[0] ?? "");
  const [externalUrl, setExternalUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const dropped = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/"));
    setFiles((prev) => [...prev, ...dropped]);
  };

  const removeFile = (i: number) => setFiles(files.filter((_, idx) => idx !== i));

  const moveFile = (i: number, dir: -1 | 1) => {
    const next = [...files];
    const target = i + dir;
    if (target < 0 || target >= next.length) return;
    [next[i], next[target]] = [next[target], next[i]];
    setFiles(next);
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    setUploading(true);

    const compressed = await compressImages(files);
    const total = totalBytes(compressed);
    if (total > MAX_TOTAL_BYTES) {
      setUploading(false);
      alert(
        `Combined image size is ${formatMB(total)} after compression. Vercel caps uploads at ~4.5 MB per request — please remove or shrink images so the total is under 4 MB.`
      );
      return;
    }

    const formData = new FormData();
    compressed.forEach((f) => formData.append("images", f));
    formData.append("title", title || files[0].name.replace(/\.[^.]+$/, ""));
    formData.append("description", description);
    formData.append("price", price);
    formData.append("category", category);
    formData.append("externalUrl", externalUrl);

    const res = await fetch("/api/merch", { method: "POST", body: formData });
    setUploading(false);

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      alert(`Upload failed (${res.status}): ${body || "unknown error"}`);
      return;
    }

    setFiles([]);
    setTitle("");
    setDescription("");
    setPrice("");
    setExternalUrl("");
    onUploaded();
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow">
      <h2 className="text-xl font-bold text-dark mb-4">Add Merch Item</h2>

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
        className="border-2 border-dashed border-dark/20 rounded-lg p-8 text-center cursor-pointer hover:border-base transition-colors mb-4"
      >
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => setFiles((prev) => [...prev, ...Array.from(e.target.files || [])])}
        />
        {files.length > 0 ? (
          <p className="text-base font-medium">
            {files.length} image{files.length > 1 ? "s" : ""} ready (first is the cover)
          </p>
        ) : (
          <p className="text-dark/50">Drag & drop product images here, or click to browse</p>
        )}
      </div>

      {files.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-4">
          {files.map((f, i) => (
            <div key={i} className="relative group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={URL.createObjectURL(f)}
                alt={f.name}
                className="w-full h-24 object-cover rounded border border-dark/10"
              />
              {i === 0 && (
                <span className="absolute top-1 left-1 bg-base text-white text-[10px] px-1.5 py-0.5 rounded">
                  Cover
                </span>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                <button
                  onClick={() => moveFile(i, -1)}
                  className="text-white text-xs bg-black/50 px-1.5 rounded"
                >
                  ←
                </button>
                <button
                  onClick={() => moveFile(i, 1)}
                  className="text-white text-xs bg-black/50 px-1.5 rounded"
                >
                  →
                </button>
                <button
                  onClick={() => removeFile(i)}
                  className="text-white text-xs bg-red-500/80 px-1.5 rounded"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-dark/70 mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-dark/20 rounded focus:outline-none focus:border-base"
            placeholder="Product title"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-dark/70 mb-1">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 border border-dark/20 rounded focus:outline-none focus:border-base"
          >
            {categories.length === 0 && <option value="">— add categories first —</option>}
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
            placeholder='e.g. "$25", "from $30", "Sold out"'
            className="w-full px-3 py-2 border border-dark/20 rounded focus:outline-none focus:border-base"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-dark/70 mb-1">
            External Buy URL (leave blank for &ldquo;Coming soon&rdquo;)
          </label>
          <input
            type="url"
            value={externalUrl}
            onChange={(e) => setExternalUrl(e.target.value)}
            placeholder="https://etsy.com/listing/..."
            className="w-full px-3 py-2 border border-dark/20 rounded focus:outline-none focus:border-base"
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-dark/70 mb-1">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-dark/20 rounded focus:outline-none focus:border-base"
          placeholder="Materials, dimensions, story behind it..."
        />
      </div>

      <button
        onClick={handleUpload}
        disabled={files.length === 0 || uploading || !category}
        className="bg-base text-white px-6 py-2 rounded hover:bg-base-light transition-colors disabled:opacity-50"
      >
        {uploading ? "Uploading..." : "Add Item"}
      </button>
    </div>
  );
}
