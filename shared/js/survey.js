// ================================================================
// Craft Valley — 初回アンケートの台本 (survey.js)
//   サイトを初めて開いたときに、4人のドットキャラが話しかける会話の内容です。
//   このファイルは編集画面 admin.html（🎭 アンケート）から書き出されています。
//   shared/js/ フォルダの survey.js にこのファイルを上書きすると公開されます。
//
//   ※ 各選択肢の val は回答の集計に使う記号です。変えないでください。
//   ※ 手動でも編集できますが、形式を崩さないようご注意ください。
// ================================================================

window.CV_SURVEY = {
  "ja": {
    "langBtn": "English",
    "skip": "とばす →",
    "send": "伝える",
    "later": "またこんど",
    "enter": "谷へ入る ▶",
    "timeout": "……おっと、時間切れ。つぎ行こう！",
    "chars": {
      "haru": "ハル",
      "mio": "ミオ",
      "ken": "ケン",
      "tabi": "タビ",
      "all": "みんな"
    },
    "scenes": [
      {
        "who": "haru",
        "q": 1,
        "intro": [
          "やあ！　ようこそ、<em>飛能越</em>の谷へ。",
          "ぼくはハル。この谷の案内人さ。",
          "ひとつ聞いてもいいかな？"
        ],
        "ask": "<em>Craft Valley</em>って、聞いたことある？",
        "options": [
          {
            "ic": "🌟",
            "label": "うん、よく知ってる",
            "val": "know-well",
            "react": "おお、知ってるんだ！　うれしいなあ。"
          },
          {
            "ic": "👂",
            "label": "名前だけなら",
            "val": "heard-of",
            "react": "名前だけでも届いてたんだね。"
          },
          {
            "ic": "🆕",
            "label": "今日はじめて知った",
            "val": "first-time",
            "react": "はじめまして！　じゃあ、ゆっくり案内するね。"
          },
          {
            "ic": "🤔",
            "label": "よくわからない",
            "val": "not-sure",
            "react": "だいじょうぶ。今日ではっきりするよ。"
          }
        ]
      },
      {
        "who": "mio",
        "q": 2,
        "intro": [
          "ハル、その人だれ？",
          "……あ、お客さん！　わたしはミオ。",
          "ねえねえ、教えてほしいことがあるの。"
        ],
        "ask": "<em>「Craft Valley」</em>って聞いて、どんな景色が浮かぶ？",
        "options": [
          {
            "ic": "🏺",
            "label": "職人と伝統工芸",
            "val": "traditional-craft",
            "react": "そう、それ！　この谷は職人の谷なの。"
          },
          {
            "ic": "🏔️",
            "label": "山と自然",
            "val": "mountains",
            "react": "山、いいよね。谷の名前のとおり。"
          },
          {
            "ic": "🍶",
            "label": "発酵と日本の味",
            "val": "food-drink",
            "react": "食いしん坊さんだ！　わたしも。"
          },
          {
            "ic": "✨",
            "label": "新しい日本のブランド",
            "val": "modern-brand",
            "react": "新しいって思ってもらえるの、うれしい。"
          },
          {
            "ic": "❓",
            "label": "まだイメージがない",
            "val": "no-image",
            "react": "それなら、これから一緒に見つけよう。"
          }
        ]
      },
      {
        "who": "ken",
        "q": 3,
        "intro": [
          "よう。おれはケン。",
          "工芸品、好きなんだ。"
        ],
        "ask": "日本の<em>伝統工芸品</em>、持ってたり贈ったりしたことある？",
        "options": [
          {
            "ic": "💝",
            "label": "うん、集めてる",
            "val": "yes-several",
            "react": "おっ、同志だな。話が合いそうだ。"
          },
          {
            "ic": "🎁",
            "label": "1〜2回くらい",
            "val": "yes-once",
            "react": "いいね。その一つ、大事にしてくれてる？"
          },
          {
            "ic": "🌱",
            "label": "まだ。でも欲しい",
            "val": "want-to",
            "react": "その気持ちがあれば十分さ。"
          },
          {
            "ic": "👀",
            "label": "とくに考えてない",
            "val": "not-yet",
            "react": "見てるだけでも楽しいから、気楽にな。"
          }
        ]
      },
      {
        "who": "tabi",
        "q": 4,
        "intro": [
          "旅の途中で寄ったんだ。タビっていう。",
          "この谷、いいところだよ。"
        ],
        "ask": "きみは、この谷で<em>なにを探しに</em>来た？",
        "options": [
          {
            "ic": "🤲",
            "label": "職人に会いたい",
            "val": "artisans",
            "react": "会えるよ。ひとりひとり、物語がある。"
          },
          {
            "ic": "🛍️",
            "label": "本物の工芸品が欲しい",
            "val": "buy",
            "react": "目利きだね。いいものが揃ってる。"
          },
          {
            "ic": "📖",
            "label": "歴史や物語を知りたい",
            "val": "story",
            "react": "この谷には400年分の話があるんだ。"
          },
          {
            "ic": "🍱",
            "label": "発酵食品を味わいたい",
            "val": "food",
            "react": "麹とビール、どっちも試してほしい。"
          },
          {
            "ic": "✈️",
            "label": "いつか工房を訪ねたい",
            "val": "visit",
            "react": "来なよ。駅からの道も案内してある。"
          }
        ]
      },
      {
        "who": "all",
        "q": 5,
        "free": true,
        "intro": [
          "みんな：最後にひとつだけ。"
        ],
        "ask": "日本の<em>工芸文化</em>について、気になってることはある？\n（なければ「またこんど」でOK）",
        "react": "ありがとう。ちゃんと届いたよ。"
      }
    ],
    "endings": {
      "artisans": "じゃあ、まずは<em>職人たち</em>に会いに行こう。",
      "buy": "じゃあ、まずは<em>工芸品の棚</em>を見に行こう。",
      "story": "じゃあ、まずは<em>谷の物語</em>から読もう。",
      "food": "じゃあ、まずは<em>麹と麦酒</em>のところへ行こう。",
      "visit": "じゃあ、まずは<em>催事と道案内</em>を見よう。",
      "default": "じゃあ、いっしょに谷を歩こう。"
    },
    "door": "扉が開いた。さあ、行こう！"
  },
  "en": {
    "langBtn": "日本語",
    "skip": "Skip →",
    "send": "Tell them",
    "later": "Maybe later",
    "enter": "Enter the valley ▶",
    "timeout": "…Oops, time's up. Let's move on!",
    "chars": {
      "haru": "Haru",
      "mio": "Mio",
      "ken": "Ken",
      "tabi": "Tabi",
      "all": "Everyone"
    },
    "scenes": [
      {
        "who": "haru",
        "q": 1,
        "intro": [
          "Hey! Welcome to the valley of <em>Hinouetsu</em>.",
          "I'm Haru, your guide around here.",
          "Mind if I ask you something?"
        ],
        "ask": "Have you heard of <em>Craft Valley</em> before?",
        "options": [
          {
            "ic": "🌟",
            "label": "Yes, I know it well",
            "val": "know-well",
            "react": "Oh, you know us! That makes me happy."
          },
          {
            "ic": "👂",
            "label": "Just the name",
            "val": "heard-of",
            "react": "So the name has travelled. Nice."
          },
          {
            "ic": "🆕",
            "label": "First time hearing of it",
            "val": "first-time",
            "react": "Nice to meet you! I'll show you around."
          },
          {
            "ic": "🤔",
            "label": "Not sure",
            "val": "not-sure",
            "react": "No worries. It'll all make sense today."
          }
        ]
      },
      {
        "who": "mio",
        "q": 2,
        "intro": [
          "Haru, who's that?",
          "…Oh, a visitor! I'm Mio.",
          "Can I ask you something?"
        ],
        "ask": "When you hear <em>\"Craft Valley\"</em>, what do you picture?",
        "options": [
          {
            "ic": "🏺",
            "label": "Artisans & traditional craft",
            "val": "traditional-craft",
            "react": "Yes, exactly! This is a valley of makers."
          },
          {
            "ic": "🏔️",
            "label": "Mountains & nature",
            "val": "mountains",
            "react": "The mountains are lovely — true to the name."
          },
          {
            "ic": "🍶",
            "label": "Fermentation & Japanese food",
            "val": "food-drink",
            "react": "A food lover! Me too."
          },
          {
            "ic": "✨",
            "label": "A fresh Japanese brand",
            "val": "modern-brand",
            "react": "I'm glad it feels new to you."
          },
          {
            "ic": "❓",
            "label": "No image yet",
            "val": "no-image",
            "react": "Then let's find one together."
          }
        ]
      },
      {
        "who": "ken",
        "q": 3,
        "intro": [
          "Hey. I'm Ken.",
          "I'm into crafts myself."
        ],
        "ask": "Have you ever owned or gifted a piece of <em>traditional Japanese craft</em>?",
        "options": [
          {
            "ic": "💝",
            "label": "Yes, I collect them",
            "val": "yes-several",
            "react": "A fellow collector! We'll get along."
          },
          {
            "ic": "🎁",
            "label": "Once or twice",
            "val": "yes-once",
            "react": "Nice. Still taking good care of it?"
          },
          {
            "ic": "🌱",
            "label": "Not yet, but I'd like to",
            "val": "want-to",
            "react": "That feeling is all you need."
          },
          {
            "ic": "👀",
            "label": "Not really",
            "val": "not-yet",
            "react": "Just looking is fun too. Take it easy."
          }
        ]
      },
      {
        "who": "tabi",
        "q": 4,
        "intro": [
          "I stopped by on my travels. Call me Tabi.",
          "This valley's a good place."
        ],
        "ask": "What did you come to this valley <em>looking for</em>?",
        "options": [
          {
            "ic": "🤲",
            "label": "To meet the artisans",
            "val": "artisans",
            "react": "You will. Each one has a story."
          },
          {
            "ic": "🛍️",
            "label": "Authentic craft objects",
            "val": "buy",
            "react": "Good eye. There's fine work here."
          },
          {
            "ic": "📖",
            "label": "History and stories",
            "val": "story",
            "react": "This valley holds 400 years of them."
          },
          {
            "ic": "🍱",
            "label": "Fermented food & drink",
            "val": "food",
            "react": "Try both the koji and the beer."
          },
          {
            "ic": "✈️",
            "label": "To visit a workshop someday",
            "val": "visit",
            "react": "Come. Directions from the station are ready."
          }
        ]
      },
      {
        "who": "all",
        "q": 5,
        "free": true,
        "intro": [
          "Everyone: One last thing."
        ],
        "ask": "Anything you've wondered about <em>Japan's craft culture</em>?\n(If not, just say \"Maybe later\".)",
        "react": "Thank you. We heard you."
      }
    ],
    "endings": {
      "artisans": "Then let's go meet the <em>artisans</em> first.",
      "buy": "Then let's look at the <em>collection</em> first.",
      "story": "Then let's start with the <em>valley's story</em>.",
      "food": "Then let's head to the <em>koji and beer</em>.",
      "visit": "Then let's check the <em>events and directions</em>.",
      "default": "Then let's walk the valley together."
    },
    "door": "The door is open. Let's go!"
  }
};
