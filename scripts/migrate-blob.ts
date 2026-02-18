/**
 * Production migration: reads Jekyll artwork markdown files,
 * uploads images to Vercel Blob, and saves artworks.json to Blob.
 *
 * Usage:
 *   BLOB_READ_WRITE_TOKEN=<token> npx tsx scripts/migrate-blob.ts
 */

import { readFileSync, readdirSync, existsSync } from "fs";
import { join, basename } from "path";
import { put } from "@vercel/blob";
import { v4 as uuidv4 } from "uuid";

interface Artwork {
  id: string;
  title: string;
  category: string;
  tags: string[];
  imageUrl: string;
  thumbnailUrl?: string;
  annotation: string;
  medium: string;
  visible: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

const JEKYLL_ROOT = join(__dirname, "../../Portfolio");

const COLLECTIONS: { dir: string; category: string }[] = [
  { dir: "_illustrations", category: "illustrations" },
  { dir: "_comics", category: "comics" },
  { dir: "_graphic_design", category: "graphic_design" },
  { dir: "_sketchbook", category: "sketchbook" },
  { dir: "_visdev", category: "visdev" },
];

function parseFrontMatter(content: string): Record<string, unknown> {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};

  const fm: Record<string, unknown> = {};
  const lines = match[1].split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const kvMatch = line.match(/^(\w[\w_]*)\s*:\s*(.*)$/);
    if (kvMatch) {
      const key = kvMatch[1];
      let value: unknown = kvMatch[2].trim();

      if (
        typeof value === "string" &&
        ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'")))
      ) {
        value = (value as string).slice(1, -1);
      }

      if (value === "|") {
        const multilines: string[] = [];
        while (i + 1 < lines.length && lines[i + 1].startsWith("  ")) {
          i++;
          multilines.push(lines[i].trim());
        }
        value = multilines.join("\n");
      }

      if (typeof value === "string" && value === "") {
        const listItems: string[] = [];
        while (
          i + 1 < lines.length &&
          lines[i + 1].trim().startsWith("- ")
        ) {
          i++;
          listItems.push(lines[i].trim().slice(2));
        }
        if (listItems.length > 0) {
          value = listItems;
        }
      }

      fm[key] = value;
    }
  }
  return fm;
}

function titleFromFilename(filename: string): string {
  return basename(filename, ".md")
    .replace(/\.jpeg$|\.png$|\.jpg$/i, "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function getContentType(name: string): string {
  if (name.endsWith(".png")) return "image/png";
  if (name.endsWith(".jpeg") || name.endsWith(".jpg")) return "image/jpeg";
  return "application/octet-stream";
}

async function main() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error("Error: BLOB_READ_WRITE_TOKEN env var is required.");
    console.error("Usage: BLOB_READ_WRITE_TOKEN=<token> npx tsx scripts/migrate-blob.ts");
    process.exit(1);
  }

  const artworks: Artwork[] = [];
  const now = new Date().toISOString();

  for (const { dir, category } of COLLECTIONS) {
    const collectionDir = join(JEKYLL_ROOT, dir);
    if (!existsSync(collectionDir)) {
      console.log(`Skipping ${dir} (not found)`);
      continue;
    }

    const files = readdirSync(collectionDir).filter((f) => f.endsWith(".md"));
    console.log(`\nProcessing ${dir}: ${files.length} files`);

    for (const file of files) {
      const content = readFileSync(join(collectionDir, file), "utf-8");
      const fm = parseFrontMatter(content);

      const imagePath = fm.image_path as string;
      if (!imagePath) {
        console.log(`  Skipping ${file} (no image_path)`);
        continue;
      }

      const localImagePath = join(JEKYLL_ROOT, imagePath);
      if (!existsSync(localImagePath)) {
        console.log(`  Image not found: ${localImagePath}`);
        continue;
      }

      const imageName = basename(localImagePath);
      console.log(`  Uploading ${imageName}...`);

      const fileBuffer = readFileSync(localImagePath);
      const blob = await put(`artworks/${imageName}`, fileBuffer, {
        access: "public",
        contentType: getContentType(imageName),
      });

      const description = fm.description;
      const annotation =
        typeof description === "string"
          ? description
          : Array.isArray(description)
            ? description.join(", ")
            : "";

      artworks.push({
        id: uuidv4(),
        title: titleFromFilename(file),
        category,
        tags: [],
        imageUrl: blob.url,
        annotation,
        medium: (fm.medium as string) || "",
        visible: true,
        order: typeof fm.order === "string" ? parseInt(fm.order, 10) : (fm.order as number) || 0,
        createdAt: now,
        updatedAt: now,
      });

      console.log(`    -> ${blob.url}`);
    }
  }

  console.log(`\nSaving artworks.json to Vercel Blob (${artworks.length} entries)...`);
  const jsonBlob = await put("artworks.json", JSON.stringify(artworks, null, 2), {
    access: "public",
    addRandomSuffix: false,
  });
  console.log(`  -> ${jsonBlob.url}`);
  console.log("\nMigration complete!");
}

main().catch(console.error);
