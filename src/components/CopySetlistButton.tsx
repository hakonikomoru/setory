"use client";

import { useState } from "react";
import { rowActionButtonClass } from "@/components/RowActionButton";

type Props = {
  text: string;
  label?: string;
  /** 一覧行などコンパクト表示 */
  compact?: boolean;
};

export default function CopySetlistButton({
  text,
  label = "セトリをコピー",
  compact = false,
}: Props) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={
        compact
          ? rowActionButtonClass("secondary", "md")
          : rowActionButtonClass("primary", "md", "shadow-md shadow-violet-300/30")
      }
    >
      {copied ? "コピーしました" : label}
    </button>
  );
}
