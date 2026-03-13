export interface SectorFlowSnapshot {
  symbol: string;
  name: string;
  date: string;
  closePrice: number;
  change: number;
  changePercent: number;
  tradeValue: number;
  tradeValuePrev: number;
  tradeValueChange: number;
  tradeWeight: number;
  tradeWeightPrev: number;
  tradeWeightChange: number;
  rs: number | null;
}
