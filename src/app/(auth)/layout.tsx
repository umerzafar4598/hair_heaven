
import { auth } from "@/lib/auth";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
    title: "Hair Heaven | Barber Shop",
    description: "Hair Heaven | Best Barber Shop in Rawalpindi.",
};

export default async function AuthLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (session !== null) {
        switch (session.user.role) {
            case "customer":
                redirect("/")
            case "staff":
            case "owner":
                redirect("/dashboard")

            default:
                break;
        }
    }
    return (
        <>
            {children}
        </>
    );
}