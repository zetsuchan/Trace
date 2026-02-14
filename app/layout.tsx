import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { Sidebar } from "@/components/sidebar";
import { LayoutShell } from "@/components/layout-shell";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-body",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-heading",
});

export const metadata: Metadata = {
  title: "TRACE — Sickle Cell Causal Intelligence",
  description:
    "Trace the hidden connections across body systems. Powered by Claude.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="min-h-screen bg-bg-deep text-text-primary font-[family-name:var(--font-body)]">
        <Sidebar />
        <LayoutShell>{children}</LayoutShell>
      </body>
    </html>
  );
}
