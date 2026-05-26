"use client";

import type { CSSProperties, ReactNode } from "react";
import OverlayNowTitleMarquee from "@/components/OverlayNowTitleMarquee";
import { formatDuration } from "@/lib/setlist-engine";
import {
  isCustomOverlaySetlistColor,
  OVERLAY_CONTENT_INSET_CLASS,
  overlayLayoutStyle,
  resolveOverlaySetlistTextColor,
} from "@/lib/overlay-colors";
import {
  getOverlayThemeDefinition,
  overlayMode,
  overlayTheme,
  overlayVisible,
  resolveOverlaySongs,
} from "@/lib/overlay";
import type { Setlist, Song } from "@/types/setlist";

type Props = {
  setlist: Setlist;
  songs: Song[];
  compact?: boolean;
};

export default function OverlayDisplay({ setlist, songs, compact = false }: Props) {
  if (!overlayVisible(setlist)) return null;

  const mode = overlayMode(setlist);
  const themeId = overlayTheme(setlist);
  const theme = getOverlayThemeDefinition(themeId);
  const { classNames: styles, nowBlockClass, rootClass } = theme;
  const layoutStyle = overlayLayoutStyle(setlist);
  const setlistColor = resolveOverlaySetlistTextColor(setlist);
  const setlistUsesCustomColor = isCustomOverlaySetlistColor(setlist);
  const setlistColorStyle = setlistUsesCustomColor ? { color: setlistColor } : undefined;
  const setlistLabelClass = setlistUsesCustomColor
    ? themeId === "cute" || themeId === "komoru"
      ? "text-xs font-bold"
      : "text-xs font-bold uppercase tracking-wide"
    : styles.setlistLabel;
  const setlistLineClass = setlistUsesCustomColor
    ? "text-xs font-bold leading-snug"
    : styles.setlistLine;

  const { ordered, past, current, next, currentIndex } = resolveOverlaySongs(setlist, songs);
  const showDuration = !setlist.hideDuration;

  const rootPadding = compact
    ? OVERLAY_CONTENT_INSET_CLASS.compact
    : OVERLAY_CONTENT_INSET_CLASS.default;
  const blockGap = compact ? "gap-3" : "gap-4";
  const sectionTopPad = compact ? "pt-2" : "pt-3";
  const sectionDividerClass = `border-t ${sectionTopPad} ${styles.sectionBorder}`;

  function frame(children: ReactNode, extraStyle?: CSSProperties) {
    return (
      <div
        className={`min-w-0 ${rootPadding} ${rootClass}`}
        style={{ ...layoutStyle, ...extraStyle }}
      >
        {children}
      </div>
    );
  }

  function songSubLine(song: (typeof ordered)[number]) {
    return (
      <>
        {song.artist}
        {showDuration ? `（${formatDuration(song.durationSec)}）` : ""}
      </>
    );
  }

  function pastSongsBlock() {
    if (past.length === 0) return null;
    return (
      <div
        className={`min-w-0 opacity-55 ${sectionDividerClass}`}
        style={
          setlistUsesCustomColor
            ? { ...setlistColorStyle, borderColor: `${setlistColor}73` }
            : setlistColorStyle
        }
      >
        <p className={setlistLabelClass}>SETLIST</p>
        <ul className="mt-1 space-y-0.5">
          {past.map((song) => {
            const indexInSetlist = ordered.findIndex((item) => item.id === song.id);
            return (
              <li key={song.id} className={setlistLineClass}>
                {indexInSetlist + 1}. {song.title} / {song.artist}
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  if (ordered.length === 0) {
    return frame(<p className={styles.sub}>セトリが空です</p>);
  }

  if (mode === "fullSetlist") {
    const fullTitleClass = setlistUsesCustomColor
      ? compact
        ? "text-lg font-black leading-snug break-words"
        : "text-2xl font-black leading-tight"
      : compact
        ? styles.fullSetlistTitleCompact
        : styles.fullSetlistTitle;
    const fullSubClass = setlistUsesCustomColor
      ? "text-base font-bold leading-snug"
      : styles.fullSetlistSub;

    return frame(
      <div style={setlistColorStyle}>
        <p className={setlistLabelClass}>{setlist.name}</p>
        <ol className="mt-3 grid gap-1.5">
          {ordered.map((song, index) => {
            const isCurrent = index === currentIndex;
            const isPast = currentIndex >= 0 && index < currentIndex;
            return (
              <li key={song.id} className={isPast ? "opacity-55" : isCurrent ? "" : "opacity-90"}>
                <p
                  className={
                    isCurrent ? `${fullTitleClass} ${styles.fullSetlistCurrent}` : fullTitleClass
                  }
                >
                  {String(index + 1).padStart(2, "0")} {song.title}
                </p>
                <p className={fullSubClass}>
                  {song.artist}
                  {showDuration ? `（${formatDuration(song.durationSec)}）` : ""}
                </p>
              </li>
            );
          })}
        </ol>
      </div>,
    );
  }

  if (!current) {
    return frame(
      <>
        <p className={styles.label}>Setory</p>
        <p className={`mt-2 ${styles.sub}`}>セトリ作成で「現在の曲にする」を選んでください</p>
      </>,
    );
  }

  const showPast = mode === "current" || mode === "currentAndNext";
  const nowTitleClass = compact ? styles.nowTitleCompact : styles.nowTitle;
  const nowSubClass = compact ? styles.nowSubCompact : styles.nowSub;
  const nextTitleClass = compact ? styles.nextTitleCompact : styles.nextTitle;
  const nextSubClass = compact ? styles.nextSubCompact : styles.nextSub;
  const nextBlockClass = themeId === "minimal" ? "opacity-65" : "opacity-70";

  return frame(
    <div className={`grid max-w-full min-w-0 ${blockGap}`}>
      <div className={`min-w-0 ${nowBlockClass}`}>
        <p className={`overlay-now-label ${styles.label}`}>Now Singing</p>
        <OverlayNowTitleMarquee
          songId={current.id}
          line={`${currentIndex + 1}. ${current.title}`}
          className={nowTitleClass}
        />
        <p className={`mt-1 ${nowSubClass}`}>{songSubLine(current)}</p>
      </div>
      {mode === "currentAndNext" && next ? (
        <div className={`min-w-0 ${sectionDividerClass} ${nextBlockClass}`}>
          <p className={styles.label}>Next</p>
          <p className={`mt-0.5 ${nextTitleClass}`}>
            {currentIndex + 2}. {next.title}
          </p>
          <p className={`mt-0 ${nextSubClass}`}>{songSubLine(next)}</p>
        </div>
      ) : null}
      {showPast ? pastSongsBlock() : null}
    </div>,
  );
}
