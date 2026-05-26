import { describe, expect, it } from "vitest";
import { SAMPLE_SONGS } from "@/lib/sample-songs";
import {
  formatSetlistText,
  suggestSetlistSongs,
} from "@/lib/setlist-engine";
import type { Setlist } from "@/types/setlist";

describe("suggestSetlistSongs", () => {
  it("returns songs within a reasonable count for target duration", () => {
    const result = suggestSetlistSongs(SAMPLE_SONGS, {
      theme: "アニソン",
      targetMinutes: 20,
      preferredTags: ["アニソン"],
      moodFlow: "warmup-peak-cooldown",
    });

    expect(result.length).toBeGreaterThan(0);
    expect(result.length).toBeLessThanOrEqual(12);
    expect(result.some((song) => song.tags.includes("アニソン"))).toBe(true);
  });
});

describe("formatSetlistText", () => {
  it("formats numbered lines with total duration", () => {
    const setlist: Setlist = {
      id: "set-1",
      name: "テスト配信",
      songIds: [SAMPLE_SONGS[0].id, SAMPLE_SONGS[1].id],
      theme: "定番枠",
      createdAt: "2026-05-27T00:00:00.000Z",
      updatedAt: "2026-05-27T00:00:00.000Z",
    };

    const text = formatSetlistText(setlist, SAMPLE_SONGS);
    expect(text).toContain("【テスト配信】");
    expect(text).toContain("1. 夜に駆ける");
    expect(text).toContain("合計: 2曲");
  });
});
