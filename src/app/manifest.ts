import type { MetadataRoute } from "next";

/**
 * Web app manifest — makes ONETRAVEL installable to the home screen on any
 * device (Android/Chrome/Edge, desktop Chromium, and iOS via apple-icon).
 * Icons are generated on the fly by src/app/icon.tsx and apple-icon.tsx.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ONETRAVEL",
    short_name: "ONETRAVEL",
    description:
      "Plan trips with your group, set a shared funding target, track contributions, and split expenses fairly.",
    start_url: "/app",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#f7f5f2",
    theme_color: "#0e7c73",
    categories: ["finance", "travel", "productivity"],
    icons: [
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
