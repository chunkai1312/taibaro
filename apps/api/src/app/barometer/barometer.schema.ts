import { z } from 'zod';
import { BarometerLevel } from './barometer.types';

export const BarometerOutputSchema = z.object({
  level: z.enum([
    BarometerLevel.STRONG_BULL,
    BarometerLevel.BULL,
    BarometerLevel.NEUTRAL,
    BarometerLevel.BEAR,
    BarometerLevel.STRONG_BEAR,
  ]).describe('晴雨等級：STRONG_BULL / BULL / NEUTRAL / BEAR / STRONG_BEAR'),
  summary: z.string()
    .describe('約 300 字的繁體中文盤勢摘要，須提及趨勢變化，禁止確定性預測'),
});

export type BarometerOutput = z.infer<typeof BarometerOutputSchema>;
