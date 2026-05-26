import { SAMPLE_SONGS } from "@/lib/sample-songs";
import type { AppData, Setlist, Song } from "@/types/setlist";

const STORAGE_KEY = "setory:data";

/** 同一タブ内のオーバーレイ iframe などへ即時反映する */
export const APP_DATA_UPDATED_EVENT = "setory:data-updated";
const LEGACY_STORAGE_KEYS = ["setori-maker:data", "setlist-creator:data"] as const;

const EMPTY_DATA: AppData = { songs: [], setlists: [] };

function isBrowser() {
  return typeof window !== "undefined";
}

export function loadAppData(): AppData {
  if (!isBrowser()) return EMPTY_DATA;

  try {
    let raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      for (const legacyKey of LEGACY_STORAGE_KEYS) {
        raw = localStorage.getItem(legacyKey);
        if (raw) {
          localStorage.setItem(STORAGE_KEY, raw);
          localStorage.removeItem(legacyKey);
          break;
        }
      }
    }
    if (!raw) return EMPTY_DATA;
    const parsed = JSON.parse(raw) as AppData;
    return {
      songs: Array.isArray(parsed.songs) ? parsed.songs : [],
      setlists: Array.isArray(parsed.setlists) ? parsed.setlists : [],
    };
  } catch {
    return EMPTY_DATA;
  }
}

export function saveAppData(data: AppData) {
  if (!isBrowser()) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  window.dispatchEvent(new CustomEvent(APP_DATA_UPDATED_EVENT));
}

export function seedSampleSongsIfEmpty(data: AppData): AppData {
  if (data.songs.length > 0) return data;
  return { ...data, songs: SAMPLE_SONGS };
}

export function upsertSong(data: AppData, song: Song): AppData {
  const exists = data.songs.some((s) => s.id === song.id);
  const songs = exists
    ? data.songs.map((s) => (s.id === song.id ? song : s))
    : [...data.songs, song];
  return { ...data, songs };
}

export function removeSong(data: AppData, songId: string): AppData {
  return {
    songs: data.songs.filter((s) => s.id !== songId),
    setlists: data.setlists.map((setlist) => ({
      ...setlist,
      songIds: setlist.songIds.filter((id) => id !== songId),
      currentSongId: setlist.currentSongId === songId ? undefined : setlist.currentSongId,
    })),
  };
}

export function upsertSetlist(data: AppData, setlist: Setlist): AppData {
  const exists = data.setlists.some((s) => s.id === setlist.id);
  const setlists = exists
    ? data.setlists.map((s) => (s.id === setlist.id ? setlist : s))
    : [...data.setlists, setlist];
  return { ...data, setlists };
}

export function removeSetlist(data: AppData, setlistId: string): AppData {
  return {
    ...data,
    setlists: data.setlists.filter((s) => s.id !== setlistId),
  };
}

export function createId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}
