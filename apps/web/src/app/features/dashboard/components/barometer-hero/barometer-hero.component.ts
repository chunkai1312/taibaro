import { Component, input, computed } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import {
  BarometerResult,
  BAROMETER_COLOR,
} from '../../../../core/models/barometer.model';
import { MarketStats } from '../../../../core/models/market-stats.model';

@Component({
  selector: 'app-barometer-hero',
  standalone: true,
  imports: [
    CommonModule,
    DecimalPipe,
    MatCardModule,
    MatProgressSpinnerModule,
    MatIconModule,
  ],
  templateUrl: './barometer-hero.component.html',
  styleUrl: './barometer-hero.component.scss',
})
export class BarometerHeroComponent {
  data = input<BarometerResult | null>(null);
  todayStats = input<MarketStats | null>(null);
  loading = input<boolean>(false);
  error = input<string | null>(null);

  readonly bgColor = computed(() => {
    const d = this.data();
    return d ? BAROMETER_COLOR[d.level] : '#9CA3AF';
  });

  readonly taiexUp = computed(() => (this.todayStats()?.taiexChange ?? 0) >= 0);

  readonly tradeValueBillions = computed(() => {
    const v = this.todayStats()?.taiexTradeValue;
    return v != null ? Math.round(v / 1e8) : null;
  });
}
