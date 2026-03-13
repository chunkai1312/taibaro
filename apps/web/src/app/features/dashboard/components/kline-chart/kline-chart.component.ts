import { Component, computed, inject, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { Subject, switchMap, catchError, of, takeUntil } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';
import type { EChartsOption } from 'echarts';

import { DateTime } from 'luxon';
import { DashboardStateService, TimeRange, RANGE_MONTHS } from '../../../../core/services/dashboard-state.service';
import { TickerService } from '../../../../core/services/ticker.service';
import { TickerOhlc } from '../../../../core/models/ticker-ohlc.model';
import { IndicatorChartComponent } from '../trend-chart/indicator-chart/indicator-chart.component';

const BULL_COLOR = '#EF4444';
const BEAR_COLOR = '#22C55E';

const MA_DEFS: { period: number; color: string }[] = [
  { period: 5,   color: '#FBBF24' },  // 琥珀黃
  { period: 10,  color: '#F97316' },  // 橙（避開 BULL_COLOR）
  { period: 20,  color: '#A78BFA' },  // 淺紫
  { period: 60,  color: '#22D3EE' },  // 青藍（避開 BEAR_COLOR）
  { period: 120, color: '#EC4899' },  // 粉紅
  { period: 240, color: '#A3E635' },  // 黃綠
];

function calcMa(period: number, closes: number[]): (number | null)[] {
  return closes.map((_, i) => {
    if (i < period - 1) return null;
    const sum = closes.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
    return +( sum / period).toFixed(2);
  });
}

function buildKlineOption(
  displayData: TickerOhlc[],
  allData: TickerOhlc[],
  onHover?: (idx: number) => void,
): EChartsOption {
  // MA 用全量資料算，避免 slice 後前段出現 null warmup 缺口
  const allCloses = allData.map(d => d.closePrice);
  const displayOffset = allData.length - displayData.length;

  const dates = displayData.map(d => d.date);
  const closes = displayData.map(d => d.closePrice);
  const ohlc = displayData.map(d => [d.openPrice, d.closePrice, d.lowPrice, d.highPrice]);
  const volumes = displayData.map(d => ({
    value: +(d.tradeValue / 1e8).toFixed(2),
    itemStyle: { color: d.closePrice >= d.openPrice ? BULL_COLOR : BEAR_COLOR },
  }));

  const maSeries = MA_DEFS.map(({ period, color }) => ({
    name: `MA${period}`,
    type: 'line' as const,
    xAxisIndex: 0,
    yAxisIndex: 0,
    data: calcMa(period, allCloses).slice(displayOffset),
    smooth: false,
    symbol: 'none',
    lineStyle: { width: 1.5, color },
    itemStyle: { color },
  }));

  return {
    animation: false,
    backgroundColor: 'transparent',
    legend: { show: false },
    grid: [
      { left: '80px', right: '20px', top: '40px', bottom: '60px' },
    ],
    xAxis: [
      {
        type: 'category', data: dates, gridIndex: 0,
        boundaryGap: true,
        axisLabel: { fontSize: 11, formatter: (v: string) => v.substring(5), rotate: 30 },
      },
    ],
    yAxis: [
      {
        type: 'value', gridIndex: 0, scale: true, splitNumber: 4,
        position: 'left',
        axisLabel: { fontSize: 11, formatter: (v: number) => v.toLocaleString('zh-TW') },
      },
      {
        type: 'value', gridIndex: 0, splitNumber: 2,
        position: 'right',
        max: (v: { max: number }) => v.max * 5,
        axisLabel: { show: false },
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { show: false },
        axisPointer: { show: false },
      },
    ],
    dataZoom: [],
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'line' },
      formatter: (params: any) => {
        const date = params[0]?.axisValue ?? '';
        const k = params.find((p: any) => p.seriesName === '加權指數');
        const v = params.find((p: any) => p.seriesName === '成交金額');
        if (!k) return date;

        const raw = (k.data ?? k.value) as number[];
        const [o, c, l, h] = raw.length === 5 ? raw.slice(1) : raw;
        const idx = k.dataIndex as number;
        onHover?.(idx);
        const prevClose = idx > 0 ? displayData[idx - 1].closePrice : o;
        const change = +(c - prevClose).toFixed(2);
        const pct = +((change / prevClose) * 100).toFixed(2);
        const color = change >= 0 ? BULL_COLOR : BEAR_COLOR;
        const sign = change >= 0 ? '+' : '';
        const changeLabel = change >= 0 ? '漲:' : '跌:';

        const row = (label: string, value: string, valColor?: string) =>
          `<tr><td style="color:var(--text-secondary);padding-right:12px">${label}</td>` +
          `<td style="text-align:right;color:${valColor ?? 'inherit'};font-weight:600">${value}</td></tr>`;

        let html = `<div style="font-size:12px;font-weight:700;margin-bottom:6px">${date}</div>`;
        const priceColor = (val: number) => val > prevClose ? BULL_COLOR : val < prevClose ? BEAR_COLOR : 'inherit';
        html += `<table style="border-collapse:collapse;font-size:12px">`;
        html += row('開:', o.toLocaleString('zh-TW'), priceColor(o));
        html += row('高:', h.toLocaleString('zh-TW'), priceColor(h));
        html += row('低:', l.toLocaleString('zh-TW'), priceColor(l));
        html += row('收:', c.toLocaleString('zh-TW'), priceColor(c));
        html += row(changeLabel, `${sign}${change.toLocaleString('zh-TW')}`, color);
        html += row('幅:', `${sign}${pct}%`, color);
        if (v) html += row('量:', `${v.value.toLocaleString('zh-TW')} 億元`);
        html += `</table>`;
        return html;
      },
    },
    series: [
      {
        name: '加權指數',
        type: 'candlestick',
        xAxisIndex: 0,
        yAxisIndex: 0,
        data: ohlc,
        itemStyle: {
          color: BULL_COLOR,
          color0: BEAR_COLOR,
          borderColor: BULL_COLOR,
          borderColor0: BEAR_COLOR,
        },
      },
      ...maSeries,
      {
        name: '成交金額',
        type: 'bar',
        xAxisIndex: 0,
        yAxisIndex: 1,
        data: volumes,
        barMaxWidth: 8,
        z: 1,
      },
    ],
  };
}

