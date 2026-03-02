import { IsDateString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetBarometerDto {
  @ApiPropertyOptional({
    description: '查詢日期（YYYY-MM-DD），預設為今天',
    example: '2026-03-02',
  })
  @IsOptional()
  @IsDateString()
  date?: string;
}
