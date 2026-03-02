## 1. 安裝依賴與基礎設定

- [x] 1.1 安裝 `@angular/material`、`@angular/cdk`，執行 `ng add @angular/material` 設定主題
- [x] 1.2 安裝 `ngx-echarts` 與 `echarts`，在 `app.config.ts` 以 `provideEcharts()` 注冊
- [x] 1.3 在 `styles.scss` 引入 Angular Material 主題及全域 CSS custom properties（五層色彩變數）

## 2. Core 層：Models 與 Services

- [x] 2.1 建立 `core/models/barometer.model.ts`（`BarometerLevel` enum、`BarometerResult` interface）
- [x] 2.2 建立 `core/models/market-stats.model.ts`（`MarketStats` interface，對應 API 21 欄位）
- [x] 2.3 建立 `core/services/barometer.service.ts`，實作 `getBarometer(date: string): Observable<BarometerResult>`
- [x] 2.4 建立 `core/services/market-stats.service.ts`，實作 `getMarketStats(startDate: string, endDate: string): Observable<MarketStats[]>`
- [x] 2.5 在 `app.config.ts` 提供 `provideHttpClient()`

## 3. Layout：Toolbar 與日期導航

- [x] 3.1 建立 `layout/toolbar/toolbar.component.ts`，整合 `MatToolbar`、前後日切換 `MatIconButton`、`MatDatepicker`
- [x] 3.2 實作 `[1M][3M][6M]` 時間範圍切換（`MatButtonToggleGroup`），預設 3M
- [x] 3.3 將 Toolbar 整合至 `AppComponent`，透過 `@Output` 或 `Signal` 向 Dashboard 傳遞日期與時間範圍狀態
- [x] 3.4 實作「當日期為今天時禁用後一日按鈕」邏輯

## 4. Barometer Hero Card 組件

- [x] 4.1 建立 `features/dashboard/components/barometer-hero/barometer-hero.component.ts`，接受 `BarometerResult` 作為 `@Input`
- [x] 4.2 實作大字天氣 emoji、等級標籤、AI 摘要文字排版
- [x] 4.3 建立 `barometer-gauge/barometer-gauge.component.ts`（純 CSS 五格 Gauge），接受 `BarometerLevel` input，高亮對應格子
- [x] 4.4 實作 Hero Card 背景色動態綁定（依 `BarometerLevel` 套用對應 CSS custom property）
- [x] 4.5 實作 404 / Loading / Error 狀態的 UI 呈現

## 5. 今日籌碼速覽（Stat Cards）

- [x] 5.1 建立 `stat-card/stat-card.component.ts`，接受 `label`、`value`、`change`、`unit` 作為 `@Input`，正負值套用綠/紅色
- [x] 5.2 建立 `stats-overview/stats-overview.component.ts`，以 CSS Grid 排版 8 格卡片
- [x] 5.3 實作從 `market-stats` 陣列末筆取出當日數據的邏輯，供 Stat Cards 使用

## 6. 趨勢圖表組件

- [x] 6.1 建立 `trend-chart/indicator-chart/indicator-chart.component.ts`，接受 ECharts `option` 作為 `@Input`，使用 `ngx-echarts` 指令渲染圖表
- [x] 6.2 建立 `trend-chart/chart-tab-group/chart-tab-group.component.ts`，包含 `MatTabGroup` 四個 Tab（三大法人 / 期貨籌碼 / 融資券 / 情緒指標）
- [x] 6.3 實作各 Tab 的 `MatChipListbox`（單選），並定義各 Tab 可選的副軸指標清單（含欄位名稱映射）
- [x] 6.4 實作雙 Y 軸 ECharts option builder：左 Y 軸 TAIEX 折線 + 右 Y 軸動態副軸（長條或折線依指標類型決定）
- [x] 6.5 實作長條圖正負值色彩 callback（`itemStyle.color`）
- [x] 6.6 實作情緒指標 y=1 參考線（`markLine`）
- [x] 6.7 實作統一 Tooltip 格式（含日期、加權指數、副軸指標值、單位）
- [x] 6.8 實作空狀態佔位 UI

## 7. Dashboard 頁面容器

- [x] 7.1 建立 `features/dashboard/dashboard.component.ts`，管理日期、時間範圍狀態（Signal 或 RxJS BehaviorSubject）
- [x] 7.2 整合兩個 HTTP 請求（barometer + market-stats），處理 combineLatest / forkJoin 資料流
- [x] 7.3 組裝 Hero Card、Stat Cards、趨勢圖表三個子區塊
- [x] 7.4 設定路由：`app.routes.ts` 中 `/` lazy load DashboardComponent

## 8. 驗收與收尾

- [x] 8.1 確認五層色彩在所有組件（Hero、Gauge、Toolbar accent）一致對應
- [x] 8.2 確認時間範圍切換正確觸發 API 重新請求並更新圖表
- [x] 8.3 確認日期導航（前後切換、DatePicker）正確更新 Hero Card 及 Stat Cards
- [x] 8.4 確認 404（假日）、Loading、API 錯誤三種邊界狀態皆有 UI 處理
- [x] 8.5 移除 `nx-welcome.ts` 及相關引用
