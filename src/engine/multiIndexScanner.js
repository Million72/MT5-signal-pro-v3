import { SYNTHETIC_MARKETS, ZERO_TOLERANCE_CONFIG } from '../config/synthetic';
import { buildSignal } from './signalBuilder';
import { prioritizeSignals } from './signalPrioritizer';

const lastSignalTime = { V5: 0, V10: 0, V25: 0, V75: 0, V100: 0 };

export function scanAllIndices(marketDataMap) {
  const rawSignals = [];
  const now = Date.now();

  for (const market of SYNTHETIC_MARKETS) {
    const data = marketDataMap[market.symbol];
    if (!data || !data.candles || data.candles.length < 30) continue;

    const config = ZERO_TOLERANCE_CONFIG[market.index];
    if (!config) continue;

    // Cooldown
    const cooldownMs = config.signalCooldown * 60 * 1000;
    if (now - lastSignalTime[market.index] < cooldownMs) continue;

    const signal = buildSignal(data.candles, config, market.index, market.symbol, market.name);

    if (signal) {
      rawSignals.push(signal);
      lastSignalTime[market.index] = now;
    }
  }

  return prioritizeSignals(rawSignals);
}
