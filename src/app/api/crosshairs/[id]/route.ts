import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getServerSession } from "next-auth";
import { getAuthOptions } from "../../../../lib/auth";

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(getAuthOptions());
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const crosshair = await prisma.crosshair.findUnique({ where: { id: params.id } });
    
    // @ts-ignore
    const isAdmin = session.user.role === "ADMIN";
    // @ts-ignore
    const isOwner = crosshair?.userId === session.user.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: "No permission" }, { status: 403 });
    }

    await prisma.crosshair.delete({ where: { id: params.id } });
    return NextResponse.json({ message: "Deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Error deleting" }, { status: 500 });
  }
}