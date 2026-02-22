import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TRACE — Sickle Cell Causal Intelligence",
    short_name: "TRACE",
    description:
      "Trace the hidden connections across body systems. Powered by Claude.",
    start_url: "/trace/new",
    display: "standalone",
    background_color: "#0F0E0D",
    theme_color: "#0F0E0D",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "New Trace",
        url: "/trace/new",
        description: "Start a new symptom trace",
      },
      {
        name: "Analytics",
        url: "/analytics",
        description: "View health metrics and risk trends",
      },
    ],
  };
}
