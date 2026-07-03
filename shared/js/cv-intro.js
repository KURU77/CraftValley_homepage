// ================================================================
// Craftvalley — ドット絵キャラ演出 (cv-intro.js)
//   1) トップページ: キャラが歩いてきて「扉」を開くとサイトが現れる
//      （1セッション1回 / クリックでスキップ / 動きを減らす設定なら省略）
//   2) 全ページ: キャラがあちこちに登場して来訪者を楽しませる
//      ・画面下をてくてく歩く ・端からのぞき見 ・下からひょっこり
//      ・クリックするとジャンプして一言しゃべる
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

  // キャラのセリフ（クリック時）
  var PHRASES = [
    { ja: "ようこそ！", en: "Welcome!" },
    { ja: "ゆっくり見ていってね", en: "Enjoy browsing!" },
    { ja: "職人の技、すごいよ", en: "Handmade in Japan!" },
    { ja: "富山から来ました", en: "Straight from Toyama!" },
    { ja: "いい器あるよ〜", en: "Lovely crafts inside!" },
    { ja: "催事もやってるよ", en: "Check our events!" }
  ];

  // ── スタイル ────────────────────────────────────────────────
  var css = "" +
    ".cv-intro{position:fixed;inset:0;z-index:99990;overflow:hidden;}" +
    ".cv-intro-panel{position:absolute;top:0;bottom:0;width:50.5%;" +
    "  transition:transform 1.5s cubic-bezier(.72,0,.28,1);will-change:transform;}" +
    ".cv-intro-left{left:0;}" +
    ".cv-intro-right{right:0;}" +
    /* 和風: 障子風の扉（麻の葉文様入り） */
    ".cv-intro-wafuu .cv-intro-panel{background-color:#f2ead6;background-image:" +
    "  linear-gradient(rgba(90,61,43,.55) 2px,transparent 2px)," +
    "  linear-gradient(90deg,rgba(90,61,43,.55) 2px,transparent 2px)," +
    "  url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2256.00%22 height=%2296.99%22%3E%3Cpath d=%22M-28 48.5L0 32.33 M-28 48.5L0 64.66 M-28 48.5L28 48.5 M0 0L0 32.33 M0 0L28 16.17 M0 0L56 0 M0 96.99L0 64.66 M0 96.99L28 80.83 M28 48.5L0 0 M28 48.5L0 32.33 M28 48.5L0 64.66 M28 48.5L0 96.99 M28 48.5L28 16.17 M28 48.5L28 80.83 M56 0L28 16.17 M56 0L28 48.5 M56 96.99L28 48.5 M56 96.99L28 80.83%22 fill=%22none%22 stroke=%22rgba(139,105,20,0.16)%22 stroke-width=%221%22/%3E%3C/svg%3E');" +
    "  background-size:100% 25%,25% 100%,56px 97px;" +
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
    /* ── 徘徊（画面下を歩く） ── */
    ".cv-walker{position:fixed;left:0;bottom:0;z-index:2500;pointer-events:none;}" +
    ".cv-walker img{height:74px;width:auto;image-rendering:pixelated;display:block;" +
    "  pointer-events:auto;cursor:pointer;}" +
    ".cv-walker.ltr{animation:cvWalkX var(--cv-walk-dur,17s) linear forwards;}" +
    ".cv-walker.rtl{animation:cvWalkXr var(--cv-walk-dur,17s) linear forwards;}" +
    ".cv-walker.ltr img{animation:cvBobW .4s steps(2) infinite;}" +
    ".cv-walker.rtl img{animation:cvBobWf .4s steps(2) infinite;}" +
    "@keyframes cvWalkX{from{transform:translateX(-110px);}to{transform:translateX(calc(100vw + 110px));}}" +
    "@keyframes cvWalkXr{from{transform:translateX(calc(100vw + 110px));}to{transform:translateX(-110px);}}" +
    "@keyframes cvBobW{0%,100%{transform:translateY(0) rotate(-2deg);}50%{transform:translateY(-5px) rotate(2deg);}}" +
    "@keyframes cvBobWf{0%,100%{transform:translateY(0) rotate(2deg) scaleX(-1);}50%{transform:translateY(-5px) rotate(-2deg) scaleX(-1);}}" +
    /* ── のぞき見（左右の端から） ── */
    ".cv-peek{position:fixed;z-index:2500;pointer-events:none;}" +
    ".cv-peek img{height:96px;width:auto;image-rendering:pixelated;display:block;" +
    "  pointer-events:auto;cursor:pointer;}" +
    ".cv-peek.left{left:0;transform:translateX(-100%) rotate(6deg);transition:transform .55s ease;}" +
    ".cv-peek.left.show{transform:translateX(-42%) rotate(6deg);}" +
    ".cv-peek.right{right:0;transform:translateX(100%) rotate(-6deg);transition:transform .55s ease;}" +
    ".cv-peek.right.show{transform:translateX(42%) rotate(-6deg);}" +
    ".cv-peek.right img{transform:scaleX(-1);}" +
    /* ── ひょっこり（下から） ── */
    ".cv-pop{position:fixed;bottom:0;z-index:2500;pointer-events:none;" +
    "  transform:translateY(105%);transition:transform .5s cubic-bezier(.34,1.56,.64,1);}" +
    ".cv-pop.show{transform:translateY(10%);}" +
    ".cv-pop img{height:112px;width:auto;image-rendering:pixelated;display:block;" +
    "  pointer-events:auto;cursor:pointer;}" +
    ".cv-pop.wave img{animation:cvWave .9s ease;}" +
    "@keyframes cvWave{0%,100%{transform:rotate(0);}25%{transform:rotate(-7deg);}75%{transform:rotate(7deg);}}" +
    /* ── 吹き出し＆ジャンプ ── */
    ".cv-bubble{position:fixed;z-index:2600;background:#fff;border:2px solid #333;" +
    "  border-radius:10px;padding:6px 12px;font-size:13px;font-family:sans-serif;" +
    "  color:#222;box-shadow:0 4px 12px rgba(0,0,0,.18);opacity:0;transition:opacity .2s;" +
    "  pointer-events:none;white-space:nowrap;}" +
    ".cv-bubble.show{opacity:1;}" +
    ".cv-bubble::after{content:'';position:absolute;bottom:-7px;left:18px;" +
    "  border:7px solid transparent;border-top-color:#333;border-bottom:0;}" +
    ".cv-jump{animation:cvJump .5s ease !important;}" +
    "@keyframes cvJump{0%,100%{transform:translateY(0);}40%{transform:translateY(-26px);}}";

  var styleEl = document.createElement("style");
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  // ── 吹き出し＆クリック反応 ──────────────────────────────────
  function say(x, y) {
    var lang = (window.CV_LANG === "ja") ? "ja" : "en";
    var p = PHRASES[Math.floor(Math.random() * PHRASES.length)];
    var b = document.createElement("div");
    b.className = "cv-bubble";
    b.textContent = p[lang];
    document.body.appendChild(b);
    b.style.left = Math.max(8, Math.min(x, window.innerWidth - 190)) + "px";
    b.style.top = Math.max(8, y - 48) + "px";
    requestAnimationFrame(function () { b.classList.add("show"); });
    setTimeout(function () {
      b.classList.remove("show");
      setTimeout(function () { b.remove(); }, 250);
    }, 1800);
  }

  function bindFun(img) {
    img.addEventListener("click", function (e) {
      e.stopPropagation();
      img.classList.remove("cv-jump");
      void img.offsetWidth;
      img.classList.add("cv-jump");
      var r = img.getBoundingClientRect();
      say(r.left, r.top);
    });
  }

  // ── 扉オープニング ──────────────────────────────────────────
  function runIntro(onDone) {
    if (!IS_INDEX || REDUCED) { onDone(); return; }
    try {
      if (sessionStorage.getItem(INTRO_KEY)) { onDone(); return; }
    } catch (e) { onDone(); return; }

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
      onDone();
    }

    // 画像が読めなければ演出せず即終了
    char.onerror = function () { finish(true); };

    root.addEventListener("click", function () { finish(false); });
    document.addEventListener("keydown", function onKey() {
      finish(false);
      document.removeEventListener("keydown", onKey);
    });

    function start() {
      timers.push(setTimeout(function () { root.classList.add("walk"); }, 120));  // 歩いて登場
      timers.push(setTimeout(function () { root.classList.add("push"); }, 2000)); // 扉を押す
      timers.push(setTimeout(function () { root.classList.add("open"); }, 2550)); // 扉が開く
      timers.push(setTimeout(function () { finish(false); }, 4300));              // 後片付け
    }
    if (char.complete) start();
    else char.onload = start;
    timers.push(setTimeout(function () {
      if (!char.complete) finish(true);
    }, 3000));
  }

  // ── あちこち出現（徘徊・のぞき見・ひょっこり） ──────────────
  function startMischief() {
    if (REDUCED) return;
    var probe = new Image();
    var broken = false;
    probe.onerror = function () { broken = true; };
    probe.src = IMG;

    function mkImg() {
      var img = document.createElement("img");
      img.src = IMG; img.alt = "";
      bindFun(img);
      return img;
    }

    // 1) 画面下をてくてく歩く
    function walkerPass(done) {
      var wrap = document.createElement("div");
      wrap.className = "cv-walker";
      wrap.appendChild(mkImg());
      document.body.appendChild(wrap);
      var dur = 15 + Math.random() * 6;
      wrap.style.setProperty("--cv-walk-dur", dur + "s");
      wrap.classList.add(Math.random() < 0.5 ? "ltr" : "rtl");
      setTimeout(function () { wrap.remove(); done(); }, dur * 1000 + 300);
    }

    // 2) 左右の端からのぞき見
    function peek(done) {
      var side = Math.random() < 0.5 ? "left" : "right";
      var wrap = document.createElement("div");
      wrap.className = "cv-peek " + side;
      wrap.style.top = (18 + Math.random() * 50) + "vh";
      wrap.appendChild(mkImg());
      document.body.appendChild(wrap);
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { wrap.classList.add("show"); });
      });
      setTimeout(function () { wrap.classList.remove("show"); }, 2800);
      setTimeout(function () { wrap.remove(); done(); }, 3600);
    }

    // 3) 画面下からひょっこり → 手を振る
    function popUp(done) {
      var wrap = document.createElement("div");
      wrap.className = "cv-pop";
      wrap.style.left = (10 + Math.random() * 70) + "vw";
      wrap.appendChild(mkImg());
      document.body.appendChild(wrap);
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { wrap.classList.add("show"); });
      });
      setTimeout(function () { wrap.classList.add("wave"); }, 650);
      setTimeout(function () { wrap.classList.remove("show"); }, 3100);
      setTimeout(function () { wrap.remove(); done(); }, 3800);
    }

    function nextEvent() {
      if (broken || document.hidden) { schedule(); return; }
      var r = Math.random();
      var fn = r < 0.4 ? walkerPass : (r < 0.72 ? peek : popUp);
      fn(schedule);
    }
    function schedule() {
      setTimeout(nextEvent, 16000 + Math.random() * 26000); // 16〜42秒ごと
    }
    setTimeout(nextEvent, 6000); // 初回は6秒後
  }

  function init() {
    runIntro(startMischief);
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
