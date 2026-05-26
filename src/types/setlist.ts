export type SongMood = "upbeat" | "mid" | "ballad";

export type OverlayMode = "current" | "currentAndNext" | "fullSetlist";

export type OverlayTheme = "simple" | "minimal" | "bold" | "cute" | "dark" | "komoru";

export type Song = {
  id: string;
  title: string;
  artist: string;
  durationSec: number;
  mood: SongMood;
  tags: string[];
  notes?: string;
  /** 曲庫への登録日時（ISO 8601） */
  createdAt: string;
};

export type Setlist = {
  id: string;
  name: string;
  songIds: string[];
  theme?: string;
  /** コピー用テキスト・一覧で曲の尺を出さない */
  hideDuration?: boolean;
  /** コピー用テキスト・一覧でアーティスト名を出さない */
  hideArtist?: boolean;
  /** OBS オーバーレイ表示のみでアーティスト名を出さない */
  overlayHideArtist?: boolean;
  /** OBS オーバーレイ表示のみで曲の尺を出さない */
  overlayHideDuration?: boolean;
  /** オーバーレイでハイライトする曲（曲庫の song id） */
  currentSongId?: string;
  /** 1曲目表示時に NEXT を出さない（false のときだけ NEXT を表示） */
  overlaySuppressNext?: boolean;
  overlayVisible?: boolean;
  overlayMode?: OverlayMode;
  overlayTheme?: OverlayTheme;
  /** オーバーレイ全体の文字色（#rrggbb） */
  overlaySetlistColor?: string;
  /** オーバーレイ表示全体の最大幅（px） */
  overlaySetlistMaxWidthPx?: number;
  createdAt: string;
  updatedAt: string;
};

export type AppData = {
  songs: Song[];
  setlists: Setlist[];
};
