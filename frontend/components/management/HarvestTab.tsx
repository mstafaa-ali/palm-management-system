"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2 } from "lucide-react";

export default function HarvestTab({ landId }: { landId: string }) {
  const [harvests, setHarvests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    tanggal_panen: "",
    jumlah_janjang: "",
    estimasi_berat_kg: "",
  });

  const fetchHarvests = async () => {
    try {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const res = await fetch(`${apiUrl}/api/harvests/land/${landId}`);
      if (res.ok) {
        const json = await res.json();
        setHarvests(json.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch harvests:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHarvests();
  }, [landId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const res = await fetch(`${apiUrl}/api/harvests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          land_id: landId,
          ...formData,
        }),
      });

      if (!res.ok) throw new Error("Gagal menyimpan data panen");

      setFormData({
        tanggal_panen: "",
        jumlah_janjang: "",
        estimasi_berat_kg: "",
      });
      fetchHarvests();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Form Tambah Panen */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-palm-dark">Catat Panen Baru</CardTitle>
          <CardDescription>Masukkan hasil panen harian</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="text-red-500 text-sm bg-red-50 p-2 rounded">{error}</div>}
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Tanggal Panen</label>
              <Input
                type="date"
                required
                value={formData.tanggal_panen}
                onChange={(e) => setFormData({ ...formData, tanggal_panen: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Jumlah Janjang</label>
              <Input
                type="number"
                min="1"
                required
                placeholder="Misal: 150"
                value={formData.jumlah_janjang}
                onChange={(e) => setFormData({ ...formData, jumlah_janjang: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Estimasi Berat (Kg)</label>
              <Input
                type="number"
                step="0.01"
                min="0.1"
                required
                placeholder="Misal: 2500"
                value={formData.estimasi_berat_kg}
                onChange={(e) => setFormData({ ...formData, estimasi_berat_kg: e.target.value })}
              />
            </div>

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Menyimpan..." : "Simpan Panen"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Tabel Riwayat Panen */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-palm-dark">Riwayat Panen</CardTitle>
          <CardDescription>Daftar panen yang telah dicatat untuk lahan ini</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Jumlah Janjang</TableHead>
                    <TableHead>Estimasi Berat (Kg)</TableHead>
                    <TableHead>Waktu Input</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {harvests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-6 text-slate-500">
                        Belum ada data panen.
                      </TableCell>
                    </TableRow>
                  ) : (
                    harvests.map((h) => (
                      <TableRow key={h.id}>
                        <TableCell className="font-medium">
                          {new Date(h.tanggal_panen).toLocaleDateString("id-ID")}
                        </TableCell>
                        <TableCell>{h.jumlah_janjang} janjang</TableCell>
                        <TableCell>{h.estimasi_berat_kg} kg</TableCell>
                        <TableCell className="text-sm text-slate-500">
                          {new Date(h.created_at).toLocaleString("id-ID")}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
