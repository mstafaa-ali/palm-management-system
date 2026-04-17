"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Download, Edit2, Sprout, Tractor, Wallet } from "lucide-react";

export default function ManajemenKebun() {
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Manajemen Kebun
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Kelola master data blok, catat log panen harian, dan pantau biaya
            operasional (BPP).
          </p>
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Ekspor Laporan
        </Button>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="blok" className="w-full">
        <TabsList className="grid w-full max-w-[400px] grid-cols-3 mb-6 bg-slate-100/50">
          <TabsTrigger value="blok" className="flex items-center gap-2">
            <Sprout className="h-4 w-4" /> Blok
          </TabsTrigger>
          <TabsTrigger value="panen" className="flex items-center gap-2">
            <Tractor className="h-4 w-4" /> Panen
          </TabsTrigger>
          <TabsTrigger value="biaya" className="flex items-center gap-2">
            <Wallet className="h-4 w-4" /> Biaya
          </TabsTrigger>
        </TabsList>

        {/* ==================== TAB 1: MASTER DATA BLOK ==================== */}
        <TabsContent
          value="blok"
          className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-slate-800">
              Master Data Blok
            </h2>
            <Button className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
              <Plus className="h-4 w-4" /> Tambah Blok
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead>Kode Blok</TableHead>
                  <TableHead>Luas (Ha)</TableHead>
                  <TableHead>Tahun Tanam</TableHead>
                  <TableHead>Jenis Bibit</TableHead>
                  <TableHead>Topografi</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-semibold text-slate-700">
                    BLK-A01
                  </TableCell>
                  <TableCell>25.50</TableCell>
                  <TableCell>2015</TableCell>
                  <TableCell>Marihat</TableCell>
                  <TableCell>Datar</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-slate-400 hover:text-primary"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-semibold text-slate-700">
                    BLK-A02
                  </TableCell>
                  <TableCell>30.00</TableCell>
                  <TableCell>2018</TableCell>
                  <TableCell>Socfindo</TableCell>
                  <TableCell>Bergelombang</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-slate-400 hover:text-primary"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* ==================== TAB 2: LOG PANEN ==================== */}
        <TabsContent
          value="panen"
          className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-slate-800">
              Log Panen Harian
            </h2>
            <Button className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
              <Plus className="h-4 w-4" /> Catat Panen
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Blok</TableHead>
                  <TableHead className="text-right">Janjang</TableHead>
                  <TableHead className="text-right">Estimasi (Kg)</TableHead>
                  <TableHead>Mandor</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>16 Apr 2026</TableCell>
                  <TableCell className="font-semibold">BLK-A01</TableCell>
                  <TableCell className="text-right">450</TableCell>
                  <TableCell className="text-right">8,500</TableCell>
                  <TableCell>Budi S.</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="border-emerald-200 text-emerald-700 bg-emerald-50"
                    >
                      Terkirim ke PKS
                    </Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>16 Apr 2026</TableCell>
                  <TableCell className="font-semibold">BLK-A02</TableCell>
                  <TableCell className="text-right">320</TableCell>
                  <TableCell className="text-right">6,100</TableCell>
                  <TableCell>Agus T.</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="border-amber-200 text-amber-700 bg-amber-50"
                    >
                      Di TPH
                    </Badge>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* ==================== TAB 3: BIAYA OPERASIONAL ==================== */}
        <TabsContent
          value="biaya"
          className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-slate-800">
              Pengeluaran & Biaya Blok
            </h2>
            <Button className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
              <Plus className="h-4 w-4" /> Catat Biaya
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Blok</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Keterangan</TableHead>
                  <TableHead className="text-right">Nominal (Rp)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>10 Apr 2026</TableCell>
                  <TableCell className="font-semibold">BLK-A01</TableCell>
                  <TableCell>
                    <Badge variant="secondary">Pupuk</Badge>
                  </TableCell>
                  <TableCell className="text-slate-500">
                    Aplikasi NPK Mutiara
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    4,500,000
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>12 Apr 2026</TableCell>
                  <TableCell className="font-semibold">BLK-A02</TableCell>
                  <TableCell>
                    <Badge variant="secondary">Upah</Badge>
                  </TableCell>
                  <TableCell className="text-slate-500">
                    Perawatan Piringan
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    1,200,000
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
