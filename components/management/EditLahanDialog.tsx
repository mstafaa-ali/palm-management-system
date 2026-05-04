"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Edit } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EditLahanDialogProps {
  landId: string;
  initialJenisBibit?: string;
  initialKoordinatGps?: string;
  onSuccess?: (newData: any) => void;
}

export default function EditLahanDialog({
  landId,
  initialJenisBibit = "",
  initialKoordinatGps = "",
  onSuccess,
}: EditLahanDialogProps) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    jenis_bibit: initialJenisBibit,
    koordinat_gps: initialKoordinatGps,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const res = await fetch(`${apiUrl}/api/lands/${landId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Gagal menyimpan perubahan data lahan");

      const json = await res.json();
      setOpen(false);
      if (onSuccess) {
        onSuccess(json.data);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Edit className="w-4 h-4" /> Edit Spesifikasi
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Data Lahan</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {error && (
            <div className="text-red-500 text-sm bg-red-50 p-2 rounded">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label>Jenis Bibit</Label>
            <Select
              value={formData.jenis_bibit}
              onValueChange={(val) =>
                setFormData({ ...formData, jenis_bibit: val })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih Jenis Bibit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Marihat">Marihat</SelectItem>
                <SelectItem value="Topaz">Topaz</SelectItem>
                <SelectItem value="Tenera">Tenera</SelectItem>
                <SelectItem value="DxP">DxP (Dura x Pisifera)</SelectItem>
                <SelectItem value="Lainnya">Lainnya</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Koordinat GPS</Label>
            <Input
              placeholder="Contoh: -1.234567, 116.876543"
              value={formData.koordinat_gps}
              onChange={(e) =>
                setFormData({ ...formData, koordinat_gps: e.target.value })
              }
            />
            <p className="text-xs text-slate-500">
              Format: Latitude, Longitude
            </p>
          </div>

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Menyimpan...
              </>
            ) : (
              "Simpan Perubahan"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
