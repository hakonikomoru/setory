import type { Setlist, Song } from "@/types/setlist";

export function formatDuration(totalSec: number): string {
  const minutes = Math.floor(totalSec / 60);
  const seconds = totalSec % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

/** 尺が未設定（0秒）のときは空文字 */
export function formatSongDurationLabel(durationSec: number): string {
  if (durationSec <= 0) return "";
  return `（${formatDuration(durationSec)}）`;
}

export function formatSongDurationFields(durationSec: number): {
  minutes: string;
  seconds: string;
} {
  if (durationSec <= 0) return { minutes: "0", seconds: "0" };
  return {
    minutes: String(Math.floor(durationSec / 60)),
    seconds: String(durationSec % 60),
  };
}

/** 分・秒がともに 0 のときは未登録（0秒） */
export function parseSongDurationFields(minutes: string, seconds: string): number {
  const min = Math.max(0, Number(minutes) || 0);
  const sec = Math.max(0, Number(seconds) || 0);
  if (min === 0 && sec === 0) return 0;
  return min * 60 + sec;
}

export function getSongsFromSetlist(setlist: Setlist, songs: Song[]): Song[] {
  const map = new Map(songs.map((song) => [song.id, song]));
  return setlist.songIds.map((id) => map.get(id)).filter((song): song is Song => Boolean(song));
}

export function getSetlistDuration(setlist: Setlist, songs: Song[]): number {
  return getSongsFromSetlist(setlist, songs).reduce((sum, song) => sum + song.durationSec, 0);
}

export type SetlistLineDisplayOptions = {
  hideDuration?: boolean;
  hideArtist?: boolean;
};

/** クリップボードコピー用の 1 行表記（例: `1. 曲名 / アーティスト（3:45）`） */
export function formatSetlistSongLine(
  song: Song,
  index: number,
  options: SetlistLineDisplayOptions = {},
): string {
  const hideDuration = Boolean(options.hideDuration);
  const hideArtist = Boolean(options.hideArtist);
  const prefix = `${index + 1}. ${song.title}`;
  const artist = song.artist.trim();

  const durationLabel = formatSongDurationLabel(song.durationSec);

  if (!artist) {
    if (hideDuration || hideArtist) return prefix;
    return `${prefix}${durationLabel}`;
  }

  if (hideArtist && hideDuration) return prefix;
  if (hideArtist) return `${prefix}${durationLabel}`;
  if (hideDuration) return `${prefix} / ${artist}`;
  return `${prefix} / ${artist}${durationLabel}`;
}

export type ParsedTemplateSongLine = {
  title: string;
  artist: string;
};

export type ParsedTemplateSongLineWithSource = ParsedTemplateSongLine & {
  /** テキストエリア上の行番号（1始まり） */
  sourceLine: number;
};

function parseTemplateSongLine(rawLine: string): ParsedTemplateSongLine | null {
  const line = rawLine.trim();
  if (!line) return null;

  const slashMatch = line.match(/\s*[\/／]\s*/);
  if (!slashMatch || slashMatch.index === undefined) {
    return { title: line, artist: "" };
  }

  const title = line.slice(0, slashMatch.index).trim();
  const artist = line.slice(slashMatch.index + slashMatch[0].length).trim();
  if (!title) return null;
  return { title, artist };
}

/** 1行1曲。`曲名 / アーティスト` または曲名のみ（アーティストなし） */
export function parseTemplateSongLines(text: string): ParsedTemplateSongLine[] {
  return parseTemplateSongLinesWithSource(text).map(({ sourceLine: _sourceLine, ...line }) => line);
}

/** 取り込み対象行と、元テキストの行番号 */
export function parseTemplateSongLinesWithSource(text: string): ParsedTemplateSongLineWithSource[] {
  const results: ParsedTemplateSongLineWithSource[] = [];
  const rawLines = text.split(/\r?\n/);

  for (let index = 0; index < rawLines.length; index++) {
    const parsed = parseTemplateSongLine(rawLines[index]);
    if (!parsed) continue;
    results.push({ ...parsed, sourceLine: index + 1 });
  }

  return results;
}

export function formatSetlistText(setlist: Setlist, songs: Song[]): string {
  const ordered = getSongsFromSetlist(setlist, songs);
  const lineOptions: SetlistLineDisplayOptions = {
    hideDuration: Boolean(setlist.hideDuration),
    hideArtist: Boolean(setlist.hideArtist),
  };
  const lines = ordered.map((song, index) => formatSetlistSongLine(song, index, lineOptions));
  const hideDuration = Boolean(setlist.hideDuration);
  const total = ordered.reduce((sum, song) => sum + song.durationSec, 0);
  const totalLine =
    hideDuration || total <= 0
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

export type SongListSortOrder = "asc" | "desc";

/** 登録日時で並べ替える（同時刻は曲名でタイブレーク） */
export function sortSongsByCreatedAt(songs: Song[], order: SongListSortOrder): Song[] {
  const sorted = [...songs].sort((a, b) => {
    const byTime = a.createdAt.localeCompare(b.createdAt);
    if (byTime !== 0) return byTime;
    const byTitle = a.title.localeCompare(b.title, "ja");
    if (byTitle !== 0) return byTitle;
    return a.artist.localeCompare(b.artist, "ja");
  });
  return order === "desc" ? sorted.reverse() : sorted;
}

/** セトリ未追加を上に、追加済みを下に（各グループ内は追加順） */
export function sortSongsWithUnaddedSetlistFirst(
  songs: Song[],
  setlistSongIds: string[],
  order: SongListSortOrder,
): Song[] {
  const sorted = sortSongsByCreatedAt(songs, order);
  if (setlistSongIds.length === 0) return sorted;

  const inSetlist = new Set(setlistSongIds);
  const pending = sorted.filter((song) => !inSetlist.has(song.id));
  const added = sorted.filter((song) => inSetlist.has(song.id));
  return [...pending, ...added];
}
