"use client";

import { useEffect, useId, useRef, useState } from "react";
import RowActionButton from "@/components/RowActionButton";
import { buildSongSearchQuery, STREAMING_SERVICES } from "@/lib/streaming-links";
import type { Song } from "@/types/setlist";

type Props = {
  song: Pick<Song, "title" | "artist">;
  className?: string;
};

/** Material Symbols Outlined: search */
function SearchIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width={16}
      height={16}
      aria-hidden
      fill="currentColor"
    >
      <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
    </svg>
  );
}

/** 保存セトリなどで、各配信サービスの検索ページへ遷移するメニュー */
export default function SongStreamingSearchLinks({ song, className = "" }: Props) {
  const query = buildSongSearchQuery(song);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  if (!query) return null;

  return (
    <div ref={rootRef} className={`relative shrink-0 ${className}`.trim()}>
      <RowActionButton
        type="button"
        variant="secondary"
        size="sm"
        className="gap-1.5"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
      >
        <SearchIcon className="shrink-0 opacity-90" />
        配信で検索
      </RowActionButton>

      {open ? (
        <ul
          id={menuId}
          role="menu"
          aria-label={`${query} を配信サービスで検索`}
          className="absolute top-full right-0 z-30 mt-1 min-w-[10.5rem] overflow-hidden rounded-xl border border-violet-200 bg-white py-1 shadow-lg shadow-violet-200/50"
        >
          {STREAMING_SERVICES.map((service) => (
            <li key={service.id} role="none">
              <a
                role="menuitem"
                href={service.buildSearchUrl(query)}
                target="_blank"
                rel="noopener noreferrer"
                className="block px-3 py-2 text-sm font-semibold text-violet-900 transition hover:bg-violet-50"
                onClick={() => setOpen(false)}
              >
                {service.label}
                {service.primary ? (
                  <span className="ml-1.5 text-xs font-normal text-violet-500">おすすめ</span>
                ) : null}
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
