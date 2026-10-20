import { Router } from "express";
import {
  getServices,
  getServiceByKey,
} from "../controllers/serviceController.js";

const router = Router();
router.get("/", getServices);
router.get("/:service_key", getServiceByKey);

export default router;
