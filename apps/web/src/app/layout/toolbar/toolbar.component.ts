import {
  Component,
  computed,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconButton, MatButton } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { DateTime } from 'luxon';
import { DashboardStateService, TimeRange } from '../../core/services/dashboard-state.service';

export type { TimeRange };

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatIconButton,
    MatButton,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  templateUrl: './toolbar.component.html',
  styleUrl: './toolbar.component.scss',
})
export class ToolbarComponent {
  private state = inject(DashboardStateService);

  readonly ranges: TimeRange[] = ['1M', '3M', '6M'];

  readonly selectedDateObj = computed(() =>
    new Date(this.state.selectedDate() + 'T00:00:00')
  );

  readonly selectedDateStr = computed(() => {
    const d = this.state.selectedDate();
    return d ? d.substring(0, 10) : '';
  });

  readonly selectedRange = this.state.selectedRange;

  readonly maxDate = new Date();

  readonly isToday = computed(() => {
    return this.state.selectedDate() === (DateTime.local().toISODate() ?? '');
  });

  prevDay() {
    const d = DateTime.fromISO(this.state.selectedDate()).minus({ days: 1 });
    this.state.setDate(d.toISODate() ?? '');
  }

  nextDay() {
    if (this.isToday()) return;
    const d = DateTime.fromISO(this.state.selectedDate()).plus({ days: 1 });
    this.state.setDate(d.toISODate() ?? '');
  }

  onDatePickerChange(date: Date | null) {
    if (!date) return;
    this.state.setDate(DateTime.fromJSDate(date).toISODate() ?? '');
  }

  onRangeChange(range: TimeRange) {
    this.state.setRange(range);
  }
}
