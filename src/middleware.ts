import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    // Protection des routes /admin
    if (pathname.startsWith("/admin")) {
      const role = token?.role as string | undefined;
      const adminRoles = ["SUPER_ADMIN", "ADMIN", "SUPPORT", "FINANCE"];

      if (!role || !adminRoles.includes(role)) {
        // Rediriger vers le dashboard user avec message d'erreur
        return NextResponse.redirect(new URL("/dashboard?error=unauthorized", req.url));
      }
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
  matcher: ["/admin/:path*", "/dashboard/:path*"],
};
