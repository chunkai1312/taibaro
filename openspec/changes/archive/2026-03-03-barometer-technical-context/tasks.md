## 1. barometer.prompt.ts — 介面與 buildUserMessage 更新

- [x] 1.1 在 `barometer.prompt.ts` 定義並 export `TechContext` 介面（`taiex5MA`、`taiex20MA`、`tradeValue5MA`、`volumeRatio` 各為 `number | null`）
- [x] 1.2 在 SYSTEM_PROMPT 的主要指標說明區塊後，新增「## 技術面輔助」段落，說明 5MA、20MA 的多空語義及量能比的強弱判斷門檻（volumeRatio > 1.2 / < 0.8）
- [x] 1.3 在 SYSTEM_PROMPT 判斷準則中新增技術面交叉確認規則：指數在 20MA 以上且籌碼偏多 → 趨勢確認；指數在 20MA 以下且籌碼偏多 → 背離，評級偏保守；縮量時降低訊號說服力
- [x] 1.4 更新 `buildUserMessage` 函式簽章，新增第三參數 `tech: TechContext | null`
- [x] 1.5 在 `buildUserMessage` 回傳的訊息中，於籌碼數據區塊後附加「技術面輔助」區塊，包含各欄位數值（null 顯示 `N/A`）
- [x] 1.6 更新 SYSTEM_PROMPT 中的 summary 範例，加入技術面交叉確認的示範描述（例如「指數位於 20MA 上方，量能略有擴張，與外資買超訊號相互印證」）

## 2. barometer.service.ts — 查詢窗口擴大與技術指標計算

- [x] 2.1 將 `prevDateStr` 的計算從 `minus({ days: 7 })` 改為 `minus({ days: 30 })`
- [x] 2.2 新增 `computeTechContext(recentStats: MarketStats[], todayStats: MarketStats): TechContext` 私有方法：依 `taiexPrice` 計算 5MA 與 20MA，依 `tradeValue` 計算 5 日均量與今日量能比，資料不足時對應欄位回傳 `null`
- [x] 2.3 在呼叫 `buildUserMessage` 前，以 `recentStats`（排除 today）呼叫 `computeTechContext`，取得 `techContext`
- [x] 2.4 更新 `buildUserMessage` 呼叫，傳入 `techContext` 作為第三參數

## 3. 驗證

- [x] 3.1 手動測試 `GET /marketdata/barometer?date=<今日>` 確認回傳的 `analysis` 摘要包含技術面交叉確認描述
- [x] 3.2 確認當 `MarketStats` 歷史資料少於 5 筆時（可暫時截斷測試資料），API 仍正常回傳，`TechContext` 欄位顯示 `N/A`
