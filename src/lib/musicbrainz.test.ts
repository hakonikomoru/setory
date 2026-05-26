import { describe, expect, it } from "vitest";
import {
  formatRecordingArtist,
  mergeExternalHits,
  parseMusicBrainzRecordings,
  recordingLengthToSec,
} from "@/lib/musicbrainz";

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
