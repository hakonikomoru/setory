import OpengraphImage from "./opengraph-image";
import { SITE_TITLE_FULL } from "@/lib/site-metadata";

export const alt = SITE_TITLE_FULL;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function TwitterImage() {
  return OpengraphImage();
}
