// app/page.tsx
import DashboardShell from "../components/layout/DashboardShell";
import RefinedStats from "../components/dashboard/RefinedStats";

export default function DashboardPage() {
  return (
    /* DashboardShell akan membungkus RefinedStats dengan Sidebar & Navbar */
    <DashboardShell>
      {/* Header Halaman Spesifik */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-palm-dark">
          Overview Bisnis Hari Ini
        </h1>
        <p className="text-slate-500 mt-1">
          Pantau performa kebun dan PKS secara real-time.
        </p>
      </div>

      {/* Komponen KPI dan Grafik */}
      <RefinedStats />
    </DashboardShell>
  );
}
