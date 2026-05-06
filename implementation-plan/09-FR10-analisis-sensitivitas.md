# FR-10: Analisis Sensitivitas

> **Status:** ❌ Belum diimplementasi
> **Modul:** C — Simulasi Harga TBS
> **Requirement:** Melihat dampak kenaikan/penurunan harga CPO global terhadap margin keuntungan PKS secara real-time
> **Prioritas:** 🟠 P2
> **Dependensi:** FR-08/FR-09 (Parameter Harga & Kalkulator — sebagai basis formula)

---

## 1. Deskripsi Fitur

Analisis sensitivitas memungkinkan pengguna melihat **bagaimana perubahan satu variabel** (misalnya harga CPO) mempengaruhi output (harga TBS wajar dan margin PKS). Fitur ini krusial untuk:

- **Strategic Decision:** Owner bisa simulasi "jika harga CPO turun 10%, berapa harga TBS dan margin kita?"
- **Negosiasi:** Manajer PKS bisa tunjukkan ke petani bahwa penurunan harga global berdampak langsung ke harga TBS
- **Risk Assessment:** Melihat titik di mana margin PKS menjadi negatif (break-even point)

---

## 2. Tipe Analisis yang Dibutuhkan

### 2.1 Sensitivitas Satu Variabel (One-Way)

Ubah **satu variabel** sambil menjaga yang lain tetap. Hasilkan tabel & chart:

```
┌──────────────────────────────────────────────────────────────┐
│  Variabel diubah: Harga CPO                                 │
│  Rentang: Rp 9.000 — Rp 16.000 (step Rp 500)              │
│  Variabel tetap: PK=6000, OER=22%, KER=5%, K=87.5%        │
│                                                              │
│  Harga CPO │ Harga TBS │ Margin PKS │ Status               │
│  ──────────┼───────────┼────────────┼──────────             │
│   9.000    │  2.005    │   -119     │ 🔴 Rugi              │
│   9.500    │  2.101    │    -23     │ 🔴 Rugi              │
│  10.000    │  2.197    │     73     │ 🟢 Untung            │
│  10.500    │  2.293    │    169     │ 🟢 Untung            │
│  ...       │  ...      │   ...      │ ...                   │
│  15.000    │  3.159    │    741     │ 🟢 Untung            │
│  15.500    │  3.255    │    837     │ 🟢 Untung            │
│  16.000    │  3.351    │    933     │ 🟢 Untung            │
│                                                              │
│  ⚠️ Break-even point: Harga CPO ≈ Rp 9.600                 │
└──────────────────────────────────────────────────────────────┘
```

### 2.2 Sensitivitas Dua Variabel (Two-Way) — Opsional Lanjutan

Ubah **dua variabel** sekaligus, hasilkan heatmap:

```
           Harga CPO →
           9.000   10.000   11.000   12.000   13.000
K=80%  │  1.844    2.060    2.276    2.492    2.708
K=85%  │  1.958    2.187    2.416    2.646    2.875
K=90%  │  2.073    2.315    2.557    2.799    3.041
K=95%  │  2.187    2.442    2.697    2.952    3.208
```

---

## 3. Rencana Backend API

### Endpoint: `/api/price/sensitivity`

