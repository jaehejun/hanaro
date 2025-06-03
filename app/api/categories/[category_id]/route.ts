// /app/api/categories/[post_id]/route.ts
// category_id 에 해당하는 카테고리 API 응답 처리

// POST 특정 카테고리 게시글 작성(관리자)
// GET 특정 카테고리 게시글 목록 조회(모든 사용자자)

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// 해당 카테고리 새 게시글 작성
export async function POST(
    req: NextRequest,
    { params }: {params: { category_id: string } }
) {
    const session = await getServerSession(authOptions);
    
    if (!session)
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
    const user = session.user as any;
    if (user.role !== 'ADMIN')
        return NextResponse.json({ message: 'Access denied' }, { status: 403 });

    const { title, content } = await req.json();
    const context = await params;
    const categoryId = context.category_id;

    if (!title || !content || !categoryId)
        return NextResponse.json({ message: 'Bad Request' }, { status: 400 });

    try {
        const newPost = await prisma.post.create({
            data: {
                title: title,
                content: content,
                categoryName: categoryId,
                authorName: user.nickname,
                },
        });
        if (!newPost)
            return NextResponse.json({ message: 'Post creation failed' }, { status: 500 });
        return NextResponse.json(newPost, { status: 201 });
    }
    catch (error) {
        console.error('Error creating post:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

// 해당 카테고리 모든 게시글 조회
export async function GET(
    req: NextRequest,
    { params }: {params: { category_id: string } }
) {
    // const session = await getServerSession(authOptions);
    
    // if (!session)
    //     return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
    // const user = session.user as any;
    // if (user.role !== 'ADMIN')
    //     return NextResponse.json({ message: 'Access denied' }, { status: 403 });

    const context = await params;
    const categoryId = context.category_id;

    if (!categoryId)
        return NextResponse.json({ message: 'Bad Request' }, { status: 400 });

    try {
        const posts = await prisma.post.findMany({
            where: { categoryName: categoryId },
        });
        if (!posts)
            return NextResponse.json({ message: 'Post get failed' }, { status: 500 });
        return NextResponse.json(posts, { status: 201 });
    }
    catch (error) {
        console.error('Error creating post:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}