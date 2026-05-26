"use client";

import Link from "next/link";
import CopySetlistButton from "@/components/CopySetlistButton";
import {
  formatDuration,
  formatSetlistText,
  getSetlistDuration,
} from "@/lib/setlist-engine";
import { removeSetlist } from "@/lib/storage";
import { useAppData } from "@/lib/use-app-data";

export default function SetlistsPage() {
  const { data, setData, ready } = useAppData();

  if (!ready) {
    return <main className="mx-auto max-w-3xl px-4 py-8">読み込み中...</main>;
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black text-violet-950">保存したセトリ</h1>
          <p className="mt-1 text-sm font-semibold text-violet-800">
            カラオケ・歌練習・配信など、作ったセトリを再利用
          </p>
          <p className="mt-2 text-sm text-violet-700">
            {data.setlists.length}件保存されています
          </p>
        </div>
        <Link
          href="/builder"
          className="inline-flex items-center justify-center rounded-xl bg-violet-600 px-4 py-2 text-sm font-bold text-white"
        >
          新規作成
        </Link>
      </header>

      {data.setlists.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-violet-200 px-4 py-8 text-center text-sm text-violet-600">
          まだセトリがありません。作成ページからセトリを保存してください。
        </p>
      ) : (
        <ul className="grid gap-4">
          {[...data.setlists]
            .sort(
              (a, b) =>
                new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
            )
            .map((setlist) => {
              const duration = getSetlistDuration(setlist, data.songs);
              const text = formatSetlistText(setlist, data.songs);
              return (
                <li
                  key={setlist.id}
                  className="rounded-2xl border border-violet-100 bg-white/90 p-5 shadow-md"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-bold text-violet-950">{setlist.name}</h2>
                      {setlist.theme ? (
                        <p className="mt-1 text-sm text-violet-700">{setlist.theme}</p>
                      ) : null}
                      <p className="mt-2 text-xs text-violet-500">
                        {setlist.songIds.length}曲 / {formatDuration(duration)}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/builder?id=${setlist.id}`}
                        className="inline-flex items-center justify-center rounded-lg border border-violet-200 px-3 py-1.5 text-xs font-semibold"
                      >
                        編集
                      </Link>
                      <CopySetlistButton text={text} label="コピー" />
                      <a
                        href={`/overlay?id=${encodeURIComponent(setlist.id)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center rounded-lg border border-indigo-200 px-3 py-1.5 text-xs font-semibold text-indigo-800"
                      >
                        操作
                      </a>
                      <button
                        type="button"
                        onClick={() => {
                          if (!window.confirm("このセトリを削除しますか？")) return;
                          setData(removeSetlist(data, setlist.id));
                        }}
                        className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-700"
                      >
                        削除
                      </button>
                    </div>
                  </div>
                  <pre className="mt-4 overflow-x-auto rounded-xl bg-violet-950/95 p-3 text-xs leading-6 text-violet-50">
                    {text}
                  </pre>
                </li>
              );
            })}
        </ul>
      )}
    </main>
  );
}
