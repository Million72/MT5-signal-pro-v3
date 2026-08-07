export function calculateConfidence(signal, config) {
  if (!signal || !signal.details) return 0;

  const { pole, flag, breakout, indicators } = signal.details;
  let score = 30; // Start at base score

  // Pole quality (30%)
  if (pole.candles >= 4) score += 10;
  if (pole.candles >= 5) score += 5;
  score += Math.min(pole.height / 0.0001 * 5, 15);

  // Flag quality (30%)
  const retraceRatio = flag.retracePercent / config.maxRetracePercent;
  score += Math.max(0, 15 - retraceRatio * 15);
  if (flag.candles >= 4) score += 5;
  if (flag.candles >= 6) score += 5;
  if (flag.candles <= 10) score += 5;

  // Breakout quality (25%)
  const rangeRatio = breakout.range / (breakout.avgFlagRange || 0.0001);
  score += Math.min(rangeRatio * 3, 15);
  score += 10; // Breakout candle confirmed

  // RSI bonus (10%)
  if (indicators.rsi !== null) {
    if (signal.direction === 'BUY' && indicators.rsi < config.rsiResetMax) score += 5;
    if (signal.direction === 'SELL' && indicators.rsi > (100 - config.rsiResetMax)) score += 5;
  }

  // BB squeeze bonus (5%)
  if (indicators.bbWidth !== null && indicators.bbWidth > 0) score += 5;

  return Math.min(Math.round(score), 100);
}
