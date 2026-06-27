import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

const protectedRoutes = [
    "/dashboard",
    "/appointments",
    "/profile",
    "/setting",
    "/booking"
]

const authRoutes = [
    "/auth/login",
    "/auth/register",
    "/auth/forgot-password",
];
const verificationRoutes = [
    "/auth/verify-email",
]

export async function proxy(req: NextRequest) {
    const session = await auth.api.getSession({
        headers: req.headers,
    });
    const { pathname } = req.nextUrl;

    const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
    const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));
    const isVerificationRoute = verificationRoutes.some((route) =>
        pathname.startsWith(route)
    );

    if (isProtectedRoute && !session) {
        return NextResponse.redirect(new URL("/auth/login", req.url))
    }
    if (
        session &&
        !session.user.emailVerified &&
        isProtectedRoute &&
        !isVerificationRoute
    ) {
        return NextResponse.redirect(new URL("/auth/verify-email", req.url))
    }
    if (isAuthRoute && session && session.user.emailVerified) {
        return NextResponse.redirect(new URL("/", req.url))
    }
    return NextResponse.next();

}

export const config = {
    matcher: [

        "/dashboard/:path*",
        "/appointments/:path*",
        "/profile/:path*",
        "/settings/:path*",

        "/auth/login",
        "/auth/register",
        "/auth/forgot-password",
        "/auth/verify-email",

    ],
};
