import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProduction = process.env.NODE_ENV === "production";
const port = process.env.PORT || 5173;

console.log(
  `Starting server in ${isProduction ? "production" : "development"} mode`
);

const createServer = async () => {
  const app = express();

  // Middleware для парсинга JSON
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  let vite: any;
  if (!isProduction) {
    try {
      const { createServer } = await import("vite");
      vite = await createServer({
        server: { middlewareMode: true },
        appType: "custom",
        root: process.cwd(),
      });
      app.use(vite.ssrLoadModule);
    } catch (error) {
      console.error("Error creating Vite server:", error);
      throw error;
    }
  } else {
    const distPath = path.resolve(__dirname, "../dist/client");
    if (!fs.existsSync(distPath)) {
      console.error(
        '❌ Production build not found. Please run "npm run build" first.'
      );
      process.exit(1);
    }
    app.use(express.static(distPath));
  }

  // API routes - определяем их ДО catch-all роута
  app.get("/api/health", (req, res) => {
    res.json({
      status: "OK",
      timestamp: new Date().toISOString(),
      mode: isProduction ? "production" : "development",
    });
  });

  app.get("/api/users", (req, res) => {
    res.json([
      { id: 1, name: "John Doe", email: "john@example.com" },
      { id: 2, name: "Jane Smith", email: "jane@example.com" },
    ]);
  });

  // Добавим простой API для тестирования
  app.get("/api/test", (req, res) => {
    res.json({ message: "API is working!", timestamp: Date.now() });
  });

  // SSR handler - это должно быть ПОСЛЕДНИМ
  app.get("*", async (req, res, next) => {
    const url = req.originalUrl;

    // Пропускаем API роуты
    if (url.startsWith("/api/")) {
      return next();
    }

    try {
      let template: string;
      let render: any;

      if (!isProduction) {
        // Development mode
        template = fs.readFileSync(
          path.resolve(__dirname, "../../index.html"),
          "utf-8"
        );
        template = await vite.transformIndexHtml(url, template);
        render = (await vite.ssrLoadModule("/src/entry-server.tsx")).render;
      } else {
        // Production mode
        const templatePath = path.resolve(
          __dirname,
          "../dist/client/index.html"
        );
        if (!fs.existsSync(templatePath)) {
          throw new Error(
            'Template file not found. Please run "npm run build" first.'
          );
        }
        template = fs.readFileSync(templatePath, "utf-8");
        render = (await import("../dist/server/entry-server.js")).render;
      }

      const { html: appHtml } = await render(url);
      const html = template.replace("", appHtml);

      res.status(200).set({ "Content-Type": "text/html" }).end(html);
    } catch (e) {
      console.error("SSR Error:", e);
      if (!isProduction && vite) {
        vite.ssrFixStacktrace(e);
      }

      // Fallback - отправляем базовый HTML
      try {
        const fallbackTemplate = fs.readFileSync(
          path.resolve(__dirname, "../../index.html"),
          "utf-8"
        );
        const fallbackHtml = fallbackTemplate.replace(
          "",
          '<div id="root"></div>'
        );
        res.status(200).set({ "Content-Type": "text/html" }).end(fallbackHtml);
      } catch (fallbackError) {
        console.error("Fallback error:", fallbackError);
        res.status(500).send("Internal Server Error");
      }
    }
  });

  return app;
};

createServer()
  .then((app) => {
    app.listen(port, () => {
      console.log(`🚀 Server running at http://localhost:${port}`);
      console.log(`📦 Mode: ${isProduction ? "production" : "development"}`);
      console.log(`🔗 API Health: http://localhost:${port}/api/health`);
    });
  })
  .catch((err) => {
    console.error("❌ Error starting server:", err);
    process.exit(1);
  });
