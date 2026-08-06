export function calculateConfidence(signal, config) {
  if (!signal || !signal.details) return 0;

  const { pole, flag, breakout, indicators } = signal.details;
  let score = 0;

  // Pole quality (30%)
  const poleScore = Math.min(pole.candles / config.minPoleCandles, 1.5) * 20;
  const poleHeightBonus = pole.height > 0 ? Math.min(pole.height / 0.001, 10) : 0;
  score += Math.min(poleScore + poleHeightBonus, 30);

  // Flag quality (35%)
  const retraceRatio = flag.retracePercent / config.maxRetracePercent;
  const retraceScore = Math.max(0, 20 - retraceRatio * 20);
  const compressionScore = flag.candles >= 4 && flag.candles <= 7 ? 15 : 10;
  score += Math.min(retraceScore + compressionScore, 35);

  // Breakout quality (25%)
  const rangeRatio = breakout.range / (breakout.avgFlagRange || 0.0001);
  const breakoutScore = Math.min(rangeRatio / config.breakoutRangeMultiplier * 15, 15);
  const followScore = 10; // Already confirmed by gate
  score += Math.min(breakoutScore + followScore, 25);

  // Market context (10%)
  const rsiScore = signal.direction === 'BUY'
    ? Math.max(0, (config.rsiResetMax - indicators.rsi) / config.rsiResetMax * 10)
    : Math.max(0, (indicators.rsi - (100 - config.rsiResetMax)) / config.rsiResetMax * 10);
  score += Math.min(rsiScore, 10);

  return Math.min(Math.round(score), 100);
}
