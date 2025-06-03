'use client';

import { useEffect, useState } from 'react';

interface Props {
  postId: string;
}

export default function LikeDislikeButtons({ postId }: Props) {
  const [likeCount, setLikeCount] = useState(0);
  const [dislikeCount, setDislikeCount] = useState(0);

  // 좋아요/싫어요 count
  const fetchReactionCounts = async () => {
    const res = await fetch(`/api/posts/${postId}/reactions`);
    if (res.ok) {
      const data = await res.json();
      setLikeCount(data.likeCount);
      setDislikeCount(data.dislikeCount);
    }
  };

  useEffect(() => {
    fetchReactionCounts();
  }, []);

  const handleReaction = async (reactionType: 'LIKE' | 'DISLIKE') => {
    const res = await fetch(`/api/posts/${postId}/reactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reactionType }),
    });

    if (res.status === 401) {
      window.location.href = '/api/auth/signin';
      return;
    }

    if (res.ok) {
      // 반영 후 최신 카운트 다시 fetch
      await fetchReactionCounts();
    }
  };

  return (
    <div style={{ margin: '1.5rem 0', display: 'flex', gap: '1rem', alignItems: 'center' }}>
      <button onClick={() => handleReaction('LIKE')} style={{ cursor: 'pointer' }}>
        👍 좋아요 {likeCount}
      </button>
      <button onClick={() => handleReaction('DISLIKE')} style={{ cursor: 'pointer' }}>
        👎 싫어요 {dislikeCount}
      </button>
    </div>
  );
}
