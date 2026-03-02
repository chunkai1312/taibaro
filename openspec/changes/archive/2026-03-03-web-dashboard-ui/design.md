## Context

前端 `apps/web` 目前為 Nx 骨架（空的 routes、空的 features/core/layout 資料夾），需要從零建立儀表板介面。後端已提供兩個 API：
- `GET /marketdata/barometer?date=` → 晴雨等級 + AI 摘要
- `GET /marketdata/market-stats?startDate=&endDate=` → 每日大盤籌碼數據（21 欄位）

## Goals / Non-Goals

**Goals:**
- 建立單頁儀表板，整合晴雨表 Hero Card、今日籌碼速覽、近期趨勢圖表
- 使用 Angular Material 作為 UI 元件庫
- 使用 ngx-echarts（基於 Apache ECharts）實作雙 Y 軸趨勢圖
- 五層晴雨等級對應色彩系統，視覺化呈現多空氛圍

**Non-Goals:**
- 不實作用戶登入 / 權限控管
- 不做後端任何修改
- 不實作 K 線圖或進階技術分析圖表

## Decisions

### 圖表庫：ngx-echarts 而非 ng2-charts

**決定**：使用 ngx-echarts（Apache ECharts）  
**理由**：Apache ECharts 對雙 Y 軸、動態 tooltip 同步、長條正負色彩的支援比 Chart.js 更成熟，且日後若需擴充 K 線圖也有原生支援。ng2-charts 功能偏基礎，難以支援本次複雜的互動需求。

### HTTP 請求策略：共用 market-stats 資料

**決定**：頁面初始化時發出兩個請求，`market-stats` 的最後一筆作為今日 Stat Cards 數據。  
```
① GET /marketdata/barometer?date=<selected>    → Hero Card
② GET /marketdata/market-stats?startDate=<range>&endDate=<selected>  → Stat Cards（末筆）+ 趨勢圖（全段）
```
**理由**：避免第三次相同日期的 API 呼叫，前端僅需兩個 Observable 即可驅動整個頁面。

### 雙 Y 軸：TAIEX 永遠為主軸

**決定**：趨勢圖中加權指數（taiexPrice）永遠佔據左 Y 軸主折線，右 Y 軸副軸由使用者透過 `MatChipListbox` 單選指標。  
**理由**：指數走勢是所有籌碼指標最自然的對照基準，不讓使用者選擇可降低認知負擔，同時保持圖表一致性。

### 組件架構：Feature-based 分層

```
features/dashboard/
├── dashboard.component.ts             (頁面容器，管理日期/時間範圍狀態)
├── components/
│   ├── barometer-hero/                (Hero Card + Gauge + AI 摘要)
│   │   └── barometer-gauge/           (五格 gauge，純 CSS)
│   ├── stats-overview/                (8 格速覽，grid layout)
│   │   └── stat-card/                 (單格指標卡)
│   └── trend-chart/                   (圖表區域)
│       ├── indicator-chart/           (ngx-echarts 實例，接受 ECharts option)
│       └── time-range-selector/       ([1M][3M][6M] MatButtonToggleGroup)

core/
├── models/
│   ├── barometer.model.ts
│   └── market-stats.model.ts
└── services/
    ├── barometer.service.ts
    └── market-stats.service.ts

layout/
└── toolbar/                           (MatToolbar + 日期導航)
```

### 色彩系統：五層等級對應 CSS custom properties

```
--color-strong-bull: #F59E0B  (amber)
--color-bull:        #22C55E  (green)
--color-neutral:     #9CA3AF  (gray)
--color-bear:        #3B82F6  (blue)
--color-strong-bear: #4338CA  (indigo)
```
Hero Card 背景色、Gauge 填充色及 Toolbar accent 均從 `BarometerLevel` 動態綁定此色彩。

### 四大指標群（Tab 結構）

| Tab | 可選副軸指標 | 圖表類型 |
|-----|------------|---------|
| 三大法人 | 外資買賣超 / 投信買賣超 / 自營商買賣超 | 長條（正負色） |
| 期貨籌碼 | 外資台指期淨OI / 大額商近月 / 散戶小台 | 折線 |
| 融資券 | 融資餘額 / 融資變化 / 融券餘額 / 融券變化 | 折線+長條 |
| 情緒指標 | P/C Ratio / 散戶多空比 / 匯率 | 折線（含 y=1 參考線） |

## Risks / Trade-offs

- **雙 Y 軸視覺誤導** → 在圖表右上角加上副軸單位標示（億元 / 口數 / %），並在 tooltip 中顯示原始數值，降低誤讀風險。
- **ngx-echarts bundle 大小**（ECharts ~1MB）→ 使用 `import 'echarts/core'` 加上個別 component 的 tree-shaking 方式引入，減少不必要的模組。
- **API 無資料日期（假日）** → barometer 返回 404 時 Hero Card 顯示「尚無資料」提示，market-stats 返回空陣列時圖表顯示空狀態佔位圖。

## Open Questions

_(無。設計已在探索階段充分討論並確認。)_
