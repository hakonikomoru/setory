import type { Song } from "@/types/setlist";

export type StreamingServiceId =
  | "youtube-music"
  | "spotify"
  | "apple-music"
  | "amazon-music";

export type StreamingService = {
  id: StreamingServiceId;
  label: string;
  buttonLabel: string;
  primary?: boolean;
  buildSearchUrl: (query: string) => string;
};

/** Spotify Web の曲検索 URL */
export function buildSpotifySearchUrl(query: string): string {
  return `https://open.spotify.com/search/results/${encodeURIComponent(query.trim())}`;
}

/** Amazon Music Web の曲検索 URL */
export function buildAmazonMusicSearchUrl(query: string): string {
  const pathSegment = encodeURIComponent(query.trim()).replace(/%20/g, "+");
  const params = new URLSearchParams({
    filter: "IsLibrary|false",
    sc: "none",
  });
  return `https://music.amazon.co.jp/search/${pathSegment}?${params.toString()}`;
}

/** 配信サービス検索用クエリ（曲名のみ。曲名が空のときはアーティスト名） */
export function buildSongSearchQuery(song: Pick<Song, "title" | "artist">): string {
  const title = song.title.trim();
  if (title) return title;
  return song.artist.trim();
}

export const STREAMING_SERVICES: StreamingService[] = [
  {
    id: "youtube-music",
    label: "YouTube Music",
    buttonLabel: "YT Music",
    primary: true,
    buildSearchUrl: (query) =>
      `https://music.youtube.com/search?q=${encodeURIComponent(query)}`,
  },
  {
    id: "spotify",
    label: "Spotify",
    buttonLabel: "Spotify",
    buildSearchUrl: (query) => buildSpotifySearchUrl(query),
  },
  {
    id: "apple-music",
    label: "Apple Music",
    buttonLabel: "Apple",
    buildSearchUrl: (query) =>
      `https://music.apple.com/jp/search?term=${encodeURIComponent(query)}`,
  },
  {
    id: "amazon-music",
    label: "Amazon Music",
    buttonLabel: "Amazon",
    buildSearchUrl: (query) => buildAmazonMusicSearchUrl(query),
  },
];

export function streamingSearchUrl(
  serviceId: StreamingServiceId,
  song: Pick<Song, "title" | "artist">,
): string {
  const service = STREAMING_SERVICES.find((item) => item.id === serviceId);
  if (!service) throw new Error(`Unknown streaming service: ${serviceId}`);
  return service.buildSearchUrl(buildSongSearchQuery(song));
}
