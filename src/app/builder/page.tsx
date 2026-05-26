"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import SetlistBuilder from "@/components/SetlistBuilder";
import { useAppData } from "@/lib/use-app-data";

function BuilderContent() {
  const { data, setData, ready } = useAppData();
  const searchParams = useSearchParams();
  const setlistId = searchParams.get("id");
  const initialSetlist = setlistId
    ? data.setlists.find((setlist) => setlist.id === setlistId)
    : undefined;

  if (!ready) {
    return <p>読み込み中...</p>;
  }

  return (
    <SetlistBuilder
      key={initialSetlist?.id ?? "new"}
      data={data}
      initialSetlist={initialSetlist}
      onDataChange={setData}
      onSave={(next) => {
        setData(next);
        window.alert("セトリを保存しました");
      }}
    />
  );
}

export default function BuilderPage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8">
      <header className="mb-6">
        <h1 className="text-3xl font-black text-violet-950">セトリ作成</h1>
        <p className="mt-1 text-sm font-semibold text-violet-800">
          カラオケ・歌練習・配信など、歌う曲順を組み立てます
        </p>
        <p className="mt-2 text-sm text-violet-700">
          上でセトリを編集、下（PC では右）の登録曲一覧から追加できます。並べ替え後にコピー用テキストを出力します。
        </p>
      </header>
      <Suspense fallback={<p>読み込み中...</p>}>
        <BuilderContent />
      </Suspense>
    </main>
  );
}
