import { useState } from 'react';
import { formatPrice, formatRR, formatTime, timeSince } from '../utils/formatters';

export default function SignalCard({ signal, isPrimary = false }) {
  const [copied, setCopied] = useState(false);

  if (!signal) return null;

  const isBullish = signal.direction === 'BUY';

  const handleCopy = () => {
    const text = `${signal.name} ${signal.direction}\nEntry: ${formatPrice(signal.entry, 2)}\nSL: ${formatPrice(signal.stopLoss, 2)}\nTP: ${formatPrice(signal.takeProfit, 2)}\nRR: ${formatRR(signal.riskReward)}\nConfidence: ${signal.confidence}%`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`signal-card ${isBullish ? 'bullish' : 'bearish'} ${isPrimary ? 'primary' : ''}`}>
      <div className="signal-header">
        <span className="market-badge">{signal.name}</span>
        <span className="pattern-badge">HTF</span>
        <span className="zt-badge">🛡️ ZT</span>
        <span className="confidence-badge">{signal.confidence}%</span>
      </div>

      <div className="signal-direction" style={{ color: isBullish ? 'var(--green)' : 'var(--red)' }}>
        {isBullish ? '🟢 BUY' : '🔴 SELL'}
      </div>

      <div className="signal-levels">
        <div className="level">
          <div className="level-label">Entry</div>
          <div className="level-value entry">{formatPrice(signal.entry, 2)}</div>
        </div>
        <div className="level">
          <div className="level-label">Stop Loss</div>
          <div className="level-value sl">{formatPrice(signal.stopLoss, 2)}</div>
        </div>
        <div className="level">
          <div className="level-label">Take Profit</div>
          <div className="level-value tp">{formatPrice(signal.takeProfit, 2)}</div>
        </div>
        <div className="level">
          <div className="level-label">Risk/Reward</div>
          <div className="level-value" style={{ color: 'var(--gold)' }}>
            {formatRR(signal.riskReward)}
          </div>
        </div>
      </div>

      <div className="signal-footer">
        <span className="rr-badge">{formatRR(signal.riskReward)}</span>
        <span className="gate-count">
          {signal.gateResult?.gatesPassed || 7}/7 gates · {timeSince(signal.timestamp)}
        </span>
        <button
          onClick={handleCopy}
          style={{
            background: copied ? 'var(--green)' : 'var(--bg-secondary)',
            color: copied ? '#000' : 'var(--text-primary)',
            border: 'none',
            padding: '6px 14px',
            borderRadius: 8,
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: 12,
            transition: 'all 0.2s',
          }}
        >
          {copied ? '✓ Copied' : '📋 Copy'}
        </button>
      </div>
    </div>
  );
}
