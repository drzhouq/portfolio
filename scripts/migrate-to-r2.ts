/**
 * One-shot data migration: Vercel Blob -> Cloudflare R2.
 *
 * Copies the three JSON stores (artworks/settings/merch) and every image they
 * reference from Vercel Blob into the R2 bucket, rewriting image URLs from the
 * Vercel Blob host to your R2 public host so the live site keeps working.
 *
 * Reads are plain public-URL fetches (no Vercel API token needed). Writes go
 * through the Wrangler CLI, so you must be logged in (`wrangler login`) and the
 * bucket must already exist (`wrangler r2 bucket create portfolio-assets`).
 *
 * Usage (from the deploy/cloudflare worktree):
 *
 *   BLOB_PUBLIC_BASE_URL="https://<id>.public.blob.vercel-storage.com" \
 *   R2_PUBLIC_URL="https://pub-xxxx.r2.dev" \
 *   R2_BUCKET="portfolio-assets" \
 *   npx tsx scripts/migrate-to-r2.ts          # add --dry-run to preview
 *
 * BLOB_PUBLIC_BASE_URL can be omitted if BLOB_READ_WRITE_TOKEN is set instead
 * (the host is derived from the token, same as lib/storage.ts on main).
 */

import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const DRY_RUN = process.argv.includes("--dry-run");
const JSON_FILES = ["artworks.json", "settings.json", "merch.json"];

function vercelBase(): string {
  const explicit = process.env.BLOB_PUBLIC_BASE_URL;
  if (explicit) return explicit.replace(/\/+$/, "");
  const token = process.env.BLOB_READ_WRITE_TOKEN ?? "";
  const storeId = token.split("_")[3] ?? "";
  if (!storeId) {
    throw new Error(
      "Set BLOB_PUBLIC_BASE_URL (or BLOB_READ_WRITE_TOKEN) so the source host is known.",
    );
  }
  return `https://${storeId}.public.blob.vercel-storage.com`;
}

function r2Base(): string {
  const url = process.env.R2_PUBLIC_URL;
  if (!url) throw new Error("Set R2_PUBLIC_URL to your bucket's public host (https://pub-xxxx.r2.dev).");
  return url.replace(/\/+$/, "");
}

function contentTypeFor(key: string): string {
  const ext = key.toLowerCase().split(".").pop() ?? "";
  const map: Record<string, string> = {
    json: "application/json",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    webp: "image/webp",
    gif: "image/gif",
    svg: "image/svg+xml",
    avif: "image/avif",
  };
  return map[ext] ?? "application/octet-stream";
}

function putToR2(bucket: string, key: string, body: Buffer, contentType: string) {
  if (DRY_RUN) {
    console.log(`  [dry-run] would put ${bucket}/${key} (${body.length} bytes, ${contentType})`);
    return;
  }
  const dir = mkdtempSync(join(tmpdir(), "r2mig-"));
  const tmp = join(dir, key.replace(/[\/]/g, "_"));
  try {
    writeFileSync(tmp, body);
    execFileSync(
      "npx",
      ["wrangler", "r2", "object", "put", `${bucket}/${key}`, "--file", tmp, "--content-type", contentType, "--remote"],
      { stdio: ["ignore", "ignore", "inherit"] },
    );
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

async function fetchBuffer(url: string): Promise<Buffer | null> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return null;
  return Buffer.from(await res.arrayBuffer());
}

async function main() {
  const SRC = vercelBase();
  const DST = r2Base();
  const BUCKET = process.env.R2_BUCKET ?? "portfolio-assets";

  console.log(`Source (Vercel Blob): ${SRC}`);
  console.log(`Target (R2 public)  : ${DST}`);
  console.log(`R2 bucket           : ${BUCKET}`);
  console.log(DRY_RUN ? "MODE: dry-run (no writes)\n" : "MODE: live\n");

  // Collect every image key referenced across all JSON files, and remember the
  // rewritten text to upload afterwards.
  const imageKeys = new Set<string>();
  const rewritten: { name: string; text: string }[] = [];
  const urlRe = new RegExp(`${SRC.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/([^"'\\s\\\\]+)`, "g");

  for (const name of JSON_FILES) {
    const buf = await fetchBuffer(`${SRC}/${name}`);
    if (!buf) {
      console.log(`- ${name}: not found in Blob, skipping`);
      continue;
    }
    const text = buf.toString("utf8");
    let m: RegExpExecArray | null;
    while ((m = urlRe.exec(text)) !== null) {
      if (!JSON_FILES.includes(m[1])) imageKeys.add(m[1]);
    }
    urlRe.lastIndex = 0;
    rewritten.push({ name, text: text.split(SRC).join(DST) });
    console.log(`- ${name}: loaded (${buf.length} bytes)`);
  }

  console.log(`\nImages to migrate: ${imageKeys.size}`);
  let ok = 0,
    miss = 0;
  for (const key of imageKeys) {
    const buf = await fetchBuffer(`${SRC}/${key}`);
    if (!buf) {
      console.log(`  ! MISSING ${key}`);
      miss++;
      continue;
    }
    putToR2(BUCKET, key, buf, contentTypeFor(key));
    ok++;
    if (ok % 10 === 0) console.log(`  ...${ok} images done`);
  }
  console.log(`Images: ${ok} migrated, ${miss} missing\n`);

  for (const { name, text } of rewritten) {
    putToR2(BUCKET, name, Buffer.from(text, "utf8"), "application/json");
    console.log(`- uploaded ${name} (URLs rewritten to R2)`);
  }

  console.log(`\nDone.${DRY_RUN ? " (dry-run — nothing was written)" : ""}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
