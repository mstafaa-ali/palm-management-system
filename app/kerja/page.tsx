"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Play,
  Square,
  MapPin,
  Scale,
  Clock,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { z } from "zod";

// --- MOCK DATA: Konteks Anggota ---
const USER_PROFILE = {
  name: "Daru Widiyatmoko",
  nik: "6472032704720004", // NIK yang valid dan memiliki data lahan di DB
  defaultLocation: "Desa Loleng",
};

// --- ZOD SCHEMA ---
const tonaseSchema = z.coerce
  .number({
    invalid_type_error: "Harus berupa angka",
    required_error: "Tonase wajib diisi",
  })
  .positive("Tonase harus lebih dari 0");

export default function InputKerjaPage() {
  // --- UI STATES ---
  // 'idle' | 'active' | 'input'
  const [appState, setAppState] = useState<"idle" | "active" | "input">("idle");

  // Timer & Coordinate State
  const [seconds, setSeconds] = useState(0);
  const [coords, setCoords] = useState<string>("Pencarian GPS...");
  const [checkInTime, setCheckInTime] = useState<Date | null>(null);

  // Form State
  const [locations, setLocations] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(true);
  const [selectedLocationId, setSelectedLocationId] = useState("");
  const [tonaseInput, setTonaseInput] = useState<string>("");
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Local Log Data
  const [logs, setLogs] = useState<
    Array<{ id: number; location: string; duration: string; tonase: number }>
  >([]);

  // --- DATA FETCHING LOKASI & HISTORY ---
  useEffect(() => {
    async function fetchData() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
        
        // Fetch Lokasi
        const resLands = await fetch(`${apiUrl}/api/lands/user/${USER_PROFILE.nik}`);
        if(resLands.ok) {
          const json = await resLands.json();
          const landsData = json.data?.lahan || [];
          const mappedLocs = landsData.map((l: any) => ({
            id: l.id,
            name: l.lokasi_kebun || "Lahan Tanpa Nama"
          }));

          setLocations(mappedLocs);
          if (mappedLocs.length > 0) {
            setSelectedLocationId(mappedLocs[0].id);
          }
        }

        // Fetch History Aktivitas Hari Ini
        const resLogs = await fetch(`${apiUrl}/api/work-logs/user/${USER_PROFILE.nik}`);
        if(resLogs.ok) {
          const jsonLogs = await resLogs.json();
          const fetchedLogs = jsonLogs.data || [];
          // Mapping db logs ke format UI tabel
          const finalLogs = fetchedLogs.map((log: any) => {
            // Kalkulasi durasi manual untuk teks badge
            const start = new Date(log.check_in_time);
            const end = new Date(log.check_out_time);
            const diffSeconds = Math.floor((end.getTime() - start.getTime()) / 1000);
            
            const h = Math.floor(diffSeconds / 3600).toString().padStart(2, "0");
            const m = Math.floor((diffSeconds % 3600) / 60).toString().padStart(2, "0");
            const s = (diffSeconds % 60).toString().padStart(2, "0");

            return {
              id: log.id,
              location: log.location,
              duration: `${h}:${m}:${s}`,
              tonase: log.tonase
            };
          });
          setLogs(finalLogs);
        }

      } catch (e) {
        console.error("Gagal load data:", e);
      } finally {
        setIsLoadingLocations(false);
      }
    }
    fetchData();
  }, []);

  // --- TIMER LOGIC ---
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (appState === "active") {
      interval = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [appState]);

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600)
      .toString()
      .padStart(2, "0");
    const m = Math.floor((totalSeconds % 3600) / 60)
      .toString()
      .padStart(2, "0");
    const s = (totalSeconds % 60).toString().padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  // --- ACTIONS ---
  const handleStartWork = () => {
    // Simulasi GPS Navigator
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords(
            `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`,
          );
          setAppState("active");
          setSeconds(0);
          setCheckInTime(new Date());
          setSuccessMsg(null); // Clear notif jika ada
        },
        (error) => {
          console.warn("GPS error:", error.message);
          setCoords("Akses GPS Ditolak / Gagal");
          setAppState("active");
          setSeconds(0);
        },
        { timeout: 10000, enableHighAccuracy: true },
      );
    } else {
      setCoords("GPS Tidak Didukung di Perangkat Ini");
      setAppState("active");
      setSeconds(0);
      setCheckInTime(new Date());
      setSuccessMsg(null);
    }
  };

  const handleStopWork = () => {
    setAppState("input");
  };

  const handleSubmitTonase = async () => {
    // Validasi Zod
    const result = tonaseSchema.safeParse(tonaseInput);
    if (!result.success) {
      setFormError(
        result.error.errors?.[0]?.message || "Input tonase tidak valid",
      );
      return;
    }

    if (!checkInTime) {
      setFormError("Check-in time tidak ditemukan.");
      return;
    }

    setFormError(null);
    setIsSubmitting(true);

    const checkoutT = new Date();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

    try {
      const payload = {
        worker_nik: USER_PROFILE.nik,
        land_id: selectedLocationId,
        check_in_time: checkInTime.toISOString(),
        check_out_time: checkoutT.toISOString(),
        tonase: result.data,
      };

      const res = await fetch(`${apiUrl}/api/work-logs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const jsonRes = await res.json();

      if (!res.ok) {
        throw new Error(jsonRes.message || "Terjadi kesalahan server");
      }

      // Refresh History Langsung dari backend agar akurat
      try {
        const resLogs = await fetch(`${apiUrl}/api/work-logs/user/${USER_PROFILE.nik}`);
        if(resLogs.ok) {
          const jsonLogs = await resLogs.json();
          const fetchedLogs = jsonLogs.data || [];
          const finalLogs = fetchedLogs.map((log: any) => {
            const start = new Date(log.check_in_time);
            const end = new Date(log.check_out_time);
            const diffSeconds = Math.floor((end.getTime() - start.getTime()) / 1000);
            const h = Math.floor(diffSeconds / 3600).toString().padStart(2, "0");
            const m = Math.floor((diffSeconds % 3600) / 60).toString().padStart(2, "0");
            const s = (diffSeconds % 60).toString().padStart(2, "0");
            return { id: log.id, location: log.location, duration: `${h}:${m}:${s}`, tonase: log.tonase };
          });
          setLogs(finalLogs);
        }
      } catch(e) {}

      // Trigger Notifikasi Sukses Lokal
      setSuccessMsg(`Log panen ${result.data} Ton berhasil dikirim!`);
      setTimeout(() => setSuccessMsg(null), 4000);

      // Reset Flow
      setAppState("idle");
      setSeconds(0);
      setTonaseInput("");
      setCheckInTime(null);
      setCoords("Pencarian GPS...");
    } catch (err: any) {
      console.error(err);
      setFormError(err.message || "Gagal terkoneksi ke server API");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- RENDER HELPERS ---
  const todayDate = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <div className="w-full max-w-md mx-auto space-y-6 pb-20">
      {/* 1. HEADER MOBILE */}
      <div className="bg-white p-6 rounded-b-3xl shadow-sm border-b border-slate-100">
        <p className="text-sm font-medium text-slate-500 mb-1">{todayDate}</p>
        <h1 className="text-2xl font-bold text-palm-dark">
          Halo, {USER_PROFILE.name}! 👋
        </h1>
        <p className="text-xs text-slate-400 font-mono mt-1">
          NIK: {USER_PROFILE.nik}
        </p>

        {/* Global Notification Banner */}
        {successMsg && (
          <div className="mt-4 bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-lg text-sm font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-300">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            {successMsg}
          </div>
        )}
      </div>

      <div className="px-4 space-y-6">
        {/* 2. MAIN CARD: LOGIC STATUS */}
        <Card className="border-none shadow-md rounded-2xl overflow-hidden">
          <div className="h-1.5 w-full bg-slate-100">
            <div
              className={`h-full transition-all duration-500 ${
                appState === "active"
                  ? "bg-palm-accent w-1/2"
                  : appState === "input"
                    ? "bg-palm-primary w-full"
                    : "bg-slate-300 w-0"
              }`}
            />
          </div>

          <CardHeader className="text-center pb-2">
            <CardTitle className="text-lg font-bold text-slate-700">
              {appState === "idle" && "Status: Standby"}
              {appState === "active" && "Status: Sedang Kerja"}
              {appState === "input" && "Input Hasil Panen"}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6 pt-4 pb-8">
            {/* --- STATE: IDLE --- */}
            {appState === "idle" && (
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-2">
                  <Play className="w-10 h-10 text-slate-300 ml-1" />
                </div>
                <p className="text-center text-sm text-slate-500 px-4">
                  Tekan tombol di bawah saat Anda siap memulai pekerjaan di
                  lahan. GPS akan dinyalakan otomatis.
                </p>
                <Button
                  onClick={handleStartWork}
                  className="w-full py-8 text-lg font-bold bg-palm-primary hover:bg-palm-primary/90 text-white rounded-xl shadow-lg shadow-palm-primary/20 transition-transform active:scale-95"
                >
                  <Play className="w-6 h-6 mr-2 fill-current" /> MULAI KERJA
                </Button>
              </div>
            )}

            {/* --- STATE: ACTIVE --- */}
            {appState === "active" && (
              <div className="flex flex-col items-center justify-center space-y-6">
                <div className="text-center space-y-2">
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest">
                    Durasi Kerja
                  </p>
                  <h2 className="text-6xl font-black text-palm-dark font-mono tracking-tighter">
                    {formatTime(seconds)}
                  </h2>
                </div>

                <div className="w-full bg-slate-50 rounded-xl p-4 border border-slate-100 flex items-start gap-4">
                  <MapPin className="w-6 h-6 text-palm-accent shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase">
                      Lokasi Tracking
                    </p>
                    <p className="font-semibold text-slate-700">
                      {USER_PROFILE.defaultLocation}
                    </p>
                    <p className="text-[10px] text-slate-500 font-mono mt-1">
                      {coords}
                    </p>
                  </div>
                </div>

                <Button
                  onClick={handleStopWork}
                  className="w-full py-8 text-lg font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-lg shadow-rose-600/20 transition-transform active:scale-95"
                >
                  <Square className="w-6 h-6 mr-2 fill-current" /> SELESAI KERJA
                </Button>
              </div>
            )}

            {/* --- STATE: INPUT --- */}
            {appState === "input" && (
              <div className="space-y-5">
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
                  <p className="text-sm text-amber-800 font-medium">
                    Total Waktu Anda:{" "}
                    <span className="font-bold">{formatTime(seconds)}</span>
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">
                    Lokasi Lahan
                  </label>
                  <select
                    value={selectedLocationId}
                    onChange={(e) => setSelectedLocationId(e.target.value)}
                    className="flex h-14 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-base ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-palm-primary focus-visible:ring-offset-2 disabled:opacity-50"
                    disabled={isLoadingLocations || locations.length === 0}
                  >
                    {isLoadingLocations ? (
                      <option disabled value="">
                        Memuat Lahan...
                      </option>
                    ) : locations.length === 0 ? (
                      <option disabled value="">
                        Tidak ada lahan terdaftar
                      </option>
                    ) : (
                      locations.map((loc) => (
                        <option key={loc.id} value={loc.id}>
                          {loc.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">
                    Tonase Panen (Ton)
                  </label>
                  <div className="relative">
                    <Scale className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-6 h-6" />
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Contoh: 1.5"
                      value={tonaseInput}
                      onChange={(e) => setTonaseInput(e.target.value)}
                      className={`h-16 pl-14 text-2xl font-bold bg-slate-50 border-2 focus-visible:ring-palm-primary ${
                        formError
                          ? "border-red-500 focus-visible:ring-red-500"
                          : "border-slate-200"
                      }`}
                    />
                  </div>
                  {formError && (
                    <p className="text-xs font-semibold text-red-500 flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3" /> {formError}
                    </p>
                  )}
                </div>

                <div className="pt-4 flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      // Kembali ke mode aktif batal Check-out
                      setAppState("active");
                      setFormError(null);
                    }}
                    className="flex-1 py-6 text-sm font-bold text-slate-600 rounded-xl"
                  >
                    KEMBALI
                  </Button>
                  <Button
                    onClick={handleSubmitTonase}
                    disabled={isSubmitting}
                    className="flex-[2] py-6 text-base font-bold bg-palm-primary hover:bg-palm-primary/90 text-white rounded-xl shadow-md disabled:bg-palm-primary/50"
                  >
                    <CheckCircle2
                      className={`w-5 h-5 mr-2 ${isSubmitting ? "animate-pulse" : ""}`}
                    />
                    {isSubmitting ? "MENYIMPAN..." : "SIMPAN DATA"}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 3. LOG AKTIVITAS HARI INI */}
        <Card className="border-none shadow-sm rounded-2xl overflow-hidden bg-white/50 backdrop-blur-sm">
          <CardHeader className="py-4 border-b border-slate-100">
            <CardTitle className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Clock className="w-4 h-4 text-palm-accent" />
              Aktivitas Hari Ini
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {logs.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-sm text-slate-400 italic">
                  Belum ada data panen hari ini.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow>
                    <TableHead className="text-xs font-semibold h-10">
                      Waktu
                    </TableHead>
                    <TableHead className="text-xs font-semibold h-10">
                      Lokasi
                    </TableHead>
                    <TableHead className="text-right text-xs font-semibold h-10">
                      Hasil
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="py-3">
                        <Badge
                          variant="outline"
                          className="text-[10px] font-mono bg-white"
                        >
                          {log.duration}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-3 text-xs font-medium text-slate-600">
                        {log.location}
                      </TableCell>
                      <TableCell className="py-3 text-right">
                        <span className="text-sm font-bold text-palm-dark">
                          {log.tonase}{" "}
                          <span className="text-[10px] font-normal text-slate-500">
                            Ton
                          </span>
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
