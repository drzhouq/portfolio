import { NextRequest, NextResponse } from 'next/server';
import { getSettings, saveSettings } from '@/lib/storage';

export const dynamic = 'force-dynamic';

export async function GET() {
  const settings = await getSettings();
  return NextResponse.json(settings);
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const current = await getSettings();
  const updated = { ...current, ...body };
  await saveSettings(updated);
  return NextResponse.json(updated);
}
