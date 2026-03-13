## Why

大盤籌碼頁已提供整體市場觀察，但缺乏產業層次的資金流向資訊。投資人需要了解資金正在流向哪些產業（成交比重趨勢）、各產業今日漲跌強弱、以及技術面走勢（產業 K 線），以輔助選股方向的判斷。後端已每日收集台股上市各產業指數的 OHLC 與 tradeWeight 資料，具備完整數據基礎，現在適合建構此功能。

## What Changes

- 新增 `/sector-flow` 頁面（產業資金流向），並在 TopBar 加入「大盤籌碼」與「資金流向」填色 pill 導覽連結
- 新增後端 API endpoint：`GET /marketdata/sector-flow?date=YYYY-MM-DD`，回傳當日所有 TSE 上市產業指數的成交比重、漲跌幅、RS 值（含前一日比較數據）
- 新增 `/marketdata/tickers` 資料查詢複用：已有 `getOhlcBySymbol()` 可查產業時間序列
- `/sector-flow` 頁面包含三個 section：
  1. **產業資金流向排行表**（Section 1「產業資金流向」）：所有 TSE 產業，欄位含指數、漲跌、漲跌幅%、漲跌幅圖、成交金額、昨日金額、金額差、比重、昨日比重、比重差；預設依漲跌幅降冪排序；無列點選行為，產業切換由 Section 2 / Section 3 各自的下拉選單負責；資料載入時自動選取漲跌幅最高的產業
  2. **資金流向圖表**（Section 2「產業類股趨勢」）：直接顯示上下雙子圖（上：加權指數 + 產業指數雙線；下：成交比重%）；卡片標頭含產業下拉選單與時間範圍 `[1M][3M][6M]`
  3. **產業類股走勢**（Section 3「產業類股走勢」）：複用現有 `KlineChartComponent`，透過 `ng-content` 投影獨立下拉選單作為卡片標題；`klineSymbol` 與 Section 2 的 `selectedSymbol` 保持獨立
- TopBar 加入頁面導覽（填色 pill，active 狀態），不影響日期選擇器

## Capabilities

### New Capabilities

- `sector-money-flow`: 產業資金流向頁面，包含排行表、資金流向明細圖、產業類股走勢（K 線圖）
- `sector-flow-api`: 後端 `GET /marketdata/sector-flow` endpoint，回傳當日 TSE 所有產業的資金流向快照（含今日與前一日）
- `topbar-navigation`: TopBar 多頁面導覽，以填色 pill 樣式顯示 active 連結

### Modified Capabilities

<!-- 無既有 spec 的需求變更 -->

## Impact

- **後端**：`marketdata.controller.ts`、新增 `getSectorFlow()` 方法於 `TickerService` 或新 service、新增 DTO
- **前端路由**：`app.routes.ts` 加入 `/sector-flow` lazy-load route
- **前端 Toolbar**：`toolbar.component` HTML/TS/SCSS 加入 nav links + RouterLinkActive
- **新前端頁面**：`SectorFlowComponent` + 子元件（`SectorRankingTableComponent`、`SectorFlowChartsComponent`）
- **新 Service**：`SectorFlowStateService`（`selectedSymbol`、`selectedName`、`localRange`、`sectors`、`klineSymbol` signals）
- **複用元件**：`KlineChartComponent`（新增 `symbol` input 與 `ng-content` 卡片標題投影）
- **無 breaking change**：現有大盤籌碼頁（`/`）完全不受影響
