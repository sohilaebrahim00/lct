import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    // Explicit "intent" (hover/focus) rather than the router's eager
    // viewport-based default — verified via Lighthouse that the previous
    // (implicit) default was fetching every nav-linked route's images on
    // initial homepage load, competing with the actual LCP image for
    // bandwidth even though the nav is always in the viewport.
    defaultPreload: "intent",
  });

  return router;
};
