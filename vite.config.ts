import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import threeMinifier from "@yushijinhun/three-minifier-rollup";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  base: './',
  server: {
    host: "::",
    port: 8080,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@db": path.resolve(__dirname, "../db"),
    },
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
    threeMinifier()
  ].filter(Boolean),
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  }
}));
