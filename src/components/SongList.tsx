"use client";

import { formatDuration } from "@/lib/setlist-engine";
import type { Song } from "@/types/setlist";

type Props = {
  songs: Song[];
  onEdit?: (song: Song) => void;
  onDelete?: (songId: string) => void;
  onAddToSetlist?: (songId: string) => void;
  selectedIds?: string[];
};

const MOOD_LABEL = {
  upbeat: "盛り上がり",
  mid: "中間",
  ballad: "バラード",
} as const;

export default function SongList({
  songs,
  onEdit,
  onDelete,
  onAddToSetlist,
  selectedIds = [],
}: Props) {
  if (songs.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-violet-200 bg-violet-50/60 px-4 py-8 text-center text-sm text-violet-700">
        曲がまだありません。曲庫ページから追加するか、サンプル曲をそのまま使ってください。
      </p>
    );
  }

  return (
    <ul className="grid gap-3">
      {songs.map((song) => {
        const selected = selectedIds.includes(song.id);
        return (
          <li
            key={song.id}
            className={`rounded-2xl border px-4 py-3 ${
              selected
                ? "border-fuchsia-300 bg-fuchsia-50/80"
                : "border-violet-100 bg-white/90"
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-lg font-bold text-violet-950">{song.title}</p>
                <p className="text-sm text-violet-700">{song.artist}</p>
                <p className="mt-1 text-xs text-violet-500">
                  {formatDuration(song.durationSec)} ・ {MOOD_LABEL[song.mood]}
                </p>
                {song.tags.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {song.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-semibold text-violet-700"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-2">
                {onAddToSetlist ? (
                  <button
                    type="button"
                    onClick={() => onAddToSetlist(song.id)}
                    className="rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-bold text-white"
                  >
                    {selected ? "追加済み" : "セトリに追加"}
                  </button>
                ) : null}
                {onEdit ? (
                  <button
                    type="button"
                    onClick={() => onEdit(song)}
                    className="rounded-lg border border-violet-200 px-3 py-1.5 text-xs font-semibold"
                  >
                    編集
                  </button>
                ) : null}
                {onDelete ? (
                  <button
                    type="button"
                    onClick={() => onDelete(song.id)}
                    className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-700"
                  >
                    削除
                  </button>
                ) : null}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
