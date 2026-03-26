"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthContext } from "@/components/auth-provider";

const PATIENT_NAV = [
  { href: "/trace/new", label: "Trace", icon: "✨" },
  { href: "/history", label: "History", icon: "📊" },
  { href: "/insights", label: "Insights", icon: "💡" },
  { href: "/analytics", label: "Analytics", icon: "📈" },
];

const PROVIDER_NAV = [
  { href: "/provider/dashboard", label: "Dashboard", icon: "🏥" },
  { href: "/provider/patients", label: "Patients", icon: "👥" },
  { href: "/provider/flagged", label: "Flagged", icon: "🚩" },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthContext();

  // Hide on pages that don't show the sidebar either
  if (
    pathname === "/" ||
    pathname === "/login" ||
    pathname.startsWith("/docs")
  ) {
    return null;
  }

  const isProvider = user?.role === "provider" || user?.role === "admin";
  const navItems = isProvider ? PROVIDER_NAV : PATIENT_NAV;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex border-t border-chain-connection/20 bg-bg-surface/95 backdrop-blur-md md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Mobile navigation"
    >
      {navItems.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(item.href + "/") ||
          (!isProvider && item.href === "/trace/new" && pathname.startsWith("/trace"));
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

      {/* Sign out */}
      {user && (
        <button
          onClick={async () => {
            await logout();
            router.push("/login");
          }}
          className="flex flex-1 flex-col items-center justify-center gap-0.5 min-h-[56px] text-xs font-medium text-text-tertiary active:text-text-secondary transition-colors"
        >
          <span className="text-lg leading-none" aria-hidden="true">👋</span>
          <span className="text-[11px] leading-none">Sign Out</span>
        </button>
      )}
    </nav>
  );
}
