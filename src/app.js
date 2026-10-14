import express from "express";
import cors from "cors";
import pool from "./db.js";
const app = express();

//middleware
app.use(cors());
app.use(express.json());

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

export default app;
