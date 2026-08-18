import { describe, expect, it } from "vitest";
import {
  buildTemplateImportNotice,
  classifyTemplateSongLines,
  importSongsFromHits,
  prepareTemplateSongImport,
} from "@/lib/song-import";
import type { ExternalSongHit } from "@/lib/musicbrainz";
import type { Song } from "@/types/setlist";

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

const existingSong: Song = {
  id: "song-1",
  title: "夜に駆ける",
  artist: "YOASOBI",
  durationSec: 0,
  tags: [],
  createdAt: "2026-01-01T00:00:00.000Z",
};

describe("classifyTemplateSongLines", () => {
  it("marks duplicate lines with source line numbers", () => {
    const classified = classifyTemplateSongLines(
      [existingSong],
      [
        { title: "夜に駆ける", artist: "YOASOBI", sourceLine: 2 },
        { title: "新曲", artist: "歌手", sourceLine: 5 },
      ],
    );
    expect(classified[0]).toMatchObject({ sourceLine: 2, status: "skipped" });
    expect(classified[1]).toMatchObject({ sourceLine: 5, status: "addable" });
  });
});

describe("prepareTemplateSongImport", () => {
  it("skips lines that match library title and artist", () => {
    const result = prepareTemplateSongImport(
      [existingSong],
      [
        { title: "夜に駆ける", artist: "YOASOBI" },
        { title: "新曲", artist: "歌手" },
      ],
      (line, index) => ({
        id: `new-${index}`,
        title: line.title,
        artist: line.artist,
        durationSec: 0,
        tags: [],
        createdAt: "2026-01-02T00:00:00.000Z",
      }),
    );

    expect(result.newSongs).toHaveLength(1);
    expect(result.newSongs[0].title).toBe("新曲");
    expect(result.skipped).toHaveLength(1);
    expect(result.resolved[0].id).toBe("song-1");
    expect(result.resolved[1].id).toBe("new-1");
  });
});

describe("buildTemplateImportNotice", () => {
  it("describes all-skipped import", () => {
    expect(
      buildTemplateImportNotice({
        newSongs: [],
        skipped: [{ title: "夜に駆ける", artist: "YOASOBI" }],
        resolved: [existingSong],
      }),
    ).toContain("すでに登録済み");
  });

  it("describes setlist import that only reuses library songs", () => {
    expect(
      buildTemplateImportNotice(
        {
          newSongs: [],
          skipped: [{ title: "夜に駆ける", artist: "YOASOBI" }],
          resolved: [existingSong],
        },
        { setlist: true },
      ),
    ).toContain("セトリに追加しました");
  });
});
