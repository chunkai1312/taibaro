## Context

`MarketStatsService` 負責定時從 `node-twstock` 抓取台股市場籌碼數據並存入 MongoDB。目前已有十一個更新方法，各自對應不同的市場指標。`node-twstock` 的 `market.breadth` API 可回傳集中市場每日上漲、漲停、下跌、跌停、平盤家數，是衡量市場廣度的標準指標，目前尚未納入系統。

## Goals / Non-Goals

**Goals:**
- 在 `MarketStats` Schema 新增 5 個市場廣度欄位（`advanceCount`、`limitUpCount`、`declineCount`、`limitDownCount`、`unchangedCount`）
- 在 `MarketStatsService` 新增 `updateMarketBreadth` 方法，搭配 Cron job 定時更新
- 將 `updateMarketBreadth` 納入 `updateMarketStats` 批次流程

**Non-Goals:**
- 不修改 API 端點或 DTO 結構（資料庫欄位新增後，既有查詢 API 自然會帶回）
- 不將上漲下跌家數整合進晴雨表 AI 分析提示詞（留待後續 change）
- 不抓取 TPEx（櫃買市場）廣度資料

## Decisions

**1. 欄位命名採英文語意命名**

選用 `advanceCount`、`limitUpCount`、`declineCount`、`limitDownCount`、`unchangedCount`，與既有欄位命名風格（camelCase 英文語意）一致，而非使用簡寫（`up`、`down`）。

**2. Cron 排程對齊現有 `updateMarketTrades`**

`market.breadth` 資料與成交資訊同時於盤後公布，排程設定為 `0 15 15-18 * * *`（同 `updateMarketTrades`），避免新增額外的時間點造成管理複雜度。

**3. 僅抓 TWSE（集中市場）**

現有方法中，市場層級指標（`trades`、`institutional`、`marginTrades`）均只抓 TWSE，本次保持一致性，不擴展至 TPEx。

## Risks / Trade-offs

- **資料空缺風險**：若 `market.breadth` API 回傳 `null`（非交易日或資料延遲），`updateMarketBreadth` 會記錄 warn 日誌並不更新；既有批次流程每步驟間有 5 秒延遲，已足夠緩衝 rate limit 問題。
- **Schema 欄位為非必填**：MongoDB document-oriented 特性允許新欄位為可選，不影響既有資料，無需遷移腳本。
