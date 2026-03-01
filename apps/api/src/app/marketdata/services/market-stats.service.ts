import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { DateTime } from 'luxon';
import { sumBy } from 'lodash';
import { TwStock } from 'node-twstock';
import { InjectTwStock } from 'nest-twstock';
import { MarketStatsRepository } from '../repositories/market-stats.repository';

@Injectable()
export class MarketStatsService {
  constructor(
    @InjectTwStock() private readonly twstock: TwStock,
    private readonly marketStatsRepository: MarketStatsRepository,
  ) {}

  async updateMarketStats(date: string = DateTime.local().toISODate()) {
    const updates = [
      this.updateTaiex,
      this.updateMarketTrades,
      this.updateInstInvestorsTrades,
      this.updateMarginTransactions,
      this.updateFiniTxfNetOi,
      this.updateFiniTxoNetOiValue,
      this.updateLargeTradersTxfNetOi,
      this.updateRetailMxfPosition,
      this.updateRetailTmfPosition,
      this.updateTxoPutCallRatio,
      this.updateUsdTwdRate,
    ];

    for (const update of updates) {
      await update.call(this, date);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }

    Logger.log(`${date} 大盤籌碼已更新`, MarketStatsService.name);
  }

  @Cron('0 0 15 * * *')
  async updateTaiex(date: string = DateTime.local().toISODate()) {
    const updated = await this.twstock.indices.historical({ date, exchange: 'TWSE', symbol: 'IX0001' })
      .then((data: any) => data && {
        date: data.date,
        taiexPrice: data.close,
        taiexChange: data.change,
      })
      .then(data => data && this.marketStatsRepository.updateMarketStats(data));

    if (updated) Logger.log(`${date} 集中市場加權指數: 已更新`, MarketStatsService.name);
    else Logger.warn(`${date} 集中市場加權指數: 尚無資料或非交易日`, MarketStatsService.name);
  }

  @Cron('0 15 15 * * *')
  async updateMarketTrades(date: string = DateTime.local().toISODate()) {
    const updated = await this.twstock.market.trades({ date, exchange: 'TWSE' })
      .then(data => data && {
        date: data.date,
        taiexTradeValue: data.tradeValue,
      })
      .then(data => data && this.marketStatsRepository.updateMarketStats(data));

    if (updated) Logger.log(`${date} 集中市場加權指數: 已更新`, MarketStatsService.name);
    else Logger.warn(`${date} 集中市場加權指數: 尚無資料或非交易日`, MarketStatsService.name);
  }

  @Cron('0 30 15 * * *')
  async updateInstInvestorsTrades(date: string = DateTime.local().toISODate()) {
    const updated = await this.twstock.market.institutional({ date, exchange: 'TWSE' })
      .then(data => data && {
        date: data.date,
        finiNetBuySell: sumBy(data.institutional.filter(row => ['外資及陸資(不含外資自營商)', '外資自營商'].includes(row.investor)), 'difference'),
        sitcNetBuySell: sumBy(data.institutional.filter(row => ['投信'].includes(row.investor)), 'difference'),
        dealersNetBuySell: sumBy(data.institutional.filter(row => ['自營商(自行買賣)', '自營商(避險)'].includes(row.investor)), 'difference'),
      })
      .then(data => data && this.marketStatsRepository.updateMarketStats(data));

    if (updated) Logger.log(`${date} 集中市場三大法人買賣超: 已更新`, MarketStatsService.name);
    else Logger.warn(`${date} 集中市場三大法人買賣超: 尚無資料或非交易日`, MarketStatsService.name);
  }

  @Cron('0 30 21 * * *')
  async updateMarginTransactions(date: string = DateTime.local().toISODate()) {
    const updated = await this.twstock.market.marginTrades({ date, exchange: 'TWSE' })
      .then(data => data && {
        date: data.date,
        marginBalance: data.marginBalanceValue,
        marginBalanceChange: data.marginBalanceValue - data.marginBalancePrevValue,
        shortBalance: data.shortBalance,
        shortBalanceChange: data.shortBalance - data.shortBalancePrev,
      })
      .then(data => data && this.marketStatsRepository.updateMarketStats(data));

    if (updated) Logger.log(`${date} 集中市場信用交易: 已更新`, MarketStatsService.name);
    else Logger.warn(`${date} 集中市場信用交易: 尚無資料或非交易日`, MarketStatsService.name);
  }

  @Cron('0 0 15 * * *')
  async updateFiniTxfNetOi(date: string = DateTime.local().toISODate()) {
    const updated = await this.twstock.futopt.institutional({ date, symbol: 'TXF' })
      .then(data => data && {
        date: data.date,
        finiTxfNetOi: data.institutional.find(row => row.investor === '外資及陸資').netOiVolume,
      })
      .then(data => data && this.marketStatsRepository.updateMarketStats(data));

    if (updated) Logger.log(`${date} 外資臺股期貨未平倉淨口數: 已更新`, MarketStatsService.name);
    else Logger.warn(`${date} 外資臺股期貨未平倉淨口數: 尚無資料或非交易日`, MarketStatsService.name);
  }

