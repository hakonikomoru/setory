/** リンク共有・検索結果用（OG / Twitter / meta description で共通） */
export const SITE_DESCRIPTION =
  "カラオケ・歌練習・配信向けのセトリ作成。インストール不要で、この端末に保存して使えます。";

export const SITE_TITLE = "Setory";

export const SITE_TITLE_FULL = "Setory — 歌うためのセトリ作成";

export function siteMetadataBase(): URL | undefined {
  const url = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!url) return undefined;
  try {
    return new URL(url);
  } catch {
    return undefined;
  }
}
