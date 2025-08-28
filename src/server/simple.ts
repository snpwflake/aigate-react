import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const port = process.env.PORT || 3001;

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/users", (req, res) => {
  res.json([
    { id: 1, name: "John Doe", email: "john@example.com" },
    { id: 2, name: "Jane Smith", email: "jane@example.com" },
  ]);
});

app.get("/api/test", (req, res) => {
  res.json({ message: "Simple API is working!", timestamp: Date.now() });
});

app.listen(port, () => {
  console.log(`🚀 API Server running at http://localhost:${port}`);
  console.log(`🔗 Health check: http://localhost:${port}/api/health`);
});
