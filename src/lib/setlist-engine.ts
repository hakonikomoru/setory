import type { Setlist, Song } from "@/types/setlist";

export function formatDuration(totalSec: number): string {
  const minutes = Math.floor(totalSec / 60);
  const seconds = totalSec % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function getSongsFromSetlist(setlist: Setlist, songs: Song[]): Song[] {
  const map = new Map(songs.map((song) => [song.id, song]));
  return setlist.songIds.map((id) => map.get(id)).filter((song): song is Song => Boolean(song));
}

export function getSetlistDuration(setlist: Setlist, songs: Song[]): number {
  return getSongsFromSetlist(setlist, songs).reduce((sum, song) => sum + song.durationSec, 0);
}

/** 保存セトリ・コピー用と同じ 1 行表記（例: `1. 曲名 / アーティスト（3:45）`） */
export function formatSetlistSongLine(song: Song, index: number, hideDuration: boolean): string {
  const base = `${index + 1}. ${song.title} / ${song.artist}`;
  return hideDuration ? base : `${base}（${formatDuration(song.durationSec)}）`;
}

export function formatSetlistText(setlist: Setlist, songs: Song[]): string {
  const ordered = getSongsFromSetlist(setlist, songs);
  const hideDuration = Boolean(setlist.hideDuration);
  const lines = ordered.map((song, index) => formatSetlistSongLine(song, index, hideDuration));
  const total = ordered.reduce((sum, song) => sum + song.durationSec, 0);
  const totalLine = hideDuration
    ? `合計: ${ordered.length}曲`
    : `合計: ${ordered.length}曲 / ${formatDuration(total)}`;

  return [
    `【${setlist.name}】`,
    setlist.theme ? `テーマ: ${setlist.theme}` : null,
    "",
    ...lines,
    "",
    totalLine,
  ]
    .filter((line): line is string => line !== null)
    .join("\n");
}

export function parseTagsInput(input: string): string[] {
  return input
    .split(/[,、\s]+/)
    .map((tag) => tag.trim())
    .filter(Boolean);
}

/** 曲名・アーティスト・タグで曲庫を絞り込む（空クエリは全件） */
export function filterSongsByQuery(songs: Song[], query: string): Song[] {
  const tokens = query
    .trim()
    .toLowerCase()
    .split(/[\s,、]+/)
    .filter(Boolean);

  if (tokens.length === 0) return songs;

  return songs.filter((song) => {
    const haystack = `${song.title} ${song.artist} ${song.tags.join(" ")}`.toLowerCase();
    return tokens.every((token) => haystack.includes(token));
  });
}
