# SNS（交流）ページを再開する手順

現在、SNSページ（`sns.html`）へのメニュー導線を外しています。
**ページ本体と機能は削除していません。** 下記の手順でいつでも戻せます。

## いま何が起きているか

| | 状態 |
|---|---|
| `wafuu/sns.html` `simple/sns.html` | **残しています**（中身もそのまま） |
| メニューからのリンク | 外しました（各ページに理由のコメントを残しています） |
| 検索エンジンへの掲載 | `noindex` を付けて出ないようにしています |
| 投稿データ `data.js` の `sns` | **残しています** |

URLを直接入力すればページ自体は表示されます。

## 再開のしかた

### ① メニューにリンクを戻す

`wafuu/` と `simple/` の各HTMLから、次の行を探します。

```html
<!-- SNS（交流）ページへの導線は現在非表示です。… -->
```

**和風（wafuu）** — この行を、以下に置き換えます。

```html
<li>
  <a href="sns.html">
    <span class="nav-ja">交流</span>
    <span class="nav-en">Social</span>
  </a>
</li>
```

**シンプル（simple）** — メニュー内の場合は以下に置き換えます。

```html
<li><a href="sns.html" data-i18n="nav.sns">Social</a></li>
```

モバイル用メニュー（`mobile-menu` の中）の場合は、`<li>` を付けずに以下だけを置き換えます。

```html
<a href="sns.html" data-i18n="nav.sns">Social</a>
```

### ② 検索エンジンへの掲載を戻す

`wafuu/sns.html` と `simple/sns.html` から、次の2行を削除します。

```html
<!-- 現在は一般公開していないページです（検索結果に出しません） -->
<meta name="robots" content="noindex,nofollow">
```

### ③ 保存してGitHubにアップロードすれば完了です

---

*作成: 2026年8月*
