### Requirement: 大盤 K 線圖
系統 SHALL 在 Dashboard 的晴雨表 Hero Card 與今日籌碼速覽之間顯示加權指數 K 線圖（IX0001），採單一繪圖區，K 棒主圖佔上方主要空間，成交量 bar 疊於主圖下方（透過獨立隱藏 Y 軸控制高度佔比約 20%），並與 topbar 時間範圍選擇器聯動。

#### Scenario: 成功載入 K 線資料
- **WHEN** Dashboard 載入且 `GET /marketdata/tickers?symbol=IX0001` 回傳成功
- **THEN** 系統 SHALL 顯示 candlestick K 棒與成交量 bar（疊於主圖下方），並顯示 MA5/MA10/MA20 均線

#### Scenario: 台灣紅漲綠跌色系
- **WHEN** K 線圖渲染資料
- **THEN** 陽線（收盤 ≥ 開盤）SHALL 顯示紅色（`#EF4444`），陰線（收 < 開）SHALL 顯示綠色（`#22C55E`）；成交量 bar 顏色 SHALL 與同日 K 棒顏色一致

#### Scenario: 與時間範圍聯動
- **WHEN** 用戶切換 topbar `[1M]`、`[3M]`、`[6M]` 或 `[1Y]`
- **THEN** K 線圖 SHALL 以對應的 startDate / endDate 重新請求並更新顯示

#### Scenario: Tooltip 顯示
- **WHEN** 用戶 hover K 線圖任意日期
- **THEN** Tooltip SHALL 顯示當日開/高/低/收（與前日收盤比較顯示紅綠色）、漲跌點數、漲跌幅及成交金額（億元）

#### Scenario: 無資料空狀態
- **WHEN** API 回傳空陣列
- **THEN** 系統 SHALL 顯示「此期間無資料」空狀態佔位，不顯示空白圖表
