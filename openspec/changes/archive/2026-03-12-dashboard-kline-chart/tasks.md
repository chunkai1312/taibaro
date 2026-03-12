## 1. 後端：新增 OHLC 查詢

- [x] 1.1 在 `ticker.repository.ts` 新增 `getOhlcBySymbol(options: { symbol: string, startDate?: string, endDate?: string })` 方法，查詢指定 symbol 的 `date / openPrice / highPrice / lowPrice / closePrice / tradeValue`，依 `date` 升冪排序
- [x] 1.2 在 `apps/api/src/app/marketdata/dto/` 新增 `get-ticker-ohlc.dto.ts`，`symbol` 為必填字串，`startDate` / `endDate` 為選填字串
- [x] 1.3 在 `MarketDataController` 注入 `TickerRepository`，新增 `GET /marketdata/tickers` endpoint，呼叫 `getOhlcBySymbol()`，日期預設值與 `market-stats` 一致（startDate = 今日 -3M，endDate = 今日）

## 2. 前端：Model 與 Service

- [x] 2.1 新增 `apps/web/src/app/core/models/ticker-ohlc.model.ts`，定義 `TickerOhlc` interface（`date / openPrice / highPrice / lowPrice / closePrice / tradeValue`）
- [x] 2.2 新增 `apps/web/src/app/core/services/ticker.service.ts`，提供 `getTicker(symbol: string, startDate: string, endDate: string): Observable<TickerOhlc[]>`，呼叫 `GET /api/marketdata/tickers`

## 3. 前端：KlineChartComponent

- [x] 3.1 建立 `apps/web/src/app/features/dashboard/components/kline-chart/kline-chart.component.ts`，注入 `DashboardStateService` 與 `TickerService`，使用 `computed()` 組裝 echarts option
- [x] 3.2 實作 echarts option builder：主圖 grid（70%）candlestick series（`[open, close, low, high]`），副圖 grid（30%）volume bar series；陽線 `#EF4444` / 陰線 `#22C55E`，volume bar 同色邏輯
- [x] 3.3 建立 `kline-chart.component.html`，複用 `app-indicator-chart` 殼層渲染 echarts（傳入 `option` 與 `height`）
- [x] 3.4 建立 `kline-chart.component.scss`（section 標題樣式與既有 dashboard section 保持一致）

## 4. 前端：整合至 Dashboard

- [x] 4.1 在 `DashboardComponent` 注入 `TickerService`，新增 `klineData` signal，於 `startDate` / `endDate` 變化時重新載入（參照 `marketStatsData` 的 combineLatest 模式）
- [x] 4.2 在 `dashboard.component.html` 於 Hero Card section 與今日籌碼速覽 section 之間插入 `<app-kline-chart>` section
- [x] 4.3 在 `dashboard.component.ts` imports 陣列加入 `KlineChartComponent`
