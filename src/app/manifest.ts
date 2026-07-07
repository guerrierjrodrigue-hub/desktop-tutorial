import type { MetadataRoute } from "next";
import { APP_NAME, APP_DESCRIPTION } from "@/lib/constants";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: APP_NAME,
    short_name: "Kingdom",
    description: APP_DESCRIPTION,
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#000000",
    orientation: "portrait",
    categories: ["health", "fitness", "lifestyle"],
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
    ],
  };
}
