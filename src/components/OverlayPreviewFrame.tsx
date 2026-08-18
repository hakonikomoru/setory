"use client";

import { useEffect } from "react";
import OverlayDisplay from "@/components/OverlayDisplay";
import RowActionButton from "@/components/RowActionButton";
import {
  DEFAULT_OVERLAY_PREVIEW_BACKDROP,
  getOverlayPreviewBackdropOption,
  OVERLAY_PREVIEW_BACKDROP_OPTIONS,
  type OverlayPreviewBackdrop,
} from "@/lib/overlay-preview-backdrop";
import { overlayLayoutStyle } from "@/lib/overlay-colors";
import { useElementWidth } from "@/lib/use-element-width";
import type { Setlist, Song } from "@/types/setlist";

function backdropButtonClass(
  item: (typeof OVERLAY_PREVIEW_BACKDROP_OPTIONS)[number],
  selected: boolean,
) {
  const selectedRing = selected ? "ring-2 ring-violet-600 ring-offset-2 ring-offset-white" : "";
  return `${item.buttonClass} ${selectedRing}`;
}

type Props = {
  setlist: Setlist;
  songs: Song[];
  backdrop?: OverlayPreviewBackdrop;
  onBackdropChange?: (backdrop: OverlayPreviewBackdrop) => void;
  onPreviewBackgroundMaxWidthPx?: (widthPx: number) => void;
};

export default function OverlayPreviewFrame({
  setlist,
  songs,
  backdrop: backdropProp,
  onBackdropChange,
  onPreviewBackgroundMaxWidthPx,
}: Props) {
  const backdrop = backdropProp ?? DEFAULT_OVERLAY_PREVIEW_BACKDROP;
  const active = getOverlayPreviewBackdropOption(backdrop);
  const { ref: measureRef, widthPx: backgroundMaxWidthPx } = useElementWidth<HTMLDivElement>();
  const layoutStyle = overlayLayoutStyle(setlist, backgroundMaxWidthPx);

  useEffect(() => {
    if (backgroundMaxWidthPx === undefined) return;
    onPreviewBackgroundMaxWidthPx?.(backgroundMaxWidthPx);
  }, [backgroundMaxWidthPx, onPreviewBackgroundMaxWidthPx]);

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col gap-2">
      <div className="shrink-0">
        <h2 className="text-lg font-bold text-violet-950">プレビュー背景</h2>
        <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="プレビュー背景">
          {OVERLAY_PREVIEW_BACKDROP_OPTIONS.map((item) => (
            <RowActionButton
              key={item.value}
              type="button"
              variant="surface"
              className={backdropButtonClass(item, backdrop === item.value)}
              aria-pressed={backdrop === item.value}
              onClick={() => onBackdropChange?.(item.value)}
            >
              {item.label}
            </RowActionButton>
          ))}
        </div>
      </div>
      <div ref={measureRef} className="flex min-h-[20rem] min-w-0 flex-1 flex-col xl:min-h-0">
        <div
          className={`flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain border border-black ${active.bgClass}`}
          style={layoutStyle}
        >
          <OverlayDisplay setlist={setlist} songs={songs} compact />
        </div>
      </div>
    </div>
  );
}
