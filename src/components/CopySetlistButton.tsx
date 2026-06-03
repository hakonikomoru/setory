"use client";

import { useState } from "react";
import { rowActionButtonClass } from "@/components/RowActionButton";

type Props = {
  text: string;
  label?: string;
};

export default function CopySetlistButton({ text, label = "セトリをコピー" }: Props) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button type="button" onClick={handleCopy} className={rowActionButtonClass("secondary", "md")}>
      {copied ? "コピーしました" : label}
    </button>
  );
}
