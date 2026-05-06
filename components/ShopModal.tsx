"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MerchItem } from "@/lib/types";

interface ShopModalProps {
  item: MerchItem;
  onClose: () => void;
}

export default function ShopModal({ item, onClose }: ShopModalProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setActiveIndex((i) => Math.min(i + 1, item.images.length - 1));
      if (e.key === "ArrowLeft") setActiveIndex((i) => Math.max(i - 1, 0));
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [item.images.length, onClose]);

  const hasBuyLink = !!item.externalUrl;

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
          className="relative max-w-5xl w-full max-h-[90vh] flex flex-col md:flex-row gap-6 items-start"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute -top-10 right-0 text-white text-3xl hover:text-base-light transition-colors"
            aria-label="Close"
          >
            &times;
          </button>

          {/* Image carousel */}
          <div className="flex-1 flex flex-col items-center gap-3 max-w-2xl">
            <div className="relative w-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.images[activeIndex]}
                alt={`${item.title} ${activeIndex + 1}`}
                className="max-h-[70vh] w-full object-contain rounded"
              />
              {item.images.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveIndex((i) => Math.max(i - 1, 0))}
                    disabled={activeIndex === 0}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full w-10 h-10 flex items-center justify-center transition-colors disabled:opacity-30"
                    aria-label="Previous image"
                  >
                    ‹
                  </button>
                  <button
                    onClick={() => setActiveIndex((i) => Math.min(i + 1, item.images.length - 1))}
                    disabled={activeIndex === item.images.length - 1}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full w-10 h-10 flex items-center justify-center transition-colors disabled:opacity-30"
                    aria-label="Next image"
                  >
                    ›
                  </button>
                </>
              )}
            </div>
            {item.images.length > 1 && (
              <div className="flex gap-2 flex-wrap justify-center">
                {item.images.map((url, i) => (
                  <button
                    key={url}
                    onClick={() => setActiveIndex(i)}
                    className={`w-14 h-14 rounded overflow-hidden border-2 transition-colors ${
                      i === activeIndex ? "border-base" : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="text-white flex-shrink-0 max-w-sm w-full">
            <span className="inline-block text-xs uppercase tracking-wide bg-white/10 px-2 py-1 rounded mb-2">
              {item.category}
            </span>
            <h3 className="text-2xl font-bold mb-1">{item.title}</h3>
            {item.price && <p className="text-base-light text-lg font-semibold mb-3">{item.price}</p>}
            {item.description && (
              <p className="text-white/80 text-sm leading-relaxed mb-4 whitespace-pre-line">
                {item.description}
              </p>
            )}
            {hasBuyLink ? (
              <a
                href={item.externalUrl!}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-base text-white px-6 py-3 rounded-md font-semibold hover:bg-base-light transition-colors"
              >
                Buy ↗
              </a>
            ) : (
              <button
                disabled
                className="inline-block bg-white/10 text-white/60 px-6 py-3 rounded-md font-semibold cursor-not-allowed"
              >
                Coming soon
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
