import { NextRequest, NextResponse } from 'next/server';
import { getArtworks, saveArtworks } from '@/lib/storage';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { event } = body;

  const artworks = await getArtworks();
  const index = artworks.findIndex((a) => a.id === id);

  if (index === -1) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  if (event === 'view') {
    artworks[index].views += 1;
    artworks[index].lastViewedAt = new Date().toISOString();
  } else if (event === 'view_time') {
    const viewTimeMs = Number(body.viewTimeMs);
    if (viewTimeMs > 0) {
      artworks[index].totalViewTimeMs += viewTimeMs;
    }
  } else if (event === 'heart') {
    artworks[index].hearts += 1;
  } else {
    return NextResponse.json({ error: 'Invalid event' }, { status: 400 });
  }

  await saveArtworks(artworks);
  return NextResponse.json({ success: true });
}
