import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { userId } = body;
    const crosshairId = params.id;

    if (!userId) {
      return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
    }

    // 1. Kullanıcı bu crosshair'e daha önce oy vermiş mi kontrol et
    const existingVote = await prisma.vote.findUnique({
      where: {
        userId_crosshairId: {
          userId: userId,
          crosshairId: crosshairId,
        },
      },
    });

    if (existingVote) {
      // 2. Eğer zaten oy verdiyse, oyu GERİ AL (Unlike işlemi)
      await prisma.$transaction([
        prisma.vote.delete({
          where: { id: existingVote.id },
        }),
        prisma.crosshair.update({
          where: { id: crosshairId },
          data: { voteCount: { decrement: 1 } },
        }),
      ]);
      return NextResponse.json({ message: "Oy geri alındı", voted: false }, { status: 200 });
      
    } else {
      // 3. Eğer oy vermediyse, YENİ OY EKLE (Like işlemi)
      await prisma.$transaction([
        prisma.vote.create({
          data: {
            userId: userId,
            crosshairId: crosshairId,
          },
        }),
        prisma.crosshair.update({
          where: { id: crosshairId },
          data: { voteCount: { increment: 1 } },
        }),
      ]);
      return NextResponse.json({ message: "Oy verildi", voted: true }, { status: 200 });
    }

  } catch (error) {
    console.error("Oylama hatası:", error);
    return NextResponse.json({ error: "Oylama işlemi başarısız." }, { status: 500 });
  }
}