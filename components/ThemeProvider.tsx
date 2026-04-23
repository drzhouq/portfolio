"use client";

import { useEffect } from "react";

const FONT_MAP: Record<string, string> = {
  "Baloo 2": "'Baloo 2', sans-serif",
  "Inter": "'Inter', sans-serif",
  "Lato": "'Lato', sans-serif",
  "Poppins": "'Poppins', sans-serif",
  "Nunito": "'Nunito', sans-serif",
  "Open Sans": "'Open Sans', sans-serif",
  "Roboto": "'Roboto', sans-serif",
  "Merriweather": "'Merriweather', serif",
  "Playfair Display": "'Playfair Display', serif",
};

export const AVAILABLE_FONTS = Object.keys(FONT_MAP);

export default function ThemeProvider() {
  useEffect(() => {
    fetch(`/api/settings?t=${Date.now()}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((s) => {
        const root = document.documentElement;

        const spacing = s.headerSpacing ?? 80;
        root.style.setProperty("--header-spacing", `${spacing}px`);

        const font = s.siteFont || "Baloo 2";
        const fontStack = FONT_MAP[font] || FONT_MAP["Baloo 2"];
        root.style.setProperty("--site-font", fontStack);

        // Load the Google Font if not already loaded
        if (font !== "Baloo 2") {
          const id = `gfont-${font.replace(/\s+/g, "-")}`;
          if (!document.getElementById(id)) {
            const link = document.createElement("link");
            link.id = id;
            link.rel = "stylesheet";
            link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(font)}:wght@400;500;600;700&display=swap`;
            document.head.appendChild(link);
          }
        }
      })
      .catch(() => {});
  }, []);

  return null;
}
