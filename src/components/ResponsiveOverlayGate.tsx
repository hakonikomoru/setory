"use client";

import OverlayUnavailableOnMobile from "@/components/OverlayUnavailableOnMobile";

type Props = {
  children: React.ReactNode;
};

/** 768px 未満ではオーバーレイ UI を出さない（Tailwind `md` と同じ） */
export default function ResponsiveOverlayGate({ children }: Props) {
  return (
    <>
      <div className="md:hidden">
        <OverlayUnavailableOnMobile />
      </div>
      <div className="hidden md:block">{children}</div>
    </>
  );
}
