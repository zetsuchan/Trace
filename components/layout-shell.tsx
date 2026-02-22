"use client";

import { usePathname } from "next/navigation";

const FULL_WIDTH_ROUTES = ["/", "/login"];

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Fumadocs provides its own layout
  if (pathname.startsWith("/docs")) {
    return <>{children}</>;
  }

  const isFullWidth = FULL_WIDTH_ROUTES.includes(pathname);

  if (isFullWidth) {
    return (
      <main className="min-h-screen px-4 py-6 sm:px-8 sm:py-8">
        <div className="mx-auto max-w-[1100px]">{children}</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-6 pb-24 sm:px-8 sm:py-8 md:ml-64 md:pb-8">
      <div className="mx-auto max-w-[900px]">{children}</div>
    </main>
  );
}
