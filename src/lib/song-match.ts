import type { Song } from "@/types/setlist";

export function songMatchKey(title: string, artist: string): string {
  return `${title.trim().toLowerCase()}|${artist.trim().toLowerCase()}`;
}

export function findSongInLibrary(songs: Song[], title: string, artist: string): Song | undefined {
  const key = songMatchKey(title, artist);
  return songs.find((song) => songMatchKey(song.title, song.artist) === key);
}

export function isSongInLibrary(songs: Song[], title: string, artist: string): boolean {
  return Boolean(findSongInLibrary(songs, title, artist));
}

export function isSongInSetlist(
  songs: Song[],
  setlistSongIds: string[],
  title: string,
  artist: string,
): boolean {
  const song = findSongInLibrary(songs, title, artist);
  if (!song) return false;
  return setlistSongIds.includes(song.id);
}
