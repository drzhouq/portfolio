"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Artwork } from "@/lib/types";
import SharePopover from "./SharePopover";

interface GalleryModalProps {
  artwork: Artwork;
  onClose: () => void;
  showAnnotations?: boolean;
}

export default function GalleryModal({ artwork, onClose, showAnnotations = true }: GalleryModalProps) {
  const openTimeRef = useRef(Date.now());
  const [hearted, setHearted] = useState(false);

  useEffect(() => {
    const key = `hearted_${artwork.id}`;
    setHearted(localStorage.getItem(key) === "true");
  }, [artwork.id]);

  useEffect(() => {
    // Record view
    fetch(`/api/artworks/${artwork.id}/analytics`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "view" }),
    }).catch(() => {});

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";

      // Record view time
      const elapsed = Date.now() - openTimeRef.current;
      if (elapsed > 0) {
        navigator.sendBeacon(
          `/api/artworks/${artwork.id}/analytics`,
          new Blob(
            [JSON.stringify({ event: "view_time", viewTimeMs: elapsed })],
            { type: "application/json" }
          )
        );
      }
    };
  }, [artwork.id, onClose]);

  const handleHeart = () => {
    if (hearted) return;
    setHearted(true);
    localStorage.setItem(`hearted_${artwork.id}`, "true");
    fetch(`/api/artworks/${artwork.id}/analytics`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "heart" }),
    }).catch(() => {});
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[1000] bg-black/90 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="relative max-w-5xl max-h-[90vh] flex flex-col md:flex-row gap-6 items-start"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute -top-10 right-0 text-white text-3xl hover:text-base-light transition-colors"
          >
            &times;
          </button>
          <img
            src={artwork.imageUrl}
            alt={artwork.title}
            className="max-h-[80vh] max-w-full object-contain rounded"
          />
          <div className="text-white flex-shrink-0 max-w-xs">
            <h3 className="text-2xl font-bold mb-2">{artwork.title}</h3>
            {showAnnotations && artwork.medium && (
              <p className="text-white/70 text-sm mb-2">{artwork.medium}</p>
            )}
            {showAnnotations && artwork.annotation && (
              <p className="text-white/80 text-sm leading-relaxed mb-4 whitespace-pre-line">
                {artwork.annotation}
              </p>
            )}
            <div className="flex items-center gap-3">
              <motion.button
                onClick={handleHeart}
                whileTap={hearted ? {} : { scale: 1.3 }}
                className="flex items-center gap-1.5 text-white/70 hover:text-white transition-colors"
                aria-label={hearted ? "Already hearted" : "Heart this artwork"}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill={hearted ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth={hearted ? 0 : 1.5}
                  className={`w-6 h-6 transition-colors ${hearted ? "text-red-400" : ""}`}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                  />
                </svg>
              </motion.button>
              <SharePopover
                artworkTitle={artwork.title}
                artworkUrl={typeof window !== "undefined" ? `${window.location.origin}?artwork=${artwork.id}` : ""}
              />
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
