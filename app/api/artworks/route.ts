import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getArtworks, saveArtworks, uploadImage } from '@/lib/storage';
import { verifyAuth } from '@/lib/auth';
import type { Artwork } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const artworks = await getArtworks();
    const isAdmin = await verifyAuth();

    if (isAdmin) {
      return NextResponse.json(artworks);
    }

    return NextResponse.json(artworks.filter((a) => a.visible));
  } catch (error) {
    console.error('GET /api/artworks error:', error);
    return NextResponse.json({ error: 'Failed to fetch artworks' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const isAdmin = await verifyAuth();
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('image') as File;
  if (!file) {
    return NextResponse.json({ error: 'No image provided' }, { status: 400 });
  }

  const imageUrl = await uploadImage(file);

  const now = new Date().toISOString();
  const artworks = await getArtworks();

  const newArtwork: Artwork = {
    id: uuidv4(),
    title: (formData.get('title') as string) || file.name.replace(/\.[^.]+$/, ''),
    category: (formData.get('category') as Artwork['category']) || 'illustrations',
    tags: formData.get('tags') ? (formData.get('tags') as string).split(',').map((t) => t.trim()) : [],
    imageUrl,
    annotation: (formData.get('annotation') as string) || '',
    medium: (formData.get('medium') as string) || '',
    visible: formData.get('visible') !== 'false',
    order: artworks.length,
    createdAt: now,
    updatedAt: now,
    views: 0,
    totalViewTimeMs: 0,
    hearts: 0,
    lastViewedAt: null,
  };

  artworks.push(newArtwork);
  await saveArtworks(artworks);

  return NextResponse.json(newArtwork, { status: 201 });
}
