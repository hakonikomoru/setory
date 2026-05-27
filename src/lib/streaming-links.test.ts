import { describe, expect, it } from "vitest";
import {
  buildAmazonMusicSearchUrl,
  buildSongSearchQuery,
  buildSpotifySearchUrl,
  streamingSearchUrl,
} from "@/lib/streaming-links";

describe("buildSongSearchQuery", () => {
  it("uses title only when both are set", () => {
    expect(buildSongSearchQuery({ title: "夜に駆ける", artist: "YOASOBI" })).toBe("夜に駆ける");
  });

  it("falls back to artist when title is empty", () => {
    expect(buildSongSearchQuery({ title: "", artist: "YOASOBI" })).toBe("YOASOBI");
  });
});

describe("streamingSearchUrl", () => {
  const song = { title: "夜に駆ける", artist: "YOASOBI" };

  it("builds YouTube Music search URL", () => {
    const url = streamingSearchUrl("youtube-music", song);
    expect(url).toMatch(/^https:\/\/music\.youtube\.com\/search\?q=/);
    expect(decodeURIComponent(url)).toContain("夜に駆ける");
    expect(decodeURIComponent(url)).not.toContain("YOASOBI");
  });

  it("builds Spotify search URL", () => {
    expect(streamingSearchUrl("spotify", song)).toBe(buildSpotifySearchUrl("夜に駆ける"));
  });

  it("builds Apple Music search URL", () => {
    expect(streamingSearchUrl("apple-music", song)).toMatch(
      /^https:\/\/music\.apple\.com\/jp\/search\?term=/,
    );
  });

  it("builds Amazon Music search URL", () => {
    const url = new URL(streamingSearchUrl("amazon-music", song));
    expect(url.hostname).toBe("music.amazon.co.jp");
    expect(url.pathname).toContain("/search/");
    expect(url.searchParams.get("filter")).toBe("IsLibrary|false");
    expect(url.searchParams.get("sc")).toBe("none");
    expect(url.searchParams.has("tag")).toBe(false);
  });
});

describe("buildSpotifySearchUrl", () => {
  it("uses /search/results/ path", () => {
    expect(buildSpotifySearchUrl("God knows")).toBe(
      "https://open.spotify.com/search/results/God%20knows",
    );
  });
});

describe("buildAmazonMusicSearchUrl", () => {
  it("uses path-based search without tag", () => {
    const url = new URL(buildAmazonMusicSearchUrl("god knows"));
    expect(url.pathname).toBe("/search/god+knows");
    expect(url.searchParams.get("filter")).toBe("IsLibrary|false");
    expect(url.searchParams.get("sc")).toBe("none");
  });
});
