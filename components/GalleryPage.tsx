"use client";

import { useState, useEffect, useMemo } from "react";
import { Artwork, GalleryLayout } from "@/lib/types";
import Gallery from "./Gallery";
import FilterBar from "./FilterBar";

interface GalleryPageProps {
  category: Artwork["category"];
}

export default function GalleryPage({ category }: GalleryPageProps) {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [activeTag, setActiveTag] = useState("");
  const [loading, setLoading] = useState(true);
  const [layout, setLayout] = useState<GalleryLayout>("masonry");

  useEffect(() => {
    Promise.all([
      fetch(`/api/artworks?t=${Date.now()}`, { cache: "no-store" }).then((r) => r.json()),
      fetch(`/api/settings?t=${Date.now()}`, { cache: "no-store" }).then((r) => r.json()),
    ]).then(([data, settings]) => {
      setArtworks((data as Artwork[]).filter((a) => a.category === category));
      setLayout(settings.galleryLayout ?? "masonry");
      setLoading(false);
    });
  }, [category]);

  const tags = useMemo(() => {
    const allTags = artworks.flatMap((a) => a.tags);
    return Array.from(new Set(allTags)).filter(Boolean);
  }, [artworks]);

  const filtered = activeTag
    ? artworks.filter((a) => a.tags.includes(activeTag))
    : artworks;

  if (loading) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 py-8">
        <div className="text-center text-dark/50 py-16">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-8">
      {tags.length > 0 && (
        <FilterBar tags={tags} activeTag={activeTag} onTagChange={setActiveTag} />
      )}
      <Gallery artworks={filtered} layout={layout} />
    </div>
  );
}
