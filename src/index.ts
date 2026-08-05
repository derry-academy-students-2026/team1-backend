import { time } from "console";
import express from "express";

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

// Health endpoint
app.get("/health", (req, res) => {
  res.json({ status: "UP", time: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Health Endpoint of Basic Node: http://localhost:${PORT}/health`);
});