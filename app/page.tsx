// app/page.tsx
// app/ 디렉토리 안에서 특정 경로에 대한 UI를 렌더링하는 컴포넌트 정의하는 파일
// 루트 경로(메인페이지)에 접속했을 때 보여지는 UI 담당
// 메인 페이지의 내용(Conetent)을 담는 컴포넌트
// 자식 컴포넌트 역할

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Post = { id: string; title: string; content: string };
const categories = ['Javascript', 'Typescript', 'React', 'Etc'];

export default function HomePage() {
  const router = useRouter();
  const [latestPosts, setLatestPosts] = useState<Record<string, Post | null>>({});

  useEffect(() => {
    async function fetchLatestPosts() {
      const results: Record<string, Post | null> = {};
      for (const category of categories) {
        const res = await fetch(`/api/categories/${category}`);
        if (res.ok) {
          const data: Post[] = await res.json();
          results[category] = data.length > 0 ? data[data.length-1] : null;
        } else {
          results[category] = null;
        }
      }
      console.log('Latest posts:', results);
      setLatestPosts(results);
    }
    fetchLatestPosts();
  }, []);

  return (
    <div style={{ display: 'flex', gap: '2rem', padding: '1rem' }}>
      {categories.map((category) => (
        <div key={category} style={{ cursor: 'pointer', width: '150px' }} onClick={() => router.push(`/categories/${category}`)}>
          {/* 카테고리 이름 - 박스 바깥 위 */}
          <div
            style={{
              marginBottom: '0.5rem',
              fontWeight: '600',
              fontSize: '1.1rem',
              textTransform: 'capitalize',
              userSelect: 'none',
            }}
          >
            {category}
          </div>

          {/* 최신 글 제목 들어가는 정사각형 박스 */}
          <div
            style={{
              width: '150px',
              height: '150px',
              border: '1px solid #ccc',
              borderRadius: '8px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '0.5rem',
              boxSizing: 'border-box',
              textAlign: 'center',
              fontSize: '0.95rem',
              color: '#333',
              overflow: 'hidden',
              wordBreak: 'break-word',
            }}
            title={latestPosts[category]?.title ?? ''}
          >
            {latestPosts[category]?.title ?? '게시글 없음'}
          </div>
        </div>
      ))}
    </div>
  );
}
