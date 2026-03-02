## ADDED Requirements

### Requirement: 儀表板頁面路由
系統 SHALL 將應用程式根路徑 `/` 對應至 `DashboardComponent`，並以 Lazy Loading 方式載入。

#### Scenario: 進入根路徑
- **WHEN** 用戶瀏覽 `/`
- **THEN** 系統 SHALL 顯示儀表板頁面，包含 Toolbar、Hero Card、Stat Cards、趨勢圖表區塊及 Footer

---

### Requirement: 日期導航
系統 SHALL 在 Toolbar 提供日期導航控制，允許用戶切換至前一日、後一日或透過 DatePicker 選取特定日期，預設顯示最後一筆市場資料的日期。

#### Scenario: 預設日期為最後交易日
- **WHEN** 應用程式首次載入
- **THEN** 系統 SHALL 以 `market-stats` 回傳資料集中最後一筆的日期作為初始選取日期

#### Scenario: 切換至前一日
- **WHEN** 用戶點擊「前一日」按鈕
- **THEN** 系統 SHALL 更新所有資料請求的目標日期為前一天，並重新載入頁面所有區塊

#### Scenario: 透過 DatePicker 選取日期
- **WHEN** 用戶透過 DatePicker 選取某日期
- **THEN** 系統 SHALL 以選取日期作為基準日，重新載入 Hero Card 及 Stat Cards 數據

#### Scenario: 無法切換至未來日期
- **WHEN** 當前顯示日期已為今天
- **THEN** 系統 SHALL 禁用「後一日」按鈕

---

### Requirement: 晴雨表 Hero Card
系統 SHALL 顯示當日晴雨分析結果，採左右分欄佈局：左側顯示日期與大盤基本數據，右側顯示天氣圖示（大字）、中文等級標籤及 AI 生成的盤勢摘要文字。

#### Scenario: 成功載入晴雨資料
- **WHEN** `GET /marketdata/barometer?date=<date>` 回傳成功
- **THEN** 系統 SHALL 於左側顯示日期、加權指數（含漲跌）及成交金額，右側顯示天氣圖示、等級標籤及 AI 摘要文字，且 Hero Card 背景色 SHALL 對應晴雨等級色彩

#### Scenario: 晴雨等級色彩映射
- **WHEN** 系統載入晴雨資料
- **THEN** Hero Card 背景色 SHALL 依等級套用：STRONG_BULL=#F59E0B / BULL=#22C55E / NEUTRAL=#9CA3AF / BEAR=#3B82F6 / STRONG_BEAR=#4338CA

#### Scenario: 假日或無資料日期
- **WHEN** `GET /marketdata/barometer` 回傳 HTTP 404
- **THEN** 系統 SHALL 在 Hero Card 顯示「此日期無市場資料」提示

#### Scenario: 顯示 Loading 狀態
- **WHEN** API 請求進行中
- **THEN** 系統 SHALL 在 Hero Card 區域顯示 Loading 指示器（MatSpinner）

---

### Requirement: 今日籌碼速覽（Stat Cards）
系統 SHALL 以 Grid 佈局顯示 6 個當日指標卡片：外資買賣超、投信買賣超、自營商買賣超、外資台指期淨OI、外資選擇權淨部位、散戶微台淨部位。

#### Scenario: 數值正負色彩（台灣慣例）
- **WHEN** 指標數值為正
- **THEN** 數字 SHALL 顯示為紅色（#EF4444），負值顯示為綠色（#22C55E），符合台灣股市漲紅跌綠慣例

#### Scenario: 單位不標色彩
- **WHEN** 指標卡片顯示單位文字（億元、口等）
- **THEN** 單位文字 SHALL 固定顯示為灰色，不隨數值正負變色

#### Scenario: 資料來源
- **WHEN** Dashboard 初始化取得 `market-stats` 資料
- **THEN** Stat Cards SHALL 取用資料集中最後一筆記錄，不重複發送額外 API 請求

---

### Requirement: 時間範圍切換
系統 SHALL 提供 `[1M][3M][6M]` 三個快速切換按鈕，用於控制趨勢圖表的資料時間範圍，預設為 3M。

#### Scenario: 切換時間範圍
- **WHEN** 用戶點擊 `[1M]`、`[3M]` 或 `[6M]`
- **THEN** 系統 SHALL 以當前基準日往前推算對應月數作為 `startDate`，重新請求 `market-stats` 資料並更新所有趨勢圖

---

