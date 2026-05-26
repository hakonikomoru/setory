"use client";

import OverlayNowTitleMarquee from "@/components/OverlayNowTitleMarquee";
import { formatDuration } from "@/lib/setlist-engine";
import {
  OVERLAY_THEME_CLASS,
  overlayMode,
  overlayTheme,
  overlayVisible,
  resolveOverlaySongs,
} from "@/lib/overlay";
import type { Setlist, Song } from "@/types/setlist";

type Props = {
  setlist: Setlist;
  songs: Song[];
  /** 操作画面の左カラムなど狭い領域向け */
  compact?: boolean;
};

function panelClass(base: string, compact: boolean, extra = ""): string {
  if (!compact) return `${base} ${extra}`.trim();
  const sized = base
    .replace(/px-6/g, "px-4")
    .replace(/px-8/g, "px-4")
    .replace(/py-4/g, "py-3")
    .replace(/py-6/g, "py-3");
  return `${sized} max-w-full min-w-0 ${extra}`.trim();
}

export default function OverlayDisplay({ setlist, songs, compact = false }: Props) {
  if (!overlayVisible(setlist)) return null;

  const mode = overlayMode(setlist);
  const theme = overlayTheme(setlist);
  const styles = OVERLAY_THEME_CLASS[theme];
  const { ordered, past, current, next, currentIndex } = resolveOverlaySongs(
    setlist,
    songs,
  );
  const showDuration = !setlist.hideDuration;

  function songSubLine(song: (typeof ordered)[number]) {
    return (
      <>
        {song.artist}
        {showDuration ? `（${formatDuration(song.durationSec)}）` : ""}
      </>
    );
  }

  function pastSongsPanel() {
    if (past.length === 0) return null;
    return (
      <div className="px-1 pt-0.5 opacity-55">
        <p className={`${styles.label} text-xs`}>SETLIST</p>
        <ul className="mt-1 space-y-0.5">
          {past.map((song) => {
            const indexInSetlist = ordered.findIndex((item) => item.id === song.id);
            return (
              <li key={song.id} className={`text-sm leading-snug ${styles.sub}`}>
                {indexInSetlist + 1}. {song.title} / {song.artist}
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  const rootClass = compact ? "min-w-0 max-w-full py-px" : "p-4";

  if (ordered.length === 0) {
    return (
      <div className={rootClass}>
        <p className={panelClass(styles.panel, compact, styles.sub)}>セトリが空です</p>
      </div>
    );
  }

  if (mode === "fullSetlist") {
    return (
      <div className={rootClass}>
        <div className={panelClass(styles.panel, compact)}>
          <p className={styles.label}>{setlist.name}</p>
          <ol className="mt-4 grid gap-2">
            {ordered.map((song, index) => {
              const isCurrent = index === currentIndex;
              const isPast = currentIndex >= 0 && index < currentIndex;
              return (
                <li
                  key={song.id}
                  className={
                    isCurrent
                      ? "rounded-xl bg-violet-600/20 px-3 py-2 ring-2 ring-violet-400"
                      : isPast
                        ? "px-3 py-1 opacity-55"
                        : "px-3 py-1"
                  }
                >
                  <p
                    className={
                      compact
                        ? `${styles.title} text-lg leading-snug break-words`
                        : styles.title
                    }
                  >
                    {String(index + 1).padStart(2, "0")} {song.title}
                  </p>
                  <p className={styles.sub}>
                    {song.artist}
                    {showDuration
                      ? `（${formatDuration(song.durationSec)}）`
                      : ""}
                  </p>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    );
  }

  if (!current) {
    return (
      <div className={rootClass}>
        <div className={panelClass(styles.panel, compact)}>
          <p className={styles.label}>Setory</p>
          <p className={`mt-2 ${styles.sub}`}>
            セトリ作成で「現在の曲にする」を選んでください
          </p>
        </div>
      </div>
    );
  }

  const showPast =
    mode === "current" || mode === "currentAndNext";

  const nowTitleClass = compact
    ? `${styles.title} text-xl`
    : `${styles.title} text-3xl`;
  const nowSubClass = compact ? `${styles.sub} text-sm` : styles.sub;
  const nextTitleClass = compact
    ? `text-base font-semibold leading-snug opacity-90 ${styles.sub}`
    : `text-lg font-semibold leading-snug opacity-90 ${styles.sub}`;
  const nextSubClass = compact
    ? `text-xs opacity-80 ${styles.sub}`
    : `text-sm opacity-80 ${styles.sub}`;

  return (
    <div className={rootClass}>
      <div className="grid min-w-0 max-w-full gap-2">
        <div
          className={panelClass(
            styles.panel,
            compact,
            compact
              ? "py-3 shadow-md ring-1 ring-violet-400/40"
              : "py-4 shadow-lg ring-1 ring-violet-400/45",
          )}
        >
          <p className={`overlay-now-label ${styles.label} tracking-wider`}>
            Now Singing
          </p>
          <OverlayNowTitleMarquee
            songId={current.id}
            line={`${currentIndex + 1}. ${current.title}`}
            className={nowTitleClass}
          />
          <p className={`mt-1 ${nowSubClass}`}>{songSubLine(current)}</p>
        </div>
        {mode === "currentAndNext" && next ? (
          <div
            className={panelClass(
              styles.panel,
              compact,
              "border-white/15 py-3 opacity-70 shadow-md",
            )}
          >
            <p className={`${styles.label} opacity-75`}>Next</p>
            <p className={`mt-0.5 ${nextTitleClass}`}>
              {currentIndex + 2}. {next.title}
            </p>
            <p className={`mt-0 ${nextSubClass}`}>{songSubLine(next)}</p>
          </div>
        ) : null}
        {showPast ? pastSongsPanel() : null}
      </div>
    </div>
  );
}
