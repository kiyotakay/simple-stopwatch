# Stopwatch

シンプルなストップウォッチのWebサイト．依存ライブラリなしの静的サイトです．

## 機能

- 1/100秒（センチ秒）精度の計測
- スタート / ストップ / 再開 / リセット
- ラップ計測（最速ラップを緑，最遅ラップを赤で表示）
- キーボードショートカット: `Space` 開始・停止，`L` ラップ，`R` リセット
- ライト / ダークモード自動切り替え
- スマートフォン対応

計測には `performance.now()` を使い，描画は `requestAnimationFrame` で行っています．タブが非表示の間は描画を止め，復帰時に実時間へ追従します．

## 構成

```
public/
  index.html
  styles.css
  app.js
wrangler.jsonc    # Cloudflare Workers (static assets) の設定
```

## ローカルで動かす

`public/index.html` をブラウザで開くだけで動きます．Wranglerを使う場合は:

```bash
npx wrangler dev
```

## デプロイ

Cloudflare Workers の静的アセット機能で配信しています．

```bash
npx wrangler deploy
```
