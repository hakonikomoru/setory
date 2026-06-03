"use client";

import CopySetlistButton from "@/components/CopySetlistButton";
import RowActionButton, { RowActionLink } from "@/components/RowActionButton";
import SetlistSongDisplay from "@/components/SetlistSongDisplay";
import { formatDuration, formatSetlistText, getSetlistDuration } from "@/lib/setlist-engine";
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
          <p className="mt-2 text-sm text-violet-700">{data.setlists.length}件保存されています</p>
        </div>
        <RowActionLink href="/builder" variant="primary">
          新規作成
        </RowActionLink>
      </header>

      {data.setlists.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-violet-200 px-4 py-8 text-center text-sm text-violet-600">
          まだセトリがありません。作成ページからセトリを保存してください。
        </p>
      ) : (
        <ul className="grid gap-4">
          {[...data.setlists]
            .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
            .map((setlist) => {
              const duration = getSetlistDuration(setlist, data.songs);
              const copyText = formatSetlistText(setlist, data.songs);
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
                      <RowActionLink href={`/builder?id=${setlist.id}`} variant="secondary">
                        編集
                      </RowActionLink>
                      <CopySetlistButton text={copyText} label="コピー" />
                      <RowActionButton
                        type="button"
                        variant="danger"
                        onClick={() => {
                          if (!window.confirm("このセトリを削除しますか？")) return;
                          setData(removeSetlist(data, setlist.id));
                        }}
                      >
                        削除
                      </RowActionButton>
                    </div>
                  </div>
                  <SetlistSongDisplay className="mt-4" setlist={setlist} songs={data.songs} />
                </li>
              );
            })}
        </ul>
      )}
    </main>
  );
}
