// app/profile/page.tsx
// 사용자 정보수정정 페이지 UI를 정의하는 컴포넌트

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';

export default function ProfilePage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const [nicknameError, setNicknameError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    async function fetchSession() {
      const res = await fetch('/api/auth/session');
      const session = await res.json();

      if (!session || !session.user) {
        router.push('/api/auth/signin');
        return;
      }

      setEmail(session.user.email || '');
      setNickname(session.user.nickname || '');
    }

    fetchSession();
  }, [router]);

  const validate = () => {
    let isValid = true;
    setNicknameError('');
    setPasswordError('');

    if (nickname.trim().length === 0 || nickname.length > 10) {
      setNicknameError('닉네임은 1자 이상 10자 이하로 입력해주세요.');
      isValid = false;
    }

    if (password && !/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(password)) {
      setPasswordError('비밀번호는 영문과 숫자를 포함한 8자 이상이어야 합니다.');
      isValid = false;
    }

    return isValid;
  };

  const handleUpdate = async () => {
    setMessage('');
    if (!validate()) return;

    setLoading(true);
    const res = await fetch('/api/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nickname: nickname, password }),
    });

    setLoading(false);

    if (res.ok) {
      setMessage('✅ 프로필이 성공적으로 수정되었습니다.');
      router.refresh();
    } else {
      const data = await res.json();
      setMessage(data.error || '❌ 프로필 수정에 실패했습니다.');
    }
  };

  const handleDelete = async () => {
    if (!confirm('정말 회원탈퇴 하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) return;

    setLoading(true);
    setMessage('');

    const res = await fetch('/api/me', { method: 'DELETE' });

    setLoading(false);

    if (res.ok) {
      alert('회원탈퇴가 완료되었습니다.');
      await signOut({ callbackUrl: '/' });
    } else {
      const data = await res.json();
      setMessage(data.error || '❌ 회원탈퇴에 실패했습니다.');
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto' }}>
      <h2>내 정보 수정</h2>

      <label>
        이메일 (수정 불가)
        <input
          type="email"
          value={email}
          disabled
          style={{ width: '100%', padding: '0.5rem', marginBottom: '0.5rem', backgroundColor: '#f5f5f5' }}
        />
      </label>

      <label>
        닉네임
        <input
          type="text"
          value={nickname}
          onChange={e => {
            setNickname(e.target.value);
            setNicknameError('');
          }}
          placeholder="닉네임 입력"
          style={{ width: '100%', padding: '0.5rem', marginBottom: '0.25rem' }}
        />
        {nicknameError && <p style={{ color: 'red' }}>{nicknameError}</p>}
      </label>

      <label>
        새 비밀번호
        <input
          type="password"
          value={password}
          onChange={e => {
            setPassword(e.target.value);
            setPasswordError('');
          }}
          placeholder="변경할 비밀번호 입력 (선택)"
          style={{ width: '100%', padding: '0.5rem', marginBottom: '0.25rem' }}
        />
        {passwordError && <p style={{ color: 'red' }}>{passwordError}</p>}
      </label>

      <div style={{ marginTop: '1rem' }}>
        <button
          onClick={handleUpdate}
          disabled={loading}
          style={{
            padding: '0.75rem 1.5rem',
            marginRight: '1rem',
            backgroundColor: '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          {loading ? '수정 중...' : '정보 수정'}
        </button>

        <button
          onClick={handleDelete}
          disabled={loading}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: 'red',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          {loading ? '처리 중...' : '회원탈퇴'}
        </button>
      </div>

      {message && (
        <p style={{ marginTop: '1rem', color: message.startsWith('✅') ? 'green' : 'red' }}>
          {message}
        </p>
      )}
    </div>
  );
}
