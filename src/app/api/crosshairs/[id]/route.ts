import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getServerSession } from "next-auth";
import { getAuthOptions } from "../../../../lib/auth";

export async function DELETE(
  _req: Request,
  ctx: any
) {
  try {
    const { id } = await ctx.params;
    const session = await getServerSession(getAuthOptions());
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const crosshair = await prisma.crosshair.findUnique({
      where: { id },
    });

    if (!crosshair) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const role    = (session.user as any).role ?? "USER";
    const isAdmin = role === "ADMIN";
    const isOwner = crosshair.userId === session.user.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.crosshair.delete({ where: { id } });
    return NextResponse.json({ message: "Deleted" });
  } catch {
    return NextResponse.json({ error: "Error deleting" }, { status: 500 });
  }
}