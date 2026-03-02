## Why

目前系統已完成後端 API（每日台股晴雨表分析 + 大盤籌碼數據），但前端 (`apps/web`) 尚無任何畫面，用戶無法直觀地看到分析結果。需要建立一個以「天氣隱喻」為核心的儀表板介面，讓用戶每日一眼掌握台股籌碼氛圍，並透過近 3 個月趨勢圖進行縱深分析。

## What Changes

- 使用 Angular Material + ngx-echarts 實作前端儀表板
- 新增 `DashboardComponent`，包含三個主要區塊：
  - **晴雨表 Hero Card**：大型天氣圖示、等級標籤、五格 Gauge、AI 盤勢摘要
  - **今日籌碼速覽**：8 格 Stat Cards，顯示當日關鍵指標數字與漲跌箭頭
  - **趨勢圖表**：近 1/3/6 個月四大指標群（三大法人、期貨、融資券、情緒）雙 Y 軸圖表
- Toolbar 整合日期導航（前後切換 + DatePicker）及時間範圍切換 `[1M][3M][6M]`
- 建立 `core/services/` 層串接兩個 API endpoint
- 晴雨等級對應色彩系統（強多=金黃 / 偏多=綠 / 中性=灰 / 偏空=藍 / 強空=靛）

## Capabilities

### New Capabilities

- `web-dashboard`: 台股晴雨表儀表板介面，展示每日晴雨分析、今日籌碼快照，及近 3 個月籌碼指標趨勢圖

### Modified Capabilities

_(無。後端 API 行為不變，僅新增前端消費層。)_

## Impact

- **新增依賴**：`@angular/material`、`ngx-echarts`、`echarts`
- **新增 feature**：`apps/web/src/app/features/dashboard/`
- **新增 core**：`apps/web/src/app/core/services/`、`apps/web/src/app/core/models/`
- **新增 layout**：`apps/web/src/app/layout/`（Toolbar）
- **路由**：`/` → DashboardComponent
- **API 依賴**：`GET /marketdata/barometer`、`GET /marketdata/market-stats`
