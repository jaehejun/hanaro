// app/api/me/route.ts
// 현재 로그인한 사용자 정보 수정/탈퇴

// 본인 확인
// PATCH 현재 로그인한 사용자 정보 수정
// DELETE 현재 로그인한 사용자 탈퇴

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const sessionUser = session.user as { id: string; email: string; nickname: string; password: string };
  const body = await req.json();

  const { nickname, password } = body;
  console.log("NICKNAME:", nickname);

  try {
    const updateData: any = {};

    // 닉네임 중복 검사
    if (nickname) {
      const existingNickname = await prisma.user.findFirst({ where: { nickname } });
      if (existingNickname) {
        return NextResponse.json({ error: '이미 사용 중인 닉네임입니다.' }, { status: 409 });
      }
      updateData.nickname = nickname;
    }

    // 비밀번호 해시 처리
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    // 실제 업데이트 수행
    await prisma.user.update({
      where: { id: sessionUser.id },
      data: updateData,
    });
    return NextResponse.json({ message: '프로필이 수정되었습니다.' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: '프로필 수정 실패' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const sessionUser = session.user as { id: string; role: string; };

  // 관리자 권한이 있는 경우 회원탈퇴를 허용하지 않음
  if (sessionUser.role === 'ADMIN') {
    return NextResponse.json({ error: '관리자는 회원탈퇴를 할 수 없습니다.' }, { status: 403 });
    }
  // 일반 사용자만 회원탈퇴 가능
  try {
    await prisma.user.delete({ where: { id: sessionUser.id } });

    // 추가: 로그아웃 처리 등 필요한 작업 수행 가능

    return NextResponse.json({ message: '회원탈퇴가 완료되었습니다.' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: '회원탈퇴 실패' }, { status: 500 });
  }
}
