# Shadow Moon 🌙

> Between Code & Stars. — Welcome to my little universe.

個人網站（單頁式），使用 HTML5 + CSS3 + Vanilla JavaScript，部署於 GitHub Pages。
網址：<https://dorisyin329.github.io/>

## 檔案結構

```
DorisYin329.github.io/
├── index.html        # 頁面內容（六個區塊）
├── css/style.css     # 樣式（頂部有色彩 / 間距 tokens）
├── js/main.js        # 導覽、星空、捲動動畫、專案視窗
├── images/           # 圖片與 SVG 佔位圖
├── robots.txt / sitemap.xml
└── README.md
```

## 部署到 GitHub Pages

1. 登入 GitHub，建立新 Repository，名稱必須是 **`DorisYin329.github.io`**，設為 Public。
2. 上傳檔案（擇一）：
   - 網頁上傳：進入 repo → **Add file → Upload files**，把資料夾**裡面**的所有檔案與資料夾（不是外層資料夾本身）拖進去 → **Commit changes**。
   - 或使用 Git：
     ```bash
     cd DorisYin329.github.io
     git init
     git add .
     git commit -m "Initial commit: Shadow Moon"
     git branch -M main
     git remote add origin https://github.com/DorisYin329/DorisYin329.github.io.git
     git push -u origin main
     ```
3. 啟用 Pages：repo → **Settings → Pages** → Build and deployment 的 Source 選 **Deploy from a branch**，Branch 選 **main**、資料夾選 **/ (root)** → **Save**。
4. 等待 1–3 分鐘，開啟 <https://dorisyin329.github.io/> 確認。之後每次 push 都會自動更新。

## 之後如何修改

| 想改的內容 | 位置 |
|---|---|
| 個人照片 | 把照片放進 `images/`，修改 `index.html` About 區的 `images/profile-placeholder.svg` |
| 專案圖片 | 替換 `images/project-*.svg`（或改 `<img src>`） |
| 專案 GitHub 連結 | 各專案卡片的 `GitHub` 按鈕 `href` |
| 專案詳情文字 | 按鈕上的 `data-title` / `data-summary` |
| Email / 社群 | `index.html` 的 Contact 區，依註解改成 `<a>` 連結 |
| 新增專案卡片 | 複製一個 `<article class="card project-card reveal">` |
| 色彩 / 間距 | `css/style.css` 最上方的 `:root` |

## 設計重點

- 色彩：深夜藍 `#0b1026`、寶藍 `#4361ee`、月光紫 `#b7a6ff`、柔和白 `#f2f0ff`
- 無外部套件、字型與 API；星空為單一 canvas，分頁隱藏時暫停
- 支援 `prefers-reduced-motion`（自動停用動畫）
- 未提供的資料（Email、社群、專案成果）皆為佔位，不含虛構內容

## 未來擴充

可新增 `interests/travel.html`、`interests/photography.html` 等獨立頁面，沿用同一份 `css/style.css` 與 `js/main.js`。
