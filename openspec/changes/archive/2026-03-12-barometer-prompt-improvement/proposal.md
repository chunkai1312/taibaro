## Why

晴雨表 LLM 分析在處理期貨淨部位的正負號變化時存在語意歧義——當底倉為負（淨空方向），日變化為負值時，模型容易誤判為「部位減少」而非「空方加碼」，導致方向性結論錯誤。此外，system prompt 中範例字數（~130 字）與規格要求（250-350 字）不一致，實際輸出偏短。

## What Changes

- **buildUserMessage**：對期貨淨未平倉與散戶部位的日變化值，加入方向語意標籤（如「多方加碼 300 口」、「空方加碼 300 口」），消除正負號歧義
- **system prompt**：修正範例 summary 至符合規格的字數（200-250 字），壓縮冗餘的基礎指標定義，保留非直覺的判斷規則
- **summary 字數規範**：調整為 200-250 字（縮短上限，讓範例可完整示範），與 UI 呈現空間相符

## Capabilities

### New Capabilities

<!-- 無新功能，此次為現有能力的品質改善 -->

### Modified Capabilities

- `barometer-analysis`：summary 字數規範從 250-350 字調整為 200-250 字；LLM 輸入資料格式新增期貨部位方向語意標籤

## Impact

- `apps/api/src/app/barometer/barometer.prompt.ts`：修改 `buildUserMessage` 函式與 `SYSTEM_PROMPT` 常數
- `openspec/specs/barometer-analysis/spec.md`：更新 summary 字數規範
- 不影響 API 介面、資料庫 schema 或前端
