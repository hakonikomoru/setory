"use client";

import { FormEvent, useState } from "react";
import { createId } from "@/lib/storage";
import { parseTagsInput } from "@/lib/setlist-engine";
import type { Song, SongMood } from "@/types/setlist";

type Props = {
  initial?: Song;
  onSave: (song: Song) => void;
  onCancel?: () => void;
};

const MOODS: { value: SongMood; label: string }[] = [
  { value: "upbeat", label: "盛り上がり" },
  { value: "mid", label: "中間" },
  { value: "ballad", label: "バラード" },
];

export default function SongForm({ initial, onSave, onCancel }: Props) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [artist, setArtist] = useState(initial?.artist ?? "");
  const [minutes, setMinutes] = useState(
    initial ? String(Math.floor(initial.durationSec / 60)) : "4",
  );
  const [seconds, setSeconds] = useState(initial ? String(initial.durationSec % 60) : "0");
  const [mood, setMood] = useState<SongMood>(initial?.mood ?? "mid");
  const [tags, setTags] = useState(initial?.tags.join("、") ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const durationSec = Math.max(0, Number(minutes) || 0) * 60 + Math.max(0, Number(seconds) || 0);

    if (!title.trim() || !artist.trim() || durationSec <= 0) return;

    onSave({
      id: initial?.id ?? createId("song"),
      title: title.trim(),
      artist: artist.trim(),
      durationSec,
      mood,
      tags: parseTagsInput(tags),
      notes: notes.trim() || undefined,
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-4 rounded-2xl border border-violet-100 bg-white/90 p-5 shadow-lg shadow-violet-100/50"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1 text-sm font-semibold text-violet-900">
          曲名
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="rounded-xl border border-violet-200 px-3 py-2"
            placeholder="夜に駆ける"
          />
        </label>
        <label className="grid gap-1 text-sm font-semibold text-violet-900">
          アーティスト
          <input
            required
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            className="rounded-xl border border-violet-200 px-3 py-2"
            placeholder="YOASOBI"
          />
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <label className="grid gap-1 text-sm font-semibold text-violet-900">
          尺（分）
          <input
            type="number"
            min={0}
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
            className="rounded-xl border border-violet-200 px-3 py-2"
          />
        </label>
        <label className="grid gap-1 text-sm font-semibold text-violet-900">
          尺（秒）
          <input
            type="number"
            min={0}
            max={59}
            value={seconds}
            onChange={(e) => setSeconds(e.target.value)}
            className="rounded-xl border border-violet-200 px-3 py-2"
          />
        </label>
        <label className="grid gap-1 text-sm font-semibold text-violet-900">
          雰囲気
          <select
            value={mood}
            onChange={(e) => setMood(e.target.value as SongMood)}
            className="rounded-xl border border-violet-200 px-3 py-2"
          >
            {MOODS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="grid gap-1 text-sm font-semibold text-violet-900">
        タグ（カンマ区切り）
        <input
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className="rounded-xl border border-violet-200 px-3 py-2"
          placeholder="アニソン, 定番, 盛り上がり"
        />
      </label>

      <label className="grid gap-1 text-sm font-semibold text-violet-900">
        メモ
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="min-h-20 rounded-xl border border-violet-200 px-3 py-2"
          placeholder="キー変更あり、初見向け など"
        />
      </label>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="submit"
          className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-bold text-white hover:bg-violet-700"
        >
          {initial ? "曲を更新" : "曲を追加"}
        </button>
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-violet-200 px-4 py-2 text-sm font-semibold text-violet-800"
          >
            キャンセル
          </button>
        ) : null}
      </div>
    </form>
  );
}
