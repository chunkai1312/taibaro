import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TwStockModule } from 'nest-twstock';
import { MarketStats, MarketStatsSchema } from './schemas/market-stats.schema';
import { Ticker, TickerSchema } from './schemas/ticker.schema';
import { MarketStatsRepository } from './repositories/market-stats.repository';
import { TickerRepository } from './repositories/ticker.repository';
import { MarketStatsService } from './services/market-stats.service';
import { TickerService } from './services/ticker.service';
import { MarketDataController } from './marketdata.controller';


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MarketStats.name, schema: MarketStatsSchema },
      { name: Ticker.name, schema: TickerSchema },
    ]),
    TwStockModule.register(),
  ],
  controllers: [
    MarketDataController,
  ],
  providers: [
    MarketStatsRepository,
    MarketStatsService,
    TickerRepository,
    TickerService,
  ],
  exports: [
    MarketStatsRepository,
    MarketStatsService,
    TickerRepository,
    TickerService,
  ],
})
export class MarketDataModule {}
