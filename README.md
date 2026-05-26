# Setory

歌配信・ライブ向けのセットリスト作成Webアプリです。

## 機能

- **曲庫** … 曲名・アーティスト・尺・雰囲気・タグの管理（[MusicBrainz](https://musicbrainz.org/) から検索・スターターパックで数百曲の一括取り込み可）
- **セトリ作成** … 曲の追加・並べ替え（ドラッグ / ↑↓）・合計時間表示
- **自動提案** … テーマ・目標尺・タグから曲順をローカル計算（API不要）
- **保存・コピー** … ブラウザの localStorage に保存、配信用テキストをワンクリックコピー

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