```typescript
// price.controller.ts — TAMBAHKAN

interface SensitivityRequest {
  // Parameter baseline (tetap)
  base_params: {
    harga_cpo_per_kg: number;
    harga_pk_per_kg: number;
    rendemen_cpo: number;
    rendemen_pk: number;
    indeks_k: number;
    biaya_olah_per_kg: number;
  };
  // Konfigurasi sensitivitas
  variable: "harga_cpo" | "harga_pk" | "rendemen_cpo" | "indeks_k" | "biaya_olah";
  range_min: number;
  range_max: number;
  step: number;
}

// POST /api/price/sensitivity
export const analyzeSensitivity = async (req: Request, res: Response) => {
  const { base_params, variable, range_min, range_max, step } = req.body;

  // Validasi
  if (!base_params || !variable || range_min === undefined || range_max === undefined || !step) {
    return res.status(400).json({
      success: false,
      message: "Semua parameter sensitivitas wajib diisi.",
    });
  }

  // Guard: maksimal 100 data points untuk mencegah overload
  const totalSteps = Math.floor((range_max - range_min) / step) + 1;
  if (totalSteps > 100) {
    return res.status(400).json({
      success: false,
      message: "Terlalu banyak data point. Perbesar step atau perkecil range.",
    });
  }

  // Map variable name ke parameter key
  const varKeyMap: Record<string, string> = {
    harga_cpo: "harga_cpo_per_kg",
    harga_pk: "harga_pk_per_kg",
    rendemen_cpo: "rendemen_cpo",
    indeks_k: "indeks_k",
    biaya_olah: "biaya_olah_per_kg",
  };

  const paramKey = varKeyMap[variable];
  const results: any[] = [];
  let breakEvenPoint: number | null = null;
  let prevMargin: number | null = null;

  for (let val = range_min; val <= range_max; val += step) {
    // Clone base params dan override variabel yang diubah
    const params = { ...base_params, [paramKey]: val };

    // Hitung formula
    const oer = params.rendemen_cpo / 100;
    const ker = params.rendemen_pk / 100;
    const k = params.indeks_k / 100;
    const komponenCPO = params.harga_cpo_per_kg * oer;
    const komponenPK = params.harga_pk_per_kg * ker;
    const totalSebelumK = komponenCPO + komponenPK;
    const hargaTBS = k * totalSebelumK;
    const marginPKS = totalSebelumK - hargaTBS - params.biaya_olah_per_kg;

    // Deteksi break-even point
    if (prevMargin !== null && prevMargin < 0 && marginPKS >= 0) {
      // Interpolasi linier sederhana
      breakEvenPoint = val - step + (step * Math.abs(prevMargin)) / (Math.abs(prevMargin) + marginPKS);
    }
    prevMargin = marginPKS;

    results.push({
      [variable]: val,
      harga_tbs: Math.round(hargaTBS),
      margin_pks: Math.round(marginPKS),
      status: marginPKS >= 0 ? "untung" : "rugi",
    });
  }

  res.json({
    success: true,
    data: {
      variable,
      variable_label: getVariableLabel(variable),
      base_params,
      break_even_point: breakEvenPoint ? Math.round(breakEvenPoint) : null,
      results,
    },
  });
};

function getVariableLabel(v: string): string {
  const labels: Record<string, string> = {
    harga_cpo: "Harga CPO (Rp/Kg)",
    harga_pk: "Harga Palm Kernel (Rp/Kg)",
    rendemen_cpo: "Rendemen CPO / OER (%)",
    indeks_k: "Indeks K (%)",
    biaya_olah: "Biaya Olah PKS (Rp/Kg)",
  };
  return labels[v] || v;
}
```

---

## 4. Rencana Frontend

### 4.1 Halaman / Posisi

Tambahkan sebagai **tab kedua** di halaman `/price-calculator`, atau sebagai **section bawah** setelah kalkulator utama:

```
┌───────────────────────────────────────────────────────────────┐
│ [Tabs: Kalkulator Harga | Analisis Sensitivitas]             │
├───────────────────────────────────────────────────────────────┤
│ Tab "Analisis Sensitivitas":                                  │
│                                                               │
│ ┌── Kontrol ─────────────────────────────────────────────┐   │
│ │ Variabel yang dianalisis:                              │   │
│ │ [Dropdown: Harga CPO ▼]                                │   │
│ │                                                        │   │
│ │ Range: [9.000] sampai [16.000]  Step: [500]           │   │
│ │                                                        │   │
│ │ [Button: Jalankan Analisis]                            │   │
│ └────────────────────────────────────────────────────────┘   │
│                                                               │
│ ┌── Hasil ───────────────────────────────────────────────┐   │
│ │                                                        │   │
│ │ ⚠️ Break-even point: Harga CPO ≈ Rp 9.600             │   │
│ │                                                        │   │
│ │ [AreaChart]                                            │   │
│ │   ┌────────────────────────────────────────────┐      │   │
│ │   │        ╱ Harga TBS (hijau)                 │      │   │
│ │   │       ╱                                    │      │   │
│ │   │      ╱                                     │      │   │
│ │   │     ╱      Margin PKS (biru)               │      │   │
│ │   │────╱─ ─ ─ ─ ─ ─ ─ ─ ─ ─(garis nol)──── │      │   │
│ │   │  ╱  Area merah (rugi)                      │      │   │
│ │   └────────────────────────────────────────────┘      │   │
│ │                                                        │   │
│ │ [Tabel Detail]                                        │   │
│ │  Harga CPO │ Harga TBS │ Margin │ Status              │   │
│ │  9.000     │ 2.005     │ -119   │ 🔴                  │   │
│ │  9.500     │ 2.101     │ -23    │ 🔴                  │   │
│ │  10.000    │ 2.197     │  73    │ 🟢                  │   │
│ │  ...       │ ...       │ ...    │ ...                  │   │
│ └────────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────────┘
```

