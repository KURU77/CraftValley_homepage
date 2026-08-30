// ================================================================
// Craft Valley（飛能越）— 地理院地図ベースの地域マップ (cv-map.js)
//
//   対象6市（高岡・氷見・南砺・射水・小松・飛騨）を、
//   国土地理院の地図の上に「ひとつの図形でまとめて囲んで」表示します。
//   行政界をなぞる方式ではなく、およその範囲を示す描き方です。
//
//   使い方（HTML側）:
//     <div class="cv-map" id="cv-map"
//          data-accent="#8B1A1A"      … 網掛けの色
//          data-basemap="pale"></div>  … pale / std / photo
//
//     <script src="../shared/data/cv-area.js"></script>
//     <script src="../shared/js/cv-map.js"></script>
//
//   出典・ライセンス:
//     ・背景地図 … 地理院タイル（国土地理院）
//       https://maps.gsi.go.jp/development/ichiran.html
//     ・行政区域 … 国土数値情報「行政区域データ」(国土交通省) を加工
//
//   ※ このファイルは「コード」です。管理画面からは書き出されません。
// ================================================================

(function () {
  "use strict";

  var LEAFLET_CSS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
  var LEAFLET_JS  = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";

  // 地理院タイルの種類
  var BASEMAPS = {
    pale:  { url: "https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png",      max: 18 },
    std:   { url: "https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png",       max: 18 },
    blank: { url: "https://cyberjapandata.gsi.go.jp/xyz/blank/{z}/{x}/{y}.png",     max: 14 },
    photo: { url: "https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg", max: 18 }
  };

  var GSI_ATTR =
    '<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank" rel="noopener">地理院タイル</a>' +
    ' ｜ 行政区域: 国土数値情報（国土交通省）';

  // ── 多言語ラベル ────────────────────────────────────────────────
  var TXT = {
    ja: {
      areaLabel: "飛能越 — Craft Valley 対象地域",
      cities: "6市のおよその範囲",
      reset: "全体を表示",
      loading: "地図を読み込んでいます…",
      failTitle: "地図を表示できませんでした",
      failBody: "インターネット接続をご確認のうえ、ページを再読み込みしてください。",
      craftLabel: "主な工芸",
      prefLabel: "所在",
      hint: "市名をクリックすると詳細が出ます（境界は目安です）"
    },
    en: {
      areaLabel: "Craft Valley Area",
      cities: "Approximate area · 6 cities",
      reset: "Reset view",
      loading: "Loading map…",
      failTitle: "The map could not be loaded",
      failBody: "Please check your internet connection and reload the page.",
      craftLabel: "Craft",
      prefLabel: "Location",
      hint: "Click a city for details (boundary is approximate)"
    }
  };

  function lang() { return window.CV_LANG === "ja" ? "ja" : "en"; }
  function tx(k) { return (TXT[lang()] || TXT.en)[k]; }

  // ── スタイル（1度だけ注入） ─────────────────────────────────────
  function injectStyles() {
    if (document.getElementById("cv-map-style")) return;
    var css = [
      ".cv-map{position:relative;width:100%;min-height:380px;height:clamp(380px,52vh,560px);",
      "  border-radius:4px;overflow:hidden;background:#eef2f4}",
      ".cv-map .leaflet-container{width:100%;height:100%;background:#eef2f4;font-family:inherit}",

      /* 網掛けポリゴン */
      ".cv-area-shape{transition:fill-opacity .2s ease,stroke-width .2s ease}",
      ".cv-area-shape:hover{fill-opacity:.55}",

      /* 対象地域の図形 */
      ".cv-zone-shape{transition:fill-opacity .25s ease}",

      /* 市の位置を示すピン */
      ".cv-city-pin{background:transparent;border:none;box-shadow:none;padding:0;",
      "  white-space:nowrap;display:flex;align-items:center;gap:5px;",
      "  transform:translate(-7px,-7px);cursor:pointer}",
      ".cv-city-pin::before{display:none}",
      ".cv-pin-dot{width:11px;height:11px;border-radius:50%;flex-shrink:0;",
      "  background:currentColor;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.35)}",
      ".cv-pin-name{display:inline-block;padding:2px 8px;border-radius:3px;",
      "  font-weight:700;font-size:12px;color:#1a1a1a;",
      "  background:rgba(255,255,255,.9);box-shadow:0 1px 3px rgba(0,0,0,.2)}",

      /* 凡例 */
      ".cv-map-legend{background:rgba(255,255,255,.93);padding:9px 12px;border-radius:4px;",
      "  box-shadow:0 1px 6px rgba(0,0,0,.16);font-size:11px;line-height:1.7;color:#222}",
      ".cv-map-legend .lg-title{font-weight:700;font-size:11px;margin-bottom:5px;letter-spacing:.04em}",
      ".cv-map-legend .lg-row{display:flex;align-items:center;gap:7px;white-space:nowrap}",
      ".cv-map-legend .lg-swatch{width:20px;height:12px;flex-shrink:0}",
      ".cv-map-legend .lg-hint{margin-top:6px;font-size:10px;color:#777}",

      /* リセットボタン */
      ".cv-map-reset{background:#fff;border:none;border-radius:3px;padding:6px 10px;",
      "  font-size:11px;font-family:inherit;cursor:pointer;box-shadow:0 1px 5px rgba(0,0,0,.25);color:#222}",
      ".cv-map-reset:hover{background:#f2f2f2}",

      /* ポップアップ */
      ".cv-pop{font-family:inherit;min-width:150px}",
      ".cv-pop .cv-pop-name{font-size:15px;font-weight:700;margin-bottom:2px;line-height:1.4}",
      ".cv-pop .cv-pop-sub{font-size:11px;color:#777;margin-bottom:7px}",
      ".cv-pop .cv-pop-row{font-size:12px;color:#333;display:flex;gap:6px}",
      ".cv-pop .cv-pop-key{color:#999;flex-shrink:0}",

      /* 読み込み中 / エラー */
      ".cv-map-state{position:absolute;inset:0;display:flex;flex-direction:column;",
      "  align-items:center;justify-content:center;gap:6px;text-align:center;padding:24px;",
      "  background:#eef2f4;color:#7a7a7a;font-size:13px;z-index:5}",
      ".cv-map-state b{font-size:14px;color:#555}",
      ".cv-map-state.err{background:#faf6f2}",

      /* 縮尺・帰属表示を小さく */
      ".cv-map .leaflet-control-attribution{font-size:10px;background:rgba(255,255,255,.85)}",
      ".cv-map .leaflet-control-attribution a{color:#3a6ea5}",
      /* スマートフォン向け — 指で押しやすい大きさにする */
      "@media(max-width:768px){",
      "  .cv-map-legend{font-size:10px;padding:7px 9px;max-width:47vw}",
      "  .cv-map-legend .lg-hint{display:none}",
      "  .cv-map-reset{padding:11px 14px;font-size:12px;min-height:44px}",
      "  .cv-map.leaflet-touch .leaflet-bar a,.cv-map .leaflet-bar a{width:40px !important;height:40px !important;line-height:40px !important;font-size:20px}",
      "  .cv-map .leaflet-control-attribution{font-size:9px}",
      "  .cv-city-label{font-size:11px}",
      "  .cv-pop .cv-pop-name{font-size:16px}",
      "}"
    ].join("");
    var s = document.createElement("style");
    s.id = "cv-map-style";
    s.textContent = css;
    document.head.appendChild(s);
  }

  // ── 網掛けパターン（SVG defs）を用意 ────────────────────────────
  function ensureHatchPattern(id, color) {
    if (document.getElementById(id)) return;
    var ns = "http://www.w3.org/2000/svg";
    var svg = document.getElementById("cv-map-defs");
    if (!svg) {
      svg = document.createElementNS(ns, "svg");
      svg.setAttribute("id", "cv-map-defs");
      svg.setAttribute("width", "0");
      svg.setAttribute("height", "0");
      svg.setAttribute("aria-hidden", "true");
      svg.style.cssText = "position:absolute;width:0;height:0;overflow:hidden";
      document.body.appendChild(svg);
    }
    var defs = svg.querySelector("defs");
    if (!defs) { defs = document.createElementNS(ns, "defs"); svg.appendChild(defs); }

    var p = document.createElementNS(ns, "pattern");
    p.setAttribute("id", id);
    p.setAttribute("width", "7");
    p.setAttribute("height", "7");
    p.setAttribute("patternUnits", "userSpaceOnUse");
    p.setAttribute("patternTransform", "rotate(45)");

    // 下地（薄い塗り）
    var bg = document.createElementNS(ns, "rect");
    bg.setAttribute("width", "7");
    bg.setAttribute("height", "7");
    bg.setAttribute("fill", color);
    bg.setAttribute("fill-opacity", "0.13");
    p.appendChild(bg);

    // 斜線
    var line = document.createElementNS(ns, "line");
    line.setAttribute("x1", "0"); line.setAttribute("y1", "0");
    line.setAttribute("x2", "0"); line.setAttribute("y2", "7");
    line.setAttribute("stroke", color);
    line.setAttribute("stroke-width", "2.6");
    line.setAttribute("stroke-opacity", "0.42");
    p.appendChild(line);

    defs.appendChild(p);
  }

  // ── 外部ファイル読み込み ────────────────────────────────────────
  function loadCss(href, cb) {
    if (document.querySelector('link[href="' + href + '"]')) { cb && cb(); return; }
    var l = document.createElement("link");
    l.rel = "stylesheet"; l.href = href;
    l.onload = function () { cb && cb(); };
    l.onerror = function () { cb && cb(); };
    document.head.appendChild(l);
  }
  function loadJs(src, cb, onErr) {
    if (window.L) { cb(); return; }
    var existing = document.querySelector('script[data-cv-leaflet]');
    if (existing) { existing.addEventListener("load", cb); existing.addEventListener("error", onErr); return; }
    var s = document.createElement("script");
    s.src = src; s.async = true; s.setAttribute("data-cv-leaflet", "1");
    s.onload = cb;
    s.onerror = onErr;
    document.head.appendChild(s);
  }

  // ── 状態表示 ────────────────────────────────────────────────────
  function showState(box, kind, title, body) {
    var el = box.querySelector(".cv-map-state");
    if (!el) {
      el = document.createElement("div");
      el.className = "cv-map-state";
      box.appendChild(el);
    }
    el.className = "cv-map-state" + (kind === "err" ? " err" : "");
    el.innerHTML = title ? ("<b>" + title + "</b><span>" + (body || "") + "</span>") : (body || "");
  }
  function clearState(box) {
    var el = box.querySelector(".cv-map-state");
    if (el) el.remove();
  }

  // ── ポリゴンの重心（ラベル位置用）─────────────────────────────
  function polyCenter(coords) {
    // 最大リングの面積重心を求める（島などを除いて本体に置く）
    var rings = coords[0] && Array.isArray(coords[0][0][0]) ? null : coords;
    var best = null, bestLen = -1;
    function scan(c) {
      if (Array.isArray(c[0]) && Array.isArray(c[0][0])) { c.forEach(scan); return; }
      if (c.length > bestLen) { bestLen = c.length; best = c; }
    }
    scan(coords);
    if (!best) return null;
    var a = 0, cx = 0, cy = 0;
    for (var i = 0, j = best.length - 1; i < best.length; j = i++) {
      var f = best[j][0] * best[i][1] - best[i][0] * best[j][1];
      a += f; cx += (best[j][0] + best[i][0]) * f; cy += (best[j][1] + best[i][1]) * f;
    }
    if (a === 0) return [best[0][1], best[0][0]];
    a *= 0.5;
    return [cy / (6 * a), cx / (6 * a)]; // [lat, lng]
  }

  // ── 地図を1つ構築 ───────────────────────────────────────────────
  function buildMap(box) {
    var L = window.L;
    var area = window.CV_AREA;
    if (!area || !area.zone || !area.cities || !area.cities.length) {
      showState(box, "err", tx("failTitle"), "対象地域データ (cv-area.js) が読み込まれていません。");
      return;
    }

    var accent   = box.getAttribute("data-accent") || "#8B1A1A";
    var bmKey    = box.getAttribute("data-basemap") || "pale";
    var bm       = BASEMAPS[bmKey] || BASEMAPS.pale;
    var showLbl  = box.getAttribute("data-labels") !== "off";
    var patId    = "cv-hatch-" + Math.abs(hashCode(accent));

    ensureHatchPattern(patId, accent);
    clearState(box);

    box.style.color = accent;   // ピンの丸の色に使う

    var map = L.map(box, {
      zoomControl: true,
      scrollWheelZoom: false,   // ページスクロールを妨げない
      attributionControl: true
    });
    map.attributionControl.setPrefix("");

    L.tileLayer(bm.url, {
      maxZoom: bm.max,
      minZoom: 6,
      attribution: GSI_ATTR
    }).addTo(map);

    // ドラッグ後などにホイールズームを有効化（クリックで有効/離脱で無効）
    map.on("click", function () { map.scrollWheelZoom.enable(); });
    map.on("mouseout", function () { map.scrollWheelZoom.disable(); });

    // ── 対象地域を包む図形 ──
    // 行政界をなぞるのではなく、6市をまとめて囲む「およその範囲」を示す。
    // 内側をやわらかい網掛けで塗り、輪郭は破線にして
    // 「厳密な境界ではない」ことが伝わるようにしている。
    var zoneLayer = L.geoJSON(
      { type: "Feature", properties: {}, geometry: area.zone },
      {
        style: function () {
          return {
            className: "cv-zone-shape",
            color: accent, weight: 2.4, opacity: 0.85,
            dashArray: "10 7", lineJoin: "round",
            fillColor: accent, fillOpacity: 1, fill: true
          };
        }
      }
    ).addTo(map);

    zoneLayer.eachLayer(function (l) {
      if (l._path) l._path.setAttribute("fill", "url(#" + patId + ")");
      l.on("add", function () {
        if (l._path) l._path.setAttribute("fill", "url(#" + patId + ")");
      });
    });

    // ── 各市の位置を示すマーカー ──
    var cityLayer = L.layerGroup();
    if (showLbl) {
      area.cities.forEach(function (c) {
        var mk = L.marker([c.lat, c.lng], {
          icon: L.divIcon({
            className: "cv-city-pin",
            // ピンの丸はアクセント色（currentColor 経由で指定）
            html: '<span class="cv-pin-dot"></span>' +
                  '<span class="cv-pin-name" data-cv-city="' + c.code + '">' +
                  esc(cityName(c)) + "</span>",
            iconSize: [0, 0]
          })
        });
        mk.bindPopup(buildPopup(c), { className: "cv-pop-wrap", maxWidth: 240 });
        mk.addTo(cityLayer);
      });
      cityLayer.addTo(map);
    }

    // ── 表示範囲 ──
    var bounds = zoneLayer.getBounds();
    function fit() { map.fitBounds(bounds, { padding: [26, 26] }); }
    fit();

    // ── 凡例 ──
    var legend = L.control({ position: "bottomleft" });
    legend.onAdd = function () {
      var d = L.DomUtil.create("div", "cv-map-legend");
      d.innerHTML = legendHtml(accent, patId);
      L.DomEvent.disableClickPropagation(d);
      return d;
    };
    legend.addTo(map);

    // ── リセットボタン ──
    var reset = L.control({ position: "topright" });
    reset.onAdd = function () {
      var b = L.DomUtil.create("button", "cv-map-reset");
      b.type = "button";
      b.textContent = tx("reset");
      L.DomEvent.disableClickPropagation(b);
      L.DomEvent.on(b, "click", function () {
        if (box._cvResetUserMove) box._cvResetUserMove();
        map.invalidateSize();
        fit();
      });
      return b;
    };
    reset.addTo(map);

    // ── 縮尺 ──
    L.control.scale({ imperial: lang() === "en", metric: true, position: "bottomright" }).addTo(map);

    // ── 言語切替に追従 ──
    function relabel() {
      // 市名
      area.cities.forEach(function (c) {
        var el = box.querySelector('[data-cv-city="' + c.code + '"]');
        if (el) el.textContent = cityName(c);
      });
      // 凡例・ボタン
      var lg = box.querySelector(".cv-map-legend");
      if (lg) lg.innerHTML = legendHtml(accent, patId);
      var rb = box.querySelector(".cv-map-reset");
      if (rb) rb.textContent = tx("reset");
      // ポップアップ
      var i = 0;
      cityLayer.eachLayer(function (l) {
        if (area.cities[i]) l.setPopupContent(buildPopup(area.cities[i]));
        i++;
      });
    }
    document.addEventListener("cv-lang-change", relabel);

    // ── レイアウト確定後の再計算 ────────────────────────────────
    // オープニング演出やフェードインの最中は、地図の領域サイズが
    // まだ確定していない。サイズが変わるたびに測り直して表示範囲を
    // 合わせ直す（利用者が自分で動かした後は、その表示を尊重する）。
    var userMoved = false;
    ["pointerdown", "wheel", "touchstart"].forEach(function (ev) {
      box.addEventListener(ev, function () { userMoved = true; }, { passive: true });
    });

    var refitTimer;
    function refresh() {
      clearTimeout(refitTimer);
      refitTimer = setTimeout(function () {
        map.invalidateSize();
        if (!userMoved) fit();
      }, 120);
    }

    // 領域サイズの変化を監視
    if (window.ResizeObserver) {
      new ResizeObserver(refresh).observe(box);
    }
    // 画面内に入ったとき（表示されるまでサイズが0のことがある）
    if (window.IntersectionObserver) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) refresh(); });
      }, { threshold: 0.05 }).observe(box);
    }
    // 保険として時間差でも数回試す
    [260, 900, 2000].forEach(function (ms) { setTimeout(refresh, ms); });
    window.addEventListener("resize", refresh);

    // 「全体を表示」を押したら、追従を再開する
    box._cvResetUserMove = function () { userMoved = false; };

    box._cvMap = map;
  }

  function hashCode(s) {
    var h = 0;
    for (var i = 0; i < s.length; i++) { h = (h << 5) - h + s.charCodeAt(i); h |= 0; }
    return h;
  }

  function cityName(p) {
    return lang() === "ja" ? p.ja : p.en;
  }

  function buildPopup(p) {
    var isJa = lang() === "ja";
    var name = isJa ? p.ja : p.en;
    var sub  = isJa ? (p.en + " City, " + p.prefEn) : (p.ja + " / " + p.prefJa);
    var loc  = isJa ? p.prefJa : (p.prefEn + " Prefecture");
    return '<div class="cv-pop">' +
             '<div class="cv-pop-name">' + esc(name) + "</div>" +
             '<div class="cv-pop-sub">' + esc(sub) + "</div>" +
             '<div class="cv-pop-row"><span class="cv-pop-key">' + tx("prefLabel") + "</span><span>" + esc(loc) + "</span></div>" +
             (p.craft ? '<div class="cv-pop-row"><span class="cv-pop-key">' + tx("craftLabel") + "</span><span>" + esc(p.craft) + "</span></div>" : "") +
           "</div>";
  }

  function legendHtml(accent, patId) {
    return '<div class="lg-title">' + tx("areaLabel") + "</div>" +
           '<div class="lg-row">' +
             '<svg class="lg-swatch" viewBox="0 0 20 12" aria-hidden="true">' +
               '<rect x="1" y="1" width="18" height="10" rx="3" fill="url(#' + patId + ')"/>' +
               '<rect x="1" y="1" width="18" height="10" rx="3" fill="none" ' +
                 'stroke="' + accent + '" stroke-width="1.5" stroke-dasharray="4 3"/>' +
             "</svg>" +
             "<span>" + tx("cities") + "</span>" +
           "</div>" +
           '<div class="lg-hint">' + tx("hint") + "</div>";
  }

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  // ── 初期化 ──────────────────────────────────────────────────────
  function init() {
    var boxes = document.querySelectorAll(".cv-map");
    if (!boxes.length) return;

    injectStyles();
    Array.prototype.forEach.call(boxes, function (b) {
      showState(b, "", "", tx("loading"));
    });

    loadCss(LEAFLET_CSS);
    loadJs(LEAFLET_JS, function () {
      Array.prototype.forEach.call(boxes, function (b) {
        try {
          buildMap(b);
        } catch (e) {
          showState(b, "err", tx("failTitle"), tx("failBody"));
          if (window.console) console.error("[cv-map]", e);
        }
      });
    }, function () {
      Array.prototype.forEach.call(boxes, function (b) {
        showState(b, "err", tx("failTitle"), tx("failBody"));
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
