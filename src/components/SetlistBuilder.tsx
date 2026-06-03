"use client";

import { useCallback, useMemo, useState } from "react";
import CopySetlistButton from "@/components/CopySetlistButton";
import RowActionButton from "@/components/RowActionButton";
import ExternalSongSearch from "@/components/ExternalSongSearch";
import RegisteredSongsPanel from "@/components/RegisteredSongsPanel";
import SongAddTabs, { type SongAddTab } from "@/components/SongAddTabs";
import SongForm from "@/components/SongForm";
import TemplateSongImport from "@/components/TemplateSongImport";
import {
  filterSongsByQuery,
  formatDuration,
  formatSetlistText,
  formatSongDurationLabel,
  getSetlistDuration,
} from "@/lib/setlist-engine";
import { findSongInLibrary } from "@/lib/song-match";
import { createId, upsertSong } from "@/lib/storage";
import type { SetAppData } from "@/lib/use-app-data";
import type { AppData, Setlist, Song } from "@/types/setlist";

type Props = {
  data: AppData;
  initialSetlist?: Setlist;
  onSave: (data: AppData) => void;
  onDataChange: SetAppData;
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
  const [addTab, setAddTab] = useState<SongAddTab>("search");

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
      onDataChange((prev) => ({
        ...prev,
        setlists: [...prev.setlists.filter((setlist) => setlist.id !== saved.id), saved],
      }));
    },
    [embedded, onDataChange],
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
    () => filterSongsByQuery(data.songs, searchQuery).filter((song) => !songIds.includes(song.id)),
    [data.songs, searchQuery, songIds],
  );

  const librarySongsForPanel = useMemo(
    () => filterSongsByQuery(data.songs, searchQuery),
    [data.songs, searchQuery],
  );
  const totalSec = getSetlistDuration(draftSetlist, data.songs);
  const exportText = formatSetlistText(draftSetlist, data.songs);

  function addSongsToLibraryAndSetlist(songs: Song[]) {
    if (songs.length === 0) return;

    const setlistId = draftSetlist.id;
    let nextIds: string[] = songIds;

    onDataChange((prev) => {
      let nextData = prev;
      const prevSetlist = prev.setlists.find((s) => s.id === setlistId);
      let ids = [...(prevSetlist?.songIds ?? songIds)];

      for (const song of songs) {
        const existing = findSongInLibrary(nextData.songs, song.title, song.artist);
        const toUse = existing ?? song;
        if (!existing) nextData = upsertSong(nextData, toUse);
        if (!ids.includes(toUse.id)) ids = [...ids, toUse.id];
      }

      nextIds = ids;

      if (!embedded) return nextData;

      return {
        ...nextData,
        setlists: [
          ...nextData.setlists.filter((s) => s.id !== setlistId),
          {
            ...draftSetlist,
            songIds: ids,
            updatedAt: new Date().toISOString(),
          },
        ],
      };
    });

    setSongIds(nextIds);
  }

  function addSongToLibraryAndSetlist(song: Song) {
    addSongsToLibraryAndSetlist([song]);
  }

  function toggleSong(songId: string) {
    const removing = songIds.includes(songId);
    const nextIds = removing ? songIds.filter((id) => id !== songId) : [...songIds, songId];
    const nextCurrent =
      embedded && removing && currentSongId === songId ? undefined : currentSongId;
    setSongIds(nextIds);
    if (embedded && nextCurrent !== currentSongId) setCurrentSongId(nextCurrent);
    persistDraft({
      ...draftSetlist,
      songIds: nextIds,
      ...(embedded ? { currentSongId: nextCurrent } : {}),
    });
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
              {hideDuration || totalSec <= 0 ? null : <> / 合計 {formatDuration(totalSec)}</>}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {embedded ? (
                <p className="text-sm text-violet-600">
                  曲順・セトリ情報の変更は自動で保存されます
                </p>
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
                  return (
                    <li
                      key={song.id}
                      draggable
                      onDragStart={() => setDragIndex(index)}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={() => handleDrop(index)}
                      className="flex items-start gap-3 rounded-xl border border-fuchsia-200 bg-fuchsia-50/70 px-3 py-2"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="leading-snug font-bold break-words text-violet-950">
                          {index + 1}. {song.title}
                        </p>
                        {hideArtist ? (
                          hideDuration || song.durationSec <= 0 ? null : (
                            <p className="mt-0.5 text-sm leading-snug break-words text-violet-700">
                              {formatDuration(song.durationSec)}
                            </p>
                          )
                        ) : (
                          <p className="mt-0.5 text-sm leading-snug break-words text-violet-700">
                            {hideDuration
                              ? song.artist
                              : `${song.artist}${formatSongDurationLabel(song.durationSec)}`}
                          </p>
                        )}
                      </div>
                      <div className="flex shrink-0 items-center gap-1.5 self-start">
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
        </section>

        <SongAddTabs
          idPrefix={embedded ? "overlay-add" : "builder-add"}
          activeTab={embedded ? addTab : undefined}
          onTabChange={embedded ? setAddTab : undefined}
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
          templateHint={
            embedded
              ? "登録曲（曲庫）に保存したうえで、セトリの末尾に一括追加します。"
              : "曲庫に登録し、セトリの末尾に一括追加します。"
          }
          templatePanel={
            <TemplateSongImport
              librarySongs={data.songs}
              addButtonLabel={embedded ? "セトリに追加" : "追加"}
              onAdd={addSongToLibraryAndSetlist}
              onImportMany={({ resolved }) => addSongsToLibraryAndSetlist(resolved)}
              onAfterAdd={embedded ? () => setAddTab("registered") : undefined}
            />
          }
          {...(embedded
            ? {
                registeredHint:
                  "登録曲一覧からセトリに追加できます。未追加の曲を上に表示し、追加済みは「追加済み」です。",
                registeredPanel: (
                  <RegisteredSongsPanel
                    sticky={false}
                    showHeader={false}
                    songs={librarySongsForPanel}
                    totalCount={data.songs.length}
                    selectedIds={songIds}
                    searchQuery={searchQuery}
                    onSearchQueryChange={setSearchQuery}
                    onAddToSetlist={(songId) => {
                      if (!songIds.includes(songId)) toggleSong(songId);
                    }}
                    emptyLibraryMessage="登録曲がありません。他のタブから曲を追加してください。"
                  />
                ),
              }
            : {})}
        />

        {!embedded ? (
          <RegisteredSongsPanel
            sticky={false}
            songs={addableLibrarySongs}
            totalCount={addableSongCount}
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            onAddToSetlist={(songId) => {
              if (!songIds.includes(songId)) toggleSong(songId);
            }}
            emptyLibraryMessage={
              data.songs.length === 0
                ? "登録曲がありません。上の検索または手入力で追加してください。"
                : "登録曲はすべてセトリに追加済みです。曲順から外すとここに再表示されます。"
            }
          />
        ) : null}
      </div>
    </div>
  );
}
