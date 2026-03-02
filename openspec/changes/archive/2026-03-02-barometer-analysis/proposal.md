## Why

目前系統每日自動收集台股大盤籌碼數據（外資買賣超、期貨未平倉、散戶多空比等共 11 項指標），但只有原始數字，沒有任何解讀。使用者必須自己判斷每個指標的意涵與相互關係，無法快速掌握當日整體籌碼氛圍。

## What Changes

- 新增 `GET /marketdata/barometer` API endpoint，接受 `date` 查詢參數
- 以 LangChain + OpenAI 為核心，將當日與前日的 `MarketStats` 數據傳入 LLM，由 LLM 判斷晴雨等級並生成盤勢分析文字
- 晴雨等級分五層：強多（☀️）/ 偏多（🌤）/ 中性（⛅）/ 偏空（🌧）/ 強空（⛈）
- LLM 生成結果快取至 `MarketStats` 的新欄位 `aiAnalysis`，同一天只呼叫 LLM 一次
- 新增獨立的 `barometer` module，不修改現有 `marketdata` module 的任何邏輯

## Capabilities

### New Capabilities

- `barometer-analysis`: 每日台股晴雨表 API，透過 LLM 分析當日籌碼變化，輸出五層晴雨等級（含天氣圖示與中文標籤）及 150-200 字的盤勢摘要，結果快取於 DB 避免重複呼叫

### Modified Capabilities

_(無。現有 marketdata spec 的需求未改變，僅新增 aiAnalysis 快取欄位至 MarketStats schema。)_

## Impact

- **新增 module**：`apps/api/src/app/barometer/`（BarometerModule、BarometerService、BarometerController）
- **MarketStats schema**：新增 `aiAnalysis` 欄位（`object`，儲存 LLM 輸出）
- **新增依賴**：`@langchain/openai`、`@langchain/core`（或 `langchain`）
- **環境變數**：新增 `OPENAI_API_KEY`
- **API**：新增 `GET /marketdata/barometer?date=YYYY-MM-DD`
