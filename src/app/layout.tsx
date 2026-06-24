import type { Metadata } from "next";
import { Noto_Sans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner"

const notoSans = Noto_Sans({ subsets: ['latin'], variable: '--font-sans' });


export const metadata: Metadata = {
  title: "Hair Heaven | Barber Shop",
  description: "Hair Heaven | Best Barber Shop in Town.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", "font-sans", notoSans.variable)}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster
          position="top-left"
          gap={8}
          theme="dark"
          toastOptions={{
            classNames: {
              toast: "!bg-[#16161f] !border !border-white/10 !text-white/90 !shadow-2xl !rounded-2xl !font-medium",
              title: "!text-white/90 !text-sm !font-semibold",
              description: "!text-white/40 !text-xs",
              success: "!border-emerald-500/25 [&>[data-icon]]:!text-emerald-400",
              error: "!border-rose-500/25 [&>[data-icon]]:!text-rose-400",
              icon: "!mr-3",
            },
          }}
        />
      </body>
    </html>
  );
}

