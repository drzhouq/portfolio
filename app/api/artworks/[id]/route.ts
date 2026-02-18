import { NextRequest, NextResponse } from 'next/server';
import { getArtworks, saveArtworks, deleteImage } from '@/lib/storage';
import { verifyAuth } from '@/lib/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAdmin = await verifyAuth();
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const updates = await request.json();
  const artworks = await getArtworks();
  const index = artworks.findIndex((a) => a.id === id);

  if (index === -1) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  artworks[index] = {
    ...artworks[index],
    ...updates,
    id: artworks[index].id, // prevent id override
    updatedAt: new Date().toISOString(),
  };

  await saveArtworks(artworks);
  return NextResponse.json(artworks[index]);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAdmin = await verifyAuth();
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const artworks = await getArtworks();
  const artwork = artworks.find((a) => a.id === id);

  if (!artwork) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  await deleteImage(artwork.imageUrl);
  const updated = artworks.filter((a) => a.id !== id);
  await saveArtworks(updated);

  return NextResponse.json({ success: true });
}
