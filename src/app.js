import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import pool from "./db.js";
import faqRoutes from "./routes/faqRoutes.js";
import serviceRoutes from "./routes/serviceRoutes.js";
import consultationRoutes from "./routes/consultationRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import { sendSuccess } from "./lib/respond.js";
import notFoundHandler from "./middlewares/notFoundHandler.js";
import errorHandler from "./middlewares/errorHandler.js";
import requireAdmin from "./middlewares/requireAdmin.js";
const app = express();

// Comma-separated list in DASHBOARD_ORIGIN. Empty means no other origin is allowed
const allowedOrigins = (process.env.DASHBOARD_ORIGIN || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
// middleware
app.use(
  cors({
    origin: allowedOrigins.length > 0 ? allowedOrigins : false,
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());
// endpoint call
// Data routes need a signed-in admin: /api/auth/google, /api/auth/logout, /api/health/db, and / stay public.
app.use("/api/faqs", requireAdmin, faqRoutes);
app.use("/api/services", requireAdmin, serviceRoutes);
app.use("/api/consultations", requireAdmin, consultationRoutes);
app.use("/api/auth", authRoutes);
app.get("/", (req, res) => {
  sendSuccess(res, {
    message: "Server ok masseh.",
  });
});

app.get("/api/health/db", async (req, res) => {
  const result = await pool.query("SELECT NOW () AS server_time");
  sendSuccess(res, {
    message: "Koneksi database berhasil.",
    data: result.rows[0],
  });
});

// Unknown routes, then every error; both must stay below all routes
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
