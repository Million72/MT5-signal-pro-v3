import { calculateEMA } from '../indicators/ema';
import { calculateBollinger } from '../indicators/bollinger';
import { calculateRSI } from '../indicators/rsi';
import { avgCandleRange, detectImpulseCandles, closesNearExtreme } from '../indicators/candleRange';

export function detectHighTightFlag(candles, config) {
  if (candles.length < config.emaPeriod + 10) return null;

  const closes = candles.map(c => c.close);
  const ema20 = calculateEMA(closes, config.emaPeriod);
  const bollinger = calculateBollinger(candles, config.bollingerPeriod, config.bollingerStdDev);
  const rsi = calculateRSI(closes, config.rsiPeriod);

  const longSignal = detectBullishFlag(candles, ema20, bollinger, rsi, config);
  if (longSignal) return longSignal;

  const shortSignal = detectBearishFlag(candles, ema20, bollinger, rsi, config);
  return shortSignal;
}

function detectBullishFlag(candles, ema20, bollinger, rsi, config) {
  const impulseGroups = detectImpulseCandles(candles, 'bullish');
  if (impulseGroups.length === 0) return null;

  const pole = impulseGroups[0];
  if (pole.length < config.minPoleCandles || pole.length > config.maxPoleCandles) return null;

  const poleStart = pole[0].open;
  const poleEnd = pole[pole.length - 1].close;
  const poleHeight = poleEnd - poleStart;
  if (poleHeight <= 0) return null;

  const poleEndIndex = candles.indexOf(pole[pole.length - 1]);
  const remainingCandles = candles.slice(poleEndIndex + 1);

  if (remainingCandles.length < config.minPoleCandles || remainingCandles.length > 10) {
    return null;
  }

  // EMA check — flag must hold above EMA
  for (let j = 0; j < remainingCandles.length; j++) {
    const emaIdx = ema20.length - remainingCandles.length + j;
    const emaVal = ema20[emaIdx];
    if (!emaVal || remainingCandles[j].low <= emaVal) return null;
  }

  // Retrace check
  const flagHigh = Math.max(...remainingCandles.map(c => c.high));
  const flagLow = Math.min(...remainingCandles.map(c => c.low));
  const retracePercent = ((poleEnd - flagLow) / poleHeight) * 100;
  if (retracePercent > config.maxRetracePercent) return null;

  // Compression check
  const flagRanges = remainingCandles.map(c => Math.abs(c.high - c.low));
  const halfIdx = Math.floor(flagRanges.length / 2);
  const earlyAvg = flagRanges.slice(0, halfIdx).reduce((a, b) => a + b, 0) / halfIdx;
  const lateAvg = flagRanges.slice(halfIdx).reduce((a, b) => a + b, 0) / (flagRanges.length - halfIdx);
  if (lateAvg > earlyAvg * 0.8) return null;

  // RSI cool
  const lastRSI = rsi[rsi.length - 1];
  if (lastRSI === null || lastRSI > config.rsiResetMax) return null;

  // Bollinger squeeze
  const bbWidths = bollinger.bandwidth.filter(b => b !== null);
  if (bbWidths.length < config.minPoleCandles * 2) return null;
  const recentBB = bbWidths.slice(-config.minPoleCandles);
  const olderBB = bbWidths.slice(-config.minPoleCandles * 2, -config.minPoleCandles);
  const recentAvgBB = recentBB.reduce((a, b) => a + b, 0) / recentBB.length;
  const olderAvgBB = olderBB.reduce((a, b) => a + b, 0) / olderBB.length;
  if (recentAvgBB > olderAvgBB * config.squeezeThreshold) return null;

  // Breakout candle
  const breakoutCandle = candles[candles.length - 1];
  const avgFlagRange = avgCandleRange(remainingCandles);
  const breakoutRange = Math.abs(breakoutCandle.high - breakoutCandle.low);

  if (breakoutCandle.close <= flagHigh) return null;
  if (breakoutRange < avgFlagRange * config.breakoutRangeMultiplier) return null;

  const { bullish } = closesNearExtreme(breakoutCandle, 1 - config.breakoutClosePercent / 100);
  if (!bullish) return null;

  // Build signal
  const targetProjection = flagHigh + (poleHeight * 0.75);
  const tickSize = estimateTickSize(candles);
  const stopLevel = flagLow - tickSize;

  return {
    type: 'HIGH_TIGHT_FLAG',
    direction: 'BUY',
    pattern: 'Bullish High-Tight Flag',
    entry: breakoutCandle.close,
    stopLoss: stopLevel,
    takeProfit: targetProjection,
    details: {
      pole: { start: poleStart, end: poleEnd, height: poleHeight, candles: pole.length },
      flag: { high: flagHigh, low: flagLow, candles: remainingCandles.length, retracePercent },
      breakout: { price: breakoutCandle.close, range: breakoutRange, avgFlagRange },
      indicators: { ema: ema20[ema20.length - 1], rsi: lastRSI, bbWidth: recentAvgBB },
    },
  };
}

