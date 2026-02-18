import { readFileSync, writeFileSync, existsSync, mkdirSync, unlinkSync } from 'fs';
import { join } from 'path';
import { Artwork } from './types';

const DATA_DIR = join(process.cwd(), 'data');
const ARTWORKS_JSON = join(DATA_DIR, 'artworks.json');
const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads');

function ensureDirs() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  if (!existsSync(UPLOAD_DIR)) mkdirSync(UPLOAD_DIR, { recursive: true });
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

export async function uploadImageLocal(file: File): Promise<string> {
  ensureDirs();
  const bytes = await file.arrayBuffer();
  const filename = `${Date.now()}-${file.name}`;
  const filepath = join(UPLOAD_DIR, filename);
  writeFileSync(filepath, Buffer.from(bytes));
  return `/uploads/${filename}`;
}

export function deleteImageLocal(url: string): void {
  if (url.startsWith('/uploads/')) {
    const filepath = join(process.cwd(), 'public', url);
    if (existsSync(filepath)) unlinkSync(filepath);
  }
}
