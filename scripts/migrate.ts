/**
 * Local migration script: reads Jekyll artwork markdown files,
 * copies images to public/artworks/, and generates data/artworks.json.
 *
 * Usage: npx tsx scripts/migrate.ts
 */

import { readFileSync, readdirSync, existsSync, mkdirSync, copyFileSync, writeFileSync } from "fs";
import { join, basename } from "path";
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
  views: number;
  totalViewTimeMs: number;
  hearts: number;
  lastViewedAt: string | null;
}

const PROJECT_ROOT = join(__dirname, "..");
const JEKYLL_ROOT = join(__dirname, "../../Portfolio");
const PUBLIC_ARTWORKS = join(PROJECT_ROOT, "public", "artworks");
const DATA_DIR = join(PROJECT_ROOT, "data");

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

      // Handle quoted strings
      if (
        typeof value === "string" &&
        ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'")))
      ) {
        value = (value as string).slice(1, -1);
      }

      // Handle multiline (|)
      if (value === "|") {
        const multilines: string[] = [];
        while (i + 1 < lines.length && lines[i + 1].startsWith("  ")) {
          i++;
          multilines.push(lines[i].trim());
        }
        value = multilines.join("\n");
      }

      // Handle list (-)
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

function main() {
  // Ensure output dirs
  mkdirSync(PUBLIC_ARTWORKS, { recursive: true });
  mkdirSync(DATA_DIR, { recursive: true });

  const artworks: Artwork[] = [];
  const now = new Date().toISOString();

  for (const { dir, category } of COLLECTIONS) {
    const collectionDir = join(JEKYLL_ROOT, dir);
    if (!existsSync(collectionDir)) {
      console.log(`Skipping ${dir} (not found)`);
      continue;
    }

    const files = readdirSync(collectionDir).filter((f) => f.endsWith(".md"));
    console.log(`Processing ${dir}: ${files.length} files`);

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

      // Copy image to public/artworks/
      const imageName = basename(localImagePath);
      const destPath = join(PUBLIC_ARTWORKS, imageName);
      console.log(`  Copying ${imageName}...`);
      copyFileSync(localImagePath, destPath);

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
        imageUrl: `/artworks/${imageName}`,
        annotation,
        medium: (fm.medium as string) || "",
        visible: true,
        order: typeof fm.order === "string" ? parseInt(fm.order, 10) : (fm.order as number) || 0,
        createdAt: now,
        updatedAt: now,
        views: 0,
        totalViewTimeMs: 0,
        hearts: 0,
        lastViewedAt: null,
      });
    }
  }

  // Write artworks.json
  const outPath = join(DATA_DIR, "artworks.json");
  writeFileSync(outPath, JSON.stringify(artworks, null, 2));
  console.log(`\nSaved ${artworks.length} artworks to ${outPath}`);
  console.log("Migration complete!");
}

main();
