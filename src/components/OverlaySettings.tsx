"use client";

import { useState } from "react";
import { buildObsDisplayUrl, buildOverlayControlUrl } from "@/lib/overlay";
import type { OverlayMode, OverlayTheme, Setlist } from "@/types/setlist";

type Props = {
  setlistId: string;
  overlayVisible: boolean;
  overlayMode: OverlayMode;
  overlayTheme: OverlayTheme;
  /** 未指定時は buildObsDisplayUrl を使用 */
  obsDisplayUrl?: string;
  onChange: (patch: {
    overlayVisible?: boolean;
    overlayMode?: OverlayMode;
    overlayTheme?: OverlayTheme;
  }) => void;
};

const MODES: { value: OverlayMode; label: string }[] = [
  { value: "current", label: "現在の曲のみ" },
  {
    value: "currentAndNext",
    label: "SETLIST + 現在 + 次の曲",
  },
  { value: "fullSetlist", label: "セトリ一覧" },
];

const THEMES: { value: OverlayTheme; label: string }[] = [
  { value: "simple", label: "シンプル" },
  { value: "cute", label: "かわいい" },
  { value: "dark", label: "ダーク" },
  { value: "komoru", label: "こもる風" },
];

export default function OverlaySettings({
  setlistId,
  overlayVisible: visible,
  overlayMode: mode,
  overlayTheme: theme,
  obsDisplayUrl,
  onChange,
}: Props) {
  const [copiedObs, setCopiedObs] = useState(false);
  const obsUrl = obsDisplayUrl ?? buildObsDisplayUrl(setlistId);
  const controlUrl = buildOverlayControlUrl(setlistId);

  async function copyObsUrl() {
    await navigator.clipboard.writeText(obsUrl);
    setCopiedObs(true);
    window.setTimeout(() => setCopiedObs(false), 2000);
  }

  return (
    <section className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-5 shadow-sm">
      <h2 className="text-lg font-bold text-violet-950">OBS オーバーレイ</h2>
      <p className="mt-1 text-sm text-violet-700">
        配信操作は
        <a href={controlUrl} className="mx-1 font-semibold text-indigo-700 underline">
          オーバーレイ操作ページ
        </a>
        で行い、OBS には下の URL（左の表示のみ）を登録してください。
      </p>

      <label className="mt-4 flex cursor-pointer items-center gap-2 text-sm font-semibold text-violet-900">
        <input
          type="checkbox"
          checked={visible}
          onChange={(e) => onChange({ overlayVisible: e.target.checked })}
          className="size-4 rounded border-violet-300"
        />
        オーバーレイを表示する
      </label>

      <fieldset className="mt-4">
        <legend className="text-sm font-semibold text-violet-900">表示モード</legend>
        <div className="mt-2 grid gap-2">
          {MODES.map((item) => (
            <label
              key={item.value}
              className="flex cursor-pointer items-center gap-2 text-sm text-violet-800"
            >
              <input
                type="radio"
                name="overlay-mode"
                checked={mode === item.value}
                onChange={() => onChange({ overlayMode: item.value })}
              />
              {item.label}
            </label>
          ))}
        </div>
      </fieldset>

      <label className="mt-4 grid gap-1 text-sm font-semibold text-violet-900">
        テーマ
        <select
          value={theme}
          onChange={(e) =>
            onChange({ overlayTheme: e.target.value as OverlayTheme })
          }
          className="rounded-xl border border-violet-200 bg-white px-3 py-2"
        >
          {THEMES.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </label>

      <div className="mt-4">
        <p className="text-sm font-semibold text-violet-900">OBS 表示用 URL（透過・操作なし）</p>
        <code className="mt-1 block break-all rounded-xl bg-white px-3 py-2 text-xs text-violet-800">
          {obsUrl}
        </code>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={copyObsUrl}
            className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white"
          >
            {copiedObs ? "コピーしました" : "OBS用 URL をコピー"}
          </button>
          <a
            href={obsUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-xl border border-indigo-200 bg-white px-4 py-2 text-sm font-semibold text-indigo-800"
          >
            表示のみを開く
          </a>
          <a
            href={controlUrl}
            className="inline-flex items-center justify-center rounded-xl border border-violet-200 bg-white px-4 py-2 text-sm font-semibold text-violet-800"
          >
            操作画面を開く
          </a>
        </div>
      </div>

      <p className="mt-3 text-xs text-violet-600">
        OBS ではソースの幅 800〜1000px 程度・背景色を透過にしてください。
      </p>
    </section>
  );
}
