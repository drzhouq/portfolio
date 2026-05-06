// Tuned to keep each image well under Vercel's ~4.5 MB function request cap.
// When we move off Vercel (or switch merch uploads to direct-to-Blob client
// uploads), relax these — ideally pass originals through untouched so prints
// and originals retain full resolution.
const MAX_EDGE = 2000;
const QUALITY = 0.85;
const SKIP_THRESHOLD_BYTES = 1.5 * 1024 * 1024;

export async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith('image/')) return file;
  if (file.size <= SKIP_THRESHOLD_BYTES) return file;

  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) return file;

  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const targetW = Math.round(bitmap.width * scale);
  const targetH = Math.round(bitmap.height * scale);

  const canvas =
    typeof OffscreenCanvas !== 'undefined'
      ? new OffscreenCanvas(targetW, targetH)
      : Object.assign(document.createElement('canvas'), { width: targetW, height: targetH });

  const ctx = (canvas as HTMLCanvasElement | OffscreenCanvas).getContext('2d');
  if (!ctx) return file;
  (ctx as CanvasRenderingContext2D).drawImage(bitmap, 0, 0, targetW, targetH);
  bitmap.close();

  const blob: Blob =
    canvas instanceof OffscreenCanvas
      ? await canvas.convertToBlob({ type: 'image/jpeg', quality: QUALITY })
      : await new Promise((resolve, reject) =>
          (canvas as HTMLCanvasElement).toBlob(
            (b) => (b ? resolve(b) : reject(new Error('toBlob failed'))),
            'image/jpeg',
            QUALITY
          )
        );

  if (blob.size >= file.size) return file;

  const newName = file.name.replace(/\.[^.]+$/, '') + '.jpg';
  return new File([blob], newName, { type: 'image/jpeg', lastModified: Date.now() });
}

export async function compressImages(files: File[]): Promise<File[]> {
  return Promise.all(files.map(compressImage));
}
