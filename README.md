# Setory

配信・カラオケ・歌練習向けのセトリ（セットリスト）作成Webアプリです。

## 機能

- **曲庫** … 曲名・アーティスト・尺・タグの管理（[MusicBrainz](https://musicbrainz.org/) から検索して取り込み可）
- **セトリ作成** … 曲の追加・並べ替え（ドラッグ / ↑↓）・合計時間表示
- **保存・コピー** … ブラウザの localStorage に保存、配信用テキストをワンクリックコピー
- **OBS オーバーレイ** … `/overlay` で操作・表示、`/overlay?obs=1&id=セトリID` を OBS ブラウザソースに指定

## 開発

```bash
cd /Users/ebata/app/setory
npm install
npm run dev
```

- `npm run build` … 本番ビルド
- `npm test` … Vitest
- `npm run sync:project-docs` … `docs/project-sync.md` 更新

## データ

すべてクライアントの localStorage に保存されます。初回はサンプル曲が自動投入されます。
