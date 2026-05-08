import { Request, Response } from "express";
import prisma from "../lib/prisma";

// GET /api/weighbridge
export const getAllWeighbridgeLogs = async (req: Request, res: Response) => {
  try {
    const { tanggal, status, sumber } = req.query;

    const whereClause: any = {};
    if (status) whereClause.status = status;
    if (sumber) whereClause.sumber = sumber;
    
    if (tanggal) {
      const dateStr = tanggal as string;
      const startOfDay = new Date(`${dateStr}T00:00:00.000Z`);
      const endOfDay = new Date(`${dateStr}T23:59:59.999Z`);
      whereClause.waktu_masuk = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    const logs = await prisma.weighbridgeLog.findMany({
      where: whereClause,
      orderBy: { waktu_masuk: "desc" },
    });

    res.json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, error: "Gagal mengambil data timbangan" });
  }
};

// GET /api/weighbridge/summary
export const getDailySummary = async (req: Request, res: Response) => {
  try {
    const dateStr = (req.query.tanggal as string) || new Date().toISOString().split("T")[0];
    const startOfDay = new Date(`${dateStr}T00:00:00.000Z`);
    const endOfDay = new Date(`${dateStr}T23:59:59.999Z`);

    const logs = await prisma.weighbridgeLog.findMany({
      where: {
        waktu_masuk: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    const totalTruk = logs.length;
    const internalCount = logs.filter((log) => log.sumber === "Internal").length;
    const eksternalCount = logs.filter((log) => log.sumber === "Eksternal").length;

    const totalNetto = logs.reduce((acc, log) => {
      if (log.status === "selesai" && log.berat_netto_kg) {
        return acc + Number(log.berat_netto_kg);
      }
      return acc;
    }, 0);

    res.json({
      success: true,
      data: {
        totalTruk,
        internalCount,
        eksternalCount,
        totalNetto_ton: totalNetto / 1000,
        totalNetto_kg: totalNetto,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Gagal mengambil summary" });
  }
};

// GET /api/weighbridge/:id
export const getWeighbridgeById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const log = await prisma.weighbridgeLog.findUnique({
      where: { id },
      include: { land: true },
    });

    if (!log) return res.status(404).json({ success: false, error: "Data tidak ditemukan" });

    res.json({ success: true, data: log });
  } catch (error) {
    res.status(500).json({ success: false, error: "Gagal mengambil data" });
  }
};

// POST /api/weighbridge
export const createWeighbridgeEntry = async (req: Request, res: Response) => {
  try {
    const { nomor_kendaraan, nama_supir, sumber, land_id, nama_pemasok, berat_bruto_kg } = req.body;

    if (!nomor_kendaraan || !sumber || !berat_bruto_kg) {
      return res.status(400).json({ success: false, error: "Data wajib tidak lengkap" });
    }

    if (sumber === "Internal" && !land_id) {
      return res.status(400).json({ success: false, error: "land_id wajib untuk sumber Internal" });
    }
    if (sumber === "Eksternal" && !nama_pemasok) {
      return res.status(400).json({ success: false, error: "nama_pemasok wajib untuk sumber Eksternal" });
    }

    const entry = await prisma.weighbridgeLog.create({
      data: {
        nomor_kendaraan,
        nama_supir,
        sumber,
        land_id: sumber === "Internal" ? land_id : null,
        nama_pemasok: sumber === "Eksternal" ? nama_pemasok : null,
        berat_bruto_kg: Number(berat_bruto_kg),
        status: "masuk",
      },
    });

    res.status(201).json({ success: true, data: entry });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ success: false, error: "Gagal mencatat data timbangan masuk", details: error.message || error });
  }
};

// PATCH /api/weighbridge/:id/tara
export const updateTara = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { berat_tara_kg } = req.body;

    if (!berat_tara_kg) {
      return res.status(400).json({ success: false, error: "berat_tara_kg wajib diisi" });
    }

    const entry = await prisma.weighbridgeLog.findUnique({ where: { id } });
    if (!entry) return res.status(404).json({ success: false, error: "Data tidak ditemukan" });

    if (entry.status === "selesai") {
      return res.status(400).json({ success: false, error: "Data ini sudah selesai ditimbang" });
    }

    const tara = Number(berat_tara_kg);
    const bruto = Number(entry.berat_bruto_kg);
    
    if (tara >= bruto) {
      return res.status(400).json({ success: false, error: "Berat tara tidak boleh lebih besar dari atau sama dengan bruto" });
    }

    const netto = bruto - tara;

    const updated = await prisma.weighbridgeLog.update({
      where: { id },
      data: {
        berat_tara_kg: tara,
        berat_netto_kg: netto,
        waktu_keluar: new Date(),
        status: "selesai",
      },
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Gagal mengupdate tara" });
  }
};
