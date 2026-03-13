## 1. 縮減 DashboardStateService

- [x] 1.1 移除 `selectedRange` signal 與 `RANGE_MONTHS` 常數
- [x] 1.2 移除 `startDate` computed
- [x] 1.3 移除 `setRange()` 方法
- [x] 1.4 確認 `endDate` computed 仍保留（= selectedDate）

## 2. 更新 Toolbar

- [x] 2.1 移除 `toolbar.component.html` 中的 `[1M][3M][6M][1Y]` 按鈕 HTML
- [x] 2.2 移除 `toolbar.component.ts` 中的 `onRangeChange()` 方法及相關 signal/computed

## 3. 更新 DashboardComponent 資料抓取

- [x] 3.1 將 `market-stats` 的 fetch 觸發改為只監聽 `selectedDate`（移除對 `startDate` 的 combineLatest）
- [x] 3.2 fetch 時固定使用 `start = endDate - 12個月` 抓 1Y 資料

## 4. 更新 KlineChartComponent

- [x] 4.1 新增 `localRange = signal<TimeRange>('3M')` 本地 signal
- [x] 4.2 將 fetch 觸發改為只監聽 `selectedDate`，固定抓 1Y OHLC 資料
- [x] 4.3 新增 `rawData` signal 儲存完整 1Y 資料
- [x] 4.4 新增 `filteredData = computed(() => slice rawData by localRange)` 
- [x] 4.5 將 `chartOption` computed 改為基於 `filteredData` 而非直接來自 API 回應
- [x] 4.6 在卡片標題列加入 range 選擇器 UI（`[1M][3M][6M][1Y]` 按鈕，active 樣式標示目前選取）

## 5. 更新 ChartTabGroupComponent

- [x] 5.1 新增 `localRange = signal<TimeRange>('3M')` 本地 signal
- [x] 5.2 新增 `filteredData = computed(() => { const end = data().at(-1)?.date; slice data() by localRange from end })` 
- [x] 5.3 將圖表 option 建立改為基於 `filteredData` 而非完整 `data()`
- [x] 5.4 在卡片標題列加入 range 選擇器 UI（`[1M][3M][6M][1Y]` 按鈕，active 樣式標示目前選取）

## 6. 驗收測試

- [x] 6.1 確認切換 range 按鈕時無任何 API 請求（Network tab 無新請求）
- [x] 6.2 確認切換日期時兩張圖都重新 fetch（各自發出 1 次 API 請求）
- [x] 6.3 確認兩張圖 range 可獨立切換互不干擾
- [x] 6.4 確認 Toolbar 已無 range 按鈕
- [x] 6.5 確認 todayStats（Stat Cards）資料不受影響
