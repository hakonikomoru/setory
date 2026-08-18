"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import OverlayDisplay from "@/components/OverlayDisplay";
import {
  getOverlayPreviewBackdropOption,
  isOverlayPreviewBackdrop,
} from "@/lib/overlay-preview-backdrop";
import { useOverlayData } from "@/lib/use-overlay-data";

/** OBS / 表示のみ（?obs=1）。`bg` があればプレビュー背景色、なければ透過 */
export default function OverlayObsOnly() {
  const searchParams = useSearchParams();
  const setlistId = searchParams.get("id");
  const bgParam = searchParams.get("bg");
  const backdrop = bgParam && isOverlayPreviewBackdrop(bgParam) ? bgParam : null;
  const { setlist, data, ready } = useOverlayData(setlistId);

  useEffect(() => {
    document.documentElement.classList.add("overlay-page");
    return () => document.documentElement.classList.remove("overlay-page");
  }, []);

  if (!setlistId || !ready || !setlist) {
    return null;
  }

  const display = <OverlayDisplay setlist={setlist} songs={data.songs} />;

  if (!backdrop) {
    return display;
  }

  const { bgClass } = getOverlayPreviewBackdropOption(backdrop);
  return <div className={`min-h-screen min-w-0 ${bgClass}`}>{display}</div>;
}
