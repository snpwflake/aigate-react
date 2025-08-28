import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ command, mode }) => {
  const isSSR = process.env.BUILD_SSR === "true";

  if (isSSR) {
    // Конфигурация для сборки сервера
    return {
      plugins: [react(), require("tailwindcss"), require("autoprefixer")],
      build: {
        ssr: true,
        outDir: "dist/server",
        rollupOptions: {
          input: "src/entry-server.tsx",
          output: {
            format: "es",
          },
        },
      },
      resolve: {
        alias: {
          "@": path.resolve(__dirname, "./src"),
        },
      },
      ssr: {
        noExternal: ["react-router-dom"],
      },
    };
  }

  // Конфигурация для клиента
  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      outDir: "dist/client",
      rollupOptions: {
        input: path.resolve(__dirname, "index.html"),
      },
    },
    server: {
      port: 5173,
      host: true,
    },
  };
});
