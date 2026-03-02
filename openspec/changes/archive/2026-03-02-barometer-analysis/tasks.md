## 1. 安裝依賴與環境設定

- [x] 1.1 安裝 `@langchain/openai` 與 `@langchain/core` 套件
- [x] 1.2 在 `.env.example` 新增 `OPENAI_API_KEY=` 環境變數說明

## 2. 更新 MarketStats Schema

- [x] 2.1 在 `market-stats.schema.ts` 新增 `aiAnalysis` 欄位（`@Prop({ type: Object })`），儲存 LLM 輸出的晴雨表結果
- [x] 2.2 在 `MarketStatsRepository` 確認 `updateMarketStats` 可正常寫入 `aiAnalysis`（因 Mongoose 為 schema-less object，應直接可用，驗證即可）

## 3. 建立獨立 barometer module

- [x] 3.1 在 `apps/api/src/app/barometer/` 建立 `barometer.module.ts`，imports `MarketDataModule`
- [x] 3.2 在 `AppModule` 的 `imports` 陣列中加入 `BarometerModule`

## 4. 定義 Barometer DTO 與型別

- [x] 4.1 建立 `dto/get-barometer.dto.ts`，定義 `date?` 查詢參數（`YYYY-MM-DD` 格式）
- [x] 4.2 建立 `types/barometer.types.ts`，定義晴雨等級 enum（`BarometerLevel`：`STRONG_BULL | BULL | NEUTRAL | BEAR | STRONG_BEAR`）及對應的天氣圖示與中文標籤 map
- [x] 4.3 定義 `BarometerResult` interface（`{ date, level, weather, label, summary }`）

## 5. 實作 LangChain 分析邏輯

- [x] 5.1 建立 `barometer/barometer.prompt.ts`，撰寫 system prompt，說明台股各籌碼指標意涵、判斷準則，以及要求 LLM 輸出 JSON 格式（含 `level` 與 `summary`）；同時包含 `buildUserMessage()` 函式
- [x] 5.2 在 prompt 中加入 few-shot 範例，確保 temperature=0 下輸出格式穩定
- [x] 5.3 建立 `barometer/barometer.schema.ts`，以 Zod 定義 LLM 輸出的 structured schema（`BarometerOutputSchema`），用於 LangChain `withStructuredOutput()`

## 6. 實作 BarometerService

- [x] 6.1 實作核心方法 `generateAnalysis(date: string)`：
  - 取得該日 `MarketStats` 數據，若不存在則拋出 `NotFoundException`
  - 檢查 `aiAnalysis` 快取，有則直接回傳
  - 取得前一交易日數據作為趨勢對比（使用 `getMarketStats` 並取最近兩日）
  - 組裝 LLM input（當日 + 前日數據）
  - 呼叫 LangChain + OpenAI，使用 `gpt-4o-mini`，temperature=0
  - 驗證 LLM 輸出符合 Zod schema
  - 寫入 `aiAnalysis` 快取
  - 回傳 `BarometerResult`
- [x] 6.2 處理 LLM 錯誤：catch 所有例外，記錄 log，拋出 `ServiceUnavailableException`（HTTP 503）
- [x] 6.3 新增 Cron job `@Cron('0 0 17 * * *')`，自動以當日 date 呼叫 `generateAnalysis()`，並在 log 記錄執行結果

## 7. 實作 BarometerController

- [x] 7.1 建立 `barometer.controller.ts`，路由前綴 `marketdata`
- [x] 7.2 實作 `GET /marketdata/barometer`，接受 `GetBarometerDto`，呼叫 `BarometerService.getBarometer()`
- [x] 7.3 加上 `@ApiTags('marketdata')` 與 `@ApiOperation({ summary: '取得每日台股晴雨表分析' })` Swagger 裝飾器

## 8. 驗證與手動測試

- [x] 8.1 啟動 API，確認 `GET /marketdata/barometer` 出現在 Swagger UI
- [x] 8.2 請求一個有資料的歷史日期，確認首次呼叫 LLM 且結果正確寫入 DB
- [x] 8.3 再次請求同一日期，確認回傳快取，不再呼叫 LLM（查看 log）
- [x] 8.4 請求無資料的日期（假日），確認回傳 404
