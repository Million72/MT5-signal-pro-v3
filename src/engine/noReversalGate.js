export function noReversalGate(signal, candles, config) {
  if (!signal) return { passed: false, reason: 'No signal' };

  // Gate 1: No wick on breakout
  const breakoutCandle = candles[candles.length - 1];
  const range = breakoutCandle.high - breakoutCandle.low;
  if (range === 0) return { passed: false, reason: 'Zero range breakout' };

  if (signal.direction === 'BUY') {
    const upperWick = breakoutCandle.high - breakoutCandle.close;
    if (upperWick / range > 0.05) {
      return { passed: false, reason: 'Upper wick detected — sellers active' };
    }
  } else {
    const lowerWick = breakoutCandle.close - breakoutCandle.low;
    if (lowerWick / range > 0.05) {
      return { passed: false, reason: 'Lower wick detected — buyers active' };
    }
  }

  // Gate 2: Follow-through candle
  if (candles.length < 2) return { passed: false, reason: 'Insufficient data' };
  const followCandle = candles[candles.length - 2];
  if (signal.direction === 'BUY' && followCandle.close <= followCandle.open) {
    return { passed: false, reason: 'No bullish follow-through' };
  }
  if (signal.direction === 'SELL' && followCandle.close >= followCandle.open) {
    return { passed: false, reason: 'No bearish follow-through' };
  }

  // Gate 3: Flag clearance
  const flagHigh = signal.details.flag.high;
  const flagLow = signal.details.flag.low;
  const flagHeight = flagHigh - flagLow;
  if (signal.direction === 'BUY') {
    const clearance = breakoutCandle.close - flagHigh;
    if (clearance < flagHeight * 0.3) {
      return { passed: false, reason: 'Insufficient flag clearance' };
    }
  } else {
    const clearance = flagLow - breakoutCandle.close;
    if (clearance < flagHeight * 0.3) {
      return { passed: false, reason: 'Insufficient flag clearance' };
    }
  }

  // Gate 4: Consecutive directional candles
  const count = config.consecutiveBullishCandles;
  const recent = candles.slice(-count);
  if (signal.direction === 'BUY') {
    if (!recent.every(c => c.close > c.open)) {
      return { passed: false, reason: 'Intermittent red candles' };
    }
  } else {
    if (!recent.every(c => c.close < c.open)) {
      return { passed: false, reason: 'Intermittent green candles' };
    }
  }

  // Gate 5: Explosive range
  const avgFlagRange = signal.details.breakout.avgFlagRange;
  const breakoutRange = signal.details.breakout.range;
  if (breakoutRange < avgFlagRange * config.breakoutRangeMultiplier) {
    return { passed: false, reason: 'Breakout lacks explosive range' };
  }

  // Gate 6: RR check
  const risk = Math.abs(signal.entry - signal.stopLoss);
  const reward = Math.abs(signal.takeProfit - signal.entry);
  if (risk === 0) return { passed: false, reason: 'Zero risk' };
  const rr = reward / risk;
  if (rr < config.minRRRatio) {
    return { passed: false, reason: `RR ${rr.toFixed(1)} below ${config.minRRRatio}` };
  }

  // Gate 7: Entry not far from breakout
  if (signal.direction === 'BUY' && signal.entry > breakoutCandle.high * 1.02) {
    return { passed: false, reason: 'Entry too far from breakout' };
  }
  if (signal.direction === 'SELL' && signal.entry < breakoutCandle.low * 0.98) {
    return { passed: false, reason: 'Entry too far from breakout' };
  }

  // All gates passed
  return {
    passed: true,
    gatesPassed: 7,
    rating: 'ZERO-TOLERANCE',
  };
}
