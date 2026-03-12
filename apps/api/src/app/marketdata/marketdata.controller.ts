import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { DateTime } from 'luxon';
import { MarketStatsRepository } from './repositories/market-stats.repository';
import { TickerRepository } from './repositories/ticker.repository';
import { GetMarketStatsDto } from './dto/get-market-stats.dto';
import { GetTickerOhlcDto } from './dto/get-ticker-ohlc.dto';

@ApiTags('marketdata')
@Controller('marketdata')
export class MarketDataController {
  constructor(
    private readonly marketStatsRepository: MarketStatsRepository,
    private readonly tickerRepository: TickerRepository,
  ) {}

  @ApiOperation({ summary: '取得大盤籌碼資料' })
  @Get('market-stats')
  getMarketStats(@Query() query: GetMarketStatsDto) {
    return this.marketStatsRepository.getMarketStats({
      startDate: query.startDate ?? DateTime.local().minus({ months: 3 }).toISODate(),
      endDate: query.endDate ?? DateTime.local().toISODate(),
    });
  }

  @ApiOperation({ summary: '取得 Ticker OHLC 收盤行情' })
  @Get('tickers')
  getTickers(@Query() query: GetTickerOhlcDto) {
    return this.tickerRepository.getOhlcBySymbol({
      symbol: query.symbol,
      startDate: query.startDate,
      endDate: query.endDate,
    });
  }
}
