import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site-metadata";

const PATHS = ["/", "/builder", "/library", "/overlay", "/setlists"];

export default function sitemap(): MetadataRoute.Sitemap {
  return PATHS.map((path) => ({ url: absoluteUrl(path) }));
}
