

import { auth } from "@/lib/auth";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
    title: "Hair Heaven | Barber Shop",
    description: "Hair Heaven | Best Barber Shop in Rawalpindi.",
};

export default async function BusinessLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const session = await auth.api.getSession({ headers: await headers() })
    if (session?.user.role !== "staff" && session?.user.role !== "owner") {
        redirect("/")
    }
    return (
        { children }
    );
}