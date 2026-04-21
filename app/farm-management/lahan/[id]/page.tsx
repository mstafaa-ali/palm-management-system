"use client";

import React, { useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChevronRight,
  Home,
  MapPin,
  Sprout,
  Building,
  Clock,
  Activity,
  Target,
} from "lucide-react";

// --- MOCK DATA: Berdasarkan sampel (Achmad Idris / Yudi Eka) ---
const MOCK_DATA = {
  id: "lhn-01",
  name: "Desa Bumi Sejahtera",
  status: "Sedang Dipanen", // Bisa juga "Standby"
  owner: {
    name: "Achmad Idris",
    nik: "3201123456780001",
    role: "Pengurus FPKS",
    photo: "AI", // Inisial sebagai placeholder foto
  },
  specs: {
    area: 12.5, // Hektar
    plantAge: 8, // Tahun
    certification: "ISPO",
    partnerMill: "PT PERSADA",
  },
  stats: {
    totalProduction: 145.2, // Ton (Akumulasi riil)
    baselineProduction: 120.0, // Ton (Target / rata-rata historis)
    efficiency: 6.5, // Rata-rata jam/hari
    yieldEstimation: 11.6, // Ton/Ha
  },
  productionHistory: [
    { month: "Jan", actual: 12.4, baseline: 10.0 },
    { month: "Feb", actual: 13.1, baseline: 10.0 },
    { month: "Mar", actual: 11.8, baseline: 10.0 },
    { month: "Apr", actual: 14.2, baseline: 10.0 },
    { month: "Mei", actual: 15.0, baseline: 10.0 },
    { month: "Jun", actual: 14.8, baseline: 10.0 },
  ],
  recentActivities: [
    { id: 1, name: "Yudi Eka", start: "06:00", end: "14:00", tonnage: 2.1 },
    { id: 2, name: "Budi Santoso", start: "06:30", end: "13:30", tonnage: 1.8 },
    { id: 3, name: "Achmad Idris", start: "07:00", end: "15:00", tonnage: 2.5 },
    { id: 4, name: "Supriadi", start: "06:00", end: "12:00", tonnage: 1.5 },
  ],
};

