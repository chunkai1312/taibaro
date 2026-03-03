## Context

Web 介面目前為單一 Angular Material light theme，所有元件的背景色、文字色、邊框色均以硬編碼 hex 值分散在各 scss 元件中。`barometer-hero` 使用晴雨等級對應的全面積彩色背景，兩個模式下視覺語言不一致若不統一設計。

技術現況：
- Angular Material v18，使用 `mat.define-theme` / `mat.all-component-themes`
- 全域樣式集中於 `styles.scss`，各元件有獨立 scss
- `DashboardStateService` 已示範 signal-based service 模式
- `barometer-hero` 的背景色由 `BAROMETER_COLOR` 常數驅動，已走 CSS Custom Property（`var(--color-*)`）

## Goals / Non-Goals

**Goals:**
- 建立可切換的 light / dark 主題系統，偏好持久化至 `localStorage`
- 定義完整 CSS token 系統取代所有硬編碼 hex 值
- 統一 `barometer-hero` 的視覺語言（light/dark 均用 accent border + chip）
- Echarts 圖表隨主題切換
- Angular Material 元件（card、button、toolbar 等）自動套用對應 theme

**Non-Goals:**
- 自動跟隨系統 `prefers-color-scheme`（本次不實作，為未來 enhancement 保留空間）
- 重新設計資訊架構或版面佈局
- 新增或移除任何資料欄位

## Decisions

### 決策 1：雙 Material Theme + CSS Class 切換

**選擇**：定義 `$light-theme` / `$dark-theme` 兩個 Material theme，以 `html.dark-mode` class 切換。

```scss
html { @include mat.all-component-themes($light-theme); }
html.dark-mode { @include mat.all-component-themes($dark-theme); }
```

**捨棄**：僅用 CSS Custom Property 覆寫 Material token。雖然更輕量，但 Material 的深色支援需要透過 theme API 才能完整覆蓋 ripple、overlay、陰影等狀態。

**捨棄**：`prefers-color-scheme` media query。用戶需要手動控制，media query 無法在同一 session 中切換。

---

### 決策 2：ThemeService（Signal-based，仿 DashboardStateService）

```typescript
@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly isDark = signal<boolean>(/* 從 localStorage 初始化 */);

  toggle() { /* 切換 signal + 更新 html class + 持久化 */ }
}
```

**理由**：與現有 `DashboardStateService` 風格一致。任何元件可 inject 讀取 `isDark` signal，反應式更新。

---

### 決策 3：CSS Custom Property Token 系統

所有顏色改為 CSS token，在 `:root` 定義 light 值，在`html.dark-mode` 覆寫：

```scss
:root {
  --bg-page:            #F5F5F5;
  --bg-surface:         #FFFFFF;
  --bg-surface-elevated:#FAFAFA;
  --border-color:       #E0E0E0;
  --text-primary:       #1A1A1A;
  --text-secondary:     #666666;
  --toolbar-bg:         #1565C0;
  --section-accent:     #3B82F6;
  --color-strong-bull:  #F59E0B;
  --color-bull:         #22C55E;
  --color-neutral:      #9CA3AF;
  --color-bear:         #3B82F6;
  --color-strong-bear:  #4338CA;
  --color-positive:     #EF4444;
  --color-negative:     #22C55E;
}

html.dark-mode {
  --bg-page:            #131722;
  --bg-surface:         #1E222D;
  --bg-surface-elevated:#2A2E39;
  --border-color:       #363A45;
  --text-primary:       #D1D4DC;
  --text-secondary:     #787B86;
  --toolbar-bg:         #1E222D;
  --section-accent:     #60A5FA;
  --color-strong-bull:  #FBBF24;
  --color-bull:         #4ADE80;
  --color-neutral:      #9CA3AF;
  --color-bear:         #60A5FA;
  --color-strong-bear:  #818CF8;  /* 原 #4338CA 在深色底下不可辨，提亮為紫色 */
  --color-positive:     #F87171;
  --color-negative:     #4ADE80;
}
```

---

### 決策 4：Barometer Hero 統一為 Accent Border 風格

**選擇**：light/dark 兩模式均改為：
- 卡片背景：`var(--bg-surface)`（不再使用彩色全背景）
- 左側 `4px solid var(--color-<level>)` border-left
- `MatChip` 顯示盤勢 label，chip 背景為等級色的 15% opacity

**理由**：
1. 彩色全背景在深色模式下飽和度過高，強迫用戶注意力，與 TradingView 的剋制風格相違
2. 統一兩模式的視覺語言，用戶切換主題時不會感覺設計斷裂
3. 色彩降格為語意標籤（border + chip），而非情緒渲染，資訊更清晰

**捨棄**：light mode 保留彩色全背景、dark mode 改用 border。兩模式視覺語言不一致，且實作複雜度更高。

---

### 決策 5：Echarts Dark Theme

**選擇**：`trend-chart` 元件 inject `ThemeService`，透過 `[theme]="isDark() ? 'dark' : ''"` 切換 echarts 內建 dark theme。

**理由**：ngx-echarts 直接支援 `[theme]` input，零額外設定。echarts 內建 dark theme 對深色背景下的軸線、網格線、工具提示均有完整支援。

---

### 決策 6：Toolbar 深色模式風格

**選擇**：深色模式下 toolbar 背景改為 `var(--toolbar-bg)`（`#1E222D`，與頁面融合），加 `border-bottom: 1px solid var(--border-color)` 分隔。

**捨棄**：保留深藍 `#1565C0`。深色模式下深藍 toolbar 形成視覺跳躍，不符合 TradingView 的整體沉浸感。

## Risks / Trade-offs

- **[風險] MatDatepicker popup 在深色模式下渲染品質** → 深色 Material theme 對 Datepicker overlay 有已知的顏色問題；接受輕度瑕疵，必要時補少量 `::ng-deep` 覆寫
- **[Trade-off] SCSS bundle 大小增加** → `mat.all-component-themes` 呼叫兩次會增加 CSS bundle，但此為 Material 官方推薦做法，影響可接受（約 +30-50KB gzip 前）
- **[風險] 硬編碼 hex 遺漏** → token 化過程可能遺漏局部 scss；接受，逐步在後續 PR 補齊

## Migration Plan

純前端樣式變更，無資料庫或 API 異動：
1. 先部署 ThemeService + styles.scss token（影響輕微，預設 light mode 與現況相同）
2. 元件逐步 token 化（順序：全域 → layout → dashboard 子元件）
3. barometer-hero 重新設計最後上線（視覺變動最大）

Rollback：git revert 即可，無狀態遷移。

## Open Questions

- 無
