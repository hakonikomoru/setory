"use client";

import { useState } from "react";
import ExternalSongSearch from "@/components/ExternalSongSearch";
import StarterPackImport from "@/components/StarterPackImport";
import SongForm from "@/components/SongForm";
import SongList from "@/components/SongList";
import { importSongsFromHits } from "@/lib/song-import";
import { removeSong, upsertSong } from "@/lib/storage";
import { useAppData } from "@/lib/use-app-data";
import type { Song } from "@/types/setlist";

export default function LibraryPage() {
  const { data, setData, ready } = useAppData();
  const [editing, setEditing] = useState<Song | null>(null);

  if (!ready) {
    return <PageShell>読み込み中...</PageShell>;
  }

  return (
    <PageShell>
      <header className="mb-6">
        <h1 className="text-3xl font-black text-violet-950">曲庫</h1>
        <p className="mt-2 text-sm text-violet-700">
          MusicBrainz から曲を検索して取り込むか、手入力で自分のレパートリーを登録できます。
        </p>
      </header>

      <StarterPackImport data={data} onDataChange={setData} />

      <ExternalSongSearch
        className="mt-6"
        librarySongs={data.songs}
        onImport={(song) => setData(upsertSong(data, song))}
        onImportMany={(hits) => {
          const { data: next, added } = importSongsFromHits(data, hits);
          setData(next);
          window.alert(`${added}曲を曲庫に追加しました`);
        }}
      />

      <h2 className="mb-3 mt-8 text-xl font-bold text-violet-950">手入力で登録</h2>
      <SongForm
        key={editing?.id ?? "new"}
        initial={editing ?? undefined}
        onSave={(song) => {
          setData(upsertSong(data, song));
          setEditing(null);
        }}
        onCancel={editing ? () => setEditing(null) : undefined}
      />

      <div className="mt-8">
        <h2 className="mb-3 text-xl font-bold text-violet-950">
          登録曲（{data.songs.length}曲）
        </h2>
        <SongList
          songs={data.songs}
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
    <main className="mx-auto w-full max-w-4xl px-4 py-8">{children}</main>
  );
}
