## Context

目前 `DashboardStateService` 以 `RANGE_MONTHS` 字典將 `TimeRange` 轉換成月數，再由 `computed` 信號推算 `startDate`。Toolbar 的 `ranges` 陣列驅動按鈕渲染。整體架構已清晰且具延展性，新增 1Y 只需循既有模式擴充。

## Goals / Non-Goals

**Goals:**
- 新增 `'1Y'` 至 `TimeRange` union type，映射為 12 個月
- Toolbar 顯示第四個時間範圍按鈕 `[1Y]`
- 更新 `web-dashboard` spec 中「時間範圍切換」的規格

**Non-Goals:**
- YTD（本年至今）計算邏輯，需另外考慮期初日期對齊問題
- 超過 1Y 的時間範圍（如 2Y、5Y）
- 後端 API 的日期範圍限制調整

## Decisions

**用月數（12 months）而非日曆年計算 1Y**
- 和現有 1M / 3M / 6M 保持完全一致的計算方式（`DateTime.minus({ months })`）
- 邊界日期（如 2/29 閏年）行為與現有邏輯相同，無需特殊處理
- 替代方案：`minus({ years: 1 })` 語義更精確，但對使用者體驗無差異

## Risks / Trade-offs

- **[微小日期差異]** `minus({ months: 12 })` 在閏年 2/29 → 前一年 2/28，與 `minus({ years: 1 })` 結果相同，無實際風險
- **[資料量增加]** 1Y 範圍的 API 回應資料較 6M 大一倍，前端圖表效能在合理範圍內，現有資料量不構成問題
