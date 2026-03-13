## Why

目前時間區間選擇器（1M/3M/6M/1Y）放在全域 Toolbar，K 線圖與趨勢圖被迫共享同一個 range，且每次切換都觸發 API 重抓。將 range 下放到各圖卡片，讓兩圖可獨立設定，並改以前端 slice 實現切換，只有日期改變時才重抓資料。

## What Changes

- **移除** Toolbar 的時間區間按鈕（1M/3M/6M/1Y）
- **移除** `DashboardStateService` 的 `selectedRange` signal 與 `startDate` computed
- **新增** K 線圖卡片標題列的 range 選擇器（預設 3M）
- **新增** 籌碼趨勢卡片標題列的 range 選擇器（預設 3M）
- **改變** API 呼叫策略：日期變更時一律抓近 1Y 資料，range 切換改為純前端 slice
- `DashboardStateService` 簡化為只保留 `selectedDate`（endDate = selectedDate）

## Capabilities

### New Capabilities

- `per-card-time-range`: 各圖卡片內建時間區間選擇器，range 切換為前端即時 slice，endDate 跟隨全域日期選擇

### Modified Capabilities

- `web-dashboard`: Toolbar 移除 range 控制項；K 線圖與趨勢圖卡片各自增加 range 選擇器
- `dashboard-kline-chart`: KlineChart 改為抓 1Y 資料並本地 slice；新增卡片內 range 選擇器

## Impact

- `apps/web/src/app/core/services/dashboard-state.service.ts` — 移除 `selectedRange`、`startDate`
- `apps/web/src/app/layout/toolbar/` — 移除 range 按鈕 UI 與相關邏輯
- `apps/web/src/app/features/dashboard/components/kline-chart/` — 改抓 1Y、新增 localRange signal 與 filteredData computed、新增 range 選擇器 UI
- `apps/web/src/app/features/dashboard/components/trend-chart/chart-tab-group/` — 新增 localRange signal 與 filteredData computed（從 `data.at(-1).date` 推導 endDate）、新增 range 選擇器 UI
- `apps/web/src/app/features/dashboard/dashboard.component.ts` — 改用 `selectedDate` 觸發抓取固定 1Y 資料
