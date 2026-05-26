"use client";

import type { CSSProperties, ReactNode } from "react";
import OverlayNowTitleMarquee from "@/components/OverlayNowTitleMarquee";
import { formatDuration, formatSetlistSongLine } from "@/lib/setlist-engine";
import {
  isCustomOverlayTextColor,
  OVERLAY_CONTENT_INSET_CLASS,
  overlayClassWithoutTextColor,
  overlayLayoutStyle,
  resolveOverlayTextColor,
} from "@/lib/overlay-colors";
import {
  getOverlayThemeDefinition,
  overlayLineDisplayOptions,
  overlayMode,
  overlayTheme,
  overlayVisible,
  resolveOverlaySongs,
} from "@/lib/overlay";
import { OVERLAY_SECTION_LABELS } from "@/lib/overlay-theme";
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
  const textColor = resolveOverlayTextColor(setlist);
  const usesCustomColor = isCustomOverlayTextColor(setlist);

  function tc(className: string): string {
    return usesCustomColor ? overlayClassWithoutTextColor(className) : className;
  }

  const sectionTopPad = compact ? "pt-2" : "pt-3";
  const sectionDividerClass = `border-t ${sectionTopPad} ${tc(styles.sectionBorder)}`;
  const sectionDividerStyle: CSSProperties | undefined = usesCustomColor
    ? { borderColor: `${textColor}73` }
    : undefined;

  const { ordered, past, current, next, currentIndex } = resolveOverlaySongs(setlist, songs);
  const lineOptions = overlayLineDisplayOptions(setlist);
  const showArtist = !lineOptions.hideArtist;
  const showDuration = !lineOptions.hideDuration;

  const rootPadding = compact
    ? OVERLAY_CONTENT_INSET_CLASS.compact
    : OVERLAY_CONTENT_INSET_CLASS.default;
  const blockGap = compact ? "gap-3" : "gap-4";

  function frame(children: ReactNode, extraStyle?: CSSProperties) {
    return (
      <div
        className={`min-w-0 ${rootPadding} ${rootClass}`}
        style={{
          ...layoutStyle,
          ...(usesCustomColor ? { color: textColor } : {}),
          ...extraStyle,
        }}
      >
        {children}
      </div>
    );
  }

  function songSubLine(song: (typeof ordered)[number]): string | null {
    if (!showArtist && !showDuration) return null;
    if (!showArtist) return formatDuration(song.durationSec);
    if (!showDuration) return song.artist;
    return `${song.artist}（${formatDuration(song.durationSec)}）`;
  }

  function pastSongsBlock() {
    if (past.length === 0) return null;
    return (
      <div className={`min-w-0 opacity-55 ${sectionDividerClass}`} style={sectionDividerStyle}>
        <p className={tc(styles.setlistLabel)}>{OVERLAY_SECTION_LABELS.setlist}</p>
        <ul className="mt-1 space-y-0.5">
          {past.map((song) => {
            const indexInSetlist = ordered.findIndex((item) => item.id === song.id);
            return (
              <li key={song.id} className={tc(styles.setlistLine)}>
                {formatSetlistSongLine(song, indexInSetlist, lineOptions)}
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  if (ordered.length === 0) {
    return frame(<p className={tc(styles.sub)}>セトリが空です</p>);
  }

  if (mode === "fullSetlist") {
    const fullTitleClass = compact ? styles.fullSetlistTitleCompact : styles.fullSetlistTitle;
    const fullSubClass = styles.fullSetlistSub;
    const currentMark = usesCustomColor
      ? "underline decoration-2 underline-offset-4 decoration-current"
      : styles.fullSetlistCurrent;

    return frame(
      <>
        <p className={tc(styles.setlistLabel)}>{setlist.name}</p>
        <ol className="mt-3 grid gap-1.5">
          {ordered.map((song, index) => {
            const isCurrent = index === currentIndex;
            const isPast = currentIndex >= 0 && index < currentIndex;
            const sub = songSubLine(song);
            return (
              <li
                key={song.id}
                className={isPast ? "opacity-55" : isCurrent ? "" : "opacity-90"}
              >
                <p
                  className={
                    isCurrent ? `${tc(fullTitleClass)} ${currentMark}` : tc(fullTitleClass)
                  }
                >
                  {String(index + 1).padStart(2, "0")} {song.title}
                </p>
                {sub ? <p className={tc(fullSubClass)}>{sub}</p> : null}
              </li>
            );
          })}
        </ol>
      </>,
    );
  }

  if (!current) {
    return frame(
      <>
        <p className={tc(styles.label)}>Setory</p>
        <p className={`mt-2 ${tc(styles.sub)}`}>セトリ作成で「現在の曲にする」を選んでください</p>
      </>,
    );
  }

  const showPast = mode === "current" || mode === "currentAndNext";
  const nowTitleClass = compact ? styles.nowTitleCompact : styles.nowTitle;
  const nowSubClass = compact ? styles.nowSubCompact : styles.nowSub;
  const nextTitleClass = compact ? styles.nextTitleCompact : styles.nextTitle;
  const nextSubClass = compact ? styles.nextSubCompact : styles.nextSub;
  const nextBlockClass = themeId === "minimal" ? "opacity-65" : "opacity-70";
  const currentSub = songSubLine(current);
  const nextSub = next ? songSubLine(next) : null;

  return frame(
    <div className={`grid max-w-full min-w-0 ${blockGap}`}>
      <div className={`min-w-0 ${nowBlockClass}`}>
        <p className={`overlay-now-label whitespace-nowrap ${tc(styles.label)}`}>
          {OVERLAY_SECTION_LABELS.now}
        </p>
        <OverlayNowTitleMarquee
          songId={current.id}
          line={`${currentIndex + 1}. ${current.title}`}
          className={tc(nowTitleClass)}
        />
        {currentSub ? <p className={`mt-1 ${tc(nowSubClass)}`}>{currentSub}</p> : null}
      </div>
      {mode === "currentAndNext" && next ? (
        <div
          className={`min-w-0 ${sectionDividerClass} ${nextBlockClass}`}
          style={sectionDividerStyle}
        >
          <p className={tc(styles.label)}>{OVERLAY_SECTION_LABELS.next}</p>
          <p className={`mt-0.5 ${tc(nextTitleClass)}`}>
            {currentIndex + 2}. {next.title}
          </p>
          {nextSub ? <p className={`mt-0 ${tc(nextSubClass)}`}>{nextSub}</p> : null}
        </div>
      ) : null}
      {showPast ? pastSongsBlock() : null}
    </div>,
  );
}
