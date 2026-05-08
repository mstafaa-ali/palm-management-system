import { Router } from "express";
import {
  getAllWeighbridgeLogs,
  getDailySummary,
  getWeighbridgeById,
  createWeighbridgeEntry,
  updateTara
} from "../controllers/weighbridge.controller";

const router = Router();

router.get("/", getAllWeighbridgeLogs);
router.post("/", createWeighbridgeEntry);

router.get("/summary", getDailySummary);

router.get("/:id", getWeighbridgeById);
router.patch("/:id/tara", updateTara);

export default router;
