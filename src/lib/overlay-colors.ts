import { OVERLAY_THEME_COLORS } from "@/lib/overlay-theme";
import { overlayTheme } from "@/lib/overlay";
import type { OverlayTheme, Setlist } from "@/types/setlist";

export type OverlaySetlistPalettePreset = {
  id: string;
  label: string;
  color: string;
};

export const OVERLAY_SETLIST_PALETTE: OverlaySetlistPalettePreset[] = [
  { id: "white", label: "白", color: "#ffffff" },
  { id: "off-white", label: "オフホワイト", color: "#f8fafc" },
  { id: "cream", label: "クリーム", color: "#fef9c3" },
  { id: "yellow", label: "黄", color: "#fde047" },
  { id: "orange", label: "オレンジ", color: "#fdba74" },
  { id: "pink", label: "ピンク", color: "#fbcfe8" },
  { id: "sky", label: "水色", color: "#a5f3fc" },
  { id: "lavender", label: "ラベンダー", color: "#e9d5ff" },
  { id: "mint", label: "ミント", color: "#bbf7d0" },
  { id: "black", label: "黒", color: "#171717" },
];

const OVERLAY_TEXT_SIZE_CLASS =
  /^text-(?:xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl|\[[^\]]+\])$/;

/** テーマの Tailwind クラスから文字色だけ除き、サイズ・太さは残す */
export function overlayClassWithoutTextColor(className: string): string {
  return className
    .split(/\s+/)
    .filter((part) => {
      if (!part.startsWith("text-")) return true;
      return OVERLAY_TEXT_SIZE_CLASS.test(part);
    })
    .join(" ");
}

export function themeOverlayTextColor(theme: OverlayTheme): string {
  return OVERLAY_THEME_COLORS[theme].primary;
}

/** @deprecated themeOverlayTextColor を利用 */
export const themeSetlistTextColor = themeOverlayTextColor;

export function resolveOverlayTextColor(setlist: Setlist): string {
  const custom = normalizeHexColor(setlist.overlaySetlistColor);
  if (custom) return custom;
  return themeOverlayTextColor(overlayTheme(setlist));
}

/** @deprecated resolveOverlayTextColor を利用 */
export const resolveOverlaySetlistTextColor = resolveOverlayTextColor;

export function isCustomOverlayTextColor(setlist: Setlist): boolean {
  return Boolean(normalizeHexColor(setlist.overlaySetlistColor));
}

/** @deprecated isCustomOverlayTextColor を利用 */
export const isCustomOverlaySetlistColor = isCustomOverlayTextColor;

export const DEFAULT_OVERLAY_SETLIST_MAX_WIDTH_PX = 800;

export const OVERLAY_SETLIST_WIDTH_PRESETS: {
  id: string;
  label: string;
  widthPx?: number;
}[] = [
  { id: "full", label: "全幅", widthPx: undefined },
  { id: "800", label: "800", widthPx: 800 },
  { id: "1000", label: "1000", widthPx: 1000 },
  { id: "1200", label: "1200", widthPx: 1200 },
];

export const OVERLAY_SETLIST_WIDTH_SLIDER_MIN_PX = 240;
export const OVERLAY_SETLIST_WIDTH_SLIDER_STEP_PX = 10;
const SETLIST_WIDTH_MAX_PX = 1600;

function snapOverlayWidthToSliderStep(value: number): number {
  return (
    OVERLAY_SETLIST_WIDTH_SLIDER_MIN_PX +
    Math.round(
      (value - OVERLAY_SETLIST_WIDTH_SLIDER_MIN_PX) / OVERLAY_SETLIST_WIDTH_SLIDER_STEP_PX,
    ) *
      OVERLAY_SETLIST_WIDTH_SLIDER_STEP_PX
  );
}

