"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Artwork } from "@/lib/types";

interface GalleryModalProps {
  artwork: Artwork;
  onClose: () => void;
}

export default function GalleryModal({ artwork, onClose }: GalleryModalProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

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
            {artwork.medium && (
              <p className="text-white/70 text-sm mb-2">{artwork.medium}</p>
            )}
            {artwork.annotation && (
              <p className="text-white/80 text-sm leading-relaxed">
                {artwork.annotation}
              </p>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
