// app/layout.tsx

// 최상위 레이아웃으로 모든 페이지에 적용되는 레이아웃을 정의
// 웹사이트 기본적인 구조 정의
// 부모 컴포넌트 역할

// app/layout.tsx (최상위 레이아웃)

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <header>
          {/* 모든 페이지에 공통으로 보여지는 헤더 */}
          <h1>My Tech Blog</h1>
          <nav>
            {/* 네비게이션 메뉴 */}
            <a href="/">홈</a>
            <a href="/category/js">JavaScript</a>
            <a href="/category/ts">TypeScript</a>
            <a href="/category/react">React</a>
            <a href="/category/etc">etc</a>
          </nav>
        </header>
        <main>{children}</main> {/* page.tsx 컴포넌트가 렌더링되는 위치 */}
        <footer>
          {/* 모든 페이지에 공통으로 보여지는 푸터 */}
          <p>© 2024 My Tech Blog</p>
        </footer>
      </body>
    </html>
  );
}
