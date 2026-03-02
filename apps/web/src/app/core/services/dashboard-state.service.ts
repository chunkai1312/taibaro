import { Injectable, signal, computed } from '@angular/core';
import { DateTime } from 'luxon';

export type TimeRange = '1M' | '3M' | '6M';

const RANGE_MONTHS: Record<TimeRange, number> = {
  '1M': 1,
  '3M': 3,
  '6M': 6,
};

@Injectable({ providedIn: 'root' })
export class DashboardStateService {
  readonly selectedDate = signal<string>(DateTime.local().toISODate() ?? '');
  readonly selectedRange = signal<TimeRange>('3M');

  readonly startDate = computed(() => {
    const months = RANGE_MONTHS[this.selectedRange()];
    return (
      DateTime.fromISO(this.selectedDate())
        .minus({ months })
        .toISODate() ?? ''
    );
  });

  readonly endDate = computed(() => this.selectedDate());

  setDate(date: string) {
    this.selectedDate.set(date);
  }

  setRange(range: TimeRange) {
    this.selectedRange.set(range);
  }
}
