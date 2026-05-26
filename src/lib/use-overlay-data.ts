"use client";

import { useCallback, useEffect, useState } from "react";
import { APP_DATA_UPDATED_EVENT, loadAppData } from "@/lib/storage";
import type { AppData, Setlist } from "@/types/setlist";

const POLL_MS = 1000;

export function useOverlayData(setlistId: string | null) {
  const [data, setData] = useState<AppData>({ songs: [], setlists: [] });
  const [ready, setReady] = useState(false);

  const reload = useCallback(() => {
    setData(loadAppData());
    setReady(true);
  }, []);

  useEffect(() => {
    reload();
    const onStorage = (event: StorageEvent) => {
      if (event.key === "setory:data" || event.key === null) reload();
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener(APP_DATA_UPDATED_EVENT, reload);
    const timer = window.setInterval(reload, POLL_MS);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(APP_DATA_UPDATED_EVENT, reload);
      window.clearInterval(timer);
    };
  }, [reload]);

  const setlist: Setlist | undefined = setlistId
    ? data.setlists.find((item) => item.id === setlistId)
    : undefined;

  return { data, setlist, ready };
}
