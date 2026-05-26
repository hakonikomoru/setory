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
