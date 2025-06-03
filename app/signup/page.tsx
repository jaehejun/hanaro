// /app/signup/page.tsx
// 회원 가입 페이지 UI를 정의하는 컴포넌트

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePassword = (pw: string) => {
    return /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(pw); // 영문+숫자, 8자 이상
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // ✅ 클라이언트-side validation
    if (!validateEmail(email)) {
      setError('유효한 이메일 형식을 입력해주세요.');
      return;
    }

    if (!validatePassword(password)) {
      setError('비밀번호는 영문과 숫자를 포함하여 8자 이상이어야 합니다.');
      return;
    }

    if (nickname.length === 0 || nickname.length > 10) {
      setError('닉네임은 1자 이상 10자 이하로 입력해주세요.');
      return;
    }

    setLoading(true);
    const res = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, nickname }),
    });
    setLoading(false);

    if (res.ok) {
      setEmail('');
      setPassword('');
      setNickname('');
      router.push('/api/auth/signin');
    } else {
      const data = await res.json();
      setError(data.error || '회원가입에 실패했습니다.');
    }
  };

  return (
    <form onSubmit={handleSignup} style={{ maxWidth: '400px', margin: '2rem auto' }}>
      <h2>회원가입</h2>
      <input
        placeholder="이메일 (user@example.com)"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        type="email"
        style={{ display: 'block', width: '100%', marginBottom: '1rem', padding: '0.5rem' }}
      />
      <input
        placeholder="비밀번호 (영문+숫자 8자 이상)"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        type="password"
        style={{ display: 'block', width: '100%', marginBottom: '1rem', padding: '0.5rem' }}
      />
      <input
        placeholder="닉네임 (10자 이하)"
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
        style={{ display: 'block', width: '100%', marginBottom: '1rem', padding: '0.5rem' }}
      />
      <button
        type="submit"
        disabled={loading}
        style={{ padding: '0.75rem 1.5rem', width: '100%', cursor: 'pointer' }}
      >
        {loading ? '가입 중...' : '회원 가입'}
      </button>
      {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}
    </form>
  );
}
