## Context

目前 API 已每日自動收集並儲存台股大盤籌碼數據於 `MarketStats` collection（MongoDB），涵蓋：外資/投信/自營商買賣超、融資融券餘額、外資期貨未平倉量、大額交易人期貨部位、散戶小台/微台多空比、PUT/CALL Ratio、美元兌台幣匯率等共 11 項指標。

`MarketStatsRepository.computeChanges()` 已計算大部分逐日差值（如 `finiTxfNetOiChange`），可直接用於趨勢判斷。

本 change 在不修改任何現有資料收集邏輯的前提下，新增獨立的 `barometer` module，以 LangChain + OpenAI 解讀籌碼數據，輸出每日晴雨等級與盤勢摘要。

## Goals / Non-Goals

**Goals:**
- 新增 `GET /marketdata/barometer?date=` endpoint，回傳當日晴雨等級與 LLM 生成的分析文字
- 晴雨等級分五層，對應天氣圖示與中文標籤
- LLM 負責解讀所有籌碼指標及其交互關係，不撰寫手工評分規則
- LLM 結果快取於 DB，同一天同一日期不重複呼叫
- 新增獨立的 `barometer` module（`barometer.module.ts`、`barometer.service.ts`、`barometer.controller.ts`、`barometer.schema.ts`、`barometer.prompt.ts`、`barometer.types.ts`）
- `BarometerModule` 匯入 `MarketDataModule` 以取得 `MarketStatsRepository`
- Cron job（每日 17:00）與 GET endpoint 共用同一核心邏輯

**Non-Goals:**
- 不產出數字評分（-100 ~ +100），只需等級
- 不做歷史趨勢圖、回測或策略比較
- 不支援個股籌碼分析，僅限大盤指標
- 不做前端 UI（本 change 僅 API 層）

## Decisions

### 1. 獨立 barometer module

**決策**：在 `apps/api/src/app/barometer/` 新增獨立 module，包含以下檔案：
- `barometer.module.ts`：imports `MarketDataModule`（取得 `MarketStatsRepository`）
- `barometer.service.ts`：核心邏輯（`generateAnalysis` + Cron）
- `barometer.controller.ts`：`GET /marketdata/barometer`
- `barometer.schema.ts`：Zod schema（`BarometerOutputSchema`）
- `barometer.prompt.ts`：LLM system prompt + `buildUserMessage()`
- `barometer.types.ts`：`BarometerLevel` enum、weather/label maps、`BarometerResult`

**理由**：Barometer 功能依賴 LangChain（外部 AI 依賴），與 marketdata module 的 `nest-twstock` 資料收集關注點完全不同。獨立 module 使職責邊界清晰、易於測試，且在 `barometer.service.ts` 規模與 `ticker.service.ts` 相當時，合併進 marketdata module 反而造成混亂。

**替代方案**：加入 marketdata module → 不選，AI 分析與資料收集是不同關注點，合併後職責不清。

---

### 2. Cron（17:00）與 GET endpoint 並存，共用同一核心方法

**決策**：`BarometerService` 提供 `generateAnalysis(date)` 核心方法。Cron job 每日 17:00 自動呼叫（今日日期），`MarketDataController` 的 GET endpoint 也呼叫同一方法（支援任意 `date` 參數）。

**理由**：Cron 確保每日盤後自動產出，無需任何人觸發；GET endpoint 提供歷史補算能力（傳入過去日期）以及 on-demand 觸發（上線前測試、盤後立即查看）。快取機制確保兩個入口不會重複呼叫 LLM：Cron 跑完後前端呼叫 API 命中快取；反之若 API 先觸發，Cron 跑到時同樣命中快取。

---

### 2. LLM-first，不撰寫手工評分規則

**決策**：將原始數據（含前日對比）直接交給 LLM 判斷，由 LLM 理解指標間的交互關係並輸出晴雨等級與分析。

**理由**：手工規則（如「外資買超 > 300 億給 +2 分」）需要人工定義閾值，缺乏金融背景知識時容易錯誤。LLM 能理解「雖然外資買超，但散戶大量追多反而是風險訊號」這類非線性關係。

**替代方案**：Rule-based 評分引擎 → 不選，因為閾值難以定義且無法表達指標間的交互效果。

---

### 3. OpenAI via LangChain（`@langchain/openai`）

_(原決策編號 2，現為 3)_


**決策**：使用 LangChain 的 `ChatOpenAI` + `StructuredOutputParser`，強制 LLM 輸出符合 JSON schema 的結果。

**理由**：LangChain 提供 structured output 的封裝，避免手動解析 LLM 回傳的 JSON 字串；未來若要換模型（如 Anthropic）只需換 provider。

**模型選擇**：`gpt-4o-mini`，速度快、成本低（約 $0.001 / 次），對台股籌碼這類結構化文字理解足夠。

---

### 4. 只輸出等級 + 摘要，不需要數字分數

_(原決策編號 3，現為 4)_


**決策**：LLM 輸出 `{ level, weather, label, summary }`，不要求 `score` 數值。

**理由**：使用情境是「每日一看」，使用者需要的是等級與文字解釋，不是一個無法解讀的數字。去掉分數後，LLM prompt 更簡單，輸出更穩定。

---

### 5. 快取策略：lazy write 到 MarketStats.aiAnalysis

_(原決策編號 4，現為 5)_


**決策**：`BarometerService` 呼叫 LLM 後，將結果寫入 `MarketStats.aiAnalysis`（新增欄位）。下次同一 `date` 的請求直接讀快取，不再呼叫 LLM。

**理由**：LLM API 呼叫有費用與延遲，同一天的籌碼數據不變，所以結果只需計算一次。

## Risks / Trade-offs

| 風險 | 緩解方式 |
|------|---------|
| LLM 輸出格式不符合預期 | 使用 LangChain StructuredOutputParser + Zod schema 驗證；驗證失敗時回傳 500 並記錄原始輸出 |
| OpenAI API 不可用（網路或限流） | 快取命中時不受影響；快取未命中時回傳 503，前端顯示「分析暫時無法使用」 |
| LLM 輸出語意不穩定（同樣數據不同結論） | temperature 設為 0；prompt 加入明確的判斷準則與輸出格式範例（few-shot） |
| MarketStats 當日資料尚未完整（Cron 未跑完）| 這是現有問題，barometer 不解決。若 LLM 判斷依據不完整，摘要文字應反映此狀況 |

## Migration Plan

1. 安裝 `@langchain/openai`、`@langchain/core` 依賴
2. 環境變數新增 `OPENAI_API_KEY`（`.env.example` 同步更新）
3. MongoDB `MarketStats` 新增 `aiAnalysis` 欄位（schema-less，Mongoose 自動處理，無需 migration script）
4. 部署新版 API 即生效；既有 endpoint 完全不受影響
5. Rollback：移除 `BarometerService`、相關 controller route 及 Cron job 即可，`aiAnalysis` 欄位留在 DB 無害

## Open Questions

_(已於 explore 階段全部釐清，目前無待解問題。)_
