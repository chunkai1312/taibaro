import { Module, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { MongooseModule } from '@nestjs/mongoose';
import { DateTime } from 'luxon';
import { MarketDataModule } from './marketdata/marketdata.module';
import { MarketStatsService } from './marketdata/services/market-stats.service';
import { TickerService } from './marketdata/services/ticker.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ScheduleModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGODB_URI),
    MarketDataModule,
  ]
})
export class AppModule implements OnApplicationBootstrap {
  constructor(
    private readonly marketStatsService: MarketStatsService,
    private readonly tickerService: TickerService
  ) {}

  async onApplicationBootstrap() {
    if (process.env.MARKETDATA_INIT_ENABLED === 'true') {
      Logger.log('正在初始化應用程式...', AppModule.name);

      // const days = parseInt(process.env.MARKETDATA_INIT_DAYS, 10) || 30;
      // const startDate = DateTime.local().minus({ days });
      const startDate = DateTime.fromFormat('2025-01-01', 'yyyy-MM-dd');
      const endDate = DateTime.local();

      for (let dt = startDate; dt <= endDate; dt = dt.plus({ day: 1 })) {
        await this.marketStatsService.updateMarketStats(dt.toISODate());
        // await this.tickerService.updateTickers(dt.toISODate());
      }

      Logger.log('應用程式初始化完成', AppModule.name);
    }
  }
}
