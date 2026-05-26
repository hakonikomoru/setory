import type { OverlayTheme } from "@/types/setlist";

export type OverlayThemeColors = {
  label: string;
  primary: string;
  secondary: string;
  setlist: string;
};

export type OverlayThemeDefinition = {
  id: OverlayTheme;
  label: string;
  description: string;
  colors: OverlayThemeColors;
  rootClass: string;
  classNames: {
    label: string;
    nowTitle: string;
    nowTitleCompact: string;
    nowSub: string;
    nowSubCompact: string;
    nextTitle: string;
    nextTitleCompact: string;
    nextSub: string;
    nextSubCompact: string;
    sectionBorder: string;
    sub: string;
    setlistLabel: string;
    setlistLine: string;
    fullSetlistTitle: string;
    fullSetlistTitleCompact: string;
    fullSetlistSub: string;
    fullSetlistCurrent: string;
  };
  nowBlockClass: string;
};

export const OVERLAY_THEME_OPTIONS: {
  value: OverlayTheme;
  label: string;
  description: string;
}[] = [
  {
    value: "simple",
    label: "スタンダード",
    description: "ラベル付きの定番レイアウト。読みやすさ重視",
  },
  {
    value: "minimal",
    label: "コンパクト",
    description: "やや小さめだが太字で読みやすく表示",
  },
  {
    value: "bold",
    label: "インパクト",
    description: "曲名を大きく。左ラインで NOW を強調",
  },
  {
    value: "cute",
    label: "ポップ",
    description: "角丸ラベル風・明るいピンク系",
  },
  {
    value: "dark",
    label: "ホワイト",
    description: "グリーンバック向けの白文字",
  },
  {
    value: "komoru",
    label: "ネオン",
    description: "NOW ラベルが光る配信向け演出",
  },
];

