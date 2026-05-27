"use client";

import { useMemo, useState } from "react";
import RowActionButton from "@/components/RowActionButton";
import { parseTemplateSongLines } from "@/lib/setlist-engine";
import { createId } from "@/lib/storage";
import type { Song } from "@/types/setlist";

type Props = {
  onAdd: (song: Song) => void;
  /** 指定時は一括コールバック（未指定なら onAdd を曲ごとに呼ぶ） */
  onAddMany?: (songs: Song[]) => void;
  addButtonLabel?: string;
  hint?: string;
  /** 追加成功後（確認ダイアログ OK 後） */
  onAfterAdd?: (count: number) => void;
};

export default function TemplateSongImport({
  onAdd,
  onAddMany,
  addButtonLabel = "追加",
  hint = "1行に1曲。曲名 / アーティスト、または曲名だけでも登録できます。",
  onAfterAdd,
}: Props) {
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const parsed = useMemo(() => parseTemplateSongLines(text), [text]);

  function handleAdd() {
    setError(null);
    if (parsed.length === 0) {
      setError("追加できる行がありません。曲名を入力してください。");
      return;
    }

    const message =
      parsed.length === 1
        ? `「${parsed[0].title}${parsed[0].artist ? ` / ${parsed[0].artist}` : ""}」を追加しますか？`
        : `${parsed.length}曲を一括で追加しますか？`;

    if (!window.confirm(message)) return;

    const baseMs = Date.now();
    const songs: Song[] = parsed.map((line, index) => ({
      id: createId("song"),
      title: line.title,
      artist: line.artist,
      durationSec: 0,
      tags: [],
      createdAt: new Date(baseMs + index).toISOString(),
    }));

    if (onAddMany) onAddMany(songs);
    else songs.forEach(onAdd);

    setText("");
    onAfterAdd?.(songs.length);
  }

  return (
    <div className="grid gap-3 rounded-2xl border border-indigo-100 bg-indigo-50/40 p-5 shadow-sm">
      <p className="text-sm text-violet-700">{hint}</p>
      <label className="grid gap-1 text-sm font-semibold text-violet-900">
        曲リスト（テンプレート）
        <textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setError(null);
          }}
          rows={10}
          spellCheck={false}
          placeholder={`夜に駆ける / YOASOBI\n残酷な天使のテーゼ / 高橋洋子\nsecret base`}
          className="min-h-40 rounded-xl border border-violet-200 bg-white px-3 py-2 font-mono text-sm leading-6 text-violet-900"
        />
      </label>
      <p className="text-xs text-violet-600">
        {parsed.length > 0
          ? `${parsed.length}曲を追加できます（尺は未設定）`
          : "空行は無視されます"}
      </p>
      {error ? <p className="text-sm font-semibold text-rose-700">{error}</p> : null}
      <div>
        <RowActionButton type="button" variant="primary" onClick={handleAdd} disabled={parsed.length === 0}>
          {addButtonLabel}
          {parsed.length > 0 ? `（${parsed.length}曲）` : ""}
        </RowActionButton>
      </div>
    </div>
  );
}
