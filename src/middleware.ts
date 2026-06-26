import { NextRequest, NextResponse } from "next/server";

// Auth is handled client-side via localStorage + Zustand.
// Middleware just passes all requests through.
export function middleware(req: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|api|favicon|public|images|fonts).*)"],
};
