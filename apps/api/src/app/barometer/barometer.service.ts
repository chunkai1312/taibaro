import { Injectable, Logger, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { DateTime } from 'luxon';
import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { MarketStatsRepository } from '../marketdata/repositories/market-stats.repository';
import { BAROMETER_LABEL, BAROMETER_WEATHER, BarometerLevel, BarometerResult } from './barometer.types';
import { BarometerOutputSchema } from './barometer.schema';
import { SYSTEM_PROMPT, buildUserMessage, TechContext } from './barometer.prompt';

@Injectable()
export class BarometerService {
  private readonly logger = new Logger(BarometerService.name);

  constructor(
    private readonly marketStatsRepository: MarketStatsRepository,
  ) {}

  async generateAnalysis(date: string = DateTime.local().toISODate()): Promise<BarometerResult> {
    // 1. 取當日資料，不存在則回傳 404
    const [todayStats] = await this.marketStatsRepository.getMarketStats({
      startDate: date,
      endDate: date,
    });

    if (!todayStats) {
      throw new NotFoundException(`找不到 ${date} 的市場數據`);
    }

    // 2. 快取命中直接回傳
    if (todayStats.aiAnalysis) {
      this.logger.log(`${date} 晴雨表：命中快取`);
      return {
        date,
        level: todayStats.aiAnalysis.level as BarometerLevel,
        weather: todayStats.aiAnalysis.weather,
        label: todayStats.aiAnalysis.label,
        summary: todayStats.aiAnalysis.summary,
      };
    }

    // 3. 取前一交易日資料（用於趨勢對比）及歷史資料（用於計算技術指標）
    const prevDateStr = DateTime.fromISO(date).minus({ days: 30 }).toISODate();
    const recentStats = await this.marketStatsRepository.getMarketStats({
      startDate: prevDateStr,
      endDate: date,
    });
    const prevStats = [...recentStats].reverse().find(s => s.date < date) ?? null;
    const historicalStats = recentStats.filter(s => s.date < date);
    const techContext = this.computeTechContext(historicalStats, todayStats);

    // 4. 呼叫 LLM
    try {
      const model = new ChatOpenAI({
        model: 'gpt-4o-mini',
        temperature: 0,
      }).withStructuredOutput(BarometerOutputSchema);

      const result = await model.invoke([
        new SystemMessage(SYSTEM_PROMPT),
        new HumanMessage(buildUserMessage(todayStats, prevStats, techContext)),
      ]);

      const level = result.level as BarometerLevel;
      const aiAnalysis = {
        level,
        weather: BAROMETER_WEATHER[level],
        label: BAROMETER_LABEL[level],
        summary: result.summary,
      };

      // 5. 寫入快取
      await this.marketStatsRepository.updateMarketStats({ date, aiAnalysis });
      this.logger.log(`${date} 晴雨表：分析完成，等級 ${level}`);

      return { date, ...aiAnalysis };
    } catch (error) {
      this.logger.error(`${date} 晴雨表：LLM 呼叫失敗`, error?.message);
      throw new ServiceUnavailableException('晴雨表分析服務暫時無法使用，請稍後再試');
    }
  }

  private computeTechContext(historicalStats: Record<string, any>[], todayStats: Record<string, any>): TechContext {
    const sorted = [...historicalStats].sort((a, b) => b.date.localeCompare(a.date));
    const prices = [todayStats.taiexPrice, ...sorted.map(s => s.taiexPrice)].filter((p): p is number => p != null);
    const volumes = [todayStats.taiexTradeValue, ...sorted.map(s => s.taiexTradeValue)].filter((v): v is number => v != null);

    const avg = (arr: number[]) => arr.reduce((sum, v) => sum + v, 0) / arr.length;

    const taiex5MA = prices.length >= 5 ? Math.round(avg(prices.slice(0, 5))) : null;
    const taiex20MA = prices.length >= 20 ? Math.round(avg(prices.slice(0, 20))) : null;
    const tradeValue5MA = volumes.length >= 5 ? Math.round(avg(volumes.slice(0, 5))) : null;
    const volumeRatio =
      tradeValue5MA != null && todayStats.taiexTradeValue != null
        ? Math.round((todayStats.taiexTradeValue / tradeValue5MA) * 100) / 100
        : null;

    return { taiex5MA, taiex20MA, tradeValue5MA, volumeRatio };
  }

  @Cron('0 0 17 * * *')
  async scheduledAnalysis() {
    const date = DateTime.local().toISODate();
    this.logger.log(`排程執行晴雨表分析 ${date}`);
    try {
      await this.generateAnalysis(date);
      this.logger.log(`排程晴雨表分析 ${date} 完成`);
    } catch (error) {
      this.logger.error(`排程晴雨表分析 ${date} 失敗：${error?.message}`);
    }
  }
}
