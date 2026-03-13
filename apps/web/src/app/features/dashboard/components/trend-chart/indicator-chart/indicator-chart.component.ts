import { Component, input, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxEchartsDirective } from 'ngx-echarts';
import type { EChartsOption } from 'echarts';
import { MatIconModule } from '@angular/material/icon';
import { ThemeService } from '../../../../../core/services/theme.service';

@Component({
  selector: 'app-indicator-chart',
  standalone: true,
  imports: [CommonModule, NgxEchartsDirective, MatIconModule],
  templateUrl: './indicator-chart.component.html',
  styleUrl: './indicator-chart.component.scss',
})
export class IndicatorChartComponent {
  option = input<EChartsOption | null>(null);
  height = input<string>('360px');
  chartGlobalout = output<void>();

  readonly themeService = inject(ThemeService);
  readonly isDark = this.themeService.isDark;
}
