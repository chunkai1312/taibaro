import { Module } from '@nestjs/common';
import { MarketDataModule } from '../marketdata/marketdata.module';
import { BarometerService } from './barometer.service';
import { BarometerController } from './barometer.controller';

@Module({
  imports: [MarketDataModule],
  controllers: [BarometerController],
  providers: [BarometerService],
})
export class BarometerModule {}
