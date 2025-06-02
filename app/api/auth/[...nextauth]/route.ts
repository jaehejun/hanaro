// app/api/auth/[...nextauth]/route.ts
// signIn, signOut API 처리
// 모든사용자?

// NextAuth 사용해 API 라우트 설정
import NextAuth from 'next-auth';
// lib/auth.ts에서 authOptions를 가져와서 NextAuth에 전달
import { authOptions } from '@/lib/auth';

// authOptions 객체를 NextAuth에 전달하여 핸들러 생성
const handler = NextAuth(authOptions);

// 생성된 핸들러 결과 객체에서 GET과 POST 메서드 직접 내보냄
// 이 두 메서드가 /api/auth/... 경로로 들어오는 모든 HTTP 요청을 처리
export { handler as GET, handler as POST };
// GET 메서드는 인증 상태를 조회하는 데 사용되며,
// POST 메서드는 로그인, 로그아웃 등의 인증 관련 작업을 수행하는 데 사용됩니다.
// 이 설정은 NextAuth가 제공하는 기본 인증 흐름을 활용하여
// 사용자 인증을 처리할 수 있도록 합니다.