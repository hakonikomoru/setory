"use client";

import { useEffect, useState } from "react";
import OverlayDisplay from "@/components/OverlayDisplay";
import RowActionButton from "@/components/RowActionButton";
import { overlayLayoutStyle } from "@/lib/overlay-colors";
import { useElementWidth } from "@/lib/use-element-width";
import type { Setlist, Song } from "@/types/setlist";

export type OverlayPreviewBackdrop = "green" | "white" | "black";

const BACKDROPS: {
  value: OverlayPreviewBackdrop;
  label: string;
  bgClass: string;
}[] = [
  { value: "green", label: "グリーンバック", bgClass: "bg-[#00b140]" },
  { value: "white", label: "白", bgClass: "bg-white" },
  { value: "black", label: "黒", bgClass: "bg-black" },
];

type Props = {
  setlist: Setlist;
  songs: Song[];
  onPreviewBackgroundMaxWidthPx?: (widthPx: number) => void;
};

export default function OverlayPreviewFrame({
  setlist,
  songs,
  onPreviewBackgroundMaxWidthPx,
}: Props) {
  const [backdrop, setBackdrop] = useState<OverlayPreviewBackdrop>("green");
  const active = BACKDROPS.find((item) => item.value === backdrop) ?? BACKDROPS[0];
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
          {BACKDROPS.map((item) => (
            <RowActionButton
              key={item.value}
              type="button"
              variant={backdrop === item.value ? "accent" : "secondary"}
              aria-pressed={backdrop === item.value}
              onClick={() => setBackdrop(item.value)}
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
