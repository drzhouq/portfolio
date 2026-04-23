import { Artwork, SiteSettings } from './types';

const DEFAULT_SETTINGS: SiteSettings = { showAnnotations: true };

const isDev = process.env.NODE_ENV === 'development';

// --- Cloudflare R2 storage ---

function getCloudflareEnv(): { PORTFOLIO_BUCKET: R2Bucket; R2_PUBLIC_URL?: string } {
  const { getCloudflareContext } = require('@opennextjs/cloudflare');
  const ctx = getCloudflareContext();
  return ctx.env;
}

function getBucket(): R2Bucket {
  return getCloudflareEnv().PORTFOLIO_BUCKET;
}

async function getSettingsR2(): Promise<SiteSettings> {
  const bucket = getBucket();
  const obj = await bucket.get('settings.json');
  if (!obj) return DEFAULT_SETTINGS;
  const text = await obj.text();
  return { ...DEFAULT_SETTINGS, ...JSON.parse(text) };
}

async function saveSettingsR2(settings: SiteSettings): Promise<void> {
  const bucket = getBucket();
  await bucket.put('settings.json', JSON.stringify(settings, null, 2), {
    httpMetadata: { contentType: 'application/json' },
  });
}

async function getArtworksR2(): Promise<Artwork[]> {
  const bucket = getBucket();
  const obj = await bucket.get('artworks.json');
  if (!obj) return [];
  const text = await obj.text();
  return JSON.parse(text);
}

async function saveArtworksR2(artworks: Artwork[]): Promise<void> {
  const bucket = getBucket();
  await bucket.put('artworks.json', JSON.stringify(artworks, null, 2), {
    httpMetadata: { contentType: 'application/json' },
  });
}

async function uploadImageR2(file: File): Promise<string> {
  const bucket = getBucket();
  const key = `artworks/${Date.now()}-${file.name}`;
  const bytes = await file.arrayBuffer();
  await bucket.put(key, bytes, {
    httpMetadata: { contentType: file.type },
  });
  // Build the public URL using the R2_PUBLIC_URL env var set in wrangler config
  const publicUrl = getCloudflareEnv().R2_PUBLIC_URL || '';
  return `${publicUrl}/${key}`;
}

async function deleteImageR2(url: string): Promise<void> {
  try {
    const bucket = getBucket();
    // Extract the key from the full URL by finding the path after the domain
    const urlObj = new URL(url);
    const key = urlObj.pathname.startsWith('/') ? urlObj.pathname.slice(1) : urlObj.pathname;
    await bucket.delete(key);
  } catch {
    /* may already be deleted */
  }
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
  const raw = isDev ? await (await getLocalModule()).getArtworksLocal() : await getArtworksR2();
  return backfillDefaults(raw);
}

export async function saveArtworks(artworks: Artwork[]): Promise<void> {
  if (isDev) {
    const local = await getLocalModule();
    return local.saveArtworksLocal(artworks);
  }
  return saveArtworksR2(artworks);
}

export async function uploadImage(file: File): Promise<string> {
  if (isDev) {
    const local = await getLocalModule();
    return local.uploadImageLocal(file);
  }
  return uploadImageR2(file);
}

export async function getSettings(): Promise<SiteSettings> {
  if (isDev) {
    const local = await getLocalModule();
    return { ...DEFAULT_SETTINGS, ...local.getSettingsLocal() };
  }
  return getSettingsR2();
}

export async function saveSettings(settings: SiteSettings): Promise<void> {
  if (isDev) {
    const local = await getLocalModule();
    return local.saveSettingsLocal(settings);
  }
  return saveSettingsR2(settings);
}

export async function deleteImage(url: string): Promise<void> {
  if (isDev) {
    const local = await getLocalModule();
    return local.deleteImageLocal(url);
  }
  return deleteImageR2(url);
}
