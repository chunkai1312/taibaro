## Why

目前時間範圍只有 1M / 3M / 6M，無法一眼看出「整年度」的趨勢走勢。加入 1Y 選項讓用戶可用年度視角觀察籌碼變化，補足現有選項的空缺。

## What Changes

- 新增 `1Y`（12 個月）作為第四個時間範圍快速切換按鈕，顯示於 `[1M][3M][6M]` 之後
- `TimeRange` 型別擴充為 `'1M' | '3M' | '6M' | '1Y'`
- `RANGE_MONTHS` 新增 `'1Y': 12` 映射
- Toolbar 的 `ranges` 陣列更新為 `['1M', '3M', '6M', '1Y']`

## Capabilities

### New Capabilities
<!-- 無新獨立 capability；此為既有功能的延伸 -->

### Modified Capabilities
- `web-dashboard`: 「時間範圍切換」requirement 現行規格為 `[1M][3M][6M]` 三個按鈕，新增 `[1Y]` 選項後需同步更新規格描述與 Scenario

## Impact

- `apps/web/src/app/core/services/dashboard-state.service.ts`：擴充型別與映射
- `apps/web/src/app/layout/toolbar/toolbar.component.ts`：更新 `ranges` 陣列
- `openspec/specs/web-dashboard/spec.md`：更新「時間範圍切換」需求說明
