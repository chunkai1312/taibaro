## Why

Dashboard 目前只有 AI 晴雨表摘要與籌碼數字，缺乏技術面視角。在 Hero Card 與今日籌碼速覽之間插入加權指數 K 線圖（含成交量副圖），讓用戶在同一畫面同時看到情緒面（晴雨表）、技術面（K 線走勢）與籌碼面（速覽與趨勢），三者互補。

## What Changes

- 新增後端 API endpoint：`GET /marketdata/tickers`（支援 symbol + 日期區間查詢）
- `TickerRepository` 新增 `getOhlcBySymbol()` 方法
- 前端新增 `TickerOhlc` model interface
- 前端新增 `TickerService`（HTTP client service）
- 前端新增 `KlineChartComponent`：eCharts candlestick + 成交量 bar 副圖，台灣紅漲綠跌色系，與 topbar 時間範圍聯動
- `DashboardComponent` 在 Hero Card section 與今日籌碼速覽 section 之間插入 K 線圖 section

## Capabilities

### New Capabilities
- `ticker-ohlc-api`: 後端 OHLC 查詢 API，依 symbol 與日期區間回傳收盤行情資料
- `dashboard-kline-chart`: 前端大盤 K 線圖元件，顯示於 Dashboard Hero 與速覽之間

### Modified Capabilities
- `web-dashboard`: Dashboard 佈局新增 K 線圖區塊（Hero → K 線圖 → 速覽 → 趨勢）

## Impact

- `apps/api/src/app/marketdata/repositories/ticker.repository.ts`：新增 `getOhlcBySymbol()`
- `apps/api/src/app/marketdata/marketdata.controller.ts`：新增 `GET /marketdata/tickers`
- `apps/web/src/app/core/models/`：新增 `ticker-ohlc.model.ts`
- `apps/web/src/app/core/services/`：新增 `ticker.service.ts`
- `apps/web/src/app/features/dashboard/components/`：新增 `kline-chart/` 目錄
- `apps/web/src/app/features/dashboard/dashboard.component.ts` / `.html`：引入並插入新元件
