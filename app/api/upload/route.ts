import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get('file') as File;

  if (!file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
  const filePath = path.join(uploadDir, fileName);

  // 디렉토리 없으면 생성
  await import('fs').then(fs => {
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
  });

  await writeFile(filePath, buffer);

  // public 경로 반환
  const url = `/uploads/${fileName}`;
  return NextResponse.json({ url });
} 