// ================================================================
// Craft Valley — 共通ランタイム (cv-runtime.js)
//   ※このファイルは「コード」です。管理画面(admin.html)が書き出すのは
//     shared/js/data.js だけなので、このファイルは編集しないでください。
//   役割:
//     1) 管理画面で登録した実際の画像をサイトに表示する
//     2) 管理画面の「プレビュー」機能 (?cvpreview=1) でデータを差し替える
// ================================================================

(function () {
  "use strict";

  // ── 文字列が「実際の画像」かどうかを判定 ─────────────────────────
  // PLACEHOLDER（説明テキスト）はプレースホルダー表示のまま。
  // data: で始まる埋め込み画像 / http(s) / 画像ファイルパスは実画像とみなす。
  function isRealImage(str) {
    if (!str || typeof str !== "string") return false;
    if (/^\s*PLACEHOLDER/i.test(str)) return false;
    if (/^data:image\//i.test(str)) return true;
    if (/^https?:\/\//i.test(str)) return true;
    if (/\.(jpe?g|png|webp|gif|avif|svg)(\?.*)?$/i.test(str.trim())) return true;
    return false;
  }
  window.CV_isRealImage = isRealImage;

  // ── プレースホルダーを実画像に差し替え ──────────────────────────
  function upgradePlaceholder(ph) {
    if (!ph || ph.dataset.cvUpgraded) return;
    var note = ph.querySelector(".image-placeholder-note");
    var src = note ? note.textContent.trim() : "";
    if (!isRealImage(src)) return;

    ph.dataset.cvUpgraded = "1";
    // 実画像表示用にコンテナを整える（点線枠・背景を消す）
    ph.style.background = "none";
    ph.style.border = "none";
    ph.style.padding = "0";
    ph.style.overflow = "hidden";
    ph.style.position = "relative";

    var img = document.createElement("img");
    img.src = src;
    img.loading = "lazy";
    img.alt = "";
    img.style.cssText =
      "position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;";
    ph.innerHTML = "";
    ph.appendChild(img);
  }

  function upgradeAll(root) {
    var scope = root && root.querySelectorAll ? root : document;
    scope.querySelectorAll(".image-placeholder").forEach(upgradePlaceholder);
  }

  // 初回 + DOM変化を監視（main.js が後から描画するため）
  function startImageUpgrade() {
    upgradeAll(document);
    if (typeof MutationObserver !== "undefined") {
      var obs = new MutationObserver(function (mutations) {
        for (var i = 0; i < mutations.length; i++) {
          var added = mutations[i].addedNodes;
          for (var j = 0; j < added.length; j++) {
            var n = added[j];
            if (n.nodeType !== 1) continue;
            if (n.classList && n.classList.contains("image-placeholder")) {
              upgradePlaceholder(n);
            }
            if (n.querySelectorAll) {
              n.querySelectorAll(".image-placeholder").forEach(upgradePlaceholder);
            }
          }
        }
      });
      obs.observe(document.body || document.documentElement, {
        childList: true,
        subtree: true,
      });
    }
  }

  // ── プレビュー差し替え (?cvpreview=1 のときだけ) ─────────────────
  // 管理画面で「下書き保存」した内容を実際のテーマ画面で確認するための機能。
  try {
    if (location.search.indexOf("cvpreview=1") > -1 &&
        typeof CV_DATA !== "undefined") {
      var raw = localStorage.getItem("cv_data_preview");
      if (raw) {
        var parsed = JSON.parse(raw);
        if (parsed.producers) CV_DATA.producers = parsed.producers;
        if (parsed.products) CV_DATA.products = parsed.products;
        if (parsed.events) CV_DATA.events = parsed.events;
        if (parsed.news) CV_DATA.news = parsed.news;
        if (parsed.sns) CV_DATA.sns = parsed.sns;
        if (parsed.diary) CV_DATA.diary = parsed.diary;
        // 画面上にプレビュー中バナーを表示
        document.addEventListener("DOMContentLoaded", function () {
          var bar = document.createElement("div");
          bar.textContent = "🔧 プレビュー表示中（未公開の下書きデータ）";
          bar.style.cssText =
            "position:fixed;left:0;right:0;bottom:0;z-index:99999;" +
            "background:#c0392b;color:#fff;font-size:13px;font-family:sans-serif;" +
            "text-align:center;padding:8px;letter-spacing:.05em;";
          document.body.appendChild(bar);
        });
      }
    }
  } catch (e) {
    /* プレビュー失敗は無視（通常表示にフォールバック） */
  }

  // ── SNSまとめページ (#sns-grid) の描画 ──────────────────────────
  // wafuu / simple 共通。X(Twitter)・Instagram は公式埋め込み、
  // その他は画像＋コメントのカードで表示する。
  function escHtml(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  function snsT(key) {
    try {
      var lang = window.CV_LANG || "en";
      return (T[lang] && T[lang].sns && T[lang].sns[key]) || key;
    } catch (e) { return key; }
  }

  function loadScriptOnce(id, src, onload) {
    if (document.getElementById(id)) { if (onload) onload(); return; }
    var s = document.createElement("script");
    s.id = id; s.async = true; s.src = src;
    if (onload) s.onload = onload;
    document.body.appendChild(s);
  }

  function populateSns() {
    var grid = document.getElementById("sns-grid");
    if (!grid || typeof CV_DATA === "undefined") return;
    var posts = (CV_DATA.sns || []).slice().sort(function (a, b) {
      return (b.date || "").localeCompare(a.date || "");
    });
    var lang = window.CV_LANG || "en";
    grid.innerHTML = "";

    if (!posts.length) {
      grid.innerHTML = '<p style="opacity:.6;padding:24px 0">' + escHtml(snsT("empty")) + "</p>";
      return;
    }

    // 横2列を起点に、投稿を交互に振り分けて縦に積み上げる
    var colL = document.createElement("div");
    var colR = document.createElement("div");
    colL.className = "sns-col";
    colR.className = "sns-col";
    grid.appendChild(colL);
    grid.appendChild(colR);

    var needTwitter = false, needInsta = false;
    posts.forEach(function (p, idx) {
      var url = (p.url || "").trim();
      var comment = lang === "ja" ? (p.commentJa || "") : (p.commentEn || p.commentJa || "");
      var item = document.createElement("div");
      item.className = "sns-item";
      // 埋め込みの上に出す小さな見出し（コメント欄を利用・任意）
      var cap = comment
        ? '<p style="font-size:12px;opacity:.72;margin:0 0 6px;font-family:sans-serif;letter-spacing:.04em">' +
          escHtml(comment) + "</p>"
        : "";

      if (/^https?:\/\/(www\.)?(twitter\.com|x\.com)\/[A-Za-z0-9_]+\/?$/i.test(url)) {
        // X (Twitter) アカウントURL → タイムライン埋め込み（実際の最新投稿が流れる）
        var tlUrl = url.replace(/^https?:\/\/(www\.)?x\.com\//i, "https://twitter.com/").replace(/\/$/, "");
        item.innerHTML = cap +
          '<a class="twitter-timeline" data-height="480" data-dnt="true" href="' +
          escHtml(tlUrl) + '"></a>';
        needTwitter = true;
      } else if (/^https?:\/\/(www\.)?(twitter\.com|x\.com)\//i.test(url)) {
        // X (Twitter) 個別投稿の公式埋め込み — widgets.js は twitter.com 形式のURLを要求
        var twUrl = url.replace(/^https?:\/\/(www\.)?x\.com\//i, "https://twitter.com/");
        item.innerHTML = cap + '<blockquote class="twitter-tweet" data-dnt="true"><a href="' +
          escHtml(twUrl) + '"></a></blockquote>';
        needTwitter = true;
      } else if (/^https?:\/\/(www\.)?instagram\.com\//i.test(url)) {
        // Instagram 公式埋め込み
        item.innerHTML = '<blockquote class="instagram-media" data-instgrm-permalink="' +
          escHtml(url) + '" data-instgrm-version="14" style="max-width:540px;width:100%"></blockquote>';
        needInsta = true;
      } else {
        // その他 → カード表示（画像は cv-runtime が実画像に昇格）
        var imgHtml = p.image
          ? '<div class="image-placeholder"><span class="image-placeholder-label">📱</span>' +
            '<div class="image-placeholder-note">' + escHtml(p.image) + "</div></div>"
          : "";
        item.innerHTML =
          '<div class="sns-card">' + imgHtml +
          '<div class="sns-card-body">' +
          '<p class="sns-card-platform">Social</p>' +
          (comment ? '<p class="sns-card-comment">' + escHtml(comment) + "</p>" : "") +
          '<p class="sns-card-date">' + escHtml(p.date || "") + "</p>" +
          (url ? '<a class="sns-link" href="' + escHtml(url) + '" target="_blank" rel="noopener">' +
            escHtml(snsT("viewPost")) + " →</a>" : "") +
          "</div></div>";
      }
      (idx % 2 === 0 ? colL : colR).appendChild(item);
      // 画像プレースホルダーを実画像へ昇格
      var ph = item.querySelector(".image-placeholder");
      if (ph) upgradePlaceholder(ph);
    });

    if (needTwitter) {
      loadScriptOnce("cv-twitter-wjs", "https://platform.twitter.com/widgets.js", function () {
        if (window.twttr && window.twttr.widgets) window.twttr.widgets.load(grid);
      });
      if (window.twttr && window.twttr.widgets) window.twttr.widgets.load(grid);
    }
    if (needInsta) {
      loadScriptOnce("cv-instagram-ejs", "https://www.instagram.com/embed.js", function () {
        if (window.instgrm && window.instgrm.Embeds) window.instgrm.Embeds.process();
      });
      if (window.instgrm && window.instgrm.Embeds) window.instgrm.Embeds.process();
    }
  }

  function startSns() {
    populateSns();
    document.addEventListener("cv-lang-change", populateSns);
  }

  // ── 関係者日記ページ (#diary-list) の描画 ───────────────────────
  function diaryT(key) {
    try {
      var lang = window.CV_LANG || "en";
      return (T[lang] && T[lang].diary && T[lang].diary[key]) || key;
    } catch (e) { return key; }
  }

  function populateDiary() {
    var list = document.getElementById("diary-list");
    if (!list || typeof CV_DATA === "undefined") return;
    var entries = (CV_DATA.diary || []).slice().sort(function (a, b) {
      return (b.date || "").localeCompare(a.date || "");
    });
    var lang = window.CV_LANG || "en";
    list.innerHTML = "";

    if (!entries.length) {
      list.innerHTML = '<p style="opacity:.6;padding:24px 0">' + escHtml(diaryT("empty")) + "</p>";
      return;
    }

    entries.forEach(function (d) {
      var title = lang === "ja" ? (d.titleJa || d.titleEn || "") : (d.titleEn || d.titleJa || "");
      var body = lang === "ja" ? (d.bodyJa || "") : (d.bodyEn || d.bodyJa || "");
      var author = lang === "ja" ? (d.authorJa || "") : (d.authorEn || d.authorJa || "");
      var art = document.createElement("article");
      art.className = "diary-entry";
      var imgHtml = d.image
        ? '<div class="diary-img"><div class="image-placeholder"><span class="image-placeholder-label">📔</span>' +
          '<div class="image-placeholder-note">' + escHtml(d.image) + "</div></div></div>"
        : "";
      art.innerHTML =
        imgHtml +
        '<div class="diary-body">' +
        '<p class="diary-meta">' + escHtml(d.date || "") +
        (author ? '　<span class="diary-author">' + escHtml(diaryT("by")) + " " + escHtml(author) + "</span>" : "") +
        "</p>" +
        '<h2 class="diary-title">' + escHtml(title) + "</h2>" +
        '<div class="diary-text">' + escHtml(body).replace(/\n/g, "<br>") + "</div>" +
        "</div>";
      list.appendChild(art);
      var ph = art.querySelector(".image-placeholder");
      if (ph) upgradePlaceholder(ph);
    });
  }

  function startDiary() {
    populateDiary();
    document.addEventListener("cv-lang-change", populateDiary);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      startImageUpgrade();
      startSns();
      startDiary();
    });
  } else {
    startImageUpgrade();
    startSns();
    startDiary();
  }
})();
