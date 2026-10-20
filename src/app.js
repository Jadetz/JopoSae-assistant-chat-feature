import express from "express";
import cors from "cors";
import pool from "./db.js";
import faqRoutes from "./routes/faqRoutes.js";
import serviceRoutes from "./routes/serviceRoutes.js";
import consultationRoutes from "./routes/consultationRoutes.js";
const app = express();

//middleware
app.use(cors());
app.use(express.json());
// endpoint call
app.use("/api/faqs", faqRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/consultations", consultationRoutes);

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server Ok Masseh",
  });
});

app.get("/api/health/db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW () AS server_time");

    res.status(200).json({
      success: true,
      message: "Koneksi database berhasil.",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Database connection error", error.message);

    res.status(500).json({
      success: false,
      message: "Mohon maaf, koneksi database gagal.",
    });
  }
});
// // services
// app.get("/api/services", async (req, res) => {
//   try {
//     const result = await pool.query(`
//       SELECT
//       id,
//       service_key,
//       name,
//       description
//       FROM services
//       WHERE is_active = TRUE
//       ORDER BY sort_order ASC
//       `);

//     res.status(200).json({
//       succes: true,
//       message: "Service retrieved succesfully",
//       data: result.rows,
//     });
//   } catch (error) {
//     console.error("Failed to retrieve service", error.message);

//     res.status(500).json({
//       succes: false,
//       message: "Failed to retrieve services",
//     });
//   }
// });

export default app;
