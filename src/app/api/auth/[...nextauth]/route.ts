import NextAuth from "next-auth";
import { getAuthOptions } from "../../../../lib/auth";
import { NextRequest } from "next/server";

const handler = async (req: NextRequest, ctx: any) => {
  return await NextAuth(req as any, ctx as any, getAuthOptions(req));
};

export { handler as GET, handler as POST };