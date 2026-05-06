import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { ExternalLink, AlertCircle } from "lucide-react";

// Definisikan tipe untuk response data dari backend
type LandData = {
  id: string;
  owner_nik: string;
  nama_pemilik: string;
  nomor_hp_pemilik: string | null;
  status_keanggotaan: string | null; // e.g., "Anggota", "Pengurus"
  nama_kelompok_tani: string | null;
  lokasi_kebun: string | null;
  luas_ha: string | null;
  status_kepemilikan: string | null;
  jenis_sertifikasi: string | null;
  usia_tanam_raw: string | null;
  baseline_produksi_ton: string | null;
  produksi_raw: string | null;
  pabrik_mitra: string | null;
};

// Fungsi untuk get data lands (Server Component fetch)
async function getLandsData(): Promise<LandData[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  
  try {
    const res = await fetch(`${apiUrl}/api/lands`, {
      // no-store memastikan kita mendapatkan data terbaru setiap load (tanpa caching)
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error(`Gagal fetch data: ${res.status} ${res.statusText}`);
    }

    const json = await res.json();
    return json.data || [];
  } catch (error) {
    console.error("Error fetching lands data:", error);
    throw error;
  }
}

export default async function ManajemenKebun() {
  let lands: LandData[] = [];
  let errorMsg = null;

  try {
    lands = await getLandsData();
  } catch (err: any) {
    errorMsg = err.message || "Gagal menghubungi backend API.";
  }

  // Jika terjadi error koneksi ke API
  if (errorMsg) {
    return (
      <div className="mt-4 bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg">
        <div className="flex items-center gap-2 font-bold mb-1">
          <AlertCircle className="h-5 w-5" />
          Koneksi Error
        </div>
        <p className="text-sm">
          Tidak dapat memuat data lahan. Pastikan backend server sedang berjalan.
          <br />
          <span className="text-xs font-mono opacity-80 mt-2 block">{errorMsg}</span>
        </p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-bold text-palm-dark">
          Daftar Pengelola Kebun
        </CardTitle>
        <CardDescription>
          Data integrasi anggota FPKS, lokasi lahan, luas hektar, dan status kepemilikan aset.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="font-semibold text-slate-700">Petani & NIK</TableHead>
                <TableHead className="font-semibold text-slate-700">Status FPKS</TableHead>
                <TableHead className="font-semibold text-slate-700">Lokasi Kebun</TableHead>
                <TableHead className="font-semibold text-slate-700">Luas (Ha)</TableHead>
                <TableHead className="font-semibold text-slate-700">Produksi Baseline</TableHead>
                <TableHead className="text-right font-semibold text-slate-700">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lands.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-slate-500">
                    Belum ada data lahan. Silakan seed database backend Anda.
                  </TableCell>
                </TableRow>
              ) : (
                lands.map((land) => {
                  // Determine badge color based on role
                  const isPengurus = land.status_keanggotaan?.toLowerCase().includes("pengurus");
                  const badgeClasses = isPengurus 
                    ? "border-blue-200 text-blue-700 bg-blue-50" 
                    : "border-slate-200 text-slate-600 bg-white";

                  return (
                    <TableRow key={land.id} className="hover:bg-slate-50/50">
                      <TableCell>
                        <div className="flex flex-col max-w-[200px]">
                          <span className="font-bold text-slate-900 truncate" title={land.nama_pemilik}>
                            {land.nama_pemilik || "Tanpa Nama"}
                          </span>
                          <span className="text-xs text-slate-500 font-mono mt-0.5">
                            NIK: {land.owner_nik}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {land.status_keanggotaan ? (
                          <Badge variant="outline" className={badgeClasses}>
                            {land.status_keanggotaan}
                          </Badge>
                        ) : (
                          <span className="text-slate-400 text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm font-medium text-slate-800 max-w-[200px] truncate" title={land.lokasi_kebun || ""}>
                        {land.lokasi_kebun || "-"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {land.luas_ha ? (
                          <span className="font-semibold">{land.luas_ha} <span className="text-xs text-slate-500 font-normal">Ha</span></span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        {land.baseline_produksi_ton ? (
                          <span className="font-semibold">{land.baseline_produksi_ton} <span className="text-xs text-slate-500 font-normal">Ton</span></span>
                        ) : land.produksi_raw ? (
                          <span className="text-slate-600">{land.produksi_raw}</span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link 
                          href={`/farm-management/lahan/${land.owner_nik}`} 
                          className="inline-flex items-center gap-1 text-palm-primary font-semibold text-sm hover:text-palm-primary/80 transition-colors"
                        >
                          Detail <ExternalLink className="w-3 h-3" />
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
