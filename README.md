# Craftvalley 海外消費者向けホームページ

日本の工芸品・食品を海外のお客様に紹介する、多言語（英語/日本語）の静的サイトです。
6つのデザイン案を比較でき、**商品・職人・お知らせ・イベントは管理画面から非エンジニアでも更新**できます。

---

## フォルダ構成

```
.
├── index.html            … デザイン案を選ぶトップ（6案の入口）
├── admin.html            … ★編集画面（管理用・日本語UI）
├── 編集の手引き.md        … 非エンジニア向けの操作マニュアル
│
├── shared/js/
│   ├── data.js           … ★全コンテンツのデータ（編集画面が書き出す唯一のファイル）
│   ├── cv-runtime.js     … 画像表示・プレビューの共通プログラム（さわらない）
│   └── translations.js   … UIの多言語テキスト
│
├── pop/  simple/  stylish/  threed/  wafuu/  wafuu-tech/
│       … 6つのデザイン案（各 css/style.css, js/main.js を持つ）
```

**6案すべてが共通の `shared/js/data.js` を読み込みます。** データを1か所更新すれば全案に反映されます。

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
- タブB … `pop/index.html` など（公開サイトの見た目）

ローカルで確認する場合は、フォルダ直下で簡易サーバーを起動してから開くと画像も正しく表示されます。

```bash
# 例: Python の簡易サーバー
python -m http.server 8123
# → http://localhost:8123/admin.html  と  http://localhost:8123/pop/index.html
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
