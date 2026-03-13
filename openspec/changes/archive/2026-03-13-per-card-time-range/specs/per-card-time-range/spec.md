## ADDED Requirements

### Requirement: 各圖卡片內建時間區間選擇器
K 線圖卡片與籌碼趨勢卡片 SHALL 各自在卡片標題列提供 `[1M][3M][6M][1Y]` 四個時間區間按鈕，預設選取 `3M`，選取狀態 SHALL 以 active 樣式明確標示。兩張圖的 range 選擇互不影響。

#### Scenario: 預設選取 3M
- **WHEN** 頁面首次載入
- **THEN** K 線圖卡片與籌碼趨勢卡片的 range 選擇器 SHALL 各自預設顯示 `3M` 為選取狀態

#### Scenario: 切換 range 為前端即時 slice
- **WHEN** 用戶點擊 K 線圖卡片或趨勢卡片的任一 range 按鈕（1M/3M/6M/1Y）
- **THEN** 系統 SHALL 立即更新圖表顯示範圍至對應期間，不發送任何 API 請求

#### Scenario: 兩圖 range 獨立
- **WHEN** 用戶將 K 線圖 range 切換為 `6M`
- **THEN** 籌碼趨勢圖的 range 選取狀態 SHALL 保持不變

#### Scenario: range 不持久化
- **WHEN** 用戶重新載入頁面
- **THEN** 兩張圖的 range SHALL 恢復為預設值 `3M`

---

### Requirement: endDate 跟隨全域日期選擇
兩張圖的時間軸右端點（endDate）SHALL 永遠等於 Toolbar 的目前選取日期（`selectedDate`），不受各卡片 range 選擇影響。

#### Scenario: 日期改變時圖表右端點同步更新
- **WHEN** 用戶透過 Toolbar 切換日期
- **THEN** K 線圖與趨勢圖的 endDate SHALL 立即更新為新選取日期，並依各自 localRange 計算新的 startDate 重新 fetch 1Y 資料

#### Scenario: 歷史回顧模式
- **WHEN** 用戶將 Toolbar 日期設為歷史日期（如 `2025-08-01`）
- **THEN** 兩張圖時間軸的右端點 SHALL 對齊 `2025-08-01`，各自的 range 按鈕決定往前顯示多少期間

---

### Requirement: 資料抓取策略（1Y 一次抓取）
日期改變時，K 線圖與籌碼趨勢圖 SHALL 各自抓取以 `endDate` 為終點、近 1 年的完整資料集，range 選擇器切換僅對前端已快取的 1Y 資料進行 slice，不重複發送 API 請求。

#### Scenario: 日期改變觸發重抓
- **WHEN** 用戶切換 Toolbar 日期
- **THEN** 系統 SHALL 以新 `endDate` 重新請求 1Y 資料（`start = endDate - 12個月`），並依目前 localRange 重新 slice 顯示

#### Scenario: range 切換不觸發 API
- **WHEN** 用戶切換卡片 range 按鈕
- **THEN** 系統 SHALL 不發送任何 API 請求，直接從已快取的 1Y 資料 slice 對應期間顯示
