import { defineConfig, type Plugin } from "vite";
import { fileURLToPath, URL } from "node:url";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import { staticHeadHtml, staticShellHtml } from "./src/lib/site-head";

// Writes the sitewide title/meta/JSON-LD and a plain-HTML business summary
// into index.html, so crawlers that don't run JavaScript see a real page
// instead of an empty <div id="root">. See src/lib/site-head.ts for why.
// Throws rather than silently shipping the empty shell if the markers move.
function staticCrawlerContent(): Plugin {
  return {
    name: "lct-static-crawler-content",
    transformIndexHtml(html) {
      if (!html.includes("</head>") || !html.includes('<div id="root"></div>')) {
        throw new Error("staticCrawlerContent: </head> or empty #root not found in index.html");
      }
      return html
        .replace("</head>", `  ${staticHeadHtml()}\n  </head>`)
        .replace('<div id="root"></div>', `<div id="root">${staticShellHtml()}</div>`);
    },
  };
}

export default defineConfig({
  plugins: [
    tanstackRouter({ target: "react", autoCodeSplitting: true }),
    react(),
    tailwindcss(),
    staticCrawlerContent(),
  ],
  server: { host: "0.0.0.0", port: 5173 },
  build: {
    // Never inline self-hosted font subsets as data: URIs (Vite inlines
    // anything under 4 kB by default) — the CSP's `font-src 'self'` blocks
    // data: fonts, and keeping it that way is tighter than allowing data:.
    assetsInlineLimit: (filePath) => (/\.(woff2?|ttf|otf)$/.test(filePath) ? false : undefined),
  },
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
    dedupe: ["react", "react-dom", "@tanstack/react-router"],
  },
});
