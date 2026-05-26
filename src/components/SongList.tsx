"use client";

import { formatDuration } from "@/lib/setlist-engine";
import type { Song } from "@/types/setlist";

type Props = {
  songs: Song[];
  onEdit?: (song: Song) => void;
  onDelete?: (songId: string) => void;
  onAddToSetlist?: (songId: string) => void;
  selectedIds?: string[];
  /** セトリ追加向けの1行表示 */
  variant?: "default" | "compact";
  /** 曲庫右カラム向けの2列カード */
  layout?: "list" | "grid";
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
  variant = "default",
  layout = "list",
}: Props) {
  if (songs.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-violet-200 bg-violet-50/60 px-4 py-8 text-center text-sm text-violet-700">
        曲がまだありません。曲庫ページから追加するか、サンプル曲をそのまま使ってください。
      </p>
    );
  }

  if (variant === "compact") {
    return (
      <ul className="grid gap-1.5">
        {songs.map((song) => {
          const selected = selectedIds.includes(song.id);
          return (
            <li
              key={song.id}
              className={`flex min-w-0 items-center justify-between gap-2 rounded-xl border px-3 py-2 ${
                selected
                  ? "border-fuchsia-300 bg-fuchsia-50/80"
                  : "border-violet-100 bg-white/90"
              }`}
            >
              <p className="min-w-0 flex-1 text-sm leading-snug text-violet-950">
                <span className="font-bold">{song.title}</span>
                <span className="text-violet-700"> / {song.artist}</span>
                <span className="ml-1 text-xs text-violet-500">
                  （{formatDuration(song.durationSec)}）
                </span>
              </p>
              {onAddToSetlist ? (
                <button
                  type="button"
                  onClick={() => onAddToSetlist(song.id)}
                  className="shrink-0 rounded-lg bg-violet-600 px-2.5 py-1 text-xs font-bold text-white"
                >
                  {selected ? "追加済み" : "追加"}
                </button>
              ) : null}
            </li>
          );
        })}
      </ul>
    );
  }

  const listClass =
    layout === "grid" ? "grid grid-cols-1 gap-2 sm:grid-cols-2" : "grid gap-3";

  return (
    <ul className={listClass}>
      {songs.map((song) => {
        const selected = selectedIds.includes(song.id);
        const cardClass = `rounded-xl border px-3 py-2.5 ${
          selected
            ? "border-fuchsia-300 bg-fuchsia-50/80"
            : "border-violet-100 bg-white/90"
        }`;

        if (layout === "grid") {
          return (
            <li key={song.id} className={`flex flex-col ${cardClass}`}>
              <div className="min-w-0 flex-1">
                <p className="break-words text-sm font-bold leading-snug text-violet-950">
                  {song.title}
                </p>
                <p className="mt-0.5 break-words text-xs leading-snug text-violet-700">
                  {song.artist}
                </p>
                <p className="mt-1 text-xs text-violet-500">
                  {formatDuration(song.durationSec)} ・ {MOOD_LABEL[song.mood]}
                </p>
                {song.tags.length > 0 ? (
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {song.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-violet-100 px-1.5 py-0.5 text-[10px] font-semibold text-violet-700"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {onAddToSetlist ? (
                  <button
                    type="button"
                    onClick={() => onAddToSetlist(song.id)}
                    className="rounded-lg bg-violet-600 px-2 py-1 text-xs font-bold text-white"
                  >
                    {selected ? "追加済み" : "追加"}
                  </button>
                ) : null}
                {onEdit ? (
                  <button
                    type="button"
                    onClick={() => onEdit(song)}
                    className="rounded-lg border border-violet-200 px-2 py-1 text-xs font-semibold"
                  >
                    編集
                  </button>
                ) : null}
                {onDelete ? (
                  <button
                    type="button"
                    onClick={() => onDelete(song.id)}
                    className="rounded-lg border border-rose-200 px-2 py-1 text-xs font-semibold text-rose-700"
                  >
                    削除
                  </button>
                ) : null}
              </div>
            </li>
          );
        }

        return (
          <li key={song.id} className={cardClass}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="break-words text-lg font-bold text-violet-950">
                  {song.title}
                </p>
                <p className="break-words text-sm text-violet-700">{song.artist}</p>
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
              <div className="flex shrink-0 flex-wrap items-center gap-2 self-start">
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
