import { describe, expect, it } from "vitest";
import {
  applyOverlaySetlistMaxWidthPx,
  clampOverlaySetlistWidthPx,
  DEFAULT_OVERLAY_SETLIST_MAX_WIDTH_PX,
  isCustomOverlaySetlistColor,
  isCustomOverlaySetlistWidth,
  normalizeHexColor,
  OVERLAY_SETLIST_PALETTE,
  OVERLAY_SETLIST_WIDTH_PRESETS,
  OVERLAY_SETLIST_WIDTH_SLIDER_MIN_PX,
  OVERLAY_SETLIST_WIDTH_SLIDER_STEP_PX,
  overlayLayoutStyle,
  overlaySetlistLayoutStyle,
  overlaySetlistSliderMaxPx,
  overlaySetlistWidthLabelPx,
  overlayWidthPresetsForBackground,
  resolveOverlaySetlistMaxWidthPx,
  overlayClassWithoutTextColor,
  resolveOverlayTextColor,
  snapOverlaySetlistWidthForSlider,
  themeOverlayTextColor,
} from "@/lib/overlay-colors";
import type { OverlayTheme, Setlist } from "@/types/setlist";

const baseSetlist: Setlist = {
  id: "set-1",
  name: "テスト",
  songIds: [],
  overlayTheme: "simple",
  createdAt: "2026-05-27T00:00:00.000Z",
  updatedAt: "2026-05-27T00:00:00.000Z",
};

describe("normalizeHexColor", () => {
  it("normalizes 3-digit hex to lowercase 6-digit", () => {
    expect(normalizeHexColor("#FFF")).toBe("#ffffff");
    expect(normalizeHexColor("#abc")).toBe("#aabbcc");
  });

  it("accepts 6-digit hex", () => {
    expect(normalizeHexColor("#5B21B6")).toBe("#5b21b6");
  });

  it("rejects invalid values", () => {
    expect(normalizeHexColor(undefined)).toBeUndefined();
    expect(normalizeHexColor("")).toBeUndefined();
    expect(normalizeHexColor("white")).toBeUndefined();
    expect(normalizeHexColor("#gggggg")).toBeUndefined();
    expect(normalizeHexColor("5b21b6")).toBeUndefined();
  });
});

describe("resolveOverlayTextColor", () => {
  it("uses theme primary color when custom is unset", () => {
    expect(resolveOverlayTextColor(baseSetlist)).toBe("#2e1065");
    expect(isCustomOverlaySetlistColor(baseSetlist)).toBe(false);
  });

  it("uses custom color when set", () => {
    const setlist = { ...baseSetlist, overlaySetlistColor: "#ffffff" };
    expect(resolveOverlayTextColor(setlist)).toBe("#ffffff");
    expect(isCustomOverlaySetlistColor(setlist)).toBe(true);
  });

  it.each([
    ["dark", "#ffffff"],
    ["komoru", "#ffffff"],
    ["cute", "#831843"],
  ] as const)("uses %s theme primary color", (theme, expected) => {
    expect(themeOverlayTextColor(theme)).toBe(expected);
    expect(resolveOverlayTextColor({ ...baseSetlist, overlayTheme: theme })).toBe(
      expected,
    );
  });
});

describe("overlayClassWithoutTextColor", () => {
  it("removes color utilities but keeps size", () => {
    expect(
      overlayClassWithoutTextColor(
        "text-3xl font-black text-violet-950 drop-shadow-sm",
      ),
    ).toBe("text-3xl font-black drop-shadow-sm");
  });
});

describe("OVERLAY_SETLIST_PALETTE", () => {
  it("provides distinct preset colors", () => {
    const colors = new Set(OVERLAY_SETLIST_PALETTE.map((item) => item.color));
    expect(OVERLAY_SETLIST_PALETTE.length).toBeGreaterThan(5);
    expect(colors.size).toBe(OVERLAY_SETLIST_PALETTE.length);
  });
});

describe("clampOverlaySetlistWidthPx", () => {
  it("clamps below minimum to 240", () => {
    expect(clampOverlaySetlistWidthPx(100)).toBe(240);
    expect(clampOverlaySetlistWidthPx(0)).toBe(240);
  });

  it("clamps above maximum to 1600", () => {
    expect(clampOverlaySetlistWidthPx(2000)).toBe(1600);
  });

  it("respects optional cap", () => {
    expect(clampOverlaySetlistWidthPx(900, 640)).toBe(640);
    expect(clampOverlaySetlistWidthPx(500, 640)).toBe(500);
  });

  it("rounds fractional input", () => {
    expect(clampOverlaySetlistWidthPx(800.6)).toBe(801);
  });
});

