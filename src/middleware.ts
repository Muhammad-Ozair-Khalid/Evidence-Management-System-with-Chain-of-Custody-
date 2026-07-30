import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { type Role } from "@prisma/client";
import { can, requiredActionForPath } from "@/lib/rbac";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    if (!token?.role) {
      const login = new URL("/login", req.url);
      login.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(login);
    }

    const role = token.role as Role;
    const action = requiredActionForPath(pathname);

    if (action && !can(role, action)) {
      const denied = new URL("/dashboard", req.url);
      denied.searchParams.set("error", "forbidden");
      return NextResponse.redirect(denied);
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/dashboard",
    "/dashboard/:path*",
    "/evidence",
    "/evidence/:path*",
    "/custody",
    "/custody/:path*",
    "/integrity",
    "/integrity/:path*",
    "/reports",
    "/reports/:path*",
    "/audit",
    "/audit/:path*",
    "/admin",
    "/admin/:path*",
    "/settings",
    "/settings/:path*",
  ],
};
