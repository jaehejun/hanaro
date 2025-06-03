import { NextResponse } from "next/server";
import prisma from "@/lib/prisma/prisma";

// 불용어 단어를 제외하는 간단한 필터 함수 (문자열 쪼개고 필터링)
function filterStopwords(query: string, stopwords: string[]) {
  const words = query
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 0 && !stopwords.includes(w));
  return words.join(" ");
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();

  if (!q || q.length === 0) {
    return NextResponse.json({ posts: [] });
  }

  try {
    // 1) 불용어 테이블에서 모두 가져오기
    const stopwords = await prisma.stopword.findMany({
      select: { word: true },
    });
    const stopwordList = stopwords.map((s) => s.word);

    // 2) 검색어에서 불용어 제거
    const filteredQuery = filterStopwords(q, stopwordList);

    if (!filteredQuery) {
      // 불용어만 검색어에 있는 경우
      return NextResponse.json({ posts: [] });
    }

    // 3) MySQL Fulltext 검색 수행
    // Prisma는 Fulltext 검색을 공식 지원하지 않으므로 raw query 사용
    // @@fulltext([title, content]) 인덱스가 있으므로 MATCH...AGAINST 사용 가능
    const posts = await prisma.$queryRaw<
      { id: string; title: string; categoryName: string }[]
    >`
      SELECT id, title, categoryName
      FROM posts
      WHERE MATCH(title, content) AGAINST(${filteredQuery} IN NATURAL LANGUAGE MODE)
      LIMIT 50;
    `;

    return NextResponse.json({ posts });
  } catch (error) {
    console.error("검색 중 오류:", error);
    return NextResponse.json({ posts: [], error: "검색 실패" }, { status: 500 });
  }
}
