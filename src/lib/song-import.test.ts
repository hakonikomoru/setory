import { describe, expect, it } from "vitest";
import { importSongsFromHits } from "@/lib/song-import";
import type { ExternalSongHit } from "@/lib/musicbrainz";

const hit: ExternalSongHit = {
  source: "musicbrainz",
  externalId: "mb-1",
  title: "テスト曲",
  artist: "テスト歌手",
  durationSec: 200,
};

describe("importSongsFromHits", () => {
  it("adds new songs and skips duplicates", () => {
    const first = importSongsFromHits({ songs: [], setlists: [] }, [hit]);
    expect(first.added).toBe(1);
    expect(first.data.songs).toHaveLength(1);

    const second = importSongsFromHits(first.data, [hit]);
    expect(second.added).toBe(0);
    expect(second.skipped).toBe(1);
    expect(second.data.songs).toHaveLength(1);
  });
});
