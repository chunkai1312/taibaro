## ADDED Requirements

### Requirement: 取得當日台股晴雨表分析
系統 SHALL 提供 `GET /marketdata/barometer` endpoint，接受 `date`（`YYYY-MM-DD` 格式）查詢參數（選填，預設為當天），回傳該日的晴雨等級、天氣圖示、中文標籤，以及 LLM 生成的 150-200 字繁體中文盤勢摘要。

#### Scenario: 請求有快取的日期
- **WHEN** 用戶請求某日期且該日 `MarketStats.aiAnalysis` 已有快取資料
- **THEN** 系統 SHALL 直接回傳快取結果，不呼叫 LLM

#### Scenario: 請求無快取的日期（資料存在）
- **WHEN** 用戶請求某日期且 `MarketStats` 有該日數據但 `aiAnalysis` 欄位為空
- **THEN** 系統 SHALL 取得該日與前一交易日的 `MarketStats` 數據，呼叫 LLM 進行分析，將結果寫回 `MarketStats.aiAnalysis`，並回傳分析結果

#### Scenario: 請求無市場數據的日期
- **WHEN** 用戶請求某日期且 `MarketStats` 不存在該日任何記錄（假日或未收集）
- **THEN** 系統 SHALL 回傳 HTTP 404

#### Scenario: LLM 服務不可用
- **WHEN** 呼叫 OpenAI API 發生錯誤或 timeout
- **THEN** 系統 SHALL 回傳 HTTP 503，不寫入快取

---

### Requirement: 晴雨等級五層定義
系統 SHALL 使用固定的五層晴雨等級體系，每層對應天氣圖示與中文標籤。

#### Scenario: 回傳正確的等級對應
- **WHEN** LLM 輸出任一有效等級代碼
- **THEN** 系統 SHALL 回傳對應的天氣圖示與中文標籤，且 MUST 符合下表：
  - `STRONG_BULL` → ☀️ → 強多
  - `BULL` → 🌤 → 偏多
  - `NEUTRAL` → ⛅ → 中性
  - `BEAR` → 🌧 → 偏空
  - `STRONG_BEAR` → ⛈ → 強空

---

### Requirement: LLM 分析輸出格式
LLM 生成的盤勢摘要 SHALL 以繁體中文撰寫，字數介於 150 至 200 字，內容 MUST 包含：今日最顯著的多空訊號、與前日相比的趨勢變化，以及整體籌碼氛圍的描述。摘要 MUST NOT 做出絕對的漲跌預測。

#### Scenario: 摘要內容包含趨勢對比
- **WHEN** LLM 生成摘要
- **THEN** 摘要文字 SHALL 提及至少一項指標與前日相比的變化方向（如「較昨日擴大」、「由賣轉買」）

#### Scenario: 摘要不做絕對預測
- **WHEN** LLM 生成摘要
- **THEN** 摘要文字 MUST NOT 包含「明天將上漲」、「必定下跌」等確定性預測語句，只描述籌碼現象

---

### Requirement: LLM 結果快取
系統 SHALL 在 LLM 首次成功分析後，將結果持久化儲存於對應日期的 `MarketStats.aiAnalysis` 欄位，確保相同日期的後續請求不重複呼叫 LLM。

#### Scenario: 快取寫入成功
- **WHEN** LLM 成功回傳結構化結果
- **THEN** 系統 SHALL 將完整結果寫入 `MarketStats.aiAnalysis`，後續同日期請求 MUST 直接讀取此快取

#### Scenario: LLM 失敗不寫入快取
- **WHEN** LLM 呼叫失敗或回傳格式無效
- **THEN** 系統 MUST NOT 寫入任何快取，以便下次可以重試
