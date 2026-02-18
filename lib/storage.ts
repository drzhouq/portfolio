import { Artwork } from './types';
import { readFileSync, writeFileSync, existsSync, mkdirSync, unlinkSync } from 'fs';
import { join } from 'path';

const USE_BLOB = !!process.env.BLOB_READ_WRITE_TOKEN;

// Local file paths
const DATA_DIR = join(process.cwd(), 'data');
const ARTWORKS_JSON = join(DATA_DIR, 'artworks.json');
const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads');

function ensureDirs() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  if (!existsSync(UPLOAD_DIR)) mkdirSync(UPLOAD_DIR, { recursive: true });
}

// --- Local storage ---

function getArtworksLocal(): Artwork[] {
  ensureDirs();
  if (!existsSync(ARTWORKS_JSON)) return [];
  return JSON.parse(readFileSync(ARTWORKS_JSON, 'utf-8'));
}

function saveArtworksLocal(artworks: Artwork[]): void {
  ensureDirs();
  writeFileSync(ARTWORKS_JSON, JSON.stringify(artworks, null, 2));
}

async function uploadImageLocal(file: File): Promise<string> {
  ensureDirs();
  const bytes = await file.arrayBuffer();
  const filename = `${Date.now()}-${file.name}`;
  const filepath = join(UPLOAD_DIR, filename);
  writeFileSync(filepath, Buffer.from(bytes));
  return `/uploads/${filename}`;
}

function deleteImageLocal(url: string): void {
  if (url.startsWith('/uploads/')) {
    const filepath = join(process.cwd(), 'public', url);
    if (existsSync(filepath)) unlinkSync(filepath);
  }
}

// --- Vercel Blob storage ---

async function getArtworksBlob(): Promise<Artwork[]> {
  const { list } = await import('@vercel/blob');
  const { blobs } = await list({ prefix: 'artworks.json' });
  if (blobs.length === 0) return [];
  const response = await fetch(blobs[0].url);
  return await response.json();
}

async function saveArtworksBlob(artworks: Artwork[]): Promise<void> {
  const { put } = await import('@vercel/blob');
  await put('artworks.json', JSON.stringify(artworks, null, 2), {
    access: 'public',
    addRandomSuffix: false,
  });
}

async function uploadImageBlob(file: File): Promise<string> {
  const { put } = await import('@vercel/blob');
  const blob = await put(`artworks/${Date.now()}-${file.name}`, file, {
    access: 'public',
  });
  return blob.url;
}

async function deleteImageBlob(url: string): Promise<void> {
  const { del } = await import('@vercel/blob');
  try { await del(url); } catch { /* may already be deleted */ }
}

// --- Exports (pick local vs blob based on env) ---

export async function getArtworks(): Promise<Artwork[]> {
  if (USE_BLOB) return getArtworksBlob();
  return getArtworksLocal();
}

export async function saveArtworks(artworks: Artwork[]): Promise<void> {
  if (USE_BLOB) return saveArtworksBlob(artworks);
  saveArtworksLocal(artworks);
}

export async function uploadImage(file: File): Promise<string> {
  if (USE_BLOB) return uploadImageBlob(file);
  return uploadImageLocal(file);
}

export async function deleteImage(url: string): Promise<void> {
  if (USE_BLOB) return deleteImageBlob(url);
  deleteImageLocal(url);
}
