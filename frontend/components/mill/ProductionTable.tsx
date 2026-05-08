import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FileDown, Calendar as CalendarIcon, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProductionData {
  id: string;
  tanggal_produksi: string;
  tbs_olah_kg: number;
  cpo_dihasilkan_kg: number;
  pk_dihasilkan_kg: number;
  oer_persen: number;
  ker_persen: number;
  catatan: string | null;
}

interface ProductionTableProps {
  refreshTrigger: number;
  onRefresh: () => void;
}

export default function ProductionTable({ refreshTrigger, onRefresh }: ProductionTableProps) {
  const [data, setData] = useState<ProductionData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [refreshTrigger]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const response = await fetch(`${apiUrl}/api/mill-production`);
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error("Error fetching mill productions:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-sm border-slate-200">
      <CardHeader className="bg-slate-50 border-b border-slate-100 flex flex-row items-center justify-between pb-4">
        <div>
          <CardTitle className="text-lg font-bold text-slate-800">Riwayat Produksi Harian</CardTitle>
          <CardDescription>Daftar lengkap data olah TBS dan rendemen per hari.</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onRefresh} disabled={loading} className="text-slate-600">
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" className="text-slate-600">
            <FileDown className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="font-semibold text-slate-700">Tanggal</TableHead>
                <TableHead className="font-semibold text-slate-700 text-right">TBS Olah (Kg)</TableHead>
                <TableHead className="font-semibold text-slate-700 text-right">CPO (Kg)</TableHead>
                <TableHead className="font-semibold text-slate-700 text-right">PK (Kg)</TableHead>
                <TableHead className="font-semibold text-slate-700 text-center">OER (%)</TableHead>
                <TableHead className="font-semibold text-slate-700 text-center">KER (%)</TableHead>
                <TableHead className="font-semibold text-slate-700">Catatan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12 mx-auto" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12 mx-auto" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  </TableRow>
                ))
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <CalendarIcon className="w-8 h-8 text-slate-300" />
                      <p>Belum ada riwayat produksi.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                data.map((row) => (
                  <TableRow key={row.id} className="hover:bg-slate-50/50">
                    <TableCell className="font-medium text-slate-700">
                      {format(new Date(row.tanggal_produksi), "dd MMM yyyy")}
                    </TableCell>
                    <TableCell className="text-right">{row.tbs_olah_kg.toLocaleString("id-ID")}</TableCell>
                    <TableCell className="text-right text-orange-600 font-medium">
                      {row.cpo_dihasilkan_kg.toLocaleString("id-ID")}
                    </TableCell>
                    <TableCell className="text-right text-purple-600 font-medium">
                      {row.pk_dihasilkan_kg.toLocaleString("id-ID")}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={row.oer_persen >= 22 ? "default" : "destructive"} className={row.oer_persen >= 22 ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200" : "bg-red-100 text-red-800 hover:bg-red-200"}>
                        {row.oer_persen}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={row.ker_persen >= 5 ? "default" : "secondary"} className={row.ker_persen >= 5 ? "bg-blue-100 text-blue-800 hover:bg-blue-200" : "bg-slate-100 text-slate-800 hover:bg-slate-200"}>
                        {row.ker_persen}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-500 text-sm max-w-[200px] truncate" title={row.catatan || "-"}>
                      {row.catatan || "-"}
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
