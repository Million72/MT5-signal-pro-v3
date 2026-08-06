export function formatPrice(price, decimals = 2) {
  if (price === null || price === undefined) return '—';
  return Number(price).toFixed(decimals);
}

export function formatRR(rr) {
  if (!rr || rr <= 0) return '—';
  return `1:${rr.toFixed(1)}`;
}

export function formatPercent(value) {
  if (value === null || value === undefined) return '—';
  return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
}

export function formatTime(timestamp) {
  if (!timestamp) return '—';
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export function formatDate(timestamp) {
  if (!timestamp) return '—';
  return new Date(timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export function timeSince(timestamp) {
  if (!timestamp) return '—';
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}
