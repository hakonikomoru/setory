import type { Song } from "@/types/setlist";
import { createId } from "@/lib/storage";

export const MUSICBRAINZ_USER_AGENT =
  "Setory/0.1.0 (https://github.com/hakonikomoru/setory)";

export type ExternalSongHit = {
  source: "musicbrainz";
  externalId: string;
  title: string;
  artist: string;
  durationSec: number;
};

type MbArtistCredit = {
  name?: string;
  artist?: { name?: string };
};

type MbRecording = {
  id: string;
  title?: string;
  length?: number;
  "artist-credit"?: MbArtistCredit[];
};

export type MbRecordingSearchResponse = {
  recordings?: MbRecording[];
};

export function formatRecordingArtist(recording: MbRecording): string {
  const credits = recording["artist-credit"] ?? [];
  const names = credits
    .map((credit) => credit.name ?? credit.artist?.name)
    .filter((name): name is string => Boolean(name?.trim()));

  return names.length > 0 ? names.join("、") : "不明なアーティスト";
}

export function recordingLengthToSec(lengthMs?: number): number {
  if (!lengthMs || lengthMs <= 0) return 240;
  return Math.max(1, Math.round(lengthMs / 1000));
}

export function parseMusicBrainzRecordings(
  payload: MbRecordingSearchResponse,
): ExternalSongHit[] {
  const recordings = payload.recordings ?? [];
  const seen = new Set<string>();
  const hits: ExternalSongHit[] = [];

  for (const recording of recordings) {
    if (!recording.id || !recording.title?.trim()) continue;

    const title = recording.title.trim();
    const artist = formatRecordingArtist(recording).trim();
    const dedupeKey = `${title.toLowerCase()}|${artist.toLowerCase()}`;
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);

    hits.push({
      source: "musicbrainz",
      externalId: recording.id,
      title,
      artist,
      durationSec: recordingLengthToSec(recording.length),
    });
  }

  return hits;
}

export function externalHitToSong(hit: ExternalSongHit): Song {
  return {
    id: createId("song"),
    title: hit.title,
    artist: hit.artist,
    durationSec: hit.durationSec,
    mood: "mid",
    tags: ["MusicBrainz"],
    notes: `MusicBrainz ID: ${hit.externalId}`,
  };
}

export const MUSICBRAINZ_MAX_LIMIT = 100;
export const MUSICBRAINZ_RATE_LIMIT_MS = 1100;

export type MusicBrainzSearchOptions = {
  limit?: number;
  offset?: number;
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function mergeExternalHits(
  ...groups: ExternalSongHit[][]
): ExternalSongHit[] {
  const seen = new Set<string>();
  const hits: ExternalSongHit[] = [];

  for (const group of groups) {
    for (const hit of group) {
      const key = `${hit.title.toLowerCase()}|${hit.artist.toLowerCase()}`;
      if (seen.has(key)) continue;
      seen.add(key);
      hits.push(hit);
    }
  }

  return hits;
}

export async function searchMusicBrainzRecordings(
  query: string,
  options: MusicBrainzSearchOptions = {},
): Promise<ExternalSongHit[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const limit = Math.min(
    MUSICBRAINZ_MAX_LIMIT,
    Math.max(1, options.limit ?? MUSICBRAINZ_MAX_LIMIT),
  );
  const offset = Math.max(0, options.offset ?? 0);

  const url = new URL("https://musicbrainz.org/ws/2/recording");
  url.searchParams.set("query", trimmed);
  url.searchParams.set("fmt", "json");
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("offset", String(offset));

  const response = await fetch(url, {
    headers: { "User-Agent": MUSICBRAINZ_USER_AGENT },
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error(`MusicBrainz API error: ${response.status}`);
  }

  const payload = (await response.json()) as MbRecordingSearchResponse;
  return parseMusicBrainzRecordings(payload);
}

/** 複数ページを順に取得してマージ（レート制限に従う） */
export async function searchMusicBrainzRecordingsDeep(
  query: string,
  options: { limitPerPage?: number; maxResults?: number } = {},
): Promise<ExternalSongHit[]> {
  const limitPerPage = Math.min(
    MUSICBRAINZ_MAX_LIMIT,
    options.limitPerPage ?? MUSICBRAINZ_MAX_LIMIT,
  );
  const maxResults = Math.min(300, options.maxResults ?? 200);
  const pages: ExternalSongHit[][] = [];
  let offset = 0;

  while (offset < maxResults) {
    const batch = await searchMusicBrainzRecordings(query, {
      limit: limitPerPage,
      offset,
    });
    pages.push(batch);
    if (batch.length < limitPerPage) break;
    offset += limitPerPage;
    if (offset >= maxResults) break;
    await sleep(MUSICBRAINZ_RATE_LIMIT_MS);
  }

  return mergeExternalHits(...pages).slice(0, maxResults);
}
