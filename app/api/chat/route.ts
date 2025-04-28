import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { prisma } from '@/app/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: '인증되지 않은 사용자입니다.' }, { status: 401 });
    }

    const { messages, title } = await req.json();
    
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
    }

    const chat = await prisma.chat.create({
      data: {
        userId: user.id,
        title: title || '새로운 대화',
        messages: messages,
      },
    });

    return NextResponse.json(chat);
  } catch (error) {
    console.error('대화 저장 중 오류 발생:', error);
    return NextResponse.json({ error: '대화 저장 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: '인증되지 않은 사용자입니다.' }, { status: 401 });
    }

    const { chatId, messages, title } = await req.json();
    
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
    }

    const chat = await prisma.chat.update({
      where: {
        id: chatId,
        userId: user.id,
      },
      data: {
        messages,
        ...(title && { title }),
      },
    });

    return NextResponse.json(chat);
  } catch (error) {
    console.error('대화 업데이트 중 오류 발생:', error);
    return NextResponse.json({ error: '대화 업데이트 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: '인증되지 않은 사용자입니다.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const chatId = searchParams.get('id');
    
    if (!chatId) {
      return NextResponse.json({ error: '대화 ID가 필요합니다.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
    }

    await prisma.chat.delete({
      where: {
        id: chatId,
        userId: user.id,
      },
    });

    return NextResponse.json({ message: '대화가 삭제되었습니다.' });
  } catch (error) {
    console.error('대화 삭제 중 오류 발생:', error);
    return NextResponse.json({ error: '대화 삭제 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: '인증되지 않은 사용자입니다.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const chatId = searchParams.get('id');
    
    // 특정 채팅을 가져오는 경우
    if (chatId) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
      });

      if (!user) {
        return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
      }

      const chat = await prisma.chat.findUnique({
        where: {
          id: chatId,
          userId: user.id,
        },
      });

      if (!chat) {
        return NextResponse.json({ error: '대화를 찾을 수 없습니다.' }, { status: 404 });
      }

      return NextResponse.json(chat);
    }
    
    // 모든 채팅 목록을 가져오는 경우
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        chats: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
    }

    return NextResponse.json(user.chats);
  } catch (error) {
    console.error('대화 내역 조회 중 오류 발생:', error);
    return NextResponse.json({ error: '대화 내역 조회 중 오류가 발생했습니다.' }, { status: 500 });
  }
} 