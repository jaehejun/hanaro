// /app/signup/page.tsx
// 회원 가입 페이지 UI를 정의하는 컴포넌트

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

// handleSignup 함수를 컴포넌트 밖으로 빼냄
const handleSignup = async (e: React.FormEvent, email: string, password: string, nickname: string, setEmail: any, setPassword: any, setNickname:any, router:any) => {
    e.preventDefault();

    const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, nickname }),
    });
    
    if (res.ok) {
        // 회원 가입 성공 시 로그인 페이지로 리다이렉트
        setEmail('')
        setPassword('')
        setNickname('')
        router.push('/api/auth/signin');
    };
};

export default function SignupPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [nickname, setNickname] = useState('');
    const router = useRouter();

    return (
        <form onSubmit={(e) => handleSignup(e, email, password, nickname, setEmail, setPassword, setNickname, router)}>
            <input placeholder="이메일" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input placeholder="비밀번호" value={password} onChange={(e) => setPassword(e.target.value)} type="password" />
            <input placeholder="닉네임" value={nickname} onChange={(e) => setNickname(e.target.value)} />
            <button type="submit">회원 가입</button>
        </form>
    );
}


