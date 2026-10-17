import { readFile, stat } from "node:fs/promises";
import { NextResponse } from "next/server";
import {
  mimeFromFilename,
  resolveUploadFile,
} from "@/lib/uploads/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ path: string[] }> };

export async function GET(_request: Request, { params }: Params) {
  const segments = (await params).path ?? [];
  const absolute = resolveUploadFile(segments);
  if (!absolute) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const info = await stat(absolute);
    if (!info.isFile()) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const body = await readFile(absolute);
    const filename = segments[segments.length - 1] ?? "file";
    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": mimeFromFilename(filename),
        "Content-Length": String(info.size),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
