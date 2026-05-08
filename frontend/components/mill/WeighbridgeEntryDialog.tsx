"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { WeighbridgeLog } from "@/types/weighbridge";

export default function WeighbridgeEntryDialog({ onEntryCreated }: { onEntryCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    nomor_kendaraan: "",
    nama_supir: "",
    sumber: "Internal" as "Internal" | "Eksternal",
    land_id: "",
    nama_pemasok: "",
    berat_bruto_kg: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/weighbridge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (json.success) {
        setOpen(false);
        setFormData({
          nomor_kendaraan: "",
          nama_supir: "",
          sumber: "Internal",
          land_id: "",
          nama_pemasok: "",
          berat_bruto_kg: "",
        });
        onEntryCreated();
      } else {
        alert("Gagal: " + json.error);
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat menyimpan data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>+ Catat Truk Masuk</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Catat Truk Masuk (Bruto)</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Plat Nomor Kendaraan</Label>
            <Input name="nomor_kendaraan" value={formData.nomor_kendaraan} onChange={handleChange} required />
          </div>
          <div className="space-y-2">
            <Label>Nama Supir</Label>
            <Input name="nama_supir" value={formData.nama_supir} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label>Sumber TBS</Label>
            <Select 
              value={formData.sumber} 
              onValueChange={(val: "Internal" | "Eksternal") => setFormData({ ...formData, sumber: val })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih Sumber" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Internal">Internal (Kebun Sendiri)</SelectItem>
                <SelectItem value="Eksternal">Eksternal (Petani Mitra)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {formData.sumber === "Internal" ? (
            <div className="space-y-2">
              <Label>Land ID (Internal)</Label>
              <Input name="land_id" placeholder="Masukkan UUID Land" value={formData.land_id} onChange={handleChange} required />
            </div>
          ) : (
            <div className="space-y-2">
              <Label>Nama Pemasok / Petani Mitra (Eksternal)</Label>
              <Input name="nama_pemasok" value={formData.nama_pemasok} onChange={handleChange} required />
            </div>
          )}

          <div className="space-y-2">
            <Label>Berat Bruto (kg)</Label>
            <Input type="number" name="berat_bruto_kg" value={formData.berat_bruto_kg} onChange={handleChange} required />
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
