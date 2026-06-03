import { externalHitToSong, type ExternalSongHit } from "@/lib/musicbrainz";
import type {
  ParsedTemplateSongLine,
  ParsedTemplateSongLineWithSource,
} from "@/lib/setlist-engine";
import { findSongInLibrary, isSongInLibrary } from "@/lib/song-match";
import { upsertSong } from "@/lib/storage";
import type { AppData, Song } from "@/types/setlist";

export type TemplateSongImportResult = {
  newSongs: Song[];
  skipped: ParsedTemplateSongLine[];
  /** 入力順（登録済みは既存曲、未登録は新規曲） */
  resolved: Song[];
};

export type TemplateSongLineStatus = "addable" | "skipped";

export type ClassifiedTemplateSongLine = ParsedTemplateSongLineWithSource & {
  status: TemplateSongLineStatus;
};

export function classifyTemplateSongLines(
  library: Song[],
  parsed: ParsedTemplateSongLineWithSource[],
): ClassifiedTemplateSongLine[] {
  const results: ClassifiedTemplateSongLine[] = [];
  let workingLibrary = library;

  for (const line of parsed) {
    if (findSongInLibrary(workingLibrary, line.title, line.artist)) {
      results.push({ ...line, status: "skipped" });
      continue;
    }
    results.push({ ...line, status: "addable" });
    workingLibrary = [
      ...workingLibrary,
      {
        id: `pending-${line.sourceLine}`,
        title: line.title,
        artist: line.artist,
        durationSec: 0,
        tags: [],
        createdAt: "",
      },
    ];
  }

  return results;
}

export function formatTemplateSongLine(
  line: Pick<ParsedTemplateSongLine, "title" | "artist">,
): string {
  const artist = line.artist.trim();
  return artist ? `${line.title.trim()} / ${artist}` : line.title.trim();
}

export function prepareTemplateSongImport(
  library: Song[],
  parsed: ParsedTemplateSongLine[],
  createSong: (line: ParsedTemplateSongLine, index: number) => Song,
): TemplateSongImportResult {
  const newSongs: Song[] = [];
  const skipped: ParsedTemplateSongLine[] = [];
  const resolved: Song[] = [];
  let workingLibrary = library;

  for (let index = 0; index < parsed.length; index++) {
    const line = parsed[index];
    const existing = findSongInLibrary(workingLibrary, line.title, line.artist);
    if (existing) {
      skipped.push(line);
      resolved.push(existing);
      continue;
    }
    const song = createSong(line, index);
    newSongs.push(song);
    resolved.push(song);
    workingLibrary = [...workingLibrary, song];
  }

  return { newSongs, skipped, resolved };
}

export function buildTemplateImportNotice({
  newSongs,
  skipped,
}: TemplateSongImportResult): string | null {
  if (newSongs.length === 0 && skipped.length === 0) return null;
  if (skipped.length === 0) return `${newSongs.length}曲を追加しました。`;
  if (newSongs.length === 0) {
    if (skipped.length === 1) {
      return `「${formatTemplateSongLine(skipped[0])}」はすでに登録済みのため、追加をスキップしました。`;
    }
    return `入力した${skipped.length}曲はすべて登録済みのため、追加をスキップしました。`;
  }
  const skippedNames = skipped.map((line) => `「${formatTemplateSongLine(line)}」`).join("、");
  return `${newSongs.length}曲を追加しました。${skippedNames}は登録済みのためスキップしました。`;
}

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
