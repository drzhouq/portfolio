import { NextRequest, NextResponse } from 'next/server';
import { getMerch, saveMerch, uploadImage, deleteImage } from '@/lib/storage';
import { verifyAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAdmin = await verifyAuth();
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const items = await getMerch();
  const index = items.findIndex((m) => m.id === id);

  if (index === -1) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const contentType = request.headers.get('content-type') || '';
  let updates: Record<string, unknown>;

  if (contentType.includes('multipart/form-data')) {
    const formData = await request.formData();
    updates = {};

    const fields = ['title', 'description', 'price', 'category'] as const;
    for (const f of fields) {
      const v = formData.get(f);
      if (v !== null) updates[f] = v as string;
    }
    if (formData.has('externalUrl')) {
      const v = (formData.get('externalUrl') as string).trim();
      updates.externalUrl = v === '' ? null : v;
    }
    if (formData.has('visible')) updates.visible = formData.get('visible') !== 'false';
    if (formData.has('order')) updates.order = Number(formData.get('order'));

    if (formData.has('images')) {
      try {
        updates.images = JSON.parse(formData.get('images') as string);
      } catch {
        return NextResponse.json({ error: 'Invalid images list' }, { status: 400 });
      }
    }

    const newFiles = formData.getAll('newImages').filter((v) => typeof v !== 'string') as File[];
    if (newFiles.length > 0) {
      const newUrls: string[] = [];
      for (const file of newFiles) {
        newUrls.push(await uploadImage(file, 'merch'));
      }
      const existing = (updates.images as string[] | undefined) ?? items[index].images;
      updates.images = [...existing, ...newUrls];
    }
  } else {
    updates = await request.json();
  }

  const previous = items[index];
  items[index] = {
    ...previous,
    ...updates,
    id: previous.id,
    updatedAt: new Date().toISOString(),
  };

  if (Array.isArray(updates.images)) {
    const newSet = new Set(updates.images as string[]);
    const removed = previous.images.filter((url) => !newSet.has(url));
    await Promise.all(removed.map((url) => deleteImage(url)));
  }

  await saveMerch(items);
  return NextResponse.json(items[index]);
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
  const items = await getMerch();
  const item = items.find((m) => m.id === id);

  if (!item) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  await Promise.all(item.images.map((url) => deleteImage(url)));
  const remaining = items.filter((m) => m.id !== id);
  await saveMerch(remaining);

  return NextResponse.json({ success: true });
}
