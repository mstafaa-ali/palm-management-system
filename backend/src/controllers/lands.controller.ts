/**
 * lands.controller.ts — Controller untuk endpoint lands
 *
 * Berisi seluruh logika bisnis untuk resource /api/lands.
 * Route handler hanya mendelegasikan ke controller ini.
 */

import { Request, Response } from "express";
import prisma from "../lib/prisma";

// ─── Tipe Response ────────────────────────────────────────────────────────────

interface ApiSuccess<T> {
  status: "success";
  data: T;
  total?: number;
}

interface ApiError {
  status: "error";
  message: string;
}

// ─── Helper Response ──────────────────────────────────────────────────────────

function successResponse<T>(data: T, total?: number): ApiSuccess<T> {
  return { status: "success", data, ...(total !== undefined && { total }) };
}

function errorResponse(message: string): ApiError {
  return { status: "error", message };
}

// ─── GET /api/lands ───────────────────────────────────────────────────────────
/**
 * Mengembalikan daftar seluruh lahan beserta info pemilik:
 * nama_lengkap, status_keanggotaan, dan nomor_hp.
 */
export async function getAllLands(req: Request, res: Response): Promise<void> {
  try {
    const lands = await prisma.land.findMany({
      include: {
        owner: {
          select: {
            nama_lengkap:       true,
            nomor_hp:           true,
            status_keanggotaan: true,
          },
        },
      },
      orderBy: { owner_nik: "asc" },
    });

    // Flatten: gabungkan field owner ke dalam setiap objek lahan
    const data = lands.map((land) => ({
      id:                    land.id,
      owner_nik:             land.owner_nik,
      // ── Info pemilik (dari join) ──────────────────────
      nama_pemilik:          land.owner.nama_lengkap,
      nomor_hp_pemilik:      land.owner.nomor_hp,
      status_keanggotaan:    land.owner.status_keanggotaan,
      // ── Data lahan ────────────────────────────────────
      nama_kelompok_tani:    land.nama_kelompok_tani,
      lokasi_kebun:          land.lokasi_kebun,
      luas_ha:               land.luas_ha,
      status_kepemilikan:    land.status_kepemilikan,
      jenis_sertifikasi:     land.jenis_sertifikasi,
      usia_tanam_raw:        land.usia_tanam_raw,
      baseline_produksi_ton: land.baseline_produksi_ton,
      produksi_raw:          land.produksi_raw,
      pabrik_mitra:          land.pabrik_mitra,
    }));

    res.status(200).json(successResponse(data, data.length));
  } catch (err) {
    console.error("[GET /api/lands] Error:", err);
    res.status(500).json(errorResponse("Gagal mengambil data lahan."));
  }
}

// ─── GET /api/lands/user/:nik ─────────────────────────────────────────────────
/**
 * Mengembalikan semua lahan milik 1 petani berdasarkan NIK.
 * Sertakan seluruh detail lahan + data pemilik.
 * Kembalikan 404 jika NIK tidak ditemukan.
 */
export async function getLandsByNik(req: Request, res: Response): Promise<void> {
  const { nik } = req.params;

  try {
    // Cari user + lahan-lahannya sekaligus
    const user = await prisma.user.findUnique({
      where: { nik },
      include: {
        lands: {
          orderBy: { luas_ha: "desc" },
        },
      },
    });

    if (!user) {
      res.status(404).json(
        errorResponse(`Petani dengan NIK '${nik}' tidak ditemukan.`)
      );
      return;
    }

    // Shape response: pisahkan info pemilik dan daftar lahan
    const responseData = {
      pemilik: {
        nik:                     user.nik,
        nama_lengkap:            user.nama_lengkap,
        jenis_kelamin:           user.jenis_kelamin,
        tempat_lahir:            user.tempat_lahir,
        tanggal_lahir_raw:       user.tanggal_lahir_raw,
        pendidikan_terakhir:     user.pendidikan_terakhir,
        alamat_lengkap:          user.alamat_lengkap,
        nomor_hp:                user.nomor_hp,
        jumlah_anggota_keluarga: user.jumlah_anggota_keluarga,
        status_keanggotaan:      user.status_keanggotaan,
      },
      total_lahan: user.lands.length,
      lahan: user.lands.map((land) => ({
        id:                    land.id,
        nama_kelompok_tani:    land.nama_kelompok_tani,
        lokasi_kebun:          land.lokasi_kebun,
        luas_ha:               land.luas_ha,
        status_kepemilikan:    land.status_kepemilikan,
        jenis_sertifikasi:     land.jenis_sertifikasi,
        usia_tanam_raw:        land.usia_tanam_raw,
        baseline_produksi_ton: land.baseline_produksi_ton,
        produksi_raw:          land.produksi_raw,
        pabrik_mitra:          land.pabrik_mitra,
      })),
    };

    res.status(200).json(successResponse(responseData));
  } catch (err) {
    console.error(`[GET /api/lands/user/${nik}] Error:`, err);
    res.status(500).json(errorResponse("Gagal mengambil data lahan petani."));
  }
}

// ─── GET /api/lands/:id/stats ─────────────────────────────────────────────────
/**
 * Mengembalikan statistik tonase bulanan untuk sebuah lahan (id = land_id/nik).
 */
