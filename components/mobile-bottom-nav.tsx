"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/trace/new", label: "Trace", icon: "✨" },
  { href: "/history", label: "History", icon: "📊" },
  { href: "/insights", label: "Insights", icon: "💡" },
  { href: "/analytics", label: "Analytics", icon: "📈" },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  // Hide on pages that don't show the sidebar either
  if (
    pathname === "/" ||
    pathname === "/login" ||
    pathname.startsWith("/docs")
  ) {
    return null;
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex border-t border-chain-connection/20 bg-bg-surface/95 backdrop-blur-md md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Mobile navigation"
    >
      {NAV_ITEMS.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(item.href + "/") ||
          (item.href === "/trace/new" && pathname.startsWith("/trace"));
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={`flex flex-1 flex-col items-center justify-center gap-0.5 min-h-[56px] text-xs font-medium transition-colors ${
              isActive
                ? "text-chain-active"
                : "text-text-tertiary active:text-text-secondary"
            }`}
          >
            <span className="text-lg leading-none" aria-hidden="true">
              {item.icon}
            </span>
            <span className="text-[11px] leading-none">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
