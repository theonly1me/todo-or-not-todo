import { NextResponse, type NextRequest } from "next/server";
import { managedAuth } from "@/lib/managed-auth";

const completeOAuth = managedAuth?.middleware({ loginUrl: "/" });

export async function proxy(request: NextRequest) {
  return completeOAuth ? completeOAuth(request) : NextResponse.next();
}

export const config = { matcher: ["/auth/callback"] };
