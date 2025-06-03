'use client'

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Post {
  id: string;
  title: string;
  categoryName: string;
}

interface PostsByCategory {
  [category: string]: Post[];
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [postsByCategory, setPostsByCategory] = useState<PostsByCategory>(
    {}
  );

  useEffect(() => {
    if (!query) return;

    setLoading(true);
    setError(null);

    fetch(`/api/search?q=${encodeURIComponent(query)}`)
      .then((res) => {
        if (!res.ok) throw new Error("검색 실패");
        return res.json();
      })
      .then((data) => {
        // data.posts 배열이 { id, title, categoryName } 형태라고 가정
        const grouped: PostsByCategory = {};

        data.posts.forEach((post: Post) => {
          if (!grouped[post.categoryName]) {
            grouped[post.categoryName] = [];
          }
          grouped[post.categoryName].push(post);
        });

        setPostsByCategory(grouped);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [query]);

  if (!query) {
    return <p>검색어를 입력해주세요.</p>;
  }

  if (loading) {
    return <p>검색 중...</p>;
  }

  if (error) {
    return <p style={{ color: "red" }}>오류: {error}</p>;
  }

  return (
    <div>
      <h2>
        검색 결과: <em>{query}</em>
      </h2>

      {Object.keys(postsByCategory).length === 0 && (
        <p>검색 결과가 없습니다.</p>
      )}

      {Object.entries(postsByCategory).map(([category, posts]) => (
        <section key={category} style={{ marginBottom: "2rem" }}>
          <h3>{category} 게시판</h3>
          <ul>
            {posts.map((post) => (
              <li key={post.id}>
                <Link href={`/posts/${post.id}`}>{post.title}</Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
