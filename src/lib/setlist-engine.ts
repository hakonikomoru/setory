import type { Setlist, Song, SongMood, SuggestOptions } from "@/types/setlist";

const MOOD_ENERGY: Record<SongMood, number> = {
  ballad: 1,
  mid: 2,
  upbeat: 3,
};

export function formatDuration(totalSec: number): string {
  const minutes = Math.floor(totalSec / 60);
  const seconds = totalSec % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function getSongsFromSetlist(setlist: Setlist, songs: Song[]): Song[] {
  const map = new Map(songs.map((song) => [song.id, song]));
  return setlist.songIds
    .map((id) => map.get(id))
    .filter((song): song is Song => Boolean(song));
}

export function getSetlistDuration(setlist: Setlist, songs: Song[]): number {
  return getSongsFromSetlist(setlist, songs).reduce(
    (sum, song) => sum + song.durationSec,
    0,
  );
}

export function formatSetlistText(setlist: Setlist, songs: Song[]): string {
  const ordered = getSongsFromSetlist(setlist, songs);
  const lines = ordered.map(
    (song, index) =>
      `${index + 1}. ${song.title} / ${song.artist}（${formatDuration(song.durationSec)}）`,
  );
  const total = ordered.reduce((sum, song) => sum + song.durationSec, 0);

  return [
    `【${setlist.name}】`,
    setlist.theme ? `テーマ: ${setlist.theme}` : null,
    "",
    ...lines,
    "",
    `合計: ${ordered.length}曲 / ${formatDuration(total)}`,
  ]
    .filter((line): line is string => line !== null)
    .join("\n");
}

function scoreSongForTheme(song: Song, theme: string, tags: string[]): number {
  const haystack = `${song.title} ${song.artist} ${song.tags.join(" ")}`.toLowerCase();
  let score = 0;

  const themeTokens = theme
    .toLowerCase()
    .split(/[\s,、。]+/)
    .filter(Boolean);

  for (const token of themeTokens) {
    if (haystack.includes(token)) score += 3;
  }

  for (const tag of tags) {
    if (song.tags.some((songTag) => songTag.includes(tag) || tag.includes(songTag))) {
      score += 4;
    }
  }

  return score;
}

function orderByMoodFlow(songs: Song[], flow: SuggestOptions["moodFlow"]): Song[] {
  if (flow === "steady") {
    return [...songs].sort(
      (a, b) => MOOD_ENERGY[a.mood] - MOOD_ENERGY[b.mood],
    );
  }

  if (flow === "surprise") {
    const shuffled = [...songs];
    for (let i = shuffled.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  const ballads = songs.filter((s) => s.mood === "ballad");
  const mids = songs.filter((s) => s.mood === "mid");
  const upbeats = songs.filter((s) => s.mood === "upbeat");

  const opening = [...mids, ...ballads].slice(0, 1);
  const peak = [...upbeats, ...mids];
  const closing = [...ballads, ...mids].slice(0, 1);

  const used = new Set<string>();
  const result: Song[] = [];

  for (const group of [opening, peak, closing]) {
    for (const song of group) {
      if (used.has(song.id)) continue;
      used.add(song.id);
      result.push(song);
    }
  }

  for (const song of songs) {
    if (!used.has(song.id)) result.push(song);
  }

  return result;
}

export function suggestSetlistSongs(
  songs: Song[],
  options: SuggestOptions,
): Song[] {
  const targetSec = Math.max(5, options.targetMinutes) * 60;
  const maxSongs = options.maxSongs ?? 12;

  const ranked = [...songs]
    .map((song) => ({
      song,
      score: scoreSongForTheme(song, options.theme, options.preferredTags),
    }))
    .sort((a, b) => b.score - a.score || a.song.title.localeCompare(b.song.title));

  const picked: Song[] = [];
  let totalSec = 0;

  for (const { song } of ranked) {
    if (picked.length >= maxSongs) break;
    if (totalSec + song.durationSec > targetSec && picked.length >= 3) continue;
    picked.push(song);
    totalSec += song.durationSec;
    if (totalSec >= targetSec) break;
  }

  if (picked.length === 0 && ranked[0]) {
    picked.push(ranked[0].song);
  }

  return orderByMoodFlow(picked, options.moodFlow);
}

export function parseTagsInput(input: string): string[] {
  return input
    .split(/[,、\s]+/)
    .map((tag) => tag.trim())
    .filter(Boolean);
}
