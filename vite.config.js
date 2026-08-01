import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
var lanHost = "192.168.5.45";
export default defineConfig({
    plugins: [vue()],
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
