import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";

export async function POST(
  req: Request,
  ctx: any
) {
  try {
    const { id: crosshairId } = await ctx.params;
    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: "You must be logged in." }, { status: 401 });
    }

    const existingVote = await prisma.vote.findUnique({
      where: {
        userId_crosshairId: {
          userId,
          crosshairId,
        },
      },
    });

    if (existingVote) {
      await prisma.$transaction([
        prisma.vote.delete({ where: { id: existingVote.id } }),
        prisma.crosshair.update({
          where: { id: crosshairId },
          data: { voteCount: { decrement: 1 } },
        }),
      ]);
      return NextResponse.json({ message: "Vote removed", voted: false });
    } else {
      await prisma.$transaction([
        prisma.vote.create({ data: { userId, crosshairId } }),
        prisma.crosshair.update({
          where: { id: crosshairId },
          data: { voteCount: { increment: 1 } },
        }),
      ]);
      return NextResponse.json({ message: "Vote added", voted: true });
    }
  } catch (error) {
    console.error("Vote error:", error);
    return NextResponse.json({ error: "Voting failed." }, { status: 500 });
  }
}