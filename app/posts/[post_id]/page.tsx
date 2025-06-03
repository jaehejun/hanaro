// app/posts/[post_id]/page.tsx
// 특정 포스트의 상세 내용을 보여주는 페이지 컴포넌트

import prisma from '@/lib/prisma/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import LikeDislikeButtons from '@/components/LikeDislikeButtons';

interface PageProps {
  params: {
    post_id: string;
  };
}

export default async function PostPage({ params }: PageProps) {
  const context = await params;
  const post_id = context.post_id;
  const post = await prisma.post.findUnique({
    where: { id: post_id },
    include: {
      author: {
        select: { nickname: true },
      },
      reactions: true,
    },
  });

  if (!post) return notFound();

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      {/* 목록으로 돌아가기 버튼 */}
      <div style={{ marginBottom: '1rem' }}>
        <Link href={`/categories/${post.categoryName}`}>
          <button
            style={{
              padding: '0.5rem 1rem',
              background: '#f0f0f0',
              border: '1px solid #ccc',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            ← 목록으로 돌아가기
          </button>
        </Link>
      </div>

      {/* 제목 + 날짜 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>{post.title}</h1>
        <div style={{ textAlign: 'right', fontSize: '0.9rem', color: '#666' }}>
          <div>작성: {new Date(post.createdAt).toLocaleString()}</div>
          <div>수정: {new Date(post.updatedAt).toLocaleString()}</div>
        </div>
      </div>

      {/* 작성자 */}
      <div style={{ marginTop: '0.5rem', marginBottom: '1.5rem', color: '#333' }}>
        작성자: <strong>{post.author.nickname}</strong>
      </div>

      {/* 좋아요/싫어요 버튼 */}
        <LikeDislikeButtons
            postId={post.id}
        />

      {/* 내용 */}
      <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', fontSize: '1.1rem' }}>
        {post.content}
      </div>
    </div>
  );
}
