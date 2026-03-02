import { Component, input, signal, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MarketStats } from '../../../../../core/models/market-stats.model';
import { IndicatorChartComponent } from '../indicator-chart/indicator-chart.component';
import { TAB_DEFINITIONS, buildChartOption, IndicatorDef } from '../chart-config';
import type { EChartsOption } from 'echarts';

@Component({
  selector: 'app-chart-tab-group',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatChipsModule,
    MatCardModule,
    IndicatorChartComponent,
  ],
  templateUrl: './chart-tab-group.component.html',
  styleUrl: './chart-tab-group.component.scss',
})
export class ChartTabGroupComponent implements OnChanges {
  data = input<MarketStats[]>([]);

  readonly tabs = TAB_DEFINITIONS;

  // 每個 Tab 目前選取的指標 index，預設都是 0
  readonly selectedIndicatorIndex = signal<number[]>(
    TAB_DEFINITIONS.map(() => 0)
  );

  ngOnChanges() {
    // 資料更新時強制重整 computed（signal 會自動 re-evaluate）
  }

  selectIndicator(tabIndex: number, indicatorIndex: number) {
    this.selectedIndicatorIndex.update((prev) => {
      const next = [...prev];
      next[tabIndex] = indicatorIndex;
      return next;
    });
  }

  getChartOption(tabIndex: number): EChartsOption | null {
    const d = this.data();
    if (!d.length) return null;
    const tab = this.tabs[tabIndex];
    const indIdx = this.selectedIndicatorIndex()[tabIndex];
    const indicator = tab.indicators[indIdx];
    return buildChartOption(d, indicator);
  }

  currentIndicator(tabIndex: number): IndicatorDef {
    const tab = this.tabs[tabIndex];
    return tab.indicators[this.selectedIndicatorIndex()[tabIndex]];
  }
}
