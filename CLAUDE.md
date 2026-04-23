# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Illustration portfolio website for Aris Zhou, built with Next.js 14 (App Router), React 18, TypeScript, and Tailwind CSS. Deployed on a VPS via Coolify (Docker).

## Commands

- `npm run dev` — Start dev server (localhost:3000)
- `npm run build` — Production build
- `npm run lint` — ESLint
- `docker compose up --build` — Build and run locally with Docker

## Architecture

### Storage Layer (lib/storage.ts)

Local file storage using `fs/promises`:
- JSON data files (`artworks.json`, `settings.json`) in `data/` directory
- Uploaded images in `public/uploads/`
- Directories are created automatically if they don't exist
- Data and uploads are persisted via Docker volumes in production

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
