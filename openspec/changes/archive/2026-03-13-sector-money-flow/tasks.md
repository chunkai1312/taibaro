## 1. 後端 API

- [x] 1.1 在 `TickerRepository` 的 `getOhlcBySymbol()` select 中加入 `tradeWeight` 欄位
- [x] 1.2 在 `TickerRepository` 新增 `getSectorFlow(date: string)` method，複用 `getMoneyFlow()` 邏輯並補充 RS 計算（closePrice / TAIEX closePrice），排除 TAIEX 本身及合成指數後回傳
- [x] 1.3 新增 `GetSectorFlowDto`（`date?: string`）
- [x] 1.4 在 `MarketDataController` 新增 `GET /marketdata/sector-flow` endpoint，呼叫 `getSectorFlow()`
- [x] 1.5 確認 Swagger 文件（`@ApiOperation`）正確標示

## 2. 前端路由與導覽

- [x] 2.1 在 `app.routes.ts` 新增 `/sector-flow` lazy-load route，指向新的 `SectorFlowComponent`
- [x] 2.2 在 `ToolbarComponent` HTML 加入「大盤籌碼」（`/`）與「資金流向」（`/sector-flow`）導覽連結，使用 `routerLinkActive`
- [x] 2.3 在 `ToolbarComponent` SCSS 加入 nav-link 與 active pill 填色樣式
- [x] 2.4 在 `ToolbarComponent` imports 加入 `RouterLink`、`RouterLinkActive`

## 3. KlineChartComponent 升級

- [x] 3.1 將 `KlineChartComponent` 的 hardcoded `'IX0001'` 改為 `symbol = input<string>('IX0001')` signal input
- [x] 3.2 更新 constructor 的 `combineLatest` 以監聽 `symbol` signal 變化，確保切換產業時重新抓取資料
- [x] 3.3 卡片標題區改用 `<ng-content select="[cardTitle]">` 投影，提供預設 fallback `<span>加權指數 K 線</span>`
- [x] 3.4 驗證大盤籌碼頁的 K 線圖行為不受影響（無 `symbol` input 時預設 IX0001）

## 4. 前端 SectorFlowStateService

- [x] 4.1 建立 `SectorFlowStateService`，包含 `selectedSymbol = signal<string>('')`、`selectedName = signal<string>('')`、`localRange = signal<TimeRange>('1M')`、`sectors = signal<{ symbol: string; name: string }[]>([])`、`klineSymbol = signal<string | undefined>(undefined)`
- [x] 4.2 Service 注入至 `SectorFlowComponent` providers，使其 scoped to 頁面

## 5. 前端 SectorFlowComponent（頁面 shell）

- [x] 5.1 建立 `SectorFlowComponent`（standalone），layout 為垂直 flex column（與 DashboardComponent 相同模式）
- [x] 5.2 Section 1（「產業資金流向」）：引入 `SectorRankingTableComponent`
- [x] 5.3 Section 2（「產業類股趨勢」，conditional on `selectedSymbol()`）：引入 `SectorFlowChartsComponent`
- [x] 5.4 Section 3（「產業類股走勢」，conditional on `selectedSymbol()`）：引入 `KlineChartComponent`，以 `ng-content select="[cardTitle]"` 投影 native `<select>` 下拉，綁定 `[symbol]="klineSymbol()!"`
- [x] 5.5 頁面資料載入時（每次日期變更）自動設定 `sectors`、`selectedSymbol`、`selectedName`、`klineSymbol` 為漲跌幅（`changePercent`）最高的產業
- [x] 5.6 實作 `onKlineSymbolChange(value)` method 供 Section 3 下拉選單使用

## 6. 前端 SectorRankingTableComponent

- [x] 6.1 建立 `SectorRankingTableComponent`，注入 `SectorFlowStateService`
- [x] 6.2 實作欄位：產業 | 指數 | 漲跌 | 漲跌幅% | 漲跌幅圖（對稱 bar）| 成交金額(億) | 昨日金額(億) | 金額差(億) | 比重% | 昨日比重% | 比重差
- [x] 6.3 實作預設排序（`changePercent` 降冪）與欄位標題點擊切換排序
- [x] 6.4 「指數」欄位依 `change` 正負顯示紅/綠顏色
- [x] 6.5 實作 `maxAbsChange` computed signal 與 `barPct()` method 供漲跌幅圖使用

## 7. 前端 SectorFlowChartsComponent

- [x] 7.1 建立 `SectorFlowChartsComponent`，卡片標頭含 native `<select>` 產業下拉與時間範圍按鈕（1M / 3M / 6M）
- [x] 7.2 時間範圍選擇與 `SectorFlowStateService.localRange` 綁定
- [x] 7.3 實作上下雙子圖（上：加權指數 + 產業指數雙折線；下：成交比重% 折線，右側 Y 軸，無標籤），所有 Y 軸 `scale: true`，`axisPointer` 連動
- [x] 7.4 實作 tooltip 自訂 formatter：日期只顯示一次，`成交比重%` 排於最後
- [x] 7.5 監聽 `SectorFlowStateService.selectedSymbol` 變化，重新抓取時間序列資料（加權指數 + 選取產業）
- [x] 7.6 實作 `onSectorChange(value)` 更新 `selectedSymbol` 與 `selectedName`

## 8. 前端 TickerService 擴充

- [x] 8.1 在前端 `TickerService` 新增 `getSectorFlow(date: string)` method，呼叫後端 `GET /marketdata/sector-flow?date=...`
- [x] 8.2 新增 `SectorFlowSnapshot` model（對應後端回傳欄位）

## 9. 整合驗證

- [x] 9.1 驗證排行表資料正確，今日/昨日比重差計算符合預期
- [x] 9.2 驗證資金流向明細圖上下連動 tooltip 正常，日期標頭不重複
- [x] 9.3 驗證切換 Section 2 下拉選單後圖表正確更新，不影響 Section 3
- [x] 9.4 驗證切換 Section 3 下拉選單後 K 線圖正確更新，不影響 Section 2
- [x] 9.5 驗證大盤籌碼頁（`/`）全功能不受影響
- [x] 9.6 驗證 TopBar active pill 在兩個頁面間正確切換
