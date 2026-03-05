## MODIFIED Requirements

### Requirement: 晴雨表 Hero Card
系統 SHALL 顯示當日晴雨分析結果，採左右分欄佈局：左側顯示日期、大盤基本數據（加權指數、成交金額）及市場廣度比例條，右側顯示天氣圖示（大字）、以 MatChip 呈現的中文等級標籤及 AI 生成的盤勢摘要文字。Hero Card 使用統一的表面色背景（`var(--bg-surface)`），以左側 `4px` 等級色 accent border 區分盤勢，淺色與深色模式採相同視覺語言。

#### Scenario: 成功載入晴雨資料
- **WHEN** `GET /marketdata/barometer?date=<date>` 回傳成功
- **THEN** 系統 SHALL 於左側顯示日期、加權指數（含漲跌）及成交金額，右側顯示天氣圖示、以 MatChip 呈現的等級標籤及 AI 摘要文字，Hero Card 左側 SHALL 有 `4px solid var(--color-<level>)` 的 accent border

#### Scenario: 晴雨等級 Accent Border 色彩映射
- **WHEN** 系統載入晴雨資料
- **THEN** Hero Card 左側 accent border 色彩 SHALL 依等級套用對應的 CSS token：STRONG_BULL=`var(--color-strong-bull)` / BULL=`var(--color-bull)` / NEUTRAL=`var(--color-neutral)` / BEAR=`var(--color-bear)` / STRONG_BEAR=`var(--color-strong-bear)`

#### Scenario: 晴雨等級 Chip 顯示
- **WHEN** 系統載入晴雨資料
- **THEN** 系統 SHALL 以 MatChip 顯示盤勢中文標籤（強多/偏多/中性/偏空/強空），chip 背景色 SHALL 為對應等級色彩的 15% opacity

#### Scenario: 市場廣度比例條顯示於成交金額下方
- **WHEN** 當日 `MarketStats` 包含廣度欄位（`advanceCount`、`declineCount` 有值）
- **THEN** 系統 SHALL 在成交金額 stat-block 下方顯示 `BreadthBarComponent`，呈現三色上漲/平盤/下跌比例條

#### Scenario: 廣度資料不存在時不顯示比例條
- **WHEN** 當日 `MarketStats` 的廣度欄位為 null
- **THEN** 系統 SHALL 不顯示廣度比例條，其餘 Hero Card 內容不受影響

#### Scenario: 假日或無資料日期
- **WHEN** `GET /marketdata/barometer` 回傳 HTTP 404
- **THEN** 系統 SHALL 在 Hero Card 顯示「此日期無市場資料」提示

#### Scenario: 顯示 Loading 狀態
- **WHEN** API 請求進行中
- **THEN** 系統 SHALL 在 Hero Card 區域顯示 Loading 指示器（MatSpinner）
