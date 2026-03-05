## 1. 前端 Model 更新

- [x] 1.1 在 `core/models/market-stats.model.ts` 的 `MarketStats` interface 補齊廣度欄位

## 2. BreadthBarComponent 建立

- [x] 2.1 建立 `breadth-bar.component.ts`
- [x] 2.2 建立 `breadth-bar.component.html`
- [x] 2.3 建立 `breadth-bar.component.scss`

## 3. BarometerHeroComponent 整合

- [x] 3.1 在 `barometer-hero.component.ts` imports 陣列加入 `BreadthBarComponent`
- [x] 3.2 在 `barometer-hero.component.html` 成交金額 `stat-block` 下方加入 `<app-breadth-bar>` 並傳入 `todayStats()` 的廣度欄位
