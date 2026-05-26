"use client";

import { useState } from "react";
import RowActionButton from "@/components/RowActionButton";
import {
  DEFAULT_OVERLAY_SETLIST_MAX_WIDTH_PX,
  isCustomOverlayTextColor,
  isCustomOverlaySetlistWidth,
  normalizeHexColor,
  OVERLAY_SETLIST_PALETTE,
  OVERLAY_SETLIST_WIDTH_SLIDER_MIN_PX,
  OVERLAY_SETLIST_WIDTH_SLIDER_STEP_PX,
  overlaySetlistSliderMaxPx,
  overlaySetlistWidthLabelPx,
  overlayWidthPresetsForBackground,
  resolveOverlaySetlistMaxWidthPx,
  resolveOverlayTextColor,
  snapOverlaySetlistWidthForSlider,
  themeOverlayTextColor,
} from "@/lib/overlay-colors";
import { overlayTheme } from "@/lib/overlay";
import type { Setlist } from "@/types/setlist";

type Props = {
  setlist: Setlist;
  previewBackgroundMaxWidthPx?: number;
  onColorChange: (color: string | undefined) => void;
  onWidthChange: (widthPx: number | undefined) => void;
};

export default function OverlaySetlistColorPicker({
  setlist,
  previewBackgroundMaxWidthPx,
  onColorChange,
  onWidthChange,
}: Props) {
  const theme = overlayTheme(setlist);
  const themeColor = themeOverlayTextColor(theme);
  const activeColor = resolveOverlayTextColor(setlist);
  const custom = isCustomOverlayTextColor(setlist);
  const pickerValue = custom ? activeColor : themeColor;

  const widthCustom = isCustomOverlaySetlistWidth(setlist);
  const displayWidthPx = overlaySetlistWidthLabelPx(setlist, previewBackgroundMaxWidthPx);
  const sliderMaxPx = overlaySetlistSliderMaxPx(previewBackgroundMaxWidthPx);
  const sliderValue = snapOverlaySetlistWidthForSlider(
    widthCustom
      ? (displayWidthPx ?? resolveOverlaySetlistMaxWidthPx(setlist)!)
      : Math.min(DEFAULT_OVERLAY_SETLIST_MAX_WIDTH_PX, sliderMaxPx),
    previewBackgroundMaxWidthPx,
  );
  const widthPresets = overlayWidthPresetsForBackground(previewBackgroundMaxWidthPx);
  const [widthDraft, setWidthDraft] = useState<string | null>(null);

  function commitWidthInput(raw: string) {
    setWidthDraft(null);
    const trimmed = raw.trim();
    if (!trimmed) {
      onWidthChange(undefined);
      return;
    }
    const parsed = Number(trimmed);
    if (!Number.isFinite(parsed)) return;
    onWidthChange(snapOverlaySetlistWidthForSlider(parsed, previewBackgroundMaxWidthPx));
  }

  function handleWidthNumberEdit(raw: string, nativeEvent: Event) {
    const inputType = nativeEvent instanceof InputEvent ? nativeEvent.inputType : "";

    if (inputType === "increment" || inputType === "decrement") {
      commitWidthInput(raw);
      return;
    }

    const isTextEdit =
      inputType === "insertText" ||
      inputType === "insertFromPaste" ||
      inputType === "insertFromDrop" ||
      inputType === "deleteContentBackward" ||
      inputType === "deleteContentForward" ||
      inputType === "deleteByCut" ||
      inputType === "deleteContent";

    if (isTextEdit) {
      setWidthDraft(raw);
      return;
    }

    const trimmed = raw.trim();
    if (!trimmed) {
      setWidthDraft(raw);
      return;
    }
    const parsed = Number(trimmed);
    if (!Number.isFinite(parsed)) {
      setWidthDraft(raw);
      return;
    }
    commitWidthInput(raw);
  }

  function selectThemeDefault() {
    onColorChange(undefined);
  }

  return (
    <div className="mt-4 grid gap-4">
      <fieldset>
        <legend className="text-sm font-semibold text-violet-900">オーバーレイの文字色</legend>
        <p className="mt-1 text-xs text-violet-600">
          NOW・NEXT・SETLIST など、オーバーレイ全体の文字色に反映されます。
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <RowActionButton
            type="button"
            title="見た目に合わせた既定の色"
            variant={!custom ? "accent" : "secondary"}
            aria-pressed={!custom}
            onClick={selectThemeDefault}
          >
            既定色
          </RowActionButton>
          {OVERLAY_SETLIST_PALETTE.map((preset) => {
            const selected = custom && activeColor === preset.color;
            return (
              <button
                key={preset.id}
                type="button"
                title={preset.label}
                onClick={() => onColorChange(preset.color)}
                className={`size-9 rounded-lg border-2 border-white shadow-sm transition hover:scale-105 ${
                  selected ? "ring-2 ring-violet-500 ring-offset-1" : "border-violet-200/80"
                }`}
                style={{ backgroundColor: preset.color }}
                aria-label={preset.label}
              />
            );
          })}
        </div>
        <label className="mt-3 flex flex-wrap items-center gap-3 text-sm font-semibold text-violet-900">
          <span>カスタム</span>
          <input
            type="color"
            value={pickerValue}
            onChange={(e) => {
              const next = normalizeHexColor(e.target.value);
              if (next) onColorChange(next);
            }}
            className="size-10 cursor-pointer rounded-lg border border-violet-200 bg-white p-0.5"
          />
          <input
            type="text"
            value={custom ? activeColor : ""}
            placeholder={themeColor}
            onChange={(e) => {
              const next = normalizeHexColor(
                e.target.value.startsWith("#") ? e.target.value : `#${e.target.value}`,
              );
              if (next) onColorChange(next);
            }}
            className="min-w-[6.5rem] flex-1 rounded-lg border border-violet-200 px-2 py-1.5 font-mono text-xs font-normal text-violet-800"
            spellCheck={false}
          />
          {custom ? (
            <RowActionButton type="button" variant="secondary" onClick={selectThemeDefault}>
              リセット
            </RowActionButton>
          ) : null}
        </label>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-semibold text-violet-900">オーバーレイの横幅</legend>
        <p className="mt-1 text-xs text-violet-600">
          NOW・NEXT・SETLIST
          とプレビュー背景ごと調整。ショートカットと数値は左のプレビュー幅を超えません。
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {widthPresets
            .filter((preset) => preset.widthPx === undefined)
            .map((preset) => (
              <RowActionButton
                key={preset.id}
                type="button"
                variant={!widthCustom ? "accent" : "secondary"}
                aria-pressed={!widthCustom}
                onClick={() => onWidthChange(preset.widthPx)}
              >
                {preset.label}
              </RowActionButton>
            ))}
          {widthCustom ? (
            <RowActionButton type="button" variant="secondary" onClick={() => onWidthChange(undefined)}>
              全幅に戻す
            </RowActionButton>
          ) : null}
          {widthPresets
            .filter((preset) => preset.widthPx !== undefined)
            .map((preset) => {
              const selected = widthCustom && displayWidthPx === preset.widthPx;
              return (
                <RowActionButton
                  key={preset.id}
                  type="button"
                  variant={selected ? "accent" : "secondary"}
                  aria-pressed={selected}
                  onClick={() => onWidthChange(preset.widthPx)}
                >
                  {`${preset.label}px`}
                </RowActionButton>
              );
            })}
        </div>
        <label className="mt-3 grid gap-2 text-sm font-semibold text-violet-900">
          <span className="flex flex-wrap items-center justify-between gap-2">
            <span>最大幅</span>
            <span className="flex items-center gap-1 font-normal">
              <input
                type="number"
                inputMode="numeric"
                min={OVERLAY_SETLIST_WIDTH_SLIDER_MIN_PX}
                max={sliderMaxPx}
                step={OVERLAY_SETLIST_WIDTH_SLIDER_STEP_PX}
                value={
                  widthDraft ??
                  (widthCustom && displayWidthPx !== undefined ? String(displayWidthPx) : "")
                }
                placeholder="全幅"
                onChange={(e) => handleWidthNumberEdit(e.target.value, e.nativeEvent)}
                onInput={(e) => handleWidthNumberEdit(e.currentTarget.value, e.nativeEvent)}
                onBlur={(e) => commitWidthInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") e.currentTarget.blur();
                }}
                className="w-[5.5rem] rounded-lg border border-violet-200 px-2 py-1 text-right text-sm font-bold text-violet-800 tabular-nums"
              />
              <span className="text-xs text-violet-600">px</span>
            </span>
          </span>
          <input
            type="range"
            min={OVERLAY_SETLIST_WIDTH_SLIDER_MIN_PX}
            max={sliderMaxPx}
            step={OVERLAY_SETLIST_WIDTH_SLIDER_STEP_PX}
            value={sliderValue}
            onChange={(e) => {
              setWidthDraft(null);
              onWidthChange(
                snapOverlaySetlistWidthForSlider(
                  Number(e.target.value),
                  previewBackgroundMaxWidthPx,
                ),
              );
            }}
            className="w-full accent-violet-600"
          />
        </label>
      </fieldset>
    </div>
  );
}
