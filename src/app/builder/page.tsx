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
      onSave={(next) => {
        setData(next);
        window.alert("セトリを保存しました");
      }}
    />
  );
}

export default function BuilderPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8">
      <header className="mb-6">
        <h1 className="text-3xl font-black text-violet-950">セトリ作成</h1>
        <p className="mt-2 text-sm text-violet-700">
          曲を選んで並べ替え、配信概要欄やX投稿用のテキストをコピーできます。
        </p>
      </header>
      <Suspense fallback={<p>読み込み中...</p>}>
        <BuilderContent />
      </Suspense>
    </main>
  );
}
