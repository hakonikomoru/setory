"use client";

import { useState } from "react";

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
    <button
      type="button"
      onClick={handleCopy}
      className="rounded-xl bg-fuchsia-600 px-4 py-2 text-sm font-bold text-white shadow-md shadow-fuchsia-200 transition hover:bg-fuchsia-700"
    >
      {copied ? "コピーしました" : label}
    </button>
  );
}
