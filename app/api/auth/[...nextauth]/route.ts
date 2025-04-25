import NextAuth, { type Session, type User, type Account, type Profile, type SessionStrategy, type NextAuthOptions } from "next-auth";
import type { JWT } from "next-auth/jwt";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "이메일", type: "email" },
        password: { label: "비밀번호", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("이메일과 비밀번호를 입력해주세요.");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          throw new Error("이메일 또는 비밀번호가 일치하지 않습니다.");
        }

        const isValidPassword = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isValidPassword) {
          throw new Error("이메일 또는 비밀번호가 일치하지 않습니다.");
        }

        // Account 정보 생성 또는 업데이트
        await prisma.account.upsert({
          where: {
            provider_providerAccountId: {
              provider: 'credentials',
              providerAccountId: user.id,
            },
          },
          create: {
            userId: user.id,
            type: 'credentials',
            provider: 'credentials',
            providerAccountId: user.id,
          },
          update: {},
        });

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        };
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt" as SessionStrategy,
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user, account }: { user: User; account: Account | null }) {
      if (account?.provider === "google") {
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email ?? '' },
          });

          if (!existingUser) {
            const newUser = await prisma.user.create({
              data: {
                email: user.email ?? '',
                name: user.name ?? '',
                image: user.image ?? '',
                password: '', // 구글 로그인 사용자는 비밀번호가 없음
                accounts: {
                  create: {
                    type: account.type,
                    provider: account.provider,
                    providerAccountId: account.providerAccountId,
                    access_token: account.access_token,
                    expires_at: account.expires_at,
                    token_type: account.token_type,
                    scope: account.scope,
                    id_token: account.id_token,
                    session_state: account.session_state,
                  }
                }
              },
            });
          } else if (!existingUser.image) {
            await prisma.user.update({
              where: { email: user.email ?? '' },
              data: { 
                image: user.image ?? '',
              },
            });
          }
        } catch (error) {
          if (error instanceof PrismaClientKnownRequestError) {
            console.error('Database error:', error.message);
          } else if (error instanceof Error) {
            console.error('Unexpected error:', error.message);
          } else {
            console.error('Unknown error occurred');
          }
          return false;
        }
      }
      return true;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, user }: { token: JWT; user: User }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }; 