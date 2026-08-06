import { formatTime, formatDate, formatPercent, formatRR } from '../utils/formatters';

export default function SignalHistory({ signals }) {
  if (!signals || signals.length === 0) return null;

  const recentSignals = signals.slice(0, 10);

  return (
    <div className="history-section">
      <h3>Signal History</h3>
      {recentSignals.map(signal => (
        <div key={signal.id} className="history-item">
          <div>
            <strong>{signal.name}</strong>
            <span style={{ color: signal.direction === 'BUY' ? 'var(--green)' : 'var(--red)', marginLeft: 8 }}>
              {signal.direction}
            </span>
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: 12 }}>
            {formatRR(signal.riskReward)} · {signal.confidence}%
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: 11 }}>
            {formatTime(signal.timestamp)}
          </div>
        </div>
      ))}
    </div>
  );
}
