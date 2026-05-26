"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import OverlayControlPanel from "@/components/OverlayControlPanel";
import OverlayObsOnly from "@/components/OverlayObsOnly";

function OverlayPageContent() {
  const searchParams = useSearchParams();
  const isObsOnly = searchParams.get("obs") === "1";

  if (isObsOnly) {
    return (
      <Suspense fallback={null}>
        <OverlayObsOnly />
      </Suspense>
    );
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8">
      <OverlayControlPanel />
    </main>
  );
}

export default function OverlayPage() {
  return (
    <Suspense fallback={<p className="text-violet-700">読み込み中...</p>}>
      <OverlayPageContent />
    </Suspense>
  );
}
