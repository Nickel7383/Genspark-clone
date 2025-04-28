import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { prisma } from '@/app/lib/prisma';

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: '인증되지 않은 사용자입니다.' }, { status: 401 });
    }

    const { apiKey } = await req.json();
    
    if (!apiKey) {
      return NextResponse.json({ error: 'API 키가 필요합니다.' }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: { googleApiKey: apiKey },
    });

    return NextResponse.json({ message: 'API 키가 저장되었습니다.' });
  } catch (error) {
    console.error('API 키 저장 중 오류 발생:', error);
    return NextResponse.json({ error: 'API 키 저장 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: '인증되지 않은 사용자입니다.' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { googleApiKey: true },
    });

    return NextResponse.json({ apiKey: user?.googleApiKey || '' });
  } catch (error) {
    console.error('API 키 조회 중 오류 발생:', error);
    return NextResponse.json({ error: 'API 키 조회 중 오류가 발생했습니다.' }, { status: 500 });
  }
} 