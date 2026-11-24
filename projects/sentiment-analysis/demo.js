
"use strict";

// ========================================
// 展示用範例
// 人工標註，非 BERT 模型實際推論結果
// ========================================

const examples = [
    {
        text: "今天收到好消息，真的很開心！",
        sentiment: "positive",
        emotion: "happy",
        dialogue_act: "statement-opinion"
    },
    {
        text: "又加班到晚上十點，真是太幸福了。",
        sentiment: "negative",
        emotion: "negative-other",
        dialogue_act: "irony"
    },
    {
        text: "明天的會議是幾點開始？",
        sentiment: "neutral",
        emotion: "neutral",
        dialogue_act: "question"
    },
    {
        text: "謝謝你願意幫忙，真的很感激。",
        sentiment: "positive",
        emotion: "grateful",
        dialogue_act: "thanking"
    },
    {
        text: "我不太同意這個做法。",
        sentiment: "negative",
        emotion: "negative-other",
        dialogue_act: "disagreement"
    },
    {
        text: "最近工作壓力很大，有點擔心。",
        sentiment: "negative",
        emotion: "worried",
        dialogue_act: "statement-opinion"
    },
    {
        text: "今天終於可以好好休息了。",
        sentiment: "positive",
        emotion: "relaxed",
        dialogue_act: "statement-opinion"
    },
    {
        text: "每次都把工作丟給別人，真的很生氣。",
        sentiment: "negative",
        emotion: "anger",
        dialogue_act: "statement-opinion"
    },
    {
        text: "對不起，我剛剛說話太直接了。",
        sentiment: "negative",
        emotion: "negative-other",
        dialogue_act: "apology"
    },
    {
        text: "沒關係，慢慢來，你已經做得很好了。",
        sentiment: "positive",
        emotion: "positive-other",
        dialogue_act: "comfort"
    }
];

// ========================================
// 中文分類名稱
// ========================================

const names = {

    // Sentiment

    "positive": "正向",
    "negative": "負向",
    "neutral": "中立",

    // Emotion

    "relaxed": "放鬆",
    "anger": "憤怒",
    "depress": "沮喪",
    "disgust": "厭惡",
    "negative-other": "其他負面情緒",
    "worried": "擔憂",
    "fear": "恐懼",
    "happy": "開心",
    "astonished": "驚訝",
    "grateful": "感激",
    "positive-other": "其他正面情緒",
    "sadness": "悲傷",

    // Dialogue Act

    "greeting": "問候",
    "answer": "回答",
    "question": "提問",
    "statement-non-opinion": "客觀陳述",
    "interjection": "感嘆",
    "statement-opinion": "意見陳述",
    "other": "其他",
    "irony": "反諷",
    "apology": "道歉",
    "command": "命令",
    "agreement": "同意",
    "disagreement": "不同意",
    "thanking": "道謝",
    "acknowledge": "確認",
    "appreciation": "讚賞",
    "comfort": "安慰",
    "conventional-closing": "結束語",
    "reject": "拒絕",
    "quotation": "引用"

};

// ========================================
// 模擬社群留言
// ========================================

const comments = [
    {
        text: "又加班到晚上十點，真是太幸福了。",
        sentiment: "negative",
        emotion: "negative-other",
        dialogue_act: "irony"
    },
    {
        text: "我覺得工作和生活應該要取得平衡。",
        sentiment: "neutral",
        emotion: "neutral",
        dialogue_act: "statement-opinion"
    },
    {
        text: "最近工作壓力很大，有點擔心。",
        sentiment: "negative",
        emotion: "worried",
        dialogue_act: "statement-opinion"
    },
    {
        text: "下班後可以做自己喜歡的事情，真的很開心。",
        sentiment: "positive",
        emotion: "happy",
        dialogue_act: "statement-opinion"
    },
    {
        text: "我完全同意，休息真的很重要。",
        sentiment: "positive",
        emotion: "positive-other",
        dialogue_act: "agreement"
    }
];

// ========================================
// DOM 元素
// ========================================

