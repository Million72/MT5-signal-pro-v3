export function calculateBollinger(candles, period = 20, stdDev = 2) {
  if (candles.length < period) {
    return {
      upper: new Array(candles.length).fill(null),
      middle: new Array(candles.length).fill(null),
      lower: new Array(candles.length).fill(null),
      bandwidth: new Array(candles.length).fill(null),
    };
  }

  const closes = candles.map(c => c.close);
  const upper = new Array(candles.length).fill(null);
  const middle = new Array(candles.length).fill(null);
  const lower = new Array(candles.length).fill(null);
  const bandwidth = new Array(candles.length).fill(null);

  for (let i = period - 1; i < candles.length; i++) {
    const slice = closes.slice(i - period + 1, i + 1);
    const mean = slice.reduce((a, b) => a + b, 0) / period;
    const variance = slice.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / period;
    const std = Math.sqrt(variance);

    middle[i] = mean;
    upper[i] = mean + stdDev * std;
    lower[i] = mean - stdDev * std;
    bandwidth[i] = upper[i] - lower[i];
  }

  return { upper, middle, lower, bandwidth };
}
