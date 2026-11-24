import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), "");
	const target = env.VITE_API_PROXY || "http://localhost:8080";
	const contentTarget = env.VITE_CONTENT_API_PROXY || "http://localhost:3000";

	// The PHP backend serves the SPA-facing API and the uploads folder from the
	// same origin, so the app talks to /api and Vite forwards it to the backend.
	// The Node content backend (spin-off directory) is reached through /content.
	const proxy = {
		"/api": {
			target,
			changeOrigin: true,
			rewrite: (path: string) => path.replace(/^\/api/, ""),
		},
		"/content": {
			target: contentTarget,
			changeOrigin: true,
			rewrite: (path: string) => path.replace(/^\/content/, ""),
		},
	};

	return {
		plugins: [vue(), tailwindcss()],
		server: { proxy },
		preview: { proxy },
	};
});
