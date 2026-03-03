import { list, put, del } from '@vercel/blob';
import { Artwork, SiteSettings } from './types';

const USE_BLOB = !!process.env.BLOB_READ_WRITE_TOKEN;

// --- Vercel Blob storage ---

const DEFAULT_SETTINGS: SiteSettings = { showAnnotations: true };

async function getSettingsBlob(): Promise<SiteSettings> {
  const { blobs } = await list({ prefix: 'settings.json' });
  if (blobs.length === 0) return DEFAULT_SETTINGS;
  const response = await fetch(blobs[0].url);
  return { ...DEFAULT_SETTINGS, ...(await response.json()) };
}

async function saveSettingsBlob(settings: SiteSettings): Promise<void> {
  await put('settings.json', JSON.stringify(settings, null, 2), {
    access: 'public',
    addRandomSuffix: false,
  });
}

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

function backfillDefaults(artworks: Artwork[]): Artwork[] {
  return artworks.map((a) => ({
    ...a,
    views: a.views ?? 0,
    totalViewTimeMs: a.totalViewTimeMs ?? 0,
    hearts: a.hearts ?? 0,
    lastViewedAt: a.lastViewedAt ?? null,
  }));
}

export async function getArtworks(): Promise<Artwork[]> {
  const raw = USE_BLOB ? await getArtworksBlob() : await (await getLocalModule()).getArtworksLocal();
  return backfillDefaults(raw);
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

export async function getSettings(): Promise<SiteSettings> {
  if (USE_BLOB) return getSettingsBlob();
  const local = await getLocalModule();
  return { ...DEFAULT_SETTINGS, ...local.getSettingsLocal() };
}

export async function saveSettings(settings: SiteSettings): Promise<void> {
  if (USE_BLOB) return saveSettingsBlob(settings);
  const local = await getLocalModule();
  local.saveSettingsLocal(settings);
}

export async function deleteImage(url: string): Promise<void> {
  if (USE_BLOB) return deleteImageBlob(url);
  const local = await getLocalModule();
  local.deleteImageLocal(url);
}
