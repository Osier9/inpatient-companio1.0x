import { defineConfig, type PluginOption } from "vite";
import vue from "@vitejs/plugin-vue";

const lanHost = "192.168.5.45";

export default defineConfig({
  plugins: [vue() as PluginOption],
  server: {
    host: lanHost,
    port: 5173,
    strictPort: true
  },
  preview: {
    host: lanHost,
    port: 4173,
    strictPort: true
  }
});
