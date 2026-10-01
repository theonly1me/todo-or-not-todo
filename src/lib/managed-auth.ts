import { createNeonAuth } from "@neondatabase/auth/next/server";

export const managedAuth = process.env.NEON_AUTH_BASE_URL && process.env.NEON_AUTH_COOKIE_SECRET
  ? createNeonAuth({ baseUrl: process.env.NEON_AUTH_BASE_URL, cookies: { secret: process.env.NEON_AUTH_COOKIE_SECRET } })
  : null;
