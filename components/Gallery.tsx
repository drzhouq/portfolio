"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Artwork, GalleryLayout } from "@/lib/types";
import GalleryModal from "./GalleryModal";

interface GalleryProps {
  artworks: Artwork[];
  layout?: GalleryLayout;
  showAnnotations?: boolean;
}

function GalleryItem({
  artwork,
  index,
  onClick,
  className,
  imgClassName,
}: {
  artwork: Artwork;
  index: number;
  onClick: () => void;
  className?: string;
  imgClassName?: string;
}) {
  return (
    <motion.div
      className={`cursor-pointer group ${className ?? ""}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      onClick={onClick}
    >
      <div className="relative overflow-hidden bg-[#f0f0f0]">
        <img
          src={artwork.imageUrl}
          alt={artwork.title}
          className={`block transition-transform duration-400 group-hover:scale-[1.02] ${imgClassName ?? "w-full"}`}
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
  );
}

/* ── Masonry ── */
function MasonryLayout({ artworks, onSelect }: { artworks: Artwork[]; onSelect: (a: Artwork) => void }) {
  return (
    <div className="gallery-grid">
      {artworks.map((artwork, i) => (
        <GalleryItem
          key={artwork.id}
          artwork={artwork}
          index={i}
          onClick={() => onSelect(artwork)}
          className="gallery-item"
        />
      ))}
    </div>
  );
}

/* ── Grid ── */
function GridLayout({ artworks, onSelect }: { artworks: Artwork[]; onSelect: (a: Artwork) => void }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1">
      {artworks.map((artwork, i) => (
        <GalleryItem
          key={artwork.id}
          artwork={artwork}
          index={i}
          onClick={() => onSelect(artwork)}
          imgClassName="w-full aspect-square object-cover"
        />
      ))}
    </div>
  );
}

/* ── Featured ── */
function FeaturedLayout({ artworks, onSelect }: { artworks: Artwork[]; onSelect: (a: Artwork) => void }) {
  if (artworks.length === 0) return null;
  const [featured, ...rest] = artworks;
  return (
    <div className="space-y-1">
      {/* Hero */}
      <GalleryItem
        artwork={featured}
        index={0}
        onClick={() => onSelect(featured)}
        imgClassName="w-full max-h-[70vh] object-contain"
      />
      {/* Grid of remaining */}
      {rest.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1">
          {rest.map((artwork, i) => (
            <GalleryItem
              key={artwork.id}
              artwork={artwork}
              index={i + 1}
              onClick={() => onSelect(artwork)}
              imgClassName="w-full aspect-square object-cover"
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Horizontal Scroll ── */
function HorizontalLayout({ artworks, onSelect }: { artworks: Artwork[]; onSelect: (a: Artwork) => void }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-thin"
        style={{ scrollbarWidth: "thin" }}
      >
        {artworks.map((artwork, i) => (
          <GalleryItem
            key={artwork.id}
            artwork={artwork}
            index={i}
            onClick={() => onSelect(artwork)}
            className="flex-shrink-0 snap-start"
            imgClassName="h-[60vh] w-auto object-contain"
          />
        ))}
      </div>
    </div>
  );
}

/* ── Justified (row-based, fills width) ── */
function JustifiedLayout({ artworks, onSelect }: { artworks: Artwork[]; onSelect: (a: Artwork) => void }) {
  const [rows, setRows] = useState<Artwork[][]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Simple justified algorithm: assign images to rows based on aspect ratios
    // Default aspect ratio of 1.5 (3:2) for images whose dimensions are unknown
    const targetHeight = 280;
    const gap = 4;
    const containerWidth = containerRef.current?.offsetWidth ?? 1200;

    const result: Artwork[][] = [];
    let currentRow: Artwork[] = [];
    let currentWidth = 0;

    for (const artwork of artworks) {
      const aspectRatio = 1.5; // default aspect ratio
      const imgWidth = targetHeight * aspectRatio;
      currentRow.push(artwork);
      currentWidth += imgWidth + gap;

      if (currentWidth >= containerWidth) {
        result.push(currentRow);
        currentRow = [];
        currentWidth = 0;
      }
    }
    if (currentRow.length > 0) result.push(currentRow);
    setRows(result);
  }, [artworks]);

  return (
    <div ref={containerRef} className="space-y-1">
      {rows.map((row, rowIdx) => (
        <div key={rowIdx} className="flex gap-1">
          {row.map((artwork, i) => (
            <GalleryItem
              key={artwork.id}
              artwork={artwork}
              index={rowIdx * 4 + i}
              onClick={() => onSelect(artwork)}
              className="flex-1 min-w-0"
              imgClassName="w-full h-[280px] object-cover"
            />
          ))}
        </div>
      ))}
    </div>
  );
}

const layoutComponents: Record<GalleryLayout, React.FC<{ artworks: Artwork[]; onSelect: (a: Artwork) => void }>> = {
  masonry: MasonryLayout,
  grid: GridLayout,
  featured: FeaturedLayout,
  horizontal: HorizontalLayout,
  justified: JustifiedLayout,
};

export default function Gallery({ artworks, layout = "masonry", showAnnotations = true }: GalleryProps) {
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);

  const sorted = [...artworks].sort((a, b) => a.order - b.order);
  const LayoutComponent = layoutComponents[layout] || layoutComponents.masonry;

  return (
    <>
      <LayoutComponent artworks={sorted} onSelect={setSelectedArtwork} />

      {selectedArtwork && (
        <GalleryModal
          artwork={selectedArtwork}
          onClose={() => setSelectedArtwork(null)}
          showAnnotations={showAnnotations}
        />
      )}
    </>
  );
}
