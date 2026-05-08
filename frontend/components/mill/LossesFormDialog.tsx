"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, AlertCircle } from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────
const TAHAP_OPTIONS: Record<string, string[]> = {
  Sterilizer: ["Condensate"],
  Thresher: ["Empty Bunch"],
  Digester: ["Sludge Underflow"],
  Press: ["Fibre"],
  Clarifier: ["Final Effluent"],
};

interface LossesFormDialogProps {
  onSuccess: () => void;
}

export default function LossesFormDialog({ onSuccess }: LossesFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const today = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState({
    tanggal: today,
    tahap_proses: "",
    jenis_losses: "",
    losses_kg: "",
    kadar_minyak_persen: "",
    catatan: "",
  });

  // Auto-hitung preview oil losses
  const previewOilLosses =
    form.losses_kg && form.kadar_minyak_persen
      ? (
          (parseFloat(form.losses_kg) * parseFloat(form.kadar_minyak_persen)) /
          100
        ).toFixed(2)
      : null;

  const handleTahapChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      tahap_proses: value,
      jenis_losses: TAHAP_OPTIONS[value]?.[0] ?? "",
    }));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const resetForm = () => {
    setForm({
      tanggal: today,
      tahap_proses: "",
      jenis_losses: "",
      losses_kg: "",
      kadar_minyak_persen: "",
      catatan: "",
    });
    setError(null);
  };

  const handleSubmit = async () => {
    if (!form.tanggal || !form.tahap_proses || !form.jenis_losses || !form.losses_kg) {
      setError("Harap lengkapi semua field yang wajib diisi.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/mill-losses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tanggal: form.tanggal,
          tahap_proses: form.tahap_proses,
          jenis_losses: form.jenis_losses,
          losses_kg: parseFloat(form.losses_kg),
          kadar_minyak_persen: form.kadar_minyak_persen
            ? parseFloat(form.kadar_minyak_persen)
            : null,
          catatan: form.catatan || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Gagal menyimpan data");
      }

      resetForm();
      setOpen(false);
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) resetForm();
      }}
    >
      <DialogTrigger asChild>
        <Button className="bg-rose-600 hover:bg-rose-700 text-white shadow-md gap-2">
          <Plus className="w-4 h-4" />
          Catat Losses
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-slate-800">
            Catat Oil Losses
          </DialogTitle>
          <p className="text-sm text-slate-500 mt-1">
            Input kehilangan minyak pada setiap tahap pengolahan TBS.
          </p>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Tanggal */}
          <div className="space-y-1">
            <Label htmlFor="tanggal-losses">Tanggal *</Label>
            <Input
              id="tanggal-losses"
              type="date"
              name="tanggal"
              value={form.tanggal}
              onChange={handleChange}
            />
          </div>

          {/* Tahap Proses */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Tahap Proses *</Label>
              <Select value={form.tahap_proses} onValueChange={handleTahapChange}>
                <SelectTrigger id="tahap-proses-select">
                  <SelectValue placeholder="Pilih tahap" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(TAHAP_OPTIONS).map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>Jenis Losses *</Label>
              <Select
                value={form.jenis_losses}
                onValueChange={(v) =>
                  setForm((prev) => ({ ...prev, jenis_losses: v }))
                }
                disabled={!form.tahap_proses}
              >
                <SelectTrigger id="jenis-losses-select">
                  <SelectValue placeholder="Pilih jenis" />
                </SelectTrigger>
                <SelectContent>
                  {(TAHAP_OPTIONS[form.tahap_proses] ?? []).map((j) => (
                    <SelectItem key={j} value={j}>
                      {j}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Berat & Kadar */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="losses-kg-input">Berat Losses (kg) *</Label>
              <Input
                id="losses-kg-input"
                type="number"
                name="losses_kg"
                placeholder="0.00"
                min="0"
                step="0.01"
                value={form.losses_kg}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="kadar-minyak-input">
                Kadar Minyak (%) <span className="text-slate-400 font-normal">opsional</span>
              </Label>
              <Input
                id="kadar-minyak-input"
                type="number"
                name="kadar_minyak_persen"
                placeholder="misal: 1.5"
                min="0"
                max="100"
                step="0.01"
                value={form.kadar_minyak_persen}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Preview Oil Losses */}
          {previewOilLosses && (
            <div className="bg-rose-50 border border-rose-200 rounded-lg px-4 py-2 flex items-center justify-between">
              <span className="text-sm text-rose-700 font-medium">
                Estimasi Oil Losses:
              </span>
              <span className="text-rose-800 font-bold text-base">
                {previewOilLosses} kg
              </span>
            </div>
          )}

          {/* Catatan */}
          <div className="space-y-1">
            <Label htmlFor="catatan-losses">Catatan</Label>
            <Textarea
              id="catatan-losses"
              name="catatan"
              placeholder="Keterangan tambahan (opsional)"
              value={form.catatan}
              onChange={handleChange}
              rows={2}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg border border-red-200">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setOpen(false);
              resetForm();
            }}
            disabled={loading}
          >
            Batal
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-rose-600 hover:bg-rose-700 text-white"
          >
            {loading ? "Menyimpan..." : "Simpan Losses"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
