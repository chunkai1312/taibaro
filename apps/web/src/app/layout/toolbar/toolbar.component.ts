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
import { DashboardStateService } from '../../core/services/dashboard-state.service';
import { ThemeService } from '../../core/services/theme.service';

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
  readonly themeService = inject(ThemeService);
  readonly isDark = this.themeService.isDark;

  readonly selectedDateObj = computed(() =>
    new Date(this.state.selectedDate() + 'T00:00:00')
  );

  readonly selectedDateStr = computed(() => {
    const d = this.state.selectedDate();
    return d ? d.substring(0, 10) : '';
  });

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

}
