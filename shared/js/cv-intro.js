// ================================================================
// Craftvalley — ドット絵キャラ演出 (cv-intro.js)
//   1) トップページ: キャラが歩いてきて「扉」を開くとサイトが現れる
//      （1セッション1回 / クリックでスキップ / 動きを減らす設定なら省略）
//   2) 全ページ: キャラたちがあちこちに登場して来訪者を楽しませる
//      ・画面下をてくてく歩く（途中でひとこと言うことも）
//      ・左右の端からのぞき見 ・上からぶら下がってのぞく
//      ・下からひょっこり＋手を振る ・飛び跳ねながらひとこと
//      ・仲間を呼んで挨拶し、一緒に跳ねて歩き去る「交流」
//      ・クリックするとジャンプして一言しゃべる
//   キャラ画像: shared/img/dot-character.png（主役）
//              shared/img/dot-friend1.png / 2 / 3（仲間・差し替え可能）
// ================================================================

(function () {
  "use strict";

  // ── 設定 ────────────────────────────────────────────────────
  var script = document.currentScript;
  var BASE = script
    ? script.src.replace(/js\/cv-intro\.js.*$/, "img/")
    : "../shared/img/";
  var IMG = BASE + "dot-character.png";
  var FRIENDS = [
    BASE + "dot-friend1.png",
    BASE + "dot-friend2.png",
    BASE + "dot-friend3.png"
  ];
  var THEME = /\/wafuu\//.test(location.pathname) ? "wafuu" : "simple";
  var REDUCED = false;
  try {
    REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch (e) {}

  var IS_INDEX =
    /(^|\/)index\.html$/.test(location.pathname) ||
    /\/(wafuu|simple)\/?$/.test(location.pathname);
  var INTRO_KEY = "cv_intro_done_" + THEME;

  // キャラのセリフ（クリック時・自発的なひとこと）
  var PHRASES = [
    { ja: "ようこそ！", en: "Welcome!" },
    { ja: "ゆっくり見ていってね", en: "Enjoy browsing!" },
    { ja: "職人の技、すごいよ", en: "Handmade in Japan!" },
    { ja: "富山から来ました", en: "Straight from Toyama!" },
    { ja: "いい器あるよ〜", en: "Lovely crafts inside!" },
    { ja: "催事もやってるよ", en: "Check our events!" },
    { ja: "いい天気だなあ", en: "What a nice day!" },
    { ja: "ふんふんふ〜ん♪", en: "Hm hm hmm ♪" }
  ];
  // 交流（あいさつの掛け合い）
  var GREETINGS = [
    [{ ja: "おーい！", en: "Heeey!" }, { ja: "やあ！", en: "Hi there!" }],
    [{ ja: "元気？", en: "How are you?" }, { ja: "ばっちり！", en: "Doing great!" }],
    [{ ja: "新作見た？", en: "Seen the new crafts?" }, { ja: "見た見た！", en: "So lovely!" }],
    [{ ja: "おつかれさま", en: "Good work today!" }, { ja: "おつかれ〜", en: "You too!" }]
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
    /* 日の丸 — 閉じた障子の中央に描かれ、開くと左右に割れる */
    ".cv-intro-wafuu .cv-intro-panel{overflow:hidden;}" +
    ".cv-intro-wafuu .cv-intro-panel::after{content:'';position:absolute;top:50%;" +
    "  width:min(38vmin,320px);height:min(38vmin,320px);border-radius:50%;" +
    "  background:#bc002d;" +
    "  box-shadow:0 0 0 10px rgba(188,0,45,.10),0 4px 24px rgba(90,61,43,.25);}" +
    ".cv-intro-wafuu .cv-intro-left::after{right:0;transform:translate(50%,-50%);}" +
    ".cv-intro-wafuu .cv-intro-right::after{left:0;transform:translate(-50%,-50%);}" +
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
    /* ── 上からぶら下がってのぞく ── */
    ".cv-peek.top{top:0;transform:translateY(-100%);transition:transform .6s ease;}" +
    ".cv-peek.top.show{transform:translateY(-46%);}" +
    ".cv-peek.top img{transform:rotate(180deg);}" +
    /* ── ひょっこり（下から） ── */
    ".cv-pop{position:fixed;bottom:0;z-index:2500;pointer-events:none;" +
    "  transform:translateY(105%);transition:transform .5s cubic-bezier(.34,1.56,.64,1);}" +
    ".cv-pop.show{transform:translateY(10%);}" +
    ".cv-pop img{height:112px;width:auto;image-rendering:pixelated;display:block;" +
    "  pointer-events:auto;cursor:pointer;}" +
    ".cv-pop.wave img{animation:cvWave .9s ease;}" +
    "@keyframes cvWave{0%,100%{transform:rotate(0);}25%{transform:rotate(-7deg);}75%{transform:rotate(7deg);}}" +
    /* ── 交流・とび跳ね用の汎用アクター ── */
    ".cv-actor{position:fixed;bottom:0;z-index:2500;pointer-events:none;" +
    "  transition:left var(--cv-meet-dur,3.2s) linear;}" +
    ".cv-actor img{height:86px;width:auto;image-rendering:pixelated;display:block;" +
    "  pointer-events:auto;cursor:pointer;}" +
    ".cv-actor.flip img{transform:scaleX(-1);}" +
    ".cv-actor.walkbob img{animation:cvBobW .4s steps(2) infinite;}" +
    ".cv-actor.flip.walkbob img{animation:cvBobWf .4s steps(2) infinite;}" +
    ".cv-actor.hopping img{animation:cvJump .5s ease 3;}" +
    ".cv-actor.flip.hopping img{animation:cvJumpF .5s ease 3;}" +
    /* ── 吹き出し＆ジャンプ ── */
    ".cv-bubble{position:fixed;z-index:2600;background:#fff;border:2px solid #333;" +
    "  border-radius:10px;padding:6px 12px;font-size:13px;font-family:sans-serif;" +
    "  color:#222;box-shadow:0 4px 12px rgba(0,0,0,.18);opacity:0;transition:opacity .2s;" +
    "  pointer-events:none;white-space:nowrap;}" +
    ".cv-bubble.show{opacity:1;}" +
    ".cv-bubble::after{content:'';position:absolute;bottom:-7px;left:18px;" +
    "  border:7px solid transparent;border-top-color:#333;border-bottom:0;}" +
    ".cv-bubble.below::after{bottom:auto;top:-7px;border-top-color:transparent;" +
    "  border-bottom:7px solid #333;border-top:0;}" +
    ".cv-jump{animation:cvJump .5s ease !important;}" +
    "@keyframes cvJump{0%,100%{transform:translateY(0);}40%{transform:translateY(-26px);}}" +
    "@keyframes cvJumpF{0%,100%{transform:translateY(0) scaleX(-1);}40%{transform:translateY(-26px) scaleX(-1);}}";

  var styleEl = document.createElement("style");
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  // ── 吹き出し ────────────────────────────────────────────────
  function pickPhrase(list) {
    var lang = (window.CV_LANG === "ja") ? "ja" : "en";
    var p = list[Math.floor(Math.random() * list.length)];
    return p[lang];
  }

  function say(x, y, text, below) {
    var b = document.createElement("div");
    b.className = "cv-bubble" + (below ? " below" : "");
    b.textContent = text || pickPhrase(PHRASES);
    document.body.appendChild(b);
    b.style.left = Math.max(8, Math.min(x, window.innerWidth - 190)) + "px";
    b.style.top = Math.max(8, y) + "px";
    requestAnimationFrame(function () { b.classList.add("show"); });
    setTimeout(function () {
      b.classList.remove("show");
      setTimeout(function () { b.remove(); }, 250);
    }, 1800);
  }

  function sayAbove(el, text) {
    var r = el.getBoundingClientRect();
    say(r.left, r.top - 48, text);
  }

  function sayBelow(el, text) {
    var r = el.getBoundingClientRect();
    say(r.left, r.bottom + 10, text, true);
  }

  function bindFun(img) {
    img.addEventListener("click", function (e) {
      e.stopPropagation();
      img.classList.remove("cv-jump");
      void img.offsetWidth;
      img.classList.add("cv-jump");
      sayAbove(img);
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

    char.onerror = function () { finish(true); };
    root.addEventListener("click", function () { finish(false); });
    document.addEventListener("keydown", function onKey() {
      finish(false);
      document.removeEventListener("keydown", onKey);
    });

    function start() {
      timers.push(setTimeout(function () { root.classList.add("walk"); }, 120));
      timers.push(setTimeout(function () { root.classList.add("push"); }, 2000));
      timers.push(setTimeout(function () { root.classList.add("open"); }, 2550));
      timers.push(setTimeout(function () { finish(false); }, 4300));
    }
    if (char.complete) start();
    else char.onload = start;
    timers.push(setTimeout(function () {
      if (!char.complete) finish(true);
    }, 3000));
  }

  // ── あちこち出現（多キャラ・交流つき） ──────────────────────
  function startMischief() {
    if (REDUCED) return;

    // 使える画像だけをロースターに登録（読めない画像は除外）
    var roster = [];
    function probe(src) {
      var im = new Image();
      im.onload = function () { roster.push(src); };
      im.src = src;
    }
    probe(IMG);
    FRIENDS.forEach(probe);

    function rndSrc() {
      if (!roster.length) return IMG;
      return roster[Math.floor(Math.random() * roster.length)];
    }
    function rndSrcExcept(not) {
      var pool = roster.filter(function (s) { return s !== not; });
      if (!pool.length) return rndSrc();
      return pool[Math.floor(Math.random() * pool.length)];
    }

    function mkImg(src) {
      var img = document.createElement("img");
      img.src = src || rndSrc();
      img.alt = "";
      bindFun(img);
      return img;
    }

    // 1) 画面下をてくてく歩く（途中で50%の確率でひとこと）
    function walkerPass(done) {
      var wrap = document.createElement("div");
      wrap.className = "cv-walker";
      var img = mkImg();
      wrap.appendChild(img);
      document.body.appendChild(wrap);
      var dur = 15 + Math.random() * 6;
      wrap.style.setProperty("--cv-walk-dur", dur + "s");
      wrap.classList.add(Math.random() < 0.5 ? "ltr" : "rtl");
      if (Math.random() < 0.5) {
        setTimeout(function () {
          if (img.isConnected) sayAbove(img);
        }, dur * 400); // 道のりの約40%地点
      }
      setTimeout(function () { wrap.remove(); done(); }, dur * 1000 + 300);
    }

    // 2) 左右の端からのぞき見（40%でひとこと）
    function peek(done) {
      var side = Math.random() < 0.5 ? "left" : "right";
      var wrap = document.createElement("div");
      wrap.className = "cv-peek " + side;
      wrap.style.top = (18 + Math.random() * 50) + "vh";
      var img = mkImg();
      wrap.appendChild(img);
      document.body.appendChild(wrap);
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { wrap.classList.add("show"); });
      });
      if (Math.random() < 0.4) {
        setTimeout(function () { if (img.isConnected) sayAbove(img); }, 900);
      }
      setTimeout(function () { wrap.classList.remove("show"); }, 2800);
      setTimeout(function () { wrap.remove(); done(); }, 3600);
    }

    // 3) 上からぶら下がってのぞく（さかさま）
    function topPeek(done) {
      var wrap = document.createElement("div");
      wrap.className = "cv-peek top";
      wrap.style.left = (12 + Math.random() * 70) + "vw";
      var img = mkImg();
      wrap.appendChild(img);
      document.body.appendChild(wrap);
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { wrap.classList.add("show"); });
      });
      if (Math.random() < 0.5) {
        setTimeout(function () { if (img.isConnected) sayBelow(img); }, 1000);
      }
      setTimeout(function () { wrap.classList.remove("show"); }, 3000);
      setTimeout(function () { wrap.remove(); done(); }, 3800);
    }

    // 4) 画面下からひょっこり → 手を振る
    function popUp(done) {
      var wrap = document.createElement("div");
      wrap.className = "cv-pop";
      wrap.style.left = (10 + Math.random() * 70) + "vw";
      var img = mkImg();
      wrap.appendChild(img);
      document.body.appendChild(wrap);
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { wrap.classList.add("show"); });
      });
      setTimeout(function () { wrap.classList.add("wave"); }, 650);
      setTimeout(function () { wrap.classList.remove("show"); }, 3100);
      setTimeout(function () { wrap.remove(); done(); }, 3800);
    }

    // 5) 飛び跳ねながらひとこと
    function hopSay(done) {
      var wrap = document.createElement("div");
      wrap.className = "cv-actor";
      wrap.style.left = (15 + Math.random() * 60) + "vw";
      wrap.style.transition = "none";
      wrap.style.bottom = "-96px";
      var img = mkImg();
      wrap.appendChild(img);
      document.body.appendChild(wrap);
      // せり上がる
      wrap.style.transition = "bottom .5s cubic-bezier(.34,1.56,.64,1)";
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { wrap.style.bottom = "0px"; });
      });
      setTimeout(function () { wrap.classList.add("hopping"); }, 600);
      setTimeout(function () { if (img.isConnected) sayAbove(img); }, 1300);
      setTimeout(function () { wrap.style.bottom = "-100px"; }, 3600);
      setTimeout(function () { wrap.remove(); done(); }, 4400);
    }

    // 6) 交流: 仲間を呼んで挨拶 → 一緒に跳ねて歩き去る
    function meetup(done) {
      var srcA = rndSrc();
      var srcB = rndSrcExcept(srcA);
      var mid = window.innerWidth / 2;

      var a = document.createElement("div");
      a.className = "cv-actor walkbob";
      a.style.left = "-120px";
      var imgA = mkImg(srcA);
      a.appendChild(imgA);

      var b = document.createElement("div");
      b.className = "cv-actor walkbob flip";
      b.style.left = (window.innerWidth + 60) + "px";
      var imgB = mkImg(srcB);
      b.appendChild(imgB);

      document.body.appendChild(a);
      document.body.appendChild(b);

      var greet = GREETINGS[Math.floor(Math.random() * GREETINGS.length)];
      var lang = (window.CV_LANG === "ja") ? "ja" : "en";

      // 両側から歩いてきて中央で出会う
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          a.style.left = (mid - 110) + "px";
          b.style.left = (mid + 30) + "px";
        });
      });
      setTimeout(function () {                      // 立ち止まる
        a.classList.remove("walkbob");
        b.classList.remove("walkbob");
      }, 3300);
      setTimeout(function () {                      // あいさつ
        if (imgA.isConnected) sayAbove(imgA, greet[0][lang]);
      }, 3600);
      setTimeout(function () {                      // 返事
        if (imgB.isConnected) sayAbove(imgB, greet[1][lang]);
      }, 5100);
      setTimeout(function () {                      // 一緒にジャンプ
        a.classList.add("hopping");
        b.classList.add("hopping");
      }, 6700);
      setTimeout(function () {                      // 連れ立って歩き去る
        a.classList.remove("hopping");
        b.classList.remove("hopping");
        b.classList.remove("flip");                 // 同じ向きで
        a.classList.add("walkbob");
        b.classList.add("walkbob");
        a.style.left = (window.innerWidth + 40) + "px";
        b.style.left = (window.innerWidth + 170) + "px";
      }, 8600);
      setTimeout(function () {
        a.remove(); b.remove(); done();
      }, 12300);
    }

    function nextEvent() {
      if (document.hidden || !roster.length) { schedule(); return; }
      var r = Math.random();
      var fn;
      if (r < 0.22) fn = walkerPass;
      else if (r < 0.42) fn = peek;
      else if (r < 0.54) fn = topPeek;
      else if (r < 0.68) fn = popUp;
      else if (r < 0.80) fn = hopSay;
      else fn = meetup;
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
