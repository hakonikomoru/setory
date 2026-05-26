"use client";

import { useCallback, useMemo, useState } from "react";
import CopySetlistButton from "@/components/CopySetlistButton";
import RowActionButton from "@/components/RowActionButton";
import ExternalSongSearch from "@/components/ExternalSongSearch";
import RegisteredSongsPanel from "@/components/RegisteredSongsPanel";
import SongAddTabs from "@/components/SongAddTabs";
import SongForm from "@/components/SongForm";
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
  const [hideDuration, setHideDuration] = useState(initialSetlist?.hideDuration ?? false);
  const [hideArtist, setHideArtist] = useState(initialSetlist?.hideArtist ?? false);
  const [currentSongId, setCurrentSongId] = useState(initialSetlist?.currentSongId);

  const draftSetlist: Setlist = useMemo(
    () => ({
      id: initialSetlist?.id ?? createId("setlist"),
      name,
      theme: theme.trim() || undefined,
      hideDuration: hideDuration || undefined,
      hideArtist: hideArtist || undefined,
      currentSongId,
      songIds,
      overlayVisible: initialSetlist?.overlayVisible,
      overlayMode: initialSetlist?.overlayMode,
      overlayTheme: initialSetlist?.overlayTheme,
      createdAt: initialSetlist?.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }),
    [initialSetlist, name, theme, hideDuration, hideArtist, currentSongId, songIds],
  );

  const persistDraft = useCallback(
    (nextDraft: Setlist) => {
      if (!embedded) return;
      const saved = { ...nextDraft, updatedAt: new Date().toISOString() };
      onDataChange({
        ...data,
        setlists: [...data.setlists.filter((setlist) => setlist.id !== saved.id), saved],
      });
    },
    [data, embedded, onDataChange],
  );

  const commitDraft = useCallback(
    (patch: Partial<Setlist>) => {
      if (!embedded) return;
      persistDraft({ ...draftSetlist, ...patch });
    },
    [draftSetlist, embedded, persistDraft],
  );

  const selectedSongs = songIds
    .map((id) => data.songs.find((song) => song.id === id))
    .filter((song): song is Song => Boolean(song));

  const addableSongCount = useMemo(
    () => data.songs.filter((song) => !songIds.includes(song.id)).length,
    [data.songs, songIds],
  );

  const addableLibrarySongs = useMemo(
    () =>
      filterSongsByQuery(data.songs, searchQuery).filter((song) => !songIds.includes(song.id)),
    [data.songs, searchQuery, songIds],
  );

  const librarySongsForPanel = useMemo(
    () => filterSongsByQuery(data.songs, searchQuery),
    [data.songs, searchQuery],
  );
  const totalSec = getSetlistDuration(draftSetlist, data.songs);
  const exportText = formatSetlistText(draftSetlist, data.songs);

  function addSongToLibraryAndSetlist(song: Song) {
    const nextData = upsertSong(data, song);
    const nextIds = songIds.includes(song.id) ? songIds : [...songIds, song.id];
    setSongIds(nextIds);
    if (embedded) {
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
    } else {
      onDataChange(nextData);
    }
  }

  function toggleSong(songId: string) {
    const removing = songIds.includes(songId);
    const nextIds = removing ? songIds.filter((id) => id !== songId) : [...songIds, songId];
    const nextCurrent = removing && currentSongId === songId ? undefined : currentSongId;
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
    <div className="grid gap-6">
      <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-2">
        <section className="grid gap-4">
          <h2 className="text-xl font-bold text-violet-950">セトリ情報</h2>
          <div className="rounded-2xl border border-violet-100 bg-white/90 p-5 shadow-lg shadow-violet-100/40">
            <div className="grid gap-3">
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
                placeholder="カラオケ練習、誕生日配信、切ない回 など"
              />
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-violet-900">
              <input
                type="checkbox"
                checked={hideArtist}
                onChange={(e) => {
                  const next = e.target.checked;
                  setHideArtist(next);
                  if (embedded) commitDraft({ hideArtist: next || undefined });
                }}
                className="size-4 rounded border-violet-300"
              />
              アーティスト名を表示しない（コピー用テキスト・曲順一覧）
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
              <p className="text-sm text-violet-600">曲順・セトリ情報の変更は自動で保存されます</p>
            ) : (
              <RowActionButton
                type="button"
                variant="primary"
                onClick={handleSave}
                disabled={songIds.length === 0}
              >
                セトリを保存
              </RowActionButton>
            )}
            <CopySetlistButton text={exportText} />
            </div>
          </div>

          <h3 className="text-lg font-bold text-violet-950">曲順（ドラッグで並べ替え）</h3>
          <div>
          {selectedSongs.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-violet-200 px-4 py-6 text-center text-sm text-violet-600">
              下の登録曲一覧から追加してください。
            </p>
          ) : (
            <ol className="grid gap-2 px-1 py-1">
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
                        ? "border-violet-500 bg-violet-100 ring-2 ring-violet-400 ring-inset"
                        : "border-fuchsia-200 bg-fuchsia-50/70"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="leading-snug font-bold break-words text-violet-950">
                        {index + 1}. {song.title}
                        {isCurrent ? (
                          <span className="ml-2 inline-block rounded-full bg-violet-600 px-2 py-0.5 text-xs font-bold text-white">
                            現在
                          </span>
                        ) : null}
                      </p>
                      {hideArtist ? (
                        hideDuration ? null : (
                          <p className="mt-0.5 text-sm leading-snug break-words text-violet-700">
                            {formatDuration(song.durationSec)}
                          </p>
                        )
                      ) : (
                        <p className="mt-0.5 text-sm leading-snug break-words text-violet-700">
                          {hideDuration
                            ? song.artist
                            : `${song.artist}（${formatDuration(song.durationSec)}）`}
                        </p>
                      )}
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5 self-start">
                      <RowActionButton
                        type="button"
                        variant={isCurrent ? "accent" : "secondary"}
                        size="sm"
                        onClick={() => setAsCurrentSong(song.id)}
                      >
                        {isCurrent ? "歌唱中" : "現在の曲"}
                      </RowActionButton>
                      <RowActionButton
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label="上へ移動"
                        onClick={() => moveSong(index, -1)}
                      >
                        ↑
                      </RowActionButton>
                      <RowActionButton
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label="下へ移動"
                        onClick={() => moveSong(index, 1)}
                      >
                        ↓
                      </RowActionButton>
                      <RowActionButton
                        type="button"
                        variant="danger"
                        size="sm"
                        onClick={() => toggleSong(song.id)}
                      >
                        外す
                      </RowActionButton>
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

        <SongAddTabs
          idPrefix={embedded ? "overlay-add" : "builder-add"}
          manualTabLabel={embedded ? "手入力でセトリに追加" : undefined}
          manualHint={
            embedded
              ? "曲名・アーティスト・尺を入力すると、登録曲（曲庫）に保存したうえでセトリに追加します。"
              : "曲名・アーティスト・尺などを直接入力して曲庫に登録し、セトリにも追加します。"
          }
          searchPanel={
            <ExternalSongSearch
              showTitle={false}
              librarySongs={data.songs}
              importTarget="libraryAndSetlist"
              setlistSongIds={songIds}
              importLabel="セトリに追加"
              onImport={addSongToLibraryAndSetlist}
            />
          }
          manualPanel={
            <SongForm
              saveIntent={embedded ? "setlist" : "library"}
              onSave={addSongToLibraryAndSetlist}
            />
          }
        />
      </div>

      <RegisteredSongsPanel
        sticky={false}
        songs={embedded ? librarySongsForPanel : addableLibrarySongs}
        totalCount={embedded ? data.songs.length : addableSongCount}
        selectedIds={embedded ? songIds : undefined}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        onAddToSetlist={(songId) => {
          if (!songIds.includes(songId)) toggleSong(songId);
        }}
        emptyLibraryMessage={
          data.songs.length === 0
            ? embedded
              ? "登録曲がありません。上の検索または手入力でセトリに追加してください。"
              : "登録曲がありません。上の検索または手入力で追加してください。"
            : "登録曲はすべてセトリに追加済みです。曲順から外すとここに再表示されます。"
        }
      />
    </div>
  );
}
