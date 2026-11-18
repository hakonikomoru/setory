/** リンク共有・検索結果用（OG / Twitter / meta description で共通） */
export const SITE_DESCRIPTION =
  "カラオケ・歌練習・配信向けのセトリ作成。インストール不要で、この端末に保存して使えます。";

export const SITE_TITLE = "Setory";

export const SITE_TITLE_FULL = "Setory — 歌うためのセトリ作成";

/** 本番 URL（NEXT_PUBLIC_SITE_URL が無いときの canonical / OG / サイトマップ用） */
export const SITE_URL_DEFAULT = "https://setory.vercel.app";

export function siteMetadataBase(): URL {
  const url = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (url) {
    try {
      return new URL(url);
    } catch {
      // 不正な値は既定の本番 URL にフォールバック
    }
  }
  return new URL(SITE_URL_DEFAULT);
}

/** パスから絶対 URL を作る（サイトマップ・JSON-LD 用） */
export function absoluteUrl(path: string): string {
  return new URL(path, siteMetadataBase()).toString();
}
