### Requirement: OHLC 查詢端點
系統 SHALL 提供 `GET /marketdata/tickers` 端點，依 symbol 與日期區間回傳收盤行情資料。

#### Scenario: 成功查詢指定 symbol 的 OHLC 資料
- **WHEN** 呼叫 `GET /marketdata/tickers?symbol=IX0001&startDate=2025-09-01&endDate=2026-03-12`
- **THEN** 系統 SHALL 回傳 HTTP 200，body 為陣列，每筆包含 `date`、`openPrice`、`highPrice`、`lowPrice`、`closePrice`、`tradeValue`，並依 `date` 升冪排序

#### Scenario: symbol 為必填
- **WHEN** 呼叫 `GET /marketdata/tickers` 未帶 `symbol`
- **THEN** 系統 SHALL 回傳 HTTP 400

#### Scenario: 日期預設值
- **WHEN** 呼叫 `GET /marketdata/tickers?symbol=IX0001` 未帶日期參數
- **THEN** 系統 SHALL 以當日往前 3 個月為 `startDate`、當日為 `endDate` 查詢
