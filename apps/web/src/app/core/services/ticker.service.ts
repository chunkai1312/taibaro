import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TickerOhlc } from '../models/ticker-ohlc.model';
import { SectorFlowSnapshot } from '../models/sector-flow-snapshot.model';

@Injectable({ providedIn: 'root' })
export class TickerService {
  private readonly baseUrl = '/api/marketdata/tickers';
  private readonly sectorFlowUrl = '/api/marketdata/sector-flow';

  constructor(private http: HttpClient) {}

  getTicker(symbol: string, startDate: string, endDate: string): Observable<TickerOhlc[]> {
    return this.http.get<TickerOhlc[]>(this.baseUrl, {
      params: { symbol, startDate, endDate },
    });
  }

  getSectorFlow(date: string): Observable<SectorFlowSnapshot[]> {
    return this.http.get<SectorFlowSnapshot[]>(this.sectorFlowUrl, {
      params: { date },
    });
  }
}
