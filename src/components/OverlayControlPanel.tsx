"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import OverlayPreviewFrame from "@/components/OverlayPreviewFrame";
import RowActionButton, { RowActionLink } from "@/components/RowActionButton";
import OverlaySettings from "@/components/OverlaySettings";
import SetlistBuilder from "@/components/SetlistBuilder";
import { formatSetlistSongLine } from "@/lib/setlist-engine";
import {
  buildObsDisplayUrl,
  canNavigateOverlayPrev,
  navigateOverlayNext,
  navigateOverlayPrev,
  resolveOverlaySongs,
} from "@/lib/overlay";
import { upsertSetlist } from "@/lib/storage";
import { useAppData } from "@/lib/use-app-data";
import type { Setlist } from "@/types/setlist";

export default function OverlayControlPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedId = searchParams.get("id");
  const { data, setData, ready } = useAppData();
  const [previewBackgroundMaxWidthPx, setPreviewBackgroundMaxWidthPx] = useState<
    number | undefined
  >();
  const handlePreviewBackgroundWidth = useCallback((widthPx: number) => {
    setPreviewBackgroundMaxWidthPx(widthPx);
  }, []);

  const setlist = useMemo(
    () => data.setlists.find((item) => item.id === selectedId),
    [data.setlists, selectedId],
  );

  const overlaySongs = useMemo(() => {
    if (!setlist) {
      return { ordered: [], current: undefined, next: undefined, currentIndex: -1 };
    }
    return resolveOverlaySongs(setlist, data.songs);
  }, [setlist, data.songs]);

  useEffect(() => {
    if (!ready || selectedId || data.setlists.length === 0) return;
    router.replace(`/overlay?id=${encodeURIComponent(data.setlists[0].id)}`);
  }, [ready, selectedId, data.setlists, router]);

  function persistSetlist(next: Setlist) {
    setData(upsertSetlist(data, { ...next, updatedAt: new Date().toISOString() }));
  }

  function patchSetlist(patch: Partial<Setlist>) {
    if (!setlist) return;
    const next: Setlist = {
      ...setlist,
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    if ("overlaySetlistColor" in patch && patch.overlaySetlistColor === undefined) {
      delete next.overlaySetlistColor;
    }
    if ("overlaySetlistMaxWidthPx" in patch && patch.overlaySetlistMaxWidthPx === undefined) {
      delete next.overlaySetlistMaxWidthPx;
    }
    if ("overlayHideArtist" in patch && patch.overlayHideArtist === undefined) {
      delete next.overlayHideArtist;
    }
    if ("overlayHideDuration" in patch && patch.overlayHideDuration === undefined) {
      delete next.overlayHideDuration;
    }
    persistSetlist(next);
  }

  function applyOverlayNavigation(nav: { currentSongId?: string; overlaySuppressNext?: boolean }) {
    if (!setlist || nav.currentSongId === undefined) return;
    const next: Setlist = {
      ...setlist,
      currentSongId: nav.currentSongId,
      updatedAt: new Date().toISOString(),
    };
    if (nav.overlaySuppressNext === undefined) {
      delete next.overlaySuppressNext;
    } else {
      next.overlaySuppressNext = nav.overlaySuppressNext;
    }
    persistSetlist(next);
  }

  function setCurrentSongId(songId: string) {
    if (!setlist) return;
    const index = setlist.songIds.indexOf(songId);
    const next: Setlist = {
      ...setlist,
      currentSongId: songId,
      updatedAt: new Date().toISOString(),
    };
    if (index === 0) {
      next.overlaySuppressNext = true;
    } else {
      delete next.overlaySuppressNext;
    }
    persistSetlist(next);
  }

  const canRewind = setlist ? canNavigateOverlayPrev(setlist, data.songs) : false;

  if (!ready) {
    return <p className="text-violet-700">読み込み中...</p>;
  }

  if (data.setlists.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-violet-200 bg-white/90 p-8 text-center">
        <p className="text-violet-800">保存したセトリがありません。</p>
        <RowActionLink href="/builder" variant="primary" className="mt-4">
          セトリを作成する
        </RowActionLink>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <header>
        <h1 className="text-3xl font-black text-violet-950">オーバーレイ操作</h1>
        <p className="mt-2 text-sm text-violet-700">
          左が配信プレビュー、右の上から曲の切り替え・OBS 設定の順です。その下でセトリ編集できます。
        </p>
      </header>

      {setlist ? (
        <div className="grid gap-6">
          <div className="grid grid-cols-1 items-stretch gap-6 xl:grid-cols-2">
            <OverlayPreviewFrame
              setlist={setlist}
              songs={data.songs}
              onPreviewBackgroundMaxWidthPx={handlePreviewBackgroundWidth}
            />

            <div className="flex min-w-0 flex-col gap-6">
              <div className="grid shrink-0 gap-3">
                <h2 className="text-lg font-bold text-violet-950">曲の切り替え</h2>
                <section className="overflow-visible rounded-2xl border border-violet-100 bg-white/90 p-5 shadow-sm">
                <label className="grid gap-1 text-sm font-semibold text-violet-900">
                  操作するセトリ
                  <select
                    value={selectedId ?? ""}
                    onChange={(e) => {
                      if (e.target.value) {
                        router.push(`/overlay?id=${encodeURIComponent(e.target.value)}`);
                      }
                    }}
                    className="w-full rounded-xl border border-violet-200 bg-white px-3 py-2"
                  >
                    {data.setlists.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}（{item.songIds.length}曲）
                      </option>
                    ))}
                  </select>
                </label>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <RowActionButton
                    type="button"
                    variant="secondary"
                    size="lg"
                    disabled={!canRewind}
                    title={
                      overlaySongs.currentIndex === 0 && setlist.overlaySuppressNext !== false
                        ? "1曲目で NEXT を隠しているときは戻れません"
                        : overlaySongs.currentIndex === 0
                          ? "NEXT を隠す"
                          : undefined
                    }
                    onClick={() =>
                      applyOverlayNavigation(navigateOverlayPrev(setlist, data.songs))
                    }
                  >
                    前の曲
                  </RowActionButton>
                  <RowActionButton
                    type="button"
                    variant="primary"
                    size="lg"
                    disabled={overlaySongs.ordered.length === 0}
                    onClick={() =>
                      applyOverlayNavigation(navigateOverlayNext(setlist, data.songs))
                    }
                  >
                    次の曲
                  </RowActionButton>
                </div>
                <ol className="mt-4 max-h-[min(24rem,50vh)] list-none space-y-2 overflow-y-auto overscroll-contain px-1 py-1">
                  {overlaySongs.ordered.map((song, index) => {
                    const isCurrent = setlist.currentSongId === song.id;
                    return (
                      <li key={song.id} className="min-w-0 px-px">
                        <button
                          type="button"
                          onClick={() => setCurrentSongId(song.id)}
                          className={`btn-text-left flex w-full min-w-0 flex-col rounded-xl border px-3 py-2 transition ${
                            isCurrent
                              ? "border-violet-500 bg-violet-100 ring-2 ring-violet-400 ring-inset"
                              : "border-violet-100 bg-violet-50/50 hover:bg-violet-50"
                          }`}
                        >
                          <p className="w-full text-left leading-snug font-bold break-words text-violet-950">
                            {formatSetlistSongLine(song, index, {
                              hideDuration: Boolean(setlist.hideDuration),
                              hideArtist: Boolean(setlist.hideArtist),
                            })}
                            {isCurrent ? (
                              <span className="ml-2 rounded-full bg-violet-600 px-2 py-0.5 text-xs font-bold text-white">
                                現在
                              </span>
                            ) : null}
                          </p>
                        </button>
                      </li>
                    );
                  })}
                </ol>
                </section>
              </div>

              <OverlaySettings
                setlistId={setlist.id}
                setlist={setlist}
                overlayVisible={setlist.overlayVisible ?? true}
                overlayMode={setlist.overlayMode ?? "currentAndNext"}
                overlayTheme={setlist.overlayTheme ?? "simple"}
                obsDisplayUrl={buildObsDisplayUrl(setlist.id)}
                previewBackgroundMaxWidthPx={previewBackgroundMaxWidthPx}
                onChange={(patch) => patchSetlist(patch)}
              />
            </div>
          </div>

          <div className="border-t border-violet-200 pt-6">
            <h2 className="text-lg font-bold text-violet-950">セトリ編集</h2>
            <p className="mt-1 text-sm text-violet-600">
              曲の追加・並べ替え・セトリ名の変更は自動で保存され、左の表示に反映されます。
            </p>
            <div className="mt-4">
              <SetlistBuilder
                key={setlist.id}
                embedded
                data={data}
                initialSetlist={setlist}
                onDataChange={setData}
                onSave={setData}
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
