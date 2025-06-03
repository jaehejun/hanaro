// app/categories/[category_id]/page.tsx
// 특정 카테고리 페이지 컴포넌트

import prisma from '@/lib/prisma/prisma'; 
import Link from 'next/link';

interface PageProps {
  params: {
    category_id: string;
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const context = await params;
  const category = context.category_id;

  // 예: category 테이블에 name 필드가 category일 경우
  // 또는 category_id가 숫자라면 Number(category)로 변환해서 사용
  const posts = await prisma.post.findMany({
    where: {
      categoryName: category, // 필드명과 타입에 맞게 수정 필요
    },
    orderBy: {
      createdAt: 'desc',
    },
    select: {
      id: true,
      title: true,
      createdAt: true,
    },
  });

  return (
    <div style={{ padding: '1rem' }}>
      <h1>{category} 카테고리 게시글 목록</h1>
      <ul>
        {posts.map((post) => (
          <li key={post.id} style={{ marginBottom: '0.5rem' }}>
            <Link href={`/posts/${post.id}`}>
              {post.title}
            </Link>{' '}
            <small>({new Date(post.createdAt).toLocaleString()})</small>
          </li>
        ))}
      </ul>
    </div>
  );
}
