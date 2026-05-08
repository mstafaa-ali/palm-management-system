import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ProductionFormDialogProps {
  onSuccess: () => void;
}

export default function ProductionFormDialog({ onSuccess }: ProductionFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    tanggal_produksi: new Date().toISOString().split("T")[0],
    tbs_olah_kg: "",
    cpo_dihasilkan_kg: "",
    pk_dihasilkan_kg: "",
    catatan: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const response = await fetch(`${apiUrl}/api/mill-production`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Data produksi berhasil dicatat!");
        setOpen(false);
        setFormData({
          tanggal_produksi: new Date().toISOString().split("T")[0],
          tbs_olah_kg: "",
          cpo_dihasilkan_kg: "",
          pk_dihasilkan_kg: "",
          catatan: "",
        });
        onSuccess();
      } else {
        toast.error(result.message || "Gagal mencatat data produksi");
      }
    } catch (error) {
      console.error(error);
      toast.error("Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-palm-primary hover:bg-palm-primary/90 text-white shadow-sm flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Catat Produksi Hari Ini
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Input Produksi Harian PKS</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="tanggal_produksi">Tanggal Produksi</Label>
            <Input
              id="tanggal_produksi"
              name="tanggal_produksi"
              type="date"
              required
              value={formData.tanggal_produksi}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tbs_olah_kg">TBS Olah (Kg)</Label>
            <Input
              id="tbs_olah_kg"
              name="tbs_olah_kg"
              type="number"
              step="0.01"
              required
              placeholder="Contoh: 22000"
              value={formData.tbs_olah_kg}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cpo_dihasilkan_kg">CPO Dihasilkan (Kg)</Label>
            <Input
              id="cpo_dihasilkan_kg"
              name="cpo_dihasilkan_kg"
              type="number"
              step="0.01"
              required
              placeholder="Contoh: 5000"
              value={formData.cpo_dihasilkan_kg}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pk_dihasilkan_kg">PK (Inti Sawit) Dihasilkan (Kg)</Label>
            <Input
              id="pk_dihasilkan_kg"
              name="pk_dihasilkan_kg"
              type="number"
              step="0.01"
              required
              placeholder="Contoh: 1100"
              value={formData.pk_dihasilkan_kg}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="catatan">Catatan Tambahan (Opsional)</Label>
            <Textarea
              id="catatan"
              name="catatan"
              placeholder="Misal: Hujan deras pada siang hari..."
              value={formData.catatan}
              onChange={handleChange}
            />
          </div>

          <div className="pt-4 flex justify-end">
            <Button type="submit" disabled={loading} className="bg-palm-primary hover:bg-palm-primary/90 w-full">
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Simpan Data Produksi
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
