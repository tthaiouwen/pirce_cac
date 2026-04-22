import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "node:path";

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/element-plus")) {
            return "element-plus";
          }

          if (id.includes("node_modules/vue") || id.includes("node_modules/pinia") || id.includes("node_modules/vue-router")) {
            return "vue-vendor";
          }

          if (id.includes("node_modules")) {
            return "vendor";
          }
        }
      }
    }
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true
      }
    }
  }
});
