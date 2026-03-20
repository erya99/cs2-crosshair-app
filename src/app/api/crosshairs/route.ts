import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

// 1. Verileri Çekme (Sayfa yüklendiğinde çalışır)
export async function GET() {
  try {
    const crosshairs = await prisma.crosshair.findMany({
      include: {
        user: {
          select: { name: true, image: true }
        }
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(crosshairs);
  } catch (error) {
    return NextResponse.json({ error: "Error fetching" }, { status: 500 });
  }
}

// 2. Yeni Crosshair Ekleme
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, shareCode, category, userId } = body;

    if (!title || !shareCode || !userId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const newCrosshair = await prisma.crosshair.create({
      data: {
        title,
        shareCode,
        category: category || "community",
        userId,
      },
    });

    return NextResponse.json(newCrosshair);
  } catch (error) {
    console.error("POST_ERROR:", error);
    return NextResponse.json({ error: "Error creating" }, { status: 500 });
  }
}