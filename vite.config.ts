import { defineConfig } from "vite";
import path from "path";
import vue from "@vitejs/plugin-vue";
import jsx from "@vitejs/plugin-vue-jsx";
import viteElectron from "./scripts/hooks";

// https://vitejs.dev/config/

export default defineConfig({
  resolve: {
    alias: [
      {
        find: "@",
        replacement: path.resolve(__dirname, "src"),
      },
      {
        find: "components",
        replacement: path.resolve(__dirname, "src/components"),
      },
      {
        find: "resources",
        replacement: path.resolve(__dirname, "resources"),
      },
    ],
  },
  plugins: [
    vue(),
    jsx(),
    viteElectron({
      serve: {
        filter: {
          include: [],
        },
      },
      build: {
        preload: "preload.ts",
      },
    }),
  ],
});
