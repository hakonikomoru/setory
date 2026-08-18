export type OverlayPreviewBackdrop = "green" | "white" | "black";

export const OVERLAY_PREVIEW_BACKDROP_OPTIONS: {
  value: OverlayPreviewBackdrop;
  label: string;
  bgClass: string;
  color: string;
  buttonClass: string;
}[] = [
  {
    value: "green",
    label: "グリーン",
    bgClass: "bg-[#00ff00]",
    color: "#00ff00",
    buttonClass:
      "bg-[#00ff00] text-neutral-900 shadow-sm ring-1 ring-[#00cc00] hover:bg-[#00e600] active:bg-[#00cc00]",
  },
  {
    value: "white",
    label: "白",
    bgClass: "bg-white",
    color: "#ffffff",
    buttonClass:
      "bg-white text-violet-950 shadow-sm ring-1 ring-violet-300 hover:bg-violet-50 active:bg-violet-100",
  },
  {
    value: "black",
    label: "黒",
    bgClass: "bg-black",
    color: "#000000",
    buttonClass:
      "bg-black text-white shadow-sm ring-1 ring-neutral-600 hover:bg-neutral-800 active:bg-neutral-900",
  },
];

export const DEFAULT_OVERLAY_PREVIEW_BACKDROP: OverlayPreviewBackdrop = "green";

export function isOverlayPreviewBackdrop(value: string): value is OverlayPreviewBackdrop {
  return OVERLAY_PREVIEW_BACKDROP_OPTIONS.some((item) => item.value === value);
}

export function getOverlayPreviewBackdropOption(value: OverlayPreviewBackdrop) {
  return (
    OVERLAY_PREVIEW_BACKDROP_OPTIONS.find((item) => item.value === value) ??
    OVERLAY_PREVIEW_BACKDROP_OPTIONS[0]
  );
}
