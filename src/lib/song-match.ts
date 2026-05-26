import type { Song } from "@/types/setlist";

export function songMatchKey(title: string, artist: string): string {
  return `${title.trim().toLowerCase()}|${artist.trim().toLowerCase()}`;
}

export function isSongInLibrary(
  songs: Song[],
  title: string,
  artist: string,
): boolean {
  const key = songMatchKey(title, artist);
  return songs.some((song) => songMatchKey(song.title, song.artist) === key);
}
