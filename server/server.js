// server.js
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import sendNewsletter from "./api/newsletter.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// Logging middleware for debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});
app.get("/api/sendNewsletter", (req, res) => {
  res.status(200).json({ message: "This is the GET test for sendNewsletter!" });
});

// Newsletter POST API route
app.post("/api/sendNewsletter", async (req, res) => {
  try {
    await sendNewsletter(req, res);
  } catch (err) {
    console.error("Newsletter route error:", err);
    res.status(500).json({ error: "Internal server error in newsletter route", details: err.message });
  }
});

// GET message API route
app.get("/api/sendNewsletter", (req, res) => {
  res.status(200).json({ message: "This is the GET test for sendNewsletter!" });
});

// Catch-all 404 handler
app.use((req, res) => {
  console.warn(`404 Not Found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: "Endpoint not found", path: req.originalUrl });
});

// Error-handling middleware
app.use((err, req, res, next) => {
  console.error("Unexpected server error:", err);
  res.status(500).json({ error: "Unexpected server error", details: err.message });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
