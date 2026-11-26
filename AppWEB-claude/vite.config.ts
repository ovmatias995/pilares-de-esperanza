import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Las dependencias de estos plugins ya figuran en package.json (devDependencies).
export default defineConfig({
  plugins: [react(), tailwindcss()],
});
