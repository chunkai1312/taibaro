import { Injectable, signal, computed } from '@angular/core';
import { DateTime } from 'luxon';

export type TimeRange = '1M' | '3M' | '6M' | '1Y' | '2Y';

export const RANGE_MONTHS: Record<TimeRange, number> = {
  '1M': 1,
  '3M': 3,
  '6M': 6,
  '1Y': 12,
  '2Y': 24,
};

@Injectable({ providedIn: 'root' })
export class DashboardStateService {
  readonly selectedDate = signal<string>(DateTime.local().toISODate() ?? '');
  readonly endDate = computed(() => this.selectedDate());

  setDate(date: string) {
    this.selectedDate.set(date);
  }
}