function detectBearishFlag(candles, ema20, bollinger, rsi, config) {
  const impulseGroups = detectImpulseCandles(candles, 'bearish');
  if (impulseGroups.length === 0) return null;

  const pole = impulseGroups[0];
  if (pole.length < config.minPoleCandles || pole.length > config.maxPoleCandles) return null;

  const poleStart = pole[0].open;
  const poleEnd = pole[pole.length - 1].close;
  const poleHeight = poleStart - poleEnd;
  if (poleHeight <= 0) return null;

  const poleEndIndex = candles.indexOf(pole[pole.length - 1]);
  const remainingCandles = candles.slice(poleEndIndex + 1);

  if (remainingCandles.length < config.minPoleCandles || remainingCandles.length > 10) {
    return null;
  }

  // EMA — flag must stay below
  for (let j = 0; j < remainingCandles.length; j++) {
    const emaIdx = ema20.length - remainingCandles.length + j;
    const emaVal = ema20[emaIdx];
    if (!emaVal || remainingCandles[j].high >= emaVal) return null;
  }

  const flagHigh = Math.max(...remainingCandles.map(c => c.high));
  const flagLow = Math.min(...remainingCandles.map(c => c.low));
  const retracePercent = ((flagHigh - poleEnd) / poleHeight) * 100;
  if (retracePercent > config.maxRetracePercent) return null;

  const flagRanges = remainingCandles.map(c => Math.abs(c.high - c.low));
  const halfIdx = Math.floor(flagRanges.length / 2);
  const earlyAvg = flagRanges.slice(0, halfIdx).reduce((a, b) => a + b, 0) / halfIdx;
  const lateAvg = flagRanges.slice(halfIdx).reduce((a, b) => a + b, 0) / (flagRanges.length - halfIdx);
  if (lateAvg > earlyAvg * 0.8) return null;

  const lastRSI = rsi[rsi.length - 1];
  if (lastRSI === null || lastRSI < (100 - config.rsiResetMax)) return null;

  const bbWidths = bollinger.bandwidth.filter(b => b !== null);
  if (bbWidths.length < config.minPoleCandles * 2) return null;
  const recentBB = bbWidths.slice(-config.minPoleCandles);
  const olderBB = bbWidths.slice(-config.minPoleCandles * 2, -config.minPoleCandles);
  const recentAvgBB = recentBB.reduce((a, b) => a + b, 0) / recentBB.length;
  const olderAvgBB = olderBB.reduce((a, b) => a + b, 0) / olderBB.length;
  if (recentAvgBB > olderAvgBB * config.squeezeThreshold) return null;

  const breakoutCandle = candles[candles.length - 1];
  const avgFlagRange = avgCandleRange(remainingCandles);
  const breakoutRange = Math.abs(breakoutCandle.high - breakoutCandle.low);

  if (breakoutCandle.close >= flagLow) return null;
  if (breakoutRange < avgFlagRange * config.breakoutRangeMultiplier) return null;

  const { bearish } = closesNearExtreme(breakoutCandle, 1 - config.breakoutClosePercent / 100);
  if (!bearish) return null;

  const targetProjection = flagLow - (poleHeight * 0.75);
  const tickSize = estimateTickSize(candles);
  const stopLevel = flagHigh + tickSize;

  return {
    type: 'HIGH_TIGHT_FLAG',
    direction: 'SELL',
    pattern: 'Bearish High-Tight Flag',
    entry: breakoutCandle.close,
    stopLoss: stopLevel,
    takeProfit: targetProjection,
    details: {
      pole: { start: poleStart, end: poleEnd, height: poleHeight, candles: pole.length },
      flag: { high: flagHigh, low: flagLow, candles: remainingCandles.length, retracePercent },
      breakout: { price: breakoutCandle.close, range: breakoutRange, avgFlagRange },
      indicators: { ema: ema20[ema20.length - 1], rsi: lastRSI, bbWidth: recentAvgBB },
    },
  };
}

function estimateTickSize(candles) {
  const ranges = candles.slice(-50).map(c => Math.abs(c.high - c.low));
  if (ranges.length === 0) return 0.01;
  return Math.min(...ranges) * 0.01 || 0.01;
}
