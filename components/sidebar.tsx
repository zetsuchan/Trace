"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Sidebar() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const pathname = usePathname();

  useEffect(() => {
    // Load theme from localStorage
    const savedTheme = localStorage.getItem("theme") as "dark" | "light" | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute("data-theme", savedTheme);
    }
  }, []);

  function toggleTheme() {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  }

  // Hide sidebar on hero/login/docs pages
  if (pathname === "/" || pathname === "/login" || pathname.startsWith("/docs")) return null;

  const navItems = [
    { href: "/", label: "New Trace", icon: "✨" },
    { href: "/history", label: "History", icon: "📊" },
    { href: "/insights", label: "Insights", icon: "💡" },
    { href: "/analytics", label: "Analytics", icon: "📈" },
  ];

  const visibleNavItems = navItems.filter(
    (item) => !(item.href === "/" && pathname.startsWith("/trace"))
  );

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-chain-connection/20 bg-bg-surface p-6"
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Logo */}
      <Link href="/" className="mb-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg" aria-label="TRACE — Go to home">
        <h2 className="text-2xl font-bold tracking-tight text-text-primary">
          T R A C E
        </h2>
        <p className="mt-1 text-xs text-text-tertiary">
          Cross-system intelligence
        </p>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 space-y-1" aria-label="Main menu">
        {visibleNavItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                isActive
                  ? "bg-chain-active/15 text-chain-active"
                  : "text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
              }`}
            >
              <span className="text-base" aria-hidden="true">{item.icon}</span>
              <span>{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId="sidebar-indicator"
                  className="ml-auto h-1.5 w-1.5 rounded-full bg-chain-active"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.3 }}
                  aria-hidden="true"
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Separator */}
      <div className="my-2 border-t border-chain-connection/10" aria-hidden="true" />

      {/* Bottom section */}
      <div className="space-y-3 pt-4">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-text-secondary transition-all hover:bg-bg-elevated hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="text-base" aria-hidden="true">{theme === "dark" ? "☀️" : "🌙"}</span>
          <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
        </button>

        {/* User info placeholder */}
        <div className="rounded-lg bg-bg-elevated p-3" role="region" aria-label="Patient profile">
          <p className="text-xs font-medium text-text-primary">Patient Profile</p>
          <p className="mt-1 text-xs text-text-tertiary">HbSS • High HbF</p>
        </div>
      </div>
    </motion.aside>
  );
}
