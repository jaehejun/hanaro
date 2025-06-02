// lib/auth.ts
// NextAuth 설정 파일
// Next.js의 API 라우트로 사용되며, 인증 관련 로직을 포함.
// signin, signout API 처리는 NextAuth.js 가 정해둔 app/api/auth/[...nextauth]/route.ts 파일에서 자동으로 처리됨

// lib/auth.ts

import { AuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcrypt";
import prisma from '@/lib/prisma/prisma';

export const authOptions: AuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.AUTH_GITHUB_ID as string,
      clientSecret: process.env.AUTH_GITHUB_SECRET as string,
    }),

    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const { email, password } = credentials ?? {};

        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.password) return null;

        const isValid = await compare(password, user.password);
        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          nickname: user.nickname,
          role: user.role,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, account, profile }) {
      if (account?.provider === "github") {

        const githubProfile = profile as any;

        const existingUser = await prisma.user.findUnique({
          where: { email: token.email! },
        });

        if (!existingUser) {
          const newUser = await prisma.user.create({
            data: {
              email: token.email!,
              nickname: githubProfile.login,
              githubId: githubProfile.node_id?.toString(),
            },
          });

          token.id = newUser.id;
          token.email = newUser.email;
          token.nickname = newUser.nickname;
          token.role = newUser.role;
        } else {
          token.id = existingUser.id;
          token.email = existingUser.email;
          token.nickname = existingUser.nickname;
          token.role = existingUser.role;
        }
      }
      // 일반 로그인 처리
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.nickname = (user as any).nickname;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      (session.user as any)= {
        id: token.id,
        email: token.email,
        nickname: token.nickname,
        role: token.role,
      };
      return session;
    },
  },
  // pages: {
  //   signIn: "/auth/signin", // 커스텀 로그인 페이지
  // },
  secret: process.env.NEXTAUTH_SECRET!,
};
