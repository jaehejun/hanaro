// /app/api/signup/route.ts
// 회원가입 API 응답 처리

// 로그인 정보 확인
// POST 회원가입(로그인 하지 않은 모든 사용자)

import prisma from '@/lib/prisma/prisma';
import { hash } from 'bcrypt';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req:NextRequest) {
    if (req.method !== 'POST') {
        return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
    }
    try {
        const { email, password, nickname } = await req.json();

        if (!email || !password || !nickname) {
            return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
        }

        // 이메일 중복 확인
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
        }

        // 비밀번호 해싱
        const hashedPassword = await hash(password, 10);

        // 사용자 생성
        const newUser = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                nickname,
            },
        });

        return NextResponse.json({ message: 'User created successfully', userId: newUser.id }, { status: 201 });
    } catch (error) {
        console.error('Error creating user:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}