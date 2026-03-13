## Context

目前 TaiBaro 僅有大盤籌碼頁（`/`），提供整體市場的 K 線、籌碼指標與三大法人資料。後端 `Ticker` collection 每日收集所有台股上市（TSE）產業指數（`TickerType.Index`、`Market.TSE`、`IX0010–IX0042`、`IX0185–IX0188`）的 OHLC 與 `tradeWeight`（成交比重）資料，但前端尚未利用此資料提供產業層次的分析視圖。

現有基礎設施：
- `TickerRepository.getMoneyFlow()` 已實作「今日 vs 昨日」資金流向快照（含 `tradeValue`、`tradeWeight`、`tradeValueChange`、`tradeWeightChange`），僅差 RS 值計算
- `TickerRepository.getOhlcBySymbol()` 可查任意 symbol 的時間序列，但 `select` 未包含 `tradeWeight`
- `KlineChartComponent` 硬編碼 `'IX0001'`，需加入 `symbol` input 才能複用
- `getSectorName()` util 已清理產業名稱

## Goals / Non-Goals

**Goals:**
- 新增 `/sector-flow` 頁面，展示 TSE 上市產業資金流向排行表、資金流向明細圖、產業 K 線圖
- TopBar 加入填色 pill 導覽連結（大盤籌碼 / 資金流向）
- `KlineChartComponent` 加入 `symbol` input，使其可複用於任意指數
- 後端新增 `GET /marketdata/sector-flow` endpoint，回傳當日 TSE 所有產業資金流向快照（含 RS）
- `getOhlcBySymbol()` 的 select 加入 `tradeWeight`，供前端時間序列圖使用

**Non-Goals:**
- TPEx（上櫃）產業資料（第一版僅 TSE）
- 個股層次的資金流向
- 即時（Streaming）資料推送
- 行動端響應式優化（基本可用即可）

## Decisions

### 1. 後端：`getSectorFlow()` 實作

**決策：** 在 `TickerRepository` 新增獨立的 `getSectorFlow()` method，以新的 aggregation pipeline 實作（`$match` → `$project` → `$group` → `$sort` → `$limit: 2`），而非複用 `getMoneyFlow()`；回傳欄位包含 `rs` 值（`closePrice / TAIEX closePrice`，前端目前未顯示，保留供日後使用）。排除非產業複合指數（IX0007/0008/0009）及合併類複合指數（IX0013/0014/0015/0019/0027）。Pipeline 前置 `$project` 僅選取必要欄位以減少傳輸量，schema 上定義 `{ type, market, date }` 複合索引加速查詢。

**理由：** `getMoneyFlow()` 設計目標不同，欄位與過濾邏輯不完全相符；新方法更清晰且易於獨立維護。RS 計算在 application layer 完成：從結果中找出 TAIEX 的 `closePrice` 作為分母，對所有產業計算後過濾掉 TAIEX。

**替代方案考量：**
- 直接修改 `getMoneyFlow()` → 影響其他使用端，風險高
- 在 repository 內做 RS → 額外 `$lookup` 或雙查詢，aggregation 複雜度增加

### 2. 前端：產業 K 線如何複用 `KlineChartComponent`？

**決策：** 為 `KlineChartComponent` 加入 `symbol = input<string>('IX0001')` signal input，使其預設行為不變，同時可從外部傳入任意產業 symbol。

**理由：** 元件已有完整的日K/週K、時間範圍、MA 計算、hover 等功能，全部重寫成本高。加入 `input()` 是最小侵入性的改法，對現有大盤籌碼頁零影響。

**替代方案考量：**
- 複製元件為 `SectorKlineChartComponent` → 程式碼重複，維護成本高
- 改用 service 層傳入 symbol → 破壞元件的 standalone 設計

### 3. 前端：`selectedSector` 狀態放在哪裡？

**決策：** 建立 `SectorFlowStateService`（scoped to `/sector-flow` 頁面），存放 `selectedSymbol` signal 與時間範圍 signal，供排行表與各圖表元件 inject 共用。

**理由：** 與現有 `DashboardStateService` 模式一致，避免 Input/Output prop drilling 跨多層元件。頁面關閉後 service 自然銷毀（若使用 component-level providers）。

### 4. 前端：資金流向明細圖（上下雙子圖）的 eCharts 實作方式

**決策：** 使用 eCharts `grid` 陣列（兩個 grid），`xAxis`/`yAxis` 各兩組，`axisPointer` 共用同一條 tooltip 垂直線；**不使用 tab**，直接於 `SectorFlowChartsComponent` 展示圖表，卡片標頭含產業下拉選單（native `<select>`）與時間範圍按鈕。所有 Y 軸設 `scale: true`（非零基線）；tooltip 以自訂 formatter 確保日期標頭不重複、`成交比重%` 排於最後。

**理由：** 上下雙子圖是 eCharts 的標準多 grid 模式，已有 `IndicatorChartComponent` 可參考。上半圖：雙 Y 軸（左=加權指數點數，右=產業指數點數，兩組刻度不共享）。下半圖：單 Y 軸（比重%，右側，無標籤）。RS 強弱趨勢圖暫不實作，日後需要時再加入。

### 5. `getOhlcBySymbol()` select 是否修改？

**決策：** 新增獨立的 repository method `getSectorOhlc()`（或在現有方法加 `includeTradeWeight` option），select 包含 `tradeWeight`，供前端時間序列圖使用。

**理由：** 現有 `getOhlcBySymbol()` 的 select 不含 `tradeWeight`，但 `/marketdata/tickers` endpoint 已被大盤籌碼頁使用，直接改 select 可能影響不預期的呼叫端。保守做法：新增 option 或新方法。

## Risks / Trade-offs

- **[風險] `getMoneyFlow()` 依賴資料庫有至少 2 天資料** → Mitigation: API 回傳空陣列時前端顯示「尚無資料」提示，不 crash
- **[風險] 非交易日查詢（如週末）導致排行表空白** → Mitigation: 沿用大盤籌碼頁的 `$lte date` 語意（取不超過 date 的最近兩筆），`getMoneyFlow()` 已如此實作
- **[取捨] `KlineChartComponent` 加 input** → 改動現有元件有一定迴歸風險，但 signal input 是 Angular 19 最低侵入性改法，且有完整測試可驗證
- **[取捨] RS 計算在 application layer** → 若 TAIEX（IX0001）當日資料缺失，RS 值回傳 `null`（已在 repository 層處理 null check，不 crash）；前端目前未渲染 RS，此風險影響範圍有限
