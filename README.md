# Simple Alarm

ミニマルなUIのブラウザ向けアラームアプリ。HTML / CSS / JavaScript のみで動作します。

## 特徴

- 現在時刻を秒単位で表示
- 時刻を指定してアラームを複数セット可能
- アラームは `localStorage` に保存され、リロードしても残る
- 鳴動時は Web Audio API でビープ音を再生

## 使い方

`index.html` をブラウザで開くだけ。サーバーは不要です。

```sh
open index.html
```

## ファイル

- `index.html` — マークアップ
- `style.css` — スタイル
- `script.js` — アラームのロジック
