## 1. 基礎設施

- [x] 1.1 在 `styles.scss` 定義 `$light-theme` 與 `$dark-theme` 兩個 Angular Material theme，並以 `html` / `html.dark-mode` 分別 include `mat.all-component-themes`
- [x] 1.2 在 `styles.scss` 的 `:root` 與 `html.dark-mode` 中定義完整 CSS Custom Property token 系統（背景、文字、邊框、晴雨 5 色、漲跌色、toolbar-bg、section-accent）
- [x] 1.3 建立 `apps/web/src/app/core/services/theme.service.ts`，使用 Signal 管理 `isDark` 狀態，初始化時讀取 `localStorage`，`toggle()` 同步更新 `html.dark-mode` class 與 `localStorage`

## 2. Toolbar 切換按鈕

- [x] 2.1 在 `toolbar.component.ts` inject `ThemeService`，新增 `isDark` signal 綁定
- [x] 2.2 在 `toolbar.component.html` 加入主題切換 `mat-icon-button`（`dark_mode` / `light_mode` icon），點擊呼叫 `themeService.toggle()`
- [x] 2.3 更新 `toolbar.component.scss`：移除硬編碼背景色，改用 `var(--toolbar-bg)`；深色模式下加入 `border-bottom: 1px solid var(--border-color)`

## 3. 全域與 Layout Token 化

- [x] 3.1 更新 `styles.scss` 的 `body` 背景色改為 `var(--bg-page)`
- [x] 3.2 更新 `footer.component.scss`：所有硬編碼顏色改為對應 CSS token
- [x] 3.3 更新 `dashboard.component.scss`：`section-title` 顏色與 border-left 改為 CSS token

## 4. 元件 Token 化

- [x] 4.1 更新 `stat-card.component.scss`：`.label`、`.value`、`.unit` 色彩改為 CSS token
- [x] 4.2 更新 `barometer-hero.component.scss`：移除固定背景色相關樣式，改為 `var(--bg-surface)` 背景加 `border-left: 4px solid`
- [x] 4.3 更新 `barometer-hero.component.html`：加入 `MatChipsModule`，以 MatChip 顯示盤勢 label，chip 背景使用等級色 15% opacity
- [x] 4.4 更新 `barometer-hero.component.ts`：移除 `bgColor` computed（或改為回傳 border 色），新增 `accentColor` computed 供 border 與 chip 使用
- [x] 4.5 更新 `barometer.model.ts` 的 `BAROMETER_COLOR`：確認 token 指向正確的 CSS Custom Property（deep color token 已在 dark-mode 覆寫）

## 5. Echarts 深色主題

- [x] 5.1 找出 `trend-chart` 相關元件（`indicator-chart` 等），inject `ThemeService`
- [x] 5.2 在 echarts 元件的 template 中，將 `[theme]` binding 綁定為 `isDark() ? 'dark' : ''`

## 6. 驗收

- [x] 6.1 手動測試：在淺色模式下切換至深色，確認所有元件（toolbar、footer、卡片、圖表）正確套用深色主題
- [x] 6.2 手動測試：重新整理頁面，確認 `localStorage` 偏好被正確讀取與套用
- [x] 6.3 手動測試：在深色模式下確認所有晴雨等級（強多/偏多/中性/偏空/強空）的 accent border 與 chip 顏色可辨識
- [x] 6.4 手動測試：在深色模式下確認 echarts 圖表的軸線、tooltip、資料系列顯示正常
