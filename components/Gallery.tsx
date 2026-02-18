"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Artwork } from "@/lib/types";
import GalleryModal from "./GalleryModal";

interface GalleryProps {
  artworks: Artwork[];
}

export default function Gallery({ artworks }: GalleryProps) {
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);

  const sorted = [...artworks].sort((a, b) => a.order - b.order);

  return (
    <>
      <div className="gallery-grid">
        {sorted.map((artwork, i) => (
          <motion.div
            key={artwork.id}
            className="gallery-item cursor-pointer group"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            onClick={() => setSelectedArtwork(artwork)}
          >
            <div className="relative overflow-hidden bg-[#f0f0f0]">
              <img
                src={artwork.imageUrl}
                alt={artwork.title}
                className="w-full block transition-transform duration-400 group-hover:scale-[1.02]"
                loading="lazy"
              />
              {artwork.title && (
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-end">
                  <span className="text-white p-3 opacity-0 group-hover:opacity-100 transition-opacity text-sm font-semibold">
                    {artwork.title}
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {selectedArtwork && (
        <GalleryModal
          artwork={selectedArtwork}
          onClose={() => setSelectedArtwork(null)}
        />
      )}
    </>
  );
}
