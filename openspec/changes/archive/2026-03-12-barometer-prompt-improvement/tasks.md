## 1. 修正 buildUserMessage 期貨部位方向語意

- [x] 1.1 在 `buildUserMessage` 中新增輔助函式 `fmtNetOiChange(change, netOi)`，根據底倉方向（`netOi` 正負）將日變化轉換為「多單增加 N 口」、「空單增加 N 口」等語意標籤
- [x] 1.2 更新外資台指淨未平倉日變化（`finiTxfNetOiChange`）的輸出，改用語意標籤（配合 `finiTxfNetOi` 底倉方向）
- [x] 1.3 更新散戶微台日變化（`retailTmfNetOi` 的 change）的輸出，改用語意標籤
- [x] 1.4 更新散戶小台日變化（`retailMxfNetOi` 的 change）的輸出，改用語意標籤

## 2. 修正 system prompt

- [x] 2.1 壓縮指標說明區塊，移除「正值=買超，負值=賣超」等模型已知的基礎定義，保留反向指標邏輯與非直覺規則
- [x] 2.2 將 summary 字數規範從「250-350 字」修改為「200-350 字（依訊號複雜程度彈性調整）」
- [x] 2.3 將範例一的 summary 改寫至約 250-300 字（補充依據細節、趨勢描述、選擇權觀點）
- [x] 2.4 將範例二的 summary 改寫至約 250-300 字

## 3. 更新 spec

- [x] 3.1 將 `openspec/specs/barometer-analysis/spec.md` 中的 summary 字數規範從「150-200 字」更新為「200-350 字（依訊號複雜程度彈性調整）」，並新增期貨部位語意標籤的 requirement
