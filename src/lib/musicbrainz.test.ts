import { describe, expect, it } from "vitest";
import {
  buildMusicBrainzSearchQuery,
  formatRecordingArtist,
  isMusicBrainzSearchReady,
  mergeExternalHits,
  parseMusicBrainzRecordings,
  recordingLengthToSec,
} from "@/lib/musicbrainz";

describe("buildMusicBrainzSearchQuery", () => {
  it("builds recording-only query", () => {
    expect(buildMusicBrainzSearchQuery("夜に駆ける", "")).toBe("recording:夜に駆ける");
  });

  it("builds artist-only query", () => {
    expect(buildMusicBrainzSearchQuery("", "YOASOBI")).toBe("artist:YOASOBI");
  });

  it("combines title and artist with AND", () => {
    expect(buildMusicBrainzSearchQuery("夜に駆ける", "YOASOBI")).toBe(
      "recording:夜に駆ける AND artist:YOASOBI",
    );
  });

  it("returns null when both terms are too short", () => {
    expect(buildMusicBrainzSearchQuery("", "")).toBeNull();
    expect(buildMusicBrainzSearchQuery("a", "b")).toBeNull();
  });
});

describe("isMusicBrainzSearchReady", () => {
  it("is true when either field has enough characters", () => {
    expect(isMusicBrainzSearchReady("夜に", "")).toBe(true);
    expect(isMusicBrainzSearchReady("", "YO")).toBe(true);
    expect(isMusicBrainzSearchReady("a", "")).toBe(false);
  });
});

describe("parseMusicBrainzRecordings", () => {
  it("maps recordings to external hits and dedupes", () => {
    const hits = parseMusicBrainzRecordings({
      recordings: [
        {
          id: "mb-1",
          title: "夜に駆ける",
          length: 258000,
          "artist-credit": [{ name: "YOASOBI" }],
        },
        {
          id: "mb-2",
          title: "夜に駆ける",
          length: 258000,
          "artist-credit": [{ name: "YOASOBI" }],
        },
      ],
    });

    expect(hits).toHaveLength(1);
    expect(hits[0]).toMatchObject({
      title: "夜に駆ける",
      artist: "YOASOBI",
      durationSec: 258,
      externalId: "mb-1",
    });
  });
});

describe("formatRecordingArtist", () => {
  it("joins multiple artist credits", () => {
    const artist = formatRecordingArtist({
      id: "x",
      "artist-credit": [{ name: "A" }, { name: "B" }],
    });
    expect(artist).toBe("A、B");
  });
});

describe("recordingLengthToSec", () => {
  it("defaults to 4 minutes when length is missing", () => {
    expect(recordingLengthToSec()).toBe(240);
  });
});

describe("mergeExternalHits", () => {
  it("merges groups without duplicate title+artist", () => {
    const hit = {
      source: "musicbrainz" as const,
      externalId: "a",
      title: "夜に駆ける",
      artist: "YOASOBI",
      durationSec: 258,
    };
    const merged = mergeExternalHits([hit], [{ ...hit, externalId: "b" }]);
    expect(merged).toHaveLength(1);
  });
});
