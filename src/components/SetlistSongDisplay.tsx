"use client";

import SongStreamingSearchLinks from "@/components/SongStreamingSearchLinks";
import { formatDuration, formatSongDurationLabel, getSongsFromSetlist } from "@/lib/setlist-engine";
import type { Setlist, Song } from "@/types/setlist";

type Props = {
  setlist: Setlist;
  songs: Song[];
  className?: string;
};

function songDetailSuffix(song: Song, hideArtist: boolean, hideDuration: boolean): string {
  const artist = song.artist.trim();
  if (!hideArtist && artist) {
    return hideDuration ? artist : `${artist}${formatSongDurationLabel(song.durationSec)}`;
  }
  if (!hideDuration && song.durationSec > 0) return formatDuration(song.durationSec);
  return "";
}

/** 保存一覧など画面向けの曲順表示（コピー用テキストとは別） */
export default function SetlistSongDisplay({ setlist, songs, className = "" }: Props) {
  const ordered = getSongsFromSetlist(setlist, songs);
  const hideArtist = Boolean(setlist.hideArtist);
  const hideDuration = Boolean(setlist.hideDuration);

  if (ordered.length === 0) {
    return (
      <p
        className={`rounded-xl border border-dashed border-violet-200 px-4 py-6 text-center text-sm text-violet-600 ${className}`}
      >
        曲が登録されていません
      </p>
    );
  }

  return (
    <ol className={`grid gap-2 ${className}`.trim()}>
      {ordered.map((song, index) => {
        const suffix = songDetailSuffix(song, hideArtist, hideDuration);
        const lineTitle = `${index + 1}. ${song.title}`;
        const fullLine = suffix ? `${lineTitle} / ${suffix}` : lineTitle;

        return (
          <li
            key={song.id}
            className="flex min-w-0 flex-wrap items-center gap-2 rounded-xl border border-fuchsia-200/80 bg-fuchsia-50/50 px-3 py-2.5"
          >
            <p className="min-w-0 flex-1 truncate text-sm text-violet-950" title={fullLine}>
              <span className="font-bold">{lineTitle}</span>
              {suffix ? <span className="font-normal text-violet-700"> / {suffix}</span> : null}
            </p>
            <SongStreamingSearchLinks song={song} />
          </li>
        );
      })}
    </ol>
  );
}
