"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { suggestSetlistSongs } from "@/lib/setlist-engine";
import { createId } from "@/lib/storage";
import { useAppData } from "@/lib/use-app-data";
import type { SuggestOptions } from "@/types/setlist";

export default function SuggestPage() {
  const router = useRouter();
  const { data, setData, ready } = useAppData();
  const [theme, setTheme] = useState("アニソン定番");
  const [targetMinutes, setTargetMinutes] = useState("45");
  const [tags, setTags] = useState("アニソン, 定番");
  const [moodFlow, setMoodFlow] =
    useState<SuggestOptions["moodFlow"]>("warmup-peak-cooldown");
  const [preview, setPreview] = useState<string[]>([]);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const songs = suggestSetlistSongs(data.songs, {
      theme,
      targetMinutes: Number(targetMinutes) || 45,
      preferredTags: tags.split(/[,、\s]+/).filter(Boolean),
      moodFlow,
    });
    setPreview(songs.map((song) => `${song.title} / ${song.artist}`));
  }

  function handleApply() {
    const songs = suggestSetlistSongs(data.songs, {
      theme,
      targetMinutes: Number(targetMinutes) || 45,
      preferredTags: tags.split(/[,、\s]+/).filter(Boolean),
      moodFlow,
    });

    const id = createId("setlist");
    const now = new Date().toISOString();
    const next = {
      ...data,
      setlists: [
        ...data.setlists,
        {
          id,
          name: `${theme || "自動提案"}セトリ`,
          theme,
          songIds: songs.map((song) => song.id),
          createdAt: now,
          updatedAt: now,
        },
      ],
    };
    setData(next);
    router.push(`/builder?id=${id}`);
  }

  if (!ready) {
    return <main className="mx-auto max-w-3xl px-4 py-8">読み込み中...</main>;
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8">
      <header className="mb-6">
        <h1 className="text-3xl font-black text-violet-950">自動提案</h1>
        <p className="mt-2 text-sm text-violet-700">
          テーマ・目標尺・タグから曲順を提案します（ローカル計算、APIキー不要）。
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="grid gap-4 rounded-2xl border border-violet-100 bg-white/90 p-5 shadow-lg"
      >
        <label className="grid gap-1 text-sm font-semibold">
          配信テーマ
          <input
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="rounded-xl border border-violet-200 px-3 py-2"
            placeholder="誕生日、切ない回、アニソン縛り"
          />
        </label>
        <label className="grid gap-1 text-sm font-semibold">
          目標尺（分）
          <input
            type="number"
            min={10}
            value={targetMinutes}
            onChange={(e) => setTargetMinutes(e.target.value)}
            className="rounded-xl border border-violet-200 px-3 py-2"
          />
        </label>
        <label className="grid gap-1 text-sm font-semibold">
          優先タグ
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="rounded-xl border border-violet-200 px-3 py-2"
          />
        </label>
        <label className="grid gap-1 text-sm font-semibold">
          曲順の流れ
          <select
            value={moodFlow}
            onChange={(e) =>
              setMoodFlow(e.target.value as SuggestOptions["moodFlow"])
            }
            className="rounded-xl border border-violet-200 px-3 py-2"
          >
            <option value="warmup-peak-cooldown">ウォームアップ → ピーク → 締め</option>
            <option value="steady">じわじわ盛り上げ</option>
            <option value="surprise">ランダム（サプライズ）</option>
          </select>
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-bold text-white"
          >
            プレビュー
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="rounded-xl bg-fuchsia-600 px-4 py-2 text-sm font-bold text-white"
          >
            提案をセトリに反映
          </button>
        </div>
      </form>

      {preview.length > 0 ? (
        <section className="mt-6 rounded-2xl border border-violet-100 bg-white/90 p-5">
          <h2 className="text-lg font-bold text-violet-950">提案プレビュー</h2>
          <ol className="mt-3 grid gap-2 text-sm text-violet-800">
            {preview.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ol>
        </section>
      ) : null}
    </main>
  );
}
