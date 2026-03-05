## Context

英雄區塊 (`BarometerHeroComponent`) 的 `hero-left` 目前以 `flex-direction: column` 垂直排列：日期 → 加權指數 → 成交金額。後端 `MarketStats` 已有上漲/漲停/下跌/跌停/平盤家數欄位，前端 model 尚未對應。視覺設計方向已在探索階段確認：三色比例條（紅/灰/綠），左側標示上漲百分比與家數，右側標示下跌百分比與家數，中間灰色段為平盤。

## Goals / Non-Goals

**Goals:**
- 新增 `BreadthBarComponent` standalone 元件，接受五個廣度數字作為 input，輸出三色比例條 UI
- 在 `BarometerHeroComponent` 成交金額下方嵌入 `BreadthBarComponent`
- 前端 `MarketStats` interface 補齊五個廣度欄位

**Non-Goals:**
- 不新增任何 API 端點或 HTTP 請求（資料來自已有的 `todayStats` input）
- 不在趨勢圖表中顯示歷史廣度趨勢（留待後續）
- 不顯示漲停/跌停家數（簡化首版）

## Decisions

**1. 獨立 `BreadthBarComponent` 而非內嵌 template**

廣度條有獨立的計算邏輯（百分比換算、三段寬度）與樣式，抽成 component 可單元測試，也方便未來重用於其他位置。

**2. 比例以總家數為分母（三段加總 = 100%）**

`advancePct = advanceCount / total`，`unchangedPct = unchangedCount / total`，`declinePct = declineCount / total`。三段加總恆等於 100%，bar 不留空白缺口，顯示平盤的灰色段。

**3. 台灣慣例色彩：紅漲綠跌**

左側（上漲）使用 `var(--color-positive)`（紅），右側（下跌）使用 `var(--color-negative)`（綠），平盤使用 `var(--border-color)` 或類似灰色 token，與系統既有 CSS 變數一致。

**4. 資料缺失時隱藏元件**

若 `advanceCount` / `declineCount` 為 null（舊資料無廣度欄位），`BreadthBarComponent` 不渲染任何內容（`@if` guard），避免顯示錯誤比例。

## Risks / Trade-offs

- **hero-left 空間有限**：`flex: 0 0 28%` 在小螢幕上可能略窄，但 component 本身採 `width: 100%` 自適應，手機版折成縱向排列後不受影響。→ 觀察上線後視覺效果，必要時微調 `hero-left` 的 flex-basis。
- **舊資料無廣度欄位**：切換至早期日期時廣度條消失，體驗略有落差。→ 以「無資料則不顯示」為合理降級。
