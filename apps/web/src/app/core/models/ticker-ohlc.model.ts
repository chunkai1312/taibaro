export interface TickerOhlc {
  date: string;
  openPrice: number;
  highPrice: number;
  lowPrice: number;
  closePrice: number;
  tradeValue: number;
  tradeWeight?: number;
}
