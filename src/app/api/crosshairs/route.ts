// src/app/api/crosshairs/route.ts
import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma"; // "@" alias hata verirse "../../../../lib/prisma" yapabilirsin

// CROSSHAIR EKLEME (POST)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, shareCode, category, userId } = body;

    if (!title || !shareCode || !category || !userId) {
      return NextResponse.json({ error: "Lütfen tüm alanları doldurun." }, { status: 400 });
    }

    const newCrosshair = await prisma.crosshair.create({
      data: {
        title,
        shareCode,
        category,
        userId,
      },
    });

    return NextResponse.json(newCrosshair, { status: 201 });
  } catch (error) {
    console.error("Crosshair ekleme hatası:", error);
    return NextResponse.json({ error: "Bu Crosshair kodu zaten eklenmiş olabilir." }, { status: 500 });
  }
}

// VERİTABANINDAN CROSSHAIR'LERİ ÇEKME (GET)
export async function GET() {
  try {
    const crosshairs = await prisma.crosshair.findMany({
      orderBy: { createdAt: "desc" }, // En yeniler en üstte
      include: {
        user: {
          select: { name: true, image: true }, // Kullanıcının adını ve avatarını da çekiyoruz
        },
      },
    });

    return NextResponse.json(crosshairs, { status: 200 });
  } catch (error) {
    console.error("Crosshair çekme hatası:", error);
    return NextResponse.json({ error: "Veriler alınamadı." }, { status: 500 });
  }
}