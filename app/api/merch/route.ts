import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getMerch, saveMerch, uploadImage } from '@/lib/storage';
import { verifyAuth } from '@/lib/auth';
import type { MerchItem } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const items = await getMerch();
    const isAdmin = await verifyAuth();

    const headers = { 'Cache-Control': 'no-store, no-cache, must-revalidate' };

    if (isAdmin) {
      return NextResponse.json(items, { headers });
    }

    return NextResponse.json(items.filter((m) => m.visible), { headers });
  } catch (error) {
    console.error('GET /api/merch error:', error);
    return NextResponse.json({ error: 'Failed to fetch merch' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const isAdmin = await verifyAuth();
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const files = formData.getAll('images').filter((v): v is File => v instanceof File);
  if (files.length === 0) {
    return NextResponse.json({ error: 'At least one image required' }, { status: 400 });
  }

  const imageUrls: string[] = [];
  for (const file of files) {
    imageUrls.push(await uploadImage(file, 'merch'));
  }

  const externalUrlRaw = (formData.get('externalUrl') as string) || '';
  const now = new Date().toISOString();
  const items = await getMerch();

  const newItem: MerchItem = {
    id: uuidv4(),
    title: (formData.get('title') as string) || files[0].name.replace(/\.[^.]+$/, ''),
    description: (formData.get('description') as string) || '',
    price: (formData.get('price') as string) || '',
    category: (formData.get('category') as string) || 'other',
    images: imageUrls,
    externalUrl: externalUrlRaw.trim() === '' ? null : externalUrlRaw.trim(),
    visible: formData.get('visible') !== 'false',
    order: items.length,
    createdAt: now,
    updatedAt: now,
  };

  items.push(newItem);
  await saveMerch(items);

  return NextResponse.json(newItem, { status: 201 });
}
