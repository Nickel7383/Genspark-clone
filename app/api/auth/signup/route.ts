import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    // 이메일 중복 체크
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "이미 존재하는 이메일입니다." },
        { status: 400 }
      );
    }

    // 비밀번호 해시화
    const hashedPassword = await bcrypt.hash(password, 10);

    // 기본 프로필 이미지 생성 (이름의 첫 글자)
    const firstLetter = name.charAt(0).toUpperCase();
    const defaultImage = `https://ui-avatars.com/api/?name=${encodeURIComponent(firstLetter)}&background=random&color=fff&size=128`;

    // 사용자 생성
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        image: defaultImage,
      },
    });

    return NextResponse.json(
      { message: "회원가입이 완료되었습니다." },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in signup:", error);
    return NextResponse.json(
      { message: "회원가입 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
} 