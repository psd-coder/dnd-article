import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import svgr from "vite-plugin-svgr";

export default defineConfig({
  base: "/dnd-article/",
  plugins: [tsconfigPaths(), react(), svgr()],
  css: {
    modules: {
      generateScopedName: "[name]__[local]-[hash:base64:5]",
    },
  },
});
