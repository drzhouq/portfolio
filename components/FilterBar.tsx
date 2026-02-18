"use client";

import { motion } from "framer-motion";

interface FilterBarProps {
  tags: string[];
  activeTag: string;
  onTagChange: (tag: string) => void;
}

export default function FilterBar({
  tags,
  activeTag,
  onTagChange,
}: FilterBarProps) {
  const allTags = ["All", ...tags];

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {allTags.map((tag) => (
        <motion.button
          key={tag}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onTagChange(tag === "All" ? "" : tag)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            (tag === "All" && !activeTag) || activeTag === tag
              ? "bg-base text-white"
              : "bg-dark/10 text-dark hover:bg-dark/20"
          }`}
        >
          {tag}
        </motion.button>
      ))}
    </div>
  );
}
