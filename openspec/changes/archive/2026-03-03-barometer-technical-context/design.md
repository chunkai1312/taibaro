## Context

`barometer.service.ts` 目前已從 `marketStatsRepository.getMarketStats` 查詢近 7 天資料以取得「前日」數據。`buildUserMessage` 接受 `today` 和 `prev` 兩筆資料，傳入 LLM。

技術面輔助指標（5MA、20MA、量能比）不需資料庫 schema 變更，只需擴大查詢窗口並在 service 層即時計算後傳入 `buildUserMessage`。

## Goals / Non-Goals

**Goals:**
- 計算並提供 5 日均線、20 日均線（`taiexPrice` 均值）
- 計算 5 日均量、今日量能與 5 日均量之比值
- 新增 `TechContext` 介面，更新 `buildUserMessage` 簽章
- 在 SYSTEM_PROMPT 新增技術面指標說明與判斷準則
- 更新 summary 範例以涵蓋技術面交叉確認

**Non-Goals:**
- 計算 RSI、MACD、KD 等複雜振盪指標
- 修改資料庫 schema 或儲存技術指標
- 分析個股或產業技術面

## Decisions

### 決策一：在 service 層即時計算，不存入 DB

**選擇**：`barometer.service.ts` 在組裝 prompt 前從歷史資料計算技術指標，計算結果只用於本次 LLM 呼叫。

**原因**：技術指標是衍生數據，無需持久化；避免 schema 改動維護成本。若未來需要快取，加入 schema 欄位是後續工作。

**替代方案**：存入 DB → 成本較高，目前階段不必要。

---

### 決策二：查詢窗口擴大至 30 個自然日

**選擇**：將 `prevDateStr` 從 `minus({ days: 7 })` 改為 `minus({ days: 30 })`，確保有足夠交易日計算 20MA。

**原因**：台股每月約 20 個交易日，30 自然日通常可取得 20+ 筆資料。若不足 5 筆則 5MA 返回 `null`，不足 20 筆則 20MA 返回 `null`。

**風險**：查詢量稍微增加，但 MongoDB 查詢量仍很小（≤30 筆），可忽略。

---

### 決策三：TechContext 介面定義

```ts
interface TechContext {
  taiex5MA: number | null;     // 5 日均線
  taiex20MA: number | null;    // 20 日均線
  tradeValue5MA: number | null; // 5 日均量（億）
  volumeRatio: number | null;  // 今日量 / 5 日均量
}
```

`null` 表示歷史資料不足，`buildUserMessage` 遇到 `null` 顯示「無資料」。

---

### 決策四：buildUserMessage 新增第三參數

```ts
buildUserMessage(today, prev, tech: TechContext | null)
```

`tech` 為 `null` 時略過技術面區塊（向下兼容）。

---

### 決策五：均線判斷以相對位置為主

prompt 中告知 AI：
- `taiexPrice > taiex20MA` → 位於 20MA 之上，中期趨勢偏多
- `taiexPrice < taiex20MA` → 位於 20MA 之下，中期趨勢偏空
- `volumeRatio > 1.2` → 今日放量（量能擴張），**配合上漲**則趨勢確認
- `volumeRatio < 0.8` → 今日縮量，方向訊號弱

## Risks / Trade-offs

- [歷史資料不足] 新環境初始化或長假後可能資料不足 20 筆 → 以 `null` 處理，提示 AI「無資料」，不影響籌碼面分析
- [MA 使用算術平均] 非 EMA，與 TradingView 標準 MA 略有差異，但對於趨勢判斷已足夠
- [token 使用量輕微增加] 新增約 3~4 行技術面數據，影響極小

## Migration Plan

1. 部署後新的 LLM 呼叫即使用新 prompt，舊的快取（`aiAnalysis`）不受影響
2. 無需重新生成歷史分析
3. 若結果異常，rollback 只需還原 `barometer.service.ts` 和 `barometer.prompt.ts` 兩個檔案

## Open Questions

- 無