  @Cron('5 0 15 * * *')
  async updateFiniTxoNetOiValue(date: string = DateTime.local().toISODate()) {
    const updated = await this.twstock.futopt.institutional({ date, symbol: 'TXO' })
      .then((data: any) => data && {
        date: data.date,
        finiTxoCallsNetOiValue: data.institutional.find(row => row.type === 'CALL' && row.investor === '外資及陸資').netOiValue,
        finiTxoPutsNetOiValue: data.institutional.find(row => row.type === 'PUT' && row.investor === '外資及陸資').netOiValue,
      })
      .then(data => data && this.marketStatsRepository.updateMarketStats(data));

    if (updated) Logger.log(`${date} 外資臺指選擇權未平倉淨金額: 已更新`, MarketStatsService.name);
    else Logger.warn(`${date} 外資臺指選擇權未平倉淨金額: 尚無資料或非交易日`, MarketStatsService.name);
  }

  @Cron('10 0 15 * * *')
  async updateLargeTradersTxfNetOi(date: string = DateTime.local().toISODate()) {
    const updated = await this.twstock.futopt.largeTraders({ date, symbol: 'TXF' })
      .then(data => {
        if (!data) return;
        const specificFrontMonth = data.largeTraders.find(row => row.traderType === '1' && !['666666', '999999'].includes(row.contractMonth));
        const specificAllMonths = data.largeTraders.find(row => row.traderType === '1' && row.contractMonth === '999999');
        return data && {
          date: data.date,
          topTenSpecificFrontMonthTxfNetOi: specificFrontMonth.topTenLongOi - specificFrontMonth.topTenShortOi,
          topTenSpecificBackMonthsTxfNetOi: (specificAllMonths.topTenLongOi - specificFrontMonth.topTenLongOi) - (specificAllMonths.topTenShortOi - specificFrontMonth.topTenShortOi),
        };
      })
      .then(data => data && this.marketStatsRepository.updateMarketStats(data));

    if (updated) Logger.log(`${date} 十大特法臺股期貨未平倉淨口數: 已更新`, MarketStatsService.name);
    else Logger.warn(`${date} 十大特法臺股期貨未平倉淨口數: 尚無資料或非交易日`, MarketStatsService.name);
  }

  @Cron('15 0 15 * * *')
  async updateRetailMxfPosition(date: string = DateTime.local().toISODate()) {
    const updated = await this.twstock.futopt.mxfRetailPosition({ date })
      .then(data => data && {
        date: data.date,
        retailMxfNetOi: data.mxfRetailNetOi,
        retailMxfLongShortRatio: data.mxfRetailLongShortRatio,
      })
      .then(data => data && this.marketStatsRepository.updateMarketStats(data));

    if (updated) Logger.log(`${date} 散戶小台淨部位: 已更新`, MarketStatsService.name);
    else Logger.warn(`${date} 散戶小台淨部位: 尚無資料或非交易日`, MarketStatsService.name);
  }

  @Cron('20 0 15 * * *')
  async updateRetailTmfPosition(date: string = DateTime.local().toISODate()) {
    const updated = await this.twstock.futopt.tmfRetailPosition({ date })
      .then(data => data && {
        date: data.date,
        retailTmfNetOi: data.tmfRetailNetOi,
        retailTmfLongShortRatio: data.tmfRetailLongShortRatio,
      })
      .then(data => data && this.marketStatsRepository.updateMarketStats(data));

    if (updated) Logger.log(`${date} 散戶微台淨部位: 已更新`, MarketStatsService.name);
    else Logger.warn(`${date} 散戶微台淨部位: 尚無資料或非交易日`, MarketStatsService.name);
  }

  @Cron('20 0 15 * * *')
  async updateTxoPutCallRatio(date: string = DateTime.local().toISODate()) {
    const updated = await this.twstock.futopt.txoPutCallRatio({ date })
      .then(data => data && {
        date: data.date,
        txoPutCallRatio: data.txoPutCallOiRatio,
      })
      .then(data => data && this.marketStatsRepository.updateMarketStats(data));

    if (updated) Logger.log(`${date} 臺指選擇權 Put/Call Ratio: 已更新`, MarketStatsService.name);
    else Logger.warn(`${date} 臺指選擇權 Put/Call Ratio: 尚無資料或非交易日`, MarketStatsService.name);
  }

  @Cron('0 0 17 * * *')
  async updateUsdTwdRate(date: string = DateTime.local().toISODate()) {
    const updated = await this.twstock.futopt.exchangeRates({ date })
      .then(data => data && {
        date: data.date,
        usdtwd: data.usdtwd,
      })
      .then(data => data && this.marketStatsRepository.updateMarketStats(data));

    if (updated) Logger.log(`${date} 美元兌新臺幣匯率: 已更新`, MarketStatsService.name);
    else Logger.warn(`${date} 美元兌新臺幣匯率: 尚無資料或非交易日`, MarketStatsService.name);
  }
}
