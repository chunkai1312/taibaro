import { IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GetTickerOhlcDto {
  @ApiProperty({
    description: 'Ticker symbol（如 IX0001）',
    example: 'IX0001',
  })
  @IsNotEmpty()
  @IsString()
  symbol: string;

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
