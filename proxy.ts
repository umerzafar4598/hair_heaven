import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";



const protectedRoutes = [
    "/dashboard",
    "/appointments",
    "/profile",
    "/setting",
]

const authRoutes = [
    "/auth/login",
    "/auth/register",
    "/auth/forgot-password",
];

export async function proxy(req: NextRequest) {
    const session = await auth.api.getSession({
        headers: req.headers,
    });
    const pathname = req.nextUrl.pathname;

    const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
    const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

    if (isProtectedRoute && !session) {
        return NextResponse.redirect(new URL("/auth/login", req.url))
    }
    if (isAuthRoute && session) {
        if (!session.user.emailVerified) {
            return NextResponse.redirect(new URL("/auth/verify-email", req.url))
        }
        return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    if (isProtectedRoute && session && !session.user.emailVerified) {
        return NextResponse.redirect(new URL("auth/verify-email", req.url))
    }
    return NextResponse.next();

}

export const config = {
    matcher: [
        // Include all protected and auth routes
        "/dashboard/:path*",
        "/appointments/:path*",
        "/profile/:path*",
        "/settings/:path*",
        "/auth/:path*",
        // Exclude static files and api routes
        "/((?!api|_next/static|_next/image|favicon.ico).*)",
    ],
};
