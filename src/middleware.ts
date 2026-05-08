import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const token =
    req.cookies.get("vault_auth")?.value;

  const isLoginPage =
    req.nextUrl.pathname === "/login";

  const isAuthenticated = !!token;

  if (!isAuthenticated && !isLoginPage) {
    return NextResponse.redirect(
      new URL("/login", req.url)
    );
  }

  if (isAuthenticated && isLoginPage) {
    return NextResponse.redirect(
      new URL("/dashboard", req.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};