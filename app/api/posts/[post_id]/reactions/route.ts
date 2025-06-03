// app/api/posts/[post_id]/reactions/route.ts
// 특정 게시글에 대한 리액션 API 응답 처리

// GET 특정 게시글 리액션 조회 (모든 사용자)
// POST 리액션 (로그인한 사용자)

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma/prisma';
import { getServerSession } from 'next-auth/next';  // next-auth 사용시
import { authOptions } from '@/lib/auth'; // next-auth 설정 위치 (프로젝트에 맞게 조정)

export async function GET(req: NextRequest,
    { params }: { params: { post_id: string } }
) {
  const context = await params;
  const post_id = context.post_id;

  // 해당 포스트가 존재하는지 확인
  const post = await prisma.post.findUnique({
    where: { id: post_id },
    include: {
      reactions: true, // 리액션 정보 포함
    },
  });

  if (!post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }

  // 리액션 타입별로 카운트
  const likeCount = post.reactions.filter(r => r.type === 'LIKE').length;
  const dislikeCount = post.reactions.filter(r => r.type === 'DISLIKE').length;

  return NextResponse.json({
    postId: post.id,
    title: post.title,
    content: post.content,
    likeCount,
    dislikeCount,
    reactions: post.reactions, // 모든 리액션 정보 반환
  });
}

export async function POST(req: NextRequest,
    { params }: { params: { post_id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    // 로그인 안된 상태면 로그인 페이지로 리다이렉트
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const user = session.user as any;
  const userId = user.id;

  const context = await params;
  const post_id = context.post_id;
  const { reactionType } = await req.json();

  if (reactionType !== 'LIKE' && reactionType !== 'DISLIKE') {
    return NextResponse.json({ error: 'Invalid reaction type' }, { status: 400 });
  }

  // 먼저 해당 포스트가 존재하는지 확인
  const post = await prisma.post.findUnique({
    where: { id: post_id },
  });
  if (!post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }

  // 기존 반응 조회
  const existingReaction = await prisma.postReaction.findUnique({
    where: {
      postId_userId: {
        postId: post_id,
        userId,
      },
    },
  });

  // 기존 반응이 없으면 새로 생성
  if (!existingReaction) {
    await prisma.postReaction.create({
      data: {
        type: reactionType,
        postId: post_id,
        userId,
      },
    });
    return NextResponse.json({ status: 201 });
  }

  // 기존 반응이 있고, 같은 타입이면 반응 삭제 (토글 기능)
  if (existingReaction.type === reactionType) {
    await prisma.postReaction.delete({
      where: {
        id: existingReaction.id,
      },
    });
    return NextResponse.json({ status: 204 });
  }

  // 기존 반응이 있지만 다른 타입이면 업데이트
  await prisma.postReaction.update({
    where: { id: existingReaction.id },
    data: { type: reactionType },
  });
  return NextResponse.json({ status: 200 });
}
