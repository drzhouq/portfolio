# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Illustration portfolio website for Aris Zhou, built with Next.js 14 (App Router), React 18, TypeScript, and Tailwind CSS. Deployed on Vercel.

## Commands

- `npm run dev` — Start dev server (localhost:3000)
- `npm run build` — Production build
- `npm run lint` — ESLint
- `npx tsx scripts/migrate-blob.ts` — Migrate local data to Vercel Blob

## Architecture

### Storage Layer (lib/storage.ts)

Dual-mode storage abstracted behind a single interface:
- **Production**: Vercel Blob (`@vercel/blob`) — activated when `BLOB_READ_WRITE_TOKEN` env var is set
- **Local dev**: JSON files in `data/` directory via `lib/storage-local.ts` (lazy-imported to avoid fs in production)

Artworks and settings are stored as JSON blobs (`artworks.json`, `settings.json`). Images go to `artworks/` prefix in Blob storage or `public/uploads/` locally.

### Auth

Simple password-based admin auth using `ADMIN_PASSWORD` env var. SHA-256 hashed token stored in `admin_session` cookie. Auth is enforced in two places:
- `middleware.ts` — protects `/admin/*` routes and mutating `/api/*` endpoints
- `lib/auth.ts` — server-side helpers (`verifyAuth`, `setAuthCookie`) used in API routes

Public POST to `/api/artworks/[id]/analytics` is exempt from auth (tracks views/hearts).

### Route Structure

- `/` — Illustrations gallery (default category)
- `/comics`, `/sketchbook` — Category-specific galleries (all use `GalleryPage` component)
- `/about` — About page
- `/admin` — Admin dashboard (artwork CRUD, settings)
- `/admin/login` — Login page
- `/api/artworks` — GET (list), POST (create with image upload)
- `/api/artworks/[id]` — PUT (update), DELETE
- `/api/artworks/[id]/analytics` — POST (public, view/heart tracking)
- `/api/auth` — POST (login)
- `/api/settings` — GET, PUT

### Key Patterns

- **Path alias**: `@/*` maps to project root
- **Client-side data fetching**: `GalleryPage` fetches artworks client-side with cache-busting (`?t=Date.now()`)
- **API routes** use `export const dynamic = 'force-dynamic'` to disable caching
- **Artwork categories**: `illustrations`, `comics`, `graphic_design`, `sketchbook`, `visdev` (defined in `lib/types.ts`)
- **Custom Tailwind theme**: Brand colors (`base`, `dark`, `beige`, `aris`), Baloo 2 font family, `xs` breakpoint at 480px
- **Framer Motion** used for gallery animations
