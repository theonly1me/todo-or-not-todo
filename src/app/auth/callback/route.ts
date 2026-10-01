import { NextResponse } from "next/server";

export function GET(request: Request) {
  const current = new URL(request.url);
  const destination = new URL(current.searchParams.get("returnTo") || "/", current.origin);
  return NextResponse.redirect(destination.origin === current.origin ? destination : new URL("/", current.origin));
}
