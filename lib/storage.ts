import { list, put, del } from '@vercel/blob';
import { Artwork } from './types';

const USE_BLOB = !!process.env.BLOB_READ_WRITE_TOKEN;

// --- Vercel Blob storage ---

async function getArtworksBlob(): Promise<Artwork[]> {
  const { blobs } = await list({ prefix: 'artworks.json' });
  if (blobs.length === 0) return [];
  const response = await fetch(blobs[0].url);
  return await response.json();
}

async function saveArtworksBlob(artworks: Artwork[]): Promise<void> {
  await put('artworks.json', JSON.stringify(artworks, null, 2), {
    access: 'public',
    addRandomSuffix: false,
  });
}

async function uploadImageBlob(file: File): Promise<string> {
  const blob = await put(`artworks/${Date.now()}-${file.name}`, file, {
    access: 'public',
  });
  return blob.url;
}

async function deleteImageBlob(url: string): Promise<void> {
  try { await del(url); } catch { /* may already be deleted */ }
}

// --- Local storage (lazy-loaded to avoid fs import in production) ---

async function getLocalModule() {
  return await import('./storage-local');
}

// --- Exports ---

export async function getArtworks(): Promise<Artwork[]> {
  if (USE_BLOB) return getArtworksBlob();
  const local = await getLocalModule();
  return local.getArtworksLocal();
}

export async function saveArtworks(artworks: Artwork[]): Promise<void> {
  if (USE_BLOB) return saveArtworksBlob(artworks);
  const local = await getLocalModule();
  local.saveArtworksLocal(artworks);
}

export async function uploadImage(file: File): Promise<string> {
  if (USE_BLOB) return uploadImageBlob(file);
  const local = await getLocalModule();
  return local.uploadImageLocal(file);
}

export async function deleteImage(url: string): Promise<void> {
  if (USE_BLOB) return deleteImageBlob(url);
  const local = await getLocalModule();
  local.deleteImageLocal(url);
}
