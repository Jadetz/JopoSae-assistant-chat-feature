import { Router } from "express";
import requireAdmin from "../middlewares/requireAdmin.js";
import {
  handleGoogleLogin,
  handleGetMe,
  handleLogout,
} from "../controllers/authController.js";

const router = Router();
router.post("/google", handleGoogleLogin);
router.get("/me", requireAdmin, handleGetMe);
router.post("/logout", handleLogout);

export default router;
