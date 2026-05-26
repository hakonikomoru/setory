export type StarterPack = {
  id: string;
  label: string;
  description: string;
  /** MusicBrainz Lucene クエリ（1件あたり最大 perQueryLimit 曲） */
  queries: string[];
  perQueryLimit?: number;
};

export const STARTER_PACKS: StarterPack[] = [
  {
    id: "jpop-streaming",
    label: "J-POP・ストリーミング定番",
    description:
      "YOASOBI、米津玄師、あいみょん など人気アーティストの楽曲をまとめて取得します（数百曲・数十秒）。",
    perQueryLimit: 80,
    queries: [
      "artist:YOASOBI",
      "artist:米津玄師",
      "artist:あいみょん",
      "artist:優里",
      "artist:Ado",
      'artist:"Official HIGE DANDism"',
      "artist:King Gnu",
      "artist:back number",
      "artist:藤井風",
      "artist:Vaundy",
    ],
  },
  {
    id: "anime-game",
    label: "アニソン・ゲーム音楽",
    description:
      "LiSA、Aimer、ヨルシカ などアニメ・ゲーム系でよく歌われる曲をまとめて取得します。",
    perQueryLimit: 80,
    queries: [
      "artist:LiSA",
      "artist:Aimer",
      "artist:ヨルシカ",
      "artist:ReoNa",
      "artist:米津玄師",
      "artist:LiSA AND recording:鬼滅",
      "artist:Cyua",
      "artist:ClariS",
      "artist:Liella!",
      "artist:TrySail",
    ],
  },
  {
    id: "vocaloid-utattemita",
    label: "ボカロ・歌ってみた定番",
    description: "ボーカロイド楽曲やカバーでよく使われる名義の曲をまとめて取得します。",
    perQueryLimit: 70,
    queries: [
      "artist:初音ミク",
      "artist:DECO*27",
      "artist:ヨルシカ",
      "artist:Kanaria",
      "artist:すりぃ",
      "artist:MASA WORKS DESIGN",
      "artist:ツユ",
      "artist:n-buna",
    ],
  },
];

export function getStarterPack(packId: string): StarterPack | undefined {
  return STARTER_PACKS.find((pack) => pack.id === packId);
}
