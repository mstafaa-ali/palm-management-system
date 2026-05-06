import RefinedStats from "../components/dashboard/RefinedStats";
import Link from "next/link";
import { ChevronRight, Home, LayoutDashboard } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <div className="flex items-center text-sm text-slate-500 gap-2 mb-2">
        <Link href="/" className="hover:text-palm-primary transition-colors flex items-center gap-1">
          <Home className="w-4 h-4" /> Home
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-slate-800 font-medium">Dashboard</span>
      </div>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-palm-dark flex items-center gap-3">
            <LayoutDashboard className="w-8 h-8 text-palm-primary" />
            Today's Business Overview
          </h1>
          <p className="text-slate-500 mt-1 flex items-center gap-1">
            Monitor farm and mill performance in real-time.
          </p>
        </div>
      </div>

      {/* Komponen KPI dan Grafik */}
      <RefinedStats />
    </div>
  );
}
