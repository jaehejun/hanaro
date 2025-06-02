// lib/auth.ts
// NextAuth 설정 파일
// 이 파일은 Next.js의 API 라우트로 사용되며, 인증 관련 로직을 포함합니다.
// signin, signout API 처리는 NextAuth.js 가 정해둔 app/api/auth/[...nextauth]/route.ts 파일에서 자동으로 처리됨됨

import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github"; // GitHub Provider 임포트
import CredentialsProvider from "next-auth/providers/credentials"; // Credentials Provider 임포트
import prisma from "@/lib/prisma/prisma"; // 네가 만든 prisma 인스턴스 임포트
import bcrypt from "bcryptjs"; // 비밀번호 검증을 위한 bcryptjs 임포트
import { Role } from "@/lib/prisma"; // Prisma Client에서 생성된 Role Enum 임포트

export const authOptions = { // 설정을 authOptions 객체에 담아 관리 (가독성 향상)
  // 1. 인증 프로바이더 설정 (어떤 방식으로 로그인할지 정의)
  providers: [
    // 이메일/비밀번호 로그인 (Credentials Provider)
    CredentialsProvider({
      name: "Credentials", // 로그인 폼에 표시될 이름
      credentials: { // 로그인 폼에 입력받을 필드 정의
        email: { label: "이메일", type: "email" },
        password: { label: "비밀번호", type: "password" }
      },
      // 사용자가 입력한 정보(credentials)로 유효성을 검증하는 비동기 함수
      async authorize(credentials, req) {
        // 입력된 이메일, 비밀번호가 없으면 인증 실패 (null 반환)
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // 1a. 데이터베이스에서 입력된 이메일로 사용자 찾기
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        // 1b. 사용자가 없거나 (GitHub 로그인 사용자 제외), 비밀번호가 일치하지 않으면 인증 실패
        // 이메일/비밀번호 사용자는 password가 있어야 함
        if (!user || !user.password || !(await bcrypt.compare(credentials.password, user.password))) {
          console.log("Credentials 로그인 실패: 사용자 없음 또는 비밀번호 불일치");
          return null; // 사용자 없음, password 없음, 또는 비밀번호 불일치
        }

        // 1c. 인증 성공 시, NextAuth 세션에 포함될 사용자 정보 객체 반환
        // 이 객체가 JWT, session 콜백의 user 인자로 전달됨
        return {
          id: user.id, // 고유 ID (필수!)
          email: user.email,
          nickname: user.nickname, // nickname 필드에 닉네임 설정 (세션에 기본으로 포함)
          role: user.role, // 역할(role) 정보 추가 (jwt 콜백에서 토큰에 추가)
        };
      }
    }),

    // GitHub 로그인 (OAuth Provider)
    GithubProvider({
      clientId: process.env.GITHUB_ID as string, // .env.local에서 가져온 Client ID
      clientSecret: process.env.GITHUB_SECRET as string, // .env.local에서 가져온 Client Secret
      // (선택 사항) GitHub에서 가져올 프로필 정보 커스터마이징
      profile(profile) {
        // GitHub에서 받아온 profile 객체의 id, login, email, avatar_url 등을 가공
        return {
          id: profile.id.toString(), // GitHub ID는 number일 수 있으므로 string으로 변환
          email: profile.email, // 이메일
          nickname: profile.name || profile.login, // 이름 또는 로그인 ID 사용
          role: 'user', // 기본 역할 설정 (여기서 설정하면 signIn 콜백의 user.role로 전달됨)
        };
      },
    })
  ],

  // 2. 세션 관리 전략 설정 (JWT 전략 사용!)
  session: {
    strategy: 'jwt', // 데이터베이스에 세션 정보를 저장하지 않고 JWT 토큰 사용
  },

  // 3. 콜백 함수 설정 (인증 과정 중 특정 시점에 커스텀 로직 실행)
  callbacks: {
    // JWT 토큰 생성 또는 업데이트 시 실행
    // user: authorize 함수나 signIn 콜백에서 반환된 user 객체
    // account, profile: OAuth 로그인 시 프로바이더에서 전달되는 정보
    async jwt({ token, user, account, profile }) {
      // 3a. authorize 또는 signIn 콜백에서 user 객체가 전달되었을 때 (즉, 로그인 성공 시)
      // JWT 토큰에 사용자 ID와 역할(role) 정보 추가
      if (user) {
        token.id = user.id; // User 모델의 ID
        token.role = (user as any).role; // User 객체에 role 필드가 있다고 명시 (any 사용 또는 User 인터페이스 확장)
        // (선택 사항) GitHub 로그인 시 관련 정보도 토큰에 추가
        if (account?.provider === 'github') {
             token.githubId = account.providerAccountId; // GitHub 고유 ID
             token.githubUsername = (profile as any)?.login; // GitHub 사용자 이름
        }
      }

      // 3b. 토큰이 업데이트될 때 기존 정보 유지 (user 객체가 없는 경우)
      // 예를 들어, 세션이 만료되기 전에 새로고침될 때 jwt 콜백이 실행되는데, 이때 user 객체는 없고 token만 있음.
      // 이때 기존 토큰에 있던 정보가 사라지지 않도록 그대로 유지
      // ... 필요한 기존 토큰 정보 유지 로직 ...

      return token; // 다음 콜백 (session)으로 전달될 JWT 토큰
    },

    // 클라이언트(프론트엔드)에서 useSession() 등으로 접근할 수 있는 세션 객체에 포함될 정보 설정
    // session: 클라이언트 세션 객체 (기본적으로 user { name, email, image } 필드만 가짐)
    // token: 위 jwt 콜백에서 반환된 JWT 토큰 객체
    async session({ session, token }) {
      // 3c. JWT 토큰에 추가했던 사용자 ID와 역할(role) 정보를 세션 객체의 user 필드에 추가
      if (token) {
        session.user.id = token.id as string; // 세션에 사용자 ID 추가
        session.user.role = token.role as Role; // 세션에 사용자 역할 추가 (Prisma Enum 타입 명시)
        // (선택 사항) GitHub 관련 정보도 세션에 추가
         session.user.githubId = token.githubId as string | undefined;
         session.user.githubUsername = token.githubUsername as string | undefined;
      }

      return session; // 클라이언트로 전송될 최종 세션 객체
    },

    // signIn 시도 시 실행 (인증 성공 여부 및 추가 로직 처리)
    // user: authorize 함수나 프로바이더에서 반환된 user 객체
    // account, profile: OAuth 로그인 시 프로바이더에서 전달되는 정보
    // isNewUser: OAuth 로그인 시 새로 생성된 사용자인지 여부 (어댑터 사용 시 유용)
    async signIn({ user, account, profile }) {
      // 3d. GitHub 로그인인 경우, 사용자 데이터 처리 로직
      if (account?.provider === "github") {
        const githubId = account.providerAccountId;
        const githubEmail = profile?.email; // GitHub 이메일 (null일 수 있음)
        const githubNickname = profile?.login; // GitHub 닉네임

        // 3d-i. GitHub 계정 ID로 DB에 이미 사용자가 있는지 확인
        const existingUser = await prisma.user.findUnique({
          where: { githubId: githubId },
        });

        if (existingUser) {
          // 3d-ii. 이미 사용자가 있다면, 해당 사용자로 로그인 진행
          console.log(`GitHub 로그인: 기존 사용자 (${existingUser.email})`);
          (user as any).role = existingUser.role; // user 객체에 role 추가 (jwt 콜백으로 전달)
          (user as any).id = existingUser.id; // user 객체에 id 추가 (jwt 콜백으로 전달)
          return true; // 로그인 허용
        } else {
          // 3d-iii. 새로운 GitHub 사용자라면, DB에 새 사용자 레코드 생성
          // GitHub 이메일이 필수라면 없을 경우 로그인 거부
          if (!githubEmail) {
             console.error("GitHub 계정에 이메일 정보가 없어 계정 생성 불가");
             // 사용자에게 이메일 입력을 요청하는 커스텀 에러 페이지 등으로 리다이렉트 유도 가능
             // return '/auth/need-email';
             return false; // 로그인 거부
          }
           // (선택 사항) 이미 같은 이메일로 가입한 사용자가 있는지 확인 후 연결 로직 추가 가능
           // const userWithEmail = await prisma.user.findUnique({ where: { email: githubEmail } });
           // if (userWithEmail) { ... 계정 연결 로직 ... }

          // 새 사용자 생성
          try {
            const newUser = await prisma.user.create({
              data: {
                email: githubEmail, // GitHub 이메일 사용
                nickname: githubNickname || 'GitHub User', // GitHub 닉네임 또는 기본값
                githubId: githubId, // GitHub 고유 ID 저장!
                password: null, // OAuth 로그인이므로 비밀번호 없음
                role: Role.USER, // 기본 역할은 USER
              },
            });
            console.log(`GitHub 로그인: 새 사용자 생성 (${newUser.email})`);
            user.id = newUser.id; // 새로 생성된 user의 ID를 user 객체에 추가
            user.role = newUser.role; // 새로 생성된 role 정보 설정
            return true; // 로그인 허용
          } catch (error) {
            console.error("GitHub 계정 생성 실패:", error);
            return false; // 계정 생성 실패 시 로그인 거부
          }
        }
      }
      // Credentials 로그인인 경우 authorize 함수에서 인증 여부를 결정하므로 항상 true 반환
      return true;
    },
  },

  // 4. 기타 설정
  secret: process.env.AUTH_SECRET as string, // JWT 서명에 사용될 비밀 키 (필수!)
  debug: process.env.NODE_ENV === 'development', // 개발 환경에서 디버그 로그 출력
  // pages: {
  //   signIn: '/auth/signin',  // 커스텀 로그인 페이지 경로 (선택 사항)
  //   error: '/auth/error', // 커스텀 에러 페이지 경로 (선택 사항)
  // },
};

// NextAuth() 함수 호출 및 필요한 함수들 내보내기
export const { handlers, signIn, signOut, auth } = NextAuth(authOptions);

// (선택 사항) 세션 타입 확장 (클라이언트에서 session.user.role 등에 접근하기 위해)
// 이 부분은 types/next-auth.d.ts 파일에 정의하는 것이 더 일반적입니다.
/*
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role; // Role Enum 타입 사용
      githubId?: string;
      githubUsername?: string;
      // ... 기본 필드 name, email, image 포함 ...
    } & DefaultSession["user"];
  }

  interface User {
     role: Role;
     githubId?: string;
     githubUsername?: string;
     // ... 다른 사용자 필드 추가 ...
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    githubId?: string;
    githubUsername?: string;
    // ... 다른 토큰 필드 추가 ...
  }
}
*/
