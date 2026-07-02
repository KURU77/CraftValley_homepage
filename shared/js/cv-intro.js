// ================================================================
// Craftvalley — ドット絵キャラ演出 (cv-intro.js)
//   1) トップページ: キャラが歩いてきて「扉」を開くとサイトが現れる
//      （1セッション1回 / クリックでスキップ / 動きを減らす設定なら省略）
//   2) 全ページ: ときどき画面下をキャラがてくてく歩く
//   キャラ画像: shared/img/dot-character.png（差し替え可能）
// ================================================================

(function () {
  "use strict";

  // ── 設定 ────────────────────────────────────────────────────
  var script = document.currentScript;
  var IMG = script
    ? script.src.replace(/js\/cv-intro\.js.*$/, "img/dot-character.png")
    : "../shared/img/dot-character.png";
  var THEME = /\/wafuu\//.test(location.pathname) ? "wafuu" : "simple";
  var REDUCED = false;
  try {
    REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch (e) {}

  var IS_INDEX =
    /(^|\/)index\.html$/.test(location.pathname) ||
    /\/(wafuu|simple)\/?$/.test(location.pathname);
  var INTRO_KEY = "cv_intro_done_" + THEME;

  // ── スタイル ────────────────────────────────────────────────
  var css = "" +
    ".cv-intro{position:fixed;inset:0;z-index:99990;overflow:hidden;}" +
    ".cv-intro-panel{position:absolute;top:0;bottom:0;width:50.5%;" +
    "  transition:transform 1.5s cubic-bezier(.72,0,.28,1);will-change:transform;}" +
    ".cv-intro-left{left:0;}" +
    ".cv-intro-right{right:0;}" +
    /* 和風: 障子風の扉 */
    ".cv-intro-wafuu .cv-intro-panel{background:" +
    "  linear-gradient(rgba(90,61,43,.55) 2px,transparent 2px)," +
    "  linear-gradient(90deg,rgba(90,61,43,.55) 2px,transparent 2px)," +
    "  #f2ead6;background-size:100% 25%,25% 100%;" +
    "  box-shadow:inset 0 0 60px rgba(90,61,43,.18);}" +
    ".cv-intro-wafuu .cv-intro-left{border-right:14px solid #5a3d2b;}" +
    ".cv-intro-wafuu .cv-intro-right{border-left:14px solid #5a3d2b;}" +
    /* simple: ミニマルな白い扉 */
    ".cv-intro-simple .cv-intro-panel{background:#fafafa;}" +
    ".cv-intro-simple .cv-intro-left{border-right:6px solid #111;}" +
    ".cv-intro-simple .cv-intro-right{border-left:6px solid #111;}" +
    /* 開く */
    ".cv-intro.open .cv-intro-left{transform:translateX(-102%);}" +
    ".cv-intro.open .cv-intro-right{transform:translateX(102%);}" +
    /* キャラ */
    ".cv-intro-char{position:absolute;bottom:3vh;left:-200px;" +
    "  height:min(36vh,290px);width:auto;image-rendering:pixelated;" +
    "  transition:left 1.7s linear,opacity .45s ease;z-index:2;}" +
    ".cv-intro.walk .cv-intro-char{left:calc(50% - min(9vh,73px));" +
    "  animation:cvBob .38s steps(2) infinite;}" +
    ".cv-intro.push .cv-intro-char{animation:cvPush .5s ease;}" +
    ".cv-intro.open .cv-intro-char{left:108%;" +
    "  animation:cvBob .3s steps(2) infinite;}" +
    ".cv-intro.done .cv-intro-char{opacity:0;}" +
    "@keyframes cvBob{0%,100%{transform:translateY(0) rotate(-1.5deg);}" +
    "  50%{transform:translateY(-7px) rotate(1.5deg);}}" +
    "@keyframes cvPush{0%{transform:rotate(0);}40%{transform:rotate(7deg) translateX(9px);}" +
    "  100%{transform:rotate(0);}}" +
    /* スキップ案内 */
    ".cv-intro-hint{position:absolute;bottom:16px;right:20px;z-index:3;" +
    "  font-size:11px;letter-spacing:.12em;color:rgba(60,50,40,.55);" +
    "  font-family:sans-serif;user-select:none;}" +
    ".cv-intro-simple .cv-intro-hint{color:rgba(0,0,0,.4);}" +
    ".cv-intro.done{opacity:0;transition:opacity .4s ease;pointer-events:none;}" +
    /* ── アンビエント（画面下を歩く） ── */
    ".cv-walker{position:fixed;left:0;bottom:0;z-index:2500;pointer-events:none;}" +
    ".cv-walker img{height:74px;width:auto;image-rendering:pixelated;display:block;}" +
    ".cv-walker.ltr{animation:cvWalkX var(--cv-walk-dur,17s) linear forwards;}" +
    ".cv-walker.rtl{animation:cvWalkXr var(--cv-walk-dur,17s) linear forwards;}" +
    ".cv-walker.ltr img{animation:cvBobW .4s steps(2) infinite;}" +
    ".cv-walker.rtl img{animation:cvBobWf .4s steps(2) infinite;}" +
    "@keyframes cvWalkX{from{transform:translateX(-110px);}to{transform:translateX(calc(100vw + 110px));}}" +
    "@keyframes cvWalkXr{from{transform:translateX(calc(100vw + 110px));}to{transform:translateX(-110px);}}" +
    "@keyframes cvBobW{0%,100%{transform:translateY(0) rotate(-2deg);}50%{transform:translateY(-5px) rotate(2deg);}}" +
    "@keyframes cvBobWf{0%,100%{transform:translateY(0) rotate(2deg) scaleX(-1);}50%{transform:translateY(-5px) rotate(-2deg) scaleX(-1);}}";

  var styleEl = document.createElement("style");
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  // ── 扉オープニング ──────────────────────────────────────────
  function runIntro() {
    if (!IS_INDEX || REDUCED) return;
    try {
      if (sessionStorage.getItem(INTRO_KEY)) return;
    } catch (e) { return; }

    var root = document.createElement("div");
    root.className = "cv-intro cv-intro-" + THEME;
    root.innerHTML =
      '<div class="cv-intro-panel cv-intro-left"></div>' +
      '<div class="cv-intro-panel cv-intro-right"></div>' +
      '<div class="cv-intro-hint">クリックでスキップ — click to skip</div>';
    var char = document.createElement("img");
    char.className = "cv-intro-char";
    char.alt = "";
    char.src = IMG;
    root.appendChild(char);
    document.body.appendChild(root);

    var prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    var timers = [];
    var finished = false;
    function finish(fast) {
      if (finished) return;
      finished = true;
      timers.forEach(clearTimeout);
      try { sessionStorage.setItem(INTRO_KEY, "1"); } catch (e) {}
      document.body.style.overflow = prevOverflow;
      root.classList.add("open", "done");
      setTimeout(function () {
        if (root.parentNode) root.parentNode.removeChild(root);
      }, fast ? 120 : 450);
    }

    // 画像が読めなければ演出せず即終了
    char.onerror = function () { finish(true); };

    root.addEventListener("click", function () { finish(false); });
    document.addEventListener("keydown", function onKey() {
      finish(false);
      document.removeEventListener("keydown", onKey);
    });

    function start() {
      // 1) 歩いて登場
      timers.push(setTimeout(function () { root.classList.add("walk"); }, 120));
      // 2) 扉を押す
      timers.push(setTimeout(function () { root.classList.add("push"); }, 2000));
      // 3) 扉が開く（キャラは歩き去る）
      timers.push(setTimeout(function () { root.classList.add("open"); }, 2550));
      // 4) 後片付け
      timers.push(setTimeout(function () { finish(false); }, 4300));
    }
    if (char.complete) start();
    else char.onload = start;
    // 保険: 画像が3秒読めなければスキップ
    timers.push(setTimeout(function () {
      if (!char.complete) finish(true);
    }, 3000));
  }

  // ── アンビエント: ときどき画面下を歩く ──────────────────────
  function startWalker() {
    if (REDUCED) return;
    var wrap = document.createElement("div");
    wrap.className = "cv-walker";
    var img = document.createElement("img");
    img.src = IMG;
    img.alt = "";
    wrap.appendChild(img);
    var broken = false;
    img.onerror = function () { broken = true; };

    var dir = "ltr";
    function pass() {
      if (broken || document.hidden) { schedule(); return; }
      if (!wrap.parentNode) document.body.appendChild(wrap);
      var dur = 15 + Math.random() * 6;
      wrap.style.setProperty("--cv-walk-dur", dur + "s");
      wrap.classList.remove("ltr", "rtl");
      void wrap.offsetWidth; // アニメーション再始動
      wrap.classList.add(dir);
      dir = dir === "ltr" ? "rtl" : "ltr";
      setTimeout(function () {
        wrap.classList.remove("ltr", "rtl");
        schedule();
      }, dur * 1000 + 200);
    }
    function schedule() {
      setTimeout(pass, 30000 + Math.random() * 40000); // 30〜70秒ごと
    }
    setTimeout(pass, 8000); // 初回は8秒後
  }

  function init() {
    runIntro();
    startWalker();
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
