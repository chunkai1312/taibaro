## Context

後端 `TickerRepository` 已有 DB 查詢能力與 IX0001 的 OHLC 資料（`openPrice / highPrice / lowPrice / closePrice / tradeValue`），但 `MarketDataController` 目前未暴露 ticker 查詢端點。前端已有 `echarts` + `ngx-echarts`（v21），現有 `IndicatorChartComponent` 提供了 echarts 渲染殼層可複用。`DashboardStateService` 的 `startDate` / `endDate` computed signal 可直接注入複用。

## Goals / Non-Goals

**Goals:**
- 新增 `TickerRepository.getOhlcBySymbol()` 與 `GET /marketdata/tickers` endpoint
- 新增前端 `KlineChartComponent`，以 echarts candlestick + volume bar 渲染 IX0001 K 線圖
- 套用台灣紅漲綠跌色系
- 與 topbar 時間範圍選擇器（startDate / endDate）聯動

**Non-Goals:**
- 個股 K 線圖（未來擴充，本次僅硬編 IX0001）
- 技術指標（MA / BBAND 等）
- K 線圖自身的時間範圍選擇器
- 後端分頁、速率限制

## Decisions

**1. 新增獨立的 `getOhlcBySymbol()` 而非修改現有 `getTickers()`**
現有 `getTickers()` 無 symbol 過濾，改動會影響多個呼叫方。新增獨立方法語義清晰，日後擴充個股也更自然。

**2. DTO 驗證：symbol 為必填，日期為選填**
後端用 `class-validator` 驗證，和現有 `GetMarketStatsDto` 同模式。symbol 必填避免全表掃描，日期預設使用與 `market-stats` 相同的區間邏輯。

**3. echarts candlestick 資料格式 `[open, close, low, high]`**
echarts 的 candlestick 格式為 `[open, close, low, high]`（非直覺的 OHLC 順序），chart-config 負責轉換。

**4. 成交量副圖用 `grid` 分割，主圖 70% / 副圖 30%**
與業界 K 線圖工具慣例一致（TradingView 等），echarts `grid` 陣列配置兩個 `yAxis` 對應兩個 `xAxis`，DataZoom 同步兩個 grid。

**5. 台灣紅漲綠跌**
eCharts 預設綠漲紅跌（歐美慣例），需覆寫 `itemStyle`：陽線 `#EF4444` / 陰線 `#22C55E`，與全站 stat card 色系一致。Volume bar 顏色跟當日 K 棒同色（`closePrice >= openPrice` 為紅）。

**6. 複用 `IndicatorChartComponent` 的 echarts 殼層**
`IndicatorChartComponent` 接受 `option` input，處理 dark mode theme 切換，空狀態 fallback 已內建，直接複用避免重複邏輯。

## Risks / Trade-offs

- **[資料量 1Y ≈ 250 筆]** 單次 API 回傳最多約 250 條 K 棒，不需分頁，效能無虞
- **[時間範圍聯動 UX]** 1M 只有約 20 根 K 棒，視覺上較稀疏；接受此 trade-off，待用戶反饋後決定是否加預設範圍覆寫
- **[資料不存在日期]** 非交易日（如週末）DB 無資料，echarts xAxis 類型用 `category`（依實際日期顯示），不補空點，與趨勢圖做法一致
