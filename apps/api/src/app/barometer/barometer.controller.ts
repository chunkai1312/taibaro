import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { DateTime } from 'luxon';
import { BarometerService } from './barometer.service';
import { GetBarometerDto } from './dto/get-barometer.dto';

@ApiTags('marketdata')
@Controller('marketdata')
export class BarometerController {
  constructor(private readonly barometerService: BarometerService) {}

  @ApiOperation({ summary: '取得每日台股晴雨表分析' })
  @Get('barometer')
  getBarometer(@Query() query: GetBarometerDto) {
    const date = query.date ?? DateTime.local().toISODate();
    return this.barometerService.generateAnalysis(date);
  }
}
