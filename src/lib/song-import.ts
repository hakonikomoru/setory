import { externalHitToSong, type ExternalSongHit } from "@/lib/musicbrainz";
import { isSongInLibrary } from "@/lib/song-match";
import { upsertSong } from "@/lib/storage";
import type { AppData } from "@/types/setlist";

export function importSongsFromHits(
  data: AppData,
  hits: ExternalSongHit[],
): { data: AppData; added: number; skipped: number } {
  let next = data;
  let added = 0;
  let skipped = 0;

  for (const hit of hits) {
    if (isSongInLibrary(next.songs, hit.title, hit.artist)) {
      skipped += 1;
      continue;
    }
    next = upsertSong(next, externalHitToSong(hit));
    added += 1;
  }

  return { data: next, added, skipped };
}
