import express from "express";
import cors from "cors";
import pool from "./db.js";
import serviceKeyRoutes from "./routes/serviceKeyRoutes.js";
import faqRoutes from "./routes/faqRoutes.js";
import serviceRoutes from "./routes/serviceRoutes.js";
const app = express();

//middleware
app.use(cors());
app.use(express.json());
// endpoint call
app.use("/api/services", serviceKeyRoutes);
app.use("/api/faqs", faqRoutes);
app.use("/api/services", serviceRoutes);

app.get("/", (req, res) => {
  res.status(200).json({
    succes: true,
    message: "Server Ok Masseh",
  });
});

app.get("/api/health/db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW () AS server_time");

    res.status(200).json({
      succes: true,
      message: "Database connected succesfully!",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Database connection error", error.message);

    res.status(500).json({
      succes: false,
      message: "Database connection failed",
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
