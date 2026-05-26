"use client";

import { useMemo, useState } from "react";
import SearchInput from "@/components/SearchInput";
import SongList from "@/components/SongList";
import { sortSongsByCreatedAt, type SongListSortOrder } from "@/lib/setlist-engine";
import type { Song } from "@/types/setlist";

type Props = {
  songs: Song[];
  totalCount: number;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  title?: string;
  sticky?: boolean;
  searchPlaceholder?: string;
  onEdit?: (song: Song) => void;
  onDelete?: (songId: string) => void;
  onAddToSetlist?: (songId: string) => void;
  selectedIds?: string[];
  emptyLibraryMessage?: string;
};

export default function RegisteredSongsPanel({
  songs,
  totalCount,
  searchQuery,
  onSearchQueryChange,
  title = "登録曲",
  sticky = true,
  searchPlaceholder = "曲名・アーティスト",
  onEdit,
  onDelete,
  onAddToSetlist,
  selectedIds,
  emptyLibraryMessage = "まだ登録曲がありません。左の検索または手入力で追加してください。",
}: Props) {
  const trimmedQuery = searchQuery.trim();
  const [sortOrder, setSortOrder] = useState<SongListSortOrder>("desc");
  const sortedSongs = useMemo(() => sortSongsByCreatedAt(songs, sortOrder), [songs, sortOrder]);

  return (
    <aside className={sticky ? "min-w-0 md:sticky md:top-4" : "min-w-0"}>
      <header>
        <h2 className="text-xl font-bold text-violet-950">
          {title}（{totalCount}曲）
        </h2>
      </header>
      <div className="mt-3 rounded-2xl border border-violet-100 bg-white/90 p-4 shadow-sm">
        <label className="grid gap-1 text-sm font-semibold text-violet-900">
          曲名で検索
          <SearchInput
            value={searchQuery}
            onChange={onSearchQueryChange}
            placeholder={searchPlaceholder}
          />
        </label>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-violet-600">
            {trimmedQuery ? `${songs.length}件表示（全${totalCount}曲）` : `全${totalCount}曲を表示`}
          </p>
          <div className="flex items-center gap-1" role="group" aria-label="追加順で並べ替え">
            <span className="text-xs font-semibold text-violet-700">追加順</span>
            {(
              [
                { value: "asc" as const, label: "古い" },
                { value: "desc" as const, label: "新しい" },
              ] as const
            ).map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setSortOrder(item.value)}
                className={`rounded-full px-2.5 py-1 text-xs font-semibold transition ${
                  sortOrder === item.value
                    ? "bg-violet-600 text-white"
                    : "border border-violet-200 bg-white text-violet-800 hover:bg-violet-50"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-4">
        {totalCount === 0 ? (
          <p className="rounded-2xl border border-dashed border-violet-200 bg-violet-50/60 px-4 py-6 text-center text-sm text-violet-700">
            {emptyLibraryMessage}
          </p>
        ) : songs.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-violet-200 bg-violet-50/60 px-4 py-6 text-center text-sm text-violet-700">
            「{trimmedQuery}」に一致する曲がありません。
          </p>
        ) : (
          <div className="max-h-[calc(100vh-10rem)] overflow-y-auto overscroll-contain px-1 py-1">
            <SongList
              layout="list"
              songs={sortedSongs}
              selectedIds={selectedIds}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddToSetlist={onAddToSetlist}
            />
          </div>
        )}
      </div>
    </aside>
  );
}
