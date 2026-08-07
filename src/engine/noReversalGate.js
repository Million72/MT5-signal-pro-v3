export function noReversalGate(signal, candles, config) {
  if (!signal) return { passed: false, reason: 'No signal' };

  const breakoutCandle = candles[candles.length - 1];
  const range = breakoutCandle.high - breakoutCandle.low;
  if (range === 0) return { passed: false, reason: 'Zero range breakout' };

  // Gate 1: No wick on breakout (real-time: check the candle that just closed)
  if (signal.direction === 'BUY') {
    const upperWick = breakoutCandle.high - breakoutCandle.close;
    if (upperWick / range > 0.10) { // Relaxed: 10% wick allowed
      return { passed: false, reason: 'Upper wick detected — sellers active' };
    }
  } else {
    const lowerWick = breakoutCandle.close - breakoutCandle.low;
    if (lowerWick / range > 0.10) {
      return { passed: false, reason: 'Lower wick detected — buyers active' };
    }
  }

  // Gate 2: Breakout candle must close beyond flag (already checked in highTightFlag)
  // No follow-through required for real-time — that's the NEXT candle

  // Gate 3: Flag clearance
  const flagHigh = signal.details.flag.high;
  const flagLow = signal.details.flag.low;
  const flagHeight = flagHigh - flagLow;
  
  if (signal.direction === 'BUY') {
    const clearance = breakoutCandle.close - flagHigh;
    if (clearance < flagHeight * 0.15) { // Relaxed: 15% of flag height
      return { passed: false, reason: 'Insufficient flag clearance' };
    }
  } else {
    const clearance = flagLow - breakoutCandle.close;
    if (clearance < flagHeight * 0.15) {
      return { passed: false, reason: 'Insufficient flag clearance' };
    }
  }

  // Gate 4: Candle direction — just the breakout candle
  if (signal.direction === 'BUY' && breakoutCandle.close <= breakoutCandle.open) {
    return { passed: false, reason: 'Breakout candle not bullish' };
  }
  if (signal.direction === 'SELL' && breakoutCandle.close >= breakoutCandle.open) {
    return { passed: false, reason: 'Breakout candle not bearish' };
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

  // Gate 7: Entry not too far from breakout
  if (signal.direction === 'BUY' && signal.entry > breakoutCandle.high * 1.03) {
    return { passed: false, reason: 'Entry too far from breakout' };
  }
  if (signal.direction === 'SELL' && signal.entry < breakoutCandle.low * 0.97) {
    return { passed: false, reason: 'Entry too far from breakout' };
  }

  return {
    passed: true,
    gatesPassed: 7,
    rating: 'ZERO-TOLERANCE',
  };
}
