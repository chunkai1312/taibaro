import { IsDateString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetSectorFlowDto {
  @ApiPropertyOptional({
    description: '查詢日期 (YYYY-MM-DD)，預設為今日',
    example: '2026-03-13',
  })
  @IsOptional()
  @IsDateString()
  date?: string;
}
