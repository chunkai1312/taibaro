## Context

目前 `DashboardStateService` 持有 `selectedDate`、`selectedRange`、`startDate`（computed）、`endDate`（computed）四個狀態，Toolbar 同時控制日期與 range，所有圖表共享同一對 `[startDate, endDate]`。每次切換 range 都觸發 API 重新呼叫。

K 線圖（`KlineChartComponent`）直接注入 Service 取資料；籌碼趨勢圖（`ChartTabGroupComponent`）則由 `DashboardComponent` fetch 後以 `[data]` input 傳入。

## Goals / Non-Goals

**Goals:**
- 移除 Toolbar 的 range 選擇器，讓 Toolbar 只管「我在看哪一天」
- K 線圖與趨勢圖各自在卡片標題列有獨立的 range 選擇器
- range 切換為純前端 slice，無網路請求
- 日期改變時統一抓近 1Y 資料（兩圖共用此策略）
- `DashboardStateService` 瘦身，只保留 `selectedDate`

**Non-Goals:**
- 不支援每個趨勢 Tab 有獨立 range（整張趨勢卡片共享一個 range）
- 不持久化各卡片的 range 選擇（頁面重載恢復預設值即可）
- 不改變後端 API 介面

## Decisions

### 1. 資料抓取策略：固定抓 1Y，前端 slice

**決定：** 日期變更時一律抓 1Y，range 選擇器僅決定前端要顯示多少筆。

**理由：** 1Y ≈ 250 筆交易日資料，JSON 輕量無負擔。前端 slice 瞬間完成，UX 遠優於等待 API。且兩張圖切換 range 的頻率遠高於換日期的頻率，此策略大幅減少網路請求。

**替代方案（捨棄）：** 保留 range 觸發 fetch — 優化空間有限且增加複雜度。

---

### 2. KlineChart 的 endDate 來源：注入 DashboardStateService

**決定：** `KlineChartComponent` 繼續直接注入 `DashboardStateService` 讀取 `selectedDate` 作為 endDate。

**理由：** KlineChart 本身負責 fetch 資料，沒有 data input，必須從 service 取得日期基準點。

---

### 3. ChartTabGroup 的 endDate 來源：從 `data.at(-1).date` 推導

**決定：** `ChartTabGroupComponent` 不注入任何 service，從傳入的 `data[]` 最後一筆推導 endDate。

**理由：** `data` 陣列就是 Dashboard 以 endDate 為終點抓回的資料，最後一筆日期永遠等於 endDate，不存在資訊不一致的風險。此做法讓元件完全 self-contained，無隱性 service 耦合。

---

### 4. DashboardStateService 瘦身

**決定：** 移除 `selectedRange`、`startDate`、`setRange()`，只保留 `selectedDate`、`endDate`（= selectedDate 的 alias computed）、`setDate()`。

**理由：** range 已下放到各元件本地，全局 service 不應再持有這個狀態。

---

### 5. Toolbar range 按鈕移除

**決定：** 完全移除 Toolbar 中的 `[1M][3M][6M][1Y]` 按鈕及相關 `onRangeChange()` 邏輯。

**理由：** 職責轉移到各圖卡片，Toolbar 只保留日期導航。

## Risks / Trade-offs

- **1Y 資料 cold start 略慢** → 首次載入比原本 3M 多抓約 3 倍資料，但量仍然輕量（250 筆），可接受
- **兩圖 range 不同步** → 這是刻意設計（獨立控制），但需確保 UI 視覺上清楚標示各自的 range 歸屬
- **LocalRange 不持久化** → 每次重載恢復預設 3M，對使用者來說是輕微不便，但符合「不過度工程化」原則

## Migration Plan

1. 縮減 `DashboardStateService`
2. 更新 `DashboardComponent` 資料抓取邏輯（以 `selectedDate` 觸發，固定 1Y 範圍）
3. 更新 `KlineChartComponent`：加入 `localRange` signal + `filteredData` computed + range 選擇器 UI
4. 更新 `ChartTabGroupComponent`：加入 `localRange` signal + `filteredData` computed + range 選擇器 UI
5. 更新 `ToolbarComponent`：移除 range 按鈕

無部署風險，全為前端變更，無後端 API 異動，隨時可回滾。
