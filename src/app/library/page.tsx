"use client";

import { useMemo, useState } from "react";
import ExternalSongSearch from "@/components/ExternalSongSearch";
import RegisteredSongsPanel from "@/components/RegisteredSongsPanel";
import SongForm from "@/components/SongForm";
import { filterSongsByQuery } from "@/lib/setlist-engine";
import { importSongsFromHits } from "@/lib/song-import";
import { removeSong, upsertSong } from "@/lib/storage";
import { useAppData } from "@/lib/use-app-data";
import type { Song } from "@/types/setlist";

export default function LibraryPage() {
  const { data, setData, ready } = useAppData();
  const [editing, setEditing] = useState<Song | null>(null);
  const [libraryQuery, setLibraryQuery] = useState("");

  const filteredSongs = useMemo(
    () => filterSongsByQuery(data.songs, libraryQuery),
    [data.songs, libraryQuery],
  );

  if (!ready) {
    return <PageShell>読み込み中...</PageShell>;
  }

  return (
    <PageShell>
      <header className="mb-6">
        <h1 className="text-3xl font-black text-violet-950">曲庫</h1>
        <p className="mt-1 text-sm font-semibold text-violet-800">
          カラオケや歌練習で歌う曲を登録・管理します
        </p>
        <p className="mt-2 text-sm text-violet-700">
          上で曲を取り込み・登録、下（PC では右）で登録曲を検索・編集できます。
        </p>
      </header>

      <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-2">
        <div className="grid min-w-0 gap-6">
          <ExternalSongSearch
            librarySongs={data.songs}
            onImport={(song) => setData(upsertSong(data, song))}
            onImportMany={(hits) => {
              const { data: next, added } = importSongsFromHits(data, hits);
              setData(next);
              window.alert(`${added}曲を曲庫に追加しました`);
            }}
          />

          <section>
            <h2 className="mb-3 text-xl font-bold text-violet-950">手入力で登録</h2>
            <SongForm
              key={editing?.id ?? "new"}
              initial={editing ?? undefined}
              onSave={(song) => {
                setData(upsertSong(data, song));
                setEditing(null);
              }}
              onCancel={editing ? () => setEditing(null) : undefined}
            />
          </section>
        </div>

        <RegisteredSongsPanel
          songs={filteredSongs}
          totalCount={data.songs.length}
          searchQuery={libraryQuery}
          onSearchQueryChange={setLibraryQuery}
          onEdit={setEditing}
          onDelete={(songId) => {
            if (!window.confirm("この曲を削除しますか？")) return;
            setData(removeSong(data, songId));
            if (editing?.id === songId) setEditing(null);
          }}
        />
      </div>
    </PageShell>
  );
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8">{children}</main>
  );
}
