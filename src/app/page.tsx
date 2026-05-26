import Link from "next/link";
import { Fragment } from "react";

type Feature = {
  id: string;
  href: string;
  title: string;
  body: string;
  accent: string;
  note?: string;
  desktopLinkOnly?: boolean;
};

const features: Feature[] = [
  {
    id: "library",
    href: "/library",
    title: "曲庫を管理",
    body: "MusicBrainz から曲を検索して取り込むか、手入力で登録。カラオケ・歌練習・配信で歌う曲をストックできます。",
    accent: "bg-violet-600 text-white",
  },
  {
    id: "builder",
    href: "/builder",
    title: "セトリを組み立て",
    body: "カラオケの曲順、練習プラン、配信セトリを並べ替えてコピー。PC では OBS で現在曲・次の曲も表示できます。",
    accent: "bg-fuchsia-600 text-white",
  },
  {
    id: "overlay",
    href: "/overlay",
    title: "オーバーレイ操作",
    body: "配信中に現在曲・次の曲を切り替え。OBS には表示専用 URL をブラウザソースに登録。",
    note: "PC版ブラウザのみ",
    accent: "bg-indigo-600 text-white",
    desktopLinkOnly: true,
  },
  {
    id: "setlists",
    href: "/setlists",
    title: "保存したセトリ",
    body: "過去のセトリを一覧・編集・再コピー。この端末に保存されるので、あとからすぐ呼び出せます。",
    accent: "bg-violet-100 text-violet-900",
  },
];

const cardBaseClass =
  "rounded-2xl border border-violet-100 bg-white/85 p-6 shadow-md shadow-violet-100/40";
const cardLinkClass = `${cardBaseClass} transition hover:-translate-y-0.5 hover:shadow-lg`;

function FeatureCardContent({ feature }: { feature: Feature }) {
  return (
    <>
      <span
        className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${feature.accent}`}
      >
        {feature.title}
      </span>
      <p className="mt-4 text-sm leading-7 text-violet-800">{feature.body}</p>
      {feature.note ? (
        <p className="mt-2 text-xs font-normal text-violet-500">{feature.note}</p>
      ) : null}
    </>
  );
}

function FeatureCard({ feature }: { feature: Feature }) {
  if (feature.desktopLinkOnly) {
    return (
      <Fragment key={feature.id}>
        <div className={`${cardBaseClass} md:hidden`}>
          <FeatureCardContent feature={feature} />
        </div>
        <Link href={feature.href} className={`${cardLinkClass} hidden md:block`}>
          <FeatureCardContent feature={feature} />
        </Link>
      </Fragment>
    );
  }

  return (
    <Link key={feature.id} href={feature.href} className={cardLinkClass}>
      <FeatureCardContent feature={feature} />
    </Link>
  );
}

export default function Home() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-5xl flex-col px-4 py-10">
      <section className="rounded-[2rem] border border-violet-100 bg-white/90 p-8 shadow-xl shadow-violet-100/60 sm:p-12">
        <p className="mb-4 inline-flex rounded-full bg-fuchsia-100 px-4 py-2 text-sm font-bold text-fuchsia-800">
          配信・カラオケ・歌練習
        </p>
        <h1 className="text-4xl font-black tracking-tight text-violet-950 sm:text-5xl">
          Setory
        </h1>
        <p className="mt-3 text-xl font-bold text-violet-900 sm:text-2xl">
          歌うためのセトリ作成
        </p>
        <p className="mt-4 max-w-2xl text-base leading-8 text-violet-800/90 sm:text-lg">
          カラオケの持ち歌リスト、歌練習の曲順づくり、歌配信・ライブのセットリストまで、ひとつのアプリで作れます。
          曲庫の管理、曲順の調整、OBS オーバーレイ、コピー用テキストの出力まで、インストール不要ですぐ使えます。
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
          <FeatureCard key={feature.id} feature={feature} />
        ))}
      </section>
    </main>
  );
}
