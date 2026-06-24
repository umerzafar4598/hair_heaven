
import { auth } from "@/lib/auth";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
    title: "Hair Heaven | Barber Shop",
    description: "Hair Heaven | Best Barber Shop in Rawalpindi.",
};

export default async function CustomerLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) {
        redirect("/login")
    }
    if (!session.user.emailVerified) {
        redirect("/verify-email")
    }
    if (session.user.role !== "customer") {
        redirect("/dashboard")
    }
    return (
        <>
            {children}
        </>
    );
}