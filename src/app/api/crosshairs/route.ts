import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { getServerSession } from "next-auth";
import { getAuthOptions } from "../../../lib/auth";
import { validateShareCode, validateTitle, validateCategory } from "../../../lib/validate";

export async function GET() {
  try {
    const crosshairs = await prisma.crosshair.findMany({
      include: {
        user: { select: { name: true, image: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(crosshairs);
  } catch {
    return NextResponse.json({ error: "Error fetching" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(getAuthOptions());
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, shareCode, category } = body;

    // Input validation
    const titleErr    = validateTitle(title ?? "");
    const codeErr     = validateShareCode(shareCode ?? "");
    const categoryErr = validateCategory(category ?? "community");

    if (titleErr)    return NextResponse.json({ error: titleErr },    { status: 400 });
    if (codeErr)     return NextResponse.json({ error: codeErr },     { status: 400 });
    if (categoryErr) return NextResponse.json({ error: categoryErr }, { status: 400 });

    const userId  = session.user.id;
    const role    = (session.user as any).role ?? "USER";
    const isAdmin = role === "ADMIN";

    // Only admins can add "pro" category
    if (category === "pro" && !isAdmin) {
      return NextResponse.json(
        { error: "Only admins can add pro crosshairs." },
        { status: 403 }
      );
    }

    // Regular users: max 3 crosshairs
    if (!isAdmin) {
      const count = await prisma.crosshair.count({ where: { userId } });
      if (count >= 3) {
        return NextResponse.json(
          { error: "You can only share up to 3 crosshairs." },
          { status: 403 }
        );
      }
    }

    const newCrosshair = await prisma.crosshair.create({
      data: {
        title:     title.trim(),
        shareCode: shareCode.trim(),
        category:  category || "community",
        userId,
      },
    });

    return NextResponse.json(newCrosshair);
  } catch (error: any) {
    if (error?.code === "P2002") {
      return NextResponse.json(
        { error: "This share code already exists." },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "Error creating" }, { status: 500 });
  }
}