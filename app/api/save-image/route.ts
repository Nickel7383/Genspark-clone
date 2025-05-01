import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import fs from 'fs';

export async function POST(req: NextRequest) {
  try {
    const { imageData, filename } = await req.json(); // base64 문자열과 optional 파일명

    const buffer = Buffer.from(imageData, 'base64');
    const uploadDir = path.join(process.cwd(), 'public', 'ai-generated-images');

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const safeName = filename
      ? filename.replace(/[^a-zA-Z0-9.]/g, '_')
      : `image.png`;
    const finalName = `${Date.now()}_${safeName}`;
    const filePath = path.join(uploadDir, finalName);

    await writeFile(filePath, buffer);

    const url = `/ai-generated-images/${finalName}`;
    return NextResponse.json({ url });
  } catch (error) {
    console.error("Image save error:", error);
    return NextResponse.json({ error: 'Image save failed' }, { status: 500 });
  }
}
