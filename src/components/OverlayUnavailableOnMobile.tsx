import Link from "next/link";

export default function OverlayUnavailableOnMobile() {
  return (
    <main className="mx-auto w-full max-w-lg px-4 py-12">
      <div className="rounded-2xl border border-violet-100 bg-white/90 p-6 shadow-md">
        <h1 className="text-2xl font-black text-violet-950">オーバーレイ</h1>
        <p className="mt-3 text-sm leading-7 text-violet-800">
          OBS オーバーレイの操作・表示は PC（タブレット横画面以上）向けの機能です。スマホでは曲庫・セトリ作成・保存一覧をご利用ください。
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <Link
            href="/builder"
            className="inline-flex items-center justify-center rounded-xl bg-violet-600 px-4 py-2 text-sm font-bold text-white"
          >
            セトリを作る
          </Link>
          <Link
            href="/library"
            className="inline-flex items-center justify-center rounded-xl border border-violet-200 bg-white px-4 py-2 text-sm font-semibold text-violet-800"
          >
            曲庫
          </Link>
        </div>
      </div>
    </main>
  );
}
