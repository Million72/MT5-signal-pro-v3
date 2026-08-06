export function avgCandleRange(candles, period = 5) {
  if (candles.length < period) return 0;
  const window = candles.slice(-period);
  const sum = window.reduce((acc, c) => acc + Math.abs(c.high - c.low), 0);
  return sum / period;
}

export function avgBodySize(candles, period = 5) {
  if (candles.length < period) return 0;
  const window = candles.slice(-period);
  const sum = window.reduce((acc, c) => acc + Math.abs(c.close - c.open), 0);
  return sum / period;
}

export function isRangeExpanding(candles, lookback = 3) {
  if (candles.length < lookback + 1) return false;
  const current = Math.abs(candles[candles.length - 1].high - candles[candles.length - 1].low);
  const prev = candles.slice(-lookback - 1, -1).map(c => Math.abs(c.high - c.low));
  return current > Math.max(...prev);
}

export function closesNearExtreme(candle, threshold = 0.2) {
  const range = candle.high - candle.low;
  if (range === 0) return { bullish: false, bearish: false };

  const upperWick = candle.high - Math.max(candle.open, candle.close);
  const lowerWick = Math.min(candle.open, candle.close) - candle.low;

  return {
    bullish: upperWick / range < threshold,
    bearish: lowerWick / range < threshold,
  };
}

export function detectImpulseCandles(candles, direction = 'bullish') {
  if (candles.length < 3) return [];

  const impulses = [];
  let sequence = [];

  for (let i = candles.length - 1; i >= 0; i--) {
    const candle = candles[i];
    const isCorrectDirection = direction === 'bullish'
      ? candle.close > candle.open
      : candle.close < candle.open;
    const { bullish, bearish } = closesNearExtreme(candle);
    const strongClose = direction === 'bullish' ? bullish : bearish;
    const expanding = isRangeExpanding(candles.slice(0, i + 1), 3);

    if (isCorrectDirection && strongClose && expanding) {
      sequence.unshift(candle);
    } else if (sequence.length >= 3) {
      impulses.push([...sequence]);
      sequence = [];
    } else {
      sequence = [];
    }
  }

  if (sequence.length >= 3) impulses.push([...sequence]);
  return impulses;
}

export function getCandleRange(candle) {
  return Math.abs(candle.high - candle.low);
}

export function getCandleBody(candle) {
  return Math.abs(candle.close - candle.open);
  }