### Requirement: 趨勢圖表（雙 Y 軸）
系統 SHALL 顯示雙 Y 軸趨勢圖，左 Y 軸永遠為加權指數折線（`taiexPrice`），右 Y 軸為用戶透過 ChipListbox 選取的籌碼指標，並以 MatTabGroup 分為四個指標群。

#### Scenario: 加權指數永遠顯示
- **WHEN** 趨勢圖表載入
- **THEN** 加權指數折線 SHALL 永遠顯示於左 Y 軸，不可隱藏

#### Scenario: 副軸指標切換
- **WHEN** 用戶點選 ChipListbox 中的指標
- **THEN** 系統 SHALL 立即更新右 Y 軸資料為對應指標，無需重新發送 API 請求（前端切換）

#### Scenario: 長條正負色彩（台灣慣例）
- **WHEN** 副軸為長條圖類指標
- **THEN** 正值長條 SHALL 顯示為紅色（#EF4444），負值顯示為綠色（#22C55E）

#### Scenario: 固定色彩指標
- **WHEN** 指標為融資餘額、融券餘額或多系列並列圖（如大額交易人近月＋遠月）
- **THEN** 長條 SHALL 使用固定指定顏色（藍色/紫色），不依正負套用紅綠色

#### Scenario: 參考線
- **WHEN** 副軸為 P/C Ratio 或散戶多空比
- **THEN** 圖表 SHALL 於 y=1 位置顯示水平虛線參考線

#### Scenario: Y 軸縮放
- **WHEN** 副軸指標設定 `scaleAxis: true`（如融資餘額、匯率等長期趨勢指標）
- **THEN** 右 Y 軸 SHALL 依資料範圍縮放，不強制從 0 開始

#### Scenario: 單一指標 Tab 隱藏 Chip 選擇器
- **WHEN** Tab 內只有一個可選指標（如匯率走勢）
- **THEN** 系統 SHALL 隱藏 ChipListbox，直接顯示該指標圖表

#### Scenario: Tooltip 同步
- **WHEN** 用戶 hover 圖表任意日期
- **THEN** 浮動 Tooltip SHALL 同時顯示當日加權指數數值及副軸指標數值，格式包含日期標頭

#### Scenario: 無資料空狀態
- **WHEN** `market-stats` 回傳空陣列
- **THEN** 圖表區域 SHALL 顯示空狀態佔位提示，不顯示空白圖表

---

### Requirement: 四大指標群 Tab
系統 SHALL 以 MatTabGroup 組織四個指標群，每個 Tab 內提供對應的指標選項。

#### Scenario: 現貨籌碼 Tab 可選指標
- **WHEN** 用戶切換至「現貨籌碼」Tab
- **THEN** ChipListbox SHALL 提供以下選項：外資買賣超（預設）、投信買賣超、自營商買賣超、融資餘額、融券餘額

#### Scenario: 期貨籌碼 Tab 可選指標
- **WHEN** 用戶切換至「期貨籌碼」Tab
- **THEN** ChipListbox SHALL 提供以下選項：外資台指淨未平倉（預設）、大額交易人台指淨未平倉（近月＋遠月並列）、散戶小台淨未平倉、散戶小台多空比、散戶微台淨未平倉、散戶微台多空比

#### Scenario: 選擇權籌碼 Tab 可選指標
- **WHEN** 用戶切換至「選擇權籌碼」Tab
- **THEN** ChipListbox SHALL 提供以下選項：外資台指選擇權淨未平倉（預設）、外資台指買權淨未平倉、外資台指賣權淨未平倉、台指選擇權 P/C Ratio

#### Scenario: 匯率走勢 Tab
- **WHEN** 用戶切換至「匯率走勢」Tab
- **THEN** 系統 SHALL 直接顯示 USD/TWD 折線圖，不顯示 ChipListbox

---

### Requirement: Footer
系統 SHALL 在頁面底部顯示固定 Footer，包含資料來源說明、著作權及投資警語。

#### Scenario: Footer 內容
- **WHEN** 用戶瀏覽任意頁面
- **THEN** Footer SHALL 顯示資料來源（臺灣證券交易所・期貨交易所）、著作權文字及投資警語（「本網站資訊僅供參考，不構成任何投資建議或買賣依據」）

#### Scenario: 行動版佈局
- **WHEN** 螢幕寬度小於 768px
- **THEN** Footer SHALL 改為垂直堆疊佈局，警語獨立顯示於最下方
