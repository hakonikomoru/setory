import Link from "next/link";

const features = [
  {
    href: "/library",
    title: "曲庫を管理",
    body: "MusicBrainz から曲を検索して取り込むか、手入力で登録。配信で歌う曲だけをストックできます。",
    accent: "bg-violet-600 text-white",
  },
  {
    href: "/builder",
    title: "セトリを組み立て",
    body: "曲を選んで並べ替え。合計時間を見ながら、配信用のテキストをワンクリックでコピー。",
    accent: "bg-fuchsia-600 text-white",
  },
  {
    href: "/suggest",
    title: "自動提案",
    body: "テーマ・尺・タグから曲順を提案。盛り上がりの流れ（ウォームアップ→ピーク→締め）も選べます。",
    accent: "bg-indigo-600 text-white",
  },
  {
    href: "/setlists",
    title: "保存したセトリ",
    body: "過去のセトリを一覧・編集・再コピー。ブラウザのローカルストレージに保存されます。",
    accent: "bg-violet-100 text-violet-900",
  },
];

export default function Home() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-5xl flex-col px-4 py-10">
      <section className="rounded-[2rem] border border-violet-100 bg-white/90 p-8 shadow-xl shadow-violet-100/60 sm:p-12">
        <p className="mb-4 inline-flex rounded-full bg-fuchsia-100 px-4 py-2 text-sm font-bold text-fuchsia-800">
          歌配信・ライブ向け
        </p>
        <h1 className="text-4xl font-black tracking-tight text-violet-950 sm:text-5xl">
          Setory
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-8 text-violet-800/90 sm:text-lg">
          セットリスト作成に必要な機能をひとつにまとめたWebアプリです。
          曲庫の管理、曲順の調整、テーマに沿った自動提案、配信説明欄向けのコピー出力まで、ブラウザだけで完結します。
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            href="/builder"
            className="inline-flex items-center justify-center rounded-2xl bg-violet-600 px-6 py-3 font-bold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700"
          >
            セトリを作る
          </Link>
          <Link
            href="/library"
            className="inline-flex items-center justify-center rounded-2xl border-2 border-violet-200 bg-white px-6 py-3 font-bold text-violet-800 transition hover:bg-violet-50"
          >
            曲庫を見る
          </Link>
        </div>
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-2">
        {features.map((feature) => (
          <Link
            key={feature.href}
            href={feature.href}
            className="rounded-2xl border border-violet-100 bg-white/85 p-6 shadow-md shadow-violet-100/40 transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            <span
              className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${feature.accent}`}
            >
              {feature.title}
            </span>
            <p className="mt-4 text-sm leading-7 text-violet-800">{feature.body}</p>
          </Link>
        ))}
      </section>
    </main>
  );
}