### 4.2 Komponen yang Dibutuhkan

| File | Deskripsi |
|------|-----------|
| `components/simulation/SensitivityAnalysis.tsx` | Komponen utama (kontrol + chart + tabel) |
| `components/simulation/SensitivityChart.tsx` | AreaChart dengan dual line (TBS + Margin) |
| `components/simulation/SensitivityTable.tsx` | Tabel data point dengan status badge |

### 4.3 Chart Visualisasi (Recharts)

```tsx
import {
  ComposedChart, Area, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ReferenceLine
} from "recharts";

function SensitivityChart({ data, variable, breakEven }) {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <ComposedChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey={variable}
          tickFormatter={(v) => `Rp ${v.toLocaleString("id-ID")}`}
        />
        <YAxis yAxisId="left" label={{ value: "Harga TBS (Rp)", angle: -90 }} />
        <YAxis yAxisId="right" orientation="right" label={{ value: "Margin (Rp)", angle: 90 }} />
        <Tooltip />
        <Legend />

        {/* Garis nol untuk margin */}
        <ReferenceLine yAxisId="right" y={0} stroke="#ef4444" strokeDasharray="5 5" />

        {/* Break-even point */}
        {breakEven && (
          <ReferenceLine
            x={breakEven}
            stroke="#f59e0b"
            strokeWidth={2}
            label={{ value: `BEP: Rp ${breakEven.toLocaleString("id-ID")}`, fill: "#f59e0b" }}
          />
        )}

        {/* Area Harga TBS */}
        <Area
          yAxisId="left"
          type="monotone"
          dataKey="harga_tbs"
          name="Harga TBS"
          fill="#065F46"
          fillOpacity={0.1}
          stroke="#065F46"
          strokeWidth={2}
        />

        {/* Line Margin PKS */}
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="margin_pks"
          name="Margin PKS"
          stroke="#3B82F6"
          strokeWidth={2}
          dot={{ r: 3 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
```

### 4.4 Status Badge di Tabel

```tsx
<Badge className={
  row.status === "untung"
    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
    : "bg-red-50 text-red-700 border-red-200"
}>
  {row.status === "untung" ? "🟢 Untung" : "🔴 Rugi"}
</Badge>
```

---

## 5. Fitur Lanjutan (Nice-to-Have)

### 5.1 Export ke PDF/Excel
- Tombol "Export" untuk download tabel sensitivitas
- Berguna saat presentasi ke stakeholder

### 5.2 Comparison Mode
- Simpan 2 set parameter dan bandingkan hasilnya side-by-side
- Contoh: "Parameter bulan lalu vs bulan ini"

### 5.3 Alert Threshold
- Set notifikasi jika harga CPO turun ke level tertentu
- Dashboard menampilkan warning jika margin mendekati negatif

---

## 6. Checklist Implementasi

### Backend
- [ ] Tambah endpoint `POST /api/price/sensitivity` di `price.controller.ts`
- [ ] Implementasi loop kalkulasi per step
- [ ] Implementasi deteksi break-even point
- [ ] Guard: limit max 100 data points
- [ ] Tambah route di `price.routes.ts`

### Frontend
- [ ] Buat `SensitivityAnalysis.tsx` (komponen utama)
- [ ] Dropdown pilih variabel (Harga CPO, PK, OER, K, Biaya Olah)
- [ ] Input range min/max dan step
- [ ] Buat `SensitivityChart.tsx` (ComposedChart)
  - [ ] Area untuk Harga TBS
  - [ ] Line untuk Margin PKS
  - [ ] ReferenceLine y=0 (garis nol margin)
  - [ ] ReferenceLine x=BEP (break-even)
- [ ] Buat `SensitivityTable.tsx` (tabel dengan status badge)
- [ ] Integrasikan ke halaman `/price-calculator` sebagai tab

### Testing
- [ ] Verifikasi semua data point dikalkulasi dengan benar
- [ ] Test break-even detection (harga di mana margin = 0)
- [ ] Test edge: step = 0 (harus ditolak), range min > max (harus ditolak)
- [ ] Test limit: >100 data points harus ditolak
- [ ] Verifikasi chart render dengan benar di semua screen size
