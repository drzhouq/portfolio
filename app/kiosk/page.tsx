"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Artwork, KioskConfig } from "@/lib/types";

const transitionVariants = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.8, ease: "easeInOut" as const },
  },
  crossfade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 1.2, ease: "easeInOut" as const },
  },
  slide: {
    initial: { x: "100%", opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: "-100%", opacity: 0 },
    transition: { duration: 0.6, ease: "easeInOut" as const },
  },
};

export default function KioskPage() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [config, setConfig] = useState<Pick<KioskConfig, "intervalSeconds" | "showOverlay" | "showDescription" | "transition"> | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [started, setStarted] = useState(false);
  const [paused, setPaused] = useState(false);
  const [cursorHidden, setCursorHidden] = useState(false);
  const cursorTimerRef = useRef<ReturnType<typeof setTimeout>>();

  // Fetch kiosk data
  useEffect(() => {
    fetch(`/api/kiosk?t=${Date.now()}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (data.configured) {
          setArtworks(data.artworks);
          setConfig(data.config);
        }
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  // Preload next image
  useEffect(() => {
    if (artworks.length < 2) return;
    const nextIndex = (currentIndex + 1) % artworks.length;
    const img = new Image();
    img.src = artworks[nextIndex].imageUrl;
  }, [currentIndex, artworks]);

  // Auto-advance
  useEffect(() => {
    if (!started || paused || !config || artworks.length === 0) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % artworks.length);
    }, config.intervalSeconds * 1000);
    return () => clearInterval(timer);
  }, [started, paused, config, artworks.length]);

  // Keyboard controls
  useEffect(() => {
    if (!started) return;
    const handleKey = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowRight":
        case " ":
          if (e.key === " ") {
            e.preventDefault();
            setPaused((p) => !p);
          } else {
            setCurrentIndex((prev) => (prev + 1) % artworks.length);
          }
          break;
        case "ArrowLeft":
          setCurrentIndex((prev) => (prev - 1 + artworks.length) % artworks.length);
          break;
        case "Escape":
          if (document.fullscreenElement) {
            document.exitFullscreen();
          }
          break;
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [started, artworks.length]);

  // Hide cursor after inactivity
  useEffect(() => {
    if (!started) return;
    const handleMove = () => {
      setCursorHidden(false);
      clearTimeout(cursorTimerRef.current);
      cursorTimerRef.current = setTimeout(() => setCursorHidden(true), 3000);
    };
    handleMove();
    document.addEventListener("mousemove", handleMove);
    return () => {
      document.removeEventListener("mousemove", handleMove);
      clearTimeout(cursorTimerRef.current);
    };
  }, [started]);

  // Lock body scroll when started
  useEffect(() => {
    if (started) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [started]);

  const handleStart = () => {
    setStarted(true);
    const el = document.documentElement;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (el.requestFullscreen?.() || (el as any).webkitRequestFullscreen?.())?.catch(() => {});
  };

  if (!loaded) {
    return (
      <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center">
        <p className="text-white/50 text-lg">Loading...</p>
      </div>
    );
  }

  if (!config || artworks.length === 0) {
    return (
      <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center">
        <p className="text-white/50 text-lg">No kiosk presentation configured.</p>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center gap-6">
        <img
          src="/images/logos/arislogodark.svg"
          alt="Aris Zhou"
          className="w-20 h-20 invert"
        />
        <h1 className="text-white text-4xl font-bold">Kiosk Presentation</h1>
        <p className="text-white/50">{artworks.length} artwork{artworks.length !== 1 ? "s" : ""}</p>
        <button
          onClick={handleStart}
          className="px-8 py-3 bg-base text-white text-lg rounded-lg hover:bg-base-light transition-colors"
        >
          Click to Start
        </button>
        <p className="text-white/30 text-sm mt-4">
          Space: pause/resume &middot; Arrows: navigate &middot; Esc: exit fullscreen
        </p>
      </div>
    );
  }

  const currentArtwork = artworks[currentIndex];
  const variant = transitionVariants[config.transition] || transitionVariants.fade;
  const animatePresenceMode = config.transition === "crossfade" ? "sync" : "wait";

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-black overflow-hidden ${cursorHidden ? "cursor-none" : ""}`}
    >
      <AnimatePresence mode={animatePresenceMode}>
        <motion.div
          key={currentArtwork.id}
          initial={variant.initial}
          animate={variant.animate}
          exit={variant.exit}
          transition={variant.transition}
          className="absolute inset-0 flex items-center justify-center"
        >
          <img
            src={currentArtwork.imageUrl}
            alt={currentArtwork.title}
            className="w-full h-full object-contain"
          />
          {config.showOverlay && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent pt-20 pb-8 px-8">
              <h2 className="text-white text-3xl font-bold">{currentArtwork.title}</h2>
              {currentArtwork.medium && (
                <p className="text-white/60 text-sm mt-1">{currentArtwork.medium}</p>
              )}
              {config.showDescription && currentArtwork.annotation && (
                <p className="text-white/80 text-lg mt-2 max-w-2xl whitespace-pre-line">
                  {currentArtwork.annotation}
                </p>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Progress dots */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
        {artworks.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`w-2 h-2 rounded-full transition-colors ${
              i === currentIndex ? "bg-white" : "bg-white/30"
            }`}
          />
        ))}
      </div>

      {/* Pause indicator */}
      {paused && (
        <div className="absolute top-6 right-6 text-white/50 text-sm z-10">
          PAUSED
        </div>
      )}

      {/* Slide counter */}
      <div className="absolute top-6 left-6 text-white/30 text-sm z-10">
        {currentIndex + 1} / {artworks.length}
      </div>
    </div>
  );
}
