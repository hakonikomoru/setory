import { getSongsFromSetlist } from "@/lib/setlist-engine";
import type { OverlayMode, OverlayTheme, Setlist, Song } from "@/types/setlist";

export const DEFAULT_OVERLAY_VISIBLE = true;
export const DEFAULT_OVERLAY_MODE: OverlayMode = "currentAndNext";
export const DEFAULT_OVERLAY_THEME: OverlayTheme = "simple";

export function overlayVisible(setlist: Setlist): boolean {
  return setlist.overlayVisible ?? DEFAULT_OVERLAY_VISIBLE;
}

export function overlayMode(setlist: Setlist): OverlayMode {
  return setlist.overlayMode ?? DEFAULT_OVERLAY_MODE;
}

export function overlayTheme(setlist: Setlist): OverlayTheme {
  return setlist.overlayTheme ?? DEFAULT_OVERLAY_THEME;
}

export type OverlaySongContext = {
  ordered: Song[];
  /** 現在の曲より前（SETLIST に表示する曲） */
  past: Song[];
  current?: Song;
  next?: Song;
  /** 次の曲以降（未歌唱） */
  upcoming: Song[];
  currentIndex: number;
};

export function resolveOverlaySongs(
  setlist: Setlist,
  songs: Song[],
): OverlaySongContext {
  const ordered = getSongsFromSetlist(setlist, songs);
  const currentIndex = setlist.currentSongId
    ? ordered.findIndex((song) => song.id === setlist.currentSongId)
    : -1;
  const current = currentIndex >= 0 ? ordered[currentIndex] : undefined;
  const past = currentIndex > 0 ? ordered.slice(0, currentIndex) : [];
  const upcoming =
    currentIndex >= 0 && currentIndex < ordered.length - 1
      ? ordered.slice(currentIndex + 1)
      : [];
  const next =
    isFirstSongNextSuppressed(setlist, currentIndex) ? undefined : upcoming[0];

  return { ordered, past, current, next, upcoming, currentIndex };
}

/** 1曲目のとき NEXT を隠すか（未指定時も 1曲目では隠す） */
export function isFirstSongNextSuppressed(
  setlist: Setlist,
  currentIndex: number,
): boolean {
  return currentIndex === 0 && setlist.overlaySuppressNext !== false;
}

export type OverlayNavigation = {
  currentSongId?: string;
  overlaySuppressNext?: boolean;
};

export function navigateOverlayNext(
  setlist: Setlist,
  songs: Song[],
): OverlayNavigation {
  const { ordered, currentIndex } = resolveOverlaySongs(setlist, songs);
  if (ordered.length === 0) return {};

  if (currentIndex < 0) {
    return { currentSongId: ordered[0].id, overlaySuppressNext: true };
  }
  if (currentIndex === 0 && isFirstSongNextSuppressed(setlist, currentIndex)) {
    if (ordered.length === 1) {
      return { currentSongId: ordered[0].id, overlaySuppressNext: true };
    }
    return { currentSongId: ordered[1].id };
  }
  if (currentIndex >= ordered.length - 1) {
    return { currentSongId: ordered[currentIndex].id };
  }
  return { currentSongId: ordered[currentIndex + 1].id };
}

export function navigateOverlayPrev(
  setlist: Setlist,
  songs: Song[],
): OverlayNavigation {
  const { ordered, currentIndex } = resolveOverlaySongs(setlist, songs);
  if (ordered.length === 0 || currentIndex < 0) return {};

  if (currentIndex === 0) {
    if (setlist.overlaySuppressNext === false) {
      return { currentSongId: ordered[0].id, overlaySuppressNext: true };
    }
    return { currentSongId: ordered[0].id, overlaySuppressNext: true };
  }

  const prevIndex = currentIndex - 1;
  return {
    currentSongId: ordered[prevIndex].id,
    overlaySuppressNext: prevIndex === 0 ? true : undefined,
  };
}

export function canNavigateOverlayPrev(
  setlist: Setlist,
  songs: Song[],
): boolean {
  const { ordered, currentIndex } = resolveOverlaySongs(setlist, songs);
  if (ordered.length === 0 || currentIndex < 0) return false;
  if (currentIndex > 0) return true;
  return setlist.overlaySuppressNext === false;
}

function appOrigin(origin?: string): string {
  return origin ?? (typeof window !== "undefined" ? window.location.origin : "");
}

/** 配信操作パネル（ブラウザで操作する画面） */
export function buildOverlayControlUrl(setlistId: string, origin?: string): string {
  return `${appOrigin(origin)}/overlay?id=${encodeURIComponent(setlistId)}`;
}

/** OBS ブラウザソース用（表示のみ・透過） */
export function buildObsDisplayUrl(setlistId: string, origin?: string): string {
  return `${appOrigin(origin)}/overlay?obs=1&id=${encodeURIComponent(setlistId)}`;
}

/** @deprecated buildObsDisplayUrl を OBS 用、buildOverlayControlUrl を操作画面用に */
export function buildOverlayUrl(setlistId: string, origin?: string): string {
  return buildObsDisplayUrl(setlistId, origin);
}

export function advanceCurrentSongId(
  setlist: Setlist,
  songs: Song[],
): string | undefined {
  return navigateOverlayNext(setlist, songs).currentSongId;
}

export function rewindCurrentSongId(
  setlist: Setlist,
  songs: Song[],
): string | undefined {
  return navigateOverlayPrev(setlist, songs).currentSongId;
}

export const OVERLAY_THEME_CLASS: Record<
  OverlayTheme,
  { panel: string; label: string; title: string; sub: string }
> = {
  simple: {
    panel:
      "rounded-2xl border border-white/30 bg-white/92 px-6 py-4 shadow-lg shadow-black/20",
    label: "text-xs font-bold uppercase tracking-wide text-violet-600",
    title: "text-2xl font-black leading-tight text-violet-950",
    sub: "text-lg font-semibold leading-snug text-violet-800",
  },
  cute: {
    panel:
      "rounded-2xl border-2 border-pink-200 bg-gradient-to-br from-pink-50/95 to-violet-50/95 px-6 py-4 shadow-lg shadow-pink-200/40",
    label: "text-xs font-bold text-pink-600",
    title: "text-2xl font-black leading-tight text-pink-900",
    sub: "text-lg font-semibold leading-snug text-violet-800",
  },
  dark: {
    panel:
      "rounded-2xl border border-violet-500/40 bg-violet-950/90 px-6 py-4 shadow-lg shadow-black/40",
    label: "text-xs font-bold uppercase tracking-wide text-violet-300",
    title: "text-2xl font-black leading-tight text-white",
    sub: "text-lg font-semibold leading-snug text-violet-100",
  },
  komoru: {
    panel:
      "rounded-2xl border-2 border-violet-400/60 bg-violet-900/88 px-6 py-4 shadow-lg shadow-violet-900/50",
    label: "text-xs font-bold text-fuchsia-300",
    title: "text-2xl font-black leading-tight text-white",
    sub: "text-lg font-semibold leading-snug text-violet-100",
  },
};
