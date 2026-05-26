import { describe, expect, it } from "vitest";
import { SAMPLE_SONGS } from "@/lib/sample-songs";
import {
  advanceCurrentSongId,
  canNavigateOverlayPrev,
  navigateOverlayNext,
  navigateOverlayPrev,
  resolveOverlaySongs,
  rewindCurrentSongId,
} from "@/lib/overlay";
import type { Setlist } from "@/types/setlist";

const baseSetlist: Setlist = {
  id: "set-1",
  name: "テスト",
  songIds: [SAMPLE_SONGS[0].id, SAMPLE_SONGS[1].id, SAMPLE_SONGS[2].id],
  currentSongId: SAMPLE_SONGS[1].id,
  createdAt: "2026-05-27T00:00:00.000Z",
  updatedAt: "2026-05-27T00:00:00.000Z",
};

describe("resolveOverlaySongs", () => {
  it("resolves current and next songs by id", () => {
    const { past, current, next, upcoming, currentIndex } = resolveOverlaySongs(
      baseSetlist,
      SAMPLE_SONGS,
    );
    expect(currentIndex).toBe(1);
    expect(past).toHaveLength(1);
    expect(past[0]?.title).toBe("夜に駆ける");
    expect(current?.title).toBe("残酷な天使のテーゼ");
    expect(next?.title).toBe("ドライフラワー");
    expect(upcoming).toHaveLength(1);
    expect(upcoming[0]?.title).toBe("ドライフラワー");
  });

  it("returns empty current when id is missing", () => {
    const { current, currentIndex } = resolveOverlaySongs(
      { ...baseSetlist, currentSongId: undefined },
      SAMPLE_SONGS,
    );
    expect(currentIndex).toBe(-1);
    expect(current).toBeUndefined();
  });

  it("hides next on the first song by default", () => {
    const { next, currentIndex } = resolveOverlaySongs(
      { ...baseSetlist, currentSongId: SAMPLE_SONGS[0].id },
      SAMPLE_SONGS,
    );
    expect(currentIndex).toBe(0);
    expect(next).toBeUndefined();
  });

  it("shows next on the first song when overlaySuppressNext is false", () => {
    const { next } = resolveOverlaySongs(
      {
        ...baseSetlist,
        currentSongId: SAMPLE_SONGS[0].id,
        overlaySuppressNext: false,
      },
      SAMPLE_SONGS,
    );
    expect(next?.title).toBe("残酷な天使のテーゼ");
  });
});

describe("advanceCurrentSongId", () => {
  it("moves to next song in order", () => {
    expect(advanceCurrentSongId(baseSetlist, SAMPLE_SONGS)).toBe(
      SAMPLE_SONGS[2].id,
    );
  });

  it("starts on the first song without showing next", () => {
    expect(
      navigateOverlayNext(
        { ...baseSetlist, currentSongId: undefined },
        SAMPLE_SONGS,
      ),
    ).toEqual({
      currentSongId: SAMPLE_SONGS[0].id,
      overlaySuppressNext: true,
    });
    expect(
      resolveOverlaySongs(
        {
          ...baseSetlist,
          currentSongId: SAMPLE_SONGS[0].id,
          overlaySuppressNext: true,
        },
        SAMPLE_SONGS,
      ).next,
    ).toBeUndefined();
  });

  it("advances from the first song to the second", () => {
    expect(
      navigateOverlayNext(
        {
          ...baseSetlist,
          currentSongId: SAMPLE_SONGS[0].id,
          overlaySuppressNext: true,
        },
        SAMPLE_SONGS,
      ),
    ).toEqual({ currentSongId: SAMPLE_SONGS[1].id });
  });
});

describe("rewindCurrentSongId", () => {
  it("moves to previous song in order", () => {
    expect(rewindCurrentSongId(baseSetlist, SAMPLE_SONGS)).toBe(
      SAMPLE_SONGS[0].id,
    );
  });

  it("hides next on the first song when prev is pressed", () => {
    const firstWithNext = {
      ...baseSetlist,
      currentSongId: SAMPLE_SONGS[0].id,
      overlaySuppressNext: false as const,
    };
    expect(canNavigateOverlayPrev(firstWithNext, SAMPLE_SONGS)).toBe(true);
    expect(navigateOverlayPrev(firstWithNext, SAMPLE_SONGS)).toEqual({
      currentSongId: SAMPLE_SONGS[0].id,
      overlaySuppressNext: true,
    });
    expect(
      resolveOverlaySongs(
        { ...firstWithNext, overlaySuppressNext: true },
        SAMPLE_SONGS,
      ).next,
    ).toBeUndefined();
  });

  it("returns to the first song without next when rewinding from second", () => {
    expect(navigateOverlayPrev(baseSetlist, SAMPLE_SONGS)).toEqual({
      currentSongId: SAMPLE_SONGS[0].id,
      overlaySuppressNext: true,
    });
  });
});
