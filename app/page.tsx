// app/page.tsx
// app/ 디렉토리 안에서 특정 경로에 대한 UI를 렌더링하는 컴포넌트 정의하는 파일
// 루트 경로(메인페이지)에 접속했을 때 보여지는 UI 담당
// 메인 페이지의 내용(Conetent)을 담는 컴포넌트
// 자식 컴포넌트 역할

export default function Home() {
  return (
    <div>
      {/* 메인 페이지 내용 */}
      <h2>최신 글 목록</h2>
      {/* 여기에 최신 글 목록 컴포넌트 */}
    </div>
  );
}