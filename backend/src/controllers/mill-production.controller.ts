import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/mill-production
export const getAllProductions = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    
    let whereClause = {};
    
    if (startDate && endDate) {
      whereClause = {
        tanggal_produksi: {
          gte: new Date(startDate as string),
          lte: new Date(endDate as string),
        }
      };
    }

    const productions = await prisma.millProduction.findMany({
      where: whereClause,
      orderBy: { tanggal_produksi: 'desc' },
    });

    res.json({ success: true, data: productions });
  } catch (error: any) {
    console.error('Error fetching mill productions:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil data produksi pabrik', error: error.message });
  }
};

// POST /api/mill-production
export const createProduction = async (req: Request, res: Response) => {
  try {
    const { tanggal_produksi, tbs_olah_kg, cpo_dihasilkan_kg, pk_dihasilkan_kg, catatan } = req.body;

    if (!tanggal_produksi || !tbs_olah_kg || !cpo_dihasilkan_kg || !pk_dihasilkan_kg) {
      return res.status(400).json({ success: false, message: 'Semua field produksi wajib diisi.' });
    }

    const tbsOlah = Number(tbs_olah_kg);
    const cpo = Number(cpo_dihasilkan_kg);
    const pk = Number(pk_dihasilkan_kg);

    // Auto-hitung OER dan KER
    const oer = tbsOlah > 0 ? (cpo / tbsOlah) * 100 : 0;
    const ker = tbsOlah > 0 ? (pk / tbsOlah) * 100 : 0;

    const production = await prisma.millProduction.create({
      data: {
        tanggal_produksi: new Date(tanggal_produksi),
        tbs_olah_kg: tbsOlah,
        cpo_dihasilkan_kg: cpo,
        pk_dihasilkan_kg: pk,
        oer_persen: Math.round(oer * 100) / 100,
        ker_persen: Math.round(ker * 100) / 100,
        catatan,
      },
    });

    res.status(201).json({ success: true, data: production });
  } catch (error: any) {
    console.error('Error creating mill production:', error);
    res.status(500).json({ success: false, message: 'Gagal mencatat produksi pabrik', error: error.message });
  }
};

// PUT /api/mill-production/:id
export const updateProduction = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { tanggal_produksi, tbs_olah_kg, cpo_dihasilkan_kg, pk_dihasilkan_kg, catatan } = req.body;

    const tbsOlah = Number(tbs_olah_kg);
    const cpo = Number(cpo_dihasilkan_kg);
    const pk = Number(pk_dihasilkan_kg);

    const oer = tbsOlah > 0 ? (cpo / tbsOlah) * 100 : 0;
    const ker = tbsOlah > 0 ? (pk / tbsOlah) * 100 : 0;

    const production = await prisma.millProduction.update({
      where: { id },
      data: {
        tanggal_produksi: tanggal_produksi ? new Date(tanggal_produksi) : undefined,
        tbs_olah_kg: tbsOlah,
        cpo_dihasilkan_kg: cpo,
        pk_dihasilkan_kg: pk,
        oer_persen: Math.round(oer * 100) / 100,
        ker_persen: Math.round(ker * 100) / 100,
        catatan,
      },
    });

    res.json({ success: true, data: production });
  } catch (error: any) {
    console.error('Error updating mill production:', error);
    res.status(500).json({ success: false, message: 'Gagal memperbarui produksi pabrik', error: error.message });
  }
};

// DELETE /api/mill-production/:id
export const deleteProduction = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.millProduction.delete({ where: { id } });
    res.json({ success: true, message: 'Data produksi berhasil dihapus' });
  } catch (error: any) {
    console.error('Error deleting mill production:', error);
    res.status(500).json({ success: false, message: 'Gagal menghapus produksi pabrik', error: error.message });
  }
};

// GET /api/mill-production/summary
export const getRendemenSummary = async (req: Request, res: Response) => {
  try {
    const { bulan, tahun } = req.query;
    const year = tahun ? Number(tahun) : new Date().getFullYear();
    const month = bulan ? Number(bulan) - 1 : new Date().getMonth();

    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0, 23, 59, 59, 999);

    const agg = await prisma.millProduction.aggregate({
      _sum: { tbs_olah_kg: true, cpo_dihasilkan_kg: true, pk_dihasilkan_kg: true },
      _avg: { oer_persen: true, ker_persen: true },
      _count: true,
      where: { tanggal_produksi: { gte: start, lte: end } },
    });

    res.json({
      success: true,
      data: {
        total_tbs_olah_kg: Number(agg._sum.tbs_olah_kg || 0),
        total_cpo_kg: Number(agg._sum.cpo_dihasilkan_kg || 0),
        total_pk_kg: Number(agg._sum.pk_dihasilkan_kg || 0),
        rata_oer: Number(agg._avg.oer_persen || 0),
        rata_ker: Number(agg._avg.ker_persen || 0),
        jumlah_hari_produksi: agg._count,
      },
    });
  } catch (error: any) {
    console.error('Error getting rendemen summary:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil ringkasan rendemen', error: error.message });
  }
};
