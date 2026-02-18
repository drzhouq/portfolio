"use client";

import { useState, useEffect, useCallback } from "react";
import { Artwork } from "@/lib/types";
import ArtworkUploader from "@/components/admin/ArtworkUploader";
import ArtworkTable from "@/components/admin/ArtworkTable";

export default function AdminDashboard() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchArtworks = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/artworks");
    const data = await res.json();
    setArtworks(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchArtworks();
  }, [fetchArtworks]);

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-dark mb-8">Admin Dashboard</h1>

      <div className="space-y-8">
        <ArtworkUploader onUploaded={fetchArtworks} />

        <div>
          <h2 className="text-xl font-bold text-dark mb-4">
            Manage Artworks ({artworks.length})
          </h2>
          {loading ? (
            <p className="text-dark/50">Loading...</p>
          ) : (
            <ArtworkTable artworks={artworks} onRefresh={fetchArtworks} />
          )}
        </div>
      </div>
    </div>
  );
}
