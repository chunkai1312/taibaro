## MODIFIED Requirements

### Requirement: 時間範圍切換
系統 SHALL 提供 `[1M][3M][6M][1Y]` 四個快速切換按鈕，用於控制趨勢圖表的資料時間範圍，預設為 3M。

#### Scenario: 切換時間範圍
- **WHEN** 用戶點擊 `[1M]`、`[3M]`、`[6M]` 或 `[1Y]`
- **THEN** 系統 SHALL 以當前基準日往前推算對應時間（1M=1個月、3M=3個月、6M=6個月、1Y=12個月）作為 `startDate`，重新請求 `market-stats` 資料並更新所有趨勢圖
