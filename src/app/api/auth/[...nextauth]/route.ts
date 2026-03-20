import NextAuth from "next-auth";
import { getAuthOptions } from "../../../../lib/auth";
import { NextRequest } from "next/server";

// App Router için standart NextAuth handler yapısı
const handler = async (req: NextRequest, ctx: { params: { nextauth: string[] } }) => {
  // getAuthOptions'a req nesnesini paslıyoruz (Steam için gerekli)
  return await NextAuth(req as any, ctx as any, getAuthOptions(req));
};

export { handler as GET, handler as POST };