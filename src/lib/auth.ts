import { createHmac, timingSafeEqual } from "crypto";

function getSecret(): string {
  const secret = process.env.INTERNAL_ADMIN_PASSWORD;

  if (!secret) {
    throw new Error("INTERNAL_ADMIN_PASSWORD not set");
  }

  return secret;
}

export function signToken(payload: string): string {
  const sig = createHmac("sha256", getSecret())
    .update(payload)
    .digest("hex");

  return `${payload}.${sig}`;
}

export function verifyToken(token: string): boolean {
  try {
    const lastDot = token.lastIndexOf(".");

    if (lastDot === -1) return false;

    const payload = token.slice(0, lastDot);

    const expected = signToken(payload);

    const a = Buffer.from(expected);
    const b = Buffer.from(token);

    if (a.length !== b.length) return false;

    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}