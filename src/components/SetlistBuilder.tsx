"use client";

import { useMemo, useState } from "react";
import CopySetlistButton from "@/components/CopySetlistButton";
import ExternalSongSearch from "@/components/ExternalSongSearch";
import SongList from "@/components/SongList";
import {
  filterSongsByQuery,
  formatDuration,
  formatSetlistText,
  getSetlistDuration,
} from "@/lib/setlist-engine";
import { createId, upsertSong } from "@/lib/storage";
import type { AppData, Setlist, Song } from "@/types/setlist";

type Props = {
  data: AppData;
  initialSetlist?: Setlist;
  onSave: (data: AppData) => void;
  onDataChange: (data: AppData) => void;
};

export default function SetlistBuilder({
  data,
  initialSetlist,
  onSave,
  onDataChange,
}: Props) {
  const [name, setName] = useState(initialSetlist?.name ?? "新しいセトリ");
  const [theme, setTheme] = useState(initialSetlist?.theme ?? "");
  const [songIds, setSongIds] = useState<string[]>(initialSetlist?.songIds ?? []);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [hideDuration, setHideDuration] = useState(
    initialSetlist?.hideDuration ?? false,
  );

  const draftSetlist: Setlist = useMemo(
    () => ({
      id: initialSetlist?.id ?? createId("setlist"),
      name,
      theme: theme.trim() || undefined,
      hideDuration: hideDuration || undefined,
      songIds,
      createdAt: initialSetlist?.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }),
    [initialSetlist, name, theme, hideDuration, songIds],
  );

  const selectedSongs = songIds
    .map((id) => data.songs.find((song) => song.id === id))
    .filter((song): song is Song => Boolean(song));

  const availableSongs = data.songs.filter((song) => !songIds.includes(song.id));
  const filteredAvailableSongs = useMemo(
    () => filterSongsByQuery(availableSongs, searchQuery),
    [availableSongs, searchQuery],
  );
  const totalSec = getSetlistDuration(draftSetlist, data.songs);
  const exportText = formatSetlistText(draftSetlist, data.songs);

  function toggleSong(songId: string) {
    setSongIds((current) =>
      current.includes(songId)
        ? current.filter((id) => id !== songId)
        : [...current, songId],
    );
  }

  function moveSong(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= songIds.length) return;
    const next = [...songIds];
    [next[index], next[target]] = [next[target], next[index]];
    setSongIds(next);
  }

  function handleDrop(targetIndex: number) {
    if (dragIndex === null || dragIndex === targetIndex) return;
    const next = [...songIds];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(targetIndex, 0, moved);
    setSongIds(next);
    setDragIndex(null);
  }

  function handleSave() {
    if (songIds.length === 0) return;
    onSave({
      ...data,
      setlists: [
        ...data.setlists.filter((setlist) => setlist.id !== draftSetlist.id),
        draftSetlist,
      ],
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="grid gap-4">
        <div className="rounded-2xl border border-violet-100 bg-white/90 p-5 shadow-lg shadow-violet-100/40">
          <h2 className="text-xl font-bold text-violet-950">セトリ情報</h2>
          <div className="mt-4 grid gap-3">
            <label className="grid gap-1 text-sm font-semibold text-violet-900">
              セトリ名
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-xl border border-violet-200 px-3 py-2"
              />
            </label>
            <label className="grid gap-1 text-sm font-semibold text-violet-900">
              テーマ・メモ
              <input
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="rounded-xl border border-violet-200 px-3 py-2"
                placeholder="誕生日配信、切ない回 など"
              />
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-violet-900">
              <input
                type="checkbox"
                checked={hideDuration}
                onChange={(e) => setHideDuration(e.target.checked)}
                className="size-4 rounded border-violet-300"
              />
              曲時間を表示しない（コピー用テキスト・曲順一覧）
            </label>
          </div>
          <p className="mt-4 text-sm text-violet-700">
            選択中: {selectedSongs.length}曲
            {hideDuration ? null : <> / 合計 {formatDuration(totalSec)}</>}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={songIds.length === 0}
              className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-40"
            >
              セトリを保存
            </button>
            <CopySetlistButton text={exportText} />
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-lg font-bold text-violet-950">曲順（ドラッグで並べ替え）</h3>
          {selectedSongs.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-violet-200 px-4 py-6 text-center text-sm text-violet-600">
              右の曲一覧から追加してください。
            </p>
          ) : (
            <ol className="grid gap-2">
              {selectedSongs.map((song, index) => (
                <li
                  key={song.id}
                  draggable
                  onDragStart={() => setDragIndex(index)}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={() => handleDrop(index)}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-fuchsia-200 bg-fuchsia-50/70 px-3 py-2"
                >
                  <div>
                    <p className="font-bold text-violet-950">
                      {index + 1}. {song.title}
                    </p>
                    <p className="text-sm text-violet-700">
                      {hideDuration
                        ? song.artist
                        : `${song.artist}（${formatDuration(song.durationSec)}）`}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => moveSong(index, -1)}
                      className="rounded-lg border px-2 py-1 text-xs"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => moveSong(index, 1)}
                      className="rounded-lg border px-2 py-1 text-xs"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleSong(song.id)}
                      className="rounded-lg border border-rose-200 px-2 py-1 text-xs text-rose-700"
                    >
                      外す
                    </button>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>

        <pre className="overflow-x-auto rounded-2xl bg-violet-950 p-4 text-sm leading-6 text-violet-50">
          {exportText}
        </pre>
      </section>

      <section>
        <h3 className="mb-3 text-lg font-bold text-violet-950">曲を追加</h3>
        <ExternalSongSearch
          librarySongs={data.songs}
          importLabel="追加してセトリへ"
          className="mb-4"
          onImport={(song) => {
            const nextData = upsertSong(data, song);
            onDataChange(nextData);
            setSongIds((current) =>
              current.includes(song.id) ? current : [...current, song.id],
            );
          }}
        />
        <div className="mb-4 rounded-2xl border border-violet-100 bg-white/90 p-4 shadow-sm">
          <label className="grid gap-1 text-sm font-semibold text-violet-900">
            登録曲から曲名で検索
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="曲名・アーティスト・タグ"
              className="rounded-xl border border-violet-200 px-3 py-2"
              autoComplete="off"
            />
          </label>
          <p className="mt-2 text-xs text-violet-600">
            {searchQuery.trim()
              ? `${filteredAvailableSongs.length}件ヒット（未追加 ${availableSongs.length}曲）`
              : `未追加の曲: ${availableSongs.length}曲`}
          </p>
        </div>
        {searchQuery.trim() &&
        filteredAvailableSongs.length === 0 &&
        availableSongs.length > 0 ? (
          <p className="rounded-2xl border border-dashed border-violet-200 bg-violet-50/60 px-4 py-6 text-center text-sm text-violet-700">
            「{searchQuery.trim()}」に一致する曲がありません。
          </p>
        ) : (
          <SongList
            songs={filteredAvailableSongs}
            selectedIds={songIds}
            onAddToSetlist={toggleSong}
          />
        )}
      </section>
    </div>
  );
}
