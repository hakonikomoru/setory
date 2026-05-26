"use client";

import { useCallback, useEffect, useState } from "react";
import { loadAppData, saveAppData, seedSampleSongsIfEmpty } from "@/lib/storage";
import type { AppData } from "@/types/setlist";

export function useAppData() {
  const [data, setData] = useState<AppData>({ songs: [], setlists: [] });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const loaded = seedSampleSongsIfEmpty(loadAppData());
    if (loaded.songs.length > 0 && loadAppData().songs.length === 0) {
      saveAppData(loaded);
    }
    // Load localStorage after hydration
    // eslint-disable-next-line react-hooks/set-state-in-effect -- client-only bootstrap
    setData(loaded);
    setReady(true);
  }, []);

  const persist = useCallback((next: AppData) => {
    setData(next);
    saveAppData(next);
  }, []);

  return { data, setData: persist, ready };
}
