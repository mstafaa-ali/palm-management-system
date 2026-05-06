"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AlertCircle, Leaf } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [nikState, setNikStateFn] = useState("");
  const [nomorHp, setNomorHp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${apiUrl}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Sangat Penting: Menyertakan cookie
        body: JSON.stringify({ nik: nikState, nomor_hp: nomorHp }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Gagal login");
      }

      // Berhasil login, redirect ke halaman kerja / lahan
      router.push("/kerja"); // Atur sesuai kebutuhan, request minta ke /lahan atau /app/lahan, asumsikan /kerja
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan pada server");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md border-none shadow-xl rounded-2xl overflow-hidden">
        <div className="h-2 w-full bg-palm-primary" />
        <CardHeader className="space-y-3 pt-8 pb-6 text-center">
          <div className="mx-auto bg-palm-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-2">
            <Leaf className="w-8 h-8 text-palm-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-800">
            Masuk ke Akun
          </CardTitle>
          <CardDescription className="text-slate-500">
            Masukkan NIK dan Nomor HP Anda untuk melanjutkan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="nik" className="text-slate-700 font-semibold">
                Nomor Induk Kependudukan (NIK)
              </Label>
              <Input
                id="nik"
                type="text"
                placeholder="Masukkan 16 digit NIK"
                value={nikState}
                onChange={(e) => setNikStateFn(e.target.value)}
                required
                className="h-12 rounded-xl border-slate-200 focus-visible:ring-palm-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nomorHp" className="text-slate-700 font-semibold">
                Nomor Handphone
              </Label>
              <Input
                id="nomorHp"
                type="tel"
                placeholder="Contoh: 08123456789"
                value={nomorHp}
                onChange={(e) => setNomorHp(e.target.value)}
                className="h-12 rounded-xl border-slate-200 focus-visible:ring-palm-primary"
              />
            </div>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 text-base font-bold bg-palm-primary hover:bg-palm-primary/90 text-white rounded-xl shadow-md disabled:opacity-70 transition-all"
            >
              {isLoading ? "MEMPROSES..." : "MASUK"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
