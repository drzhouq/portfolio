"use client";

import { useState, useMemo } from "react";
import { MerchItem } from "@/lib/types";
import MerchEditModal from "./MerchEditModal";

type SortKey = "title" | "category" | "price" | "visible" | "order";
type SortDir = "asc" | "desc";

function comparator(key: SortKey, dir: SortDir) {
  return (a: MerchItem, b: MerchItem) => {
    let cmp = 0;
    switch (key) {
      case "title":
        cmp = a.title.localeCompare(b.title);
        break;
      case "category":
        cmp = a.category.localeCompare(b.category);
        break;
      case "price":
        cmp = a.price.localeCompare(b.price);
        break;
      case "visible":
        cmp = Number(a.visible) - Number(b.visible);
        break;
      case "order":
        cmp = a.order - b.order;
        break;
    }
    return dir === "asc" ? cmp : -cmp;
  };
}

interface MerchTableProps {
  items: MerchItem[];
  categories: string[];
  onRefresh: () => void;
  onUpdate: (updated: MerchItem) => void;
}

export default function MerchTable({ items, categories, onRefresh, onUpdate }: MerchTableProps) {
  const [editing, setEditing] = useState<MerchItem | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("order");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [categoryFilter, setCategoryFilter] = useState("");

  const filtered = useMemo(
    () => (categoryFilter ? items.filter((m) => m.category === categoryFilter) : items),
    [items, categoryFilter]
  );

  const sorted = useMemo(
    () => [...filtered].sort(comparator(sortKey, sortDir)),
    [filtered, sortKey, sortDir]
  );

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const indicator = (key: SortKey) => (sortKey !== key ? null : <span className="ml-1">{sortDir === "asc" ? "↑" : "↓"}</span>);

  const thClass = "px-4 py-3 text-sm font-medium text-dark/70 cursor-pointer select-none hover:text-dark transition-colors";

  const toggleVisibility = async (item: MerchItem) => {
    const res = await fetch(`/api/merch/${item.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visible: !item.visible }),
    });
    if (res.ok) onUpdate(await res.json());
  };

  const handleDelete = async (id: string) => {
    if (deleting === id) {
      await fetch(`/api/merch/${id}`, { method: "DELETE" });
      setDeleting(null);
      onRefresh();
    } else {
      setDeleting(id);
      setTimeout(() => setDeleting(null), 3000);
    }
  };

  const moveOrder = async (item: MerchItem, direction: -1 | 1) => {
    await fetch(`/api/merch/${item.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order: item.order + direction }),
    });
    onRefresh();
  };

  return (
    <>
      <div className="flex items-center gap-3 mb-3">
        <label className="text-sm font-medium text-dark/70">Category:</label>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="border border-dark/20 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-base"
        >
          <option value="">All</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        {categoryFilter && (
          <span className="text-xs text-dark/50">
            {sorted.length} of {items.length}
          </span>
        )}
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-dark/5">
              <tr>
                <th className="px-4 py-3 text-sm font-medium text-dark/70">Cover</th>
                <th className={thClass} onClick={() => handleSort("title")}>
                  Title{indicator("title")}
                </th>
                <th className={thClass} onClick={() => handleSort("category")}>
                  Category{indicator("category")}
                </th>
                <th className={thClass} onClick={() => handleSort("price")}>
                  Price{indicator("price")}
                </th>
                <th className="px-4 py-3 text-sm font-medium text-dark/70">Buy URL</th>
                <th className={thClass} onClick={() => handleSort("visible")}>
                  Visible{indicator("visible")}
                </th>
                <th className={thClass} onClick={() => handleSort("order")}>
                  Order{indicator("order")}
                </th>
                <th className="px-4 py-3 text-sm font-medium text-dark/70">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark/10">
              {sorted.map((item) => (
                <tr key={item.id} className="hover:bg-dark/[0.02]">
                  <td className="px-4 py-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.images[0]}
                      alt={item.title}
                      className="w-16 h-16 object-cover rounded"
                    />
                  </td>
                  <td className="px-4 py-2 font-medium">{item.title}</td>
                  <td className="px-4 py-2 text-sm text-dark/70">{item.category}</td>
                  <td className="px-4 py-2 text-sm text-dark/70">{item.price || "-"}</td>
                  <td className="px-4 py-2 text-sm text-dark/70">
                    {item.externalUrl ? (
                      <a
                        href={item.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-base hover:underline truncate max-w-[160px] inline-block align-bottom"
                      >
                        link ↗
                      </a>
                    ) : (
                      <span className="text-dark/40 italic">none</span>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => toggleVisibility(item)}
                      className={`w-10 h-6 rounded-full transition-colors relative ${
                        item.visible ? "bg-base" : "bg-dark/20"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                          item.visible ? "left-[18px]" : "left-0.5"
                        }`}
                      />
                    </button>
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-1">
                      <button onClick={() => moveOrder(item, -1)} className="text-dark/50 hover:text-dark text-lg">
                        ↑
                      </button>
                      <span className="text-sm w-8 text-center">{item.order}</span>
                      <button onClick={() => moveOrder(item, 1)} className="text-dark/50 hover:text-dark text-lg">
                        ↓
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditing(item)}
                        className="text-sm px-3 py-1 bg-dark/5 rounded hover:bg-dark/10 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className={`text-sm px-3 py-1 rounded transition-colors ${
                          deleting === item.id
                            ? "bg-red-500 text-white"
                            : "bg-red-50 text-red-600 hover:bg-red-100"
                        }`}
                      >
                        {deleting === item.id ? "Confirm?" : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {items.length === 0 && (
          <p className="text-center text-dark/50 py-8">No merch items yet.</p>
        )}
      </div>

      {editing && (
        <MerchEditModal
          item={editing}
          categories={categories}
          onSave={(updated) => {
            onUpdate(updated);
            setEditing(null);
          }}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}
