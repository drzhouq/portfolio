# Merch Section — Design

**Status:** Approved. Ready for implementation planning.

## Decisions made

- **Purchase flow:** Option B — catalog with external "Buy" link per item (e.g., Etsy/Gumroad/Big Cartel). No on-site checkout, no Stripe, no inventory.
- **Stay on Vercel for now.** Migration off Vercel is a separate project.
- **Multiple images per merch item.** First image is cover; rest form a small gallery in detail view.
- **Field list confirmed:** title, description, price (display string), images (multiple), external URL, category, visible toggle, sort order.
- **Categories are admin-editable**, not a fixed enum. Default seeded list: `prints, stickers, keychains, apparel`. Stored in `SiteSettings.merchCategories: string[]`.
- **Public route:** `/shop`, nav label "Shop".
- **Editable shop intro copy:** Yes. New `shopIntro` field in `SiteSettings`, managed in the **About Me** admin tab.

## Data model

```ts
export interface MerchItem {
  id: string;
  title: string;
  description: string;          // multi-line
  price: string;                // display string: "$25", "from $30", "Sold out"
  category: string;             // free-form string, validated against SiteSettings.merchCategories
  images: string[];             // 1+ URLs; images[0] is cover
  externalUrl: string | null;   // null = "coming soon"
  visible: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}
```

Add to `SiteSettings`:
```ts
merchCategories?: string[];     // default: ['prints', 'stickers', 'keychains', 'apparel']
shopIntro?: string;             // displayed at top of /shop
```

- `price` is a string (no math, but flexible for "from $X" / "Sold out").
- `externalUrl` nullable so items can be drafted before the storefront listing exists.
- `category` is a free-form string. Admin UI presents a dropdown of `merchCategories` plus an "add new" option that appends to settings.
- If an item references a category that was later removed, it still saves and renders; the filter bar just won't surface it under that category.

## Storage

- `merch.json` blob (or `data/merch.json` locally) — same dual-mode pattern as artworks.
- Image uploads land under `merch/` prefix in Vercel Blob.
- Generalize existing `uploadImage(file)` to `uploadImage(file, prefix)`; default `artworks/` for backwards compat.

## API routes

Mirrors artworks API:
- `GET /api/merch` — list (admin: all; public: `visible: true` only).
- `POST /api/merch` — create (multipart: fields + images).
- `PUT /api/merch/[id]` — update.
- `DELETE /api/merch/[id]` — delete (cleans up Blob images).

No analytics endpoint.

`merchCategories` and `shopIntro` flow through existing `/api/settings`.

## Admin UI

New **"Merch"** tab in admin dashboard, between "Art Pieces" and "About Me". Components mirror artwork admin:
- `MerchUploader` — fields + multi-image drag-drop with reorder/remove. Category dropdown reads from settings; includes "+ Add new category" inline.
- `MerchTable` — cover thumb, title, price, category, visible toggle, edit/delete, drag-to-reorder.
- `MerchEditModal` — edit fields + manage image gallery.

Category management lives inline in the Merch tab (above the table) — list of category strings with add/rename/delete. Deleting a category does NOT cascade to items.

`shopIntro` editor goes in the About Me tab (multi-line textarea).

## Public `/shop` page

- New route `/shop`, added to header nav between existing entries.
- Layout: heading + `shopIntro` copy → category filter (`FilterBar` pattern, populated from `merchCategories`) → grid of cards (cover, title, price, category badge).
- Click card → modal (like `GalleryModal`) with image carousel, full description, price, and prominent "Buy" button → opens `externalUrl` in new tab. If `externalUrl` is null, button reads "Coming soon" and is disabled.

## Out of scope (deliberate)

- No cart, no checkout, no Stripe.
- No inventory tracking.
- No variants (sizes/colors) — handled by external storefront.
- No orders, no customer accounts.
- No analytics on merch.

## Existing patterns to mirror

- `lib/types.ts` — `Artwork` interface
- `lib/storage.ts` — dual Blob/local storage
- `app/api/artworks/route.ts` — GET/POST pattern
- `app/api/artworks/[id]/route.ts` — PUT/DELETE pattern
- `components/admin/ArtworkUploader.tsx`, `ArtworkTable.tsx`, `ArtworkEditModal.tsx`
- `components/GalleryPage.tsx`, `GalleryModal.tsx`, `FilterBar.tsx`
- `app/admin/page.tsx` — tab structure
- `components/Header.tsx` — nav links
