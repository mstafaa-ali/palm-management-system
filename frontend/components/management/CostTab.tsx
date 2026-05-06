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
import { Loader2, Trash2 } from "lucide-react";

export default function CostTab({ landId }: { landId: string }) {
  const [costs, setCosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    tanggal: "",
    jenis_biaya: "Pupuk",
    jumlah_biaya: "",
    keterangan: "",
  });

  const fetchCosts = async () => {
    try {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const res = await fetch(`${apiUrl}/api/costs/land/${landId}`);
      if (res.ok) {
        const json = await res.json();
        setCosts(json.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch costs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCosts();
  }, [landId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const res = await fetch(`${apiUrl}/api/costs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          land_id: landId,
          ...formData,
        }),
      });

      if (!res.ok) throw new Error("Gagal menyimpan data biaya");

      setFormData({
        tanggal: "",
        jenis_biaya: "Pupuk",
        jumlah_biaya: "",
        keterangan: "",
      });
      fetchCosts();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus data biaya ini?")) return;
    try {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const res = await fetch(`${apiUrl}/api/costs/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Gagal menghapus data biaya");
      fetchCosts();
    } catch (err: any) {
      console.error(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Form Tambah Biaya */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-palm-dark">Catat Biaya Baru</CardTitle>
          <CardDescription>Masukkan rincian biaya operasional</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="text-red-500 text-sm bg-red-50 p-2 rounded">{error}</div>}
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Tanggal</label>
              <Input
                type="date"
                required
                value={formData.tanggal}
                onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Jenis Biaya</label>
              <select
                className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={formData.jenis_biaya}
                onChange={(e) => setFormData({ ...formData, jenis_biaya: e.target.value })}
              >
                <option value="Pupuk">Pupuk</option>
                <option value="Upah">Upah</option>
                <option value="Transport">Transport</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Jumlah Biaya (Rp)</label>
              <Input
                type="number"
                min="0"
                required
                placeholder="Misal: 500000"
                value={formData.jumlah_biaya}
                onChange={(e) => setFormData({ ...formData, jumlah_biaya: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Keterangan (Opsional)</label>
              <Input
                type="text"
                placeholder="Catatan tambahan"
                value={formData.keterangan}
                onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
              />
            </div>

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Menyimpan..." : "Simpan Biaya"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Tabel Riwayat Biaya */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-palm-dark">Riwayat Biaya</CardTitle>
          <CardDescription>Daftar pengeluaran yang telah dicatat untuk lahan ini</CardDescription>
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
                    <TableHead>Jenis Biaya</TableHead>
                    <TableHead>Keterangan</TableHead>
                    <TableHead className="text-right">Jumlah (Rp)</TableHead>
                    <TableHead className="text-center w-[80px]">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {costs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-6 text-slate-500">
                        Belum ada data biaya.
                      </TableCell>
                    </TableRow>
                  ) : (
                    costs.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="font-medium">
                          {new Date(c.tanggal).toLocaleDateString("id-ID")}
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                            c.jenis_biaya === "Pupuk" ? "bg-green-100 text-green-700" :
                            c.jenis_biaya === "Upah" ? "bg-blue-100 text-blue-700" :
                            c.jenis_biaya === "Transport" ? "bg-orange-100 text-orange-700" :
                            "bg-slate-100 text-slate-700"
                          }`}>
                            {c.jenis_biaya}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-slate-500">{c.keterangan || "-"}</TableCell>
                        <TableCell className="text-right font-semibold">
                          Rp {Number(c.jumlah_biaya).toLocaleString("id-ID")}
                        </TableCell>
                        <TableCell className="text-center">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8"
                            onClick={() => handleDelete(c.id)}
                            disabled={loading}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
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
