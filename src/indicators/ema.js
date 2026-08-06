export function calculateEMA(data, period) {
  if (data.length < period) return [];

  const ema = [];
  const multiplier = 2 / (period + 1);

  // Start with SMA
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += data[i];
  }
  ema.push(sum / period);

  for (let i = period; i < data.length; i++) {
    ema.push((data[i] - ema[ema.length - 1]) * multiplier + ema[ema.length - 1]);
  }

  // Pad beginning with nulls to match input length
  const padding = new Array(period - 1).fill(null);
  return [...padding, ...ema];
}
