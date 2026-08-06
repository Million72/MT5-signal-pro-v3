import { detectHighTightFlag } from './highTightFlag';
import { noReversalGate } from './noReversalGate';
import { calculateConfidence } from './confidenceScore';

export function buildSignal(candles, config, index, symbol, name) {
  if (!candles || candles.length < 30) return null;

  const rawSignal = detectHighTightFlag(candles, config);
  if (!rawSignal) return null;

  const gateResult = noReversalGate(rawSignal, candles, config);
  if (!gateResult.passed) return null;

  const confidence = calculateConfidence(rawSignal, config);
  if (confidence < config.confidenceThreshold) return null;

  const risk = Math.abs(rawSignal.entry - rawSignal.stopLoss);
  const reward = Math.abs(rawSignal.takeProfit - rawSignal.entry);
  const rr = risk > 0 ? reward / risk : 0;

  return {
    id: `${symbol}-${Date.now()}`,
    symbol,
    index,
    name,
    type: rawSignal.type,
    direction: rawSignal.direction,
    pattern: rawSignal.pattern,
    entry: rawSignal.entry,
    stopLoss: rawSignal.stopLoss,
    takeProfit: rawSignal.takeProfit,
    riskReward: rr,
    confidence,
    gateResult,
    details: rawSignal.details,
    timestamp: Date.now(),
  };
}
