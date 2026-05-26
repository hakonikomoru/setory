"use client";

import { useState } from "react";
import SongForm from "@/components/SongForm";
import SongList from "@/components/SongList";
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
          初回アクセス時はサンプル曲が入っています。自分のレパートリーに差し替えて使ってください。
        </p>
      </header>

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
    <main className="mx-auto w-full max-w-3xl px-4 py-8">{children}</main>
  );
}
