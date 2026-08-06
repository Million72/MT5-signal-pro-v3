import { useMemo } from 'react';
import { formatPercent } from '../utils/formatters';

export default function StatsBar({ signals }) {
  const stats = useMemo(() => {
    const won = signals.filter(s => s.result === 'WIN').length;
    const lost = signals.filter(s => s.result === 'LOSS').length;
    const total = won + lost;
    const winRate = total > 0 ? ((won / total) * 100).toFixed(0) : '—';
    const totalRR = signals.reduce((sum, s) => sum + (s.riskReward || 0), 0);

    return { won, lost, total, winRate, totalRR };
  }, [signals]);

  return (
    <div className="stats-bar">
      <div className="stat-card">
        <div className="stat-value">{stats.total}</div>
        <div className="stat-label">Signals Today</div>
      </div>
      <div className="stat-card">
        <div className={`stat-value ${stats.winRate !== '—' && stats.winRate >= 70 ? 'green' : ''}`}>
          {stats.winRate === '—' ? '—' : `${stats.winRate}%`}
        </div>
        <div className="stat-label">Win Rate</div>
      </div>
      <div className="stat-card">
        <div className="stat-value">{stats.totalRR > 0 ? `1:${(stats.totalRR / (stats.total || 1)).toFixed(1)}` : '—'}</div>
        <div className="stat-label">Avg RR</div>
      </div>
    </div>
  );
}
