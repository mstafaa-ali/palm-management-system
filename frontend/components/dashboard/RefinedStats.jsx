"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sprout, TrendingUp, DollarSign, Activity, Truck } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const chartData = [
  { day: "1", actual: 40 },
  { day: "5", actual: 70 },
  { day: "10", actual: 45 },
  { day: "15", actual: 90 },
  { day: "20", actual: 65 },
  { day: "25", actual: 80 },
  { day: "30", actual: 85 },
];

export default function RefinedStats() {
  return (
    <div className="space-y-6">
      {/* Row 1: KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Panen"
          value="1.240"
          unit="Ton"
          trend="12.5"
          isPositive={true}
          icon={<Sprout className="w-5 h-5" />}
          bgColor="bg-palm-primary/10"
          textColor="text-palm-primary"
        />
        <StatCard
          title="Rata-rata OER"
          value="23.4"
          unit="%"
          trend="0.4"
          isPositive={false}
          icon={<TrendingUp className="w-5 h-5" />}
          bgColor="bg-palm-accent/10"
          textColor="text-palm-accent"
        />
        <StatCard
          title="Harga TBS Rata2"
          value="2.650"
          unit="Rp/Kg"
          trend="50"
          trendUnit="Rp"
          isPositive={true}
          icon={<DollarSign className="w-5 h-5" />}
          bgColor="bg-blue-50"
          textColor="text-blue-600"
        />
        <StatCard
          title="Cost / Kg"
          value="1.120"
          unit="Rp/Kg"
          trend="2.0"
          trendUnit="%"
          isPositive={true}
          icon={<Activity className="w-5 h-5" />}
          bgColor="bg-slate-100"
          textColor="text-slate-600"
        />
      </div>

      {/* Row 2: Charts & Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recharts BarChart */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg font-bold text-palm-dark">Tren Produksi 30 Hari Terakhir</CardTitle>
              <CardDescription>Akumulasi tonase TBS yang diterima dari seluruh blok.</CardDescription>
            </div>
            <select className="text-sm border-slate-200 rounded-md p-1.5 outline-none font-normal bg-slate-50 border">
              <option>Semua Blok</option>
            </select>
          </CardHeader>
          <CardContent>
            <div className="h-[320px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 13 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 13 }} dx={-10} />
                  <Tooltip
                    cursor={{ fill: '#f1f5f9' }}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Bar dataKey="actual" name="Truk (Ton)" fill="#065F46" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Tabel Aktivitas Terakhir */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-palm-dark">Truk Terakhir Masuk</CardTitle>
            <CardDescription>Antrean timbangan di PKS.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <div className="space-y-4 flex-1">
              <RecentActivity
                id="TKT-001"
                source="Blok Alpha"
                weight="7.2 Ton"
                status="Selesai"
              />
              <RecentActivity
                id="TKT-002"
                source="Blok Bravo"
                weight="6.8 Ton"
                status="Selesai"
              />
              <RecentActivity
                id="TKT-003"
                source="Petani Mitra"
                weight="4.5 Ton"
                status="Proses"
              />
            </div>
            <Button variant="outline" className="w-full mt-6 text-palm-primary hover:text-palm-primary hover:bg-slate-50 border-slate-200">
              Lihat Semua Antrean
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, unit, trend, trendUnit = "%", isPositive, icon, bgColor, textColor }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-slate-500">
              {title}
            </p>
            <h3 className="text-3xl font-bold text-palm-dark mt-2">
              {value} <span className="text-lg text-slate-500 font-medium">{unit}</span>
            </h3>
          </div>
          <div className={`p-3 rounded-lg ${bgColor} ${textColor}`}>
            {icon}
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2 text-sm">
          <span
            className={`font-semibold flex items-center ${
              isPositive ? "text-green-600" : "text-red-600"
            }`}
          >
            {isPositive ? "+" : "-"}
            {trend}
            {trendUnit}
          </span>
          <span className="text-slate-500">vs bln lalu</span>
        </div>
      </CardContent>
    </Card>
  );
}

function RecentActivity({ id, source, weight, status }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0 last:pb-0">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-slate-50 rounded-md border border-slate-100 text-slate-500">
          <Truck className="w-4 h-4" />
        </div>
        <div>
          <p className="text-sm font-bold text-palm-dark">{id}</p>
          <p className="text-xs text-slate-500">{source}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-semibold text-slate-800">{weight}</p>
        <Badge
          variant="outline"
          className={`mt-1 font-normal text-[10px] uppercase border-none px-2 py-0.5 ${
            status === "Selesai"
              ? "bg-emerald-50 text-emerald-600"
              : "bg-palm-accent/10 text-palm-accent"
          }`}
        >
          {status}
        </Badge>
      </div>
    </div>
  );
}
