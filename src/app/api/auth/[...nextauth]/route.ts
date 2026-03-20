import NextAuth, { DefaultSession } from "next-auth";
import SteamProvider from "next-auth-steam";
import { PrismaAdapter } from "@next-auth/prisma-adapter";

// KRİTİK NOKTA: Süslü parantez ile ve doğru yoldan import ediyoruz
import { prisma } from "../../../../lib/prisma"; 
import type { NextRequest } from "next/server";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      steamId?: string;
    } & DefaultSession["user"];
  }
  interface User {
    id: string;
    steamId?: string;
  }
}

async function handler(
  req: NextRequest,
  ctx: { params: { nextauth: string[] } }
) {
  // Terminale prisma'nın dolu mu boş mu geldiğini yazdırıyoruz:
  console.log("PRISMA KONTROLU: ", prisma ? "Dolu ve Hazır" : "BOŞ (UNDEFINED)!");

  return NextAuth(req, ctx, {
    adapter: PrismaAdapter(prisma), // Prisma bağlantımız buraya veriliyor
    providers: [
      SteamProvider(req, {
        clientSecret: process.env.STEAM_API_KEY!,
        callbackUrl: `${process.env.NEXTAUTH_URL}/api/auth/callback/steam`,
      }),
    ],
    callbacks: {
      session({ session, user }) {
        if (session.user && user) {
          session.user.id = user.id;
          session.user.steamId = user.steamId;
        }
        return session;
      },
    },
  });
}

export { handler as GET, handler as POST };