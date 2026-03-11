## 1. Schema 更新

- [x] 1.1 更新 `ticker.schema.ts` 的 `InstInvestors` class：改為三機構各自展開結構，加入 `FiniInstitutional`、`SitcInstitutional`、`DealersInstitutional` sub-class（各含 `buy`、`sell`、`net`），並更新 `InstInvestors` class 的欄位定義
- [x] 1.2 在 `Ticker` class 中移除三個頂層籌碼欄位，改加 `instInvestors?: InstInvestors` optional 欄位（已完成）

## 2. Service 更新

- [x] 2.1 更新 `updateTwseEquitiesInstInvestorsTrades`：改以 `instInvestors: { fini: { buy, sell, net }, sitc: { buy, sell, net }, dealers: { buy, sell, net } }` 結構寫入，`buy`/`sell` 分別取 `totalBuy`/`totalSell` 加總
- [x] 2.2 更新 `updateTpexEquitiesInstInvestorsTrades`：同上

## 3. Repository 更新

- [x] 3.1 更新 `getInstInvestorsTrades` 的 `$match` 條件：改為 `instInvestors.${inst}.net`
- [x] 3.2 更新 `getInstInvestorsTrades` 的 `$sort` 條件：同上

## 4. Migration

- [x] 4.1 確認 `apps/web` 中是否有直接消費頂層籌碼欄位，若有則同步調整（已確認無需調整）
- [x] 4.2 更新 migration script：目標結構從扁平 `{ finiNetBuySell }` 改為巢狀 `{ instInvestors: { fini: { net }, sitc: { net }, dealers: { net } } }`（舊資料只有 net，buy/sell 待下次更新補齊）
- [x] 4.3 驗證 `getInstInvestorsTrades` 查詢結果正確
