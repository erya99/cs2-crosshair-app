// src/lib/validate.ts
// Tüm kullanıcı girdilerini doğrulayan yardımcı fonksiyonlar

export const SHARE_CODE_REGEX =
  /^CSGO-[A-Za-z0-9]{5}-[A-Za-z0-9]{5}-[A-Za-z0-9]{5}-[A-Za-z0-9]{5}-[A-Za-z0-9]{5}$/;

export function validateShareCode(code: string): string | null {
  if (!code || typeof code !== "string") return "Share code is required.";
  if (!SHARE_CODE_REGEX.test(code.trim())) return "Invalid share code format.";
  return null; // null = geçerli
}

export function validateTitle(title: string): string | null {
  if (!title || typeof title !== "string") return "Title is required.";
  const t = title.trim();
  if (t.length < 2)  return "Title must be at least 2 characters.";
  if (t.length > 50) return "Title must be 50 characters or less.";
  // XSS: HTML tag içermemeli
  if (/<[^>]*>/g.test(t)) return "Title contains invalid characters.";
  return null;
}

export function validateCategory(category: string): string | null {
  if (!["community", "pro"].includes(category)) return "Invalid category.";
  return null;
}

// YENİ EKLENEN ÇÖZÜNÜRLÜK KONTROLÜ
export function validateResolution(resolution: string): string | null {
  if (!["16:9", "16:10", "4:3"].includes(resolution)) {
    return "Invalid resolution format.";
  }
  return null;
}