## 1. 擴充型別與映射

- [x] 1.1 在 `dashboard-state.service.ts` 的 `TimeRange` union type 新增 `'1Y'`
- [x] 1.2 在 `RANGE_MONTHS` 中新增 `'1Y': 12` 映射

## 2. 更新 Toolbar

- [x] 2.1 在 `toolbar.component.ts` 的 `ranges` 陣列新增 `'1Y'`（`['1M', '3M', '6M', '1Y']`）

## 3. 驗證

- [x] 3.1 確認點擊 `[1Y]` 後圖表正確顯示約 12 個月的資料範圍
- [x] 3.2 確認 `[1Y]` 按鈕的 `.active` 樣式與其他按鈕一致