export function overlaySetlistSliderMaxPx(backgroundMaxWidthPx?: number): number {
  const cap =
    backgroundMaxWidthPx === undefined
      ? SETLIST_WIDTH_MAX_PX
      : clampOverlaySetlistWidthPx(backgroundMaxWidthPx, backgroundMaxWidthPx);
  return (
    OVERLAY_SETLIST_WIDTH_SLIDER_MIN_PX +
    Math.floor((cap - OVERLAY_SETLIST_WIDTH_SLIDER_MIN_PX) / OVERLAY_SETLIST_WIDTH_SLIDER_STEP_PX) *
      OVERLAY_SETLIST_WIDTH_SLIDER_STEP_PX
  );
}

export function snapOverlaySetlistWidthForSlider(
  value: number,
  backgroundMaxWidthPx?: number,
): number {
  const max = overlaySetlistSliderMaxPx(backgroundMaxWidthPx);
  const clamped = Math.min(max, Math.max(OVERLAY_SETLIST_WIDTH_SLIDER_MIN_PX, Math.round(value)));
  const snapped = snapOverlayWidthToSliderStep(clamped);
  return Math.min(max, snapped);
}

export function clampOverlaySetlistWidthPx(value: number, capPx?: number): number {
  const cappedMax =
    capPx === undefined
      ? SETLIST_WIDTH_MAX_PX
      : Math.min(
          SETLIST_WIDTH_MAX_PX,
          Math.max(OVERLAY_SETLIST_WIDTH_SLIDER_MIN_PX, Math.round(capPx)),
        );
  return Math.min(cappedMax, Math.max(OVERLAY_SETLIST_WIDTH_SLIDER_MIN_PX, Math.round(value)));
}

export function resolveOverlaySetlistMaxWidthPx(setlist: Setlist): number | undefined {
  const value = setlist.overlaySetlistMaxWidthPx;
  if (value === undefined) return undefined;
  return clampOverlaySetlistWidthPx(value);
}

export function applyOverlaySetlistMaxWidthPx(
  setlist: Setlist,
  backgroundMaxWidthPx?: number,
): number | undefined {
  const configured = resolveOverlaySetlistMaxWidthPx(setlist);
  if (configured === undefined) return undefined;
  if (backgroundMaxWidthPx === undefined) return configured;
  return Math.min(configured, overlaySetlistSliderMaxPx(backgroundMaxWidthPx));
}

export function isCustomOverlaySetlistWidth(setlist: Setlist): boolean {
  return setlist.overlaySetlistMaxWidthPx !== undefined;
}

export function overlayWidthPresetsForBackground(backgroundMaxWidthPx?: number) {
  if (backgroundMaxWidthPx === undefined) {
    return OVERLAY_SETLIST_WIDTH_PRESETS;
  }
  const cap = overlaySetlistSliderMaxPx(backgroundMaxWidthPx);
  return OVERLAY_SETLIST_WIDTH_PRESETS.filter(
    (preset) => preset.widthPx === undefined || preset.widthPx <= cap,
  );
}

export function overlaySetlistWidthLabelPx(
  setlist: Setlist,
  backgroundMaxWidthPx?: number,
): number | undefined {
  const configured = resolveOverlaySetlistMaxWidthPx(setlist);
  if (configured === undefined) return undefined;
  if (backgroundMaxWidthPx === undefined) return configured;
  return snapOverlaySetlistWidthForSlider(
    applyOverlaySetlistMaxWidthPx(setlist, backgroundMaxWidthPx)!,
    backgroundMaxWidthPx,
  );
}

export function overlaySetlistLayoutStyle(
  setlist: Setlist,
  backgroundMaxWidthPx?: number,
): { maxWidth?: string; width: string } {
  const maxWidthPx = applyOverlaySetlistMaxWidthPx(setlist, backgroundMaxWidthPx);
  return {
    width: "100%",
    maxWidth: maxWidthPx === undefined ? undefined : `${maxWidthPx}px`,
  };
}

export const overlayLayoutStyle = overlaySetlistLayoutStyle;

export const OVERLAY_CONTENT_INSET_CLASS = {
  default: "px-6 py-5",
  compact: "px-5 py-4",
} as const;

export function normalizeHexColor(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(trimmed)) return undefined;
  if (trimmed.length === 4) {
    const [, r, g, b] = trimmed;
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }
  return trimmed.toLowerCase();
}
