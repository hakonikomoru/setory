"use client";

import { useState, type ReactNode } from "react";
import RowActionButton from "@/components/RowActionButton";

export type SongAddTab = "search" | "manual" | "template" | "registered";

const SEARCH_TAB = { id: "search" as const, label: "検索して取り込む" };

type Props = {
  idPrefix: string;
  searchPanel: ReactNode;
  manualPanel: ReactNode;
  templatePanel?: ReactNode;
  registeredPanel?: ReactNode;
  manualHint?: string;
  templateHint?: string;
  registeredHint?: string;
  manualTabLabel?: string;
  templateTabLabel?: string;
  registeredTabLabel?: string;
  activeTab?: SongAddTab;
  onTabChange?: (tab: SongAddTab) => void;
};

export default function SongAddTabs({
  idPrefix,
  searchPanel,
  manualPanel,
  templatePanel,
  registeredPanel,
  manualHint,
  templateHint,
  registeredHint,
  manualTabLabel = "手入力で登録",
  templateTabLabel = "テンプレートで曲追加",
  registeredTabLabel = "登録曲から追加",
  activeTab,
  onTabChange,
}: Props) {
  const tabs = [
    SEARCH_TAB,
    { id: "manual" as const, label: manualTabLabel },
    ...(templatePanel ? [{ id: "template" as const, label: templateTabLabel }] : []),
    ...(registeredPanel ? [{ id: "registered" as const, label: registeredTabLabel }] : []),
  ];
  const [internalTab, setInternalTab] = useState<SongAddTab>("search");
  const tab = activeTab ?? internalTab;
  const setTab = onTabChange ?? setInternalTab;

  const panelHint =
    tab === "manual"
      ? manualHint
      : tab === "template"
        ? templateHint
        : tab === "registered"
          ? registeredHint
          : undefined;

  function panelContent() {
    switch (tab) {
      case "search":
        return searchPanel;
      case "manual":
        return manualPanel;
      case "template":
        return templatePanel;
      case "registered":
        return registeredPanel;
      default:
        return searchPanel;
    }
  }

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
        <div
          role="tabpanel"
          id={`${idPrefix}-panel-${tab}`}
          aria-labelledby={`${idPrefix}-tab-${tab}`}
        >
          {panelHint ? <p className="mb-3 text-sm text-violet-700">{panelHint}</p> : null}
          {panelContent()}
        </div>
      </div>
    </section>
  );
}
