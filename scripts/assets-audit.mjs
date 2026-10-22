/*
  Binary asset integrity gate.

  Four committed assets in this repository were silently truncated at ~28-30 KB — a hero
  video, two hospital images, and the social-card source art. Nothing failed loudly; the
  pages just rendered wrong. This check reads each file's own container metadata and
  verifies the bytes on disk match what the format declares, so the same class of
  corruption fails the build instead of shipping.

  Run: node scripts/assets-audit.mjs
*/
import { readFile, readdir } from "node:fs/promises";
import { join, extname, relative } from "node:path";

const roots = ["public", "assets"];
const failures = [];
const checked = [];

function verify(path, buffer) {
  const ext = extname(path).toLowerCase();

  if (ext === ".png") {
    if (buffer.subarray(0, 8).toString("hex") !== "89504e470d0a1a0a") return "not a PNG";
    // The final chunk must be IEND; its 12 bytes sit at the very end of a complete file.
    if (!buffer.subarray(-12).includes(Buffer.from("IEND"))) return "truncated (no IEND chunk)";
    return null;
  }

  if (ext === ".webp") {
    if (buffer.toString("ascii", 0, 4) !== "RIFF") return "not a RIFF/WebP";
    const declared = buffer.readUInt32LE(4) + 8;
    if (declared !== buffer.length) return `truncated (RIFF declares ${declared}, file is ${buffer.length})`;
    return null;
  }

  if (ext === ".jpg" || ext === ".jpeg") {
    if (buffer.readUInt16BE(0) !== 0xffd8) return "not a JPEG";
    if (buffer.readUInt16BE(buffer.length - 2) !== 0xffd9) return "truncated (no EOI marker)";
    return null;
  }

  if (ext === ".mp4" || ext === ".m4v") {
    let offset = 0;
    const boxes = [];
    while (offset + 8 <= buffer.length) {
      const size = buffer.readUInt32BE(offset);
      const type = buffer.toString("ascii", offset + 4, offset + 8);
      boxes.push(type);
      if (size < 8) return `malformed box "${type}" at ${offset}`;
      if (offset + size > buffer.length) return `truncated (box "${type}" needs ${offset + size}, file is ${buffer.length})`;
      offset += size;
    }
    if (offset !== buffer.length) return `truncated (boxes end at ${offset}, file is ${buffer.length})`;
    if (!boxes.includes("moov")) return "no moov box";
    return null;
  }

  if (ext === ".ico") {
    if (buffer.readUInt16LE(0) !== 0 || buffer.readUInt16LE(2) !== 1) return "not an ICO";
    const count = buffer.readUInt16LE(4);
    for (let i = 0; i < count; i++) {
      const entry = 6 + i * 16;
      const size = buffer.readUInt32LE(entry + 8);
      const offset = buffer.readUInt32LE(entry + 12);
      if (offset + size > buffer.length) return `truncated (image ${i} needs ${offset + size}, file is ${buffer.length})`;
    }
    return null;
  }

  if (ext === ".svg") {
    const text = buffer.toString("utf8");
    if (!/<svg[\s>]/i.test(text)) return "no <svg> root";
    if (!/<\/svg>\s*$/i.test(text.trimEnd())) return "truncated (no closing </svg>)";
    return null;
  }

  return null;
}

async function walk(dir) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(full);
      continue;
    }
    if (!/\.(png|webp|jpe?g|mp4|m4v|ico|svg)$/i.test(entry.name)) continue;
    const buffer = await readFile(full);
    const problem = verify(full, buffer);
    const rel = relative(process.cwd(), full).replaceAll("\\", "/");
    checked.push(rel);
    if (problem) failures.push(`${rel}: ${problem}`);
  }
}

for (const root of roots) await walk(root);

if (failures.length) {
  console.error(`Asset audit failed — ${failures.length} damaged file(s):`);
  for (const failure of failures) console.error(`  ${failure}`);
  process.exit(1);
}
console.log(`Asset audit passed. ${checked.length} binary assets intact.`);
