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

// Newsletter API route
app.post("/api/sendNewsletter", sendNewsletter);

// Test route
app.get("/", (req, res) => {
  res.send("Newsletter backend is running...");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