@Component({
  selector: 'app-kline-chart',
  standalone: true,
  imports: [CommonModule, MatCardModule, IndicatorChartComponent],
  templateUrl: './kline-chart.component.html',
  styleUrl: './kline-chart.component.scss',
})
export class KlineChartComponent implements OnDestroy {
  private state = inject(DashboardStateService);
  private tickerService = inject(TickerService);
  private destroy$ = new Subject<void>();

  readonly maDefs = MA_DEFS;
  readonly localRange = signal<TimeRange>('3M');
  readonly ranges: TimeRange[] = ['1M', '3M', '6M', '1Y'];

  readonly rawData = signal<TickerOhlc[]>([]);
  readonly hoveredIndex = signal<number | null>(null);

  readonly filteredData = computed<TickerOhlc[]>(() => {
    const data = this.rawData();
    if (!data.length) return data;
    const end = this.state.endDate();
    const months = RANGE_MONTHS[this.localRange()];
    const cutoff = DateTime.fromISO(end).minus({ months }).toISODate() ?? '';
    return data.filter(d => d.date >= cutoff);
  });

  // 預先計算各 MA 序列（顯示區間的完整陣列）
  readonly maData = computed<(number | null)[][]>(() => {
    const display = this.filteredData();
    const all = this.rawData();
    if (!display.length || !all.length) return MA_DEFS.map(() => []);
    const allCloses = all.map(d => d.closePrice);
    const offset = all.length - display.length;
    return MA_DEFS.map(({ period }) => calcMa(period, allCloses).slice(offset));
  });

  // 目前要顯示的 MA 值（hover 中的 bar 或最後一根）
  readonly displayMaValues = computed<(number | null)[]>(() => {
    const maData = this.maData();
    const len = this.filteredData().length;
    if (!len) return MA_DEFS.map(() => null);
    const idx = this.hoveredIndex() ?? (len - 1);
    return maData.map(series => series[idx] ?? null);
  });

  readonly chartOption = computed<EChartsOption | null>(() => {
    const display = this.filteredData();
    const all = this.rawData();
    if (!display.length) return null;
    return buildKlineOption(display, all, (idx) => this.hoveredIndex.set(idx));
  });

  setLocalRange(range: TimeRange) {
    this.localRange.set(range);
  }

  resetHover() {
    this.hoveredIndex.set(null);
  }

  constructor() {
    toObservable(this.state.endDate)
      .pipe(
        switchMap((end) => {
          const start = DateTime.fromISO(end).minus({ months: 12 }).toISODate() ?? '';
          return this.tickerService.getTicker('IX0001', start, end).pipe(
            catchError(() => of([] as TickerOhlc[]))
          );
        }),
        takeUntil(this.destroy$)
      )
      .subscribe(data => this.rawData.set(data));
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
