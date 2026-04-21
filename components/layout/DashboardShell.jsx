"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

export default function DashboardShell({ children }) {
  const pathname = usePathname();

  // Mapping pathname to English titles for the header
  const headerTitle = useMemo(() => {
    switch (pathname) {
      case "/":
        return "Dashboard";
      case "/farm-management":
        return "Farm Management";
      case "/mill-operations":
        return "Mill Operations";
      case "/price-calculator":
        return "Price Calculator";
      default:
        return "Dashboard";
    }
  }, [pathname]);

  return (
    <div className="flex min-h-screen bg-palm-bg">
      {/* Sidebar - Navigasi Permanen */}
      <aside className="w-64 bg-palm-dark text-white hidden md:flex flex-col fixed h-full z-20">
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-xl font-bold tracking-tight">
            PALM <span className="text-palm-accent">SYSTEM</span>
          </h1>
        </div>
        <nav className="flex-1 p-4 space-y-2 mt-4">
          <NavItem
            href="/"
            icon="📊"
            label="Dashboard"
            active={pathname === "/"}
          />
          <NavItem
            href="/farm-management"
            icon="🚜"
            label="Farm Management"
            active={pathname === "/farm-management"}
          />
          <NavItem
            href="/mill-operations"
            icon="🏭"
            label="Mill Operations"
            active={pathname === "/mill-operations"}
          />
          <NavItem
            href="/price-calculator"
            icon="🧮"
            label="Price Calculator"
            active={pathname === "/price-calculator"}
          />
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 flex flex-col">
        {/* Header - Profil & Notifikasi */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
          <h2 className="font-semibold text-slate-700">{headerTitle}</h2>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-palm-dark">Mr. User</p>
              <p className="text-xs text-slate-500">Owner / Investor</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-palm-primary flex items-center justify-center text-white">
              U
            </div>
          </div>
        </header>

        {/* Dynamic Content Provided by Next.js App Router */}
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active = false, href }) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${active ? "bg-palm-primary text-white" : "hover:bg-slate-800 text-slate-400"}`}
    >
      <span>{icon}</span>
      <span className="font-medium">{label}</span>
    </Link>
  );
}
