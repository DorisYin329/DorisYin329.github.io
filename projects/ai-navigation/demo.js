
"use strict";

const canvas = document.getElementById("roadCanvas");
const ctx = canvas.getContext("2d");

const COLS = 22;
const ROWS = 7;
const TILE = 40;

const colors = {
    road: "#30343d",
    stone: "#999da8",
    grass: "#54794b",
    goal: "#68d7cf",
    agent: "#b5a4f5"
};

const directions = [
    { x: 1, y: 0, name: "East" },
    { x: 0, y: 1, name: "South" },
    { x: -1, y: 0, name: "West" },
    { x: 0, y: -1, name: "North" }
];

let agent;
let steps;
let reward;
let finished;
let status;
let lastAction;
let autoTimer = null;

function getBlock(x, y) {
    if (x === 20 && y === 3) return "goal";

    if (x >= 0 && x <= 20) {
        if (y === 1 || y === 5) return "stone";
        if (x < 20 && y >= 2 && y <= 4) return "road";
    }

    return "grass";
}

function drawMap() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            const block = getBlock(x, y);

            ctx.fillStyle = colors[block];
            ctx.fillRect(
                x * TILE,
                y * TILE,
                TILE - 1,
                TILE - 1
            );

            ctx.fillStyle = "#ffffff10";
            ctx.fillRect(
                x * TILE + 2,
                y * TILE + 2,
                TILE - 5,
                3
            );
        }
    }

    // 終點
    ctx.fillStyle = "#c5ffff";
    ctx.font = "24px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("◆", 20.5 * TILE, 3.5 * TILE);

    // Agent
    ctx.save();
    ctx.translate(
        (agent.x + 0.5) * TILE,
        (agent.y + 0.5) * TILE
    );

    ctx.rotate(agent.dir * Math.PI / 2);

    ctx.fillStyle = colors.agent;
    ctx.fillRect(-13, -13, 26, 26);

    ctx.fillStyle = "#22243b";
    ctx.beginPath();
    ctx.moveTo(10, 0);
    ctx.lineTo(-6, -8);
    ctx.lineTo(-6, 8);
    ctx.closePath();
    ctx.fill();

    ctx.restore();

    drawObservation();
}

function drawObservation() {
    const observation = document.getElementById("observation");
    observation.replaceChildren();

    const forward = directions[agent.dir];
    const right = directions[(agent.dir + 1) % 4];

    for (let distance = 5; distance >= 1; distance--) {
        for (let offset = -2; offset <= 2; offset++) {

            const x = agent.x
                + forward.x * distance
                + right.x * offset;

            const y = agent.y
                + forward.y * distance
                + right.y * offset;

            const block = getBlock(x, y);
            const cell = document.createElement("div");

            cell.style.backgroundColor = colors[block];
            cell.title = block;

            observation.appendChild(cell);
        }
    }
}

function updateUI() {
    document.getElementById("steps").textContent = steps;

    document.getElementById("reward").textContent =
        reward.toFixed(1);

    document.getElementById("status").textContent = status;

    document.getElementById("action").textContent =
        lastAction;

    document.getElementById("position").textContent =
        `(${agent.x}, ${agent.y})`;

    document.getElementById("direction").textContent =
        directions[agent.dir].name;

    ["leftBtn", "forwardBtn", "rightBtn", "stopBtn", "autoBtn"]
        .forEach(id => {
            document.getElementById(id).disabled = finished;
        });

    drawMap();
}

function stopAuto() {
    if (autoTimer !== null) {
        clearInterval(autoTimer);
        autoTimer = null;
    }

    document.getElementById("autoBtn").textContent =
        "▶ Auto Navigation";
}

function reset() {
    stopAuto();

    agent = { x: 0, y: 3, dir: 0 };
    steps = 0;
    reward = 0;
    finished = false;
    status = "Ready";
    lastAction = "—";

    updateUI();
}

function performAction(action) {
    if (finished) return;

    steps++;
    lastAction = action;
    status = "Navigating";

    if (action === "turn -1") {
        agent.dir = (agent.dir + 3) % 4;

    } else if (action === "turn 1") {
        agent.dir = (agent.dir + 1) % 4;

    } else if (action === "move 1") {
        const direction = directions[agent.dir];

        agent.x += direction.x;
        agent.y += direction.y;

        const block = getBlock(agent.x, agent.y);

        if (block === "goal") {
            reward += 10;
            status = "Success";
            finished = true;
            stopAuto();

        } else if (block === "stone") {
            reward -= 2;
            status = "Failed";
            finished = true;
            stopAuto();

        } else if (block === "road") {
            reward += 5;

        } else {
            status = "Off road";
            finished = true;
            stopAuto();
        }

    } else if (action === "move 0") {
        status = "Paused";
        stopAuto();
    }

    if (steps >= 150 && !finished) {
        status = "Step limit";
        finished = true;
        stopAuto();
    }

    updateUI();
}

// 規則式導航：不宣稱使用原始 Q-table 推論
function autoStep() {
    if (finished) {
        stopAuto();
        return;
    }

    let targetDirection;

    if (agent.y > 3) {
        targetDirection = 3;
    } else if (agent.y < 3) {
        targetDirection = 1;
    } else {
        targetDirection = 0;
    }

    if (agent.dir === targetDirection) {
        performAction("move 1");
    } else {
        const difference =
            (targetDirection - agent.dir + 4) % 4;

        performAction(
            difference === 3 ? "turn -1" : "turn 1"
        );
    }
}

function startAuto() {
    if (finished) return;

    if (autoTimer !== null) {
        stopAuto();
        status = "Paused";
        updateUI();
        return;
    }

    document.getElementById("autoBtn").textContent =
        "Ⅱ Pause";

    autoTimer = setInterval(autoStep, 300);
}

document.getElementById("forwardBtn").onclick = () => {
    stopAuto();
    performAction("move 1");
};

document.getElementById("leftBtn").onclick = () => {
    stopAuto();
    performAction("turn -1");
};

document.getElementById("rightBtn").onclick = () => {
    stopAuto();
    performAction("turn 1");
};

document.getElementById("stopBtn").onclick = () => {
    performAction("move 0");
};

document.getElementById("autoBtn").onclick = startAuto;
document.getElementById("resetBtn").onclick = reset;

// 鍵盤操作
document.addEventListener("keydown", event => {
    if (["INPUT", "SELECT", "TEXTAREA", "BUTTON", "VIDEO"]
        .includes(event.target.tagName)) return;

    const demo = document.getElementById("demo");
    const rect = demo.getBoundingClientRect();

    if (rect.bottom < 0 || rect.top > window.innerHeight) return;

    const actions = {
        ArrowUp: "move 1",
        ArrowLeft: "turn -1",
        ArrowRight: "turn 1",
        ArrowDown: "move 0"
    };

    if (actions[event.key]) {
        event.preventDefault();
        stopAuto();
        performAction(actions[event.key]);
    }
});

reset();