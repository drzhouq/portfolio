"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { MerchItem } from "@/lib/types";
import ShopModal from "./ShopModal";

export default function ShopPage() {
  const [items, setItems] = useState<MerchItem[]>([]);
  const [intro, setIntro] = useState<string>("");
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<MerchItem | null>(null);

  useEffect(() => {
    fetch(`/api/merch?t=${Date.now()}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((data: MerchItem[]) => {
        setItems(data);
        setLoading(false);
      });

    fetch(`/api/settings?t=${Date.now()}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((s) => {
        setIntro(s.shopIntro ?? "");
        setCategories(s.merchCategories ?? []);
      })
      .catch(() => {});
  }, []);

  const usedCategories = useMemo(() => {
    const fromItems = Array.from(new Set(items.map((m) => m.category)));
    const ordered = categories.filter((c) => fromItems.includes(c));
    const orphans = fromItems.filter((c) => !categories.includes(c));
    return [...ordered, ...orphans];
  }, [items, categories]);

  const filtered = useMemo(() => {
    const visible = [...items].sort((a, b) => a.order - b.order);
    return activeCategory ? visible.filter((m) => m.category === activeCategory) : visible;
  }, [items, activeCategory]);

  if (loading) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 py-8">
        <div className="text-center text-dark/50 py-16">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-dark mb-2">Shop</h1>
        {intro && (
          <p className="text-dark/70 max-w-2xl whitespace-pre-line">{intro}</p>
        )}
      </div>

      {usedCategories.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveCategory("")}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeCategory === ""
                ? "bg-base text-white"
                : "bg-dark/10 text-dark hover:bg-dark/20"
            }`}
          >
            All
          </motion.button>
          {usedCategories.map((cat) => (
            <motion.button
              key={cat}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors capitalize ${
                activeCategory === cat
                  ? "bg-base text-white"
                  : "bg-dark/10 text-dark hover:bg-dark/20"
              }`}
            >
              {cat}
            </motion.button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="text-center text-dark/50 py-16">
          {items.length === 0 ? "Nothing here yet — stay tuned!" : "No items in this category."}
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {filtered.map((item) => (
            <motion.button
              key={item.id}
              onClick={() => setSelected(item)}
              whileHover={{ y: -4 }}
              className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow text-left flex flex-col"
            >
              <div className="aspect-square bg-dark/5 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.images[0]}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform hover:scale-105"
                />
              </div>
              <div className="p-3 flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-wide text-dark/50">
                  {item.category}
                </span>
                <h3 className="font-semibold text-dark text-sm line-clamp-2">{item.title}</h3>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-base-light font-semibold text-sm">
                    {item.price || "—"}
                  </span>
                  {!item.externalUrl && (
                    <span className="text-[10px] text-dark/40 italic">Coming soon</span>
                  )}
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      )}

      {selected && <ShopModal item={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
