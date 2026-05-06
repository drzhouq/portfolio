import { readFileSync, writeFileSync, existsSync, mkdirSync, unlinkSync } from 'fs';
import { join } from 'path';
import { Artwork, MerchItem, SiteSettings } from './types';

const DATA_DIR = join(process.cwd(), 'data');
const ARTWORKS_JSON = join(DATA_DIR, 'artworks.json');
const MERCH_JSON = join(DATA_DIR, 'merch.json');
const SETTINGS_JSON = join(DATA_DIR, 'settings.json');
const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads');

function ensureDirs(prefix?: string) {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  if (!existsSync(UPLOAD_DIR)) mkdirSync(UPLOAD_DIR, { recursive: true });
  if (prefix) {
    const sub = join(UPLOAD_DIR, prefix);
    if (!existsSync(sub)) mkdirSync(sub, { recursive: true });
  }
}

export function getArtworksLocal(): Artwork[] {
  ensureDirs();
  if (!existsSync(ARTWORKS_JSON)) return [];
  return JSON.parse(readFileSync(ARTWORKS_JSON, 'utf-8'));
}

export function saveArtworksLocal(artworks: Artwork[]): void {
  ensureDirs();
  writeFileSync(ARTWORKS_JSON, JSON.stringify(artworks, null, 2));
}

export function getMerchLocal(): MerchItem[] {
  ensureDirs();
  if (!existsSync(MERCH_JSON)) return [];
  return JSON.parse(readFileSync(MERCH_JSON, 'utf-8'));
}

export function saveMerchLocal(items: MerchItem[]): void {
  ensureDirs();
  writeFileSync(MERCH_JSON, JSON.stringify(items, null, 2));
}

export function getSettingsLocal(): SiteSettings {
  ensureDirs();
  if (!existsSync(SETTINGS_JSON)) return { showAnnotations: true };
  return JSON.parse(readFileSync(SETTINGS_JSON, 'utf-8'));
}

export function saveSettingsLocal(settings: SiteSettings): void {
  ensureDirs();
  writeFileSync(SETTINGS_JSON, JSON.stringify(settings, null, 2));
}

export async function uploadImageLocal(file: File, prefix: string = 'artworks'): Promise<string> {
  ensureDirs(prefix);
  const bytes = await file.arrayBuffer();
  const filename = `${Date.now()}-${file.name}`;
  const filepath = join(UPLOAD_DIR, prefix, filename);
  writeFileSync(filepath, Buffer.from(bytes));
  return `/uploads/${prefix}/${filename}`;
}

export function deleteImageLocal(url: string): void {
  if (url.startsWith('/uploads/')) {
    const filepath = join(process.cwd(), 'public', url);
    if (existsSync(filepath)) unlinkSync(filepath);
  }
}
