import { IsDateString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetMarketStatsDto {
  @ApiPropertyOptional({
    description: '開始日期 (YYYY-MM-DD)，預設為 3 個月前',
    example: '2025-01-01',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: '結束日期 (YYYY-MM-DD)，預設為今日',
    example: '2025-12-31',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
