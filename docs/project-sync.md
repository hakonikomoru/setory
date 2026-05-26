# setory — Project Sync

> ChatGPT / 他 AI 向けの同期用ドキュメント。実装前に読むこと。

<!-- sync:auto:meta:start -->
最終更新の想定リポジトリ: `hakonikomoru/setory`（`main`・`unknown`・2026-05-26・`npm run sync:project-docs` 自動反映）
<!-- sync:auto:meta:end -->

---

## 1. 概要

| 項目 | 内容 |
|------|------|
| リポジトリ | hakonikomoru/setory |
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
│   │   ├── builder/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── library/
│   │   ├── page.tsx
│   │   ├── setlists/
│   │   └── suggest/
│   ├── components/
│   │   ├── AppNav.tsx
│   │   ├── CopySetlistButton.tsx
│   │   ├── SetlistBuilder.tsx
│   │   ├── SongForm.tsx
│   │   └── SongList.tsx
│   ├── lib/
│   │   ├── sample-songs.ts
│   │   ├── setlist-engine.test.ts
│   │   ├── setlist-engine.ts
│   │   ├── storage.ts
│   │   └── use-app-data.ts
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
| `/setlists` | `setlists/page.tsx` |
| `/suggest` | `suggest/page.tsx` |
<!-- sync:auto:pages:end -->

---

## 3. 手動で追記する内容

- プロダクト方針・環境変数・デプロイ手順
- 削除した機能の説明が残っていないか、変更のたびに確認する
