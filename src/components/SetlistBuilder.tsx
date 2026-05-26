"use client";

import { useCallback, useMemo, useState } from "react";
import CopySetlistButton from "@/components/CopySetlistButton";
import ExternalSongSearch from "@/components/ExternalSongSearch";
import RegisteredSongsPanel from "@/components/RegisteredSongsPanel";
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
  /** オーバーレイ操作画面など。変更を即保存する */
  embedded?: boolean;
};

export default function SetlistBuilder({
  data,
  initialSetlist,
  onSave,
  onDataChange,
  embedded = false,
}: Props) {
  const [name, setName] = useState(initialSetlist?.name ?? "新しいセトリ");
  const [theme, setTheme] = useState(initialSetlist?.theme ?? "");
  const [songIds, setSongIds] = useState<string[]>(initialSetlist?.songIds ?? []);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [hideDuration, setHideDuration] = useState(
    initialSetlist?.hideDuration ?? false,
  );
  const [currentSongId, setCurrentSongId] = useState(
    initialSetlist?.currentSongId,
  );

  const draftSetlist: Setlist = useMemo(
    () => ({
      id: initialSetlist?.id ?? createId("setlist"),
      name,
      theme: theme.trim() || undefined,
      hideDuration: hideDuration || undefined,
      currentSongId,
      songIds,
      overlayVisible: initialSetlist?.overlayVisible,
      overlayMode: initialSetlist?.overlayMode,
      overlayTheme: initialSetlist?.overlayTheme,
      createdAt: initialSetlist?.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }),
    [initialSetlist, name, theme, hideDuration, currentSongId, songIds],
  );

  const persistDraft = useCallback(
    (nextDraft: Setlist) => {
      const saved = { ...nextDraft, updatedAt: new Date().toISOString() };
      onDataChange({
        ...data,
        setlists: [
          ...data.setlists.filter((setlist) => setlist.id !== saved.id),
          saved,
        ],
      });
    },
    [data, onDataChange],
  );

  const commitDraft = useCallback(
    (patch: Partial<Setlist>) => {
      persistDraft({ ...draftSetlist, ...patch });
    },
    [draftSetlist, persistDraft],
  );

  const selectedSongs = songIds
    .map((id) => data.songs.find((song) => song.id === id))
    .filter((song): song is Song => Boolean(song));

  const filteredLibrarySongs = useMemo(
    () => filterSongsByQuery(data.songs, searchQuery),
    [data.songs, searchQuery],
  );
  const totalSec = getSetlistDuration(draftSetlist, data.songs);
  const exportText = formatSetlistText(draftSetlist, data.songs);

  function toggleSong(songId: string) {
    const removing = songIds.includes(songId);
    const nextIds = removing
      ? songIds.filter((id) => id !== songId)
      : [...songIds, songId];
    const nextCurrent =
      removing && currentSongId === songId ? undefined : currentSongId;
    setSongIds(nextIds);
    if (nextCurrent !== currentSongId) setCurrentSongId(nextCurrent);
    persistDraft({
      ...draftSetlist,
      songIds: nextIds,
      currentSongId: nextCurrent,
    });
  }

  function setAsCurrentSong(songId: string) {
    setCurrentSongId(songId);
    const index = songIds.indexOf(songId);
    const next: Setlist = { ...draftSetlist, currentSongId: songId };
    if (index === 0) {
      next.overlaySuppressNext = true;
    } else {
      delete next.overlaySuppressNext;
    }
    persistDraft(next);
  }

  function moveSong(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= songIds.length) return;
    const next = [...songIds];
    [next[index], next[target]] = [next[target], next[index]];
    setSongIds(next);
    commitDraft({ songIds: next });
  }

  function handleDrop(targetIndex: number) {
    if (dragIndex === null || dragIndex === targetIndex) return;
    const next = [...songIds];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(targetIndex, 0, moved);
    setSongIds(next);
    setDragIndex(null);
    commitDraft({ songIds: next });
  }

  function handleSave() {
    if (songIds.length === 0) return;
    onSave({
      ...data,
      setlists: [
        ...data.setlists.filter((setlist) => setlist.id !== draftSetlist.id),
        { ...draftSetlist, updatedAt: new Date().toISOString() },
      ],
    });
  }

  return (
    <div className="grid grid-cols-2 items-start gap-6">
      <section className="grid gap-4">
        <div className="rounded-2xl border border-violet-100 bg-white/90 p-5 shadow-lg shadow-violet-100/40">
          <h2 className="text-xl font-bold text-violet-950">セトリ情報</h2>
          <div className="mt-4 grid gap-3">
            <label className="grid gap-1 text-sm font-semibold text-violet-900">
              セトリ名
              <input
                value={name}
                onChange={(e) => {
                  const nextName = e.target.value;
                  setName(nextName);
                  if (embedded) commitDraft({ name: nextName });
                }}
                className="rounded-xl border border-violet-200 px-3 py-2"
              />
            </label>
            <label className="grid gap-1 text-sm font-semibold text-violet-900">
              テーマ・メモ
              <input
                value={theme}
                onChange={(e) => {
                  const nextTheme = e.target.value;
                  setTheme(nextTheme);
                  if (embedded) {
                    commitDraft({
                      theme: nextTheme.trim() || undefined,
                    });
                  }
                }}
                className="rounded-xl border border-violet-200 px-3 py-2"
                placeholder="誕生日配信、切ない回 など"
              />
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-violet-900">
              <input
                type="checkbox"
                checked={hideDuration}
                onChange={(e) => {
                  const next = e.target.checked;
                  setHideDuration(next);
                  if (embedded) commitDraft({ hideDuration: next || undefined });
                }}
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
            {embedded ? (
              <p className="text-sm text-violet-600">
                曲順・セトリ情報の変更は自動で保存されます
              </p>
            ) : (
              <button
                type="button"
                onClick={handleSave}
                disabled={songIds.length === 0}
                className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-40"
              >
                セトリを保存
              </button>
            )}
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
            <ol className="grid max-h-[min(18rem,40vh)] gap-2 overflow-y-auto overscroll-contain px-1 py-1">
              {selectedSongs.map((song, index) => {
                const isCurrent = currentSongId === song.id;
                return (
                <li
                  key={song.id}
                  draggable
                  onDragStart={() => setDragIndex(index)}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={() => handleDrop(index)}
                  className={`flex items-start gap-3 rounded-xl border px-3 py-2 ${
                    isCurrent
                      ? "border-violet-500 bg-violet-100 ring-2 ring-inset ring-violet-400"
                      : "border-fuchsia-200 bg-fuchsia-50/70"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="break-words font-bold leading-snug text-violet-950">
                      {index + 1}. {song.title}
                      {isCurrent ? (
                        <span className="ml-2 inline-block rounded-full bg-violet-600 px-2 py-0.5 text-xs font-bold text-white">
                          現在
                        </span>
                      ) : null}
                    </p>
                    <p className="mt-0.5 break-words text-sm leading-snug text-violet-700">
                      {hideDuration
                        ? song.artist
                        : `${song.artist}（${formatDuration(song.durationSec)}）`}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center justify-end gap-1 self-start">
                    <button
                      type="button"
                      onClick={() => setAsCurrentSong(song.id)}
                      className={`rounded-lg border px-2 py-1 text-xs font-semibold ${
                        isCurrent
                          ? "border-violet-600 bg-violet-600 text-white"
                          : "border-violet-300 text-violet-800"
                      }`}
                    >
                      {isCurrent ? "歌唱中" : "現在の曲"}
                    </button>
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
              );
              })}
            </ol>
          )}
        </div>

        {!embedded ? (
          <pre className="overflow-x-auto rounded-2xl bg-violet-950 p-4 text-sm leading-6 text-violet-50">
            {exportText}
          </pre>
        ) : null}
      </section>

      <section className="grid min-w-0 gap-4">
        <ExternalSongSearch
          librarySongs={data.songs}
          importTarget="libraryAndSetlist"
          setlistSongIds={songIds}
          importLabel="セトリに追加"
          onImport={(song) => {
            const nextData = upsertSong(data, song);
            const nextIds = songIds.includes(song.id)
              ? songIds
              : [...songIds, song.id];
            onDataChange({
              ...nextData,
              setlists: [
                ...nextData.setlists.filter((s) => s.id !== draftSetlist.id),
                {
                  ...draftSetlist,
                  songIds: nextIds,
                  updatedAt: new Date().toISOString(),
                },
              ],
            });
            setSongIds(nextIds);
          }}
        />
        <RegisteredSongsPanel
          sticky={!embedded}
          songs={filteredLibrarySongs}
          totalCount={data.songs.length}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          selectedIds={songIds}
          onAddToSetlist={toggleSong}
          emptyLibraryMessage="登録曲がありません。上の検索で取り込むか、曲庫ページで追加してください。"
        />
      </section>
    </div>
  );
}
