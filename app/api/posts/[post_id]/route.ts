// /app/api/posts/[post_id]/route.ts
// post_id 에 해당하는 게시글 API 응답 처리

// GET 특정 게시글 조회(모든 사용자), 제목/내용 검색
// PUT 특정 게시글 수정(관리자)
// DELETE 특정 게시글 삭제(관리자)

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// 게시글 수정
export async function PUT(
    req: NextRequest,
    { params }: {params: { post_id: string } }
) {
    const session = await getServerSession(authOptions);
    
    if (!session)
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
    const user = session.user as any;
    if (user.role !== 'ADMIN')
        return NextResponse.json({ message: 'Access denied' }, { status: 403 });

    const context = await params;
    const postId = context.post_id;

    if (!postId)
        return NextResponse.json({ message: 'Bad Request' }, { status: 400 });

    const { title, content } = await req.json();

    if (!title || !content)
        return NextResponse.json({ message: 'Bad Request' }, { status: 400 });

    try {
        const updatedPost = await prisma.post.update({
            where: { id: postId },
            data: { title, content }
        });
        if (!updatedPost)
            return NextResponse.json({ message: 'Post update failed' }, { status: 500 });
        return NextResponse.json(updatedPost, { status: 200 });
    }
    catch (error) {
        console.error('Error updating post:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

// 게시글 삭제
export async function DELETE(
    req: NextRequest,
    { params }: {params: { post_id: string } }
) {
    const session = await getServerSession(authOptions);
    
    if (!session)
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
    const user = session.user as any;
    if (user.role !== 'ADMIN')
        return NextResponse.json({ message: 'Access denied' }, { status: 403 });

    const context = await params;
    const postId = context.post_id;

    if (!postId)
        return NextResponse.json({ message: 'Bad Request' }, { status: 400 });

    try {
        const post = await prisma.post.findUnique({
            where: { id: postId },
        });
        if (!post)
            return NextResponse.json({ message: 'Post delete failed' }, { status: 500 });

        const deletedPost = await prisma.post.delete({
            where: { id: postId },
        });

        if (!deletedPost)
            return NextResponse.json(post, { status: 200 });
    }
    catch (error) {
        console.error('Error creating post:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