export default function LahanDetailPage() {
  const params = useParams();
  const data = MOCK_DATA; // Dalam skenario nyata, ini di-fetch menggunakan params.id

  // --- LOGIKA TRACKING KINERJA & STATISTIK ---
  // Menghitung selisih persentase (Growth/Deficit) dari Produksi Riil dibandingkan dengan Baseline
  const diffPercent = useMemo(() => {
    const diff = data.stats.totalProduction - data.stats.baselineProduction;
    return ((diff / data.stats.baselineProduction) * 100).toFixed(1);
  }, [data.stats.totalProduction, data.stats.baselineProduction]);

  const isPositive = parseFloat(diffPercent) >= 0;

  return (
    <div className="space-y-6">
      {/* 1. Header Section & Breadcrumb */}
      <div className="flex items-center text-sm text-slate-500 gap-2 mb-2">
        <Link
          href="/"
          className="hover:text-palm-primary transition-colors flex items-center gap-1"
        >
          <Home className="w-4 h-4" /> Home
        </Link>
        <ChevronRight className="w-4 h-4" />
        <Link
          href="/farm-management"
          className="hover:text-palm-primary transition-colors"
        >
          Manajemen Lahan
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-slate-800 font-medium">Detail {data.name}</span>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-palm-dark flex items-center gap-3">
            {data.name}
            {/* Badge Status */}
            <Badge
              variant={
                data.status === "Sedang Dipanen" ? "default" : "secondary"
              }
              className={
                data.status === "Sedang Dipanen"
                  ? "bg-palm-primary hover:bg-palm-primary/90 text-white"
                  : ""
              }
            >
              {data.status}
            </Badge>
          </h1>
          <p className="text-slate-500 mt-1 flex items-center gap-1">
            <MapPin className="w-4 h-4" /> Lokasi Aset FPKS
          </p>
        </div>
      </div>

      {/* 2. Top Stats Grid (4 Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Produksi vs Baseline Logic */}
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Produksi
                </p>
                <h3 className="text-3xl font-bold text-palm-dark mt-2">
                  {data.stats.totalProduction}{" "}
                  <span className="text-lg text-slate-500 font-medium">
                    Ton
                  </span>
                </h3>
              </div>
              <div className="p-3 bg-palm-primary/10 rounded-lg text-palm-primary">
                <Activity className="w-5 h-5" />
              </div>
            </div>
            {/* Persentase Selisih */}
            <div className="mt-4 flex items-center gap-2 text-sm">
              <span
                className={`font-semibold ${
                  isPositive ? "text-green-600" : "text-red-600"
                }`}
              >
                {isPositive ? "+" : ""}
                {diffPercent}%
              </span>
              <span className="text-slate-500">vs baseline produksi</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Baseline Produksi
                </p>
                <h3 className="text-3xl font-bold text-palm-dark mt-2">
                  {data.stats.baselineProduction}{" "}
                  <span className="text-lg text-slate-500 font-medium">
                    Ton
                  </span>
                </h3>
              </div>
              <div className="p-3 bg-slate-100 rounded-lg text-slate-600">
                <Target className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 text-sm text-slate-500">
              Rata-rata target historis
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Efisiensi Kerja
                </p>
                <h3 className="text-3xl font-bold text-palm-dark mt-2">
                  {data.stats.efficiency}{" "}
                  <span className="text-lg text-slate-500 font-medium">
                    Jam/Hari
                  </span>
                </h3>
              </div>
              <div className="p-3 bg-palm-accent/10 rounded-lg text-palm-accent">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 text-sm text-slate-500">
              Rata-rata durasi kerja anggota
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Estimasi Yield
                </p>
                <h3 className="text-3xl font-bold text-palm-dark mt-2">
                  {data.stats.yieldEstimation}{" "}
                  <span className="text-lg text-slate-500 font-medium">
                    Ton/Ha
                  </span>
                </h3>
              </div>
              <div className="p-3 bg-palm-primary/10 rounded-lg text-palm-primary">
                <Sprout className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 text-sm text-slate-500">
              Kinerja tonase per hektar
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom Kiri - Main Info (Grafik & Tabel Aktivitas) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Grafik Recharts */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-bold text-palm-dark">
                Tren Produksi vs Baseline
              </CardTitle>
              <CardDescription>
                Visualisasi bulanan output riil kebun terhadap ekspektasi.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[320px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={data.productionHistory}
                    margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#e2e8f0"
                    />
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#64748b", fontSize: 13 }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#64748b", fontSize: 13 }}
                      dx={-10}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "8px",
                        border: "none",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                    />
                    <Legend
                      iconType="circle"
                      wrapperStyle={{ paddingTop: "20px" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="actual"
                      name="Produksi Riil"
                      stroke="#065F46" // --color-palm-primary
                      strokeWidth={3}
                      dot={{ r: 5, fill: "#065F46", strokeWidth: 0 }}
                      activeDot={{ r: 7 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="baseline"
                      name="Baseline Produksi"
                      stroke="#F59E0B" // --color-palm-accent
                      strokeWidth={3}
                      strokeDasharray="5 5"
                      dot={{ r: 0 }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Tabel Log Aktivitas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-bold text-palm-dark">
                Log Aktivitas Terakhir
              </CardTitle>
              <CardDescription>
                Tracking kinerja anggota di lahan berdasarkan jam kerja dan
                hasil panen.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead className="font-semibold text-slate-700">
                        Nama Anggota
                      </TableHead>
                      <TableHead className="font-semibold text-slate-700">
                        Jam Berangkat
                      </TableHead>
                      <TableHead className="font-semibold text-slate-700">
                        Jam Selesai
                      </TableHead>
                      <TableHead className="font-semibold text-slate-700">
                        Durasi Kerja
                      </TableHead>
                      <TableHead className="text-right font-semibold text-slate-700">
                        Tonase (Ton)
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.recentActivities.map((act) => {
                      // Logika Sederhana Menghitung Durasi Jam Kerja
                      const startH = parseInt(act.start.split(":")[0]);
                      const endH = parseInt(act.end.split(":")[0]);
                      const duration = endH - startH;

                      return (
                        <TableRow key={act.id} className="hover:bg-slate-50/50">
                          <TableCell className="font-medium text-slate-900">
                            {act.name}
                          </TableCell>
                          <TableCell>{act.start}</TableCell>
                          <TableCell>{act.end}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className="font-normal text-slate-600 border-slate-200"
                            >
                              {duration} Jam
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-semibold text-palm-dark">
                            {act.tonnage}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Kolom Kanan - Side Info (Profil & Spesifikasi Lahan) */}
        <div className="space-y-6">
          {/* Card Profil Pemilik / Anggota */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold text-palm-dark">
                Profil Pengelola Lahan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-palm-primary/10 flex items-center justify-center text-xl font-bold text-palm-primary shrink-0 border border-palm-primary/20">
                  {data.owner.photo}
                </div>
                <div>
                  <h4 className="font-bold text-palm-dark text-lg">
                    {data.owner.name}
                  </h4>
                  <div className="mt-1">
                    <Badge className="bg-palm-accent hover:bg-palm-accent/90 text-white font-medium border-none shadow-none">
                      {data.owner.role}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-100">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">NIK / ID</span>
                  <span className="font-semibold text-slate-800">
                    {data.owner.nik}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Status Keaktifan</span>
                  <span className="font-semibold text-green-600">Aktif</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card Spesifikasi Lahan */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-bold text-palm-dark">
                Spesifikasi Aset
              </CardTitle>
              <CardDescription>
                Informasi detail operasional lahan.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Luas & Usia */}
                <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100 transition-colors hover:border-slate-200">
                  <div className="p-2.5 bg-white rounded-lg shadow-sm border border-slate-100 text-palm-primary">
                    <Sprout className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500 mb-0.5">
                      Luas & Usia Tanaman
                    </p>
                    <p className="font-bold text-slate-800">
                      {data.specs.area} Ha
                      <span className="text-slate-400 font-normal mx-1">|</span>
                      {data.specs.plantAge} Tahun
                    </p>
                  </div>
                </div>

                {/* Sertifikasi */}
                <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100 transition-colors hover:border-slate-200">
                  <div className="p-2.5 bg-white rounded-lg shadow-sm border border-slate-100 text-palm-accent">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500 mb-0.5">
                      Sertifikasi Kebun
                    </p>
                    <p className="font-bold text-slate-800">
                      {data.specs.certification}
                    </p>
                  </div>
                </div>

                {/* Mitra PKS */}
                <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100 transition-colors hover:border-slate-200">
                  <div className="p-2.5 bg-white rounded-lg shadow-sm border border-slate-100 text-slate-600">
                    <Building className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500 mb-0.5">
                      Mitra PKS (Tujuan)
                    </p>
                    <p className="font-bold text-slate-800">
                      {data.specs.partnerMill}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
