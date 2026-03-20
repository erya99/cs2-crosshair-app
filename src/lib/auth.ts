import { NextAuthOptions } from "next-auth";
import SteamProvider from "next-auth-steam";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "../lib/prisma";
import { NextRequest } from "next/server";

export const getAuthOptions = (req?: NextRequest): NextAuthOptions => ({
  adapter: PrismaAdapter(prisma),
  providers: [
    SteamProvider(req as any, {
      nextId: process.env.NEXTAUTH_URL || "http://localhost:3000",
      realm: process.env.NEXTAUTH_URL || "http://localhost:3000",
      callbackUrl: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/auth/callback`,
      apiKey: process.env.STEAM_API_KEY!,
      clientSecret: process.env.STEAM_API_KEY!, // Hatanın ana çözümü
    } as any),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "database",
  },
  callbacks: {
    async session({ session, user }: any) {
      if (session.user) {
        session.user.id = user.id;
        session.user.role = user.role || "USER";
      }
      return session;
    },
  },
});