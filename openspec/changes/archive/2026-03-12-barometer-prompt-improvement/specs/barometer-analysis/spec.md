## MODIFIED Requirements

### Requirement: 取得當日台股晴雨表分析
系統 SHALL 提供 `GET /marketdata/barometer` endpoint，接受 `date`（`YYYY-MM-DD` 格式）查詢參數（選填，預設為當天），回傳該日的晴雨等級、天氣圖示、中文標籤，以及 LLM 生成的 200-350 字繁體中文盤勢摘要。

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

### Requirement: LLM 分析輸出格式
LLM 生成的盤勢摘要 SHALL 以繁體中文撰寫，字數介於 200 至 350 字，依當日訊號複雜程度彈性調整：訊號高度一致時可精簡至 200 字，訊號複雜或矛盾時應充分說明至多 350 字。內容 MUST 包含：今日最顯著的多空訊號、與前日相比的趨勢變化、整體籌碼氛圍的描述。摘要 MUST NOT 做出絕對的漲跌預測。

#### Scenario: 摘要內容包含趨勢對比
- **WHEN** LLM 生成摘要
- **THEN** 摘要文字 SHALL 提及至少一項指標與前日相比的變化方向（如「較昨日擴大」、「由賣轉買」）

#### Scenario: 摘要不做絕對預測
- **WHEN** LLM 生成摘要
- **THEN** 摘要文字 MUST NOT 包含「明天將上漲」、「必定下跌」等確定性預測語句，只描述籌碼與技術面現象

#### Scenario: 期貨部位方向語意明確
- **WHEN** LLM 接收期貨淨未平倉日變化數據
- **THEN** 輸入資料 SHALL 包含根據底倉方向計算的語意標籤（如「多單增加 N 口」、「空單增加 N 口」），不依賴模型自行推斷正負號方向
