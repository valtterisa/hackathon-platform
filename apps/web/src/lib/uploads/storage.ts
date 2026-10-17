import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { createId } from "@/lib/ids";

const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

const MAX_BYTES = 8 * 1024 * 1024;

export function getUploadRoot() {
  return (
    process.env.UPLOAD_DIR?.trim() ||
    path.join(process.cwd(), ".data", "uploads")
  );
}

function getPublicAppUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.BETTER_AUTH_URL ??
    "http://localhost:3000"
  ).replace(/\/$/, "");
}

function sanitizeFilename(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

export type StoredUpload = {
  id: string;
  filename: string;
  mimeType: string;
  bytes: number;
  path: string;
  url: string;
};

/**
 * Persist a base64 (or data-URL) image for MCP / organizer uploads.
 * Files are owned by `userId` under `{UPLOAD_DIR}/{userId}/…`.
 */
export async function storeImageUpload(input: {
  userId: string;
  dataBase64: string;
  mimeType: string;
  filename?: string | null;
}): Promise<StoredUpload> {
  const mimeType = input.mimeType.trim().toLowerCase();
  if (!ALLOWED_MIME.has(mimeType)) {
    throw new Error(
      `Unsupported mimeType "${mimeType}". Allowed: ${[...ALLOWED_MIME].join(", ")}`,
    );
  }

  let raw = input.dataBase64.trim();
  const dataUrlMatch = /^data:([^;]+);base64,(.+)$/i.exec(raw);
  if (dataUrlMatch) {
    const embeddedMime = dataUrlMatch[1]!.toLowerCase();
    if (embeddedMime !== mimeType) {
      throw new Error(
        `data URL mime (${embeddedMime}) does not match mimeType (${mimeType})`,
      );
    }
    raw = dataUrlMatch[2]!;
  }

  let buffer: Buffer;
  try {
    buffer = Buffer.from(raw, "base64");
  } catch {
    throw new Error("Invalid base64 image data");
  }

  if (!buffer.length) throw new Error("Empty image payload");
  if (buffer.length > MAX_BYTES) {
    throw new Error(`Image too large (max ${MAX_BYTES} bytes)`);
  }

  const id = createId("img");
  const ext = EXT_BY_MIME[mimeType] ?? "bin";
  const baseName = sanitizeFilename(
    input.filename?.replace(/\.[^.]+$/, "") || id,
  );
  const filename = `${baseName || id}.${ext}`;
  const relativeDir = path.join(input.userId, id);
  const absoluteDir = path.join(getUploadRoot(), relativeDir);
  await mkdir(absoluteDir, { recursive: true });
  const absolutePath = path.join(absoluteDir, filename);
  await writeFile(absolutePath, buffer);

  const publicPath = `/api/uploads/${input.userId}/${id}/${filename}`;
  return {
    id,
    filename,
    mimeType,
    bytes: buffer.length,
    path: publicPath,
    url: `${getPublicAppUrl()}${publicPath}`,
  };
}

/** Resolve a stored upload path under the upload root (path traversal safe). */
export function resolveUploadFile(segments: string[]) {
  if (segments.length < 3) return null;
  if (segments.some((s) => !s || s === "." || s === ".." || s.includes("\0"))) {
    return null;
  }
  const root = path.resolve(getUploadRoot());
  const absolute = path.resolve(root, ...segments);
  if (!absolute.startsWith(root + path.sep) && absolute !== root) return null;
  return absolute;
}

export function mimeFromFilename(filename: string) {
  const ext = path.extname(filename).toLowerCase();
  switch (ext) {
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".webp":
      return "image/webp";
    case ".gif":
      return "image/gif";
    default:
      return "application/octet-stream";
  }
}
