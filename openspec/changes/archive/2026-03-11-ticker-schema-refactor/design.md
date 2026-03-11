## Context

`Ticker` 是 taibaro 的核心資料模型，用於儲存個股與指數的每日行情（OHLC、量能）以及三大法人籌碼。現行 schema 將籌碼的三個欄位（`finiNetBuySell`、`sitcNetBuySell`、`dealersNetBuySell`）直接攤平在頂層，與其他量能欄位並列，導致語意不清且擴充性差。

資料寫入採 upsert 模式，同一份 document 由多個定時任務在一天內分批更新：先寫行情，晚間再補籌碼。

## Goals / Non-Goals

**Goals:**
- 將三大法人籌碼欄位遷移至 `instInvestors` sub-document
- 保持 `updateTicker` upsert 介面不變
- 更新相關讀取查詢的欄位路徑

**Non-Goals:**
- 改變 Ticker 與 MarketStats 的分工關係
- 新增融資融券或其他籌碼資料（留待後續 change）
- 變更 API 對外回傳格式（前端若有依賴頂層欄位需另行評估）

## Decisions

### 決策 1：使用 sub-document 而非拆分 collection

**選擇**：保持單一 `tickers` collection，以 `instInvestors` sub-document 組織籌碼欄位。

**理由**：所有查詢場景均同時需要行情與籌碼，拆分 collection 只會引入 `$lookup` 複雜度而無對應收益。sub-document 同時提供語意分組與未來擴充的擴展點（如 `margin: { ... }`）。

**放棄的替代方案**：Mongoose discriminator pattern（Index vs Equity 不同 schema）—複雜度過高，且兩者 OHLC 欄位完全相同，discriminator 帶來的型別收益有限。

### 決策 2：instInvestors 採三機構各自展開的巢狀結構

**選擇**：`instInvestors: { fini: { buy, sell, net }, sitc: { buy, sell, net }, dealers: { buy, sell, net } }`

**理由**：每個機構是一個獨立的概念單元，巢狀結構讓 `fini.buy` 與 `fini.net` 的關係一目了然。相較於扁平的 `finiBuy / finiSell / finiNetBuySell`，未來新增機構時只需增加新的 key，不會造成頂層持續膨脹。

**放棄的替代方案**：扁平欄位（`finiTotalBuy`, `finiTotalSell`, `finiNetBuySell`）—改動較小，但命名混搭不一致，擴充性差。

### 決策 3：repository 介面不變，由 service 傳入巢狀物件

**選擇**：`updateTicker(ticker: Partial<Ticker>)` 介面維持原樣，service 在組裝資料時傳入完整的 `instInvestors` 巢狀結構。

**理由**：三大法人的寫入每次都同時包含全部資料（all-or-nothing），Mongoose upsert 傳入 plain object 時的 `$set` 行為不會造成部分覆蓋問題，方案最簡單。

### 決策 3：需要 migration script

**選擇**：提供一次性 MongoDB 腳本，將既有 documents 的頂層籌碼欄位搬移至 `instInvestors` 並移除舊欄位。

**理由**：不做 migration 的話，舊 documents 和新 documents 會同時存在兩種格式，`getInstInvestorsTrades` 改用 dotted path 後舊資料將查不到。

## Risks / Trade-offs

- **[風險] 前端依賴頂層欄位**：若 web 端直接使用 `ticker.finiNetBuySell`，migration 後會 undefined。→ 需確認 web 端的 marketdata 消費點（目前看起來 barometer 主要吃 MarketStats，風險低）。
- **[風險] Migration 期間服務中斷**：Migration script 執行時若定時任務同時寫入，可能出現新舊格式並存。→ 建議 migration 於非交易時段執行，或確保 migration 為原子操作。

## Migration Plan

1. 部署新版 service + repository（能同時寫入新格式；舊資料查詢會有短暫異常）
2. 於非交易時段執行 migration script：
   ```js
   db.tickers.find({
     finiNetBuySell: { $exists: true }
   }).forEach(doc => {
     db.tickers.updateOne(
       { _id: doc._id },
       {
         $set: { instInvestors: {
           finiNetBuySell: doc.finiNetBuySell,
           sitcNetBuySell: doc.sitcNetBuySell,
           dealersNetBuySell: doc.dealersNetBuySell,
         }},
         $unset: { finiNetBuySell: '', sitcNetBuySell: '', dealersNetBuySell: '' }
       }
     );
   });
   ```
3. 驗證查詢結果正確後完成部署

**Rollback**：若需回滾，執行反向 migration 將 `instInvestors` 欄位重新展開至頂層，再部署舊版程式碼。

## Open Questions

- 前端 `apps/web` 是否有直接消費 `finiNetBuySell` 等頂層欄位？需確認後決定是否需同步調整 API response 或前端程式碼。
