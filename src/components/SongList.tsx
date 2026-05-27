"use client";

import RowActionButton from "@/components/RowActionButton";
import { formatDuration, formatSongDurationLabel } from "@/lib/setlist-engine";
import type { Song } from "@/types/setlist";

type Props = {
  songs: Song[];
  onEdit?: (song: Song) => void;
  onDelete?: (songId: string) => void;
  onAddToSetlist?: (songId: string) => void;
  selectedIds?: string[];
  /** セトリ追加向けの1行表示 */
  variant?: "default" | "compact";
  layout?: "list" | "grid";
};

function SongRowActions({
  song,
  selected,
  onAddToSetlist,
  onEdit,
  onDelete,
}: {
  song: Song;
  selected: boolean;
  onAddToSetlist?: (songId: string) => void;
  onEdit?: (song: Song) => void;
  onDelete?: (songId: string) => void;
}) {
  return (
    <div className="flex shrink-0 items-center gap-1.5">
      {onAddToSetlist ? (
        <RowActionButton
          type="button"
          variant={selected ? "muted" : "primary"}
          size="sm"
          disabled={selected}
          onClick={() => onAddToSetlist(song.id)}
        >
          {selected ? "追加済み" : "追加"}
        </RowActionButton>
      ) : null}
      {onEdit ? (
        <RowActionButton type="button" variant="secondary" size="sm" onClick={() => onEdit(song)}>
          編集
        </RowActionButton>
      ) : null}
      {onDelete ? (
        <RowActionButton
          type="button"
          variant="danger"
          size="sm"
          onClick={() => onDelete(song.id)}
        >
          削除
        </RowActionButton>
      ) : null}
    </div>
  );
}

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
          const artist = song.artist.trim();
          return (
            <li
              key={song.id}
              className={`flex min-w-0 items-center justify-between gap-2 rounded-xl border px-3 py-2 ${
                selected ? "border-fuchsia-300 bg-fuchsia-50/80" : "border-violet-100 bg-white/90"
              }`}
            >
              <p className="min-w-0 flex-1 text-sm leading-snug text-violet-950">
                <span className="font-bold">{song.title}</span>
                {artist ? <span className="text-violet-700"> / {artist}</span> : null}
                {song.durationSec > 0 ? (
                  <span className="ml-1 text-xs text-violet-500">
                    {formatSongDurationLabel(song.durationSec)}
                  </span>
                ) : null}
              </p>
              {onAddToSetlist ? (
                <RowActionButton
                  type="button"
                  variant={selected ? "muted" : "primary"}
                  size="sm"
                  disabled={selected}
                  onClick={() => onAddToSetlist(song.id)}
                >
                  {selected ? "追加済み" : "追加"}
                </RowActionButton>
              ) : null}
            </li>
          );
        })}
      </ul>
    );
  }

  const listClass = layout === "grid" ? "grid grid-cols-1 gap-2 sm:grid-cols-2" : "grid gap-1.5";

  return (
    <ul className={listClass}>
      {songs.map((song) => {
        const selected = selectedIds.includes(song.id);
        const artist = song.artist.trim();
        const cardClass = `rounded-xl border px-3 py-2.5 ${
          selected ? "border-fuchsia-300 bg-fuchsia-50/80" : "border-violet-100 bg-white/90"
        }`;

        if (layout === "grid") {
          return (
            <li key={song.id} className={`flex flex-col ${cardClass}`}>
              <div className="min-w-0 flex-1">
                <p className="text-sm leading-snug font-bold break-words text-violet-950">
                  {song.title}
                </p>
                {artist ? (
                  <p className="mt-0.5 text-xs leading-snug break-words text-violet-700">{artist}</p>
                ) : null}
                {song.durationSec > 0 ? (
                  <p className="mt-1 text-xs text-violet-500">{formatDuration(song.durationSec)}</p>
                ) : null}
              </div>
              <div className="mt-2">
                <SongRowActions
                  song={song}
                  selected={selected}
                  onAddToSetlist={onAddToSetlist}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              </div>
            </li>
          );
        }

        return (
          <li key={song.id} className={cardClass}>
            <div className="flex min-w-0 items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-sm leading-snug font-bold break-words text-violet-950">
                  {song.title}
                  {artist ? (
                    <span className="font-normal text-violet-700"> / {artist}</span>
                  ) : null}
                </p>
                {song.durationSec > 0 ? (
                  <p className="mt-0.5 text-xs text-violet-500">{formatDuration(song.durationSec)}</p>
                ) : null}
              </div>
              <SongRowActions
                song={song}
                selected={selected}
                onAddToSetlist={onAddToSetlist}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
