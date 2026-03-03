## Why

目前 AI 量表分析只依賴單日籌碼數據（今日 + 前日對比），無法感知加權指數的中短期趨勢與量能狀態。這導致分析結果缺乏「籌碼配合技術面」的交叉確認，例如外資買超時若指數仍在下跌趨勢中，訊號強度應降評，但目前 AI 無從判斷。

## What Changes

- `barometer.service.ts`：在呼叫 `buildUserMessage` 前，從近期歷史資料計算技術面輔助指標（5MA、20MA、5 日均量、今日量能比），並傳入 prompt
- `barometer.prompt.ts`：新增「技術面輔助」指標說明區塊、對應的判斷準則、更新 `buildUserMessage` 函式簽章以接受技術指標參數
- summary 範例：更新範例以涵蓋技術面交叉確認的描述

## Capabilities

### New Capabilities

- `barometer-technical-context`: 在量表分析中加入加權指數技術面輔助指標（均線位置、量能狀態），供 AI 做籌碼 × 技術面交叉確認

### Modified Capabilities

- `barometer-analysis`：AI 分析摘要新增需提及技術面輔助訊號的要求（與籌碼訊號相互印證）

## Impact

- `apps/api/src/app/barometer/barometer.service.ts`：需查詢最近 20+ 筆歷史資料以計算 MA/均量
- `apps/api/src/app/barometer/barometer.prompt.ts`：指標說明、判斷準則、`buildUserMessage` 函式簽章與 summary 要求更新
- `apps/api/src/app/marketdata/repositories/market-stats.repository.ts`：可能需要新增查詢最近 N 筆記錄的方法
- 不修改資料庫 schema，無 breaking change
