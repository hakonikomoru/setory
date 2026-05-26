import { describe, expect, it } from "vitest";
import { SAMPLE_SONGS } from "@/lib/sample-songs";
import {
  filterSongsByQuery,
  formatMoodInput,
  formatSetlistText,
  parseMoodInput,
  sortSongsByCreatedAt,
} from "@/lib/setlist-engine";
import type { Setlist } from "@/types/setlist";

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
          `${song.title} ${song.artist} ${song.tags.join(" ")}`.toLowerCase().includes("yoasobi") &&
          `${song.title} ${song.artist} ${song.tags.join(" ")}`.toLowerCase().includes("アニソン"),
      ),
    ).toBe(true);
  });
});

describe("sortSongsByCreatedAt", () => {
  it("sorts by registration time ascending or descending", () => {
    const songs = [
      { ...SAMPLE_SONGS[0], id: "a", createdAt: "2026-05-01T00:00:00.000Z" },
      { ...SAMPLE_SONGS[1], id: "b", createdAt: "2026-05-03T00:00:00.000Z" },
      { ...SAMPLE_SONGS[2], id: "c", createdAt: "2026-05-02T00:00:00.000Z" },
    ];
    expect(sortSongsByCreatedAt(songs, "asc").map((s) => s.id)).toEqual(["a", "c", "b"]);
    expect(sortSongsByCreatedAt(songs, "desc").map((s) => s.id)).toEqual(["b", "c", "a"]);
  });
});

describe("parseMoodInput", () => {
  it("maps Japanese labels and defaults empty to mid", () => {
    expect(parseMoodInput("")).toBe("mid");
    expect(parseMoodInput("盛り上がり")).toBe("upbeat");
    expect(parseMoodInput("バラード")).toBe("ballad");
    expect(parseMoodInput("中間")).toBe("mid");
  });

  it("round-trips known moods for the form", () => {
    expect(formatMoodInput(parseMoodInput("盛り上がり"))).toBe("盛り上がり");
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
