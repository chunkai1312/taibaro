## REMOVED Requirements

### Requirement: 時間範圍切換
**Reason**: 時間區間控制下放至 K 線圖與籌碼趨勢各自的卡片內，Toolbar 不再負責全域 range 切換。
**Migration**: 使用各圖卡片標題列的 `[1M][3M][6M][1Y]` 按鈕替代。

## MODIFIED Requirements

### Requirement: 大盤 K 線圖
系統 SHALL 在 Dashboard 的晴雨表 Hero Card 與今日籌碼速覽之間顯示加權指數 K 線圖（IX0001），採單一繪圖區，K 棒主圖佔上方主要空間，成交量 bar 疊於主圖下方（透過獨立隱藏 Y 軸控制高度佔比約 20%），卡片標題列 SHALL 提供獨立的 `[1M][3M][6M][1Y]` range 選擇器。

#### Scenario: 成功載入 K 線資料
- **WHEN** Dashboard 載入且 `GET /marketdata/tickers?symbol=IX0001` 回傳成功
- **THEN** 系統 SHALL 顯示 candlestick K 棒與成交量 bar（疊於主圖下方），並顯示 MA5/MA10/MA20 均線

#### Scenario: 台灣紅漲綠跌色系
- **WHEN** K 線圖渲染資料
- **THEN** 陽線（收盤 ≥ 開盤）SHALL 顯示紅色（`#EF4444`），陰線（收 < 開）SHALL 顯示綠色（`#22C55E`）；成交量 bar 顏色 SHALL 與同日 K 棒顏色一致

#### Scenario: 與卡片 range 選擇器聯動
- **WHEN** 用戶點擊 K 線圖卡片的 `[1M]`、`[3M]`、`[6M]` 或 `[1Y]` 按鈕
- **THEN** K 線圖 SHALL 立即更新顯示範圍至對應期間（前端 slice，不重新請求 API）

#### Scenario: Tooltip 顯示
- **WHEN** 用戶 hover K 線圖任意日期
- **THEN** Tooltip SHALL 顯示當日開/高/低/收（與前日收盤比較顯示紅綠色）、漲跌點數、漲跌幅及成交金額（億元）

#### Scenario: 無資料空狀態
- **WHEN** API 回傳空陣列
- **THEN** 系統 SHALL 顯示「此期間無資料」空狀態佔位，不顯示空白圖表

### Requirement: 趨勢圖表（雙 Y 軸）
系統 SHALL 顯示雙 Y 軸趨勢圖，左 Y 軸永遠為加權指數折線（`taiexPrice`），右 Y 軸為用戶透過 ChipListbox 選取的籌碼指標，並以 MatTabGroup 分為四個指標群。卡片標題列 SHALL 提供獨立的 `[1M][3M][6M][1Y]` range 選擇器。

#### Scenario: 加權指數永遠顯示
- **WHEN** 趨勢圖表載入
- **THEN** 加權指數折線 SHALL 永遠顯示於左 Y 軸，不可隱藏

#### Scenario: 副軸指標切換
- **WHEN** 用戶點選 ChipListbox 中的指標
- **THEN** 系統 SHALL 立即更新右 Y 軸資料為對應指標，無需重新發送 API 請求（前端切換）

#### Scenario: 與卡片 range 選擇器聯動
- **WHEN** 用戶點擊趨勢圖卡片的 `[1M]`、`[3M]`、`[6M]` 或 `[1Y]` 按鈕
- **THEN** 趨勢圖 SHALL 立即更新所有指標的顯示範圍至對應期間（前端 slice，不重新請求 API）

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
