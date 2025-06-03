import Link from 'next/link';

export const metadata = {
  title: '나만의 기술 블로그',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <header style={{ padding: '1rem', borderBottom: '1px solid #ccc' }}>
          <h1>나만의 기술 블로그</h1>
          <nav style={{ marginTop: '1rem' }}>
            <Link href="/" style={{ marginRight: '15px' }}>홈</Link>
            <Link href="/api/auth/signin" style={{ marginRight: '15px' }}>로그인</Link>
            <Link href="/signup" style={{ marginRight: '15px' }}>회원가입</Link>
            <Link href="/profile" style={{ marginRight: '15px' }}>내 정보 수정</Link> {/* 여기 추가 */}
            <Link href="/api/auth/signout" style={{ marginRight: '15px' }}>로그아웃</Link>
            <Link href="/admin">관리자 페이지</Link>
          </nav>
        </header>

        <main style={{ padding: '1rem' }}>
          {children}
        </main>

        <footer style={{ padding: '1rem', borderTop: '1px solid #ccc' }}>
          <p>© 2025 나만의 기술 블로그</p>
        </footer>
      </body>
    </html>
  );
}
