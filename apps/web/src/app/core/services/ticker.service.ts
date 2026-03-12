import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TickerOhlc } from '../models/ticker-ohlc.model';

@Injectable({ providedIn: 'root' })
export class TickerService {
  private readonly baseUrl = '/api/marketdata/tickers';

  constructor(private http: HttpClient) {}

  getTicker(symbol: string, startDate: string, endDate: string): Observable<TickerOhlc[]> {
    return this.http.get<TickerOhlc[]>(this.baseUrl, {
      params: { symbol, startDate, endDate },
    });
  }
}
