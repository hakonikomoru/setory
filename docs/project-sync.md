# setory — Project Sync

> ChatGPT / 他 AI 向けの同期用ドキュメント。実装前に読むこと。

<!-- sync:auto:meta:start -->
最終更新の想定リポジトリ: `hakonikomoru/setory`（`main`・`db2f30a`・2026-05-27・`npm run sync:project-docs` 自動反映）
<!-- sync:auto:meta:end -->

---

## 1. 概要

| 項目         | 内容                      |
| ------------ | ------------------------- |
| リポジトリ   | hakonikomoru/setory       |
| ローカルパス | `/Users/ebata/app/setory` |

---

## 2. ディレクトリ構成

> `<!-- sync:auto:... -->` は **`npm run sync:project-docs`** が上書きします（手編集しない）。

<!-- sync:auto:directory-tree:start -->
```
setory/
├── public/
│   └── favicon.svg
├── scripts/
│   ├── project-sync-core.mjs
│   └── sync-project-docs.mjs
├── src/
│   ├── app/
│   │   ├── api/
│   │   ├── builder/
│   │   ├── globals.css
│   │   ├── go/
│   │   ├── layout.tsx
│   │   ├── library/
│   │   ├── overlay/
│   │   ├── page.tsx
│   │   ├── setlists/
│   │   └── suggest/
│   ├── components/
│   │   ├── AppNav.tsx
│   │   ├── AppShell.tsx
│   │   ├── CopySetlistButton.tsx
│   │   ├── ExternalSongSearch.tsx
│   │   ├── Footer.tsx
│   │   ├── OverlayControlPanel.tsx
│   │   ├── OverlayDisplay.tsx
│   │   ├── OverlayNowTitleMarquee.tsx
│   │   ├── OverlayObsOnly.tsx
│   │   ├── OverlayPreviewFrame.tsx
│   │   ├── OverlaySetlistColorPicker.tsx
│   │   ├── OverlaySettings.tsx
│   │   ├── RegisteredSongsPanel.tsx
│   │   ├── RowActionButton.tsx
│   │   ├── SearchInput.tsx
│   │   ├── SetlistBuilder.tsx
│   │   ├── SetlistSongDisplay.tsx
│   │   ├── SongAddTabs.tsx
│   │   ├── SongForm.tsx
│   │   ├── SongList.tsx
│   │   ├── SongStreamingSearchLinks.tsx
│   │   ├── StreamingServiceIcon.tsx
│   │   └── TemplateSongImport.tsx
│   ├── config/
│   │   └── site.ts
│   ├── lib/
│   │   ├── musicbrainz.test.ts
│   │   ├── musicbrainz.ts
│   │   ├── overlay-colors.test.ts
│   │   ├── overlay-colors.ts
│   │   ├── overlay-theme.test.ts
│   │   ├── overlay-theme.ts
│   │   ├── overlay.test.ts
│   │   ├── overlay.ts
│   │   ├── sample-songs.ts
│   │   ├── setlist-engine.test.ts
│   │   ├── setlist-engine.ts
│   │   ├── site-metadata.ts
│   │   ├── song-import.test.ts
│   │   ├── song-import.ts
│   │   ├── song-match.test.ts
│   │   ├── song-match.ts
│   │   ├── storage.ts
│   │   ├── streaming-brand-icons.ts
│   │   ├── streaming-links.test.ts
│   │   ├── streaming-links.ts
│   │   ├── use-app-data.ts
│   │   ├── use-element-width.ts
│   │   └── use-overlay-data.ts
│   └── types/
│       └── setlist.ts
```
<!-- sync:auto:directory-tree:end -->

### 2.1 App Router（自動生成）

<!-- sync:auto:pages:start -->
| パス | ファイル |
|------|----------|
| `/` | `page.tsx` |
| `/builder` | `builder/page.tsx` |
| `/library` | `library/page.tsx` |
| `/overlay` | `overlay/page.tsx` |
| `/setlists` | `setlists/page.tsx` |
<!-- sync:auto:pages:end -->

---

## 3. 手動で追記する内容

- プロダクト方針・環境変数・デプロイ手順
- 削除した機能の説明が残っていないか、変更のたびに確認する

### 制作クレジット（komolab 共通）

- 正式表記: **komolab - こもらぼ -**（`KomoLab` / `こもラボ` などに揺らさない）
- フッター: `制作・運営：komolab - こもらぼ -`（`src/components/Footer.tsx`）
- 設定: `src/config/site.ts` の `credit`（将来 `credit.href` でリンク化可）
- ハッシュタグ `#komolab` / `#こもらぼ` は README に記載。フッターは制作名のみ
