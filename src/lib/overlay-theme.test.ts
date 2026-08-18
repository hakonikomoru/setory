import { describe, expect, it } from "vitest";
import {
  getOverlayThemeDefinition,
  isOverlayTheme,
  OVERLAY_THEME_COLORS,
  OVERLAY_THEME_OPTIONS,
  OVERLAY_THEMES,
} from "@/lib/overlay-theme";
import type { OverlayTheme } from "@/types/setlist";

const ALL_THEMES: OverlayTheme[] = [
  "simple",
  "minimal",
  "bold",
  "cute",
  "dark",
  "komoru",
  "pulse",
  "shimmer",
  "aurora",
  "signal",
];

describe("isOverlayTheme", () => {
  it.each(ALL_THEMES)("accepts %s", (theme) => {
    expect(isOverlayTheme(theme)).toBe(true);
  });

  it("rejects unknown values", () => {
    expect(isOverlayTheme("invalid")).toBe(false);
    expect(isOverlayTheme("")).toBe(false);
    expect(isOverlayTheme("シンプル")).toBe(false);
  });
});

describe("OVERLAY_THEME_OPTIONS", () => {
  it("lists every theme once with label and description", () => {
    expect(OVERLAY_THEME_OPTIONS).toHaveLength(ALL_THEMES.length);
    for (const theme of ALL_THEMES) {
      const option = OVERLAY_THEME_OPTIONS.find((item) => item.value === theme);
      expect(option).toBeDefined();
      expect(option!.label.length).toBeGreaterThan(0);
      expect(option!.description.length).toBeGreaterThan(0);
    }
  });
});

describe("OVERLAY_THEMES", () => {
  it.each(ALL_THEMES)("defines class names for %s", (theme) => {
    const def = OVERLAY_THEMES[theme];
    expect(def.id).toBe(theme);
    expect(def.rootClass).toMatch(/^overlay-theme-/);
    expect(def.classNames.nowTitle).toContain("font-");
    expect(def.classNames.nextTitle).toContain("font-");
    expect(def.classNames.setlistLine).toContain("font-");
    expect(def.classNames.sectionBorder).toContain("border-");
  });

  it("exposes colors aligned with OVERLAY_THEME_COLORS", () => {
    for (const theme of ALL_THEMES) {
      expect(OVERLAY_THEME_COLORS[theme]).toEqual(OVERLAY_THEMES[theme].colors);
    }
  });

  it("uses animated root classes for motion themes", () => {
    expect(OVERLAY_THEMES.komoru.rootClass).toBe("overlay-theme-komoru");
    expect(OVERLAY_THEMES.pulse.rootClass).toBe("overlay-theme-pulse");
    expect(OVERLAY_THEMES.shimmer.rootClass).toBe("overlay-theme-shimmer");
    expect(OVERLAY_THEMES.aurora.rootClass).toBe("overlay-theme-aurora");
    expect(OVERLAY_THEMES.signal.rootClass).toBe("overlay-theme-signal");
    expect(OVERLAY_THEMES.simple.rootClass).toBe("overlay-theme-simple");
  });

  it("marks animated theme options in the picker list", () => {
    const animated = OVERLAY_THEME_OPTIONS.filter((item) => item.label.includes("アニメ"));
    expect(animated.map((item) => item.value)).toEqual([
      "komoru",
      "pulse",
      "shimmer",
      "aurora",
      "signal",
    ]);
  });

  it("gives bold theme a left border on NOW block", () => {
    expect(OVERLAY_THEMES.bold.nowBlockClass).toContain("border-l");
    expect(OVERLAY_THEMES.simple.nowBlockClass).toBe("");
  });
});

describe("getOverlayThemeDefinition", () => {
  it("returns the requested theme", () => {
    expect(getOverlayThemeDefinition("minimal").label).toBe("コンパクト");
  });

  it("falls back to simple for invalid input at call site", () => {
    expect(getOverlayThemeDefinition("simple" as OverlayTheme).id).toBe("simple");
  });
});

describe("readable typography", () => {
  it("standard and compact use bold NOW titles", () => {
    expect(OVERLAY_THEMES.simple.classNames.nowTitle).toMatch(/font-black/);
    expect(OVERLAY_THEMES.minimal.classNames.nowTitle).toMatch(/font-bold/);
  });

  it("NEXT and SETLIST are smaller than NOW title classes", () => {
    for (const theme of ["simple", "minimal"] as const) {
      const { nowTitle, nextTitle, setlistLine } = OVERLAY_THEMES[theme].classNames;
      expect(nowTitle).toMatch(/text-(2xl|3xl|4xl)/);
      expect(nextTitle).toMatch(/text-(xs|sm|base)/);
      expect(setlistLine).toMatch(/text-(xs|sm)/);
    }
  });
});
