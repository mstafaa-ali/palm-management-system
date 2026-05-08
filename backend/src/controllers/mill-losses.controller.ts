/**
 * mill-losses.controller.ts — Controller FR-07: Tracking Losses
 *
 * Endpoints:
 *  GET  /api/mill-losses          - List semua data losses (filter: tanggal, tahap_proses)
 *  POST /api/mill-losses          - Input data losses baru (auto-hitung oil_losses_kg)
 *  PUT  /api/mill-losses/:id      - Update data losses
 *  DELETE /api/mill-losses/:id    - Hapus data losses
 *  GET  /api/mill-losses/summary  - Ringkasan losses per tahap per periode
 */

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ─── GET /api/mill-losses ────────────────────────────────────────────────────
export const getAllLosses = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, tahap_proses } = req.query;

    const where: any = {};

    if (startDate && endDate) {
      where.tanggal = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string),
      };
    }

    if (tahap_proses) {
      where.tahap_proses = tahap_proses as string;
    }

    const losses = await prisma.millLoss.findMany({
      where,
      orderBy: { tanggal: 'desc' },
      include: {
        production: {
          select: { tanggal_produksi: true, tbs_olah_kg: true },
        },
      },
    });

    res.json({ success: true, data: losses });
  } catch (error: any) {
    console.error('Error fetching mill losses:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data losses',
      error: error.message,
    });
  }
};

// ─── POST /api/mill-losses ───────────────────────────────────────────────────
export const createLoss = async (req: Request, res: Response) => {
  try {
    const {
      production_id,
      tanggal,
      tahap_proses,
      jenis_losses,
      losses_kg,
      kadar_minyak_persen,
      catatan,
    } = req.body;

    // Validasi field wajib
    if (!tanggal || !tahap_proses || !jenis_losses || !losses_kg) {
      return res.status(400).json({
        success: false,
        message: 'Field tanggal, tahap_proses, jenis_losses, dan losses_kg wajib diisi.',
      });
    }

    const lossesKg = Number(losses_kg);
    const kadar = kadar_minyak_persen != null && kadar_minyak_persen !== ''
      ? Number(kadar_minyak_persen)
      : null;

    // Auto-hitung oil_losses_kg jika kadar minyak diketahui
    const oilLossesKg = kadar !== null ? Math.round((lossesKg * kadar / 100) * 100) / 100 : null;

    const loss = await prisma.millLoss.create({
      data: {
        production_id: production_id || null,
        tanggal: new Date(tanggal),
        tahap_proses,
        jenis_losses,
        losses_kg: lossesKg,
        kadar_minyak_persen: kadar,
        oil_losses_kg: oilLossesKg,
        catatan: catatan || null,
      },
    });

    res.status(201).json({ success: true, data: loss });
  } catch (error: any) {
    console.error('Error creating mill loss:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mencatat data losses',
      error: error.message,
    });
  }
};

// ─── PUT /api/mill-losses/:id ────────────────────────────────────────────────
export const updateLoss = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      production_id,
      tanggal,
      tahap_proses,
      jenis_losses,
      losses_kg,
      kadar_minyak_persen,
      catatan,
    } = req.body;

    const lossesKg = Number(losses_kg);
    const kadar = kadar_minyak_persen != null && kadar_minyak_persen !== ''
      ? Number(kadar_minyak_persen)
      : null;
    const oilLossesKg = kadar !== null ? Math.round((lossesKg * kadar / 100) * 100) / 100 : null;

    const loss = await prisma.millLoss.update({
      where: { id },
      data: {
        production_id: production_id || null,
        tanggal: tanggal ? new Date(tanggal) : undefined,
        tahap_proses,
        jenis_losses,
        losses_kg: lossesKg,
        kadar_minyak_persen: kadar,
        oil_losses_kg: oilLossesKg,
        catatan: catatan || null,
      },
    });

    res.json({ success: true, data: loss });
  } catch (error: any) {
    console.error('Error updating mill loss:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal memperbarui data losses',
      error: error.message,
    });
  }
};

// ─── DELETE /api/mill-losses/:id ─────────────────────────────────────────────
export const deleteLoss = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.millLoss.delete({ where: { id } });
    res.json({ success: true, message: 'Data losses berhasil dihapus' });
  } catch (error: any) {
    console.error('Error deleting mill loss:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menghapus data losses',
      error: error.message,
    });
  }
};

// ─── GET /api/mill-losses/summary ────────────────────────────────────────────
// Aggregasi per tahap_proses dalam periode bulan/tahun
export const getLossesSummary = async (req: Request, res: Response) => {
  try {
    const { bulan, tahun } = req.query;

    const year  = tahun ? Number(tahun)  : new Date().getFullYear();
    const month = bulan ? Number(bulan) - 1 : new Date().getMonth();

    const start = new Date(year, month, 1);
    const end   = new Date(year, month + 1, 0, 23, 59, 59, 999);

    // Aggregasi groupBy tahap_proses
    const byStage = await prisma.millLoss.groupBy({
      by: ['tahap_proses'],
      _sum: { losses_kg: true, oil_losses_kg: true },
      _count: { id: true },
      where: { tanggal: { gte: start, lte: end } },
      orderBy: { _sum: { oil_losses_kg: 'desc' } },
    });

    // Total keseluruhan periode
    const totals = await prisma.millLoss.aggregate({
      _sum: { losses_kg: true, oil_losses_kg: true },
      where: { tanggal: { gte: start, lte: end } },
    });

    // Ambil total TBS dari MillProduction untuk hitung losses rate
    const prodAgg = await prisma.millProduction.aggregate({
      _sum: { tbs_olah_kg: true },
      where: { tanggal_produksi: { gte: start, lte: end } },
    });

    const totalTbs       = Number(prodAgg._sum.tbs_olah_kg || 0);
    const totalOilLosses = Number(totals._sum.oil_losses_kg || 0);
    const lossesRate     = totalTbs > 0 ? (totalOilLosses / totalTbs) * 100 : 0;

    const formattedByStage = byStage.map((s) => ({
      tahap_proses:    s.tahap_proses,
      losses_kg:       Number(s._sum.losses_kg || 0),
      oil_losses_kg:   Number(s._sum.oil_losses_kg || 0),
      jumlah_entri:    s._count.id,
    }));

    res.json({
      success: true,
      data: {
        periode: { bulan: month + 1, tahun: year, start, end },
        total_losses_kg:     Number(totals._sum.losses_kg || 0),
        total_oil_losses_kg: totalOilLosses,
        total_tbs_olah_kg:   totalTbs,
        losses_rate_persen:  Math.round(lossesRate * 100) / 100,
        by_stage:            formattedByStage,
      },
    });
  } catch (error: any) {
    console.error('Error getting losses summary:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil ringkasan losses',
      error: error.message,
    });
  }
};
