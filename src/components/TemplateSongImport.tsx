"use client";

import { useMemo, useState } from "react";
import RowActionButton from "@/components/RowActionButton";
import { parseTemplateSongLinesWithSource } from "@/lib/setlist-engine";
import {
  buildTemplateImportNotice,
  classifyTemplateSongLines,
  formatTemplateSongLine,
  prepareTemplateSongImport,
  type ClassifiedTemplateSongLine,
} from "@/lib/song-import";
import { createId } from "@/lib/storage";
import type { Song } from "@/types/setlist";

type Props = {
  /** 重複判定に使う登録曲（曲庫） */
  librarySongs: Song[];
  onAdd: (song: Song) => void;
  /** 曲庫への新規登録のみ渡す */
  onAddMany?: (songs: Song[]) => void;
  /** セトリ追加など、登録済み曲も含めた解決結果を渡す */
  onImportMany?: (result: { newSongs: Song[]; resolved: Song[] }) => void;
  addButtonLabel?: string;
  hint?: string;
  /** 追加成功後（確認ダイアログ OK 後） */
  onAfterAdd?: (addedCount: number) => void;
};

function TemplateSongLineList({
  title,
  lines,
  variant,
}: {
  title: string;
  lines: ClassifiedTemplateSongLine[];
  variant: "addable" | "skipped";
}) {
  if (lines.length === 0) return null;

  const badgeClass =
    variant === "addable"
      ? "bg-violet-100 text-violet-800"
      : "bg-amber-100 text-amber-900";

  return (
    <div className="grid gap-1.5">
      <p className="text-xs font-semibold text-violet-800">{title}</p>
      <ul className="grid gap-1 rounded-lg border border-violet-100 bg-white/80 px-2 py-2 text-xs">
        {lines.map((line) => (
          <li
            key={`${variant}-${line.sourceLine}-${line.title}-${line.artist}`}
            className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5"
          >
            <span className="shrink-0 font-mono tabular-nums text-violet-500">{line.sourceLine}行目</span>
            <span className="min-w-0 flex-1 font-medium text-violet-950">
              {formatTemplateSongLine(line)}
            </span>
            <span className={`shrink-0 rounded-full px-2 py-0.5 font-semibold ${badgeClass}`}>
              {variant === "addable" ? "追加" : "登録済み"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function TemplateSongImport({
  librarySongs,
  onAdd,
  onAddMany,
  onImportMany,
  addButtonLabel = "追加",
  hint = "1行に1曲。曲名 / アーティスト、または曲名だけでも登録できます。",
  onAfterAdd,
}: Props) {
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [resultNotice, setResultNotice] = useState<{
    message: string;
    skipped: ClassifiedTemplateSongLine[];
  } | null>(null);

  const parsedWithSource = useMemo(() => parseTemplateSongLinesWithSource(text), [text]);

  const classified = useMemo(
    () => classifyTemplateSongLines(librarySongs, parsedWithSource),
    [librarySongs, parsedWithSource],
  );

  const addableLines = useMemo(
    () => classified.filter((line) => line.status === "addable"),
    [classified],
  );
  const skippedLines = useMemo(
    () => classified.filter((line) => line.status === "skipped"),
    [classified],
  );

  function formatSkippedLinesForDialog(lines: ClassifiedTemplateSongLine[]): string {
    return lines.map((line) => `${line.sourceLine}行目: ${formatTemplateSongLine(line)}`).join("\n");
  }

  function handleAdd() {
    setError(null);
    setResultNotice(null);
    if (parsedWithSource.length === 0) {
      setError("追加できる行がありません。曲名を入力してください。");
      return;
    }

    const parsed = parsedWithSource.map(({ sourceLine: _sourceLine, ...line }) => line);
    const importResult = prepareTemplateSongImport(librarySongs, parsed, (line, index) => ({
      id: createId("song"),
      title: line.title,
      artist: line.artist,
      durationSec: 0,
      tags: [],
      createdAt: new Date(Date.now() + index).toISOString(),
    }));

    const { newSongs, resolved } = importResult;

    if (newSongs.length === 0) {
      setResultNotice({
        message: buildTemplateImportNotice(importResult) ?? "",
        skipped: skippedLines,
      });
      return;
    }

    const message =
      importResult.skipped.length > 0
        ? `${newSongs.length}曲を追加します。\n\n登録済みのためスキップ:\n${formatSkippedLinesForDialog(skippedLines)}\n\nよろしいですか？`
        : newSongs.length === 1
          ? `「${formatTemplateSongLine(newSongs[0])}」を追加しますか？`
          : `${newSongs.length}曲を一括で追加しますか？`;

    if (!window.confirm(message)) return;

    if (onImportMany) onImportMany({ newSongs, resolved });
    else if (onAddMany) onAddMany(newSongs);
    else newSongs.forEach(onAdd);

    setText("");
    setResultNotice({
      message: buildTemplateImportNotice(importResult) ?? "",
      skipped: skippedLines,
    });
    onAfterAdd?.(newSongs.length);
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
            setResultNotice(null);
          }}
          rows={10}
          spellCheck={false}
          placeholder={`夜に駆ける / YOASOBI\n残酷な天使のテーゼ / 高橋洋子\nsecret base`}
          className="min-h-40 rounded-xl border border-violet-200 bg-white px-3 py-2 font-mono text-sm leading-6 text-violet-900"
        />
      </label>

      {classified.length > 0 ? (
        <div className="grid gap-3 rounded-xl border border-violet-100 bg-white/60 p-3">
          <p className="text-xs font-semibold text-violet-800">取り込みプレビュー</p>
          <TemplateSongLineList title="追加する行" lines={addableLines} variant="addable" />
          <TemplateSongLineList
            title="登録済みのため取り込めない行"
            lines={skippedLines}
            variant="skipped"
          />
          {addableLines.length === 0 ? (
            <p className="text-xs text-amber-800">すべて登録済みのため、新規追加はありません。</p>
          ) : (
            <p className="text-xs text-violet-600">{addableLines.length}曲を追加できます（尺は未設定）</p>
          )}
        </div>
      ) : (
        <p className="text-xs text-violet-600">空行は無視されます</p>
      )}

      {error ? <p className="text-sm font-semibold text-rose-700">{error}</p> : null}

      {resultNotice ? (
        <div className="grid gap-2 rounded-xl border border-violet-200 bg-violet-50/80 p-3">
          <p className="text-sm font-semibold text-violet-900">{resultNotice.message}</p>
          {resultNotice.skipped.length > 0 ? (
            <TemplateSongLineList
              title="スキップした行"
              lines={resultNotice.skipped}
              variant="skipped"
            />
          ) : null}
        </div>
      ) : null}

      <div>
        <RowActionButton
          type="button"
          variant="primary"
          onClick={handleAdd}
          disabled={addableLines.length === 0}
        >
          {addButtonLabel}
          {addableLines.length > 0 ? `（${addableLines.length}曲）` : ""}
        </RowActionButton>
      </div>
    </div>
  );
}
