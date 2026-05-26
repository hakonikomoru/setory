export type SongMood = "upbeat" | "mid" | "ballad";

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
  createdAt: string;
  updatedAt: string;
};

export type SuggestOptions = {
  theme: string;
  targetMinutes: number;
  preferredTags: string[];
  moodFlow: "warmup-peak-cooldown" | "steady" | "surprise";
  maxSongs?: number;
};

export type AppData = {
  songs: Song[];
  setlists: Setlist[];
};
