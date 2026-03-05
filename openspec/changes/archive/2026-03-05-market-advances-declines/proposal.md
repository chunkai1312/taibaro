## Why

`MarketStatsService` 目前缺乏集中市場上漲與下跌家數（市場廣度）數據，而這是評估市場多空氣氛的重要指標。`node-twstock` 套件已提供 `market.breadth` API，可直接取得此資料，應納入定期更新流程。

## What Changes

- 在 `MarketStats` schema 新增上漲、漲停、下跌、跌停、平盤家數欄位
- 在 `MarketStatsService` 新增 `updateMarketBreadth` 方法，透過 `twstock.market.breadth` 定時抓取集中市場廣度資料並存入資料庫
- 將新方法加入 `updateMarketStats` 批次更新流程

## Capabilities

### New Capabilities

- `market-breadth-stats`: 新增集中市場廣度統計（上漲/漲停/下跌/跌停/平盤家數）的定時抓取與儲存能力

### Modified Capabilities

- `barometer-analysis`: 晴雨表分析可選用上漲下跌家數作為輔助訊號（需求層面擴充，但非本次必要範圍）

## Impact

- **Schema**：`MarketStats`（`market-stats.schema.ts`）新增 5 個數值欄位
- **Service**：`MarketStatsService`（`market-stats.service.ts`）新增 1 個方法與 1 個 Cron job
- **Dependencies**：`node-twstock`（已安裝，無新增依賴）
