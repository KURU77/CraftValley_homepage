// ================================================================
// Craftvalley — 共通ランタイム (cv-runtime.js)
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

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startImageUpgrade);
  } else {
    startImageUpgrade();
  }
})();
