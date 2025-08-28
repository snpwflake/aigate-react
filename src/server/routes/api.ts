import express from "express";

const router = express.Router();

router.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

router.get("/users", (req, res) => {
  // Здесь будет логика работы с базой данных
  res.json([
    { id: 1, name: "John Doe", email: "john@example.com" },
    { id: 2, name: "Jane Smith", email: "jane@example.com" },
  ]);
});

export default router;
