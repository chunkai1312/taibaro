import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BarometerResult } from '../models/barometer.model';

@Injectable({ providedIn: 'root' })
export class BarometerService {
  private readonly baseUrl = '/api/marketdata/barometer';

  constructor(private http: HttpClient) {}

  getBarometer(date: string): Observable<BarometerResult> {
    return this.http.get<BarometerResult>(this.baseUrl, {
      params: { date },
    });
  }
}
