## Why

Web 介面目前僅支援明亮模式，在低光環境下長期瀏覽會造成視覺疲勞，且與主流金融工具（TradingView、Bloomberg Terminal）的視覺習慣不符。深色模式已是現代 Web 應用的標配，現在是補齊的時機。

## What Changes

- 新增 `ThemeService`，提供手動切換深/淺模式的能力，並將偏好儲存至 `localStorage`
- 定義雙 Angular Material theme（light / dark），透過 `html.dark-mode` class 切換
- 建立完整 CSS Custom Property token 系統，涵蓋背景、文字、邊框、盤勢色彩
- Toolbar 加入主題切換按鈕（`dark_mode` / `light_mode` icon）；深色模式下 toolbar 改為與頁面融合的深色背景搭配 border-bottom 分隔
- `barometer-hero` 卡片從彩色全背景改為「左側 accent border + MatChip」設計，light/dark 統一視覺語言
- 晴雨表 5 色系統從「大面積背景色」降格為「邊框與 chip tint」，深色模式下提亮飽和度以確保對比度
- `trend-chart`（ngx-echarts）跟隨主題切換 echarts 內建 dark theme
- Footer、stat-card、dashboard section-title 等元件全面 token 化，消除硬編碼 hex 值

## Capabilities

### New Capabilities
- `dark-mode`: 使用者可手動切換深/淺模式，偏好持久化於 localStorage；UI 風格對標 TradingView 深色主題，涵蓋所有頁面元件

### Modified Capabilities
- `web-dashboard`: 儀表板視覺設計調整——barometer-hero 統一為 accent border 風格（不再使用彩色全背景），所有元件支援雙主題

## Impact

- `apps/web/src/styles.scss`：定義雙 Material theme 與 CSS token 系統
- `apps/web/src/app/core/services/`：新增 `ThemeService`
- `apps/web/src/app/layout/toolbar/`：新增切換按鈕
- `apps/web/src/app/layout/footer/`：token 化
- `apps/web/src/app/features/dashboard/`：所有子元件 token 化
- `apps/web/src/app/features/dashboard/components/barometer-hero/`：重新設計卡片視覺
- `apps/web/src/app/features/dashboard/components/trend-chart/`：加入 echarts dark theme 支援
- `apps/web/src/app/core/models/barometer.model.ts`：調整 `BAROMETER_COLOR`（保留，但用途從背景色改為 accent 色）
- 無 API 變更，無 breaking changes
