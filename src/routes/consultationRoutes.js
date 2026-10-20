import { Router } from "express";
import {
  handleCreateConsultation,
  handleGetConsultations,
  handleGetConsultationById,
  handleUpdateConsultationStatus,
} from "../controllers/consultationController.js";

const router = Router();
router.get("/", handleGetConsultations); // daftar konsultasi
router.get("/:id", handleGetConsultationById); // detail daftar konsltasi
router.post("/", handleCreateConsultation); // buat konsultasi
router.patch("/:id/status", handleUpdateConsultationStatus); // update only status

export default router;
