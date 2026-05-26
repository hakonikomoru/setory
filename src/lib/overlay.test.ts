import { describe, expect, it } from "vitest";
import { SAMPLE_SONGS } from "@/lib/sample-songs";
import {
  advanceCurrentSongId,
  buildObsDisplayUrl,
  buildOverlayControlUrl,
  buildOverlayUrl,
  canNavigateOverlayPrev,
  DEFAULT_OVERLAY_MODE,
  DEFAULT_OVERLAY_THEME,
  DEFAULT_OVERLAY_VISIBLE,
  isFirstSongNextSuppressed,
  navigateOverlayNext,
  navigateOverlayPrev,
  overlayMode,
  overlayTheme,
  overlayVisible,
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

describe("overlay defaults", () => {
  it("applies defaults when fields are unset", () => {
    expect(overlayVisible(baseSetlist)).toBe(DEFAULT_OVERLAY_VISIBLE);
    expect(overlayMode(baseSetlist)).toBe(DEFAULT_OVERLAY_MODE);
    expect(overlayTheme(baseSetlist)).toBe(DEFAULT_OVERLAY_THEME);
  });

  it("respects explicit overlayVisible false", () => {
    expect(overlayVisible({ ...baseSetlist, overlayVisible: false })).toBe(false);
  });

  it("falls back to simple for unknown stored theme", () => {
    const setlist = {
      ...baseSetlist,
      overlayTheme: "legacy-unknown" as typeof baseSetlist.overlayTheme,
    };
    expect(overlayTheme(setlist)).toBe("simple");
  });

  it("accepts all current overlay themes", () => {
    for (const theme of ["simple", "minimal", "bold", "cute", "dark", "komoru"] as const) {
      expect(overlayTheme({ ...baseSetlist, overlayTheme: theme })).toBe(theme);
    }
  });
});

describe("isFirstSongNextSuppressed", () => {
  it("suppresses on first song by default", () => {
    expect(isFirstSongNextSuppressed(baseSetlist, 0)).toBe(true);
    expect(isFirstSongNextSuppressed(baseSetlist, 1)).toBe(false);
  });

  it("shows next on first song when overlaySuppressNext is false", () => {
    expect(isFirstSongNextSuppressed({ ...baseSetlist, overlaySuppressNext: false }, 0)).toBe(
      false,
    );
  });
});

describe("overlay URLs", () => {
  const origin = "https://setory.example";

  it("builds control and OBS URLs", () => {
    expect(buildOverlayControlUrl("abc", origin)).toBe("https://setory.example/overlay?id=abc");
    expect(buildObsDisplayUrl("abc", origin)).toBe("https://setory.example/overlay?obs=1&id=abc");
    expect(buildOverlayUrl("abc", origin)).toBe(buildObsDisplayUrl("abc", origin));
  });

  it("encodes setlist id in query", () => {
    expect(buildObsDisplayUrl("a b", origin)).toBe("https://setory.example/overlay?obs=1&id=a%20b");
  });
});

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
    expect(advanceCurrentSongId(baseSetlist, SAMPLE_SONGS)).toBe(SAMPLE_SONGS[2].id);
  });

  it("starts on the first song without showing next", () => {
    expect(navigateOverlayNext({ ...baseSetlist, currentSongId: undefined }, SAMPLE_SONGS)).toEqual(
      {
        currentSongId: SAMPLE_SONGS[0].id,
        overlaySuppressNext: true,
      },
    );
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
    expect(rewindCurrentSongId(baseSetlist, SAMPLE_SONGS)).toBe(SAMPLE_SONGS[0].id);
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
      resolveOverlaySongs({ ...firstWithNext, overlaySuppressNext: true }, SAMPLE_SONGS).next,
    ).toBeUndefined();
  });

  it("returns to the first song without next when rewinding from second", () => {
    expect(navigateOverlayPrev(baseSetlist, SAMPLE_SONGS)).toEqual({
      currentSongId: SAMPLE_SONGS[0].id,
      overlaySuppressNext: true,
    });
  });

  it("cannot rewind from first song when next is suppressed", () => {
    expect(
      canNavigateOverlayPrev(
        {
          ...baseSetlist,
          currentSongId: SAMPLE_SONGS[0].id,
          overlaySuppressNext: true,
        },
        SAMPLE_SONGS,
      ),
    ).toBe(false);
  });

  it("stays on last song when advancing past end", () => {
    const last = {
      ...baseSetlist,
      currentSongId: SAMPLE_SONGS[2].id,
    };
    expect(navigateOverlayNext(last, SAMPLE_SONGS)).toEqual({
      currentSongId: SAMPLE_SONGS[2].id,
    });
  });

  it("returns empty navigation for empty setlist", () => {
    const empty = { ...baseSetlist, songIds: [], currentSongId: undefined };
    expect(navigateOverlayNext(empty, SAMPLE_SONGS)).toEqual({});
    expect(navigateOverlayPrev(empty, SAMPLE_SONGS)).toEqual({});
    expect(canNavigateOverlayPrev(empty, SAMPLE_SONGS)).toBe(false);
  });
});
