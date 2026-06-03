"use client";

import { FormEvent, useState } from "react";
import RowActionButton from "@/components/RowActionButton";
import { createId } from "@/lib/storage";
import { formatSongDurationFields, parseSongDurationFields } from "@/lib/setlist-engine";
import type { Song } from "@/types/setlist";

type Props = {
  initial?: Song;
  onSave: (song: Song) => void;
  /** library: 曲庫登録。setlist: セトリへの追加（オーバーレイの手入力） */
  saveIntent?: "library" | "setlist";
  onCancel?: () => void;
};

export default function SongForm({ initial, onSave, saveIntent = "library", onCancel }: Props) {
  const addToSetlist = saveIntent === "setlist" && !initial;
  const [title, setTitle] = useState(initial?.title ?? "");
  const [artist, setArtist] = useState(initial?.artist ?? "");
  const initialDuration = formatSongDurationFields(initial?.durationSec ?? 0);
  const [minutes, setMinutes] = useState(initialDuration.minutes);
  const [seconds, setSeconds] = useState(initialDuration.seconds);
  const [notes, setNotes] = useState(initial?.notes ?? "");

  function buildSong(): Song | null {
    const durationSec = parseSongDurationFields(minutes, seconds);
    if (!title.trim() || !artist.trim()) return null;

    return {
      id: initial?.id ?? createId("song"),
      title: title.trim(),
      artist: artist.trim(),
      durationSec,
      tags: initial?.tags ?? [],
      notes: notes.trim() || undefined,
      createdAt: initial?.createdAt ?? new Date().toISOString(),
    };
  }

  function confirmNewSong(song: Song, message: string): boolean {
    if (initial) return true;
    return window.confirm(message);
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const song = buildSong();
    if (!song) return;

    const confirmMessage = addToSetlist
      ? `「${song.title} / ${song.artist}」を登録曲に追加し、セトリにも追加しますか？`
      : `「${song.title} / ${song.artist}」を曲庫に追加しますか？`;

    if (!confirmNewSong(song, confirmMessage)) return;

    onSave(song);
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

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid min-w-0 gap-1 text-sm font-semibold text-violet-900">
          尺（分）
          <input
            type="number"
            min={0}
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
            className="w-full min-w-0 rounded-xl border border-violet-200 px-3 py-2"
          />
        </label>
        <label className="grid min-w-0 gap-1 text-sm font-semibold text-violet-900">
          尺（秒）
          <input
            type="number"
            min={0}
            max={59}
            value={seconds}
            onChange={(e) => setSeconds(e.target.value)}
            className="w-full min-w-0 rounded-xl border border-violet-200 px-3 py-2"
          />
        </label>
      </div>

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
        <RowActionButton type="submit" variant="primary">
          {initial ? "曲を更新" : addToSetlist ? "セトリに追加" : "曲を追加"}
        </RowActionButton>
        {onCancel ? (
          <RowActionButton type="button" variant="secondary" onClick={onCancel}>
            キャンセル
          </RowActionButton>
        ) : null}
      </div>
    </form>
  );
}
