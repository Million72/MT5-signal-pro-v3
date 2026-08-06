export function prioritizeSignals(signals) {
  if (signals.length === 0) return [];

  const ranked = [...signals].sort((a, b) => {
    if (b.confidence !== a.confidence) return b.confidence - a.confidence;
    return b.riskReward - a.riskReward;
  });

  ranked[0].priority = 'PRIMARY';

  for (let i = 1; i < ranked.length; i++) {
    if (ranked[0].confidence - ranked[i].confidence <= 5) {
      ranked[i].priority = 'SECONDARY';
    } else {
      ranked[i].priority = 'WATCHLIST';
    }
  }

  // Max 2 concurrent signals for small accounts
  return ranked.slice(0, 2);
}
