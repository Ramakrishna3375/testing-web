import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { BASE_URL, LOCALMART_BASE_URL } from "./src/Services/helper";

export default defineConfig({
 plugins: [react(), tailwindcss()],
 server: {
   proxy: {
     "/api": {
       target: LOCALMART_BASE_URL, //
       changeOrigin: true,
       secure: false,
     },
     "/papi": {
       target: BASE_URL, //
       changeOrigin: true,
       secure: false,
     },
   },
 },
});