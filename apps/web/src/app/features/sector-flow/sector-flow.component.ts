import { Component, computed, inject, OnInit, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardStateService } from '../../core/services/dashboard-state.service';
import { TickerService } from '../../core/services/ticker.service';
import { SectorFlowStateService } from './sector-flow-state.service';
import { SectorRankingTableComponent } from './components/sector-ranking-table/sector-ranking-table.component';
import { SectorFlowChartsComponent } from './components/sector-flow-charts/sector-flow-charts.component';
import { KlineChartComponent } from '../dashboard/components/kline-chart/kline-chart.component';
import { toObservable } from '@angular/core/rxjs-interop';
import { switchMap, catchError, of } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-sector-flow',
  standalone: true,
  imports: [
    CommonModule,
    SectorRankingTableComponent,
    SectorFlowChartsComponent,
    KlineChartComponent,
  ],
  providers: [SectorFlowStateService],
  templateUrl: './sector-flow.component.html',
  styleUrl: './sector-flow.component.scss',
})
export class SectorFlowComponent implements OnInit {
  private dashState = inject(DashboardStateService);
  private tickerService = inject(TickerService);
  readonly state = inject(SectorFlowStateService);

  readonly rankingTable = viewChild(SectorRankingTableComponent);

  readonly selectedSymbol = this.state.selectedSymbol;
  readonly klineSymbol = this.state.klineSymbol;

  onKlineSymbolChange(value: string) {
    this.state.klineSymbol.set(value);
  }

  constructor() {
    toObservable(this.dashState.endDate)
      .pipe(
        switchMap(date => this.tickerService.getSectorFlow(date).pipe(catchError(() => of([])))),
        takeUntilDestroyed(),
      )
      .subscribe(rows => {
        this.rankingTable()?.setRows(rows);
        this.state.sectors.set(rows.map(r => ({ symbol: r.symbol, name: r.name })));
        if (rows.length) {
          const first = [...rows].sort((a, b) => b.changePercent - a.changePercent)[0];
          this.state.selectedSymbol.set(first.symbol);
          this.state.selectedName.set(first.name);
          this.state.klineSymbol.set(first.symbol);
        }
      });
  }

  ngOnInit() {}
}
