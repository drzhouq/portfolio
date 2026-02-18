"use client";

import { useState, useRef } from "react";
import { Artwork } from "@/lib/types";

interface ArtworkUploaderProps {
  onUploaded: () => void;
}

const categories: Artwork["category"][] = [
  "illustrations",
  "comics",
  "graphic_design",
  "sketchbook",
  "visdev",
];

export default function ArtworkUploader({ onUploaded }: ArtworkUploaderProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [category, setCategory] = useState<Artwork["category"]>("illustrations");
  const [title, setTitle] = useState("");
  const [medium, setMedium] = useState("");
  const [annotation, setAnnotation] = useState("");
  const [tags, setTags] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith("image/")
    );
    setFiles(droppedFiles);
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    setUploading(true);
    setProgress(0);

    for (let i = 0; i < files.length; i++) {
      const formData = new FormData();
      formData.append("image", files[i]);
      formData.append("category", category);
      formData.append(
        "title",
        files.length === 1 ? title : files[i].name.replace(/\.[^.]+$/, "")
      );
      formData.append("medium", medium);
      formData.append("annotation", annotation);
      formData.append("tags", tags);

      await fetch("/api/artworks", { method: "POST", body: formData });
      setProgress(Math.round(((i + 1) / files.length) * 100));
    }

    setFiles([]);
    setTitle("");
    setMedium("");
    setAnnotation("");
    setTags("");
    setUploading(false);
    onUploaded();
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow">
      <h2 className="text-xl font-bold text-dark mb-4">Upload Artwork</h2>

      {/* Drop zone */}
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
          onChange={(e) => setFiles(Array.from(e.target.files || []))}
        />
        {files.length > 0 ? (
          <p className="text-base font-medium">
            {files.length} file{files.length > 1 ? "s" : ""} selected
          </p>
        ) : (
          <p className="text-dark/50">
            Drag & drop images here, or click to browse
          </p>
        )}
      </div>

      {/* Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-dark/70 mb-1">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-dark/20 rounded focus:outline-none focus:border-base"
            placeholder="Artwork title"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-dark/70 mb-1">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Artwork["category"])}
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
            placeholder="e.g. Digital Illustration - Procreate"
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
            placeholder="digital, traditional"
          />
        </div>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-dark/70 mb-1">
          Annotation
        </label>
        <textarea
          value={annotation}
          onChange={(e) => setAnnotation(e.target.value)}
          className="w-full px-3 py-2 border border-dark/20 rounded focus:outline-none focus:border-base"
          rows={3}
          placeholder="Artist notes or description"
        />
      </div>

      {/* Upload button */}
      <button
        onClick={handleUpload}
        disabled={files.length === 0 || uploading}
        className="bg-base text-white px-6 py-2 rounded hover:bg-base-light transition-colors disabled:opacity-50"
      >
        {uploading ? `Uploading... ${progress}%` : "Upload"}
      </button>
    </div>
  );
}
