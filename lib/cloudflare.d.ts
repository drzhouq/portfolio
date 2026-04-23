/**
 * Minimal Cloudflare R2 type declarations used by lib/storage.ts.
 * These avoid pulling in @cloudflare/workers-types globally, which
 * conflicts with DOM types (e.g. Response.json() return type).
 */

interface R2PutOptions {
  httpMetadata?: { contentType?: string };
}

interface R2Object {
  text(): Promise<string>;
  arrayBuffer(): Promise<ArrayBuffer>;
}

interface R2Bucket {
  get(key: string): Promise<R2Object | null>;
  put(key: string, value: string | ArrayBuffer | ReadableStream, options?: R2PutOptions): Promise<R2Object>;
  delete(key: string): Promise<void>;
}
