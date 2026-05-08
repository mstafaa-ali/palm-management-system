"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TaraInputDialogProps {
  id: string;
  nomor_kendaraan: string;
  berat_bruto_kg: string | number;
  onSuccess: () => void;
}

export default function TaraInputDialog({ id, nomor_kendaraan, berat_bruto_kg, onSuccess }: TaraInputDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [beratTara, setBeratTara] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/weighbridge/${id}/tara`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ berat_tara_kg: beratTara }),
      });

      const json = await res.json();
      if (json.success) {
        setOpen(false);
        setBeratTara("");
        onSuccess();
      } else {
        alert("Gagal: " + json.error);
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat mengupdate tara.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="default">Input Tara</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Input Berat Tara Truk Keluar</DialogTitle>
        </DialogHeader>
        <div className="text-sm text-slate-500 mb-2">
          Plat Nomor: <span className="font-bold text-slate-800">{nomor_kendaraan}</span>
          <br />
          Berat Bruto: <span className="font-bold text-slate-800">{berat_bruto_kg} kg</span>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Berat Tara (kg)</Label>
            <Input type="number" value={beratTara} onChange={(e) => setBeratTara(e.target.value)} required />
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Batal</Button>
            <Button type="submit" disabled={loading}>{loading ? "Menyimpan..." : "Simpan"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
