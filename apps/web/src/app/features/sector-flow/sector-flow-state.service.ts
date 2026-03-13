import { Injectable, signal } from '@angular/core';
import { TimeRange } from '../../core/services/dashboard-state.service';

@Injectable()
export class SectorFlowStateService {
  readonly selectedSymbol = signal<string>('');
  readonly selectedName = signal<string>('');
  readonly localRange = signal<TimeRange>('1M');
  readonly sectors = signal<{ symbol: string; name: string }[]>([]);
  readonly klineSymbol = signal<string | undefined>(undefined);
}
