/**
 * Migration: ticker instInvestors sub-document
 *
 * 將舊有 Ticker documents 的籌碼欄位遷移至新版巢狀結構：
 *
 * Phase 1 (舊頂層欄位 → instInvestors.{inst}.net)：
 *   finiNetBuySell    → instInvestors.fini.net
 *   sitcNetBuySell    → instInvestors.sitc.net
 *   dealersNetBuySell → instInvestors.dealers.net
 *   （buy/sell 欄位待下次定時任務更新時自動補齊）
 *
 * Phase 2 (舊 instInvestors 扁平結構 → 新巢狀結構)：
 *   instInvestors.finiNetBuySell    → instInvestors.fini.net
 *   instInvestors.sitcNetBuySell    → instInvestors.sitc.net
 *   instInvestors.dealersNetBuySell → instInvestors.dealers.net
 *
 * 執行方式（於 mongosh 中）：
 *   load("migrate-ticker-inst-investors.js")
 *
 * 或直接用 mongosh 執行：
 *   mongosh <connection-string> migrate-ticker-inst-investors.js
 */

// Phase 1: 舊有頂層欄位 → 新巢狀結構
const phase1 = db.tickers.updateMany(
  { finiNetBuySell: { $exists: true } },
  [
    {
      $set: {
        instInvestors: {
          fini:    { net: '$finiNetBuySell' },
          sitc:    { net: '$sitcNetBuySell' },
          dealers: { net: '$dealersNetBuySell' },
        },
      },
    },
    {
      $unset: ['finiNetBuySell', 'sitcNetBuySell', 'dealersNetBuySell'],
    },
  ],
);
print(`Phase 1 - Matched: ${phase1.matchedCount}, Modified: ${phase1.modifiedCount}`);

// Phase 2: 舊 instInvestors 扁平結構 → 新巢狀結構
const phase2 = db.tickers.updateMany(
  { 'instInvestors.finiNetBuySell': { $exists: true } },
  [
    {
      $set: {
        instInvestors: {
          fini:    { net: '$instInvestors.finiNetBuySell' },
          sitc:    { net: '$instInvestors.sitcNetBuySell' },
          dealers: { net: '$instInvestors.dealersNetBuySell' },
        },
      },
    },
  ],
);
print(`Phase 2 - Matched: ${phase2.matchedCount}, Modified: ${phase2.modifiedCount}`);