const $ = id => document.getElementById(id);

const exampleSelect = $("example");
const sentenceInput = $("sentence");
const resultContainer = $("result");

let batchMode = false;

// ========================================
// 初始化下拉選單
// ========================================

examples.forEach((example, index) => {

    const option = document.createElement("option");

    option.value = index;
    option.textContent = example.text;

    exampleSelect.appendChild(option);

});

// ========================================
// 更新文字範例
// ========================================

function syncExample() {

    const index = Number(exampleSelect.value);

    sentenceInput.value = examples[index].text;

    resultContainer.replaceChildren();

}

// ========================================
// 切換分析模式
// ========================================

function switchMode(value) {

    batchMode = value;

    $("single").hidden = batchMode;
    $("group").hidden = !batchMode;

    $("manual").setAttribute(
        "aria-pressed",
        String(!batchMode)
    );

    $("batch").setAttribute(
        "aria-pressed",
        String(batchMode)
    );

    resultContainer.replaceChildren();

}

// ========================================
// 建立分類結果卡片
// ========================================

function createResultCard(data) {

    const card = document.createElement("article");

    card.className = `result ${data.sentiment}`;

    const text = document.createElement("p");

    text.className = "sentence-text";
    text.textContent = data.text;

    card.appendChild(text);

    const grid = document.createElement("div");

    grid.className = "stats";

    const tasks = [
        {
            label: "情感分析",
            value: data.sentiment,
            color: data.sentiment
        },
        {
            label: "情緒分析",
            value: data.emotion,
            color: ""
        },
        {
            label: "對話行為",
            value: data.dialogue_act,
            color: ""
        }
    ];

    tasks.forEach(task => {

        const box = document.createElement("div");

        const label = document.createElement("small");

        label.textContent = task.label;

        const result = document.createElement("strong");

        result.textContent =
            names[task.value] || task.value;

        if (task.color) {
            result.classList.add(task.color);
        }

        const english = document.createElement("small");

        english.textContent = task.value;

        box.append(
            label,
            result,
            english
        );

        grid.appendChild(box);

    });

    card.appendChild(grid);

    resultContainer.appendChild(card);

}

// ========================================
// 留言分析摘要
// ========================================

function createSummary(data) {

    const positive = data.filter(
        item => item.sentiment === "positive"
    ).length;

    const neutral = data.filter(
        item => item.sentiment === "neutral"
    ).length;

    const negative = data.filter(
        item => item.sentiment === "negative"
    ).length;

    const summary = document.createElement("div");

    summary.className = "result";

    const title = document.createElement("h3");

    title.textContent = "留言情感統計";

    summary.appendChild(title);

    const grid = document.createElement("div");

    grid.className = "stats";

    const counts = [
        ["正向留言", positive, "positive"],
        ["中立留言", neutral, "neutral"],
        ["負向留言", negative, "negative"]
    ];

    counts.forEach(([label, count, color]) => {

        const box = document.createElement("div");

        const name = document.createElement("small");

        name.textContent = label;

        const number = document.createElement("strong");

        number.textContent = count;
        number.className = color;

        const percent = document.createElement("small");

        percent.textContent =
            (count / data.length * 100).toFixed(0) + "%";

        box.append(name, number, percent);

        grid.appendChild(box);

    });

    summary.appendChild(grid);

    resultContainer.appendChild(summary);

}

// ========================================
// 執行展示
// ========================================

function analyze() {

    resultContainer.replaceChildren();

    if (batchMode) {

        createSummary(comments);

        comments.forEach(comment => {
            createResultCard(comment);
        });

    } else {

        const index = Number(exampleSelect.value);

        createResultCard(examples[index]);

    }

}

// ========================================
// 綁定事件
// ========================================

exampleSelect.addEventListener(
    "change",
    syncExample
);

$("manual").addEventListener("click", () => {
    switchMode(false);
});

$("batch").addEventListener("click", () => {
    switchMode(true);
});

$("analyze").addEventListener(
    "click",
    analyze
);

// 初始化

syncExample();
