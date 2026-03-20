import { NextRequest, NextResponse } from "next/server";

// Basit in-memory rate limiter
// Production'da Redis kullanman önerilir (Upstash vb.)
const rateLimit = new Map<string, { count: number; resetAt: number }>();

const LIMIT    = 30;  // max istek sayısı
const WINDOW   = 60 * 1000; // 1 dakika (ms)

function getIP(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

export function middleware(req: NextRequest) {
  // Sadece API route'larını sınırla
  if (!req.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Auth route'larını muaf tut
  if (req.nextUrl.pathname.startsWith("/api/auth/")) {
    return NextResponse.next();
  }

  // Crosshair image route'unu muaf tut (public, cached)
  if (req.nextUrl.pathname.startsWith("/api/crosshair-image")) {
    return NextResponse.next();
  }

  const ip  = getIP(req);
  const now = Date.now();
  const rec = rateLimit.get(ip);

  if (!rec || now > rec.resetAt) {
    rateLimit.set(ip, { count: 1, resetAt: now + WINDOW });
    return NextResponse.next();
  }

  if (rec.count >= LIMIT) {
    return new NextResponse(
      JSON.stringify({ error: "Too many requests. Please slow down." }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(Math.ceil((rec.resetAt - now) / 1000)),
        },
      }
    );
  }

  rec.count++;
  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};