# 現場スケッチ

「いいな」「うわっ」が来た瞬間の身体の一次データを一行で記録する練習帳。
読者は未来の自分だけ。詩を狙わない。下手なほど信用できる。

## ファイル構成

| ファイル | 役割 |
|---|---|
| `index.html` | アプリ本体（これ1枚で動く。HTML+CSS+JS内蔵） |
| `manifest.webmanifest` | PWA設定（ホーム画面追加時の名前・アイコン・全画面表示） |
| `sw.js` | service worker（オフラインでも開けるようにする） |
| `icon-192.png` / `icon-512.png` | ホーム画面用アイコン |

## 使い方（アプリ内）

1. 右上「設定」→ Anthropic APIキーを入力して保存（初回のみ。端末内にだけ保存される）
2. 現場と本文を書いて「書き留める」
3. 気が向いたら各付箋の「仕分けてもらう（任意）」→ 映る / 写生 / 映らない のハンコが押される
4. 「全件を書き出す」→ 整形テキストがクリップボードにコピーされる（Notion貼り付け用）

判定は補助輪。書くだけで完結してよい。

## スマホのホーム画面から1タップで開く手順（GitHub Pages・推奨）

GitHub Pages に置くと、無料でHTTPS配信され、PWAとして全画面起動できる。

1. https://github.com にアクセスしてアカウントを作る（既にあれば不要）
2. 右上「+」→「New repository」
   - Repository name: `genba-sketchbook`（何でもよい）
   - **Private ではなく Public** を選ぶ（Pages無料枠はPublicのみ）
   - 「Create repository」
3. 「uploading an existing file」リンクをクリック → このフォルダの5ファイル
   （index.html / manifest.webmanifest / sw.js / icon-192.png / icon-512.png）を
   ドラッグ＆ドロップ → 「Commit changes」
4. リポジトリの「Settings」→ 左メニュー「Pages」
   - Branch: `main` / フォルダ: `/ (root)` を選んで「Save」
5. 1〜2分待つと `https://＜ユーザー名＞.github.io/genba-sketchbook/` が公開される
6. スマホのChromeでそのURLを開く → メニュー（⋮）→「ホーム画面に追加」
   → アイコンから1タップで全画面起動できるようになる

※ ソースコードは公開されるが、APIキーはコードに含まれず各端末のブラウザ内にしか保存されないので問題ない。

## ローカルで試す（PC）

`index.html` をダブルクリックするだけでも動く（file:// でもlocalStorage・API呼び出しは機能する。PWA機能のみ無効）。

## データについての注意

- 記録はブラウザのlocalStorageに保存される。**ブラウザのデータ消去やサイトデータ削除で消える**ので、たまに「全件を書き出す」でNotionへ退避すること。
- 別の端末・別のブラウザとは同期しない（端末ごとに独立した帳面になる）。
- APIキーもlocalStorage保存。共用端末では設定しないこと。

## 判定機能の仕様メモ

- Anthropic Messages API を直接呼ぶ（`anthropic-dangerous-direct-browser-access: true` ヘッダー使用。個人利用前提）
- モデルは claude-sonnet-5 固定（2026-07-18あっちゃん決定。変更したいときは index.html の MODEL 定数を書き換える）
- 判定は3種のみ（映る / 写生 / 映らない）。点数化はしない設計。
  - 「写生」は旧称「一段降りろ」（2026-07-18のセッション⑤知見で改称）。表示は「写生に戻ろう」＋質問形の補助質問。
- 設定に「二行写生モード（実験中）」あり。外（外界に映ったもの）と内（身体に映ったもの）を分けて書ける。片方だけでも保存でき、揃っているかの判定はしない（検証中の仮説のための記録用）。
