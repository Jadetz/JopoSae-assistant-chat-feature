import express from "express";
import cors from "cors";
import pool from "./db.js";
import faqRoutes from "./routes/faqRoutes.js";
import serviceRoutes from "./routes/serviceRoutes.js";
import consultationRoutes from "./routes/consultationRoutes.js";
import { sendSuccess } from "./lib/respond.js";
import notFoundHandler from "./middlewares/notFoundHandler.js";
import errorHandler from "./middlewares/errorHandler.js";
const app = express();

// Comma-separated list in  DASHBOARD_ORIGIN. Empty means no other origin is allowed
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
// endpoint call
app.use("/api/faqs", faqRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/consultations", consultationRoutes);

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

// Unknown routes, then every error; both must stay bellow all routes
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
