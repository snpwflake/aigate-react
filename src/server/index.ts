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
    // Production - статические файлы
    const distPath = path.resolve(__dirname, "../dist/client");
    console.log(`📁 Looking for static files in: ${distPath}`);

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

  app.get("/api/test", (req, res) => {
    res.json({ message: "API is working!", timestamp: Date.now() });
  });

  // Главный обработчик для SPA
  app.get("*", async (req, res, next) => {
    const url = req.originalUrl;

    // Пропускаем API роуты
    if (url.startsWith("/api/")) {
      return next();
    }

    try {
      if (!isProduction) {
        // Development mode с SSR
        let template = fs.readFileSync(
          path.resolve(__dirname, "../../index.html"),
          "utf-8"
        );
        template = await vite.transformIndexHtml(url, template);

        try {
          const render = (await vite.ssrLoadModule("/src/entry-server.tsx"))
            .render;
          const { html: appHtml } = await render(url);
          const html = template.replace("", appHtml);
          res.status(200).set({ "Content-Type": "text/html" }).end(html);
        } catch (ssrError) {
          console.warn(
            "SSR failed, falling back to client-side rendering:",
            ssrError
          );
          // Fallback к client-side rendering
          const html = template.replace("", '<div id="root"></div>');
          res.status(200).set({ "Content-Type": "text/html" }).end(html);
        }
      } else {
        // Production mode - простая SPA без SSR
        const indexPath = path.resolve(__dirname, "../dist/client/index.html");

        if (fs.existsSync(indexPath)) {
          res.sendFile(indexPath);
        } else {
          res.status(404).send(`
            <h1>Build not found</h1>
            <p>Please run "npm run build" first.</p>
            <p>Looking for: ${indexPath}</p>
          `);
        }
      }
    } catch (error) {
      console.error("Route handler error:", error);
      res.status(500).send("Internal Server Error");
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

      if (isProduction) {
        const distPath = path.resolve(__dirname, "../dist/client");
        console.log(`📁 Static files: ${distPath}`);
        console.log(`📄 Index file: ${path.join(distPath, "index.html")}`);
      }
    });
  })
  .catch((err) => {
    console.error("❌ Error starting server:", err);
    process.exit(1);
  });
