"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import OverlayDisplay from "@/components/OverlayDisplay";
import { useOverlayData } from "@/lib/use-overlay-data";

/** OBS ブラウザソース用（?obs=1・表示のみ・透過） */
export default function OverlayObsOnly() {
  const searchParams = useSearchParams();
  const setlistId = searchParams.get("id");
  const { setlist, data, ready } = useOverlayData(setlistId);

  useEffect(() => {
    document.documentElement.classList.add("overlay-page");
    return () => document.documentElement.classList.remove("overlay-page");
  }, []);

  if (!setlistId || !ready || !setlist) {
    return null;
  }

  return <OverlayDisplay setlist={setlist} songs={data.songs} />;
}
