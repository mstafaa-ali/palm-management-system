"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, Droplets, FlaskConical, TrendingDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ResponsiveContainer,
  LabelList,
} from "recharts";

// ─── Types ────────────────────────────────────────────────────────────────────
interface StageData {
  tahap_proses: string;
  losses_kg: number;
  oil_losses_kg: number;
  jumlah_entri: number;
}

interface SummaryData {
  total_losses_kg: number;
  total_oil_losses_kg: number;
  total_tbs_olah_kg: number;
  losses_rate_persen: number;
  by_stage: StageData[];
}

// ─── Stage colors (gradient from light to dark rose) ─────────────────────────
const STAGE_FILL = ["#fca5a5", "#f87171", "#ef4444", "#dc2626", "#b91c1c"];

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const d: StageData = payload[0].payload;
    return (
      <div className="bg-white p-3 border border-slate-200 rounded-xl shadow-lg text-sm min-w-[180px]">
        <p className="font-bold text-slate-800 mb-2">{label}</p>
        <div className="space-y-1">
          <div className="flex justify-between">
            <span className="text-slate-500">Total Losses:</span>
            <span className="font-semibold text-slate-700">{d.losses_kg.toLocaleString("id-ID")} kg</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Oil Losses:</span>
            <span className="font-bold text-rose-600">{d.oil_losses_kg.toLocaleString("id-ID")} kg</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Entri:</span>
            <span className="text-slate-600">{d.jumlah_entri}x</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

// ─── Component ────────────────────────────────────────────────────────────────
const BULAN_LABELS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

export default function LossesDashboard({ refreshTrigger }: { refreshTrigger: number }) {
  const now = new Date();
  const [bulan, setBulan]     = useState(now.getMonth() + 1); // 1-12
  const [tahun, setTahun]     = useState(now.getFullYear());
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    fetchData();
  }, [refreshTrigger, bulan, tahun]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res    = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/mill-losses/summary?bulan=${bulan}&tahun=${tahun}`);
      const result = await res.json();
      if (result.success) setSummary(result.data);
    } catch (err) {
      console.error("Error fetching losses summary:", err);
    } finally {
      setLoading(false);
    }
  };

  // Sort by oil_losses_kg desc for the chart
  const chartData = summary
    ? [...summary.by_stage].sort((a, b) => b.oil_losses_kg - a.oil_losses_kg)
    : [];

  // Determine losses rate status
  const lossesRate = summary?.losses_rate_persen ?? 0;
  const isGoodRate = lossesRate <= 1.5; // Industry benchmark ≤ 1.5%

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-slate-600">Periode:</span>
        <Select value={String(bulan)} onValueChange={(v) => setBulan(Number(v))}>
          <SelectTrigger id="losses-bulan-select" className="w-[140px] h-8 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {BULAN_LABELS.map((label, idx) => (
              <SelectItem key={idx + 1} value={String(idx + 1)}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={String(tahun)} onValueChange={(v) => setTahun(Number(v))}>
          <SelectTrigger id="losses-tahun-select" className="w-[100px] h-8 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[2023, 2024, 2025, 2026, 2027].map((y) => (
              <SelectItem key={y} value={String(y)}>{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Oil Losses */}
        <Card className="border-l-4 border-l-rose-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-600">Total Oil Losses</CardTitle>
            <Droplets className="w-4 h-4 text-rose-400" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-28" />
            ) : (
              <div className="text-2xl font-bold text-rose-600">
                {(summary?.total_oil_losses_kg ?? 0).toLocaleString("id-ID", {
                  maximumFractionDigits: 1,
                })}{" "}
                kg
              </div>
            )}
            <p className="text-xs text-slate-500 mt-1">
              Dari{" "}
              {(summary?.total_losses_kg ?? 0).toLocaleString("id-ID")} kg material losses
            </p>
          </CardContent>
        </Card>

        {/* Losses Rate */}
        <Card
          className={`border-l-4 shadow-sm ${
            isGoodRate ? "border-l-emerald-500" : "border-l-amber-500"
          }`}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-600">Losses Rate</CardTitle>
            <TrendingDown
              className={`w-4 h-4 ${isGoodRate ? "text-emerald-400" : "text-amber-400"}`}
            />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="flex items-end gap-2">
                <div
                  className={`text-2xl font-bold ${
                    isGoodRate ? "text-emerald-600" : "text-amber-600"
                  }`}
                >
                  {lossesRate.toFixed(2)}%
                </div>
                <span
                  className={`text-xs font-medium mb-1 px-2 py-0.5 rounded-full ${
                    isGoodRate
                      ? "text-emerald-600 bg-emerald-50"
                      : "text-amber-700 bg-amber-50"
                  }`}
                >
                  {isGoodRate ? "Baik" : "Perlu Perhatian"}
                </span>
              </div>
            )}
            <p className="text-xs text-slate-500 mt-1">
              Oil Losses / TBS Olah × 100% · Benchmark: ≤1.5%
            </p>
          </CardContent>
        </Card>

        {/* Tahap Kritis */}
        <Card className="border-l-4 border-l-orange-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-600">Tahap Tertinggi</CardTitle>
            <AlertTriangle className="w-4 h-4 text-orange-400" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-28" />
            ) : chartData.length > 0 ? (
              <>
                <div className="text-2xl font-bold text-slate-800">
                  {chartData[0].tahap_proses}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {chartData[0].oil_losses_kg.toLocaleString("id-ID")} kg oil losses bulan ini
                </p>
              </>
            ) : (
              <div className="text-slate-400 text-sm">Belum ada data</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Horizontal Bar Chart */}
      <Card className="shadow-sm border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-rose-500" />
            Breakdown Oil Losses per Tahap Proses
          </CardTitle>
          <p className="text-sm text-slate-500">
            Perbandingan oil losses (kg) di setiap tahap pengolahan — bulan ini.
          </p>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-[260px] w-full" />
          ) : chartData.length === 0 ? (
            <div className="h-[260px] flex items-center justify-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <div className="text-center">
                <Droplets className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                <p>Belum ada data losses. Catat losses pertama!</p>
              </div>
            </div>
          ) : (
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={chartData}
                  margin={{ top: 4, right: 60, left: 8, bottom: 4 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis
                    type="number"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 12 }}
                    unit=" kg"
                  />
                  <YAxis
                    type="category"
                    dataKey="tahap_proses"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#334155", fontSize: 13, fontWeight: 600 }}
                    width={80}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(241,245,249,0.8)" }} />
                  <Bar dataKey="oil_losses_kg" name="Oil Losses (kg)" radius={[0, 6, 6, 0]} maxBarSize={36}>
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={STAGE_FILL[Math.min(index, STAGE_FILL.length - 1)]}
                      />
                    ))}
                    <LabelList
                      dataKey="oil_losses_kg"
                      position="right"
                      formatter={(v: number) => `${v.toLocaleString("id-ID")} kg`}
                      style={{ fill: "#64748b", fontSize: 12, fontWeight: 600 }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