export async function getLandStats(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const { bulan, tahun } = req.query; // Optional filter

  try {
    // 1. Resolve land ID
    const land = await resolveLandId(id);
    if (!land) {
      res.status(404).json(errorResponse("Lahan tidak ditemukan."));
      return;
    }

    // 2. Tentukan periode
    const year = tahun ? Number(tahun) : new Date().getFullYear();
    const month = bulan ? Number(bulan) - 1 : new Date().getMonth();
    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999);

    // 3. Agregasi data HARVEST (sumber resmi panen)
    const harvestAgg = await prisma.harvest.aggregate({
      _sum: {
        estimasi_berat_kg: true,
        jumlah_janjang: true,
      },
      _count: true,
      where: {
        land_id: land.id,
        tanggal_panen: { gte: startOfMonth, lte: endOfMonth },
      },
    });

    const totalBeratKg = Number(harvestAgg._sum.estimasi_berat_kg || 0);
    const totalJanjang = Number(harvestAgg._sum.jumlah_janjang || 0);
    const totalBeratTon = totalBeratKg / 1000;

    // 4. Hitung Yield per Ha
    const luasHa = Number(land.luas_ha || 0);
    const yieldPerHa = luasHa > 0 ? totalBeratTon / luasHa : 0;

    // 5. Agregasi data COST (untuk Cost per Kg)
    const costAgg = await prisma.cost.aggregate({
      _sum: { jumlah_biaya: true },
      where: {
        land_id: land.id,
        tanggal: { gte: startOfMonth, lte: endOfMonth },
      },
    });

    const totalBiaya = Number(costAgg._sum.jumlah_biaya || 0);
    const costPerKg = totalBeratKg > 0 ? totalBiaya / totalBeratKg : 0;

    // 6. Data chart harian (dari Harvest)
    const harvests = await prisma.harvest.findMany({
      where: {
        land_id: land.id,
        tanggal_panen: { gte: startOfMonth, lte: endOfMonth },
      },
      orderBy: { tanggal_panen: "asc" },
    });

    const chartData = harvests.map((h) => ({
      date: h.tanggal_panen.toISOString().split("T")[0],
      berat_kg: Number(h.estimasi_berat_kg),
      janjang: h.jumlah_janjang,
    }));

    // 7. Agregasi WorkLog (untuk efisiensi kerja)
    const workLogAgg = await prisma.workLog.aggregate({
      _sum: { tonase: true },
      _count: true,
      where: {
        land_id: land.id,
        check_in_time: { gte: startOfMonth, lte: endOfMonth },
      },
    });

    // Response
    res.status(200).json({
      status: "success",
      data: {
        // Info Lahan
        land_info: {
          id: land.id,
          lokasi_kebun: land.lokasi_kebun,
          luas_ha: luasHa,
          jenis_bibit: land.jenis_bibit,
          koordinat_gps: land.koordinat_gps,
          baseline_tonase: Number(land.baseline_produksi_ton || 0),
        },
        // Kalkulasi Produktivitas (FR-04)
        produktivitas: {
          total_berat_kg: totalBeratKg,
          total_berat_ton: Math.round(totalBeratTon * 100) / 100,
          total_janjang: totalJanjang,
          yield_per_ha: Math.round(yieldPerHa * 100) / 100,  // ← KEY METRIC
          jumlah_hari_panen: harvestAgg._count,
        },
        // Kalkulasi Biaya (Cost per Kg)
        biaya: {
          total_biaya: totalBiaya,
          cost_per_kg: Math.round(costPerKg * 100) / 100,  // ← KEY METRIC
        },
        // Data Chart
        chart_data: chartData,
        // Efisiensi Kerja (dari WorkLog)
        efisiensi: {
          total_work_sessions: workLogAgg._count,
          total_tonase_work: Number(workLogAgg._sum.tonase || 0),
        },
        // Periode
        periode: {
          bulan: month + 1,
          tahun: year,
        },
      },
    });
  } catch (err) {
    console.error(`[GET /api/lands/${id}/stats] Error:`, err);
    res.status(500).json(errorResponse("Gagal memuat statistik lahan."));
  }
}

// Helper function
async function resolveLandId(id: string) {
  // Coba sebagai owner_nik dulu
  let land = await prisma.land.findFirst({ where: { owner_nik: id } });
  if (land) return land;

  // Fallback: coba sebagai UUID
  try {
    land = await prisma.land.findUnique({ where: { id } });
    return land;
  } catch {
    return null;
  }
}

// ─── PUT /api/lands/:id ───────────────────────────────────────────────────────
/**
 * Update data lahan (khususnya jenis_bibit dan koordinat_gps)
 */
export async function updateLand(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const { jenis_bibit, koordinat_gps } = req.body;

  try {
    // Cari id sebagai land_id, jika tidak ketemu, asumsikan itu owner_nik
    let actualLandId = id;
    const landByNik = await prisma.land.findFirst({
      where: { owner_nik: id },
    });
    
    if (landByNik) {
      actualLandId = landByNik.id;
    }

    const updatedLand = await prisma.land.update({
      where: { id: actualLandId },
      data: {
        ...(jenis_bibit !== undefined && { jenis_bibit }),
        ...(koordinat_gps !== undefined && { koordinat_gps }),
      },
    });

    res.status(200).json(successResponse(updatedLand));
  } catch (err) {
    console.error(`[PUT /api/lands/${id}] Error:`, err);
    res.status(500).json(errorResponse("Gagal mengupdate data lahan."));
  }
}

