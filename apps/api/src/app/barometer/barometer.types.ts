export enum BarometerLevel {
  STRONG_BULL = 'STRONG_BULL',
  BULL = 'BULL',
  NEUTRAL = 'NEUTRAL',
  BEAR = 'BEAR',
  STRONG_BEAR = 'STRONG_BEAR',
}

export const BAROMETER_WEATHER: Record<BarometerLevel, string> = {
  [BarometerLevel.STRONG_BULL]: '☀️',
  [BarometerLevel.BULL]: '🌤',
  [BarometerLevel.NEUTRAL]: '⛅',
  [BarometerLevel.BEAR]: '🌧',
  [BarometerLevel.STRONG_BEAR]: '⛈',
};

export const BAROMETER_LABEL: Record<BarometerLevel, string> = {
  [BarometerLevel.STRONG_BULL]: '強多',
  [BarometerLevel.BULL]: '偏多',
  [BarometerLevel.NEUTRAL]: '中性',
  [BarometerLevel.BEAR]: '偏空',
  [BarometerLevel.STRONG_BEAR]: '強空',
};

export interface BarometerResult {
  date: string;
  level: BarometerLevel;
  weather: string;
  label: string;
  summary: string;
}
