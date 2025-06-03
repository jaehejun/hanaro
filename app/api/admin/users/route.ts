// app/api/admin/users/route.ts
// 관리자 페이지에서 사용자 API 응답 처리

// 관리자 role 확인
// GET 모든 사용자 목록 조회(관리자)
// 닉네임/이메일 검색(관리자)

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// 모든 사용자 목록 조회(관리자)
export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    
    if (!session)
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
    const user = session.user as any;
    if (user.role !== 'ADMIN')
        return NextResponse.json({ message: 'Access denied' }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const nickname = searchParams.get('nickname') || '';
    const email = searchParams.get('email') || '';

    let whereCondition = {};
    if (nickname || email) {
        const filters = [];
        if (nickname) {
            filters.push({ nickname: { contains: nickname } });
        }
        if (email) {
            filters.push({ email: { contains: email } });
        }
        whereCondition = { OR: filters };
    }

    try {
        const users = await prisma.user.findMany({
            where: whereCondition,
            select: {
                id: true,
                nickname: true,
                email: true,
                role: true,
            }
        });
        return NextResponse.json(users, { status: 200 });
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}