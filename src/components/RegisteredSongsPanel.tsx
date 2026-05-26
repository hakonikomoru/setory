"use client";

import SongList from "@/components/SongList";
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
  searchPlaceholder = "曲名・アーティスト・タグ",
  onEdit,
  onDelete,
  onAddToSetlist,
  selectedIds,
  emptyLibraryMessage = "まだ登録曲がありません。左の検索または手入力で追加してください。",
}: Props) {
  const trimmedQuery = searchQuery.trim();

  return (
    <aside className={sticky ? "sticky top-4 min-w-0" : "min-w-0"}>
      <h2 className="text-xl font-bold text-violet-950">
        {title}（{totalCount}曲）
      </h2>
      <div className="mt-3 rounded-2xl border border-violet-100 bg-white/90 p-4 shadow-sm">
        <label className="grid gap-1 text-sm font-semibold text-violet-900">
          曲名で検索
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="rounded-xl border border-violet-200 px-3 py-2"
            autoComplete="off"
          />
        </label>
        <p className="mt-2 text-xs text-violet-600">
          {trimmedQuery
            ? `${songs.length}件表示（全${totalCount}曲）`
            : `全${totalCount}曲を表示`}
        </p>
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
              layout="grid"
              songs={songs}
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
