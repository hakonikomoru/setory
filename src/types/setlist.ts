export type SongMood = "upbeat" | "mid" | "ballad";

export type OverlayMode = "current" | "currentAndNext" | "fullSetlist";

export type OverlayTheme = "simple" | "cute" | "dark" | "komoru";

export type Song = {
  id: string;
  title: string;
  artist: string;
  durationSec: number;
  mood: SongMood;
  tags: string[];
  notes?: string;
};

export type Setlist = {
  id: string;
  name: string;
  songIds: string[];
  theme?: string;
  /** コピー用テキスト・一覧で曲の尺を出さない */
  hideDuration?: boolean;
  /** オーバーレイでハイライトする曲（曲庫の song id） */
  currentSongId?: string;
  /** 1曲目表示時に NEXT を出さない（false のときだけ NEXT を表示） */
  overlaySuppressNext?: boolean;
  overlayVisible?: boolean;
  overlayMode?: OverlayMode;
  overlayTheme?: OverlayTheme;
  createdAt: string;
  updatedAt: string;
};

export type AppData = {
  songs: Song[];
  setlists: Setlist[];
};