describe("overlaySetlistSliderMaxPx", () => {
  it("uses absolute max when background is unknown", () => {
    expect(overlaySetlistSliderMaxPx()).toBe(1600);
  });

  it("snaps background cap down to step grid", () => {
    expect(overlaySetlistSliderMaxPx(647)).toBe(640);
    expect(overlaySetlistSliderMaxPx(660)).toBe(660);
    expect(overlaySetlistSliderMaxPx(655)).toBe(650);
  });

  it("never goes below slider minimum", () => {
    expect(overlaySetlistSliderMaxPx(100)).toBe(240);
  });
});

describe("snapOverlaySetlistWidthForSlider", () => {
  it("snaps to 10px steps within range", () => {
    expect(snapOverlaySetlistWidthForSlider(245)).toBe(250);
    expect(snapOverlaySetlistWidthForSlider(244)).toBe(240);
  });

  it("does not exceed slider max for background", () => {
    expect(snapOverlaySetlistWidthForSlider(900, 640)).toBe(640);
  });
});

describe("resolveOverlaySetlistMaxWidthPx", () => {
  it("returns undefined for full width", () => {
    expect(resolveOverlaySetlistMaxWidthPx(baseSetlist)).toBeUndefined();
    expect(isCustomOverlaySetlistWidth(baseSetlist)).toBe(false);
  });

  it("clamps configured width", () => {
    const setlist = { ...baseSetlist, overlaySetlistMaxWidthPx: 800 };
    expect(resolveOverlaySetlistMaxWidthPx(setlist)).toBe(800);
    expect(isCustomOverlaySetlistWidth(setlist)).toBe(true);
  });
});

describe("applyOverlaySetlistMaxWidthPx and layout style", () => {
  it("returns full width layout when unset", () => {
    expect(overlaySetlistLayoutStyle(baseSetlist)).toEqual({ width: "100%" });
    expect(overlayLayoutStyle(baseSetlist)).toEqual({ width: "100%" });
  });

  it("applies maxWidth in px for OBS", () => {
    const setlist = { ...baseSetlist, overlaySetlistMaxWidthPx: 800 };
    expect(overlaySetlistLayoutStyle(setlist)).toEqual({
      width: "100%",
      maxWidth: "800px",
    });
  });

  it("caps configured width to preview background", () => {
    const setlist = { ...baseSetlist, overlaySetlistMaxWidthPx: 1200 };
    expect(applyOverlaySetlistMaxWidthPx(setlist, 647)).toBe(640);
    expect(overlaySetlistLayoutStyle(setlist, 647)).toEqual({
      width: "100%",
      maxWidth: "640px",
    });
  });

  it("leaves configured width when preview is wider", () => {
    const setlist = { ...baseSetlist, overlaySetlistMaxWidthPx: 800 };
    expect(applyOverlaySetlistMaxWidthPx(setlist, 1000)).toBe(800);
  });
});

describe("overlaySetlistWidthLabelPx", () => {
  it("returns undefined when width is full", () => {
    expect(overlaySetlistWidthLabelPx(baseSetlist, 640)).toBeUndefined();
  });

  it("returns capped display value for UI", () => {
    const setlist = { ...baseSetlist, overlaySetlistMaxWidthPx: 1200 };
    expect(overlaySetlistWidthLabelPx(setlist, 647)).toBe(640);
    expect(overlaySetlistWidthLabelPx(setlist)).toBe(1200);
  });
});

describe("overlayWidthPresetsForBackground", () => {
  it("returns all presets without background cap", () => {
    expect(overlayWidthPresetsForBackground()).toEqual(OVERLAY_SETLIST_WIDTH_PRESETS);
  });

  it("filters presets above background width", () => {
    expect(overlayWidthPresetsForBackground(640).map((p) => p.id)).toEqual(["full"]);
    expect(overlayWidthPresetsForBackground(1000).map((p) => p.id)).toEqual([
      "full",
      "800",
      "1000",
    ]);
  });

  it("always includes full width preset", () => {
    for (const width of [240, 640, 1600]) {
      const presets = overlayWidthPresetsForBackground(width);
      expect(presets.some((p) => p.widthPx === undefined)).toBe(true);
    }
  });
});

describe("constants", () => {
  it("uses expected defaults for slider UI", () => {
    expect(DEFAULT_OVERLAY_SETLIST_MAX_WIDTH_PX).toBe(800);
    expect(OVERLAY_SETLIST_WIDTH_SLIDER_MIN_PX).toBe(240);
    expect(OVERLAY_SETLIST_WIDTH_SLIDER_STEP_PX).toBe(10);
  });
});
