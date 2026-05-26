"use client";

import { useState, type ReactNode } from "react";
import RowActionButton from "@/components/RowActionButton";

export type SongAddTab = "search" | "manual";

const SEARCH_TAB = { id: "search" as const, label: "検索して取り込む" };

type Props = {
  idPrefix: string;
  searchPanel: ReactNode;
  manualPanel: ReactNode;
  manualHint?: string;
  manualTabLabel?: string;
  activeTab?: SongAddTab;
  onTabChange?: (tab: SongAddTab) => void;
};

export default function SongAddTabs({
  idPrefix,
  searchPanel,
  manualPanel,
  manualHint,
  manualTabLabel = "手入力で登録",
  activeTab,
  onTabChange,
}: Props) {
  const tabs = [
    SEARCH_TAB,
    { id: "manual" as const, label: manualTabLabel },
  ];
  const [internalTab, setInternalTab] = useState<SongAddTab>("search");
  const tab = activeTab ?? internalTab;
  const setTab = onTabChange ?? setInternalTab;

  return (
    <section aria-label="曲の追加">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="追加方法">
        {tabs.map((item) => (
          <RowActionButton
            key={item.id}
            type="button"
            role="tab"
            id={`${idPrefix}-tab-${item.id}`}
            aria-selected={tab === item.id}
            aria-controls={`${idPrefix}-panel-${item.id}`}
            variant={tab === item.id ? "accent" : "secondary"}
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </RowActionButton>
        ))}
      </div>

      <div className="mt-4">
        {tab === "search" ? (
          <div
            role="tabpanel"
            id={`${idPrefix}-panel-search`}
            aria-labelledby={`${idPrefix}-tab-search`}
          >
            {searchPanel}
          </div>
        ) : (
          <div
            role="tabpanel"
            id={`${idPrefix}-panel-manual`}
            aria-labelledby={`${idPrefix}-tab-manual`}
          >
            {manualHint ? <p className="mb-3 text-sm text-violet-700">{manualHint}</p> : null}
            {manualPanel}
          </div>
        )}
      </div>
    </section>
  );
}
