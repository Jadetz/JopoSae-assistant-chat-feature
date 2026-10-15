import { Router } from "express";
import { getServiceByKey } from "../controllers/serviceKeyController.js";

const router = Router();

router.get("/:service_key", getServiceByKey);

export default router;
