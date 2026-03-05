## Why

英雄區塊目前只顯示加權指數點位與成交金額，缺乏「市場廣度」資訊——無法一眼判斷今天是普漲、普跌還是漲跌分歧。後端已於 `MarketStats` 新增上漲/漲停/下跌/跌停/平盤家數欄位，現在可以在英雄區塊直接視覺化呈現。

## What Changes

- 新增 `BreadthBarComponent` 獨立 Angular standalone 元件，以三色比例條（紅/灰/綠）顯示上漲、平盤、下跌家數的佔比
- 在 `BarometerHeroComponent` 的 `hero-left` 區域，成交金額 `stat-block` 下方加入 `BreadthBarComponent`
- 前端 `MarketStats` model 補齊 `advanceCount`、`limitUpCount`、`declineCount`、`limitDownCount`、`unchangedCount` 五個欄位

## Capabilities

### New Capabilities

- `hero-breadth-bar`: 英雄區塊市場廣度比例條元件——三色 bar 顯示上漲/平盤/下跌佔比，並附上百分比與絕對家數標籤

### Modified Capabilities

- `web-dashboard`: 英雄區塊新增市場廣度區域，今日快照呈現方式擴充

## Impact

- **新增**：`apps/web/src/app/features/dashboard/components/barometer-hero/breadth-bar/breadth-bar.component.{ts,html,scss}`
- **修改**：`barometer-hero.component.html`（加入 `<app-breadth-bar>`）
- **修改**：`core/models/market-stats.model.ts`（補齊廣度欄位）
- **無新增外部依賴**
