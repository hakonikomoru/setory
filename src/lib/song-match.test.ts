import { describe, expect, it } from "vitest";
import { isSongInLibrary } from "@/lib/song-match";
import type { Song } from "@/types/setlist";

const songs: Song[] = [
  {
    id: "1",
    title: "夜に駆ける",
    artist: "YOASOBI",
    durationSec: 258,
    mood: "mid",
    tags: [],
  },
];

describe("isSongInLibrary", () => {
  it("matches case-insensitively", () => {
    expect(isSongInLibrary(songs, "夜に駆ける", "yoasobi")).toBe(true);
    expect(isSongInLibrary(songs, "Lemon", "米津玄師")).toBe(false);
  });
});
