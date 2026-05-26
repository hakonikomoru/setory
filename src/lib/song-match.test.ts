import { describe, expect, it } from "vitest";
import { isSongInLibrary, isSongInSetlist } from "@/lib/song-match";
import type { Song } from "@/types/setlist";

const songs: Song[] = [
  {
    id: "1",
    title: "夜に駆ける",
    artist: "YOASOBI",
    durationSec: 258,
    mood: "mid",
    tags: [],
    createdAt: "2026-05-27T00:00:00.000Z",
  },
];

describe("isSongInLibrary", () => {
  it("matches case-insensitively", () => {
    expect(isSongInLibrary(songs, "夜に駆ける", "yoasobi")).toBe(true);
    expect(isSongInLibrary(songs, "Lemon", "米津玄師")).toBe(false);
  });
});

describe("isSongInSetlist", () => {
  it("is true when library song is in setlist ids", () => {
    expect(isSongInSetlist(songs, ["1"], "夜に駆ける", "YOASOBI")).toBe(true);
    expect(isSongInSetlist(songs, [], "夜に駆ける", "YOASOBI")).toBe(false);
  });
});
