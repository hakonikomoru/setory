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
  buttonClass: string;
}[] = [
  {
    value: "green",
    label: "グリーン",
    bgClass: "bg-[#00b140]",
    buttonClass:
      "bg-[#00b140] text-white shadow-sm ring-1 ring-[#008830] hover:bg-[#00a038] active:bg-[#009030]",
  },
  {
    value: "white",
    label: "白",
    bgClass: "bg-white",
    buttonClass:
      "bg-white text-violet-950 shadow-sm ring-1 ring-violet-300 hover:bg-violet-50 active:bg-violet-100",
  },
  {
    value: "black",
    label: "黒",
    bgClass: "bg-black",
    buttonClass:
      "bg-black text-white shadow-sm ring-1 ring-neutral-600 hover:bg-neutral-800 active:bg-neutral-900",
  },
];

function backdropButtonClass(item: (typeof BACKDROPS)[number], selected: boolean) {
  const selectedRing = selected ? "ring-2 ring-violet-600 ring-offset-2 ring-offset-white" : "";
  return `${item.buttonClass} ${selectedRing}`;
}

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
              variant="surface"
              className={backdropButtonClass(item, backdrop === item.value)}
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
