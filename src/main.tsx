import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { getRouter } from "./router";
// Self-hosted fonts (bundled into dist/assets, same origin) instead of a
// render-blocking <link> to fonts.googleapis.com in index.html. A business
// firewall that silently drops Google Fonts used to block first paint and
// delay this module script until that request timed out — reproduced as a
// fully blank page in headless Chromium with fonts.googleapis.com dropped.
// Same families/weights as before: Cormorant Garamond 400/500/600 + italic
// 400/500 (display) and Manrope 300–700 (body, as one variable font).
import "@fontsource/cormorant-garamond/400.css";
import "@fontsource/cormorant-garamond/500.css";
import "@fontsource/cormorant-garamond/600.css";
import "@fontsource/cormorant-garamond/400-italic.css";
import "@fontsource/cormorant-garamond/500-italic.css";
import "@fontsource-variable/manrope/wght.css";
import "./styles.css";
import { forwardMyLimoBizReturnToBook } from "./lib/mylimobiz-return-routing";

// Before the router reads the URL — see the module for why.
forwardMyLimoBizReturnToBook();

const router = getRouter();

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
