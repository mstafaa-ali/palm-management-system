"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { RefreshCw, Droplets, Trash2 } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface LossData {
  id: string;
  tanggal: string;
  tahap_proses: string;
  jenis_losses: string;
  losses_kg: number;
  kadar_minyak_persen: number | null;
  oil_losses_kg: number | null;
  catatan: string | null;
}

interface LossesTableProps {
  refreshTrigger: number;
  onRefresh: () => void;
}

// ─── Badge color per stage ────────────────────────────────────────────────────
const STAGE_COLORS: Record<string, string> = {
  Sterilizer: "bg-sky-100 text-sky-700",
  Thresher: "bg-violet-100 text-violet-700",
  Digester: "bg-amber-100 text-amber-700",
  Press: "bg-rose-100 text-rose-700",
  Clarifier: "bg-emerald-100 text-emerald-700",
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function LossesTable({ refreshTrigger, onRefresh }: LossesTableProps) {
  const [data, setData]     = useState<LossData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [refreshTrigger]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/mill-losses`);
      const result = await res.json();
      if (result.success) setData(result.data);
    } catch (err) {
      console.error("Error fetching mill losses:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus data losses ini?")) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/mill-losses/${id}`, {
        method: "DELETE",
      });
      if (res.ok) onRefresh();
    } catch (err) {
      console.error("Error deleting loss:", err);
    }
  };

  return (
    <Card className="shadow-sm border-slate-200">
      <CardHeader className="bg-slate-50 border-b border-slate-100 flex flex-row items-center justify-between pb-4">
        <div>
          <CardTitle className="text-lg font-bold text-slate-800">
            Riwayat Losses Harian
          </CardTitle>
          <CardDescription>
            Detail pencatatan kehilangan minyak per tahap pengolahan.
          </CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={loading}
          className="text-slate-600"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="font-semibold text-slate-700">Tanggal</TableHead>
                <TableHead className="font-semibold text-slate-700">Tahap</TableHead>
                <TableHead className="font-semibold text-slate-700">Jenis</TableHead>
                <TableHead className="font-semibold text-slate-700 text-right">
                  Losses (Kg)
                </TableHead>
                <TableHead className="font-semibold text-slate-700 text-right">
                  Kadar (%)
                </TableHead>
                <TableHead className="font-semibold text-slate-700 text-right">
                  Oil Losses (Kg)
                </TableHead>
                <TableHead className="font-semibold text-slate-700">Catatan</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                Array(4)
                  .fill(0)
                  .map((_, i) => (
                    <TableRow key={i}>
                      {Array(8)
                        .fill(0)
                        .map((__, j) => (
                          <TableCell key={j}>
                            <Skeleton className="h-4 w-full" />
                          </TableCell>
                        ))}
                    </TableRow>
                  ))
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                      <Droplets className="w-8 h-8 text-slate-300" />
                      <p>Belum ada data losses. Klik "Catat Losses" untuk memulai.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                data.map((row) => (
                  <TableRow key={row.id} className="hover:bg-slate-50/50">
                    <TableCell className="font-medium text-slate-700 whitespace-nowrap">
                      {format(new Date(row.tanggal), "dd MMM yyyy")}
                    </TableCell>

                    <TableCell>
                      <Badge
                        className={`text-xs font-medium ${STAGE_COLORS[row.tahap_proses] ?? "bg-slate-100 text-slate-700"}`}
                      >
                        {row.tahap_proses}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-slate-600 text-sm">
                      {row.jenis_losses}
                    </TableCell>

                    <TableCell className="text-right font-medium text-slate-800">
                      {Number(row.losses_kg).toLocaleString("id-ID")}
                    </TableCell>

                    <TableCell className="text-right text-slate-600">
                      {row.kadar_minyak_persen != null
                        ? `${Number(row.kadar_minyak_persen).toFixed(2)}%`
                        : "—"}
                    </TableCell>

                    <TableCell className="text-right">
                      {row.oil_losses_kg != null ? (
                        <span className="text-rose-600 font-semibold">
                          {Number(row.oil_losses_kg).toLocaleString("id-ID")}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </TableCell>

                    <TableCell
                      className="text-slate-500 text-sm max-w-[160px] truncate"
                      title={row.catatan ?? ""}
                    >
                      {row.catatan || "—"}
                    </TableCell>

                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-7 h-7 text-slate-400 hover:text-red-500 hover:bg-red-50"
                        onClick={() => handleDelete(row.id)}
                        title="Hapus"
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
      </CardContent>
    </Card>
  );
}
