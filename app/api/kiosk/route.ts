import { NextResponse } from 'next/server';
import { getSettings, getArtworks } from '@/lib/storage';

export const dynamic = 'force-dynamic';

export async function GET() {
  const settings = await getSettings();
  const kiosk = settings.kiosk;

  if (!kiosk || kiosk.artworkIds.length === 0) {
    return NextResponse.json({ configured: false, artworks: [], config: null });
  }

  const allArtworks = await getArtworks();
  const artworkMap = new Map(allArtworks.filter((a) => a.visible).map((a) => [a.id, a]));
  const orderedArtworks = kiosk.artworkIds.map((id) => artworkMap.get(id)).filter(Boolean);

  return NextResponse.json({
    configured: true,
    artworks: orderedArtworks,
    config: {
      intervalSeconds: kiosk.intervalSeconds,
      showOverlay: kiosk.showOverlay,
      showDescription: kiosk.showDescription ?? false,
      transition: kiosk.transition,
    },
  });
}
