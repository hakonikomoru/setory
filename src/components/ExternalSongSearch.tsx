"use client";

import { useEffect, useMemo, useState } from "react";
import RowActionButton from "@/components/RowActionButton";
import SearchInput from "@/components/SearchInput";
import { formatDuration } from "@/lib/setlist-engine";
import { externalHitToSong, mergeExternalHits, type ExternalSongHit } from "@/lib/musicbrainz";
import { findSongInLibrary, isSongInLibrary, isSongInSetlist } from "@/lib/song-match";
import type { Song } from "@/types/setlist";

/** library: 曲庫のみ。libraryAndSetlist: 曲庫に無ければ追加し、セトリにも追加 */
export type ExternalSongImportTarget = "library" | "libraryAndSetlist";

type Props = {
  librarySongs: Song[];
  onImport: (song: Song) => void;
  onImportMany?: (hits: ExternalSongHit[]) => void;
  importLabel?: string;
  className?: string;
  importTarget?: ExternalSongImportTarget;
  setlistSongIds?: string[];
};

export default function ExternalSongSearch({
  librarySongs,
  onImport,
  onImportMany,
  importLabel = "曲庫に追加",
  className = "",
  importTarget = "library",
  setlistSongIds = [],
}: Props) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [results, setResults] = useState<ExternalSongHit[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [deepLoading, setDeepLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query.trim()), 400);
    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setResults([]);
      setHasMore(false);
      setError(null);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError(null);

    fetch(`/api/songs/search?q=${encodeURIComponent(debouncedQuery)}&max=100`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        const payload = (await response.json()) as {
          results?: ExternalSongHit[];
          hasMore?: boolean;
          error?: string;
        };
        if (!response.ok) {
          throw new Error(payload.error ?? "検索に失敗しました");
        }
        setResults(payload.results ?? []);
        setHasMore(Boolean(payload.hasMore));
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setResults([]);
        setHasMore(false);
        setError(err instanceof Error ? err.message : "検索に失敗しました");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [debouncedQuery]);

  function resolveSong(hit: ExternalSongHit): Song {
    return findSongInLibrary(librarySongs, hit.title, hit.artist) ?? externalHitToSong(hit);
  }

  function hitAlreadyImported(hit: ExternalSongHit): boolean {
    if (importTarget === "libraryAndSetlist") {
      return isSongInSetlist(librarySongs, setlistSongIds, hit.title, hit.artist);
    }
    return isSongInLibrary(librarySongs, hit.title, hit.artist);
  }

  const importableHits = useMemo(
    () =>
      results.filter((hit) => {
        if (importTarget === "libraryAndSetlist") {
          return !isSongInSetlist(librarySongs, setlistSongIds, hit.title, hit.artist);
        }
        return !isSongInLibrary(librarySongs, hit.title, hit.artist);
      }),
    [importTarget, librarySongs, results, setlistSongIds],
  );

  function handleImport(hit: ExternalSongHit) {
    if (hitAlreadyImported(hit)) return;
    onImport(resolveSong(hit));
  }

  function handleImportAll() {
    if (importableHits.length === 0) return;
    if (onImportMany) {
      onImportMany(importableHits);
      return;
    }
    for (const hit of importableHits) {
      onImport(resolveSong(hit));
    }
  }

  async function loadMore() {
    if (!debouncedQuery || loadingMore) return;
    setLoadingMore(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/songs/search?q=${encodeURIComponent(debouncedQuery)}&max=100&offset=${results.length}`,
      );
      const payload = (await response.json()) as {
        results?: ExternalSongHit[];
        hasMore?: boolean;
        error?: string;
      };
      if (!response.ok) {
        throw new Error(payload.error ?? "追加の取得に失敗しました");
      }
      const merged = mergeExternalHits(results, payload.results ?? []);
      setResults(merged);
      setHasMore(Boolean(payload.hasMore));
    } catch (err) {
      setError(err instanceof Error ? err.message : "追加の取得に失敗しました");
    } finally {
      setLoadingMore(false);
    }
  }

  async function loadDeep() {
    if (!debouncedQuery || deepLoading) return;
    setDeepLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/songs/search?q=${encodeURIComponent(debouncedQuery)}&deep=1&max=200`,
      );
      const payload = (await response.json()) as {
        results?: ExternalSongHit[];
        error?: string;
      };
      if (!response.ok) {
        throw new Error(payload.error ?? "まとめ取得に失敗しました");
      }
      setResults(payload.results ?? []);
      setHasMore(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "まとめ取得に失敗しました");
    } finally {
      setDeepLoading(false);
    }
  }

  return (
    <section className={`grid gap-3 ${className}`}>
      <header>
        <h2 className="text-xl font-bold text-violet-950">曲を検索して取り込む</h2>
        <p className="mt-1 text-sm text-violet-700">
          1回の検索で最大100件。さらに「まとめて200件取得」で追加できます。
        </p>
      </header>

      <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-5 shadow-sm">
      <label className="grid gap-1 text-sm font-semibold text-violet-900">
        曲名・アーティストで検索
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="例: artist:YOASOBI、夜に駆ける"
          inputClassName="bg-white"
        />
      </label>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {importableHits.length > 0 ? (
          <RowActionButton type="button" variant="primary" onClick={handleImportAll}>
            {importTarget === "libraryAndSetlist"
              ? "表示中の曲をすべてセトリに追加"
              : "表示中の未追加曲をすべて追加"}
            （{importableHits.length}曲）
          </RowActionButton>
        ) : null}
        {debouncedQuery.length >= 2 ? (
          <RowActionButton
            type="button"
            variant="secondary"
            disabled={deepLoading || loading}
            onClick={loadDeep}
          >
            {deepLoading ? "取得中..." : "まとめて200件取得"}
          </RowActionButton>
        ) : null}
      </div>

      <p className="mt-2 text-xs text-violet-600">
        {loading
          ? "検索中..."
          : debouncedQuery.length < 2
            ? "2文字以上入力すると検索します（artist:名前 でアーティスト検索）"
            : error
              ? error
              : importTarget === "libraryAndSetlist"
                ? `${results.length}件表示・セトリ未追加 ${importableHits.length}曲`
                : `${results.length}件表示・未追加 ${importableHits.length}曲`}
      </p>

      {results.length > 0 ? (
        <>
          <ul className="mt-4 grid max-h-96 gap-2 overflow-y-auto">
            {results.map((hit) => {
              const inLibrary = isSongInLibrary(librarySongs, hit.title, hit.artist);
              const inSetlist =
                importTarget === "libraryAndSetlist" &&
                isSongInSetlist(librarySongs, setlistSongIds, hit.title, hit.artist);
              const disabled = importTarget === "libraryAndSetlist" ? inSetlist : inLibrary;
              const statusLabel = disabled
                ? importTarget === "libraryAndSetlist"
                  ? "セトリに追加済み"
                  : "追加済み"
                : importLabel;
              return (
                <li
                  key={hit.externalId}
                  className="flex min-w-0 items-center gap-2 rounded-xl border border-violet-100 bg-white px-3 py-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-bold break-words text-violet-950">{hit.title}</p>
                    <p className="text-sm break-words text-violet-700">
                      {hit.artist}（{formatDuration(hit.durationSec)}）
                      {importTarget === "libraryAndSetlist" && inLibrary && !inSetlist
                        ? " ・ 曲庫に登録済み"
                        : ""}
                    </p>
                  </div>
                  <RowActionButton
                    type="button"
                    variant={disabled ? "muted" : "primary"}
                    size="sm"
                    disabled={disabled}
                    onClick={() => handleImport(hit)}
                  >
                    {statusLabel}
                  </RowActionButton>
                </li>
              );
            })}
          </ul>
          {hasMore ? (
            <button
              type="button"
              disabled={loadingMore}
              onClick={loadMore}
              className="mt-3 w-full rounded-xl border border-violet-200 bg-white py-2 text-sm font-semibold text-violet-800 disabled:opacity-40"
            >
              {loadingMore ? "読み込み中..." : "さらに100件読み込む"}
            </button>
          ) : null}
        </>
      ) : null}

      <p className="mt-4 text-xs text-violet-500">
        曲情報提供:{" "}
        <a href="https://musicbrainz.org/" target="_blank" rel="noreferrer" className="underline">
          MusicBrainz
        </a>
        （CC0 / オープンデータ）
      </p>
      </div>
    </section>
  );
}
