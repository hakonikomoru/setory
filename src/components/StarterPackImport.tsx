"use client";

import { useState } from "react";
import { STARTER_PACKS } from "@/lib/musicbrainz-starter-packs";
import { importSongsFromHits } from "@/lib/song-import";
import type { ExternalSongHit } from "@/lib/musicbrainz";
import type { AppData } from "@/types/setlist";

type Props = {
  data: AppData;
  onDataChange: (data: AppData) => void;
};

export default function StarterPackImport({ data, onDataChange }: Props) {
  const [loadingPackId, setLoadingPackId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleImportPack(packId: string) {
    setLoadingPackId(packId);
    setMessage(null);

    try {
      const response = await fetch(`/api/songs/bulk?pack=${encodeURIComponent(packId)}`);
      const payload = (await response.json()) as {
        results?: ExternalSongHit[];
        error?: string;
        total?: number;
      };

      if (!response.ok) {
        throw new Error(payload.error ?? "一括取得に失敗しました");
      }

      const hits = payload.results ?? [];
      const { data: next, added, skipped } = importSongsFromHits(data, hits);
      onDataChange(next);
      setMessage(
        `${added}曲を曲庫に追加しました（${hits.length}件取得・${skipped}件は既存のためスキップ）`,
      );
    } catch (err) {
      setMessage(
        err instanceof Error ? err.message : "一括取得に失敗しました",
      );
    } finally {
      setLoadingPackId(null);
    }
  }

  return (
    <section className="rounded-2xl border border-fuchsia-100 bg-fuchsia-50/50 p-5 shadow-sm">
      <h2 className="text-lg font-bold text-violet-950">まとめて曲庫を充実させる</h2>
      <p className="mt-1 text-sm text-violet-700">
        人気ジャンルごとに MusicBrainz から数百曲規模で一括取得します。完了まで 30秒〜2分ほどかかることがあります。
      </p>

      <ul className="mt-4 grid gap-3">
        {STARTER_PACKS.map((pack) => {
          const loading = loadingPackId === pack.id;
          return (
            <li
              key={pack.id}
              className="rounded-xl border border-violet-100 bg-white p-4"
            >
              <p className="font-bold text-violet-950">{pack.label}</p>
              <p className="mt-1 text-sm text-violet-700">{pack.description}</p>
              <button
                type="button"
                disabled={loadingPackId !== null}
                onClick={() => handleImportPack(pack.id)}
                className="mt-3 rounded-xl bg-fuchsia-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-40"
              >
                {loading ? "取得中..." : "このパックを取り込む"}
              </button>
            </li>
          );
        })}
      </ul>

      {message ? (
        <p className="mt-4 rounded-xl bg-white px-3 py-2 text-sm text-violet-800">
          {message}
        </p>
      ) : null}
    </section>
  );
}
