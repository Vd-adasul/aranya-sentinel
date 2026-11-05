import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const rawId = params.id;
  const cleanId = rawId.replace(/\.(png|jpg|jpeg)$/i, "");

  const publicDir = path.join(process.cwd(), "public", "imagery", "drone_media");
  const jpgPath = path.join(publicDir, `${cleanId}.jpg`);
  const pngPath = path.join(publicDir, `${cleanId}.png`);

  if (fs.existsSync(jpgPath)) {
    const fileBuffer = fs.readFileSync(jpgPath);
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  }

  if (fs.existsSync(pngPath)) {
    const fileBuffer = fs.readFileSync(pngPath);
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  }

  // Fallback to default orthomosaic
  const defaultPath = path.join(process.cwd(), "public", "imagery", "drone-aerial-orthomosaic.jpg");
  if (fs.existsSync(defaultPath)) {
    const fileBuffer = fs.readFileSync(defaultPath);
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=3600",
      },
    });
  }

  return new NextResponse("Not Found", { status: 404 });
}
