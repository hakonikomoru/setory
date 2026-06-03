import { describe, expect, it } from "vitest";
import { SAMPLE_SONGS } from "@/lib/sample-songs";
import {
  filterSongsByQuery,
  formatSetlistSongLine,
  formatSetlistText,
  parseSongDurationFields,
  parseTemplateSongLines,
  parseTemplateSongLinesWithSource,
  sortSongsByCreatedAt,
  sortSongsWithUnaddedSetlistFirst,
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

describe("sortSongsWithUnaddedSetlistFirst", () => {
  it("puts songs not in the setlist before added ones", () => {
    const songs = [
      { ...SAMPLE_SONGS[0], id: "a", createdAt: "2026-05-01T00:00:00.000Z" },
      { ...SAMPLE_SONGS[1], id: "b", createdAt: "2026-05-03T00:00:00.000Z" },
      { ...SAMPLE_SONGS[2], id: "c", createdAt: "2026-05-02T00:00:00.000Z" },
    ];
    expect(sortSongsWithUnaddedSetlistFirst(songs, ["b"], "desc").map((s) => s.id)).toEqual([
      "c",
      "a",
      "b",
    ]);
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

  it("omits artists when hideArtist is set", () => {
    const setlist: Setlist = {
      id: "set-3",
      name: "アーティストなし",
      songIds: [SAMPLE_SONGS[0].id],
      hideArtist: true,
      createdAt: "2026-05-27T00:00:00.000Z",
      updatedAt: "2026-05-27T00:00:00.000Z",
    };

    const text = formatSetlistText(setlist, SAMPLE_SONGS);
    expect(text).toContain("1. 夜に駆ける（");
    expect(text).not.toContain("YOASOBI");
    expect(text).toMatch(/^1\. 夜に駆ける（/m);
  });

  it("shows title only when hideArtist and hideDuration are set", () => {
    const setlist: Setlist = {
      id: "set-4",
      name: "曲名のみ",
      songIds: [SAMPLE_SONGS[0].id],
      hideArtist: true,
      hideDuration: true,
      createdAt: "2026-05-27T00:00:00.000Z",
      updatedAt: "2026-05-27T00:00:00.000Z",
    };

    const text = formatSetlistText(setlist, SAMPLE_SONGS);
    expect(text).toContain("1. 夜に駆ける");
    expect(text).not.toContain("YOASOBI");
    expect(text).not.toMatch(/1\. 夜に駆ける（/);
  });
});

describe("parseSongDurationFields", () => {
  it("returns 0 when both minutes and seconds are 0", () => {
    expect(parseSongDurationFields("0", "0")).toBe(0);
    expect(parseSongDurationFields("", "")).toBe(0);
  });

  it("computes duration when either part is non-zero", () => {
    expect(parseSongDurationFields("4", "0")).toBe(240);
    expect(parseSongDurationFields("0", "30")).toBe(30);
  });
});

describe("parseTemplateSongLines", () => {
  it("parses title and artist separated by slash", () => {
    expect(parseTemplateSongLines("夜に駆ける / YOASOBI")).toEqual([
      { title: "夜に駆ける", artist: "YOASOBI" },
    ]);
    expect(parseTemplateSongLines("曲名／アーティスト")).toEqual([
      { title: "曲名", artist: "アーティスト" },
    ]);
  });

  it("parses title-only lines without artist", () => {
    expect(parseTemplateSongLines("secret base\n\nメルト")).toEqual([
      { title: "secret base", artist: "" },
      { title: "メルト", artist: "" },
    ]);
  });

  it("parses multiple lines and ignores empty lines", () => {
    const lines = parseTemplateSongLines("A / B\nC\n\nD / E");
    expect(lines).toHaveLength(3);
    expect(lines[2]).toEqual({ title: "D", artist: "E" });
  });
});

describe("parseTemplateSongLinesWithSource", () => {
  it("includes 1-based source line numbers", () => {
    expect(parseTemplateSongLinesWithSource("A / B\n\nC / D")).toEqual([
      { title: "A", artist: "B", sourceLine: 1 },
      { title: "C", artist: "D", sourceLine: 3 },
    ]);
  });
});

describe("formatSetlistSongLine without artist", () => {
  it("omits slash when artist is empty", () => {
    const song = { ...SAMPLE_SONGS[0], artist: "" };
    expect(formatSetlistSongLine(song, 0, {})).toBe("1. 夜に駆ける（4:18）");
    expect(formatSetlistSongLine(song, 0, { hideDuration: true })).toBe("1. 夜に駆ける");
  });

  it("omits duration label when duration is unset", () => {
    const song = { ...SAMPLE_SONGS[0], durationSec: 0 };
    expect(formatSetlistSongLine(song, 0, {})).toBe("1. 夜に駆ける / YOASOBI");
    expect(formatSetlistSongLine({ ...song, artist: "" }, 0, {})).toBe("1. 夜に駆ける");
  });
});
