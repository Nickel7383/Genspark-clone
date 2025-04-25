import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../[...nextauth]/route";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    // 구글 로그인 사용자인 경우
    if (session.user?.email) {
      // Prisma에 사용자 정보가 있는지 확인
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
      });

      if (user) {
        // Prisma에 사용자 정보가 있으면 삭제
        await prisma.user.delete({
          where: { email: session.user.email },
        });
      }

      // NextAuth 계정 정보 삭제
      await prisma.account.deleteMany({
        where: { userId: session.user.id },
      });

      // NextAuth 세션 정보 삭제
      await prisma.session.deleteMany({
        where: { userId: session.user.id },
      });

      return NextResponse.json(
        { message: "회원탈퇴가 완료되었습니다." },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { message: "잘못된 요청입니다." },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error deleting account:", error);
    return NextResponse.json(
      { message: "회원탈퇴 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
} 