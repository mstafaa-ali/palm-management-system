export interface WeighbridgeLog {
  id: string;
  nomor_kendaraan: string;
  nama_supir: string | null;
  sumber: "Internal" | "Eksternal";
  land_id: string | null;
  nama_pemasok: string | null;
  berat_bruto_kg: string | number; // Decimal in DB
  berat_tara_kg: string | number | null;
  berat_netto_kg: string | number | null;
  waktu_masuk: string;
  waktu_keluar: string | null;
  status: "masuk" | "selesai";
  created_at: string;
}

export interface WeighbridgeSummaryData {
  totalTruk: number;
  internalCount: number;
  eksternalCount: number;
  totalNetto_ton: number;
  totalNetto_kg: number;
}
