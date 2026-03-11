## Why

`Ticker` schema 將三大法人籌碼直接攤平在頂層，與「有報價的單元」這個核心定義不一致，且未來擴充籌碼資料（如融資融券）時會導致頂層欄位持續膨脹。現在趁資料量尚小是重構的好時機。

## What Changes

- 將 `finiNetBuySell`、`sitcNetBuySell`、`dealersNetBuySell` 三個頂層欄位遷移至 `instInvestors` sub-document
- `instInvestors` 採三機構各自展開的巢狀結構：`fini`、`sitc`、`dealers` 各含 `buy`、`sell`、`net` 三個欄位
- `instInvestors` 標記為 optional，明確語意：只有 Equity Ticker 才有此資料
- 更新 `TickerService` 中寫入三大法人資料的兩個方法，同時儲存買超量（`buy`）、賣超量（`sell`）與淨買賣超（`net`）
- 更新 `TickerRepository` 中 `getInstInvestorsTrades` 的 match 與 sort 條件，改用 `instInvestors.${inst}.net` dotted path
- **BREAKING**: MongoDB 中已存在的 ticker documents 需要 migration，將舊的三個頂層欄位搬移至新的 `instInvestors` 巢狀結構

## Capabilities

### New Capabilities

- `ticker-schema`: Ticker MongoDB schema 的定義與所有欄位語意

### Modified Capabilities

<!-- 現有 specs 皆不涵蓋 Ticker schema 層級的定義，無需列入 -->

## Impact

- `apps/api/src/app/marketdata/schemas/ticker.schema.ts`：主要改動
- `apps/api/src/app/marketdata/services/ticker.service.ts`：三大法人寫入邏輯
- `apps/api/src/app/marketdata/repositories/ticker.repository.ts`：`getInstInvestorsTrades` 查詢條件
- MongoDB collection `tickers`：需要 one-time migration script
