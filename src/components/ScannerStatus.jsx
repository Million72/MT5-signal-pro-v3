import { formatTime } from '../utils/formatters';

export default function ScannerStatus({ isConnected, scanCount, lastScanTime, signalsToday }) {
  return (
    <div className="scanner-status">
      <div className={`scanner-dot ${isConnected ? 'live' : 'idle'}`} />
      <div className="scanner-text">
        {isConnected
          ? `Scanning V5 · V10 · V25 · V75 · V100 — 1min`
          : 'Connecting...'}
      </div>
      <div className="scanner-count">
        {signalsToday > 0 ? `${signalsToday} today` : 'Live'}
      </div>
      {lastScanTime && (
        <div style={{ fontSize: 11, color: '#555' }}>
          {formatTime(lastScanTime)}
        </div>
      )}
    </div>
  );
}
