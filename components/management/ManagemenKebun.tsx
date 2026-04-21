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
import { ExternalLink } from "lucide-react";

export default function ManajemenKebun() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-bold text-palm-dark">
          Daftar Pengelola Kebun
        </CardTitle>
        <CardDescription>
          Data integrasi anggota FPKS dan status kepemilikan aset.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="font-semibold text-slate-700">Pengelola & Lahan</TableHead>
                <TableHead className="font-semibold text-slate-700">Status FPKS</TableHead>
                <TableHead className="font-semibold text-slate-700">Role Sistem</TableHead>
                <TableHead className="font-semibold text-slate-700">Lokasi Kerja</TableHead>
                <TableHead className="text-right font-semibold text-slate-700">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="hover:bg-slate-50/50">
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-900">Achmad Idris</span>
                    <span className="text-xs text-slate-500 font-mono">
                      NIK: 3201123456780001
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className="border-blue-200 text-blue-700 bg-blue-50"
                  >
                    Pengurus
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className="bg-slate-800 text-white hover:bg-slate-800 border-none shadow-none font-medium">
                    Supervisor
                  </Badge>
                </TableCell>
                <TableCell className="text-sm font-medium text-slate-800">Muara Komam (5 Ha)</TableCell>
                <TableCell className="text-right">
                  <Link href="/farm-management/lahan/lhn-01" className="inline-flex items-center gap-1 text-palm-primary font-semibold text-sm hover:text-palm-primary/80">
                    Detail <ExternalLink className="w-3 h-3" />
                  </Link>
                </TableCell>
              </TableRow>

              <TableRow className="hover:bg-slate-50/50">
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-900">
                      Yudi Eka Sandhya
                    </span>
                    <span className="text-xs text-slate-500 font-mono">
                      NIK: 6474023456780002
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className="border-slate-200 text-slate-600"
                  >
                    Anggota
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className="bg-emerald-600 text-white hover:bg-emerald-600 border-none shadow-none font-medium">
                    Staff Lapangan
                  </Badge>
                </TableCell>
                <TableCell className="text-sm font-medium text-slate-800">
                  Desa Bumi Sejahtera (45 Ha)
                </TableCell>
                <TableCell className="text-right">
                  {/* Pointing to the same Lahan Detail for mock purpose */}
                  <Link href="/farm-management/lahan/lhn-01" className="inline-flex items-center gap-1 text-palm-primary font-semibold text-sm hover:text-palm-primary/80">
                    Detail <ExternalLink className="w-3 h-3" />
                  </Link>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
