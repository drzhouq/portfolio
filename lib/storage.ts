import { readFile, writeFile, mkdir, unlink, access } from 'fs/promises';
import { join } from 'path';
import { Artwork, SiteSettings } from './types';

const DATA_DIR = join(process.cwd(), 'data');
const ARTWORKS_JSON = join(DATA_DIR, 'artworks.json');
const SETTINGS_JSON = join(DATA_DIR, 'settings.json');
const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads');

const DEFAULT_SETTINGS: SiteSettings = { showAnnotations: true };

async function ensureDirs() {
  await mkdir(DATA_DIR, { recursive: true });
  await mkdir(UPLOAD_DIR, { recursive: true });
}

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

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
  await ensureDirs();
  if (!(await fileExists(ARTWORKS_JSON))) return [];
  const raw: Artwork[] = JSON.parse(await readFile(ARTWORKS_JSON, 'utf-8'));
  return backfillDefaults(raw);
}

export async function saveArtworks(artworks: Artwork[]): Promise<void> {
  await ensureDirs();
  await writeFile(ARTWORKS_JSON, JSON.stringify(artworks, null, 2));
}

export async function getSettings(): Promise<SiteSettings> {
  await ensureDirs();
  if (!(await fileExists(SETTINGS_JSON))) return DEFAULT_SETTINGS;
  const data = JSON.parse(await readFile(SETTINGS_JSON, 'utf-8'));
  return { ...DEFAULT_SETTINGS, ...data };
}

export async function saveSettings(settings: SiteSettings): Promise<void> {
  await ensureDirs();
  await writeFile(SETTINGS_JSON, JSON.stringify(settings, null, 2));
}

export async function uploadImage(file: File): Promise<string> {
  await ensureDirs();
  const bytes = await file.arrayBuffer();
  const filename = `${Date.now()}-${file.name}`;
  const filepath = join(UPLOAD_DIR, filename);
  await writeFile(filepath, Buffer.from(bytes));
  return `/uploads/${filename}`;
}

export async function deleteImage(url: string): Promise<void> {
  if (url.startsWith('/uploads/')) {
    const filepath = join(process.cwd(), 'public', url);
    if (await fileExists(filepath)) {
      await unlink(filepath);
    }
  }
}
