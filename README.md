# Craft Valley 海外消費者向けホームページ

日本の工芸品・食品を海外のお客様に紹介する、多言語（英語/日本語）の静的サイトです。
デザインは **和風** に一本化しています。**商品・職人・お知らせ・イベント・ページの文言は管理画面から非エンジニアでも更新**できます。

> **⚠️ 非公開にしている機能があります**（削除はしていません）
>
> | 機能 | 場所 | 状態 | 戻し方 |
> |---|---|---|---|
> | **シンプル版デザイン** | `simple/` | 導線を外し、検索エンジンにも載せていません | 下記「シンプル版を再公開する」 |
> | **SNS投稿ページ** | `wafuu/sns.html` `simple/sns.html` | メニューから外し、noindex | `shared/js/cv-restore-sns.md` |
>
> ファイルはすべて残っているので、URLを直接入力すれば表示できます。

---

## フォルダ構成

```
.
├── index.html            … トップ（初回はアンケート → 和風サイトへ）
├── admin.html            … ★編集画面（管理用・日本語UI）コンテンツと文言を切り替えて編集
├── admin-text.html       … 旧・文言編集画面（admin.html に統合済み。案内ページとして残置）
├── 編集の手引き.md        … 非エンジニア向けの操作マニュアル
├── アンケート設定手順.md  … アンケート回答をGoogleフォームに貯める設定
│
├── shared/js/
│   ├── data.js           … ★コンテンツのデータ（編集画面「コンテンツ」が書き出す）
│   ├── translations.js   … ★ページの文言（編集画面「ページの文言」が書き出す）
│   ├── cv-runtime.js     … 画像表示・プレビューの共通プログラム（さわらない）
│   ├── cv-map.js         … 地域マップ（国土地理院の地図に対象地域を表示）
│   ├── cv-intro.js       … オープニング演出・キャラクター
│   └── cv-restore-sns.md … SNSページを再公開する手順
├── shared/data/
│   └── cv-area.js        … 対象地域（飛能越 6市）の図形データ
├── shared/img/           … ロゴ・ファビコン・キャラ画像
│
├── wafuu/                … ★公開中のデザイン（和風）
└── simple/               … 非公開のデザイン（シンプル）。ファイルは残しています
```

`wafuu/` も `simple/` も同じ `shared/js/data.js` と `translations.js` を読み込みます。

---

## コンテンツの編集（非エンジニア向け）

詳しくは [編集の手引き.md](編集の手引き.md) を参照。要点だけ:

1. `admin.html` をブラウザで開く
2. 商品 / 職人 / お知らせ / イベントを入力・保存（日本語・英語・画像）
3. 「👁 プレビュー」で見た目を確認
4. 「💾 data.js を書き出す」→ ダウンロードした `data.js` を `shared/js/data.js` に上書き

### GitHub上での公開（コマンド不要）
1. 編集画面で `data.js` を書き出す
2. GitHubのサイトで `shared/js/data.js` を開く →（鉛筆 or Upload files）→ 中身を差し替えて **Commit**
3. GitHub Pages が自動で本番反映

---

## 編集画面と公開サイトを同時に開く（2画面運用）

ブラウザのタブを2つ開くだけです。

- タブA … `admin.html`（編集画面）
- タブB … `wafuu/index.html` など（公開サイトの見た目）

ローカルで確認する場合は、フォルダ直下で簡易サーバーを起動してから開くと画像も正しく表示されます。

```bash
# 例: Python の簡易サーバー
python -m http.server 8123
# → http://localhost:8123/admin.html  と  http://localhost:8123/wafuu/index.html
```

---

## GitHub Pages で公開する手順

1. このフォルダをGitHubリポジトリにプッシュ（下記）
2. リポジトリの **Settings → Pages** で、Source を `Deploy from a branch` → `main` / `(root)` に設定
3. 数十秒後、`https://<ユーザー名>.github.io/<リポジトリ名>/` で公開

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<ユーザー名>/<リポジトリ名>.git
git push -u origin main
```

> `admin.html` も公開サイト上に存在しますが、編集は「書き出し方式」のため、
> 編集画面を開かれても本番データが勝手に書き換わることはありません。
> （`shared/js/data.js` を更新・コミットして初めて反映されます）

---

## 触らないファイル

- `shared/js/cv-runtime.js` … 画像表示・プレビューの仕組み
- `各テーマ/js/main.js` … 各デザインの表示プログラム

更新するのは **`shared/js/data.js` だけ**（編集画面が自動生成します）。

---

## シンプル版を再公開する

シンプル版（`simple/`）は 2026年9月に非公開にしましたが、ファイルはそのまま残しています。
元に戻す場合は、次の3か所を変更してください。

1. **`index.html`** … `var SINGLE_STYLE = "wafuu";` を `var SINGLE_STYLE = "";` にする
   （アンケートのあとに和風／シンプルの選択画面が出るようになります）
2. **`index.html`** … `simple/index.html` へのリンク（`choice-card card-f`）から `style="display:none"` を削除
3. **`admin.html`** … `<option value="simple" hidden>` の `hidden` を削除（2か所）

さらに検索エンジンにも載せるなら、`simple/*.html` の
`<meta name="robots" content="noindex,nofollow">` の行を削除してください。

各ページのフッターにある「← Version Select」リンクも `style="display:none"` を外すと復活します。

