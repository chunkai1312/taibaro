## MODIFIED Requirements

### Requirement: 儀表板頁面路由
系統 SHALL 將應用程式根路徑 `/` 對應至 `DashboardComponent`，並以 Lazy Loading 方式載入。

#### Scenario: 進入根路徑
- **WHEN** 用戶瀏覽 `/`
- **THEN** 系統 SHALL 顯示儀表板頁面，包含 Toolbar、Hero Card、K 線圖、Stat Cards、趨勢圖表區塊及 Footer
