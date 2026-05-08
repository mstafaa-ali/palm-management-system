"use client";

import { useEffect, useState } from "react";
import { WeighbridgeLog } from "@/types/weighbridge";
import { Badge } from "@/components/ui/badge";
import TaraInputDialog from "./TaraInputDialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

export default function WeighbridgeTable({ refreshTrigger, onRefresh }: { refreshTrigger: number, onRefresh: () => void }) {
  const [logs, setLogs] = useState<WeighbridgeLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterTanggal, setFilterTanggal] = useState(new Date().toISOString().split("T")[0]);
  const [filterSumber, setFilterSumber] = useState("all");

  useEffect(() => {
    fetchLogs();
  }, [refreshTrigger, filterTanggal, filterSumber]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      let url = `${process.env.NEXT_PUBLIC_API_URL}/api/weighbridge?tanggal=${filterTanggal}`;
      if (filterSumber !== "all") {
        url += `&sumber=${filterSumber}`;
      }
      const res = await fetch(url);
      const json = await res.json();
      if (json.success) {
        setLogs(json.data);
      }
    } catch (error) {
      console.error("Failed to fetch weighbridge logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const antreanAktif = logs.filter(log => log.status === "masuk");
  const riwayatSelesai = logs.filter(log => log.status === "selesai");

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 mt-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
        <h2 className="text-xl font-bold text-slate-800">Data Timbangan</h2>
        <div className="flex gap-2 w-full md:w-auto">
          <Input 
            type="date" 
            value={filterTanggal} 
            onChange={(e) => setFilterTanggal(e.target.value)} 
            className="w-full md:w-auto"
          />
          <Select value={filterSumber} onValueChange={setFilterSumber}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Semua Sumber" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Sumber</SelectItem>
              <SelectItem value="Internal">Internal</SelectItem>
              <SelectItem value="Eksternal">Eksternal</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="antrean" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="antrean">Antrean Aktif ({antreanAktif.length})</TabsTrigger>
          <TabsTrigger value="riwayat">Riwayat Hari Ini ({riwayatSelesai.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="antrean">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Jam Masuk</TableHead>
                  <TableHead>No. Kendaraan</TableHead>
                  <TableHead>Sumber</TableHead>
                  <TableHead>Bruto (kg)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-4 text-slate-500">Memuat data...</TableCell></TableRow>
                ) : antreanAktif.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-4 text-slate-500">Tidak ada antrean aktif.</TableCell></TableRow>
                ) : (
                  antreanAktif.map(log => (
                    <TableRow key={log.id}>
                      <TableCell>{formatDate(log.waktu_masuk)}</TableCell>
                      <TableCell className="font-medium">{log.nomor_kendaraan}</TableCell>
                      <TableCell>
                        <Badge variant={log.sumber === "Internal" ? "default" : "secondary"} className={log.sumber === "Internal" ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"}>
                          {log.sumber}
                        </Badge>
                      </TableCell>
                      <TableCell>{log.berat_bruto_kg}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-200">Menunggu Tara</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <TaraInputDialog 
                          id={log.id} 
                          nomor_kendaraan={log.nomor_kendaraan} 
                          berat_bruto_kg={log.berat_bruto_kg}
                          onSuccess={onRefresh}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="riwayat">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Jam Masuk - Keluar</TableHead>
                  <TableHead>No. Kendaraan</TableHead>
                  <TableHead>Sumber</TableHead>
                  <TableHead>Bruto (kg)</TableHead>
                  <TableHead>Tara (kg)</TableHead>
                  <TableHead>Netto (kg)</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-4 text-slate-500">Memuat data...</TableCell></TableRow>
                ) : riwayatSelesai.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-4 text-slate-500">Tidak ada riwayat hari ini.</TableCell></TableRow>
                ) : (
                  riwayatSelesai.map(log => (
                    <TableRow key={log.id}>
                      <TableCell>{formatDate(log.waktu_masuk)} - {log.waktu_keluar ? formatDate(log.waktu_keluar) : '-'}</TableCell>
                      <TableCell className="font-medium">{log.nomor_kendaraan}</TableCell>
                      <TableCell>
                        <Badge variant={log.sumber === "Internal" ? "default" : "secondary"} className={log.sumber === "Internal" ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"}>
                          {log.sumber}
                        </Badge>
                      </TableCell>
                      <TableCell>{log.berat_bruto_kg}</TableCell>
                      <TableCell>{log.berat_tara_kg}</TableCell>
                      <TableCell className="font-bold text-green-600">{log.berat_netto_kg}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">Selesai</Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
