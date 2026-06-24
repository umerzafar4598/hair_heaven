
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Hair Heaven | Barber Shop",
    description: "Hair Heaven | Best Barber Shop in Rawalpindi.",
};

export default async function HomeLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            {children}
        </>
    );
}