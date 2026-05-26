import { describe, expect, it } from "vitest";
import { SAMPLE_SONGS } from "@/lib/sample-songs";
import {
  filterSongsByQuery,
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

describe("filterSongsByQuery", () => {
  it("returns all songs when query is empty", () => {
    expect(filterSongsByQuery(SAMPLE_SONGS, "")).toEqual(SAMPLE_SONGS);
    expect(filterSongsByQuery(SAMPLE_SONGS, "   ")).toEqual(SAMPLE_SONGS);
  });

  it("filters by title and supports multiple tokens", () => {
    const byTitle = filterSongsByQuery(SAMPLE_SONGS, "夜に");
    expect(byTitle.some((song) => song.title.includes("夜に駆ける"))).toBe(true);

    const byArtistAndTag = filterSongsByQuery(SAMPLE_SONGS, "YOASOBI アニソン");
    expect(byArtistAndTag.length).toBeGreaterThan(0);
    expect(
      byArtistAndTag.every(
        (song) =>
          `${song.title} ${song.artist} ${song.tags.join(" ")}`
            .toLowerCase()
            .includes("yoasobi") &&
          `${song.title} ${song.artist} ${song.tags.join(" ")}`
            .toLowerCase()
            .includes("アニソン"),
      ),
    ).toBe(true);
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
    expect(text).toMatch(/4:1[38]/);
  });

  it("omits durations when hideDuration is set", () => {
    const setlist: Setlist = {
      id: "set-2",
      name: "尺なし",
      songIds: [SAMPLE_SONGS[0].id],
      hideDuration: true,
      createdAt: "2026-05-27T00:00:00.000Z",
      updatedAt: "2026-05-27T00:00:00.000Z",
    };

    const text = formatSetlistText(setlist, SAMPLE_SONGS);
    expect(text).toContain("1. 夜に駆ける / YOASOBI");
    expect(text).not.toContain("（");
    expect(text).toContain("合計: 1曲");
    expect(text).not.toMatch(/合計: 1曲 \//);
  });
});
