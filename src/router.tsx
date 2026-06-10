import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        // Keep pages fresh in memory for 1 min, cached on device for 24h
        staleTime: 60 * 1000,
        gcTime: 24 * 60 * 60 * 1000,
        refetchOnWindowFocus: false,
      },
    },
  });

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    // Preload route chunks + loader data on hover/focus (intent),
    // with viewport observer for visible links.
    defaultPreload: "intent",
    defaultPreloadDelay: 50,
    defaultViewTransition: true,
    defaultPreloadStaleTime: 0,
    defaultStaleTime: 60 * 1000,
    defaultGcTime: 24 * 60 * 60 * 1000,
  });

  return router;
};