export const OVERLAY_THEMES: Record<OverlayTheme, OverlayThemeDefinition> = {
  simple: {
    id: "simple",
    label: "スタンダード",
    description: "ラベル付きの定番レイアウト",
    colors: {
      label: "#7c3aed",
      primary: "#2e1065",
      secondary: "#5b21b6",
      setlist: "#5b21b6",
    },
    rootClass: "overlay-theme-simple",
    nowBlockClass: "",
    classNames: {
      label: "text-xs font-bold uppercase tracking-wide text-violet-600",
      nowTitle: "text-3xl font-black leading-tight text-violet-950",
      nowTitleCompact: "text-2xl font-black leading-tight text-violet-950",
      nowSub: "text-lg font-bold leading-snug text-violet-800",
      nowSubCompact: "text-base font-bold leading-snug text-violet-800",
      nextTitle: "text-base font-bold leading-snug text-violet-800",
      nextTitleCompact: "text-sm font-bold leading-snug text-violet-800",
      nextSub: "text-sm font-semibold leading-snug text-violet-800/90",
      nextSubCompact: "text-xs font-semibold leading-snug text-violet-800/90",
      sectionBorder: "border-violet-500/45",
      sub: "text-lg font-bold leading-snug text-violet-800",
      setlistLabel: "text-xs font-bold uppercase tracking-wide text-violet-600",
      setlistLine: "text-sm font-bold leading-snug text-violet-800/90",
      fullSetlistTitle: "text-2xl font-black leading-tight text-violet-950",
      fullSetlistTitleCompact: "text-xl font-black leading-snug break-words text-violet-950",
      fullSetlistSub: "text-base font-bold leading-snug text-violet-800",
      fullSetlistCurrent: "underline decoration-2 underline-offset-4 decoration-violet-500",
    },
  },
  minimal: {
    id: "minimal",
    label: "コンパクト",
    description: "省スペースだが太字で視認性を確保",
    colors: {
      label: "#6d28d9",
      primary: "#4c1d95",
      secondary: "#6b21a8",
      setlist: "#6b21a8",
    },
    rootClass: "overlay-theme-minimal",
    nowBlockClass: "",
    classNames: {
      label: "text-xs font-bold tracking-wide text-violet-700",
      nowTitle: "text-2xl font-bold leading-tight text-violet-950",
      nowTitleCompact: "text-xl font-bold leading-tight text-violet-950",
      nowSub: "text-base font-bold leading-snug text-violet-800",
      nowSubCompact: "text-sm font-bold leading-snug text-violet-800",
      nextTitle: "text-sm font-bold leading-snug text-violet-800",
      nextTitleCompact: "text-sm font-bold leading-snug text-violet-800",
      nextSub: "text-xs font-semibold leading-snug text-violet-800/90",
      nextSubCompact: "text-xs font-semibold leading-snug text-violet-800/90",
      sectionBorder: "border-violet-400/35",
      sub: "text-base font-bold leading-snug text-violet-800",
      setlistLabel: "text-xs font-bold tracking-wide text-violet-700/90",
      setlistLine: "text-xs font-bold leading-snug text-violet-800/85",
      fullSetlistTitle: "text-xl font-bold leading-tight text-violet-950",
      fullSetlistTitleCompact: "text-lg font-bold leading-snug break-words text-violet-950",
      fullSetlistSub: "text-sm font-bold leading-snug text-violet-800",
      fullSetlistCurrent: "font-extrabold text-violet-700",
    },
  },
  bold: {
    id: "bold",
    label: "インパクト",
    description: "曲名を大きく強調",
    colors: {
      label: "#5b21b6",
      primary: "#1e1b4b",
      secondary: "#4c1d95",
      setlist: "#4c1d95",
    },
    rootClass: "overlay-theme-bold",
    nowBlockClass: "border-l-4 border-violet-600 pl-4",
    classNames: {
      label: "text-sm font-black uppercase tracking-wider text-violet-700",
      nowTitle: "text-4xl font-black leading-none text-violet-950",
      nowTitleCompact: "text-2xl font-black leading-none text-violet-950",
      nowSub: "text-base font-bold leading-snug text-violet-900",
      nowSubCompact: "text-sm font-bold leading-snug text-violet-900",
      nextTitle: "text-base font-bold leading-snug text-violet-900",
      nextTitleCompact: "text-sm font-bold leading-snug text-violet-900",
      nextSub: "text-sm font-semibold leading-snug text-violet-900/90",
      nextSubCompact: "text-xs font-semibold leading-snug text-violet-900/90",
      sectionBorder: "border-violet-600/55",
      sub: "text-base font-bold leading-snug text-violet-900",
      setlistLabel: "text-sm font-black uppercase tracking-wider text-violet-700",
      setlistLine: "text-xs font-bold leading-snug text-violet-900/85",
      fullSetlistTitle: "text-3xl font-black leading-tight text-violet-950",
      fullSetlistTitleCompact: "text-xl font-black leading-snug break-words text-violet-950",
      fullSetlistSub: "text-base font-bold leading-snug text-violet-900",
      fullSetlistCurrent: "underline decoration-4 underline-offset-4 decoration-violet-600",
    },
  },
  cute: {
    id: "cute",
    label: "ポップ",
    description: "角丸ラベル風",
    colors: {
      label: "#db2777",
      primary: "#831843",
      secondary: "#5b21b6",
      setlist: "#5b21b6",
    },
    rootClass: "overlay-theme-cute",
    nowBlockClass: "",
    classNames: {
      label:
        "inline-flex w-fit rounded-full bg-pink-500/15 px-2.5 py-0.5 text-xs font-bold text-pink-700",
      nowTitle: "text-3xl font-black leading-tight text-pink-950",
      nowTitleCompact: "text-2xl font-black leading-tight text-pink-950",
      nowSub: "text-lg font-bold leading-snug text-violet-800",
      nowSubCompact: "text-base font-bold leading-snug text-violet-800",
      nextTitle: "text-base font-bold leading-snug text-violet-800",
      nextTitleCompact: "text-sm font-bold leading-snug text-violet-800",
      nextSub: "text-sm font-semibold leading-snug text-violet-800/90",
      nextSubCompact: "text-xs font-semibold leading-snug text-violet-800/90",
      sectionBorder: "border-pink-400/45",
      sub: "text-lg font-bold leading-snug text-violet-800",
      setlistLabel:
        "inline-flex w-fit rounded-full bg-pink-500/10 px-2 py-0.5 text-xs font-bold text-pink-600",
      setlistLine: "text-xs font-bold leading-snug text-violet-800/85",
      fullSetlistTitle: "text-2xl font-black leading-tight text-pink-950",
      fullSetlistTitleCompact: "text-xl font-black leading-snug break-words text-pink-950",
      fullSetlistSub: "text-base font-bold leading-snug text-violet-800",
      fullSetlistCurrent:
        "underline decoration-wavy decoration-2 underline-offset-4 decoration-pink-500",
    },
  },
  dark: {
    id: "dark",
    label: "ホワイト",
    description: "グリーンバック向け",
    colors: {
      label: "#c4b5fd",
      primary: "#ffffff",
      secondary: "#ede9fe",
      setlist: "#ede9fe",
    },
    rootClass: "overlay-theme-dark",
    nowBlockClass: "",
    classNames: {
      label: "text-xs font-bold uppercase tracking-wide text-violet-200",
      nowTitle: "text-3xl font-black leading-tight text-white drop-shadow-sm",
      nowTitleCompact: "text-2xl font-black leading-tight text-white drop-shadow-sm",
      nowSub: "text-lg font-bold leading-snug text-violet-100",
      nowSubCompact: "text-base font-bold leading-snug text-violet-100",
      nextTitle: "text-base font-bold leading-snug text-violet-100",
      nextTitleCompact: "text-sm font-bold leading-snug text-violet-100",
      nextSub: "text-sm font-semibold leading-snug text-violet-100/85",
      nextSubCompact: "text-xs font-semibold leading-snug text-violet-100/85",
      sectionBorder: "border-white/40",
      sub: "text-lg font-bold leading-snug text-violet-100",
      setlistLabel: "text-xs font-bold uppercase tracking-wide text-violet-200",
      setlistLine: "text-xs font-bold leading-snug text-violet-100/80",
      fullSetlistTitle: "text-2xl font-black leading-tight text-white",
      fullSetlistTitleCompact: "text-xl font-black leading-snug break-words text-white",
      fullSetlistSub: "text-base font-bold leading-snug text-violet-100",
      fullSetlistCurrent: "underline decoration-2 underline-offset-4 decoration-white",
    },
  },
  komoru: {
    id: "komoru",
    label: "ネオン",
    description: "NOW ラベルが光る配信向け",
    colors: {
      label: "#f0abfc",
      primary: "#ffffff",
      secondary: "#ede9fe",
      setlist: "#ede9fe",
    },
    rootClass: "overlay-theme-komoru",
    nowBlockClass: "rounded-xl bg-fuchsia-950/25 px-4 py-3 backdrop-blur-[2px]",
    classNames: {
      label: "text-xs font-bold text-fuchsia-200",
      nowTitle:
        "text-4xl font-black leading-tight text-white drop-shadow-[0_0_12px_rgba(232,121,249,0.45)]",
      nowTitleCompact:
        "text-2xl font-black leading-tight text-white drop-shadow-[0_0_8px_rgba(232,121,249,0.4)]",
      nowSub: "text-lg font-bold leading-snug text-violet-100",
      nowSubCompact: "text-base font-bold leading-snug text-violet-100",
      nextTitle: "text-base font-bold leading-snug text-violet-100/90",
      nextTitleCompact: "text-sm font-bold leading-snug text-violet-100/90",
      nextSub: "text-sm font-semibold leading-snug text-violet-100/80",
      nextSubCompact: "text-xs font-semibold leading-snug text-violet-100/80",
      sectionBorder: "border-fuchsia-300/35",
      sub: "text-lg font-bold leading-snug text-violet-100",
      setlistLabel: "text-xs font-bold text-fuchsia-200",
      setlistLine: "text-xs font-bold leading-snug text-violet-100/75",
      fullSetlistTitle: "text-2xl font-black leading-tight text-white",
      fullSetlistTitleCompact: "text-xl font-black leading-snug break-words text-white",
      fullSetlistSub: "text-base font-bold leading-snug text-violet-100",
      fullSetlistCurrent:
        "text-fuchsia-200 underline decoration-2 underline-offset-4 decoration-fuchsia-400",
    },
  },
};

export function getOverlayThemeDefinition(theme: OverlayTheme): OverlayThemeDefinition {
  return OVERLAY_THEMES[theme] ?? OVERLAY_THEMES.simple;
}

export const OVERLAY_THEME_COLORS: Record<OverlayTheme, OverlayThemeColors> = Object.fromEntries(
  Object.values(OVERLAY_THEMES).map((t) => [t.id, t.colors]),
) as Record<OverlayTheme, OverlayThemeColors>;

export function isOverlayTheme(value: string): value is OverlayTheme {
  return value in OVERLAY_THEMES;
}
