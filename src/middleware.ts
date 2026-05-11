import { NextRequest } from "next/server";

import { NextResponse } from "next/server";

const PROTECTED_ROUTES = [
  "/dashboard",
  "/scanner",
  "/import",
  "/email",
];

export function middleware(
  req: NextRequest
) {
  const { pathname } = req.nextUrl;

  const isProtected =
    PROTECTED_ROUTES.some(
      (route) =>
        pathname.startsWith(route)
    );

  if (!isProtected) {
    return NextResponse.next();
  }

  const token =
    req.cookies.get(
      "vault_auth"
    )?.value;

  if (!token) {
    return NextResponse.redirect(
      new URL(
        "/login",
        req.url
      )
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/scanner/:path*",
    "/import/:path*",
    "/email/:path*",
  ],
};