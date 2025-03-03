import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
    // This is important for the file paths to be correct when running
    // Electron!
    base: "./",
    plugins: [react(), tailwindcss()],
});
